'use strict';

require('../util/number');


const unknown = (prefix = '') => function (cpu, mmu) {
    const opcode = mmu.readByte(cpu.pc);

    const value = `${prefix.toString(16)}${opcode.toString(16)}`;
    const addr = cpu.pc.toString(16);
    throw new Error(`unknown opcode 0x${value}; $${addr}`);
};

const $ = exports.$ = new Array(0xff).fill([null, unknown()]);
const $cb = $[0xcb] = new Array(0xff).fill([null, unknown(0xcb)]);

/**
 * The Flag Register (lower 8bit of AF register)
 *
 * Bit  Name  Set Clr  Expl.
 * 7    zf    Z   NZ   Zero Flag
 * 6    n     -   -    Add/Sub-Flag (BCD)
 * 5    h     -   -    Half Carry Flag (BCD)
 * 4    cy    C   NC   Carry Flag
 * 3-0  -     -   -    Not used (always zero)
 */

const FLAG_Z = 0x80;
const FLAG_N = 0x40;
const FLAG_H = 0x20;
const FLAG_C = 0x10;

// 8-Bit Loads

/**
 * LD nn,n
 *
 * Description:
 * Put value nn into n.
 *
 * Use with:
 * nn = B, C, D, E, H, L, BC, DE, HL, SP
 * n = 8 bit immediate value
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * LD             B,n           06        8
 * LD             C,n           0E        8
 * LD             D,n           16        8
 * LD             E,n           1E        8
 * LD             H,n           26        8
 * LD             L,n           2E        8
 */

const LD_nn_n = (nn) => function (cpu, mmu) {
    cpu[nn] = mmu.readByte(cpu.pc + 1);
    cpu.pc += 2;

    return 8;
};

$[0x06] = ['LD B,n', LD_nn_n('b')];
$[0x0e] = ['LD C,n', LD_nn_n('c')];
$[0x16] = ['LD D,n', LD_nn_n('d')];
$[0x1e] = ['LD E,n', LD_nn_n('e')];
$[0x26] = ['LD H,n', LD_nn_n('h')];
$[0x2e] = ['LD L,n', LD_nn_n('l')];

/**
 * LD r1,r2
 *
 * Description:
 * Put value r2 into r1.
 *
 * Use with:
 * r1,r2 = A, B, C, D, E, H, L, (HL)
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * LD             A,A           7F        4
 * LD             A,B           78        4
 * LD             A,C           79        4
 * LD             A,D           7A        4
 * LD             A,E           7B        4
 * LD             A,H           7C        4
 * LD             A,L           7D        4
 * LD             A,(HL)        7E        8
 * LD             B,B           40        4
 * LD             B,C           41        4
 * LD             B,D           42        4
 * LD             B,E           43        4
 * LD             B,H           44        4
 * LD             B,L           45        4
 * LD             B,(HL)        46        8
 * LD             C,B           48        4
 * LD             C,C           49        4
 * LD             C,D           4A        4
 * LD             C,E           4B        4
 * LD             C,H           4C        4
 * LD             C,L           4D        4
 * LD             C,(HL)        4E        8
 * LD             D,B           50        4
 * LD             D,C           51        4
 * LD             D,D           52        4
 * LD             D,E           53        4
 * LD             D,H           54        4
 * LD             D,L           55        4
 * LD             D,(HL)        56        8
 * LD             E,B           58        4
 * LD             E,C           59        4
 * LD             E,D           5A        4
 * LD             E,E           5B        4
 * LD             E,H           5C        4
 * LD             E,L           5D        4
 * LD             E,(HL)        5E        8
 * LD             H,B           60        4
 * LD             H,C           61        4
 * LD             H,D           62        4
 * LD             H,E           63        4
 * LD             H,H           64        4
 * LD             H,L           65        4
 * LD             H,(HL)        66        8
 * LD             L,B           68        4
 * LD             L,C           69        4
 * LD             L,D           6A        4
 * LD             L,E           6B        4
 * LD             L,H           6C        4
 * LD             L,L           6D        4
 * LD             L,(HL)        6E        8
 * LD             (HL),B        70        8
 * LD             (HL),C        71        8
 * LD             (HL),D        73        8
 * LD             (HL),E        74        8
 * LD             (HL),H        75        8
 * LD             (HL),L        76        8
 * LD             (HL),n        36        12
 */

const LD_r1_r2 = (r1, r2) => function (cpu) {
    cpu[r1] = cpu[r2];
    cpu.pc += 1;

    return 4;
};

$[0x78] = ['LD A,B', LD_r1_r2('a', 'b')];
$[0x79] = ['LD A,C', LD_r1_r2('a', 'c')];
$[0x7a] = ['LD A,D', LD_r1_r2('a', 'd')];
$[0x7b] = ['LD A,E', LD_r1_r2('a', 'e')];
$[0x7c] = ['LD A,H', LD_r1_r2('a', 'h')];
$[0x7d] = ['LD A,L', LD_r1_r2('a', 'l')];
$[0x7f] = ['LD A,A', LD_r1_r2('a', 'a')];

$[0x40] = ['LD B,B', LD_r1_r2('b', 'b')];
$[0x41] = ['LD B,C', LD_r1_r2('b', 'c')];
$[0x42] = ['LD B,D', LD_r1_r2('b', 'd')];
$[0x43] = ['LD B,E', LD_r1_r2('b', 'e')];
$[0x44] = ['LD B,H', LD_r1_r2('b', 'h')];
$[0x45] = ['LD B,L', LD_r1_r2('b', 'l')];

$[0x48] = ['LD C,B', LD_r1_r2('c', 'b')];
$[0x49] = ['LD C,C', LD_r1_r2('c', 'c')];
$[0x4a] = ['LD C,D', LD_r1_r2('c', 'd')];
$[0x4b] = ['LD C,E', LD_r1_r2('c', 'e')];
$[0x4c] = ['LD C,H', LD_r1_r2('c', 'h')];
$[0x4d] = ['LD C,L', LD_r1_r2('c', 'l')];

$[0x50] = ['LD D,B', LD_r1_r2('d', 'b')];
$[0x51] = ['LD D,C', LD_r1_r2('d', 'c')];
$[0x52] = ['LD D,D', LD_r1_r2('d', 'd')];
$[0x53] = ['LD D,E', LD_r1_r2('d', 'e')];
$[0x54] = ['LD D,H', LD_r1_r2('d', 'h')];
$[0x55] = ['LD D,L', LD_r1_r2('d', 'l')];

$[0x58] = ['LD E,B', LD_r1_r2('e', 'b')];
$[0x59] = ['LD E,C', LD_r1_r2('e', 'c')];
$[0x5a] = ['LD E,D', LD_r1_r2('e', 'd')];
$[0x5b] = ['LD E,E', LD_r1_r2('e', 'e')];
$[0x5c] = ['LD E,H', LD_r1_r2('e', 'h')];
$[0x5d] = ['LD E,L', LD_r1_r2('e', 'l')];

$[0x60] = ['LD H,B', LD_r1_r2('h', 'b')];
$[0x61] = ['LD H,C', LD_r1_r2('h', 'c')];
$[0x62] = ['LD H,D', LD_r1_r2('h', 'd')];
$[0x63] = ['LD H,E', LD_r1_r2('h', 'e')];
$[0x64] = ['LD H,H', LD_r1_r2('h', 'h')];
$[0x65] = ['LD H,L', LD_r1_r2('h', 'l')];

$[0x68] = ['LD L,B', LD_r1_r2('l', 'b')];
$[0x69] = ['LD L,C', LD_r1_r2('l', 'c')];
$[0x6a] = ['LD L,D', LD_r1_r2('l', 'd')];
$[0x6b] = ['LD L,E', LD_r1_r2('l', 'e')];
$[0x6c] = ['LD L,H', LD_r1_r2('l', 'h')];
$[0x6d] = ['LD L,L', LD_r1_r2('l', 'l')];

const LD_r_$HL = (r) => function (cpu, mmu) {
    cpu[r] = mmu.readByte(cpu.hl);
    cpu.pc += 1;

    return 8;
};

$[0x46] = ['LD B,(HL)', LD_r_$HL('b')];
$[0x4e] = ['LD C,(HL)', LD_r_$HL('c')];
$[0x56] = ['LD D,(HL)', LD_r_$HL('d')];
$[0x5e] = ['LD E,(HL)', LD_r_$HL('e')];
$[0x66] = ['LD H,(HL)', LD_r_$HL('h')];
$[0x6e] = ['LD L,(HL)', LD_r_$HL('l')];
$[0x7e] = ['LD A,(HL)', LD_r_$HL('a')];

const LD_$HL_r = (r) => function (cpu, mmu) {
    mmu.writeByte(cpu.hl, cpu[r]);
    cpu.pc += 1;

    return 8;
};

$[0x70] = ['LD (HL),B', LD_$HL_r('b')];
$[0x71] = ['LD (HL),C', LD_$HL_r('c')];
$[0x72] = ['LD (HL),D', LD_$HL_r('d')];
$[0x73] = ['LD (HL),E', LD_$HL_r('e')];
$[0x74] = ['LD (HL),H', LD_$HL_r('h')];
$[0x75] = ['LD (HL),L', LD_$HL_r('l')];

$[0x36] = ['LD (HL),n', (cpu, mmu) => {
    mmu.writeByte(cpu.hl, mmu.readByte(cpu.pc + 1));
    cpu.pc += 2;

    return 12;
}];

/**
 * LD A,n
 *
 * Description:
 * Put value n into A.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (BC), (DE), (HL), (nn), #
 * nn = two byte immediate value. (LS byte first.)
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * LD             A,A           7F        4
 * LD             A,B           78        4
 * LD             A,C           79        4
 * LD             A,D           7A        4
 * LD             A,E           7B        4
 * LD             A,H           7C        4
 * LD             A,L           7D        4
 * LD             A,(BC)        0A        8
 * LD             A,(DE)        1A        8
 * LD             A,(HL)        7E        8
 * LD             A,(nn)        FA        16
 * LD             A,#           3E        8
 */

const LD_A_n = (n) => function (cpu) {
    cpu.a = cpu[n];
    cpu.pc += 1;

    return 4;
};

$[0x78] = ['LD A,B', LD_A_n('b')];
$[0x79] = ['LD A,C', LD_A_n('c')];
$[0x7a] = ['LD A,D', LD_A_n('d')];
$[0x7b] = ['LD A,E', LD_A_n('e')];
$[0x7c] = ['LD A,H', LD_A_n('h')];
$[0x7d] = ['LD A,L', LD_A_n('l')];
$[0x7f] = ['LD A,A', LD_A_n('a')];

const LD_A_$n = (n) => function (cpu, mmu) {
    cpu.a = mmu.readByte(cpu[n]);
    cpu.pc += 1;

    return 8;
};

$[0x0a] = ['LD A,(BC)', LD_A_$n('bc')];
$[0x1a] = ['LD A,(DE)', LD_A_$n('de')];
$[0x7e] = ['LD A,(HL)', LD_A_$n('hl')];

$[0xfa] = ['LD A,(nn)', (cpu, mmu) => {
    cpu.a = mmu.readByte(mmu.readWord(cpu.pc + 1));
    cpu.pc += 3;

    return 16;
}];

