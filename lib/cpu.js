var fs = require('fs')
  , debug = require('debug')('cpu')
  , table = require('../script/opcodes.json');


function Cpu() {

    // Docs
    //
    // - http://www.z80.info/gfx/z80block.gif

    this._mmu = require('./mmu');

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

Cpu.prototype.start = function () {

    setInterval(_step.bind(this), 2000);
};

Cpu.prototype.loadFile = function (path) {

    // Docs
    //
    // - http://imrannazar.com/GameBoy-Emulation-in-JavaScript:-Memory

    var self = this;

    // fs.readFile(path, function (err, data) {
    //     if (err) throw err;
    //     self._mmu.memory.set(data, 0x4000);
    // });
};

var _step = function () {

    debug('step, pc is 0x%s', this._pc.toString(16));

    // Docs
    //
    // - http://www.z80.info/decoding.htm
    // - http://fms.komkon.org/GameBoy/Tech/Software.html

    // Instruction format
    //
    // [prefix byte,] opcode [,displacement byte] [,immediate data]

    var opcode = this._mmu.rb(this._pc);

    // The "shadow" set of registers (BC',DE',HL',AF') and the index
    // registers (IX,IY) are missing and, consequently, there are no DD and
    // FD opcode tables.

    var inst = opcode === 0xCB
        ? table.cbprefixed[this._mmu.rb(this._pc + 1)]
        : table.unprefixed[opcode]
        ;

    if (!inst) {
        debug('%s unknown opcode, stopping.', opcode);
        process.exit(1);
    }

    // Execute

    if (!table[inst.mnemonic]) {
        debug('%s unimplemented instruction, stopping.', inst.mnemonic);
        // process.exit(1);
    }
    debug('%s %s running.', inst.mnemonic, opcode);
    // instFn[inst.mnemonic].bind(this, opcode);

    this._t += inst.cycles;
    this._pc += inst.bytes;
};

// Instructions

var instFn = {};

module.exports = new Cpu;
