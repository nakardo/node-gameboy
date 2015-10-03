var debug = require('debug')('exec');
var runner = require('./runner')();
var fetch = require('./fetcher');

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

    this.op1 = fetch(cpu, spec.operands, 0);
    this.op2 = fetch(cpu, spec.operands, 1);
});

after(function (spec, cpu) {

    // Reset flags when possible

    var flags = spec.flags_znhc;

    debug('opcode ZNHC flags are [%s]', flags.join(' '));
    debug('current ZNHC flags %s', cpu._f.toString(2));

    [0x80, 0x40, 0x20, 0x10].forEach(function (value, i) {
        var reset = parseInt(flags[i], 10);
        if (!isNaN(reset)) {
            debug('0x%s flag reset with value %d', value.toString(16), reset)
            cpu._f |= reset;
        }
    });

    debug('updated ZNHC flags %s', cpu._f.toString(2))

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

    cpu._a ^= this.op1;
    return cpu._f = cpu._a !== 0 ? cpu._a : 0x80;
});

// 0xCB Prefixed
//
// BIT, RLC, RRC, RL, RR, RES, SLA, SRA, SWAP, SRL, SET

inst('bit', function (spec, cpu) {

    if (this.op1 & this.op2) return this._f |= 0x80;
    return this._f;
});

// Exports

module.exports = runner.prebake;