$[0x3e] = ['LD A,n', (cpu, mmu) => {
    cpu.a = mmu.readByte(cpu.pc + 1);
    cpu.pc += 2;

    return 8;
}];

/**
 * LD n,A
 *
 * Description:
 * Put value A into n.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (BC), (DE), (HL), (nn)
 * nn = two byte immediate value. (LS byte first.)
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * LD             A,A           7F        4
 * LD             B,A           47        4
 * LD             C,A           4F        4
 * LD             D,A           57        4
 * LD             E,A           5F        4
 * LD             H,A           67        4
 * LD             L,A           6F        4
 * LD             (BC),A        02        8
 * LD             (DE),A        12        8
 * LD             (HL),A        77        8
 * LD             (nn),A        EA        16
 */

const LD_n_A = (n) => function (cpu) {
    cpu[n] = cpu.a;
    cpu.pc += 1;

    return 4;
};

$[0x47] = ['LD B,A', LD_n_A('b')];
$[0x4f] = ['LD C,A', LD_n_A('c')];
$[0x57] = ['LD D,A', LD_n_A('d')];
$[0x5f] = ['LD E,A', LD_n_A('e')];
$[0x67] = ['LD H,A', LD_n_A('h')];
$[0x6f] = ['LD L,A', LD_n_A('l')];
$[0x7f] = ['LD A,A', LD_n_A('a')];

const LD_$n_A = (n) => function (cpu, mmu) {
    mmu.writeByte(cpu[n], cpu.a);
    cpu.pc += 1;

    return 8;
};

$[0x02] = ['LD (BC),A', LD_$n_A('bc')];
$[0x12] = ['LD (DE),A', LD_$n_A('de')];
$[0x77] = ['LD (HL),A', LD_$n_A('hl')];

$[0xea] = ['LD (nn),A', (cpu, mmu) => {
    mmu.writeByte(mmu.readWord(cpu.pc + 1), cpu.a);
    cpu.pc += 3;

    return 16;
}];

/**
 * LD A,(C)
 *
 * Description:
 * Put value at address $FF00 + register C into A.
 * Same as: LDA,($FF00+C)
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * LD             A,(C)         F2        8
 */

$[0xf2] = ['LD A,(C)', (cpu, mmu) => {
    cpu.a = mmu.readByte(0xff00 + cpu.c);
    cpu.pc += 1;

    return 8;
}];

/**
 * LD (C),A
 *
 * Description:
 * Put A into address $FF00 + register C.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * LD             ($FF00+C),A   E2        8
 */

$[0xe2] = ['LD (C),A', (cpu, mmu) => {
    mmu.writeByte(0xff00 + cpu.c, cpu.a);
    cpu.pc += 1;

    return 8;
}];

/**
 * LD A,(HLD)
 * LD A,(HL-)
 * LDD A,(HL)
 *
 * Description:
 * Put value at address HL into A. Decrement HL.
 * Same as: LDA,(HL) - DEC HL
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * LD             A,(HLD)       3A        8
 * LD             A,(HL-)       3A        8
 * LDD            A,(HL)        3A        8
 */

$[0x3a] = ['LD A,(HL-)', (cpu, mmu) => {
    cpu.a = mmu.readByte(cpu.hl--);
    cpu.pc += 1;

    return 8;
}];

/**
 * LD (HLD),A
 * LD (HL-),A
 * LDD (HL),A
 *
 * Description:
 * Put A into memory address HL. Decrement HL.
 * Same as: LD(HL),A - DEC HL
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * LD             (HLD),A       32        8
 * LD             (HL-),A       32        8
 * LDD            (HL),A        32        8
 */

$[0x32] = ['LD (HL-),A', (cpu, mmu) => {
    mmu.writeByte(cpu.hl--, cpu.a);
    cpu.pc += 1;

    return 8;
}];

/**
 * LD A,(HLI)
 * LD A,(HL+)
 * LDI A,(HL)
 *
 * Description:
 * Put value at address HL into A. Increment HL.
 * Same as: LDA,(HL) - INC HL
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * LD             A,(HLI)       2A        8
 * LD             A,(HL+)       2A        8
 * LDI            A,(HL)        2A        8
 */

$[0x2a] = ['LD A,(HL+)', (cpu, mmu) => {
    cpu.a = mmu.readByte(cpu.hl++);
    cpu.pc += 1;

    return 8;
}];

/**
 * LD (HLI),A
 * LD (HL+),A
 * LDI (HL),A
 *
 * Description:
 * Put A into memory address HL. Increment HL.
 * Same as: LD(HL),A - INC HL
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * LD             (HLI),A       22        8
 * LD             (HL+),A       22        8
 * LDI            (HL),A        22        8
 */

$[0x22] = ['LD (HL+),A', (cpu, mmu) => {
    mmu.writeByte(cpu.hl++, cpu.a);
    cpu.pc += 1;

    return 8;
}];

/**
 * LDH (n),A
 *
 * Description:
 * Put A into memory address $FF00+n.
 *
 * Use with:
 * n = one byte immediate value.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * LD             ($FF00+n),A   E0        12
 */

$[0xe0] = ['LDH (n),A', (cpu, mmu) => {
    const n = mmu.readByte(cpu.pc + 1);
    mmu.writeByte(0xff00 + n, cpu.a);
    cpu.pc += 2;

    return 12;
}];

/**
 * LDH A,(n)
 *
 * Description:
 * Put memory address $FF00+n into A.
 *
 * Use with:
 * n = one byte immediate value.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * LD             A,($FF00+n)   F0        12
 */

$[0xf0] = ['LDH A,(n)', (cpu, mmu) => {
    const n = mmu.readByte(cpu.pc + 1);
    cpu.a = mmu.readByte(0xff00 + n);
    cpu.pc += 2;

    return 12;
}];

// 16-Bit Loads

/**
 * LD n,nn
 *
 * Description:
 * Put value nn into n.
 *
 * Use with:
 * n = BC, DE, HL, SP
 * nn = 16 bit immediate value
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * LD             BC,nn         01        12
 * LD             DE,nn         11        12
 * LD             HL,nn         21        12
 * LD             SP,nn         31        12
 */

const LD_n_nn = (n) => function (cpu, mmu) {
    cpu[n] = mmu.readWord(cpu.pc + 1);
    cpu.pc += 3;

    return 12;
};

$[0x01] = ['LD BC,nn', LD_n_nn('bc')];
$[0x11] = ['LD DE,nn', LD_n_nn('de')];
$[0x21] = ['LD HL,nn', LD_n_nn('hl')];
$[0x31] = ['LD SP,nn', LD_n_nn('sp')];

/**
 * LD SP,HL
 *
 * Description:
 * Put HL into Stack Pointer (SP).
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * LD             SP,HL         F9        8
 */

$[0xf9] = ['LD SP,HL', (cpu) => {
    cpu.sp = cpu.hl;
    cpu.pc += 1;

    return 8;
}];

/**
 * LD HL,SP+n
 * LDHL SP,n
 *
 * Description
 * Put SP + n effective address into HL.
 *
 * Use with:
 * n = one byte signed immediate value.
 *
 * Flags affected:
 * Z - Reset.
 * N - Reset.
 * H - Set or reset according to operation.
 * C - Set or reset according to operation.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * LDHL           SP,n          F8        12
 */

function add_sp_n (cpu, mmu) {
    const n = mmu.readByte(cpu.pc + 1).signed();
    const r = cpu.sp + n;

    const op = cpu.sp ^ n ^ r;

    cpu.f = 0;
    if ((op & 0x10) != 0) cpu.f |= FLAG_H;
    if ((op & 0x100) != 0) cpu.f |= FLAG_C;

    return r;
}

$[0xf8] = ['LD HL,SP+n', (cpu, mmu) => {
    cpu.hl = add_sp_n(cpu, mmu);
    cpu.pc += 2;

    return 12;
}];

/**
 * LD (nn),SP
 *
 * Description:
 * Put Stack Pointer (SP) at address n.
 *
 * Use with:
 * nn = two byte immediate address.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * LD             (nn),SP       08        20
 */

$[0x08] = ['LD (nn),SP', (cpu, mmu) => {
    mmu.writeWord(mmu.readWord(cpu.pc + 1), cpu.sp);
    cpu.pc += 3;

    return 20;
}];

/**
 * PUSH nn
 *
 * Description:
 * Push register pair nn onto stack. Decrement Stack Pointer (SP) twice.
 *
 * Use with:
 * nn = AF, BC, DE, HL
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * PUSH           AF            F5        16
 * PUSH           BC            C5        16
 * PUSH           DE            D5        16
 * PUSH           HL            E5        16
 */

const PUSH_nn = (nn) => function (cpu, mmu) {
    mmu.writeWord(cpu.sp -= 2, cpu[nn]);
    cpu.pc += 1;

    return 16;
};

$[0xc5] = ['PUSH BC', PUSH_nn('bc')];
$[0xd5] = ['PUSH DE', PUSH_nn('de')];
$[0xe5] = ['PUSH HL', PUSH_nn('hl')];
$[0xf5] = ['PUSH AF', PUSH_nn('af')];

/**
 * POP nn
 *
 * Description:
 * Pop two bytes off stack into register pair nn. Increment Stack Pointer (SP)
 * twice.
 *
 * Use with:
 * nn = AF, BC, DE, HL
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * POP            AF            F1        12
 * POP            BC            C1        12
 * POP            DE            D1        12
 * POP            HL            E1        12
 */

const POP_nn = (nn) => function (cpu, mmu) {
    cpu[nn] = mmu.readWord(cpu.sp);
    cpu.sp += 2;
    cpu.pc += 1;

    return 12;
};

$[0xc1] = ['POP BC', POP_nn('bc')];
$[0xd1] = ['POP DE', POP_nn('de')];
$[0xe1] = ['POP HL', POP_nn('hl')];
$[0xf1] = ['POP AF', POP_nn('af')];

// 8-Bit ALU

/**
 * ADD A,n
 *
 * Description:
 * Add n to A.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL), #
 *
 * Flags affected:
 * Z - Set if result is zero.
 * N - Reset.
 * H - Set if carry from bit 3.
 * C - Set if carry from bit 7.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * ADD            A,A           87        4
 * ADD            A,B           80        4
 * ADD            A,C           81        4
 * ADD            A,D           82        4
 * ADD            A,E           83        4
 * ADD            A,H           84        4
 * ADD            A,L           85        4
 * ADD            A,(HL)        86        8
 * ADD            A,#           C6        8
 */

function add (cpu, n) {
    const r = cpu.a + n;

    cpu.f = 0;
    if ((r & 0xff) == 0) cpu.f |= FLAG_Z;
    if (((cpu.a ^ n ^ r) & 0x10) != 0) cpu.f |= FLAG_H;
    if ((r & 0x100) != 0) cpu.f |= FLAG_C;

    return r;
}

const ADD_A_n = (n) => function (cpu) {
    cpu.a = add(cpu, cpu[n]);
    cpu.pc += 1;

    return 4;
};

