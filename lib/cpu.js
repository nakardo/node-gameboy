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

    debug('powering on');

    var next = function () {
        runCycle.call(this, next);
    }
};

var runCycle = function (next) {

    debug('running cycle, PC=0x%s', this._pc.toString(16));

    // Docs
    //
    // - http://www.z80.info/decoding.htm
    // - http://fms.komkon.org/GameBoy/Tech/Software.html

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
        debug('0x%s unknown opcode, stopping', opcode.toString(16));
        process.exit(1);
    }

    if (!instFn[inst.mnemonic]) {
        debug('%s unimplemented inst, stopping', inst.mnemonic);
        process.exit(1);
    }

    // Execute

    debug('exec %s %s', inst.mnemonic, inst.operands);
    exec(inst)(cpu, next);

    // this._t += inst.cycles;
    // this._pc += inst.bytes;
};

// Docs
//
// - http://www.msxarchive.nl/pub/msx/mirrors/msx2.com/zaks/z80prg02.htm
// - http://www.z80.info/z80gboy.txt

// Instructions

var instFn = {};

instFn.JP = function (inst) {

    var addr;

    var op = inst.operands;
    if (op.length === 1 && op[0] === 'a16') {
        addr = this._mmu.readWord(this._pc + 1);
    }

    assert(addr, 'Invalid address');
    this._pc = addr;
};

instFn.XOR = function (inst) {

    if (inst.operands[0] === 'A') {

        this._a ^= this._a;
        this._f = this._a ? 0 : 0x80;
    }

    this._pc += inst.bytes;
};

instFn.LD = function (inst) {

    var value;

    switch (inst.operands[1]) {
        case 'A':
            value = this._a;
            break;
        case 'd8':
            value = this._mmu.readByte(this._pc + 1);
            break;
        case 'd16':
            value = this._mmu.readWord(this._pc + 1);
            break;
        default:
            throw new Error('Invalid value');
    }

    switch (inst.operands[0]) {
        case 'B': this._b = value; break;
        case 'C': this._c = value; break;
        case 'HL':
            this._h = value & 0xFF00 >> 8;
            this._l = value >> 8;
            break;
        case '(HL-)': // alt mnemonic HLI
            this._mmu.writeWord(this._h << 8 | this._l)
            this._l = this._l - 1 & 0xFF;
            if (!this._h) this._h = this._h - 1 & 0xFF;
            break;
        default:
            throw new Error('Invalid register');
    }

    this._pc += inst.bytes;
};

module.exports = Cpu;
