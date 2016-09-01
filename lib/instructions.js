'use strict';


// Unprefixed

const $ = exports.$ = [];

$[0x4] = ['INC B', (cpu) => {
    let v;
    cpu.b = v = cpu.b + 1;

    cpu.f &= ~(0xe0);
    if (cpu.b == 0) cpu.f |= 1 << 7;
    if (v == 0xf) cpu.f |= 1 << 5;

    cpu.pc += 1;
    cpu.t += 4;
}];

$[0x5] = ['DEC B', (cpu) => {
    cpu.b--;

    cpu.f &= ~(0xa0);
    if (cpu.b == 0) cpu.f |= 1 << 7;
    cpu.f |= 1 << 6;
    if ((~cpu.b & 0xf) == 0) cpu.f |= 1 << 5;

    cpu.pc += 1;
    cpu.t += 4;
}];

$[0x6] = ['LD B,d8', (cpu, mmu) => {
    cpu.b = mmu.readByte(cpu.pc + 1);

    cpu.pc += 2;
    cpu.t += 8;
}];

$[0xd] = ['DEC C', (cpu) => {
    cpu.c--;

    cpu.f &= ~(0xa0);
    if (cpu.c == 0) cpu.f |= 1 << 7;
    cpu.f |= 1 << 6;
    if ((~cpu.c & 0xf) == 0) cpu.f |= 1 << 5;

    cpu.pc += 1;
    cpu.t += 4;
}];

$[0xe] = ['LD C,d8', (cpu, mmu) => {
    cpu.c = mmu.readByte(cpu.pc + 1);

    cpu.pc += 2;
    cpu.t += 8;
}];

$[0x11] = ['LD DE,d16', (cpu, mmu) => {
    cpu.de = mmu.readWord(cpu.pc + 1);

    cpu.pc += 3;
    cpu.t += 12;
}];

$[0x13] = ['INC DE', (cpu) => {
    cpu.de++;

    cpu.pc += 1;
    cpu.t += 8;
}];

$[0x17] = ['RLA', (cpu) => {
    let v;
    cpu.a = v = cpu.a << 1;

    cpu.f = 0;
    if (v >> 8 == 1) cpu.f |= 1 << 4;

    cpu.pc += 1;
    cpu.t += 4;
}];

$[0x18] = ['JR r8', (cpu, mmu) => {
    const n = mmu.readByte(cpu.pc + 1);
    const offset = n & 0x80 ? -((0xff & ~n) + 1) : n;

    cpu.pc += 2 + offset;
    cpu.t += 12;
}];

$[0x1a] = ['LD A,(DE)', (cpu, mmu) => {
    cpu.a = mmu.readByte(cpu.de);

    cpu.pc += 1;
    cpu.t += 8;
}];

$[0x1e] = ['LD E,d8', (cpu, mmu) => {
    cpu.e = mmu.readByte(cpu.pc + 1);

    cpu.pc += 2;
    cpu.t += 8;
}];

$[0x20] = ['JR NZ,r8', (cpu, mmu) => {
    if (cpu.f >> 7 == 0) {
        const n = mmu.readByte(cpu.pc + 1);
        const offset = n & 0x80 ? -((0xff & ~n) + 1) : n;

        cpu.pc += 2 + offset;
        cpu.t += 12;
        return;
    }

    cpu.pc += 2;
    cpu.t += 8;
}];

$[0x21] = ['LD HL,d16', (cpu, mmu) => {
    cpu.hl = mmu.readWord(cpu.pc + 1);

    cpu.pc += 3;
    cpu.t += 12;
}];

$[0x22] = ['LD (HL+),A', (cpu, mmu) => {
    mmu.writeWord(cpu.hl++, cpu.a);

    cpu.pc += 1;
    cpu.t += 8;
}];

$[0x23] = ['INC HL', (cpu) => {
    cpu.hl++;

    cpu.pc += 1;
    cpu.t += 8;
}];

$[0x28] = ['JR Z,r8', (cpu, mmu) => {
    if (cpu.f >> 7 == 1) {
        const n = mmu.readByte(cpu.pc + 1);
        const offset = n & 0x80 ? -((0xff & ~n) + 1) : n;

        cpu.pc += 2 + offset;
        cpu.t += 12;
        return;
    }

    cpu.pc += 2;
    cpu.t += 8;
}];

$[0x2e] = ['LD L,d8', (cpu, mmu) => {
    cpu.l = mmu.readByte(cpu.pc + 1);

    cpu.pc += 2;
    cpu.t += 8;
}];

$[0x31] = ['LD SP,d16', (cpu, mmu) => {
    cpu.sp = mmu.readWord(cpu.pc + 1);

    cpu.pc += 3;
    cpu.t += 12;
}];