$[0x80] = ['ADD A,B', ADD_A_n('b')];
$[0x81] = ['ADD A,C', ADD_A_n('c')];
$[0x82] = ['ADD A,D', ADD_A_n('d')];
$[0x83] = ['ADD A,E', ADD_A_n('e')];
$[0x84] = ['ADD A,H', ADD_A_n('h')];
$[0x85] = ['ADD A,L', ADD_A_n('l')];
$[0x87] = ['ADD A,A', ADD_A_n('a')];

$[0x86] = ['ADD A,(HL)', (cpu, mmu) => {
    const n = mmu.readByte(cpu.hl);
    cpu.a = add(cpu, n);
    cpu.pc += 1;

    return 8;
}];

$[0xc6] = ['ADD A,#', (cpu, mmu) => {
    const n = mmu.readByte(cpu.pc + 1);
    cpu.a = add(cpu, n);
    cpu.pc += 2;

    return 8;
}];

/**
 * ADC A,n
 *
 * Description:
 * Add n + Carry flag to A.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL), #
 *
 * Flags affected:
 * Z - Set if result is zero.
 * N - Reset.
 * H - Set if carry from bit 3.
 * C - Set if carry from bit 7.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * ADC            A,A           8F        4
 * ADC            A,B           88        4
 * ADC            A,C           89        4
 * ADC            A,D           8A        4
 * ADC            A,E           8B        4
 * ADC            A,H           8C        4
 * ADC            A,L           8D        4
 * ADC            A,(HL)        8E        8
 * ADC            A,#           CE        8
 */

function adc (cpu, n) {
    const cy = cpu.f >> 4 & 1;
    const r = cpu.a + n + cy;

    cpu.f = 0;
    if ((r & 0xff) == 0) cpu.f |= FLAG_Z;
    if (((cpu.a ^ n ^ r) & 0x10) != 0) cpu.f |= FLAG_H;
    if ((r & 0x100) != 0) cpu.f |= FLAG_C;

    return r;
}

const ADC_A_n = (n) => function (cpu) {
    cpu.a = adc(cpu, cpu[n]);
    cpu.pc += 1;

    return 4;
};

$[0x88] = ['ADC A,B', ADC_A_n('b')];
$[0x89] = ['ADC A,C', ADC_A_n('c')];
$[0x8a] = ['ADC A,D', ADC_A_n('d')];
$[0x8b] = ['ADC A,E', ADC_A_n('e')];
$[0x8c] = ['ADC A,H', ADC_A_n('h')];
$[0x8d] = ['ADC A,L', ADC_A_n('l')];
$[0x8f] = ['ADC A,A', ADC_A_n('a')];

$[0x8e] = ['ADC A,(HL)', (cpu, mmu) => {
    cpu.a = adc(cpu, mmu.readByte(cpu.hl));
    cpu.pc += 1;

    return 8;
}];

$[0xce] = ['ADC A,#', (cpu, mmu) => {
    cpu.a = adc(cpu, mmu.readByte(cpu.pc + 1));
    cpu.pc += 2;

    return 8;
}];

/**
 * SUB n
 *
 * Description:
 * Subtract n from A.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL), #
 *
 * Flags affected:
 * Z - Set if result is zero.
 * N - Set.
 * H - Set if no borrow from bit 4.
 * C - Set if no borrow.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * SUB            A             97        4
 * SUB            B             90        4
 * SUB            C             91        4
 * SUB            D             92        4
 * SUB            E             93        4
 * SUB            H             94        4
 * SUB            L             95        4
 * SUB            (HL)          96        8
 * SUB            #             D6        8
 */

function sub (cpu, n) {
    const r = cpu.a - n;

    cpu.f = FLAG_N;
    if ((r & 0xff) == 0) cpu.f |= FLAG_Z;
    if (((cpu.a ^ n ^ r) & 0x10) != 0) cpu.f |= FLAG_H;
    if ((r & 0x100) != 0) cpu.f |= FLAG_C;

    return r;
}

const SUB_n = (n) => function (cpu) {
    cpu.a = sub(cpu, cpu[n]);
    cpu.pc += 1;

    return 4;
};

$[0x90] = ['SUB B', SUB_n('b')];
$[0x91] = ['SUB C', SUB_n('c')];
$[0x92] = ['SUB D', SUB_n('d')];
$[0x93] = ['SUB E', SUB_n('e')];
$[0x94] = ['SUB H', SUB_n('h')];
$[0x95] = ['SUB L', SUB_n('l')];
$[0x97] = ['SUB A', SUB_n('a')];

$[0x96] = ['SUB (HL)', (cpu, mmu) => {
    cpu.a = sub(cpu, mmu.readByte(cpu.hl));
    cpu.pc += 1;

    return 8;
}];

$[0xd6] = ['SUB #', (cpu, mmu) => {
    cpu.a = sub(cpu, mmu.readByte(cpu.pc + 1));
    cpu.pc += 2;

    return 8;
}];

/**
 * SBC A,n
 *
 * Description:
 * Subtract n + Carry flag from A.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL), #
 *
 * Flags affected:
 * Z - Set if result is zero.
 * N - Set.
 * H - Set if no borrow from bit 4.
 * C - Set if no borrow.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * SBC            A,A           9F        4
 * SBC            A,B           98        4
 * SBC            A,C           99        4
 * SBC            A,D           9A        4
 * SBC            A,E           9B        4
 * SBC            A,H           9C        4
 * SBC            A,L           9D        4
 * SBC            A,(HL)        9E        8
 * SBC            A,#           DE        8
 */

function sbc (cpu, n) {
    const cy = cpu.f >> 4 & 1;
    const r = cpu.a - n - cy;

    cpu.f = FLAG_N;
    if ((r & 0xff) == 0) cpu.f |= FLAG_Z;
    if (((cpu.a ^ n ^ r) & 0x10) != 0) cpu.f |= FLAG_H;
    if ((r & 0x100) != 0) cpu.f |= FLAG_C;

    return r;
}

const SBC_A_n = (n) => function (cpu) {
    cpu.a = sbc(cpu, cpu[n]);
    cpu.pc += 1;

    return 4;
};

$[0x98] = ['SBC A,B', SBC_A_n('b')];
$[0x99] = ['SBC A,C', SBC_A_n('c')];
$[0x9a] = ['SBC A,D', SBC_A_n('d')];
$[0x9b] = ['SBC A,E', SBC_A_n('e')];
$[0x9c] = ['SBC A,H', SBC_A_n('h')];
$[0x9d] = ['SBC A,L', SBC_A_n('l')];
$[0x9f] = ['SBC A,A', SBC_A_n('a')];

$[0x9e] = ['SBC A,(HL)', (cpu, mmu) => {
    cpu.a = sbc(cpu, mmu.readByte(cpu.hl));
    cpu.pc += 1;

    return 8;
}];

$[0xde] = ['SBC A,#', (cpu, mmu) => {
    cpu.a = sbc(cpu, mmu.readByte(cpu.pc + 1));
    cpu.pc += 2;

    return 8;
}];

/**
 * AND n
 *
 * Description:
 * Logically AND n with A, result in A.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL), #
 *
 * Flags affected:
 * Z - Set if result is zero.
 * N - Reset.
 * H - Set.
 * C - Reset.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * AND            A             A7        4
 * AND            B             A0        4
 * AND            C             A1        4
 * AND            D             A2        4
 * AND            E             A3        4
 * AND            H             A4        4
 * AND            L             A5        4
 * AND            (HL)          A6        8
 * AND            #             E6        8
 */

function and (cpu, n) {
    const r = cpu.a & n;

    cpu.f = FLAG_H;
    if ((r & 0xff) == 0) cpu.f |= FLAG_Z;

    return r;
}

const AND_n = (n) => function (cpu) {
    cpu.a = and(cpu, cpu[n]);
    cpu.pc += 1;

    return 4;
};

$[0xa0] = ['AND B', AND_n('b')];
$[0xa1] = ['AND C', AND_n('c')];
$[0xa2] = ['AND D', AND_n('d')];
$[0xa3] = ['AND E', AND_n('e')];
$[0xa4] = ['AND H', AND_n('h')];
$[0xa5] = ['AND L', AND_n('l')];
$[0xa7] = ['AND A', AND_n('a')];

$[0xa6] = ['AND (HL)', (cpu, mmu) => {
    cpu.a = and(cpu, mmu.readByte(cpu.hl));
    cpu.pc += 1;

    return 8;
}];

$[0xe6] = ['AND #', (cpu, mmu) => {
    cpu.a = and(cpu, mmu.readByte(cpu.pc + 1));
    cpu.pc += 2;

    return 8;
}];

/**
 * OR n
 *
 * Description:
 * Logical OR n with register A, result in A.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL), #
 *
 * Flags affected:
 * Z - Set if result is zero.
 * N - Reset.
 * H - Reset.
 * C - Reset.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * OR             A             B7        4
 * OR             B             B0        4
 * OR             C             B1        4
 * OR             D             B2        4
 * OR             E             B3        4
 * OR             H             B4        4
 * OR             L             B5        4
 * OR             (HL)          B6        8
 * OR             #             F6        8
 */

function or (cpu, n) {
    const r = cpu.a | n;

    cpu.f = 0;
    if ((r & 0xff) == 0) cpu.f |= FLAG_Z;

    return r;
}

const OR_n = (n) => function (cpu) {
    cpu.a = or(cpu, cpu[n]);
    cpu.pc += 1;

    return 4;
};

$[0xb0] = ['OR B', OR_n('b')];
$[0xb1] = ['OR C', OR_n('c')];
$[0xb2] = ['OR D', OR_n('d')];
$[0xb3] = ['OR E', OR_n('e')];
$[0xb4] = ['OR H', OR_n('h')];
$[0xb5] = ['OR L', OR_n('l')];
$[0xb7] = ['OR A', OR_n('a')];

$[0xb6] = ['OR (HL)', (cpu, mmu) => {
    cpu.a = or(cpu, mmu.readByte(cpu.hl));
    cpu.pc += 1;

    return 4;
}];

$[0xf6] = ['OR #', (cpu, mmu) => {
    cpu.a = or(cpu, mmu.readByte(cpu.pc + 1));
    cpu.pc += 2;

    return 4;
}];

/**
 * XOR n
 *
 * Description:
 * Logical exclusive OR n with register A, result in A.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL), #
 *
 * Flags affected:
 * Z - Set if result is zero.
 * N - Reset.
 * H - Reset.
 * C - Reset.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * XOR            A             AF        4
 * XOR            B             A8        4
 * XOR            C             A9        4
 * XOR            D             AA        4
 * XOR            E             AB        4
 * XOR            H             AC        4
 * XOR            L             AD        4
 * XOR            (HL)          AE        8
 * XOR            #             EE        8
 */

function xor (cpu, n) {
    const r = cpu.a ^ n;

    cpu.f = 0;
    if ((r & 0xff) == 0) cpu.f |= FLAG_Z;

    return r;
}

const XOR_n = (n) => function (cpu) {
    cpu.a = xor(cpu, cpu[n]);
    cpu.pc += 1;

    return 4;
};

$[0xa8] = ['XOR B', XOR_n('b')];
$[0xa9] = ['XOR C', XOR_n('c')];
$[0xaa] = ['XOR D', XOR_n('d')];
$[0xab] = ['XOR E', XOR_n('e')];
$[0xac] = ['XOR H', XOR_n('h')];
$[0xad] = ['XOR L', XOR_n('l')];
$[0xaf] = ['XOR A', XOR_n('a')];

