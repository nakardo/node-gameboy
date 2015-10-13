var debug = require('debug')('instruction');
var runner = require('./runner')();

var inst = runner.inst;
var before = runner.before;
var after = runner.after;


// Docs
//
// - http://www.z80.info/zip/z80cpu_um.pdf
// - http://www.z80.info/z80gboy.txt
// - http://gbdev.gg8.se/wiki/articles/Gameboy_Bootstrap_ROM#Contents_of_the_ROM

before(function (spec, cpu) {

    debug('next %s %s', spec.mnemonic, spec.operands);
    debug('next ZNHC flags [%s]', spec.flags_znhc.join(' '));

    debug('current ZNHC flags %s', cpu.f.toString(2));

    // Previous state

    this.pc = cpu.pc;
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

// CALL cc, nn
// CALL nn
//
// Description:
//
// If condition cc is true, this instruction pushes the current contents of the
// Program Counter (PC) onto the top of the external memory stack, then loads
// the operands nn to PC to point to the address in memory where the first
// Op Code of a subroutine is to be fetched. At the end of the subroutine, a
// RETurn instruction can be used to return to the original program flow by
// popping the top of the stack back to PC. If condition cc is false, the
// Program Counter is incremented as usual, and the program continues with the
// next sequential instruction. The stack push is accomplished by first
// decrementing the current contents of the Stack Pointer (SP), loading the
// high-order byte of the PC contents to the memory address now pointed to by
// SP; then decrementing SP again, and loading the low order byte of the PC
// contents to the top of the stack.
//
// Because this is a 3-byte instruction, the Program Counter was incremented by
// three before the push is executed.
//
// Condition Bits Affected: None

inst('call', function (op1, op2, cpu) {

    var jump = function (addr) {
        cpu.sp -= 2;
        cpu.mmu.writeWord(cpu.sp, cpu.pc >> 8 | (cpu.pc << 8) & 0xFF00);
        return cpu.pc = addr;
    }

    if (!op2) return jump(op1())
    else if (op1() == 1) return jump(op2());
    return cpu.pc;
});

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
// S is set if result is negative; reset otherwise
// Z is set if result is zero; reset otherwise
// H is set if borrow from bit 4; reset otherwise
// P/V is set if overflow; reset otherwise
// N is set
// C is set if borrow; reset otherwise
//
// Example:
//
// If the Accumulator contains 63H, the HL register pair contains 6000H, and
// memory location 6000H contains 60H, the instruction CP (HL) results in the PN
// flag in the F register resetting.

// inst('cp', function (spec, cpu) {
//
//     if (this.op1() === cpu.a) return cpu.f |= 0x80;
//     else if (this.op1() >> 8 > 0) return cpu.f |= 0x10;
//     return cpu.f;
// });

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

// inst('di', function (spec, cpu) {
//
//     return cpu.iff = 1;
// });

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

// inst('dec', function (spec, cpu) {
//
//     var op1 = spec.operands[0];
//
//     switch (op1) {
//         case 'B': case 'C':
//             var register = op1.toLowerCase();
//             cpu[register] -= 1;
//             cpu[register] &= 0xFF;
//             return cpu[register] === 0 ? cpu.f |= 0x80 : cpu.f;
//         default: return;
//     }
// });

// INC r
// INC (HL)
//
// Description:
//
// Register r is incremented and register r identifies any of the registers
// A, B, C, D, E, H, or L, assembled as follows in the object code.
//
// Condition Bits Affected:
//
// S is set if result is negative; reset otherwise
// Z is set if result is zero; reset otherwise
// H is set if carry from bit 3; reset otherwise
// P/V is set if r was 7FH before operation; reset otherwise N is reset
// C is not affected
//
// Example:
//
// If the contents of register D are 28H, at execution of INC D the contents of
// register D are 29H.

inst('inc', function (op1, op2, cpu) {

    var value = op1() + 1;

    cpu.f |= value === 0 ? 0x80 : cpu.f;

    if (op1.indirect) return op1(value);
    return cpu[op1.operand] = value;
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

inst('jr', function (op1, op2, cpu) {

    if (op1 && op2 && op1() === 1) return cpu.pc += op2();
    else if (op1) return cpu.pc += op1();
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

// inst('jp', function (spec, cpu) {
//
//     var words = spec.operands.length;
//
//     if (words == 2 && this.op1() == 1) return cpu.pc = this.op2();
//     else if (words == 1) return cpu.pc = this.op1();
//     return cpu.pc;
// });

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

inst('ld', function (op1, op2, cpu) {

    if (op1.indirect) return op1(op2);
    return cpu[op1.operand] = op2();
});

// LD (byte),A
// LD A,(byte)
//
// Description: Save A at (FF00+byte)

inst('ldh', function (op1, op2, cpu) {

    if (!op1.indirect) return cpu[op1.operand] = op2();
    return op1(op2);
});

// PUSH qq
// PUSH IX
// PUSH IY
//
// Description:
//
// The contents of the register pair qq are pushed to the external memory
// LIFO (last-in, first-out) Stack. The Stack Pointer (SP) register pair holds
// the 16-bit address of the current top of the Stack. This instruction first
// decrements SP and loads the high order byte of register pair qq to the memory
// address specified by the SP. The SP is decremented again and loads the low
// order byte of qq to the memory location corresponding to this new address in
// the SP.
//
// Condition Bits Affected: None
//
// Example:
//
// If the AF register pair contains 2233H and the Stack Pointer contains 1007H,
// at instruction PUSH AF memory address 1006H contains 22H, memory address
// 1005H contains 33H, and the Stack Pointer contains 1005H.

inst('push', function (op1, op2, cpu) {

    cpu.sp -= 2;

    var operand = op1();
    var value = operand >> 8 | (operand << 8) & 0xFF00;

    return cpu.mmu.writeWord(cpu.sp, value);
});

// RLA
//
// Description:
//
// The contents of the Accumulator (register A) are rotated left 1-bit position
// through the Carry flag. The previous content of the Carry flag is copied to
// bit 0. Bit 0 is the least-significant bit.
//
// Condition Bits Affected:
//
// S is not affected
// Z is not affected
// H is reset
// P/V is not affected
// N is reset
// C is data from bit 7 of Accumulator

inst('rla', function (op1, op2, cpu) {

    var shifted = (cpu.a << 1) + (cpu.f & 0x10 > 0 ? 1 : 0);

    if (shifted >> 8 > 0) cpu.f |= 0x10;
    else cpu.f &= ~(1 << 0x10);

    return cpu.a = shifted & 0xFF;
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

// inst('rst', function (spec, cpu) {
//
//     cpu.sp -= 2;
//     cpu.mmu.writeWord(cpu.sp, cpu.pc);
//     return cpu.pc = this.op1;
// });

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

inst('xor', function (op1, op2, cpu) {

    cpu.a ^= op1();
    return cpu.f |= cpu.a === 0 ? 0x80 : cpu.f;
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
// Z is set if specified bit is 0; reset otherwise
// H is set
// P/V is unknown
// N is reset
// C is not affected
//
// Example:
//
// If bit 2 in register B contains 0, at execution of BIT 2, B the Z flag in the
// F register contains 1, and bit 2 in register B remains 0. Bit 0 in register B
// is the least-significant bit.

inst('bit', function (op1, op2, cpu) {

    if (op1() & op2()) return cpu.f |= 0x80;
    return cpu.f;
});

// RL m
//
// Description:
//
// The contents of the m operand are rotated left 1-bit position. The content of
// bit 7 is copied to the Carry flag and the previous content of the Carry flag
// is copied to bit 0.
//
// Condition Bits Affected:
//
// S is set if result is negative; reset otherwise
// Z is set if result is zero; reset otherwise
// H is reset
// P/V is set if parity even; reset otherwise
// N is reset
// C is data from bit 7 of source register

inst('rl', function (op1, op2, cpu) {

    var shifted = (op1() << 1) + (cpu.f & 0x10 > 0 ? 1 : 0);

    if (shifted >> 8 > 0) cpu.f |= 0x10;
    else cpu.f &= ~(1 << 0x10);

    var value = shifted & 0xFF;

    if (value === 0) cpu.f |= 0x80;

    if (op1.indirect) return op1(value);
    return cpu[op1.operand] = value;
});

// Exports

module.exports = runner.prebake;
