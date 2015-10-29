'use strict';

var Cpu = require('./cpu');
var Mmu = require('./mmu');
var Gpu = require('./gpu');


function Gameboy() {

    if (!(this instanceof Gameboy)) {
        return new Gameboy;
    }

    this._gpu = new Gpu;
    this._mmu = new Mmu(this._gpu);
    this._cpu = new Cpu(this._mmu);
}

Gameboy.prototype.powerOn = function () {

    this._gpu.powerOn();
    this._mmu.powerOn();
    this._cpu.powerOn();
};

Gameboy.prototype.reset = function () {

    this._gpu.reset();
    this._mmu.reset();
    this._cpu.reset();
};

Gameboy.prototype.insertCart = function (cart) {

    this._mmu.loadCart(cart);
};

module.exports = Gameboy;