$[0xae] = ['XOR (HL)', (cpu, mmu) => {
    cpu.a = xor(cpu, mmu.readByte(cpu.hl));
    cpu.pc += 1;

    return 8;
}];

$[0xee] = ['XOR #', (cpu, mmu) => {
    cpu.a = xor(cpu, mmu.readByte(cpu.pc + 1));
    cpu.pc += 2;

    return 8;
}];

/**
 * CP n
 *
 * Description:
 * Compare A with n. This is basically an A - n subtraction instruction but the
 * results are thrown away.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL), #
 *
 * Flags affected:
 * Z - Set if result is zero. (Set if A=n.)
 * N - Set.
 * H - Set if no borrow from bit 4.
 * C - Set for no borrow. (Set if A<n.)
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * CP             A             BF        4
 * CP             B             B8        4
 * CP             C             B9        4
 * CP             D             BA        4
 * CP             E             BB        4
 * CP             H             BC        4
 * CP             L             BD        4
 * CP             (HL)          BE        8
 * CP             #             FE        8
 */

const CP_n = (n) => function (cpu) {
    sub(cpu, cpu[n]);
    cpu.pc += 1;

    return 4;
};

$[0xb8] = ['CP B', CP_n('b')];
$[0xb9] = ['CP C', CP_n('c')];
$[0xba] = ['CP D', CP_n('d')];
$[0xbb] = ['CP E', CP_n('e')];
$[0xbc] = ['CP H', CP_n('h')];
$[0xbd] = ['CP L', CP_n('l')];
$[0xbf] = ['CP A', CP_n('a')];

$[0xbe] = ['CP (HL)', (cpu, mmu) => {
    sub(cpu, mmu.readByte(cpu.hl));
    cpu.pc += 1;

    return 8;
}];

$[0xfe] = ['CP #', (cpu, mmu) => {
    sub(cpu, mmu.readByte(cpu.pc + 1));
    cpu.pc += 2;

    return 8;
}];

/**
 * INC n
 *
 * Description:
 * Increment register n.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL)
 *
 * Flags affected:
 * Z - Set if result is zero.
 * N - Reset.
 * H - Set if carry from bit 3.
 * C - Not affected.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * INC            A             3C        4
 * INC            B             04        4
 * INC            C             0C        4
 * INC            D             14        4
 * INC            E             1C        4
 * INC            H             24        4
 * INC            L             2C        4
 * INC            (HL)          34        12
 */

function inc (cpu, n) {
    const r = n + 1;

    cpu.f &= ~0xe0;
    if ((r & 0xff) == 0) cpu.f |= FLAG_Z;
    if ((n & 0xf) == 0xf) cpu.f |= FLAG_H;

    return r;
}

const INC_n = (n) => function (cpu) {
    cpu[n] = inc(cpu, cpu[n]);
    cpu.pc += 1;

    return 4;
};

$[0x04] = ['INC B', INC_n('b')];
$[0x0c] = ['INC C', INC_n('c')];
$[0x14] = ['INC D', INC_n('d')];
$[0x1c] = ['INC E', INC_n('e')];
$[0x24] = ['INC H', INC_n('h')];
$[0x2c] = ['INC L', INC_n('l')];
$[0x3c] = ['INC A', INC_n('a')];

$[0x34] = ['INC (HL)', (cpu, mmu) => {
    const n = mmu.readByte(cpu.hl);
    mmu.writeByte(cpu.hl, inc(cpu, n));
    cpu.pc += 1;

    return 12;
}];

/**
 * DEC n
 *
 * Description:
 * Decrement register n.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL)
 *
 * Flags affected:
 * Z - Set if reselt is zero.
 * N - Set.
 * H - Set if no borrow from bit 4.
 * C - Not affected.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * DEC            A             3D        4
 * DEC            B             05        4
 * DEC            C             0D        4
 * DEC            D             15        4
 * DEC            E             1D        4
 * DEC            H             25        4
 * DEC            L             2D        4
 * DEC            (HL)          35        12
 */

function dec (cpu, n) {
    const r = n - 1;

    cpu.f &= ~0xe0;
    if ((r & 0xff) == 0) cpu.f |= FLAG_Z;
    cpu.f |= FLAG_N;
    if ((n & 0xf) == 0) cpu.f |= FLAG_H;

    return r;
}

const DEC_n = (n) => function (cpu) {
    cpu[n] = dec(cpu, cpu[n]);
    cpu.pc += 1;

    return 4;
};

$[0x05] = ['DEC B', DEC_n('b')];
$[0x0d] = ['DEC C', DEC_n('c')];
$[0x15] = ['DEC D', DEC_n('d')];
$[0x1d] = ['DEC E', DEC_n('e')];
$[0x25] = ['DEC H', DEC_n('h')];
$[0x2d] = ['DEC L', DEC_n('l')];
$[0x3d] = ['DEC A', DEC_n('a')];

$[0x35] = ['DEC (HL)', (cpu, mmu) => {
    const n = mmu.readByte(cpu.hl);
    mmu.writeByte(cpu.hl, dec(cpu, n));
    cpu.pc += 1;

    return 12;
}];

// 16-Bit Arithmetic

/**
 * ADD HL,n
 *
 * Description:
 * Add n to HL.
 *
 * Use with:
 * n = BC, DE, HL, SP
 *
 * Flags affected:
 * Z - Not affected.
 * N - Reset.
 * H - Set if carry from bit 11.
 * C - Set if carry from bit 15.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * ADD            HL,BC         09        8
 * ADD            HL,DE         19        8
 * ADD            HL,HL         29        8
 * ADD            HL,SP         39        8
 */

const ADD_HL_n = (n) => function (cpu, mmu) {
    const r = cpu.hl + cpu[n];

    cpu.f &= ~0x70;
    if (((cpu.hl ^ cpu[n] ^ r) & 0x1000) != 0) cpu.f |= FLAG_H;
    if ((r & 0x10000) != 0) cpu.f |= FLAG_C;

    cpu.hl = r;
    cpu.pc += 1;

    return 8;
};

$[0x09] = ['ADD HL,BC', ADD_HL_n('bc')];
$[0x19] = ['ADD HL,DE', ADD_HL_n('de')];
$[0x29] = ['ADD HL,HL', ADD_HL_n('hl')];
$[0x39] = ['ADD HL,SP', ADD_HL_n('sp')];

/**
 * ADD SP,n
 *
 * Description:
 * Add n to Stack Pointer (SP).
 *
 * Use with:
 * n = one byte signed immediate value (#).
 *
 * Flags affected:
 * Z - Reset.
 * N - Reset.
 * H - Set or reset according to operation.
 * C - Set or reset according to operation.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * ADD            SP,#          E8        16
 */

$[0xe8] = ['ADD SP,#', (cpu, mmu) => {
    cpu.sp = add_sp_n(cpu, mmu);
    cpu.pc += 2;

    return 16;
}];

/**
 * INC nn
 *
 * Description:
 * Increment register nn.
 *
 * Use with:
 * nn = BC, DE, HL, SP
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * INC            BC            03        8
 * INC            DE            13        8
 * INC            HL            23        8
 * INC            SP            33        8
 */

const INC_nn = (nn) => function (cpu) {
    cpu[nn]++;
    cpu.pc += 1;

    return 8;
};

$[0x03] = ['INC BC', INC_nn('bc')];
$[0x13] = ['INC DE', INC_nn('de')];
$[0x23] = ['INC HL', INC_nn('hl')];
$[0x33] = ['INC SP', INC_nn('sp')];

/**
 * DEC nn
 *
 * Description:
 * Decrement register nn.
 *
 * Use with:
 * nn = BC, DE, HL, SP
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * DEC            BC            0B        8
 * DEC            DE            1B        8
 * DEC            HL            2B        8
 * DEC            SP            3B        8
 */

const DEC_nn = (nn) => function (cpu) {
    cpu[nn]--;
    cpu.pc += 1;

    return 8;
};

$[0x0b] = ['DEC BC', DEC_nn('bc')];
$[0x1b] = ['DEC DE', DEC_nn('de')];
$[0x2b] = ['DEC HL', DEC_nn('hl')];
$[0x3b] = ['DEC SP', DEC_nn('sp')];

// Miscellaneous

/**
 * SWAP n
 *
 * Description:
 * Swap upper & lower nibles of n.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL)
 *
 * Flags affected:
 * Z - Set if result is zero.
 * N - Reset.
 * H - Reset.
 * C - Reset.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * SWAP           A             CB 37     8
 * SWAP           B             CB 30     8
 * SWAP           C             CB 31     8
 * SWAP           D             CB 32     8
 * SWAP           E             CB 33     8
 * SWAP           H             CB 34     8
 * SWAP           L             CB 35     8
 * SWAP           (HL)          CB 36     16
 */

function swap (cpu, n) {
    const r = n << 4 | n >> 4;

    cpu.f = 0;
    if ((r & 0xff) == 0) cpu.f |= FLAG_Z;

    return r;
}

const SWAP_n = (n) => function (cpu) {
    cpu[n] = swap(cpu, cpu[n]);
    cpu.pc += 2;

    return 8;
};

$cb[0x30] = ['SWAP B', SWAP_n('b')];
$cb[0x31] = ['SWAP C', SWAP_n('c')];
$cb[0x32] = ['SWAP D', SWAP_n('d')];
$cb[0x33] = ['SWAP E', SWAP_n('e')];
$cb[0x34] = ['SWAP H', SWAP_n('h')];
$cb[0x35] = ['SWAP L', SWAP_n('l')];
$cb[0x37] = ['SWAP A', SWAP_n('a')];

$cb[0x36] = ['SWAP (HL)', (cpu, mmu) => {
    const n = mmu.readByte(cpu.hl);
    mmu.writeByte(cpu.hl, swap(cpu, n));
    cpu.pc += 2;

    return 16;
}];

/**
 * DAA
 *
 * Description:
 * Decimal adjust register A.
 * This instruction adjusts register A so that the correct representation of
 * Binary Coded Decimal (BCD) is obtained.
 *
 * Flags affected:
 * Z - Set if register A is zero.
 * N - Not affected.
 * H - Reset.
 * C - Set or reset according to operation
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * DAA            - / -         27        4
 */

$[0x27] = ['DAA', (cpu) => {
    let r;
    let adjust = 0;

    if (cpu.f & FLAG_H) adjust |= 0x06;
    if (cpu.f & FLAG_C) adjust |= 0x60;

    if (cpu.f & FLAG_N) r = cpu.a - adjust;
    else {
        if ((cpu.a & 0xf) > 0x9) adjust |= 0x06;
        if (cpu.a > 0x99) adjust |= 0x60;
        r = cpu.a + adjust;
    }

    cpu.f &= ~0xb0;
    if ((r & 0xff) == 0) cpu.f |= FLAG_Z;
    if ((adjust & 0x60) != 0) cpu.f |= FLAG_C;

    cpu.a = r;
    cpu.pc += 1;

    return 4;
}];

/**
 * CPL
 *
 * Description:
 * Complement A register. (Flip all bits.)
 *
 * Flags affected:
 * Z - Not affected.
 * N - Set.
 * H - Set.
 * C - Not affected.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * CPL            - / -         2F        4
 */

