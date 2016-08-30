'use strict';

const fs = require('fs');
const debug = require('debug')('gb');
const Cpu = require('./cpu');
const Mmu = require('./mmu');


class Gameboy {
    constructor() {
        this._mmu = new Mmu();
        this._cpu = new Cpu(this._mmu);
    }

    powerOn () {
        debug('power on');
        this._mmu.powerOn();
        this._cpu.powerOn();
    }

    loadCart (filename) {
        this._mmu.loadCart(fs.readFileSync(filename));
    }
}

module.exports = Gameboy;
