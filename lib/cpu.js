var fs = require('fs');
var assert = require('assert');
var debug = require('debug')('cpu');
var table = require('../support/opcodes.json');
var exec = require('./exec');


function Cpu(mmu) {

    assert(mmu !== null, 'Invalid MMU');

    // Docs
    //
    // - http://www.z80.info/gfx/z80block.gif
    // - http://www.z80.info/z80arki.htm
    // - http://imrannazar.com/GameBoy-Emulation-in-JavaScript:-The-CPU

    this._mmu = mmu;

    // Timers

    this._t = 0;

    // Main General-Purpose Register Set

    // Flags Register
    //
    // - Zero (0x80): Set if the last operation produced a result of 0;
    // - Operation (0x40): Set if the last operation was a subtraction;
    // - Half-carry (0x20): Set if, in the result of the last operation,
    // the lower half of the byte overflowed past 15;
    // - Carry (0x10): Set if the last operation produced a result over 255
    // (for additions) or under 0 (for subtractions).

    this._a = 0; // Accumulator, 8-bit
    this._f = 0; // Flags, 8-bit

    // General-Purpose Register Set

    this._b = 0; this._c = 0; // Pair BC, 8-bit + 8-bit
    this._d = 0; this._e = 0; // Pair DE, 8-bit + 8-bit
    this._h = 0; this._l = 0; // Pair HL, 8-bit + 8-bit

    // Special-Purpose Registers

    this._pc = 0; // Program Counter, 16-bit
    this._sp = 0; // Stack Pointer, 16-bit
}

Cpu.prototype.powerOn = function () {

    debug('power on');

    var next = function () {
        runCycle.call(this, next);
    }
    .bind(this);

    next();
};

var runCycle = function (next) {

    debug('run cycle PC=0x%s SP=0x%s', this._pc.toString(16),
        this._sp.toString(16));

    // Docs
    //
    // - http://www.z80.info/decoding.htm
    // - http://fms.komkon.org/GameBoy/Tech/Software.html

    // Fetch & Decode

    // Instruction format
    //
    // [prefix byte,] opcode [,displacement byte] [,immediate data]

    var opcode = this._mmu.readByte(this._pc);

    // The "shadow" set of registers (BC',DE',HL',AF') and the index
    // registers (IX,IY) are missing and, consequently, there are no DD and
    // FD opcode tables.

    var inst = table.unprefixed[opcode];
    if (opcode === 0xCB) {
        opcode = this._mmu.readByte(this._pc + 1);
        inst = table.cbprefixed[opcode];
    }

    if (!inst) {
        debug('0x%s unknown opcode. stop', opcode.toString(16));
        process.exit(1);
    }

    // Execute

    debug('exec %s %s', inst.mnemonic, inst.operands);
    exec(inst)(this, next);
};

module.exports = Cpu;
