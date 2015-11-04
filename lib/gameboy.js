'use strict';

var Cpu = require('./cpu');
var Mmu = require('./mmu');
var Gpu = require('./gpu');

// - http://www.codeslinger.co.uk/pages/projects/gameboy/beginning.html

var MAX_CYCLES = 69905;

var TIMECNT = 0xFF05;
var TIMEMOD = 0xFF06;
var TIMCONT = 0xFF07;

function Gameboy() {

    if (!(this instanceof Gameboy)) {
        return new Gameboy;
    }

    this._cart = null;
    this._immediate = null;

    this._gpu = new Gpu;
    this._mmu = new Mmu(this._gpu);
    this._cpu = new Cpu(this._mmu);

    Object.seal(this);
}

Gameboy.prototype.powerOn = function () {

    this._gpu.powerOn();
    this._mmu.powerOn();
    this._cpu.powerOn();

    var loop = function () {

        var runCycle = this._cpu.runCycle.bind(this._cpu);

        if (this._cpu.t < MAX_CYCLES) {
            this._mmu.writeByte(TIMECNT, this._cpu.t);
            return this._immediate = setImmediate(runCycle, loop);
        }

        this._cpu.t = 0;
        this._immediate = setImmediate(runCycle, loop);
    }
    .bind(this);

    loop();
};

Gameboy.prototype.reset = function () {

    this._gpu.reset();
    this._mmu.reset();
    this._cpu.reset();
};

Gameboy.prototype.insertCart = function (cart) {

    this._cart = cart;
    this._mmu.loadCart(this._cart);
};

module.exports = Gameboy;
