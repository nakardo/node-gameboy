'use strict';

const $ = exports.$ = new Array(0x100);
const $cb = $[0xcb] = new Array(0x100);

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

const LD_nn_n = (nn, cpu, mmu) => {
    cpu[nn] = mmu.readByte(cpu.pc + 1);
    cpu.pc += 2;

    return 8;
};

$[0x06] = ['LD B,n', (...args) => LD_nn_n('b', ...args)];
$[0x0e] = ['LD C,n', (...args) => LD_nn_n('c', ...args)];
$[0x16] = ['LD D,n', (...args) => LD_nn_n('d', ...args)];
$[0x1e] = ['LD E,n', (...args) => LD_nn_n('e', ...args)];
$[0x26] = ['LD H,n', (...args) => LD_nn_n('h', ...args)];
$[0x2e] = ['LD L,n', (...args) => LD_nn_n('l', ...args)];

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

const LD_r1_r2 = (r1, r2, cpu) => {
    cpu[r1] = cpu[r2];
    cpu.pc += 1;

    return 4;
};

$[0x7f] = ['LD A,A', (...args) => LD_r1_r2('a', 'a', ...args)];
$[0x78] = ['LD A,B', (...args) => LD_r1_r2('a', 'b', ...args)];
$[0x79] = ['LD A,C', (...args) => LD_r1_r2('a', 'c', ...args)];
$[0x7a] = ['LD A,D', (...args) => LD_r1_r2('a', 'd', ...args)];
$[0x7b] = ['LD A,E', (...args) => LD_r1_r2('a', 'e', ...args)];
$[0x7c] = ['LD A,H', (...args) => LD_r1_r2('a', 'h', ...args)];
$[0x7d] = ['LD A,L', (...args) => LD_r1_r2('a', 'l', ...args)];
$[0x40] = ['LD B,B', (...args) => LD_r1_r2('b', 'b', ...args)];
$[0x41] = ['LD B,C', (...args) => LD_r1_r2('b', 'c', ...args)];
$[0x42] = ['LD B,D', (...args) => LD_r1_r2('b', 'd', ...args)];
$[0x43] = ['LD B,E', (...args) => LD_r1_r2('b', 'e', ...args)];
$[0x44] = ['LD B,H', (...args) => LD_r1_r2('b', 'h', ...args)];
$[0x45] = ['LD B,L', (...args) => LD_r1_r2('b', 'l', ...args)];
$[0x48] = ['LD C,B', (...args) => LD_r1_r2('c', 'b', ...args)];
$[0x49] = ['LD C,C', (...args) => LD_r1_r2('c', 'c', ...args)];
$[0x4a] = ['LD C,D', (...args) => LD_r1_r2('c', 'd', ...args)];
$[0x4b] = ['LD C,E', (...args) => LD_r1_r2('c', 'e', ...args)];
$[0x4c] = ['LD C,H', (...args) => LD_r1_r2('c', 'h', ...args)];
$[0x4d] = ['LD C,L', (...args) => LD_r1_r2('c', 'l', ...args)];
$[0x50] = ['LD D,B', (...args) => LD_r1_r2('d', 'b', ...args)];
$[0x51] = ['LD D,C', (...args) => LD_r1_r2('d', 'c', ...args)];
$[0x52] = ['LD D,D', (...args) => LD_r1_r2('d', 'd', ...args)];
$[0x53] = ['LD D,E', (...args) => LD_r1_r2('d', 'e', ...args)];
$[0x54] = ['LD D,H', (...args) => LD_r1_r2('d', 'h', ...args)];
$[0x55] = ['LD D,L', (...args) => LD_r1_r2('d', 'l', ...args)];
$[0x58] = ['LD E,B', (...args) => LD_r1_r2('e', 'b', ...args)];
$[0x59] = ['LD E,C', (...args) => LD_r1_r2('e', 'c', ...args)];
$[0x5a] = ['LD E,D', (...args) => LD_r1_r2('e', 'd', ...args)];
$[0x5b] = ['LD E,E', (...args) => LD_r1_r2('e', 'e', ...args)];
$[0x5c] = ['LD E,H', (...args) => LD_r1_r2('e', 'h', ...args)];
$[0x5d] = ['LD E,L', (...args) => LD_r1_r2('e', 'l', ...args)];
$[0x60] = ['LD H,B', (...args) => LD_r1_r2('h', 'b', ...args)];
$[0x61] = ['LD H,C', (...args) => LD_r1_r2('h', 'c', ...args)];
$[0x62] = ['LD H,D', (...args) => LD_r1_r2('h', 'd', ...args)];
$[0x63] = ['LD H,E', (...args) => LD_r1_r2('h', 'e', ...args)];
$[0x64] = ['LD H,H', (...args) => LD_r1_r2('h', 'h', ...args)];
$[0x65] = ['LD H,L', (...args) => LD_r1_r2('h', 'l', ...args)];
$[0x68] = ['LD L,B', (...args) => LD_r1_r2('l', 'b', ...args)];
$[0x69] = ['LD L,C', (...args) => LD_r1_r2('l', 'c', ...args)];
$[0x6a] = ['LD L,D', (...args) => LD_r1_r2('l', 'd', ...args)];
$[0x6b] = ['LD L,E', (...args) => LD_r1_r2('l', 'e', ...args)];
$[0x6c] = ['LD L,H', (...args) => LD_r1_r2('l', 'h', ...args)];
$[0x6d] = ['LD L,L', (...args) => LD_r1_r2('l', 'l', ...args)];

const LD_r_$hl = (r, cpu, mmu) => {
    cpu[r] = mmu.readByte(cpu.hl);
    cpu.pc += 1;

    return 8;
};

