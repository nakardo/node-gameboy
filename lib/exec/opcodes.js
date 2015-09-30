var runner = require('./runner')();

var opcode = runner.opcode;
var before = runner.before;
var after = runner.after;


before(inst, function (next) {

    console.log('before');
    next();
});

after(inst, function (next) {

    this._t += inst.cycles;
    this._pc += inst.bytes;
    next();
});

// Unprefixed:
//
// ADD, ADC, AND, CPL, CCF, CP, CALL, DEC, DAA, DI, EI, HALT, INC, JR, JP, LD,
// LDH, NOP, OR, POP, PUSH, PREFIX, RLCA, RRCA, RLA, RRA, RET, RST, RETI, STOP,
// SCF, SUB, SBC, XOR

opcode('ld', function (next) {
    console.log('opcode');
    next();
});

module.exports = runner.exec;

// 0xCB Prefixed
//
// BIT, RLC, RRC, RL, RR, RES, SLA, SRA, SWAP, SRL, SET
