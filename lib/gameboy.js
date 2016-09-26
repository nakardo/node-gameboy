'use strict';

const debug = require('debug');
const Cpu = require('./cpu');
const Gpu = require('./gpu');
const Mmu = require('./mmu');
const Canvas = require('./canvas');


class Gameboy {
    constructor () {
        this._mmu = new Mmu();
        this._gpu = new Gpu(this._mmu, new Canvas());
        this._cpu = new Cpu(this._mmu, this._gpu);
    }

    get gpu () { return this._gpu; }

    powerOn () {
        debug('power on');

        this._mmu.powerOn();
        this._gpu.powerOn();
        this._cpu.powerOn();
    }

    loadCart (data) {
        this._mmu.loadCart(data);
    }
}

module.exports = Gameboy;