$[0x32] = ['LD (HL-),A', (cpu, mmu) => {
    mmu.writeByte(cpu.hl--, cpu.a);

    cpu.pc += 1;
    cpu.t += 8;
}];

$[0x3d] = ['DEC A', (cpu) => {
    cpu.a--;

    cpu.f &= ~(0xa0);
    if (cpu.a == 0) cpu.f |= 1 << 7;
    cpu.f |= 1 << 6;
    if ((~cpu.a & 0xf) == 0) cpu.f |= 1 << 5;

    cpu.pc += 1;
    cpu.t += 4;
}];

$[0x3e] = ['LD A,d8', (cpu, mmu) => {
    cpu.a = mmu.readByte(cpu.pc + 1);

    cpu.pc += 2;
    cpu.t += 8;
}];

$[0x4f] = ['LD C,A', (cpu) => {
    cpu.c = cpu.a;

    cpu.pc += 1;
    cpu.t += 4;
}];

$[0x57] = ['LD D,A', (cpu) => {
    cpu.d = cpu.a;

    cpu.pc += 1;
    cpu.t += 4;
}];

$[0x67] = ['LD H,A', (cpu) => {
    cpu.h = cpu.a;

    cpu.pc += 1;
    cpu.t += 4;
}];

$[0x77] = ['LD (HL),A', (cpu, mmu) => {
    mmu.writeByte(cpu.hl, cpu.a);

    cpu.pc += 1;
    cpu.t += 8;
}];

$[0x7b] = ['LD A,E', (cpu) => {
    cpu.a = cpu.e;

    cpu.pc += 1;
    cpu.t += 4;
}];

$[0xaf] = ['XOR A', (cpu) => {
    cpu.a ^= cpu.a;

    cpu.f = cpu.a == 0 ? 0x80 : 0;
    cpu.pc += 1;
    cpu.t += 4;
}];

$[0xc1] = ['POP BC', (cpu, mmu) => {
    cpu.bc = mmu.readWord(cpu.sp);
    cpu.sp += 2;

    cpu.pc += 1;
    cpu.t += 12;
}];

$[0xc5] = ['PUSH BC', (cpu, mmu) => {
    mmu.writeWord(cpu.sp -= 2, cpu.bc);

    cpu.pc += 1;
    cpu.t += 16;
}];

$[0xc9] = ['RET', (cpu, mmu) => {
    const addr = mmu.readWord(cpu.sp);
    cpu.sp += 2;

    cpu.pc = addr;
    cpu.t += 16;
}];

$[0xcd] = ['CALL a16', (cpu, mmu) => {
    mmu.writeWord(cpu.sp -= 2, cpu.pc + 3);

    cpu.pc = mmu.readWord(cpu.pc + 1);
    cpu.t += 24;
}];

$[0xe0] = ['LDH (a8),A', (cpu, mmu) => {
    mmu.writeByte(0xff00 + mmu.readByte(cpu.pc + 1), cpu.a);

    cpu.pc += 2;
    cpu.t += 12;
}];

$[0xe2] = ['LD (C),A', (cpu, mmu) => {
    mmu.writeByte(0xff00 + cpu.c, cpu.a);

    cpu.pc += 2;
    cpu.t += 8;
}];

$[0xea] = ['LD (a16),A', (cpu, mmu) => {
    mmu.writeByte(mmu.readWord(cpu.pc + 1), cpu.a);

    cpu.pc += 3;
    cpu.t += 16;
}];

$[0xf0] = ['LDH A,(a8)', (cpu, mmu) => {
    cpu.a = mmu.readByte(0xff00 + mmu.readByte(cpu.pc + 1));

    cpu.pc += 2;
    cpu.t += 12;
}];

$[0xfe] = ['CP d8', (cpu, mmu) => {
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
}];

// CB Prefixed

const $cb = $[0xcb] = [];

$cb[0x11] = ['RL C', (cpu) => {
    let v;
    cpu.c = v = cpu.c << 1;

    cpu.f = 0;
    if (cpu.c == 0) cpu.f |= 1 << 7;
    if (v >> 8 == 1) cpu.f |= 1 << 4;

    cpu.pc += 2;
    cpu.t += 8;
}];

$cb[0x7c] = ['BIT 7,H', (cpu) => {
    if (cpu.h >> 7 == 0) cpu.f |= 1 << 7;
    else cpu.f &= ~(1 << 7);
    cpu.f &= ~(1 << 6);
    cpu.f |= 1 << 5;

    cpu.pc += 2;
    cpu.t += 8;
}];
