var fs = require('fs');
var debug = require('debug')('cpu');
var table = require('../support/opcodes.json');


function Cpu(mmu) {

    // Docs
    //
    // - http://www.z80.info/gfx/z80block.gif

    this._mmu = mmu;

    // Timers

    this._t = 0;

    // Main General-Purpose Register Set

    this._af = 0;
    this._bc = 0;
    this._de = 0;
    this._hl = 0;

    // Special-Purpose Registers

    this._pc = 0;
    this._sp = 0;
}

Cpu.prototype.powerOn = function () {

    debug('powering on');

    for (;;) {
        this._runCycle();
    }
};

Cpu.prototype._runCycle = function () {

    debug('running cycle, pc is 0x%s', this._pc.toString(16));

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

    var inst = opcode === 0xCB
        ? table.cbprefixed[this._mmu.readByte(this._pc + 1)]
        : table.unprefixed[opcode]
        ;

    if (!inst) {
        debug('0x%s unknown opcode, stopping', opcode.toString(16));
        process.exit(1);
    }

    // Execute

    if (!table[inst.mnemonic]) {
        debug('%s unimplemented instruction, stopping', inst.mnemonic);
        // process.exit(1);
    }
    debug('%s %s running.', inst.mnemonic, opcode);
    // instFn[inst.mnemonic].bind(this, opcode);

    this._t += inst.cycles;
    this._pc += inst.bytes;
};

// Instructions

var instFn = {};

module.exports = Cpu;
