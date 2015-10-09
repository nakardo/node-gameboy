var debug = require('debug')('exec');
var runner = require('./runner')();
var decode = require('./decoder');

var inst = runner.inst;
var before = runner.before;
var after = runner.after;


// Docs
//
// - http://www.z80.info/zip/z80cpu_um.pdf
// - http://www.z80.info/z80gboy.txt

before(function (spec, cpu) {

    debug('instruction is %s %s', spec.mnemonic, spec.operands);
    debug('instruction ZNHC flags are [%s]', spec.flags_znhc.join(' '));

    debug('current ZNHC flags %s', cpu.f.toString(2));

    // Previous state

    this.pc = cpu.pc;

    // Decode operands

    this.op1 = decode(cpu, spec.operands, 0);
    this.op2 = decode(cpu, spec.operands, 1);
});

after(function (spec, cpu) {

    // Reset flags when possible

    var flags = spec.flags_znhc;

    [7, 6, 5, 4].forEach(function (pos, i) {

        var reset = parseInt(flags[i], 10);
        if (!isNaN(reset)) {
            var flag = 1 << pos;
            debug('reset 0x%s flag = %d', flag.toString(16), reset);
            reset === 1 ? cpu.f |= flag : cpu.f &= ~flag;
        }
    });

    debug('updated ZNHC flags %s', cpu.f.toString(2));

    // Next cycle

    cpu.t += spec.cycles;

    // Do not override PC value if has been changed in a jump instruction

    if (cpu.pc === this.pc) cpu.pc += spec.bytes;
});

// Instructions
//
// - http://www.z80.info/z80gboy.txt
// - http://www.z80.info/zip/z80cpu_um.pdf

// Unprefixed:
//
// ADD, ADC, AND, CPL, CCF, CP, CALL, DEC, DAA, DI, EI, HALT, INC, JR, JP, LD,
// LDH, NOP, OR, POP, PUSH, PREFIX, RLCA, RRCA, RLA, RRA, RET, RST, RETI, STOP,
// SCF, SUB, SBC, XOR

// CP s
//
// Description:
//
// The contents of the s operand are compared with the contents of the
// Accumulator. If there is a true compare, the Z flag is set. The execution of
// this instruction does not affect the contents of the Accumulator.
//
// Condition Bits Affected:
//
// S is set if result is negative; reset otherwise Z is set if result is zero;
// reset otherwise
// H is set if borrow from bit 4; reset otherwise P/V is set if overflow;
// reset otherwise
// N is set
// C is set if borrow; reset otherwise
//
// Example:
//
// If the Accumulator contains 63H, the HL register pair contains 6000H, and
// memory location 6000H contains 60H, the instruction CP (HL) results in the PN
// flag in the F register resetting.

inst('cp', function (spec, cpu) {

    if (this.op1 === cpu.a) return cpu.f |= 0x80;
    else if (this.op1 >> 8 > 0) return cpu.f |= 0x10;
    return cpu.f;
});

// DI
//
// Description:
//
// DI disables the maskable interrupt by resetting the interrupt enable
// flip-flops (IFF1 and IFF2). Note that this instruction disables the maskable
// interrupt during its execution.
//
// Condition Bits Affected: None
//
// Example:
//
// When the CPU executes the instruction DI the maskable interrupt is disabled
// until it is subsequently re-enabled by an EI instruction. The CPU does not
// respond to an Interrupt Request (INT) signal.

inst('di', function (spec, cpu) {

    return cpu.iff = 1;
});

// DEC m
//
// Description: The byte specified by the m operand is decremented.
//
// Condition Bits Affected:
//
// S is set if result is negative; reset otherwise
// Z is set if result is zero; reset otherwise
// H is set if borrow from bit 4, reset otherwise
// P/V is set if m was 80H before operation; reset otherwise N is set
// C is not affected

inst('dec', function (spec, cpu) {

    var op1 = spec.operands[0];

    switch (op1) {
        case 'B': case 'C':
            var register = op1.toLowerCase();
            cpu[register] -= 1;
            cpu[register] &= 0xFF;
            return cpu[register] === 0 ? cpu.f |= 0x80 : cpu.f;
        default: return;
    }
});

// JR Z, e  JR NZ, e
//
// Description:
//
// This instruction provides for conditional branching to other segments of a
// program depending on the results of a test on the Zero Flag. If the flag is
// equal to a 1, the value of the displacement e is added to the Program
// Counter (PC) and the next instruction is fetched from the location designated
// by the new contents of the PC. The jump is measured from the address of the
// instruction Op Code and has a range of -126 to +129 bytes. The assembler
// automatically adjusts for the twice incremented PC.
//
// Condition Bits Affected: None

inst('jr', function (spec, cpu) {

    if (this.op1 === 1) return cpu.pc += this.op2;
    return cpu.pc;
});

