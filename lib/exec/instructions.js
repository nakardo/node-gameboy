var runner = require('./runner')();

var inst = runner.inst;
var before = runner.before;
var after = runner.after;


before(function (spec, cpu) {


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

});

// 0xCB Prefixed
//
// BIT, RLC, RRC, RL, RR, RES, SLA, SRA, SWAP, SRL, SET

inst('bit', function (spec, cpu) {

});

// Exports

module.exports = runner.exec;