$[0x2f] = ['CPL', (cpu) => {
    cpu.a ^= 0xff;
    cpu.f |= 0x60;

    cpu.pc += 1;

    return 4;
}];

/**
 * CCF
 *
 * Description:
 * Complement carry flag.
 * If C flag is set, then reset it.
 * If C flag is reset, then set it.
 *
 * Flags affected:
 * Z - Not affected.
 * N - Reset.
 * H - Reset.
 * C - Complemented.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * CFF            - / -         3F        4
 */

$[0x3f] = ['CCF', (cpu) => {
    cpu.f &= ~0x60;
    cpu.f ^= FLAG_C;

    cpu.pc += 1;

    return 4;
}];

/**
 * SCF
 *
 * Description:
 * Set Carry flag.
 *
 * Flags affected:
 * Z - Not affected.
 * N - Reset.
 * H - Reset.
 * C - Set.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * SCF            - / -         37        4
 */

$[0x37] = ['SCF', (cpu) => {
    cpu.f &= ~0x60;
    cpu.f |= FLAG_C;

    cpu.pc += 1;

    return 4;
}];

/**
 * NOP
 *
 * Description:
 * No operation.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * NOP            - / -         00        4
 */

$[0x00] = ['NOP', (cpu) => {
    cpu.pc += 1;

    return 4;
}];

/**
 * HALT
 *
 * Description:
 * Power down CPU until an interrupt occurs. Use this when ever possible to
 * reduce energy consumption.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * NOP            - / -         76        4
 */

$[0x76] = ['HALT', (cpu) => {
    cpu.pc += 1;

    return 4;
}];

/**
 * STOP
 *
 * Description:
 * Halt CPU & LCD display until button pressed.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * STOP           - / -         10 00     4
 */

$[0x10] = ['STOP', (cpu) => {
    cpu.pc += 2;

    return 4;
}];

/**
 * DI
 *
 * Description:
 * This instruction disables interrupts but not immediately. Interrupts
 * instruction after DI is executed.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * DI             - / -         F3        4
 */

$[0xf3] = ['DI', (cpu) => {
    cpu.ime = false;
    cpu.pc += 1;

    return 4;
}];

/**
 * EI
 *
 * Description:
 * Enable interrupts. This intruction enables interrupts but not immediately.
 * Interrupts are enabled after instruction after EI is executed.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * EI             - / -         FB        4
 */

$[0xfb] = ['EI', (cpu) => {
    cpu.ime = true;
    cpu.pc += 1;

    return 4;
}];

// Rotates & Shifts

/**
 * RLCA
 *
 * Description:
 * Rotate A left. Old bit 7 to Carry flag.
 *
 * Flags affected:
 * Z - Set if result is zero.
 * N - Reset.
 * H - Reset.
 * C - Contains old bit 7 data.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * RLCA           - / -         07        4
 */

$[0x07] = ['RLCA', (cpu) => {
    const cy = cpu.a >> 7;

    cpu.f = 0;
    if (cy != 0) cpu.f |= FLAG_C;

    cpu.a = cpu.a << 1 | cy;
    cpu.pc += 1;

    return 4;
}];

/**
 * RLA
 *
 * Description:
 * Rotate A left through Carry flag.
 *
 * Flags affected:
 * Z - Set if result is zero
 * N - Reset.
 * H - Reset.
 * C - Contains old bit 7 data.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * RLA            - / -          17        4
 */

$[0x17] = ['RLA', (cpu) => {
    const newcarry = cpu.a >> 7;
    const oldcarry = cpu.f >> 4 & 1;

    cpu.f = 0;
    if (newcarry != 0) cpu.f |= FLAG_C;

    cpu.a = cpu.a << 1 | oldcarry;
    cpu.pc += 1;

    return 4;
}];

/**
 * RRCA
 *
 * Description:
 * Rotate A right. Old bit 0 to Carry flag.
 *
 * Flags affected:
 * Z - Set if result is zero.
 * N - Reset.
 * H - Reset.
 * C - Contains old bit 0 data.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * RRCA           - / -         0F        4
 */

$[0x0f] = ['RRCA', (cpu) => {
    const cy = cpu.a & 1;

    cpu.f = 0;
    if (cy != 0) cpu.f |= FLAG_C;

    cpu.a = cpu.a >> 1 | cy << 7;
    cpu.pc += 1;

    return 4;
}];

/**
 * RRA
 *
 * Description:
 * Rotate A right through Carry flag.
 *
 * Flags affected:
 * Z - Set if result is zero.
 * N - Reset.
 * H - Reset.
 * C - Contains old bit 0 data.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * RRA            - / -         1F        4
 */

$[0x1f] = ['RRA', (cpu) => {
    const newcarry = cpu.a & 1;
    const oldcarry = cpu.f >> 4 & 1;

    cpu.f = 0;
    if (newcarry != 0) cpu.f |= FLAG_C;

    cpu.a = cpu.a >> 1 | oldcarry << 7;
    cpu.pc += 1;

    return 4;
}];

/**
 * RLC n
 *
 * Description
 * Rotate n left. Old bit 7 to Carry flag.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL)
 *
 * Flags affected:
 * Z - Set if result is zero.
 * N - Reset.
 * H - Reset.
 * C - Contains old bit 7 data.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * RLC            A             CB 07     8
 * RLC            B             CB 00     8
 * RLC            C             CB 01     8
 * RLC            D             CB 02     8
 * RLC            E             CB 03     8
 * RLC            H             CB 04     8
 * RLC            L             CB 05     8
 * RLC            (HL)          CB 06     16
 */

function rlc (cpu, n) {
    const r = n << 1 | n >> 7;

    cpu.f = 0;
    if ((r & 0xff) == 0) cpu.f |= FLAG_Z;
    if ((n & 0x80) != 0) cpu.f |= FLAG_C;

    return r;
}

const RLC_n = (n) => function (cpu) {
    cpu[n] = rlc(cpu, cpu[n]);
    cpu.pc += 2;

    return 8;
};

$cb[0x00] = ['RLC B', RLC_n('b')];
$cb[0x01] = ['RLC C', RLC_n('c')];
$cb[0x02] = ['RLC D', RLC_n('d')];
$cb[0x03] = ['RLC E', RLC_n('e')];
$cb[0x04] = ['RLC H', RLC_n('h')];
$cb[0x05] = ['RLC L', RLC_n('l')];
$cb[0x07] = ['RLC A', RLC_n('a')];

$cb[0x06] = ['RLC (HL)', (cpu, mmu) => {
    const n = mmu.readByte(cpu.hl);
    mmu.writeByte(cpu.hl, rlc(cpu, n));
    cpu.pc += 2;

    return 16;
}];

/**
 * RL n
 *
 * Description:
 * Rotate n left through Carry flag.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL)
 *
 * Flags affected:
 * Z - Set if result is zero.
 * N - Reset.
 * H - Reset.
 * C - Contains old bit 7 data.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * RL             A             CB 17     8
 * RL             B             CB 10     8
 * RL             C             CB 11     8
 * RL             D             CB 12     8
 * RL             E             CB 13     8
 * RL             H             CB 14     8
 * RL             L             CB 15     8
 * RL             (HL)          CB 16     16
 */

function rl (cpu, n) {
    const cy = cpu.f >> 4 & 1;
    const r = n << 1 | cy;

    cpu.f = 0;
    if ((r & 0xff) == 0) cpu.f |= FLAG_Z;
    if ((n & 0x80) != 0) cpu.f |= FLAG_C;

    return r;
}

const RL_n = (n) => function (cpu) {
    cpu[n] = rl(cpu, cpu[n]);
    cpu.pc += 2;

    return 8;
};

$cb[0x10] = ['RL B', RL_n('b')];
$cb[0x11] = ['RL C', RL_n('c')];
$cb[0x12] = ['RL D', RL_n('d')];
$cb[0x13] = ['RL E', RL_n('e')];
$cb[0x14] = ['RL H', RL_n('h')];
$cb[0x15] = ['RL L', RL_n('l')];
$cb[0x17] = ['RL A', RL_n('a')];

$cb[0x16] = ['RL (HL)', (cpu, mmu) => {
    const n = mmu.readByte(cpu.hl);
    mmu.writeByte(cpu.hl, rl(cpu, n));
    cpu.pc += 2;

    return 16;
}];

/**
 * RRC n
 *
 * Description:
 * Rotate n right. Old bit 0 to Carry flag.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL)
 *
 * Flags affected:
 * Z - Set if result is zero.
 * N - Reset.
 * H - Reset.
 * C - Contains old bit 0 data.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * RRC            A             CB 0F     8
 * RRC            B             CB 08     8
 * RRC            C             CB 09     8
 * RRC            D             CB 0A     8
 * RRC            E             CB 0B     8
 * RRC            H             CB 0C     8
 * RRC            L             CB 0D     8
 * RRC            (HL)          CB 0E     16
 */

function rrc (cpu, n) {
    const r = n >> 1 | n << 7;

    cpu.f = 0;
    if ((r & 0xff) == 0) cpu.f |= FLAG_Z;
    if ((n & 1) != 0) cpu.f |= FLAG_C;

    return r;
}

const RRC_n = (n) => function (cpu) {
    cpu[n] = rrc(cpu, cpu[n]);
    cpu.pc += 2;

    return 8;
};

$cb[0x08] = ['RRC B', RRC_n('b')];
$cb[0x09] = ['RRC C', RRC_n('c')];
$cb[0x0a] = ['RRC D', RRC_n('d')];
$cb[0x0b] = ['RRC E', RRC_n('e')];
$cb[0x0c] = ['RRC H', RRC_n('h')];
$cb[0x0d] = ['RRC L', RRC_n('l')];
$cb[0x0f] = ['RRC A', RRC_n('a')];

$cb[0x0e] = ['RRC (HL)', (cpu, mmu) => {
    const n = mmu.readByte(cpu.hl);
    mmu.writeByte(cpu.hl, rrc(cpu, n));
    cpu.pc += 2;

    return 16;
}];

/**
 * RR n
 *
 * Description:
 * Rotate n right through Carry flag.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL)
 *
 * Flags affected:
 * Z - Set if result is zero.
 * N - Reset.
 * H - Reset.
 * C - Contains old bit 0 data.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * RR             A             CB 1F     8
 * RR             B             CB 18     8
 * RR             C             CB 19     8
 * RR             D             CB 1A     8
 * RR             E             CB 1B     8
 * RR             H             CB 1C     8
 * RR             L             CB 1D     8
 * RR             (HL)          CB 1E     16
 */

function rr (cpu, n) {
    const cy = cpu.f >> 4 & 1;
    const r = cy << 7 | n >> 1;

    cpu.f = 0;
    if ((r & 0xff) == 0) cpu.f |= FLAG_Z;
    if ((n & 1) != 0) cpu.f |= FLAG_C;

    return r;
}

const RR_n = (n) => function (cpu) {
    cpu[n] = rr(cpu, cpu[n]);
    cpu.pc += 2;

    return 8;
};

