var Cpu = require('./cpu');
var Mmu = require('./mmu');
var Gpu = require('./gpu');


function Gameboy() {

    if (!(this instanceof Gameboy)) {
        return new Gameboy;
    }

    this.gpu = new Gpu;
    this.mmu = new Mmu(this.gpu);
    this.cpu = new Cpu(this.mmu);
}

Gameboy.prototype.powerOn = function () {

    this.gpu.powerOn();
    this.mmu.powerOn();
    this.cpu.powerOn();
};

Gameboy.prototype.reset = function () {

    this.gpu.reset();
    this.mmu.reset();
    this.cpu.reset();
};

Gameboy.prototype.insertCart = function (cart) {

    this.mmu.loadCart(cart);
};

module.exports = Gameboy;
