'use strict';

var assert = require('assert');
var debug = require('debug')('instruction');
var bitutil = require('../bitutil');
var runner = require('./runner')();

var inst = runner.inst;
var before = runner.before;
var after = runner.after;


// - http://www.z80.info/zip/z80cpu_um.pdf
// - http://www.z80.info/z80gboy.txt
// - http://gbdev.gg8.se/wiki/articles/Gameboy_Bootstrap_ROM#Contents_of_the_ROM

before(function (cpu, spec) {

    debug('next %s %s', spec.mnemonic, spec.operands);
    debug('next ZNHC flags [%s]', spec.flags_znhc.join(' '));

    debug('current ZNHC flags %s', cpu.f.toString(2));

    // Next cycle

    cpu.t += spec.cycles;
    cpu.pc += spec.bytes;
});

after(function (cpu, spec) {

    // Reset flags when possible

    [
        'z',
        'n',
        'h',
        'c'
    ].forEach(function (flag, i) {
        var value = parseInt(spec.flags_znhc[i], 2);
        if (!isNaN(value)) cpu.flag(flag, value);
    }, this);

    debug('updated ZNHC flags %s', cpu.f.toString(2));
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
// memory location 6000H contains 60H, the instruction CP (HL) results in the
// PN flag in the F register resetting.

inst('cp', function (cpu, op1) {

    return cpu.flag('z', cpu.a === op1());
});

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

inst('call', function (cpu, op1, op2) {

    var jump = function (addr) {
        cpu.sp -= 2;
        cpu.mmu.writeWord(cpu.sp, cpu.pc);
        return cpu.pc = addr;
    }

    if (!op2) return jump(op1())
    else if (op1() === 1) return jump(op2());
    return cpu.pc;
});

// DEC m
// DEC ss
//
// Description: The byte specified by the m operand is decremented.
//
// Condition Bits Affected:
//
// S is set if result is negative; reset otherwise
// Z is set if result is zero; reset otherwise
// H is set if borrow from bit 4, reset otherwise
// P/V is set if m was 80H before operation; reset otherwise
// N is set
// C is not affected
//
// Example:
//
// If the D register contains byte 2AH, at execution of DEC D register D
// contains 29H.

inst('dec', function (cpu, op1) {

    var value = op1() - 1

    if (['bc', 'de', 'hl', 'sp'].indexOf(op1.operand) < 0) {
        cpu.flag('z', value === 0);
    }

    if (op1.indirect) return op1(value);
    return cpu[op1.operand] = value;
});

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
// P/V is set if r was 7FH before operation; reset otherwise
// N is reset
// C is not affected
//
// Example:
//
// If the contents of register D are 28H, at execution of INC D the contents of
// register D are 29H.

inst('inc', function (cpu, op1) {

    var value = op1() + 1;

    cpu.flag('z', value === 0);

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

inst('jr', function (cpu, op1, op2) {

    var v1 = op1();

    if (op1 && op2 && v1 === 1) return cpu.pc += op2();
    else if (op1 && op2 === null) return cpu.pc += v1;
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

inst('ld', function (cpu, op1, op2) {

    if (op1.indirect) return op1(op2);
    return cpu[op1.operand] = op2();
});

// LD (byte),A
// LD A,(byte)
//
// Description: Save A at (FF00+byte)

inst('ldh', function (cpu, op1, op2) {

    if (op1.indirect) return op1(op2);
    return cpu[op1.operand] = op2();
});

// POP qq
//
// Description:
//
// The top two bytes of the external memory LIFO (last-in, first-out) Stack are
// popped to register pair qq. The Stack Pointer (SP) register pair holds the
// 16-bit address of the current top of the Stack. This instruction first loads
// to the low order portion of qq, the byte at memory location corresponding to
// the contents of SP; then SP is incriminated and the contents of the
// corresponding adjacent memory location are loaded to the high order portion
// of qq and the SP is now incriminated again.
//
// Condition Bits Affected: None
//
// Example:
//
// If the Stack Pointer contains 1000H, memory location 1000H contains 55H, and
// location 1001H contains 33H, the instruction POP HL results in register pair
// HL containing 3355H, and the Stack Pointer containing 1002H.

inst('pop', function (cpu, op1) {

    cpu[op1.operand] = cpu.mmu.readWord(cpu.sp);
    return cpu.sp += 2;
});

// PUSH qq
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

inst('push', function (cpu, op1) {

    cpu.sp -= 2;
    return cpu.mmu.writeWord(cpu.sp, op1());
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

inst('rla', function (cpu) {

    var shifted = cpu.a | cpu.flag('c');

    cpu.flag('c', shifted >> 8 > 0);

    return cpu.a = shifted;
});

// RET cc
// RET
//
// Description:
//
// If condition cc is true, the byte at the memory location specified by the
// contents of the Stack Pointer (SP) register pair is moved to the low order
// eight bits of the Program Counter (PC). The SP is incremented and the byte at
// the memory location specified by the new contents of the SP are moved to the
// high order eight bits of the PC. The SP is incremented again. The next
// Op Code following this instruction is fetched from the memory location
// specified by the PC. This instruction is normally used to return to the main
// line program at the completion of a routine entered by a CALL instruction. If
// condition cc is false, the PC is simply incremented as usual, and the program
// continues with the next sequential instruction. Condition cc is programmed as
// one of eight status that correspond to condition bits in the
// Flag Register (register F). These eight status are defined in the table
// below, which also specifies the corresponding cc bit fields in the assembled
// object code.
//
// Condition Bits Affected: None
//
// Example:
//
// If the S flag in the F register is set, the contents of the Program Counter
// are 3535H, the contents of the Stack Pointer are 2000H, the contents of
// memory location 2000H are B5H, and the contents of memory location 2001H are
// 18H. At execution of RET M the contents of the Stack Pointer is 2002H, and
// the contents of the Program Counter is 18B5H, pointing to the address of the
// next program Op Code to be fetched.

inst('ret', function (cpu, op1) {

    if (op1 && op1() || !op1) {
        cpu.pc = cpu.mmu.readWord(cpu.sp);
        return cpu.sp += 2;
    }

    return cpu.sp;
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
// Z is set if result is zero; reset otherwise
// H is reset
// P/V is set if parity even; reset otherwise
// N is reset
// C is reset
//
// Example:
//
// If the Accumulator contains 96H (1001 0110), at execution of XOR
// 5DH(5DH = 0101 1101) the Accumulator contains CBH (1100 1011).

inst('xor', function (cpu, op1) {

    cpu.a ^= op1();
    return cpu.flag('z', cpu.a === 0);
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

inst('bit', function (cpu, op1, op2) {
    return cpu.flag('z', bitutil.test(op2(), op1()) === 0);
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

inst('rl', function (cpu, op1) {

    var shifted = (op1() << 1) | cpu.flag('c');

    cpu.flag('z', shifted === 0);
    cpu.flag('c', shifted >> 8 > 0);

    if (op1.indirect) return op1(shifted);
    return cpu[op1.operand] = shifted;
});

// Exports

module.exports = runner.prebake;