$cb[0x18] = ['RR B', RR_n('b')];
$cb[0x19] = ['RR C', RR_n('c')];
$cb[0x1a] = ['RR D', RR_n('d')];
$cb[0x1b] = ['RR E', RR_n('e')];
$cb[0x1c] = ['RR H', RR_n('h')];
$cb[0x1d] = ['RR L', RR_n('l')];
$cb[0x1f] = ['RR A', RR_n('a')];

$cb[0x1e] = ['RR (HL)', function (cpu, mmu) {
    const n = mmu.readByte(cpu.hl);
    mmu.writeByte(cpu.hl, rr(cpu, n));
    cpu.pc += 2;

    return 16;
}];

/**
 * SLA n
 *
 * Description:
 * Shift n left into Carry. LSB of n set to 0.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL)
 *
 * Flags affected:
 * Z - Set if result is zero.
 * N - Reset.
 * H - Reset.
 * C - Contains old bit 7 data.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * SLA            A             CB 27     8
 * SLA            B             CB 20     8
 * SLA            C             CB 21     8
 * SLA            D             CB 22     8
 * SLA            E             CB 23     8
 * SLA            H             CB 24     8
 * SLA            L             CB 25     8
 * SLA            (HL)          CB 26     16
 */

function sla (cpu, n) {
    const r = n << 1;

    cpu.f = 0;
    if ((r & 0xff) == 0) cpu.f |= FLAG_Z;
    if ((n & 0x80) != 0) cpu.f |= FLAG_C;

    return r;
}

const SLA_n = (n) => function (cpu) {
    cpu[n] = sla(cpu, cpu[n]);
    cpu.pc += 2;

    return 8;
};

$cb[0x20] = ['SLA B', SLA_n('b')];
$cb[0x21] = ['SLA C', SLA_n('c')];
$cb[0x22] = ['SLA D', SLA_n('d')];
$cb[0x23] = ['SLA E', SLA_n('e')];
$cb[0x24] = ['SLA H', SLA_n('h')];
$cb[0x25] = ['SLA L', SLA_n('l')];
$cb[0x27] = ['SLA A', SLA_n('a')];

$cb[0x26] = ['SLA (HL)', (cpu, mmu) => {
    const n = mmu.readByte(cpu.hl);
    mmu.writeByte(cpu.hl, sla(cpu, n));
    cpu.pc += 2;

    return 16;
}];

/**
 * SRA n
 *
 * Description:
 * Shift n right into Carry. MSB doesn't change.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL)
 *
 * Flags affected:
 * Z - Set if result is zero.
 * N - Reset.
 * H - Reset.
 * C - Contains old bit 0 data.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * SRA            A             CB 2F     8
 * SRA            B             CB 28     8
 * SRA            C             CB 29     8
 * SRA            D             CB 2A     8
 * SRA            E             CB 2B     8
 * SRA            H             CB 2C     8
 * SRA            L             CB 2D     8
 * SRA            (HL)          CB 2E     16
 */

function sra (cpu, n) {
    const r = n & 0x80 | n >> 1;

    cpu.f = 0;
    if ((r & 0xff) == 0) cpu.f |= FLAG_Z;
    if ((n & 1) != 0) cpu.f |= FLAG_C;

    return r;
}

const SRA_n = (n) => function (cpu) {
    cpu[n] = sra(cpu, cpu[n]);
    cpu.pc += 2;

    return 8;
};

$cb[0x28] = ['SRA B', SRA_n('b')];
$cb[0x29] = ['SRA C', SRA_n('c')];
$cb[0x2a] = ['SRA D', SRA_n('d')];
$cb[0x2b] = ['SRA E', SRA_n('e')];
$cb[0x2c] = ['SRA H', SRA_n('h')];
$cb[0x2d] = ['SRA L', SRA_n('l')];
$cb[0x2f] = ['SRA A', SRA_n('a')];

$cb[0x2e] = ['SRA (HL)', (cpu, mmu) => {
    const n = mmu.readByte(cpu.hl);
    mmu.writeByte(cpu.hl, sra(cpu, n));
    cpu.pc += 2;

    return 16;
}];

/**
 * SRL n
 *
 * Description
 * Shift n right into Carry. MSB set to 0.
 *
 * Use with:
 * n = A, B, C, D, E, H, L, (HL)
 *
 * Flags affected:
 * Z - Set if result is zero.
 * N - Reset.
 * H - Reset.
 * C - Contains old bit 0 data.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * SRL            A             CB 3F     8
 * SRL            B             CB 38     8
 * SRL            C             CB 39     8
 * SRL            D             CB 3A     8
 * SRL            E             CB 3B     8
 * SRL            H             CB 3C     8
 * SRL            L             CB 3D     8
 * SRL            (HL)          CB 3E     16
 */

function srl (cpu, n) {
    const r = n >> 1;

    cpu.f = 0;
    if ((r & 0xff) == 0) cpu.f |= FLAG_Z;
    if ((n & 1) != 0) cpu.f |= FLAG_C;

    return r;
}

const SRL_n = (n) => function (cpu) {
    cpu[n] = srl(cpu, cpu[n]);
    cpu.pc += 2;

    return 8;
};

$cb[0x38] = ['SRL B', SRL_n('b')];
$cb[0x39] = ['SRL C', SRL_n('c')];
$cb[0x3a] = ['SRL D', SRL_n('d')];
$cb[0x3b] = ['SRL E', SRL_n('e')];
$cb[0x3c] = ['SRL H', SRL_n('h')];
$cb[0x3d] = ['SRL L', SRL_n('l')];
$cb[0x3f] = ['SRL A', SRL_n('a')];

$cb[0x3e] = ['SRL (HL)', (cpu, mmu) => {
    const n = mmu.readByte(cpu.hl);
    mmu.writeByte(cpu.hl, srl(cpu, n));
    cpu.pc += 2;

    return 16;
}];

// Bit Opcodes

/**
 * BIT b,r
 *
 * Description:
 * Test bit b in register r.
 *
 * Use with:
 * b = 0 - 7, r = A, B, C, D, E, H, L, (HL)
 *
 * Flags affected:
 * Z - Set if bit b of register r is 0.
 * N - Reset.
 * H - Set.
 * C - Not affected.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * BIT            b,A           CB 47     8
 * BIT            b,B           CB 40     8
 * BIT            b,C           CB 41     8
 * BIT            b,D           CB 42     8
 * BIT            b,E           CB 43     8
 * BIT            b,H           CB 44     8
 * BIT            b,L           CB 45     8
 * BIT            b,(HL)        CB 46     16
 */

function bit (cpu, b, n) {
    const r = n & (1 << b);

    cpu.f &= ~0xe0;
    if (r == 0) cpu.f |= FLAG_Z;
    cpu.f |= FLAG_H;

    return r;
}

const BIT_b_r = (b, r) => function (cpu) {
    bit(cpu, b, cpu[r]);
    cpu.pc += 2;

    return 8;
};

$cb[0x40] = ['BIT 0,B', BIT_b_r(0, 'b')];
$cb[0x41] = ['BIT 0,C', BIT_b_r(0, 'c')];
$cb[0x42] = ['BIT 0,D', BIT_b_r(0, 'd')];
$cb[0x43] = ['BIT 0,E', BIT_b_r(0, 'e')];
$cb[0x44] = ['BIT 0,H', BIT_b_r(0, 'h')];
$cb[0x45] = ['BIT 0,L', BIT_b_r(0, 'l')];
$cb[0x47] = ['BIT 0,A', BIT_b_r(0, 'a')];

$cb[0x48] = ['BIT 1,B', BIT_b_r(1, 'b')];
$cb[0x49] = ['BIT 1,C', BIT_b_r(1, 'c')];
$cb[0x4a] = ['BIT 1,D', BIT_b_r(1, 'd')];
$cb[0x4b] = ['BIT 1,E', BIT_b_r(1, 'e')];
$cb[0x4c] = ['BIT 1,H', BIT_b_r(1, 'h')];
$cb[0x4d] = ['BIT 1,L', BIT_b_r(1, 'l')];
$cb[0x4f] = ['BIT 1,A', BIT_b_r(1, 'a')];

$cb[0x50] = ['BIT 2,B', BIT_b_r(2, 'b')];
$cb[0x51] = ['BIT 2,C', BIT_b_r(2, 'c')];
$cb[0x52] = ['BIT 2,D', BIT_b_r(2, 'd')];
$cb[0x53] = ['BIT 2,E', BIT_b_r(2, 'e')];
$cb[0x54] = ['BIT 2,H', BIT_b_r(2, 'h')];
$cb[0x55] = ['BIT 2,L', BIT_b_r(2, 'l')];
$cb[0x57] = ['BIT 2,A', BIT_b_r(2, 'a')];

$cb[0x58] = ['BIT 3,B', BIT_b_r(3, 'b')];
$cb[0x59] = ['BIT 3,C', BIT_b_r(3, 'c')];
$cb[0x5a] = ['BIT 3,D', BIT_b_r(3, 'd')];
$cb[0x5b] = ['BIT 3,E', BIT_b_r(3, 'e')];
$cb[0x5c] = ['BIT 3,H', BIT_b_r(3, 'h')];
$cb[0x5d] = ['BIT 3,L', BIT_b_r(3, 'l')];
$cb[0x5f] = ['BIT 3,A', BIT_b_r(3, 'a')];

$cb[0x60] = ['BIT 4,B', BIT_b_r(4, 'b')];
$cb[0x61] = ['BIT 4,C', BIT_b_r(4, 'c')];
$cb[0x62] = ['BIT 4,D', BIT_b_r(4, 'd')];
$cb[0x63] = ['BIT 4,E', BIT_b_r(4, 'e')];
$cb[0x64] = ['BIT 4,H', BIT_b_r(4, 'h')];
$cb[0x65] = ['BIT 4,L', BIT_b_r(4, 'l')];
$cb[0x67] = ['BIT 4,A', BIT_b_r(4, 'a')];

$cb[0x68] = ['BIT 5,B', BIT_b_r(5, 'b')];
$cb[0x69] = ['BIT 5,C', BIT_b_r(5, 'c')];
$cb[0x6a] = ['BIT 5,D', BIT_b_r(5, 'd')];
$cb[0x6b] = ['BIT 5,E', BIT_b_r(5, 'e')];
$cb[0x6c] = ['BIT 5,H', BIT_b_r(5, 'h')];
$cb[0x6d] = ['BIT 5,L', BIT_b_r(5, 'l')];
$cb[0x6f] = ['BIT 5,A', BIT_b_r(5, 'a')];

$cb[0x70] = ['BIT 6,B', BIT_b_r(6, 'b')];
$cb[0x71] = ['BIT 6,C', BIT_b_r(6, 'c')];
$cb[0x72] = ['BIT 6,D', BIT_b_r(6, 'd')];
$cb[0x73] = ['BIT 6,E', BIT_b_r(6, 'e')];
$cb[0x74] = ['BIT 6,H', BIT_b_r(6, 'h')];
$cb[0x75] = ['BIT 6,L', BIT_b_r(6, 'l')];
$cb[0x77] = ['BIT 6,A', BIT_b_r(6, 'a')];

