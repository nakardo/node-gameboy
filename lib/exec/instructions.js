var debug = require('debug')('exec');
var runner = require('./runner')();
var fetch = require('./fetcher');

var inst = runner.inst;
var before = runner.before;
var after = runner.after;


before(function (spec, cpu) {

    debug('next instruction is %s %s', spec.mnemonic, spec.operands);
    debug('next instruction ZNHC flags are [%s]', spec.flags_znhc.join(' '));

    // Fetch operands.

    this.op1 = fetch(cpu, spec.operands, 0);
    this.op2 = fetch(cpu, spec.operands, 1);
});

after(function (spec, cpu) {

    // Reset flags when possible

    var flags = spec.flags_znhc;

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
// - http://www.z80.info/z80gboy.txt
// - http://www.z80.info/zip/z80cpu_um.pdf

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

// XOR s
//
// Opcode: XOR
//
// Description:
//
// The logical exclusive-OR operation is performed between the byte specified by
// the s operand and the byte contained in the Accumulator; the result is stored
// in the Accumulator.
//
// Conditions Bits Affected:
//
// S is set if result is negative; reset otherwise
// Z is set if result is zero; reset otherwise H is reset
// H is reset
// P/V is set if parity even; reset otherwise N is reset
// N is reset
// C is reset
//
// Example:
//
// If the Accumulator contains 96H (1001 0110), at execution of XOR
// 5DH(5DH = 0101 1101) the Accumulator contains CBH (1100 1011).

inst('xor', function (spec, cpu) {

    cpu._a ^= this.op1;
    return cpu._f = cpu._a !== 0 ? cpu._a : 0x80;
});

// 0xCB Prefixed
//
// BIT, RLC, RRC, RL, RR, RES, SLA, SRA, SWAP, SRL, SET

// BIT b,r
// BIT b,(HL)
//
// Description:
//
// This instruction tests bit b in register r and sets the Z flag accordingly.
//
// Condition Bits Affected:
//
// S is unknown
// Z is set if specified bit is 0; reset otherwise H is set
// P/V is unknown
// N is reset
// C is not affected
//
// Example:
//
// If bit 2 in register B contains 0, at execution of BIT 2, B the Z flag in the
// F register contains 1, and bit 2 in register B remains 0. Bit 0 in register B
// is the least-significant bit.

inst('bit', function (spec, cpu) {

    if (this.op1 & this.op2) return this._f |= 0x80;
    return this._f;
});

// Exports

module.exports = runner.prebake;
