var debug = require('debug')('exec');
var runner = require('./runner')();
var fetch = require('./fetcher');

var inst = runner.inst;
var before = runner.before;
var after = runner.after;


// Docs
//
// - http://www.z80.info/zip/z80cpu_um.pdf
// - http://www.z80.info/z80gboy.txt

before(function (spec, cpu) {

    debug('next instruction is %s %s', spec.mnemonic, spec.operands);
    debug('next instruction ZNHC flags are [%s]', spec.flags_znhc.join(' '));

    // Previous state

    this.pc = cpu._pc;

    // Fetch operands

    this.op1 = fetch(cpu, spec.operands, 0);
    this.op2 = fetch(cpu, spec.operands, 1);
});

after(function (spec, cpu) {

    // Reset flags when possible

    var flags = spec.flags_znhc;

    debug('current ZNHC flags %s', cpu._f.toString(2));

    [0x80, 0x40, 0x20, 0x10].forEach(function (value, i) {
        var reset = parseInt(flags[i], 10);
        if (!isNaN(reset)) {
            debug('0x%s flag reset with value %d', value.toString(16), reset)
            cpu._f |= reset;
        }
    });

    debug('updated ZNHC flags %s', cpu._f.toString(2))

    // Next cycle

    cpu._t += spec.cycles;

    // Do not override PC value if has been changed in a jump instruction

    if (cpu._pc === this.pc) cpu._pc += spec.bytes;
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

    return cpu._iff = 1;
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

    var reg = spec.operands[0].toLowerCase();

    switch (spec.operands[0]) {
        case 'B': case 'C':
            cpu[reg] -= 1; cpu[reg] &= 0xFF;
            return cpu[reg] === 0 ? cpu._f |= 0x80 : cpu._f;
        default: return;
    }
});

// JR Z, e
// JR NZ, e
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

    if (this.op1 === 1) return cpu._pc += this.op2;
    return cpu._pc;
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

    var length = spec.operands.length;

    if (length == 2 && this.op1 == 1) return cpu._pc = this.op2;
    else if (length == 1) return cpu._pc = this.op1;
    return cpu._pc;
});

inst('ld', function (spec, cpu) {

    var reg = spec.operands[0].toLowerCase();

    switch (spec.operands[0]) {
        case 'A': case 'B': case 'C': return cpu[reg] = this.op2;
        case 'SP': return cpu._sp = this.op2;
        case 'HL': case '(HL-)':
            cpu._h = this.op2 >> 8;
            return cpu._l = this.op2 & 0xFF;
        default: return;
    }
});

// LDH
//
// Operation: LD (byte),A
//
// Description: Save A at (FF00+byte)

inst('ldh', function (spec, cpu) {

    return cpu._mmu.writeByte(0xFF00 + this.op1, cpu._a);
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

    this._sp -= 2;
    this._mmu.writeWord(this._sp, this._pc);
    return cpu._pc = this.op1;
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

    cpu._a ^= this.op1;
    return cpu._f = cpu._a !== 0 ? cpu._a : 0x80;
});

// 0xCB Prefixed
//
// BIT, RLC, RRC, RL, RR, RES, SLA, SRA, SWAP, SRL, SET

// BIT b,r
// BIT b,(HL)
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

    if (this.op1 & this.op2) return this._f |= 0x80;
    return this._f;
});

// Exports

module.exports = runner.prebake;