$cb[0x78] = ['BIT 7,B', BIT_b_r(7, 'b')];
$cb[0x79] = ['BIT 7,C', BIT_b_r(7, 'c')];
$cb[0x7a] = ['BIT 7,D', BIT_b_r(7, 'd')];
$cb[0x7b] = ['BIT 7,E', BIT_b_r(7, 'e')];
$cb[0x7c] = ['BIT 7,H', BIT_b_r(7, 'h')];
$cb[0x7d] = ['BIT 7,L', BIT_b_r(7, 'l')];
$cb[0x7f] = ['BIT 7,A', BIT_b_r(7, 'a')];

const BIT_b_$HL = (b) => function (cpu, mmu) {
    bit(cpu, b, mmu.readByte(cpu.hl));
    cpu.pc += 2;

    return 16;
};

$cb[0x46] = ['BIT 0,(HL)', BIT_b_$HL(0)];
$cb[0x4e] = ['BIT 1,(HL)', BIT_b_$HL(1)];
$cb[0x56] = ['BIT 2,(HL)', BIT_b_$HL(2)];
$cb[0x5e] = ['BIT 3,(HL)', BIT_b_$HL(3)];
$cb[0x66] = ['BIT 4,(HL)', BIT_b_$HL(4)];
$cb[0x6e] = ['BIT 5,(HL)', BIT_b_$HL(5)];
$cb[0x76] = ['BIT 6,(HL)', BIT_b_$HL(6)];
$cb[0x7e] = ['BIT 7,(HL)', BIT_b_$HL(7)];

/**
 * SET b,r
 *
 * Description:
 * Set bit b in register r.
 *
 * Use with:
 * b = 0 - 7, r = A, B, C, D, E, H, L, (HL)
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * SET            b,A           CB C7     8
 * SET            b,B           CB C0     8
 * SET            b,C           CB C1     8
 * SET            b,D           CB C2     8
 * SET            b,E           CB C3     8
 * SET            b,H           CB C4     8
 * SET            b,L           CB C5     8
 * SET            b,(HL)        CB C6     16
 */

const SET_b_r = (b, r) => function (cpu) {
    cpu[r] |= 1 << b;
    cpu.pc += 2;

    return 8;
};

$cb[0xc0] = ['SET 0,B', SET_b_r(0, 'b')];
$cb[0xc1] = ['SET 0,C', SET_b_r(0, 'c')];
$cb[0xc2] = ['SET 0,D', SET_b_r(0, 'd')];
$cb[0xc3] = ['SET 0,E', SET_b_r(0, 'e')];
$cb[0xc4] = ['SET 0,H', SET_b_r(0, 'h')];
$cb[0xc5] = ['SET 0,L', SET_b_r(0, 'l')];
$cb[0xc7] = ['SET 0,A', SET_b_r(0, 'a')];

$cb[0xc8] = ['SET 1,B', SET_b_r(1, 'b')];
$cb[0xc9] = ['SET 1,C', SET_b_r(1, 'c')];
$cb[0xca] = ['SET 1,D', SET_b_r(1, 'd')];
$cb[0xcb] = ['SET 1,E', SET_b_r(1, 'e')];
$cb[0xcc] = ['SET 1,H', SET_b_r(1, 'h')];
$cb[0xcd] = ['SET 1,L', SET_b_r(1, 'l')];
$cb[0xcf] = ['SET 1,A', SET_b_r(1, 'a')];

$cb[0xd0] = ['SET 2,B', SET_b_r(2, 'b')];
$cb[0xd1] = ['SET 2,C', SET_b_r(2, 'c')];
$cb[0xd2] = ['SET 2,D', SET_b_r(2, 'd')];
$cb[0xd3] = ['SET 2,E', SET_b_r(2, 'e')];
$cb[0xd4] = ['SET 2,H', SET_b_r(2, 'h')];
$cb[0xd5] = ['SET 2,L', SET_b_r(2, 'l')];
$cb[0xd7] = ['SET 2,A', SET_b_r(2, 'a')];

$cb[0xd8] = ['SET 3,B', SET_b_r(3, 'b')];
$cb[0xd9] = ['SET 3,C', SET_b_r(3, 'c')];
$cb[0xda] = ['SET 3,D', SET_b_r(3, 'd')];
$cb[0xdb] = ['SET 3,E', SET_b_r(3, 'e')];
$cb[0xdc] = ['SET 3,H', SET_b_r(3, 'h')];
$cb[0xdd] = ['SET 3,L', SET_b_r(3, 'l')];
$cb[0xdf] = ['SET 3,A', SET_b_r(3, 'a')];

$cb[0xe0] = ['SET 4,B', SET_b_r(4, 'b')];
$cb[0xe1] = ['SET 4,C', SET_b_r(4, 'c')];
$cb[0xe2] = ['SET 4,D', SET_b_r(4, 'd')];
$cb[0xe3] = ['SET 4,E', SET_b_r(4, 'e')];
$cb[0xe4] = ['SET 4,H', SET_b_r(4, 'h')];
$cb[0xe5] = ['SET 4,L', SET_b_r(4, 'l')];
$cb[0xe7] = ['SET 4,A', SET_b_r(4, 'a')];

$cb[0xe8] = ['SET 5,B', SET_b_r(5, 'b')];
$cb[0xe9] = ['SET 5,C', SET_b_r(5, 'c')];
$cb[0xea] = ['SET 5,D', SET_b_r(5, 'd')];
$cb[0xeb] = ['SET 5,E', SET_b_r(5, 'e')];
$cb[0xec] = ['SET 5,H', SET_b_r(5, 'h')];
$cb[0xed] = ['SET 5,L', SET_b_r(5, 'l')];
$cb[0xef] = ['SET 5,A', SET_b_r(5, 'a')];

$cb[0xf0] = ['SET 6,B', SET_b_r(6, 'b')];
$cb[0xf1] = ['SET 6,C', SET_b_r(6, 'c')];
$cb[0xf2] = ['SET 6,D', SET_b_r(6, 'd')];
$cb[0xf3] = ['SET 6,E', SET_b_r(6, 'e')];
$cb[0xf4] = ['SET 6,H', SET_b_r(6, 'h')];
$cb[0xf5] = ['SET 6,L', SET_b_r(6, 'l')];
$cb[0xf7] = ['SET 6,A', SET_b_r(6, 'a')];

$cb[0xf8] = ['SET 7,B', SET_b_r(7, 'b')];
$cb[0xf9] = ['SET 7,C', SET_b_r(7, 'c')];
$cb[0xfa] = ['SET 7,D', SET_b_r(7, 'd')];
$cb[0xfb] = ['SET 7,E', SET_b_r(7, 'e')];
$cb[0xfc] = ['SET 7,H', SET_b_r(7, 'h')];
$cb[0xfd] = ['SET 7,L', SET_b_r(7, 'l')];
$cb[0xff] = ['SET 7,A', SET_b_r(7, 'a')];

const SET_b_$HL = (b) => function (cpu, mmu) {
    mmu.writeByte(cpu.hl, mmu.readByte(cpu.hl) | (1 << b));
    cpu.pc += 2;

    return 16;
};

$cb[0xc6] = ['SET 0,(HL)', SET_b_$HL(0)];
$cb[0xce] = ['SET 1,(HL)', SET_b_$HL(1)];
$cb[0xd6] = ['SET 2,(HL)', SET_b_$HL(2)];
$cb[0xde] = ['SET 3,(HL)', SET_b_$HL(3)];
$cb[0xe6] = ['SET 4,(HL)', SET_b_$HL(4)];
$cb[0xee] = ['SET 5,(HL)', SET_b_$HL(5)];
$cb[0xf6] = ['SET 6,(HL)', SET_b_$HL(6)];
$cb[0xfe] = ['SET 7,(HL)', SET_b_$HL(7)];

/**
 * RES b,r
 *
 * Description:
 * Reset bit b in register r.
 *
 * Use with:
 * b = 0 - 7, r = A, B, C, D, E, H, L, (HL)
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * RES            b,A           CB 87     8
 * RES            b,B           CB 80     8
 * RES            b,C           CB 81     8
 * RES            b,D           CB 82     8
 * RES            b,E           CB 83     8
 * RES            b,H           CB 84     8
 * RES            b,L           CB 85     8
 * RES            b,(HL)        CB 86     16
 */

const RES_b_r = (b, r) => function (cpu) {
    cpu[r] &= ~(1 << b);
    cpu.pc += 2;

    return 8;
};

$cb[0x80] = ['RES 0,B', RES_b_r(0, 'b')];
$cb[0x81] = ['RES 0,C', RES_b_r(0, 'c')];
$cb[0x82] = ['RES 0,D', RES_b_r(0, 'd')];
$cb[0x83] = ['RES 0,E', RES_b_r(0, 'e')];
$cb[0x84] = ['RES 0,H', RES_b_r(0, 'h')];
$cb[0x85] = ['RES 0,L', RES_b_r(0, 'l')];
$cb[0x87] = ['RES 0,A', RES_b_r(0, 'a')];

$cb[0x88] = ['RES 1,B', RES_b_r(1, 'b')];
$cb[0x89] = ['RES 1,C', RES_b_r(1, 'c')];
$cb[0x8a] = ['RES 1,D', RES_b_r(1, 'd')];
$cb[0x8b] = ['RES 1,E', RES_b_r(1, 'e')];
$cb[0x8c] = ['RES 1,H', RES_b_r(1, 'h')];
$cb[0x8d] = ['RES 1,L', RES_b_r(1, 'l')];
$cb[0x8f] = ['RES 1,A', RES_b_r(1, 'a')];

$cb[0x90] = ['RES 2,B', RES_b_r(2, 'b')];
$cb[0x91] = ['RES 2,C', RES_b_r(2, 'c')];
$cb[0x92] = ['RES 2,D', RES_b_r(2, 'd')];
$cb[0x93] = ['RES 2,E', RES_b_r(2, 'e')];
$cb[0x94] = ['RES 2,H', RES_b_r(2, 'h')];
$cb[0x95] = ['RES 2,L', RES_b_r(2, 'l')];
$cb[0x97] = ['RES 2,A', RES_b_r(2, 'a')];

$cb[0x98] = ['RES 3,B', RES_b_r(3, 'b')];
$cb[0x99] = ['RES 3,C', RES_b_r(3, 'c')];
$cb[0x9a] = ['RES 3,D', RES_b_r(3, 'd')];
$cb[0x9b] = ['RES 3,E', RES_b_r(3, 'e')];
$cb[0x9c] = ['RES 3,H', RES_b_r(3, 'h')];
$cb[0x9d] = ['RES 3,L', RES_b_r(3, 'l')];
$cb[0x9f] = ['RES 3,A', RES_b_r(3, 'a')];

$cb[0xa0] = ['RES 4,B', RES_b_r(4, 'b')];
$cb[0xa1] = ['RES 4,C', RES_b_r(4, 'c')];
$cb[0xa2] = ['RES 4,D', RES_b_r(4, 'd')];
$cb[0xa3] = ['RES 4,E', RES_b_r(4, 'e')];
$cb[0xa4] = ['RES 4,H', RES_b_r(4, 'h')];
$cb[0xa5] = ['RES 4,L', RES_b_r(4, 'l')];
$cb[0xa7] = ['RES 4,A', RES_b_r(4, 'a')];

