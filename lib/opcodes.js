'use strict';


// Unprefixed

const $ = exports.$ = [];

/**
 * LD n,nn
 * Put value nn into n.
 *
 * Use with:
 * n = BC, DE, HL, SP
 * nn = 16 bit immediate value
 */
$[0x11] = (cpu, mmu) => {
    cpu.de = mmu.readWord(cpu.pc + 1);

    cpu.pc += 3;
    cpu.t += 12;
};

/**
 * LD A,n
 *
 * Put value n into A.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (BC), (DE), (HL), (nn), #
 * nn = two byte immediate value. (LS byte first.)
 */
$[0x1a] = (cpu, mmu) => {
    cpu.a = mmu.readByte(cpu.de);

    cpu.pc += 1;
    cpu.t += 8;
};

/**
 * LD nn,n
 *
 * Put value nn into n.
 *
 * Use with:
 *
 * nn = B, C, D, E, H, L, BC, DE, HL, SP
 * n = 8 bit immediate value
 */
$[0x0e] = (cpu, mmu) => {
    cpu.c = mmu.readByte(cpu.pc + 1);

    cpu.pc += 2;
    cpu.t += 8;
};

/**
 * JR cc,n
 *
 * If following condition is true then add n address and jump to it:
 *
 * Use with:
 * n = one byte signed immediate value
 * cc = NZ, Jump if Z flag is reset.
 * cc = Z, Jump if Z flag is set.
 * cc = NC, Jump if C flag is reset.
 */
$[0x20] = (cpu, mmu) => {
    const jump = cpu.f >> 7 == 0;
    if (jump) {
        const addr = mmu.readByte(cpu.pc + 1);
        cpu.pc += addr & 0x80 ? -((0xff & ~addr) - 1) : addr;
        cpu.t += 12;
        return;
    }

    cpu.pc += 2;
    cpu.t += 8;
};

/**
 * LD n,nn
 *
 * Put value nn into n.
 *
 * Use with:
 * n = BC, DE, HL, SP
 * nn = 16 bit immediate value
 */
$[0x21] = (cpu, mmu) => {
    cpu.hl = mmu.readWord(cpu.pc + 1);

    cpu.pc += 3;
    cpu.t += 12;
};

/**
 * LD n,nn
 *
 * Put value nn into n.
 *
 * Use with:
 * n = BC, DE, HL, SP
 * nn = 16 bit immediate value
 */
$[0x31] = (cpu, mmu) => {
    cpu.sp = mmu.readWord(cpu.pc + 1);

    cpu.pc += 3;
    cpu.t += 12;
};

/**
 * LD (HL-),A
 *
 * Put A into memory address HL. Decrement HL.
 * Same as: LD(HL),A - DEC HL
 */
$[0x32] = (cpu, mmu) => {
    mmu.writeByte(cpu.hl--, cpu.a);

    cpu.pc += 1;
    cpu.t += 8;
};

/**
 * LD A,n
 *
 * Put value n into A.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (BC), (DE), (HL), (nn), #
 * nn = two byte immediate value. (LS byte first.)
 */
$[0x3e] = (cpu, mmu) => {
    cpu.a = mmu.readByte(cpu.pc + 1);

    cpu.pc += 2;
    cpu.t += 8;
};

/**
 * LD n,A
 *
 * Put value A into n.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (BC), (DE), (HL), (nn)
 * nn = two byte immediate value. (LS byte first.)
 */
$[0x77] = (cpu, mmu) => {
    mmu.writeByte(cpu.hl, cpu.a);

    cpu.pc += 1;
    cpu.t += 8;
};

/**
 * XOR n
 *
 * Logical exclusive OR n with register A, result in A.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL), #
 *
 * Flags affected:
 * Z - Set if result is zero. Reset otherwise.
 * N - Reset.
 * H - Reset.
 * C - Reset.
 */
$[0xaf] = (cpu) => {
    cpu.a ^= cpu.a;

    cpu.f = cpu.a == 0 ? 0x80 : 0;
    cpu.pc += 1;
    cpu.t += 4;
};

/**
 * LDH (n),A
 * Put A into memory address $FF00 + n.
 *
 * Use with:
 * n = one byte immediate value.
 */
$[0xe0] = (cpu, mmu) => {
    mmu.writeByte(0xff00 + mmu.readByte(cpu.pc + 1), cpu.a);

    cpu.pc += 2;
    cpu.t += 12;
};

/**
 * LD (C),A
 *
 * Put A into address $FF00 + register C.
 */
$[0xe2] = (cpu, mmu) => {
    mmu.writeByte(0xff00 + cpu.c, cpu.a);

    cpu.pc += 2;
    cpu.t += 8;
};

// CB Prefixed

const $cb = exports.$cb = [];

/**
 * BIT b,r
 *
 * Test bit b in register r.
 *
 * Use with:
 * b = 0 - 7, r = A, B, C, D, E, H, L, (HL)
 *
 * Flags affected:
 * Z - Set if bit b of register r is 0. Reset otherwise.
 * N - Reset.
 * H - Set.
 * C - Not affected.
 */
$cb[0x7c] = (cpu) => {
    const set = cpu.h >> 7 == 0;
    if (set) {
        cpu.f |= 1 << 7;
    } else {
        cpu.f &= ~(1 << 7);
    }
    cpu.f &= ~(1 << 6);
    cpu.f |= 1 << 5;

    cpu.pc += 2;
    cpu.t += 8;
};
