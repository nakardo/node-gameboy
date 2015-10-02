var debug = require('debug')('exec');
var runner = require('./runner')();

var inst = runner.inst;
var before = runner.before;
var after = runner.after;


// Docs
//
// - http://www.pastraiser.com/cpu/gameboy/gameboy_opcodes.html

// Operands

var decode = function (cpu, operands, pos) {

    if (!(operands && operands[pos])) return null;

    var af = cpu._a & 0xFF << 8 | cpu._f & 0xFF;
    var cb = cpu._c & 0xFF << 8 | cpu._b & 0xFF;
    var de = cpu._d & 0xFF << 8 | cpu._e & 0xFF;
    var hl = cpu._h & 0xFF << 8 | cpu._l & 0xFF;

    var operand = operands[pos];

    switch (operand) {

        // 8-bit registers
        //
        // A, B, C, D, E, H, L, Z

        case 'A': case 'B': case 'C': case 'D': case 'E': case 'H': case 'L':
            value = cpu['_' + operand.toLowerCase()];
            break;
        case 'Z': value = cpu._f & 0x80; break;

        // 16-bit registers
        //
        // AF, CB, HL, NC, SP

        case 'AF': value = af; break;
        case 'CB': value = cb; break;
        case 'HL': value = hl; break;
        case 'NC': break;
        case 'SP': value = cpu._sp; break;

        // Inmediate data
        //
        // d8, d16, d8, a16

        case 'd8': value = cpu._mmu.readByte(cpu._pc + 1); break;
        case 'd16': value = cpu._mmu.readWord(cpu._pc + 1); break;
        case 'r8': value = cpu._mmu.readByte(cpu._pc + 1); break;
        case 'a16': value = cpu._mmu.readWord(cpu._pc + 1); break;

        // Indirect data
        //
        // (a8), (a16), (C), (DE), (HL), (HL+), (HL-)

        case '(a8)': value = cpu._mmu.readByte(cpu._pc + 1); break;
        case '(a16)': value = cpu._mmu.readWord(cpu._pc + 1); break;
        case '(C)': value = cpu._mmu.readByte(cpu._c); break;
        case '(DE)': value = cpu._mmu.readWord(de); break;
        case '(HL)': value = cpu._mmu.readWord(hl); break;
        case '(HL+)':
            value = cpu._mmu.readWord(hl++);
            cpu._l = cpu._l + 1 & 0xFF;
            if (!cpu._l) cpu._h = cpu._h + 1 & 0xFF;
            break;
        case '(HL-)':
            value = cpu._mmu.readWord(hl--);
            cpu._l = cpu._l - 1 & 0xFF;
            if (!cpu._h) cpu._h = cpu._h - 1 & 0xFF;
            break;

        // SP+r8

        case 'SP+r8': value = cpu._sp + cpu._mmu.readByte(cpu._pc + 1); break;

        // Integer values
        //
        // 0, 1, 2, 3, 4, 5, 6, 7

        case '0': case '1': case '2': case '3': case '4': case '5': case '6':
        case '7':
            value = operand.parseInt();
            break;

        // Hex values
        //
        // 00H, 08H, 10H, 18H, 20H, 28H, 30H, 38H

        case '00H': case '08H': case '10H': case '18H': case '20H': case '28H':
        case '30H': case '38H':
            value = parseInt(operand.match(/(\d+)/)[0], 16);
            break;

        default:
            debug('%s operand is unknown', operand);
            process.exit(1);
    }

    return value;
}

before(function (spec, cpu) {

    this.op1 = decode(cpu, spec.operands, 0);
    this.op2 = decode(cpu, spec.operands, 1);
});

after(function (spec, cpu) {

    cpu._t += spec.cycles;
    cpu._pc += spec.bytes;
});

// Unprefixed:
//
// ADD, ADC, AND, CPL, CCF, CP, CALL, DEC, DAA, DI, EI, HALT, INC, JR, JP, LD,
// LDH, NOP, OR, POP, PUSH, PREFIX, RLCA, RRCA, RLA, RRA, RET, RST, RETI, STOP,
// SCF, SUB, SBC, XOR

inst('ld', function (spec, cpu) {
    console.log(this)
});

// 0xCB Prefixed
//
// BIT, RLC, RRC, RL, RR, RES, SLA, SRA, SWAP, SRL, SET

inst('bit', function (spec, cpu) {

});

// Exports

module.exports = runner.exec;
