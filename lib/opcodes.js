'use strict';


// Unprefixed

const $ = exports.$ = [];

/**
 * DEC n
 *
 * Decrement register n.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL)
 *
 * Flags affected:
 * Z - Set if result is zero. Reset otherwise.
 * N - Set.
 * H - Set if no borrow from bit 4. Reset otherwise.
 * C - Not affected.
 */
$[0x5] = (cpu, mmu) => {
    cpu.b--;

    cpu.f &= ~(0xa0);
    if (cpu.b == 0) cpu.f |= 1 << 7;
    cpu.f |= 1 << 6;
    if ((~cpu.b & 0xf) == 0) cpu.f |= 1 << 5;

    cpu.pc += 1;
    cpu.t += 4;
};

/**
 *
 * LD nn,n
 *
 * Put value nn into n.
 *
 * Use with:
 * nn = B, C, D, E, H, L, BC, DE, HL, SP
 * n = 8 bit immediate value
 */
$[0x6] = (cpu, mmu) => {
    cpu.b = mmu.readByte(cpu.pc + 1);

    cpu.pc += 2;
    cpu.t += 8;
};

/**
 * DEC n
 *
 * Decrement register n.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL)
 *
 * Flags affected:
 * Z - Set if result is zero. Reset otherwise.
 * N - Set.
 * H - Set if no borrow from bit 4. Reset otherwise.
 * C - Not affected.
 */