$[0x7e] = ['LD A,(HL)', (...args) => LD_r_$hl('a', ...args)];
$[0x46] = ['LD B,(HL)', (...args) => LD_r_$hl('b', ...args)];
$[0x4e] = ['LD C,(HL)', (...args) => LD_r_$hl('c', ...args)];
$[0x56] = ['LD D,(HL)', (...args) => LD_r_$hl('d', ...args)];
$[0x5e] = ['LD E,(HL)', (...args) => LD_r_$hl('e', ...args)];
$[0x66] = ['LD H,(HL)', (...args) => LD_r_$hl('h', ...args)];
$[0x6e] = ['LD L,(HL)', (...args) => LD_r_$hl('l', ...args)];

const LD_$hl_r = (r, cpu, mmu) => {
    mmu.writeByte(cpu.hl, cpu[r]);
    cpu.pc += 1;

    return 8;
};

$[0x70] = ['LD (HL),B', (...args) => LD_$hl_r('b', ...args)];
$[0x71] = ['LD (HL),C', (...args) => LD_$hl_r('c', ...args)];
$[0x72] = ['LD (HL),D', (...args) => LD_$hl_r('d', ...args)];
$[0x73] = ['LD (HL),E', (...args) => LD_$hl_r('e', ...args)];
$[0x74] = ['LD (HL),H', (...args) => LD_$hl_r('h', ...args)];
$[0x75] = ['LD (HL),L', (...args) => LD_$hl_r('l', ...args)];

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

const LD_A_n = (n, cpu) => {
    cpu.a = cpu[n];
    cpu.pc += 1;

    return 4;
};

$[0x7f] = ['LD A,A', (...args) => LD_A_n('a', ...args)];
$[0x78] = ['LD A,B', (...args) => LD_A_n('b', ...args)];
$[0x79] = ['LD A,C', (...args) => LD_A_n('c', ...args)];
$[0x7a] = ['LD A,D', (...args) => LD_A_n('d', ...args)];
$[0x7b] = ['LD A,E', (...args) => LD_A_n('e', ...args)];
$[0x7c] = ['LD A,H', (...args) => LD_A_n('h', ...args)];
$[0x7d] = ['LD A,L', (...args) => LD_A_n('l', ...args)];

const LD_A_$n = (n, cpu, mmu) => {
    cpu.a = mmu.readByte(cpu[n]);
    cpu.pc += 1;

    return 8;
};

$[0x0a] = ['LD A,(BC)', (...args) => LD_A_$n('bc', ...args)];
$[0x1a] = ['LD A,(DE)', (...args) => LD_A_$n('de', ...args)];
$[0x7e] = ['LD A,(HL)', (...args) => LD_A_$n('hl', ...args)];

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

const LD_n_A = (n, cpu) => {
    cpu[n] = cpu.a;
    cpu.pc += 1;

    return 4;
};

$[0x7f] = ['LD A,A', (...args) => LD_n_A('a', ...args)];
$[0x47] = ['LD B,A', (...args) => LD_n_A('b', ...args)];
$[0x4f] = ['LD C,A', (...args) => LD_n_A('c', ...args)];
$[0x57] = ['LD D,A', (...args) => LD_n_A('d', ...args)];
$[0x5f] = ['LD E,A', (...args) => LD_n_A('e', ...args)];
$[0x67] = ['LD H,A', (...args) => LD_n_A('h', ...args)];
$[0x6f] = ['LD L,A', (...args) => LD_n_A('l', ...args)];

const LD_$n_A = (n, cpu, mmu) => {
    mmu.writeByte(cpu[n], cpu.a);
    cpu.pc += 1;

    return 8;
};

$[0x02] = ['LD (BC),A', (...args) => LD_$n_A('bc', ...args)];
$[0x12] = ['LD (DE),A', (...args) => LD_$n_A('de', ...args)];
$[0x77] = ['LD (HL),A', (...args) => LD_$n_A('hl', ...args)];

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

