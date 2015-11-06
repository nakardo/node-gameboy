'use strict';

var debug = require('debug')('timer');

//- http://www.codeslinger.co.uk/pages/projects/gameboy/timers.html

var CLOCK_SPEED = 4194304;

var TIMECNT = 0xFF05;
var TIMEMOD = 0xFF06;
var TIMCONT = 0xFF07;


function Timer(mmu) {

    this._mmu = mmu;

    Object.seal(this);
}

Timer.prototype.update = function (cycles) {

    this._mmu.writeByte(TIMECNT, cycles);
    console.log(cycles);
};

module.exports = Timer;
