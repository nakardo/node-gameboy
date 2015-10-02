var debug = require('debug')('exec');
var decode = require('./fetcher');
var runner = require('./runner')();

var inst = runner.inst;
var before = runner.before;
var after = runner.after;


before(function (spec, cpu) {

    // 16-bit registers

    this.af = cpu._a & 0xFF << 8 | cpu._f & 0xFF;
    this.cb = cpu._c & 0xFF << 8 | cpu._b & 0xFF;
    this.de = cpu._d & 0xFF << 8 | cpu._e & 0xFF;
    this.hl = cpu._h & 0xFF << 8 | cpu._l & 0xFF;

    // Operands

    this.op1 = decode(cpu, spec.operands, 0);
    this.op2 = decode(cpu, spec.operands, 1);

    debug('before execute %s %s', spec.mnemonic, spec.operands);
});

after(function (spec, cpu) {

    // Next cycle

    cpu._t += spec.cycles;
    cpu._pc += spec.bytes;
});

// Instructions
//
// - http://www.msxarchive.nl/pub/msx/mirrors/msx2.com/zaks/z80prg02.htm
// - http://www.z80.info/z80gboy.txt

// Unprefixed:
//
// ADD, ADC, AND, CPL, CCF, CP, CALL, DEC, DAA, DI, EI, HALT, INC, JR, JP, LD,
// LDH, NOP, OR, POP, PUSH, PREFIX, RLCA, RRCA, RLA, RRA, RET, RST, RETI, STOP,
// SCF, SUB, SBC, XOR

inst('ld', function (spec, cpu) {

    switch (spec.operands[0]) {
        case 'SP': return cpu._sp = this.op2;
        case 'HL': case '(HL-)': return cpu._sp = this.op2;
        default: return;
    }
});

inst('xor', function (spec, cpu) {

    switch (spec.operands[0]) {
        case 'A':
            cpu._a ^= cpu._a;
            return cpu._f = cpu._a ? 0 : 0x80;
        default:
            return;
    }
});

// 0xCB Prefixed
//
// BIT, RLC, RRC, RL, RR, RES, SLA, SRA, SWAP, SRL, SET

inst('bit', function (spec, cpu) {

});

// Exports

module.exports = runner.exec;