$[0xfa] = ['LD A,(C)', (cpu, mmu) => {
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
    mmu.writeWord(cpu.hl++, cpu.a);
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
    mmu.writeByte(0xff00 + mmu.readByte(cpu.pc + 1), cpu.a);
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
    cpu.a = mmu.readByte(0xff00 + mmu.readByte(cpu.pc + 1));
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

const LD_n_nn = (n, cpu, mmu) => {
    cpu[n] = mmu.readWord(cpu.pc + 1);
    cpu.pc += 3;

    return 12;
};

$[0x01] = ['LD BC,nn', (...args) => LD_n_nn('bc', ...args)];
$[0x11] = ['LD DE,nn', (...args) => LD_n_nn('de', ...args)];
$[0x21] = ['LD HL,nn', (...args) => LD_n_nn('hl', ...args)];
$[0x31] = ['LD SP,nn', (...args) => LD_n_nn('sp', ...args)];

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

$[0xf8] = ['LD HL,SP+n', (cpu, mmu) => {
    const v = mmu.readByte(cpu.pc + 1);
    const offset = v & 0x80 ? -((0xff & ~v) + 1) : v;
    cpu.hl = cpu.sp + offset;
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

const PUSH_nn = (nn, cpu, mmu) => {
    mmu.writeWord(cpu.sp -= 2, cpu[nn]);
    cpu.pc += 1;

    return 16;
};

$[0xf5] = ['PUSH AF', (...args) => PUSH_nn('af', ...args)];
$[0xc5] = ['PUSH BC', (...args) => PUSH_nn('bc', ...args)];
$[0xd5] = ['PUSH DE', (...args) => PUSH_nn('de', ...args)];
$[0xe5] = ['PUSH HL', (...args) => PUSH_nn('hl', ...args)];

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

const POP_nn = (nn, cpu, mmu) => {
    cpu[nn] = mmu.readWord(cpu.sp);
    cpu.sp += 2;
    cpu.pc += 1;

    return 12;
};

$[0xf1] = ['POP AF', (...args) => POP_nn('af', ...args)];
$[0xc1] = ['POP BC', (...args) => POP_nn('bc', ...args)];
$[0xd1] = ['POP DE', (...args) => POP_nn('de', ...args)];
$[0xe1] = ['POP HL', (...args) => POP_nn('hl', ...args)];

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

const ADD_A_n = (n, cpu) => {
    const r = cpu.a + cpu[n];

    cpu.f = 0;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (cpu.a & 0xf + cpu[n] & 0xf > 0xf) cpu.f |= 1 << 5;
    if (r > 0xff) cpu.f |= 1 << 4;

    cpu.a = r;
    cpu.pc += 1;

    return 4;
};

$[0x87] = ['ADD A,A', (...args) => ADD_A_n('a', ...args)];
$[0x80] = ['ADD A,B', (...args) => ADD_A_n('b', ...args)];
$[0x81] = ['ADD A,C', (...args) => ADD_A_n('c', ...args)];
$[0x82] = ['ADD A,D', (...args) => ADD_A_n('d', ...args)];
$[0x83] = ['ADD A,E', (...args) => ADD_A_n('e', ...args)];
$[0x84] = ['ADD A,H', (...args) => ADD_A_n('h', ...args)];
$[0x85] = ['ADD A,L', (...args) => ADD_A_n('l', ...args)];

$[0x86] = ['ADD A,(HL)', (cpu, mmu) => {
    const v = mmu.readByte(cpu.hl);
    const r = cpu.a + v;

    cpu.f = 0;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (cpu.a & 0xf + v & 0xf > 0xf) cpu.f |= 1 << 5;
    if (r > 0xff) cpu.f |= 1 << 4;

    cpu.a = r;
    cpu.pc += 1;

    return 8;
}];

$[0xc6] = ['ADD A,#', (cpu, mmu) => {
    const v = mmu.readByte(cpu.pc + 1);
    const r = cpu.a + v;

    cpu.f = 0;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (cpu.a & 0xf + v & 0xf > 0xf) cpu.f |= 1 << 5;
    if (r > 0xff) cpu.f |= 1 << 4;

    cpu.a = r;
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
 * ADC            A,(HL)        8E        4
 * ADC            A,#           CE        4
 */

const ADC_A_n = (n, cpu) => {
    const v = cpu[n] + cpu.f >> 4 & 1;
    const r = cpu.a + v;

    cpu.f = 0;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (cpu.a & 0xf + v & 0xf > 0xf) cpu.f |= 1 << 5;
    if (r > 0xff) cpu.f |= 1 << 4;

    cpu.a = r;
    cpu.pc += 1;

    return 4;
};

$[0x8f] = ['ADC A,A', (...args) => ADC_A_n('a', ...args)];
$[0x88] = ['ADC A,B', (...args) => ADC_A_n('b', ...args)];
$[0x89] = ['ADC A,C', (...args) => ADC_A_n('c', ...args)];
$[0x8a] = ['ADC A,D', (...args) => ADC_A_n('d', ...args)];
$[0x8b] = ['ADC A,E', (...args) => ADC_A_n('e', ...args)];
$[0x8c] = ['ADC A,H', (...args) => ADC_A_n('h', ...args)];
$[0x8d] = ['ADC A,L', (...args) => ADC_A_n('l', ...args)];

$[0x8e] = ['ADC A,(HL)', (cpu, mmu) => {
    const v = mmu.readByte(cpu.hl) + cpu.f >> 4 & 1;
    const r = cpu.a + v;

    cpu.f = 0;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (cpu.a & 0xf + v & 0xf > 0xf) cpu.f |= 1 << 5;
    if (r > 0xff) cpu.f |= 1 << 4;

    cpu.a = r;
    cpu.pc += 1;

    return 8;
}];

$[0xce] = ['ADC A,#', (cpu, mmu) => {
    const v = mmu.readByte(cpu.pc + 1) + cpu.f >> 4 & 1;
    const r = cpu.a + v;

    cpu.f = 0;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (cpu.a & 0xf + v & 0xf > 0xf) cpu.f |= 1 << 5;
    if (r > 0xff) cpu.f |= 1 << 4;

    cpu.a = r;
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
 * n = A ,B ,C ,D ,E ,H ,L ,(HL) ,#
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

const SUB_n = (n, cpu) => {
    const r = cpu.a - cpu[n];

    cpu.f = 0x40;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (cpu.a & 0xf < cpu[n] & 0xf) cpu.f |= 1 << 5;
    if (r < 0) cpu.f |= 1 << 4;

    cpu.a = r;
    cpu.pc += 1;

    return 4;
};

$[0x97] = ['SUB A', (...args) => SUB_n('a', ...args)];
$[0x90] = ['SUB B', (...args) => SUB_n('b', ...args)];
$[0x91] = ['SUB C', (...args) => SUB_n('c', ...args)];
$[0x92] = ['SUB D', (...args) => SUB_n('d', ...args)];
$[0x93] = ['SUB E', (...args) => SUB_n('e', ...args)];
$[0x94] = ['SUB H', (...args) => SUB_n('h', ...args)];
$[0x95] = ['SUB L', (...args) => SUB_n('l', ...args)];

$[0x96] = ['SUB (HL)', (cpu, mmu) => {
    const v = mmu.readByte(cpu.hl);
    const r = cpu.a - v;

    cpu.f = 0x40;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (cpu.a & 0xf < v & 0xf) cpu.f |= 1 << 5;
    if (r < 0) cpu.f |= 1 << 4;

    cpu.a = r;
    cpu.pc += 1;

    return 8;
}];

$[0xd6] = ['SUB #', (cpu, mmu) => {
    const v = mmu.readByte(cpu.pc + 1);
    const r = cpu.a - v;

    cpu.f = 0x40;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (cpu.a & 0xf < v & 0xf) cpu.f |= 1 << 5;
    if (r < 0) cpu.f |= 1 << 4;

    cpu.a = r;
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

const SBC_A_n = (n, cpu, mmu) => {
    const v = cpu[n] + cpu.f >> 4 & 1;
    const r = cpu.a - v;

    cpu.f = 0x40;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (cpu.a & 0xf < v & 0xf) cpu.f |= 1 << 5;
    if (cpu.a < v) cpu.f |= 1 << 4;

    cpu.a = r;
    cpu.pc += 1;

    return 4;
};

$[0x9f] = ['SBC A,A', (...args) => SBC_A_n('a', ...args)];
$[0x98] = ['SBC A,B', (...args) => SBC_A_n('b', ...args)];
$[0x99] = ['SBC A,C', (...args) => SBC_A_n('c', ...args)];
$[0x9a] = ['SBC A,D', (...args) => SBC_A_n('d', ...args)];
$[0x9b] = ['SBC A,E', (...args) => SBC_A_n('e', ...args)];
$[0x9c] = ['SBC A,H', (...args) => SBC_A_n('h', ...args)];
$[0x9d] = ['SBC A,L', (...args) => SBC_A_n('l', ...args)];

$[0x9e] = ['SBC A,(HL)', (cpu, mmu) => {
    const v = mmu.readByte(cpu.hl) + cpu.f >> 4 & 1;
    const r = cpu.a - v;

    cpu.f = 0x40;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (cpu.a & 0xf < v & 0xf) cpu.f |= 1 << 5;
    if (cpu.a < v) cpu.f |= 1 << 4;

    cpu.a = r;
    cpu.pc += 1;

    return 4;
}];

$[0xde] = ['SBC A,#', (cpu, mmu) => {
    const v = mmu.readByte(cpu.pc + 1) + cpu.f >> 4 & 1;
    const r = cpu.a - v;

    cpu.f = 0x40;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (cpu.a & 0xf < v & 0xf) cpu.f |= 1 << 5;
    if (cpu.a < v) cpu.f |= 1 << 4;

    cpu.a = r;
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

const AND_n = (n, cpu) => {
    cpu.a &= cpu[n];

    cpu.f = 0x20;
    if (!cpu.a) cpu.f |= 1 << 7;

    cpu.pc += 1;

    return 4;
};

$[0xa7] = ['AND A', (...args) => AND_n('a', ...args)];
$[0xa0] = ['AND B', (...args) => AND_n('b', ...args)];
$[0xa1] = ['AND C', (...args) => AND_n('c', ...args)];
$[0xa2] = ['AND D', (...args) => AND_n('d', ...args)];
$[0xa3] = ['AND E', (...args) => AND_n('e', ...args)];
$[0xa4] = ['AND H', (...args) => AND_n('h', ...args)];
$[0xa5] = ['AND L', (...args) => AND_n('l', ...args)];

$[0xa6] = ['AND (HL)', (cpu, mmu) => {
    cpu.a &= mmu.readByte(cpu.hl);

    cpu.f = 0x20;
    if (!cpu.a) cpu.f |= 1 << 7;

    cpu.pc += 1;

    return 8;
}];

$[0xe6] = ['AND #', (cpu, mmu) => {
    cpu.a &= mmu.readByte(cpu.pc + 1);

    cpu.f = 0x20;
    if (!cpu.a) cpu.f |= 1 << 7;

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

const OR_n = (n, cpu) => {
    cpu.a |= cpu[n];

    cpu.f = 0;
    if (!cpu.a) cpu.f |= 1 << 7;

    cpu.pc += 1;

    return 4;
};

$[0xb7] = ['OR A', (...args) => OR_n('a', ...args)];
$[0xb0] = ['OR B', (...args) => OR_n('b', ...args)];
$[0xb1] = ['OR C', (...args) => OR_n('c', ...args)];
$[0xb2] = ['OR D', (...args) => OR_n('d', ...args)];
$[0xb3] = ['OR E', (...args) => OR_n('e', ...args)];
$[0xb4] = ['OR H', (...args) => OR_n('h', ...args)];
$[0xb5] = ['OR L', (...args) => OR_n('l', ...args)];

$[0xb6] = ['OR (HL)', (cpu, mmu) => {
    cpu.a |= mmu.readByte(cpu.hl);

    cpu.f = 0;
    if (!cpu.a) cpu.f |= 1 << 7;

    cpu.pc += 1;

    return 4;
}];

$[0xf6] = ['OR #', (cpu, mmu) => {
    cpu.a |= mmu.readByte(cpu.pc + 1);

    cpu.f = 0;
    if (!cpu.a) cpu.f |= 1 << 7;

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

const XOR_n = (n, cpu) => {
    cpu.a ^= cpu[n];

    cpu.f = !cpu.a ? 0x80 : 0;
    cpu.pc += 1;

    return 4;
};

$[0xaf] = ['XOR A', (...args) => XOR_n('a', ...args)];
$[0xa8] = ['XOR B', (...args) => XOR_n('b', ...args)];
$[0xa9] = ['XOR C', (...args) => XOR_n('c', ...args)];
$[0xaa] = ['XOR D', (...args) => XOR_n('d', ...args)];
$[0xab] = ['XOR E', (...args) => XOR_n('e', ...args)];
$[0xac] = ['XOR H', (...args) => XOR_n('h', ...args)];
$[0xad] = ['XOR L', (...args) => XOR_n('l', ...args)];

$[0xae] = ['XOR (HL)', (cpu, mmu) => {
    cpu.a ^= mmu.readByte(cpu.hl);

    cpu.f = !cpu.a ? 0x80 : 0;
    cpu.pc += 1;

    return 8;
}];

$[0xee] = ['XOR #', (cpu, mmu) => {
    cpu.a ^= mmu.readByte(cpu.pc + 1);

    cpu.f = !cpu.a ? 0x80 : 0;
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

const CP_n = (n, cpu) => {
    const r = cpu.a - cpu[n];

    cpu.f = 0x40;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (cpu.a & 0xf < cpu[n] & 0xf) cpu.f |= 1 << 5;
    if (cpu.a < cpu[n]) cpu.f |= 1 << 4;

    cpu.pc += 1;

    return 4;
};

$[0xbf] = ['CP A', (...args) => CP_n('a', ...args)];
$[0xb8] = ['CP B', (...args) => CP_n('b', ...args)];
$[0xb9] = ['CP C', (...args) => CP_n('c', ...args)];
$[0xba] = ['CP D', (...args) => CP_n('d', ...args)];
$[0xbb] = ['CP E', (...args) => CP_n('e', ...args)];
$[0xbc] = ['CP H', (...args) => CP_n('h', ...args)];
$[0xbd] = ['CP L', (...args) => CP_n('l', ...args)];

$[0xbe] = ['CP (HL)', (cpu, mmu) => {
    const v = mmu.readByte(cpu.hl);
    const r = cpu.a - v;

    cpu.f = 0x40;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (cpu.a & 0xf < v & 0xf) cpu.f |= 1 << 5;
    if (cpu.a < v) cpu.f |= 1 << 4;

    cpu.pc += 1;

    return 8;
}];

$[0xfe] = ['CP #', (cpu, mmu) => {
    const v = mmu.readByte(cpu.pc + 1);
    const r = cpu.a - v;

    cpu.f = 0x40;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (cpu.a & 0xf < v & 0xf) cpu.f |= 1 << 5;
    if (cpu.a < v) cpu.f |= 1 << 4;

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

const INC_n = (n, cpu) => {
    const r = cpu[n] + 1;

    cpu.f &= ~0xe0;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (cpu[n] & 0xf + 1 > 0xf) cpu.f |= 1 << 5;

    cpu[n] = r;
    cpu.pc += 1;

    return 4;
};

$[0x3c] = ['INC A', (...args) => INC_n('a', ...args)];
$[0x04] = ['INC B', (...args) => INC_n('b', ...args)];
$[0x0c] = ['INC C', (...args) => INC_n('c', ...args)];
$[0x14] = ['INC D', (...args) => INC_n('d', ...args)];
$[0x1c] = ['INC E', (...args) => INC_n('e', ...args)];
$[0x24] = ['INC H', (...args) => INC_n('h', ...args)];
$[0x2c] = ['INC L', (...args) => INC_n('l', ...args)];

$[0x3c] = ['INC (HL)', (cpu, mmu) => {
    const v = mmu.readByte(cpu.hl);
    const r = v + 1;

    cpu.f &= ~0xe0;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (v & 0xf + 1 > 0xf) cpu.f |= 1 << 5;

    mmu.writeByte(cpu.hl, r);
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

const DEC_n = (n, cpu) => {
    const r = cpu[n] - 1;

    cpu.f &= ~0xe0;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    cpu.f |= 1 << 6;
    if (cpu[n] & 0xf < 1) cpu.f |= 1 << 5;

    cpu[n] = r;
    cpu.pc += 1;

    return 4;
};

$[0x3d] = ['DEC A', (...args) => DEC_n('a', ...args)];
$[0x05] = ['DEC B', (...args) => DEC_n('b', ...args)];
$[0x0d] = ['DEC C', (...args) => DEC_n('c', ...args)];
$[0x15] = ['DEC D', (...args) => DEC_n('d', ...args)];
$[0x1d] = ['DEC E', (...args) => DEC_n('e', ...args)];
$[0x25] = ['DEC H', (...args) => DEC_n('h', ...args)];
$[0x2d] = ['DEC L', (...args) => DEC_n('l', ...args)];

$[0x35] = ['DEC (HL)', (cpu) => {
    const v = mmu.readByte(cpu.hl);
    const r = v - 1;

    cpu.f &= ~0xe0;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    cpu.f |= 1 << 6;
    if (v & 0xf < 1) cpu.f |= 1 << 5;

    mmu.writeByte(cpu.hl, r)
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

const ADD_HL_n = (n, cpu, mmu) => {
    const r = cpu.hl + cpu[n];

    cpu.f &= ~0x70;
    if (cpu.hl & 0xff + cpu[n] & 0xff > 0xff) cpu.f |= 1 << 5;
    if (r > 0xffff) cpu.f |= 1 << 4;

    cpu.hl = r;
    cpu.pc += 1;

    return 8;
};

$[0x09] = ['ADD HL,BC', (...args) => ADD_HL_n('bc', ...args)];
$[0x19] = ['ADD HL,DE', (...args) => ADD_HL_n('de', ...args)];
$[0x29] = ['ADD HL,HL', (...args) => ADD_HL_n('hl', ...args)];
$[0x39] = ['ADD HL,SP', (...args) => ADD_HL_n('sp', ...args)];

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
    const v = mmu.readByte(cpu.pc + 1);
    const offset = v & 0x80 ? -((0xff & ~v) + 1) : v;
    cpu.sp += offset;
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

const INC_nn = (nn, cpu) => {
    cpu[nn]++;
    cpu.pc += 1;

    return 8;
};

$[0x03] = ['INC BC', (...args) => INC_nn('bc', ...args)];
$[0x13] = ['INC DE', (...args) => INC_nn('de', ...args)];
$[0x23] = ['INC HL', (...args) => INC_nn('hl', ...args)];
$[0x33] = ['INC SP', (...args) => INC_nn('sp', ...args)];

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

const DEC_nn = (nn, cpu) => {
    cpu[nn]--;
    cpu.pc += 1;

    return 8;
};

$[0x0b] = ['DEC BC', (...args) => DEC_nn('bc', ...args)];
$[0x1b] = ['DEC DE', (...args) => DEC_nn('de', ...args)];
$[0x2b] = ['DEC HL', (...args) => DEC_nn('hl', ...args)];
$[0x3b] = ['DEC SP', (...args) => DEC_nn('sp', ...args)];

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

const SWAP_n = (n, cpu) => {
    const r = cpu[n] << 4 | cpu[n] >> 4;

    cpu.f = 0;
    if (!r) cpu.f |= 1 << 7;

    cpu[n] = r;
    cpu.pc += 2;

    return 8;
};

$cb[0x37] = ['SWAP A', (...args) => SWAP_n('a', ...args)];
$cb[0x30] = ['SWAP B', (...args) => SWAP_n('b', ...args)];
$cb[0x31] = ['SWAP C', (...args) => SWAP_n('c', ...args)];
$cb[0x32] = ['SWAP D', (...args) => SWAP_n('d', ...args)];
$cb[0x33] = ['SWAP E', (...args) => SWAP_n('e', ...args)];
$cb[0x34] = ['SWAP H', (...args) => SWAP_n('h', ...args)];
$cb[0x35] = ['SWAP L', (...args) => SWAP_n('l', ...args)];

$cb[0x36] = ['SWAP (HL)', (cpu) => {
    const n = mmu.readByte(cpu.hl);
    const r = n << 4 | n >> 4;

    cpu.f = 0;
    if (!r) cpu.f |= 1 << 7;

    mmu.writeByte(cpu.hl, r);
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

// TODO(dmacosta)

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
    cpu.f = ~60;
    cpu.f ^= 1 << 4;

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

$[0x37] = ['SCF', (...args) => {
    cpu.f = ~60;
    cpu.f |= 1 << 4;

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

// TODO(dmacosta)

/**
 * STOP
 *
 * Description:
 * Halt CPU & LCD display until button pressed.
 *
 * Opcodes:
 * Instruction    Parameters    Opcode    Cycles
 * NOP            - / -         10 00     4
 */

// TODO(dmacosta)

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

// TODO(dmacosta) see description

$[0xf3] = ['DI', (cpu) => {
    cpu.ime = 0;
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
    cpu.ime = 1;
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
    const r = cpu.a << 1;

    cpu.f = 0;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (r & 0x100) cpu.f |= 1 << 4;

    cpu.a = r | r >> 8;
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
    const r = cpu.a << 1;
    const cy = cpu.f >> 4 & 1;

    cpu.f = 0;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (r & 0x100) cpu.f |= 1 << 4;

    cpu.a = r | cy;
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
    const r = cpu.a >> 1;

    cpu.f = 0;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (cpu.a & 1) cpu.f |= 1 << 4;

    cpu.a = cpu.a & 1 ? r | 1 << 7 : r;
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
    const r = cpu.a >> 1;
    const cy = cpu.f >> 4 & 1;

    cpu.f = 0;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (cpu.a & 1) cpu.f |= 1 << 4;

    cpu.a = cy ? cpu.a | 1 << 4 : r;
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

const RLC_n = (n, cpu) => {
    const r = cpu[n] << 1;

    cpu.f = 0;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (r & 0x100) cpu.f |= 1 << 4;

    cpu[n] = r | r >> 8;
    cpu.pc += 2;

    return 8;
};

$cb[0x07] = ['RLC A', (...args) => RLC_n('a', ...args)];
$cb[0x00] = ['RLC B', (...args) => RLC_n('b', ...args)];
$cb[0x01] = ['RLC C', (...args) => RLC_n('c', ...args)];
$cb[0x02] = ['RLC D', (...args) => RLC_n('d', ...args)];
$cb[0x03] = ['RLC E', (...args) => RLC_n('e', ...args)];
$cb[0x04] = ['RLC H', (...args) => RLC_n('h', ...args)];
$cb[0x05] = ['RLC L', (...args) => RLC_n('l', ...args)];

$cb[0x06] = ['RLC (HL)', (cpu) => {
    const r = mmu.readByte(cpu.hl) << 1;

    cpu.f = 0;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (r & 0x100) cpu.f |= 1 << 4;

    mmu.writeByte(cpu.hl, r | r >> 8);
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

const RL_n = (n, cpu) => {
    const r = cpu[n] << 1;
    const cy = cpu.f >> 4 & 1;

    cpu.f = 0;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (r & 0x100) cpu.f |= 1 << 4;

    cpu[n] = r | cy;
    cpu.pc += 2;

    return 8;
};

$cb[0x17] = ['RL A', (...args) => RL_n('a', ...args)];
$cb[0x10] = ['RL B', (...args) => RL_n('b', ...args)];
$cb[0x11] = ['RL C', (...args) => RL_n('c', ...args)];
$cb[0x12] = ['RL D', (...args) => RL_n('d', ...args)];
$cb[0x13] = ['RL E', (...args) => RL_n('e', ...args)];
$cb[0x14] = ['RL H', (...args) => RL_n('h', ...args)];
$cb[0x15] = ['RL L', (...args) => RL_n('l', ...args)];

$cb[0x16] = ['RL (HL)', (cpu) => {
    const r = mmu.readByte(cpu.hl) << 1;
    const cy = cpu.f >> 4 & 1;

    cpu.f = 0;
    if (!(r & 0xff)) cpu.f |= 1 << 7;
    if (r & 0x100) cpu.f |= 1 << 4;

    mmu.writeByte(cpu.hl, r | cy);
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
 * b = 0 - 7,
 * r = A, B, C, D, E, H, L, (HL)
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

const BIT_b_r = (b, cpu) => {
    cpu.f &= ~0xc0;
    if (!(cpu.h >> b)) cpu.f |= 1 << 7;
    cpu.f |= 1 << 5;

    cpu.pc += 2;

    return 8;
};

$cb[0x47] = ['BIT 0,A', (...args) => BIT_b_r(0, ...args)];
$cb[0x4f] = ['BIT 1,A', (...args) => BIT_b_r(1, ...args)];
$cb[0x57] = ['BIT 2,A', (...args) => BIT_b_r(2, ...args)];
$cb[0x5f] = ['BIT 3,A', (...args) => BIT_b_r(3, ...args)];
$cb[0x67] = ['BIT 4,A', (...args) => BIT_b_r(4, ...args)];
$cb[0x6f] = ['BIT 5,A', (...args) => BIT_b_r(5, ...args)];
$cb[0x77] = ['BIT 6,A', (...args) => BIT_b_r(6, ...args)];
$cb[0x7f] = ['BIT 7,A', (...args) => BIT_b_r(7, ...args)];
$cb[0x40] = ['BIT 0,B', (...args) => BIT_b_r(0, ...args)];
$cb[0x48] = ['BIT 1,B', (...args) => BIT_b_r(1, ...args)];
$cb[0x50] = ['BIT 2,B', (...args) => BIT_b_r(2, ...args)];
$cb[0x58] = ['BIT 3,B', (...args) => BIT_b_r(3, ...args)];
$cb[0x60] = ['BIT 4,B', (...args) => BIT_b_r(4, ...args)];
$cb[0x68] = ['BIT 5,B', (...args) => BIT_b_r(5, ...args)];
$cb[0x70] = ['BIT 6,B', (...args) => BIT_b_r(6, ...args)];
$cb[0x78] = ['BIT 7,B', (...args) => BIT_b_r(7, ...args)];
$cb[0x41] = ['BIT 0,C', (...args) => BIT_b_r(0, ...args)];
$cb[0x49] = ['BIT 1,C', (...args) => BIT_b_r(1, ...args)];
$cb[0x51] = ['BIT 2,C', (...args) => BIT_b_r(2, ...args)];
$cb[0x59] = ['BIT 3,C', (...args) => BIT_b_r(3, ...args)];
$cb[0x61] = ['BIT 4,C', (...args) => BIT_b_r(4, ...args)];
$cb[0x69] = ['BIT 5,C', (...args) => BIT_b_r(5, ...args)];
$cb[0x71] = ['BIT 6,C', (...args) => BIT_b_r(6, ...args)];
$cb[0x79] = ['BIT 7,C', (...args) => BIT_b_r(7, ...args)];
$cb[0x42] = ['BIT 0,D', (...args) => BIT_b_r(0, ...args)];
$cb[0x4a] = ['BIT 1,D', (...args) => BIT_b_r(1, ...args)];
$cb[0x52] = ['BIT 2,D', (...args) => BIT_b_r(2, ...args)];
$cb[0x5a] = ['BIT 3,D', (...args) => BIT_b_r(3, ...args)];
$cb[0x62] = ['BIT 4,D', (...args) => BIT_b_r(4, ...args)];
$cb[0x6a] = ['BIT 5,D', (...args) => BIT_b_r(5, ...args)];
$cb[0x72] = ['BIT 6,D', (...args) => BIT_b_r(6, ...args)];
$cb[0x7a] = ['BIT 7,D', (...args) => BIT_b_r(7, ...args)];
$cb[0x43] = ['BIT 0,E', (...args) => BIT_b_r(0, ...args)];
$cb[0x4b] = ['BIT 1,E', (...args) => BIT_b_r(1, ...args)];
$cb[0x53] = ['BIT 2,E', (...args) => BIT_b_r(2, ...args)];
$cb[0x5b] = ['BIT 3,E', (...args) => BIT_b_r(3, ...args)];
$cb[0x63] = ['BIT 4,E', (...args) => BIT_b_r(4, ...args)];
$cb[0x6b] = ['BIT 5,E', (...args) => BIT_b_r(5, ...args)];
$cb[0x73] = ['BIT 6,E', (...args) => BIT_b_r(6, ...args)];
$cb[0x7b] = ['BIT 7,E', (...args) => BIT_b_r(7, ...args)];
$cb[0x44] = ['BIT 0,H', (...args) => BIT_b_r(0, ...args)];
$cb[0x4c] = ['BIT 1,H', (...args) => BIT_b_r(1, ...args)];
$cb[0x54] = ['BIT 2,H', (...args) => BIT_b_r(2, ...args)];
$cb[0x5c] = ['BIT 3,H', (...args) => BIT_b_r(3, ...args)];
$cb[0x64] = ['BIT 4,H', (...args) => BIT_b_r(4, ...args)];
$cb[0x6c] = ['BIT 5,H', (...args) => BIT_b_r(5, ...args)];
$cb[0x74] = ['BIT 6,H', (...args) => BIT_b_r(6, ...args)];
$cb[0x7c] = ['BIT 7,H', (...args) => BIT_b_r(7, ...args)];

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
 * JP             C,nn          CA        12
 */

$[0xc2] = ['JP NZ,nn', (cpu, mmu) => {
    if (!(cpu.f & 0x80)) {
        cpu.pc = mmu.readWord(cpu.pc + 1);
        return 16;
    }
    cpu.pc += 3;

    return 12;
}];

$[0xca] = ['JP Z,nn', (cpu, mmu) => {
    if (cpu.f & 0x80) {
        cpu.pc = mmu.readWord(cpu.pc + 1);
        return 16;
    }
    cpu.pc += 3;

    return 12;
}];

$[0xd2] = ['JP NC,nn', (cpu, mmu) => {
    if (!(cpu.f & 0x10)) {
        cpu.pc = mmu.readWord(cpu.pc + 1);
        return 16;
    }
    cpu.pc += 3;

    return 12;
}];

$[0xda] = ['JP C,nn', (cpu, mmu) => {
    if (cpu.f & 0x10) {
        cpu.pc = mmu.readWord(cpu.pc + 1);
        return 16;
    }
    cpu.pc += 3;

    return 12;
}];

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

$[0xe9] = ['JP (HL)', (cpu, mmu) => {
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
    const r8 = mmu.readByte(cpu.pc + 1);
    const offset = r8 & 0x80 ? -((0xff & ~r8) + 1) : r8;

    cpu.pc += 2 + offset;

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

$[0x20] = ['JR NZ,n', (cpu, mmu) => {
    if (!(cpu.f & 0x80)) {
        const n = mmu.readByte(cpu.pc + 1);
        const offset = n & 0x80 ? -((0xff & ~n) + 1) : n;

        cpu.pc += 2 + offset;

        return 12;
    }
    cpu.pc += 2;

    return 8;
}];

$[0x28] = ['JR Z,n', (cpu, mmu) => {
    if (cpu.f & 0x80) {
        const n = mmu.readByte(cpu.pc + 1);
        const offset = n & 0x80 ? -((0xff & ~n) + 1) : n;

        cpu.pc += 2 + offset;

        return 12;
    }
    cpu.pc += 2;

    return 8;
}];

$[0x30] = ['JR NC,n', (cpu, mmu) => {
    if (!(cpu.f & 0x10)) {
        const n = mmu.readByte(cpu.pc + 1);
        const offset = n & 0x80 ? -((0xff & ~n) + 1) : n;

        cpu.pc += 2 + offset;

        return 12;
    }
    cpu.pc += 2;

    return 8;
}];

$[0x38] = ['JR C,n', (cpu, mmu) => {
    if (cpu.f & 0x10) {
        const n = mmu.readByte(cpu.pc + 1);
        const offset = n & 0x80 ? -((0xff & ~n) + 1) : n;

        cpu.pc += 2 + offset;

        return 12;
    }
    cpu.pc += 2;

    return 8;
}];

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

$[0xc4] = ['CALL NZ,nn', (cpu, mmu) => {
    if (!(cpu.f & 0x80)) {
        mmu.writeWord(cpu.sp -= 2, cpu.pc + 3);
        cpu.pc = mmu.readWord(cpu.pc + 1);

        return 24;
    }
    cpu.pc += 3;

    return 12;
}];

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

const RST_n = (n, cpu, mmu) => {
    mmu.writeWord(cpu.sp -= 2, cpu.pc);
    cpu.pc = n;

    return 16;
};

$[0xc7] = ['RST 00H', (...args) => RST_n(0x00, ...args)];
$[0xcf] = ['RST 08H', (...args) => RST_n(0x08, ...args)];
$[0xd7] = ['RST 10H', (...args) => RST_n(0x10, ...args)];
$[0xdf] = ['RST 08H', (...args) => RST_n(0x18, ...args)];
$[0xe7] = ['RST 20H', (...args) => RST_n(0x20, ...args)];
$[0xef] = ['RST 28H', (...args) => RST_n(0x28, ...args)];
$[0xf7] = ['RST 30H', (...args) => RST_n(0x30, ...args)];
$[0xff] = ['RST 38H', (...args) => RST_n(0x38, ...args)];

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

$[0xc0] = ['RET NZ', (cpu, mmu) => {
    if (!(cpu.f & 0x80)) {
        cpu.pc = mmu.readWord(cpu.sp);
        cpu.sp += 2;

        return 20;
    }
    cpu.pc += 1;

    return 8;
}];

$[0xc8] = ['RET Z', (cpu, mmu) => {
    if (cpu.f & 0x80) {
        cpu.pc = mmu.readWord(cpu.sp);
        cpu.sp += 2;

        return 20;
    }
    cpu.pc += 1;

    return 8;
}];

$[0xd0] = ['RET NC', (cpu, mmu) => {
    if (!(cpu.f & 0x10)) {
        cpu.pc = mmu.readWord(cpu.sp);
        cpu.sp += 2;

        return 20;
    }
    cpu.pc += 1;

    return 8;
}];

$[0xd8] = ['RET C', (cpu, mmu) => {
    if (cpu.f & 0x10) {
        cpu.pc = mmu.readWord(cpu.sp);
        cpu.sp += 2;

        return 20;
    }
    cpu.pc += 1;

    return 8;
}];

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
    cpu.ime = 1;

    return 16;
}];
