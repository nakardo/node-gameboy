'use strict';

var debug = require('debug')('gameboy');

var Cpu = require('./cpu');
var Mmu = require('./mmu');
var Gpu = require('./gpu');
var Timer = require('./ctrl/timer');
var Lcd = require('./ctrl/lcd');

// - http://www.codeslinger.co.uk/pages/projects/gameboy/beginning.html

var MAX_CYCLES = 69905;


function Gameboy() {

    if (!(this instanceof Gameboy)) {
        return new Gameboy;
    }

    this._cart = null;
    this._immediate = null;

    this._gpu = new Gpu;
    this._mmu = new Mmu(this._gpu);
    this._cpu = new Cpu(this._mmu);

    // Controllers

    this._timer = new Timer(this._cpu, this._mmu);
    this._lcd = new Lcd(this._cpu, this._mmu);

    Object.seal(this);
}

Gameboy.prototype.powerOn = function () {

    this._gpu.powerOn();
    this._mmu.powerOn();
    this._cpu.powerOn();
    this._timer.powerOn();
    this._lcd.powerOn();

    this.start();
};

Gameboy.prototype.start = function () {

    var runCycle = this._cpu.runCycle.bind(this._cpu);

    var loop = function (cycles) {

        // `MAX_CYCLES` is the number of cycles to run at 60 fps.

        if (this._cpu.t < MAX_CYCLES) {
            this._timer.step(cycles);
            this._lcd.step(cycles);

            this._cpu.serviceInterupts();
        }
        else this._cpu.t = 0;

        this._immediate = setImmediate(runCycle, loop);
    }
    .bind(this);

    loop(0);
};

Gameboy.prototype.stop = function () {

    debug('stop emulation');

    clearImmediate(this._immediate);
};

Gameboy.prototype.insertCart = function (cart) {

    this._cart = cart;
    this._mmu.loadCart(this._cart);
};

module.exports = Gameboy;
