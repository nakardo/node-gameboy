var Cpu = require('cpu');
var Mmu = require('mmu');


module.exports = function Gameboy() {

    this._mmu = new Mmu;
    this._cpu = new Cpu(this._mmu);
}

Gameboy.prototype.powerOn = function () {

    this._mmu.powerOn();
    this._cpu.powerOn();
};

Gameboy.prototype.reset = function () {

    this._mmu.reset();
    this._cpu.reset();
};

Gameboy.prototype.insertCart = function (cart) {

    this._mmu.loadCart(cart);
};
