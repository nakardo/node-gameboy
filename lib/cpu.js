'use strict';

var fs = require('fs');
var assert = require('assert');
var debug = require('debug')('cpu');
var table = require('../support/opcodes.json');
var exec = require('./exec');


function Cpu(mmu) {

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

    this._a = 0; // Accumulator, 8-bit
    this._f = 0; // Flags, 8-bit

    // General-Purpose Register Set

    this._b = 0; this._c = 0; // Pair BC, 8-bit + 8-bit
    this._d = 0; this._e = 0; // Pair DE, 8-bit + 8-bit
    this._h = 0; this._l = 0; // Pair HL, 8-bit + 8-bit

    // Special-Purpose Registers

    this._pc = 0; // Program Counter, 16-bit
    this._sp = 0; // Stack Pointer, 16-bit

    // Interrupts

    this.iff = 0;

    // Properties

    var int8_registers = [
        'a', 'f',
        'b', 'c',
        'd', 'e',
        'h', 'l'
    ];

    // 8-bit Properties

    int8_registers.forEach(createProperty.bind(this, 0xFF));

    // 16-bit Paired Registers

    int8_registers
        .map(function (n, i) {
            return i % 2 == 0
                ? [
                    int8_registers[i],
                    int8_registers[i + 1]
                ]
                : null;
        })
        .filter(function (n) { return n !== null; })
        .forEach(createPairedProperty, this);

    // 16-bit Properties

    [
        'pc',
        'sp'
    ]
    .forEach(createProperty.bind(this, 0xFFFF));

    Object.seal(this);
}

Cpu.prototype.powerOn = function () {

    debug('power on');
};

Cpu.prototype.flag = function (flag, set) {

    assert(typeof flag === 'string', 'Flag must be an string');

    flag = flag.toUpperCase();

    var index = 'ZNHC'.indexOf(flag);
    if (index < 0) throw new Error(flag + 'flag is unknown');

    var bit = 1 << (7 - index);

    if (arguments.length === 1) return this.f & bit;

    // Set or clear flag

    if (set) {
        debug('set flag %s=%d', flag, set ? 1 : 0);
        return this.f |= bit
    } else {
        return this.f &= ~bit;
    }
};

Cpu.prototype.serviceInterupt = function () {
    // body...
};

Cpu.prototype.checkInterupts = function () {
    // body...
};

Cpu.prototype.runCycle = function (next) {

    debug('run cycle PC=0x%s SP=0x%s', this._pc.toString(16),
        this._sp.toString(16));

    // Instruction format
    //
    // [prefix byte,] opcode [,displacement byte] [,immediate data]
    //
    // - http://www.z80.info/decoding.htm
    // - http://fms.komkon.org/GameBoy/Tech/Software.html

    var prefix = 0;
    var opcode = this.mmu.readByte(this._pc);

    // The "shadow" set of registers (BC',DE',HL',AF') and the index
    // registers (IX,IY) are missing and, consequently, there are no DD and
    // FD opcode tables.

    var spec = table.unprefixed[opcode];
    if (opcode === 0xCB) {
        prefix = 0xCB;
        opcode = this.mmu.readByte(this._pc + 1);
        spec = table.cbprefixed[opcode];
    }

    if (!spec) {
        debug('0x%s unknown opcode. stop', opcode.toString(16));
        process.exit(1);
    }

    debug('opcode is 0x%s', (prefix << 8 | opcode).toString(16));
    exec(spec)(this, next);
};

// Helpers

var createProperty = function (mask, name) {

    Object.defineProperty(this, name, {
        get: function () {
            return this['_' + name];
        },
        set: function (value) {
            this['_' + name] = value & mask;
        }
    });
};

var createPairedProperty = function (pair) {

    Object.defineProperty(this, pair.join(''), {
        get: function () {
            return this['_' + pair[0]] << 8 | this['_' + pair[1]];
        },
        set: function (value) {
            this['_' + pair[0]] = value >> 8;
            this['_' + pair[1]] = value;
        }
    });
}

module.exports = Cpu;
