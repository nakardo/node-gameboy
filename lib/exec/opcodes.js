var runner = require('./runner')();

var opcode = runner.opcode;
var before = runner.before;
var after = runner.after;


before(function (inst, cpu) {

});

after(function (inst, cpu) {

    cpu._t += inst.cycles;
    cpu._pc += inst.bytes;
});

// Unprefixed:
//
// ADD, ADC, AND, CPL, CCF, CP, CALL, DEC, DAA, DI, EI, HALT, INC, JR, JP, LD,
// LDH, NOP, OR, POP, PUSH, PREFIX, RLCA, RRCA, RLA, RRA, RET, RST, RETI, STOP,
// SCF, SUB, SBC, XOR

opcode('ld', function (inst, cpu) {

});

module.exports = runner.exec;

// 0xCB Prefixed
//
// BIT, RLC, RRC, RL, RR, RES, SLA, SRA, SWAP, SRL, SET
