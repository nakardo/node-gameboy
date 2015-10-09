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

    this.mmu = mmu;

    // Timers

    this.t = 0;

    // Main General-Purpose Register Set

    // Flags Register
    //
    // - Zero (0x80): Set if the last operation produced a result of 0;
    // - Operation (0x40): Set if the last operation was a subtraction;
    // - Half-carry (0x20): Set if, in the result of the last operation,
    // the lower half of the byte overflowed past 15;
    // - Carry (0x10): Set if the last operation produced a result over 255
    // (for additions) or under 0 (for subtractions).

    this.a = 0; // Accumulator, 8-bit
    this.f = 0; // Flags, 8-bit

    // General-Purpose Register Set

    this.b = 0; this.c = 0; // Pair BC, 8-bit + 8-bit
    this.d = 0; this.e = 0; // Pair DE, 8-bit + 8-bit
    this.h = 0; this.l = 0; // Pair HL, 8-bit + 8-bit

    // Special-Purpose Registers

    this.pc = 0; // Program Counter, 16-bit
    this.sp = 0; // Stack Pointer, 16-bit

    // Interrupts

    this.iff = 0;
}

Object.defineProperty(Cpu.prototype, 'af', {
    get: function () {
        return this.a << 8 & 0xFF | this.f & 0xFF;
    },
    set: function (value) {
        this.a = value >> 8 & 0xFF;
        this.f = value & 0xFF;
    }
});

Object.defineProperty(Cpu.prototype, 'bc', {
    get: function () {
        return this.b << 8 & 0xFF | this.c & 0xFF;
    },
    set: function (value) {
        this.b = value >> 8 & 0xFF;
        this.c = value & 0xFF;
    }
});

Object.defineProperty(Cpu.prototype, 'de', {
    get: function () {
        return this.d << 8 & 0xFF | this.e & 0xFF;
    },
    set: function (value) {
        this.d = value >> 8 & 0xFF;
        this.e = value & 0xFF;
    }
});

Object.defineProperty(Cpu.prototype, 'hl', {
    get: function () {
        return this.h << 8 & 0xFF | this.l & 0xFF;
    },
    set: function (value) {
        this.h = value >> 8 & 0xFF;
        this.l = value & 0xFF;
    }
});

Cpu.prototype.powerOn = function () {

    debug('power on');

    var that = this;

    var next = function () {
        setInterval(function () {
            runCycle.call(that, next);
        }, 1);
    };

    next();
};

var runCycle = function (next) {

    debug('run cycle PC=0x%s SP=0x%s', this.pc.toString(16),
        this.sp.toString(16));

    // Docs
    //
    // - http://www.z80.info/decoding.htm
    // - http://fms.komkon.org/GameBoy/Tech/Software.html

    // Instruction format
    //
    // [prefix byte,] opcode [,displacement byte] [,immediate data]

    var prefix = 0;
    var opcode = this.mmu.readByte(this.pc);

    // The "shadow" set of registers (BC',DE',HL',AF') and the index
    // registers (IX,IY) are missing and, consequently, there are no DD and
    // FD opcode tables.

    var spec = table.unprefixed[opcode];
    if (opcode === 0xCB) {
        prefix = 0xCB;
        opcode = this.mmu.readByte(this.pc + 1);
        spec = table.cbprefixed[opcode];
    }

    if (!spec) {
        debug('0x%s unknown opcode. stop', opcode.toString(16));
        process.exit(1);
    }

    debug('opcode is 0x%s', (prefix << 8 | opcode).toString(16));
    exec(spec)(this, next);
};

module.exports = Cpu;