$cb[0xa8] = ['RES 5,B', RES_b_r(5, 'b')];
$cb[0xa9] = ['RES 5,C', RES_b_r(5, 'c')];
$cb[0xaa] = ['RES 5,D', RES_b_r(5, 'd')];
$cb[0xab] = ['RES 5,E', RES_b_r(5, 'e')];
$cb[0xac] = ['RES 5,H', RES_b_r(5, 'h')];
$cb[0xad] = ['RES 5,L', RES_b_r(5, 'l')];
$cb[0xaf] = ['RES 5,A', RES_b_r(5, 'a')];

$cb[0xb0] = ['RES 6,B', RES_b_r(6, 'b')];
$cb[0xb1] = ['RES 6,C', RES_b_r(6, 'c')];
$cb[0xb2] = ['RES 6,D', RES_b_r(6, 'd')];
$cb[0xb3] = ['RES 6,E', RES_b_r(6, 'e')];
$cb[0xb4] = ['RES 6,H', RES_b_r(6, 'h')];
$cb[0xb5] = ['RES 6,L', RES_b_r(6, 'l')];
$cb[0xb7] = ['RES 6,A', RES_b_r(6, 'a')];

$cb[0xb8] = ['RES 7,B', RES_b_r(7, 'b')];
$cb[0xb9] = ['RES 7,C', RES_b_r(7, 'c')];
$cb[0xba] = ['RES 7,D', RES_b_r(7, 'd')];
$cb[0xbb] = ['RES 7,E', RES_b_r(7, 'e')];
$cb[0xbc] = ['RES 7,H', RES_b_r(7, 'h')];
$cb[0xbd] = ['RES 7,L', RES_b_r(7, 'l')];
$cb[0xbf] = ['RES 7,A', RES_b_r(7, 'a')];

const RES_b_$HL = (b) => function (cpu, mmu) {
    mmu.writeByte(cpu.hl, mmu.readByte(cpu.hl) & ~(1 << b));
    cpu.pc += 2;

    return 16;
};

$cb[0x86] = ['RES 0,(HL)', RES_b_$HL(0)];
$cb[0x8e] = ['RES 1,(HL)', RES_b_$HL(1)];
$cb[0x96] = ['RES 2,(HL)', RES_b_$HL(2)];
$cb[0x9e] = ['RES 3,(HL)', RES_b_$HL(3)];
$cb[0xa6] = ['RES 4,(HL)', RES_b_$HL(4)];
$cb[0xae] = ['RES 5,(HL)', RES_b_$HL(5)];
$cb[0xb6] = ['RES 6,(HL)', RES_b_$HL(6)];
$cb[0xbe] = ['RES 7,(HL)', RES_b_$HL(7)];

// Jumps

/**
 * JP nn
 *
 * Description:
 * Jump to address nn.
 *
 * Use with:
 * nn = two byte immediate value. (LS byte first.)
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * JP             nn            C3        12
 */

$[0xc3] = ['JP nn', (cpu, mmu) => {
    cpu.pc = mmu.readWord(cpu.pc + 1);

    return 16;
}];

/**
 * JP cc,nn
 *
 * Description:
 * Jump to address n if following condition is true:
 * cc = NZ, Jump if Z flag is reset.
 * cc = Z, Jump if Z flag is set.
 * cc = NC, Jump if C flag is reset.
 * cc = C, Jump if C flag is set.
 *
 * Use with:
 * nn = two byte immediate value. (LS byte first.)
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * JP             NZ,nn         C2        12
 * JP             Z,nn          CA        12
 * JP             NC,nn         D2        12
 * JP             C,nn          DA        12
 */

const JP_cc_nn = function (cpu, mmu, cc) {
    if (cc) {
        cpu.pc = mmu.readWord(cpu.pc + 1);
        return 16;
    }
    cpu.pc += 3;

    return 12;
};

$[0xc2] = ['JP NZ,nn', (cpu, mmu) => JP_cc_nn(cpu, mmu, !(cpu.f & FLAG_Z))];
$[0xd2] = ['JP NC,nn', (cpu, mmu) => JP_cc_nn(cpu, mmu, !(cpu.f & FLAG_C))];

$[0xca] = ['JP Z,nn', (cpu, mmu) => JP_cc_nn(cpu, mmu, cpu.f & FLAG_Z)];
$[0xda] = ['JP C,nn', (cpu, mmu) => JP_cc_nn(cpu, mmu, cpu.f & FLAG_C)];

/**
 * JP (HL)
 *
 * Description:
 * Jump to address contained in HL.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * JP             (HL)          E9        4
 */

$[0xe9] = ['JP (HL)', (cpu) => {
    cpu.pc = cpu.hl;

    return 4;
}];

/**
 * JR n
 *
 * Description:
 * Add n to current address and jump to it.
 *
 * Use with:
 * n = one byte signed immediate value
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * JR             n             18        8
 */

$[0x18] = ['JR n', (cpu, mmu) => {
    cpu.pc += 2 + mmu.readByte(cpu.pc + 1).signed();

    return 12;
}];

/**
 * JR cc,n
 *
 * Description:
 * If following condition is true then add n address and jump to it:
 *
 * Use with:
 * n = one byte signed immediate value
 * cc = NZ, Jump if Z flag is reset.
 * cc = Z, Jump if Z flag is set.
 * cc = NC, Jump if C flag is reset.
 * cc = C, Jump if C flag is set.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * JR             NZ,*          20        8
 * JR             Z,*           28        8
 * JR             NC,*          30        8
 * JR             C,*           38        8
 */

const JR_cc_n = function (cpu, mmu, cc) {
    if (cc) {
        cpu.pc += 2 + mmu.readByte(cpu.pc + 1).signed();
        return 12;
    }
    cpu.pc += 2;

    return 8;
};

$[0x20] = ['JR NZ,n', (cpu, mmu) => JR_cc_n(cpu, mmu, !(cpu.f & FLAG_Z))];
$[0x30] = ['JR NC,n', (cpu, mmu) => JR_cc_n(cpu, mmu, !(cpu.f & FLAG_C))];

$[0x28] = ['JR Z,n', (cpu, mmu) => JR_cc_n(cpu, mmu, cpu.f & FLAG_Z)];
$[0x38] = ['JR C,n', (cpu, mmu) => JR_cc_n(cpu, mmu, cpu.f & FLAG_C)];


// Calls

/**
 * CALL nn
 *
 * Description:
 * Push address of next instruction onto stack and then jump to address nn.
 *
 * Use with:
 * nn = two byte immediate value. (LS byte first.)
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * CALL           nn            CD        12
 */

$[0xcd] = ['CALL nn', (cpu, mmu) => {
    mmu.writeWord(cpu.sp -= 2, cpu.pc + 3);
    cpu.pc = mmu.readWord(cpu.pc + 1);

    return 24;
}];

/**
 * CALL cc,nn
 *
 * Description:
 * Call address n if following condition is true:
 * cc = NZ, Call if Z flag is reset.
 * cc = Z, Call if Z flag is set.
 * cc = NC, Call if C flag is reset.
 * cc = C, Call if C flag is set.
 *
 * Use with:
 * nn = two byte immediate value. (LS byte first.)
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * CALL           NZ,nn         C4        12
 * CALL           Z,nn          CC        12
 * CALL           NC,nn         D4        12
 * CALL           C,nn          DC        12
 */

const CALL_cc_nn = function (cpu, mmu, cc) {
    if (cc) {
        mmu.writeWord(cpu.sp -= 2, cpu.pc + 3);
        cpu.pc = mmu.readWord(cpu.pc + 1);

        return 24;
    }
    cpu.pc += 3;

    return 12;
};

$[0xc4] = ['CALL NZ,nn', (cpu, mmu) => CALL_cc_nn(cpu, mmu, !(cpu.f & FLAG_Z))];
$[0xd4] = ['CALL NC,nn', (cpu, mmu) => CALL_cc_nn(cpu, mmu, !(cpu.f & FLAG_C))];

$[0xcc] = ['CALL Z,nn', (cpu, mmu) => CALL_cc_nn(cpu, mmu, cpu.f & FLAG_Z)];
$[0xdc] = ['CALL C,nn', (cpu, mmu) => CALL_cc_nn(cpu, mmu, cpu.f & FLAG_C)];

// Restarts

/**
 * RST n
 *
 * Description:
 * Push present address onto stack. Jump to address $0000 + n.
 *
 * Use with:
 * n = $00, $08, $10, $18, $20, $28, $30, $38
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * RST            00H           C7        32
 * RST            08H           CF        32
 * RST            10H           D7        32
 * RST            08H           DF        32
 * RST            20H           E7        32
 * RST            28H           EF        32
 * RST            30H           F7        32
 * RST            38H           FF        32
 */

const RST_n = (n) => function (cpu, mmu) {
    mmu.writeWord(cpu.sp -= 2, cpu.pc + 1);
    cpu.pc = n;

    return 16;
};

$[0xc7] = ['RST 00H', RST_n(0x00)];
$[0xcf] = ['RST 08H', RST_n(0x08)];
$[0xd7] = ['RST 10H', RST_n(0x10)];
$[0xdf] = ['RST 18H', RST_n(0x18)];
$[0xe7] = ['RST 20H', RST_n(0x20)];
$[0xef] = ['RST 28H', RST_n(0x28)];
$[0xf7] = ['RST 30H', RST_n(0x30)];
$[0xff] = ['RST 38H', RST_n(0x38)];

// Returns

/**
 * RET
 *
 * Description:
 * Pop two bytes from stack & jump to that address.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * RET            - / -         C9        8
 */

$[0xc9] = ['RET', (cpu, mmu) => {
    cpu.pc = mmu.readWord(cpu.sp);
    cpu.sp += 2;

    return 16;
}];

/**
 * RET cc
 *
 * Description:
 * Return if following condition is true:
 *
 * Use with:
 * cc = NZ, Return if Z flag is reset.
 * cc = Z, Return if Z flag is set.
 * cc = NC, Return if C flag is reset.
 * cc = C, Return if C flag is set.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * RET            NZ            C0        8
 * RET            Z             C8        8
 * RET            NC            D0        8
 * RET            C             D8        8
 */

const RET_cc = function (cpu, mmu, cc) {
    if (cc) {
        cpu.pc = mmu.readWord(cpu.sp);
        cpu.sp += 2;

        return 20;
    }
    cpu.pc += 1;

    return 8;
};

$[0xc0] = ['RET NZ', (cpu, mmu) => RET_cc(cpu, mmu, !(cpu.f & FLAG_Z))];
$[0xd0] = ['RET NC', (cpu, mmu) => RET_cc(cpu, mmu, !(cpu.f & FLAG_C))];

$[0xc8] = ['RET Z', (cpu, mmu) => RET_cc(cpu, mmu, cpu.f & FLAG_Z)];
$[0xd8] = ['RET C', (cpu, mmu) => RET_cc(cpu, mmu, cpu.f & FLAG_C)];

/**
 * RETI
 *
 * Description:
 * Pop two bytes from stack & jump to that address then enable interrupts.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * RETI           - / -         D9        8
 */

$[0xd9] = ['RETI', (cpu, mmu) => {
    cpu.pc = mmu.readWord(cpu.sp);
    cpu.sp += 2;
    cpu.ime = true;

    return 16;
}];
