'use strict';

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

    loadCart (data) {
        this._mmu.loadCart(data);
    }
}

module.exports = Gameboy;
