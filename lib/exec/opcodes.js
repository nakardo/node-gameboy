var runner = require('./runner');


var opcode = runner.opcode;
var beforeEach = runner.beforeEach;
var afterEach = runner.afterEach;

beforeEach(function (next) {
    next();
});

afterEach(function (next) {
    next();
});

// Unprefixed:
//
// ADD, ADC, AND, CPL, CCF, CP, CALL, DEC, DAA, DI, EI, HALT, INC, JR, JP, LD,
// LDH, NOP, OR, POP, PUSH, PREFIX, RLCA, RRCA, RLA, RRA, RET, RST, RETI, STOP,
// SCF, SUB, SBC, XOR

opcode('add', function (next) {
    next();
});

module.exports = runner.exec;

// 0xCB Prefixed
//
// BIT, RLC, RRC, RL, RR, RES, SLA, SRA, SWAP, SRL, SET
