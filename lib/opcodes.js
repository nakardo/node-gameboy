'use strict';


// Unprefixed

const $ = exports.$ = new Array(0x100);

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
    const n = mmu.readByte(cpu.pc + 1);
    const offset = n & 0x80 ? -((0xff & ~n) + 1) : n;
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
$[0xe1] = ['POP HL', (...args) => POP_nn('e1', ...args)];

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
    let v;
    cpu.a = v = cpu.a + cpu[n];

    cpu.f = 0;
    if (cpu.a == 0) cpu.f |= 1 << 7;
    if ((~cpu.a & 0xf) == 0) cpu.f |= 1 << 5;
    if (v > 0xff) cpu.f |= 1 << 4;

    cpu.pc += 1;

    return 4;
}

$[0x87] = ['ADD A,A', (...args) => ADD_A_n('a', ...args)];
$[0x80] = ['ADD A,B', (...args) => ADD_A_n('b', ...args)];
$[0x81] = ['ADD A,C', (...args) => ADD_A_n('c', ...args)];
$[0x82] = ['ADD A,D', (...args) => ADD_A_n('d', ...args)];
$[0x83] = ['ADD A,E', (...args) => ADD_A_n('e', ...args)];
$[0x84] = ['ADD A,H', (...args) => ADD_A_n('h', ...args)];
$[0x85] = ['ADD A,L', (...args) => ADD_A_n('l', ...args)];

$[0x86] = ['ADD A,(HL)', (cpu, mmu) => {
    let v;
    cpu.a = v = cpu.a + mmu.readByte(cpu.hl);

    cpu.f = 0;
    if (cpu.a == 0) cpu.f |= 1 << 7;
    if ((~cpu.a & 0xf) == 0) cpu.f |= 1 << 5;
    if (v > 0xff) cpu.f |= 1 << 4;

    cpu.pc += 1;

    return 8;
}];

$[0xC6] = ['ADD A,#', (cpu, mmu) => {
    let v;
    cpu.a = v = cpu.a + mmu.readByte(cpu.pc + 1);

    cpu.f = 0;
    if (cpu.a == 0) cpu.f |= 1 << 7;
    if ((~cpu.a & 0xf) == 0) cpu.f |= 1 << 5;
    if (v > 0xff) cpu.f |= 1 << 4;

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
 * ADC            A,(HL)        8D        4
 */
