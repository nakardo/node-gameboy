var Cpu = require('./cpu');
var Mmu = require('./mmu');


function Gameboy() {

    if (!(this instanceof Gameboy)) {
        return new Gameboy;
    }

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

module.exports = Gameboy;