$[0xd] = (cpu, mmu) => {
    cpu.c--;

    cpu.f &= ~(0xa0);
    if (cpu.c == 0) cpu.f |= 1 << 7;
    cpu.f |= 1 << 6;
    if ((~cpu.c & 0xf) == 0) cpu.f |= 1 << 5;

    cpu.pc += 1;
    cpu.t += 4;
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
$[0xe] = (cpu, mmu) => {
    cpu.c = mmu.readByte(cpu.pc + 1);

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
$[0x11] = (cpu, mmu) => {
    cpu.de = mmu.readWord(cpu.pc + 1);

    cpu.pc += 3;
    cpu.t += 12;
};

/**
 * INC nn
 *
 * Increment register nn.
 *
 * Use with:
 * nn = BC, DE, HL, SP
 */
$[0x13] = (cpu) => {
    cpu.de++;

    cpu.pc += 1;
    cpu.t += 8;
};

/**
 * RLA
 *
 * Rotate A left through Carry flag.
 *
 * Flags affected:
 * Z - Reset.
 * N - Reset.
 * H - Reset.
 * C - Contains old bit 7 data.
 */
$[0x17] = (cpu) => {
    let v;
    cpu.a = v = cpu.a << 1;

    cpu.f = 0;
    if (v >> 8 == 1) cpu.f |= 1 << 4;

    cpu.pc += 1;
    cpu.t += 4;
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
    if (cpu.f >> 7 == 0) {
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
 * LDI (HL),A
 *
 * Put A into memory address HL. Increment HL.
 * Same as: LD(HL),A - INC HL
 */
$[0x22] = (cpu, mmu) => {
    mmu.writeWord(cpu.hl++, cpu.a);

    cpu.pc += 1;
    cpu.t += 8;
};

/**
 * INC nn
 *
 * Increment register nn.
 *
 * Use with:
 * nn = BC, DE, HL, SP
 */
$[0x23] = (cpu) => {
    cpu.hl++;

    cpu.pc += 1;
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
 * cc = C, Jump if C flag is set.
 */
$[0x28] = (cpu, mmu) => {
    if (cpu.f >> 7 == 1) {
        const addr = mmu.readByte(cpu.pc + 1);
        cpu.pc += addr & 0x80 ? -((0xff & ~addr) - 1) : addr;
        cpu.t += 12;
        return;
    }

    cpu.pc += 2;
    cpu.t += 8;
}

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
 * DEC n
 *
 * Decrement register n.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL)
 *
 * Flags affected:
 * Z - Set if result is zero. Reset otherwise.
 * N - Set.
 * H - Set if no borrow from bit 4. Reset otherwise.
 * C - Not affected.
 */
$[0x3d] = (cpu, mmu) => {
    cpu.a--;

    cpu.f &= ~(0xa0);
    if (cpu.a == 0) cpu.f |= 1 << 7;
    cpu.f |= 1 << 6;
    if ((~cpu.a & 0xf) == 0) cpu.f |= 1 << 5;

    cpu.pc += 1;
    cpu.t += 4;
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
$[0x4f] = (cpu, mmu) => {
    cpu.c = cpu.a;

    cpu.pc += 1;
    cpu.t += 4;
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
 * LD A,n
 *
 * Put value n into A.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (BC), (DE), (HL), (nn), #
 * nn = two byte immediate value. (LS byte first.)
 */
$[0x7b] = (cpu, mmu) => {
    cpu.a = cpu.e;

    cpu.pc += 1;
    cpu.t += 4;
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
 * POP nn
 *
 * Pop two bytes off stack into register pair nn. Increment Stack Pointer (SP)
 * twice.
 *
 * Use with:
 * nn = AF, BC, DE, HL
 */

$[0xc1] = (cpu, mmu) => {
    cpu.bc = mmu.readWord(cpu.sp);
    cpu.sp += 2;

    cpu.pc += 1;
    cpu.t += 12;
};

/**
 * PUSH nn
 *
 * Push register pair nn onto stack. Decrement Stack Pointer (SP) twice.
 *
 * Use with:
 * nn = AF, BC, DE, HL
 */
$[0xc5] = (cpu, mmu) => {
    mmu.writeWord(cpu.sp -= 2, cpu.bc);

    cpu.pc += 1;
    cpu.t += 16;
};

/**
 * RET
 *
 * Pop two bytes from stack & jump to that address.
 */
$[0xc9] = (cpu, mmu) => {
    const addr = mmu.readWord(cpu.sp);
    cpu.sp += 2;

    cpu.pc = addr;
    cpu.t += 16;
};

/**
 * CALL nn
 *
 * Push address of next instruction onto stack and then jump to address nn.
 *
 * Use with:
 * nn = two byte immediate value. (LS byte first.)
 */
$[0xcd] = (cpu, mmu) => {
    mmu.writeWord(cpu.sp -= 2, cpu.pc + 3);

    cpu.pc = mmu.readWord(cpu.pc + 1);
    cpu.t += 24;
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

/**
 * LD n,A
 *
 * Put value A into n.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (BC), (DE), (HL), (nn)
 * nn = two byte immediate value. (LS byte first.)
 */
$[0xea] = (cpu, mmu) => {
    mmu.writeByte(mmu.readWord(cpu.pc + 1), cpu.a);

    cpu.pc += 3;
    cpu.t += 16;
};

/**
 * CP n
 *
 * Compare A with n. This is basically an A - n subtraction instruction but the
 * results are thrown away.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL), #
 *
 * Flags affected:
 * Z - Set if result is zero. Reset otherwise.
 * N - Set.
 * H - Set if borrow from bit 4. Reset otherwise.
 * C - Set if borrow. Reset otherwise.
 */
$[0xfe] = (cpu, mmu) => {
    const n = mmu.readByte(cpu.pc + 1);
    const cp = cpu.a - n;

    if (cp == 0) cpu.f |= 1 << 7;
    else cpu.f &= ~(1 << 7);
    cpu.f |= 1 << 6;
    if (cp >> 4 & 1) cpu.f |= 1 << 5;
    else cpu.f &= ~(1 << 5);
    if (cpu.a < n) cpu.f |= 1 << 4;
    else cpu.f &= ~(1 << 4);

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
    if (cpu.h >> 7 == 0) cpu.f |= 1 << 7;
    else cpu.f &= ~(1 << 7);
    cpu.f &= ~(1 << 6);
    cpu.f |= 1 << 5;

    cpu.pc += 2;
    cpu.t += 8;
};

/**
 * RL n
 *
 * Rotate n left through Carry flag.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL)
 *
 * Flags affected:
 * Z - Set if result is zero. Reset otherwise.
 * N - Reset.
 * H - Reset.
 * C - Contains old bit 7 data.
 */
$cb[0x11] = (cpu) => {
    let v;
    cpu.c = v = cpu.c << 1;

    cpu.f = 0;
    if (cpu.c == 0) cpu.f |= 1 << 7;
    if (v >> 8 == 1) cpu.f |= 1 << 4;

    cpu.pc += 2;
    cpu.t += 8;
};
