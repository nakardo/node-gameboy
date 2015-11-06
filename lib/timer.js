'use strict';

var debug = require('debug')('timer');

// - http://www.codeslinger.co.uk/pages/projects/gameboy/timers.html
// - http://fms.komkon.org/GameBoy/Tech/Software.html

var CLOCK_SPEED = 4194304;

// FF04 -- DIVIDER [RW] Divider [meaning unknown]

var DIVIDER = 0xFF04;

// FF05 -- TIMECNT [RW] Timer Counter
//         This register contains constantly increasing number. The timer
//         interrupt occurs when this register overflows.

var TIMECNT = 0xFF05;

// FF06 -- TIMEMOD [RW] Timer Modulo
//         The contents of TIMEMOD are loaded into TIMECNT every time TIMECNT
//         overflows.

var TIMEMOD = 0xFF06;

// FF07 -- TIMCONT [RW] Timer Control            | when set to 1 | when set to 0
// Bit2    Start/Stop timer                      | COUNTING      | STOPPED
// Bit1-0  Timer clock select:
//   00 - 4096Hz    01 - 262144Hz    10 - 65536Hz    11 - 16384Hz

var TIMCONT = 0xFF07;


function Timer(mmu) {

    this._mmu = mmu;

    Object.seal(this);
}

Timer.prototype.update = function (cycles) {

    this._mmu.writeByte(TIMECNT, cycles);
    console.log(cycles);
};

// The Timer Controller:
//
// The timer controller (TMC) is a 3 bit register which controlls the
// timer (DUH!). Bit 1 and 0 combine together to specify which frequency the
// timer should increment at. This is the mapping:
//
// 00: 4096 Hz
// 01: 262144 Hz
// 10: 65536 Hz
// 11: 16384 Hz

Timer.prototype.isTimerEnabled = function () {
    return this._mmu.readByte(TIMCONT) & 0x10 ? true : false;
};

module.exports = Timer;