// JP cc, nn
// JP nn
//
// Description:
//
// If condition cc is true, the instruction loads operand nn to register pair
// PC (Program Counter), and the program continues with the instruction
// beginning at address nn. If condition cc is false, the Program Counter is
// incremented as usual, and the program continues with the next sequential
// instruction. Condition cc is programmed as one of eight status that
// corresponds to condition bits in the Flag Register (register F). These eight
// status are defined in the table below that also specifies the corresponding
// cc bit fields in the assembled object code.
//
// Condition Bits Affected: None

inst('jp', function (spec, cpu) {

    var words = spec.operands.length;

    if (words == 2 && this.op1 == 1) return cpu.pc = this.op2;
    else if (words == 1) return cpu.pc = this.op1;
    return cpu.pc;
});

// LD (BC),A    LD (DE),A   LD (HL),n   LD (HL),r   LD (nn),A
// LD (nn),dd   LD (nn),HL  LD A,(BC)   LD A,(DE)   LD A,(nn)
// LD A,I       LD A,R9     LD dd,(nn)  LD dd,nn    LD HL,(nn)
// LD I,A       LD r,(HL)   LD R,A1     LD r,r'     LD r,n
// LD SP,HL
//
// Description:
//
// The contents of the Accumulator are loaded to the memory location specified
// by the contents of the register pair BC.
//
// Condition Bits Affected: None
//
// Example:
//
// If the Accumulator contains 7AH and the BC register pair contains 1212H the
// instruction LD (BC), A results in 7AH in memory location 1212H.

inst('ld', function (spec, cpu) {

    var op1 = spec.operands[0];

    switch (op1) {
        case 'A': case 'B': case 'C': return cpu[op1.toLowerCase()] = this.op2;
        case 'SP': return cpu.sp = this.op2;
        case 'HL':
            cpu._h = this.op2 >> 8;
            return cpu._l = this.op2 & 0xFF;
        case 'BC': case 'DE': case '(C)': case '(a16)': case '(HL)':
        case '(HL-)': case '(HL+)':
            if (spec.operands[1] == 'SP') {
                return cpu.mmu.writeWord(this.op1, this.op2);
            }
            return cpu.mmu.writeByte(this.op1, this.op2);
        default: return;
    }
});

// LDH
//
// Operation: LD (byte),A
//
// Description: Save A at (FF00+byte)

inst('ldh', function (spec, cpu) {

    return cpu.mmu.writeByte(0xFF00 + this.op1, cpu.a);
});

// RST p
//
// Description:
//
// The current Program Counter (PC) contents are pushed onto the external memory
// stack, and the page zero memory location given by operand p is loaded to the
// PC. Program execution then begins with the Op Code in the address now pointed
// to by PC. The push is performed by first decrementing the contents of the
// Stack Pointer (SP), loading the high-order byte of PC to the memory address
// now pointed to by SP, decrementing SP again, and loading the low order byte
// of PC to the address now pointed to by SP. The Restart instruction allows for
// a jump to one of eight addresses indicated in the table below. The operand p
// is assembled to the object code using the corresponding T state.
//
// Because all addresses are in page zero of memory, the high order byte of PC
// is loaded with 00H. The number selected from the p column of the table is
// loaded to the low order byte of PC.
//
// Example:
//
// If the contents of the Program Counter are 15B3H, at execution of
// RST 18H (Object code 1101111) the PC contains 0018H, as the address of the
// next Op Code fetched.

inst('rst', function (spec, cpu) {

    cpu.sp -= 2;
    cpu.mmu.writeWord(cpu.sp, cpu.pc);
    return cpu.pc = this.op1;
});

// XOR s
//
// Description:
//
// The logical exclusive-OR operation is performed between the byte specified by
// the s operand and the byte contained in the Accumulator; the result is stored
// in the Accumulator.
//
// Conditions Bits Affected:
//
// S is set if result is negative; reset otherwise
// Z is set if result is zero; reset otherwise H is reset
// H is reset
// P/V is set if parity even; reset otherwise N is reset
// N is reset
// C is reset
//
// Example:
//
// If the Accumulator contains 96H (1001 0110), at execution of XOR
// 5DH(5DH = 0101 1101) the Accumulator contains CBH (1100 1011).

inst('xor', function (spec, cpu) {

    cpu.a ^= this.op1;
    return cpu.f = cpu.a !== 0 ? cpu.a : 0x80;
});

// 0xCB Prefixed
//
// BIT, RLC, RRC, RL, RR, RES, SLA, SRA, SWAP, SRL, SET

// BIT b,r  BIT b,(HL)
//
// Description:
//
// This instruction tests bit b in register r and sets the Z flag accordingly.
//
// Condition Bits Affected:
//
// S is unknown
// Z is set if specified bit is 0; reset otherwise H is set
// P/V is unknown
// N is reset
// C is not affected
//
// Example:
//
// If bit 2 in register B contains 0, at execution of BIT 2, B the Z flag in the
// F register contains 1, and bit 2 in register B remains 0. Bit 0 in register B
// is the least-significant bit.

inst('bit', function (spec, cpu) {

    if (this.op1 & this.op2) return this.f |= 0x80;
    return this.f;
});

// Exports

module.exports = runner.prebake;
