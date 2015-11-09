'use strict';

var assert = require('assert');
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
//         00 - 4096Hz    01 - 262144Hz    10 - 65536Hz    11 - 16384Hz

var TIMCONT = 0xFF07;

var onHregUpdate = function (addr, effective, current, updated) {

    debug('hreg update 0x%s=0x%s', addr.toString(16), updated.toString(16));

    switch (addr) {
        case DIVIDER:
            this._mmu._zram[effective] = 0;
            break;
        case TIMECNT:
            var newfreq = this.getClockFreq();
            if (this.getClockFreq(current) !== newfreq) {
                this._counter = newfreq;
            }
            break;
    }
}


function Timer(mmu) {

    assert(mmu !== null, 'Invalid MMU');

    this._mmu = mmu;

    // Events

    this._mmu.on('hreg_update', onHregUpdate.bind(this));

    // Counters

    this._divider = 0;
    this._counter = 0;

    Object.seal(this);
}

Timer.prototype.powerOn = function () {

    debug('power on');

    this._counter = this.getClockFreq();
};

Timer.prototype.step = function (cycles) {

    this.updateDivider(cycles);

    if (!this.isTimerEnabled()) return;

    this._counter -= cycles;

    if (this._counter <= 0) {
        this._counter = this.getClockFreq();

        var counter = this._mmu.readByte(TIMECNT);
        if (counter === 0xFF) {
            this._mmu.writeByte(TIMECNT, this._mmm.readByte(TIMEMOD));
        } else {
            this._mmu.writeByte(TIMECNT, ++counter);
        }
    }
};

Timer.prototype.updateDivider = function (cycles) {

    this._divider += cycles;

    if (this._divider >= 0xFF) {
        this._divider = 0;

        // You may be wondering why I am incrementing the divider register
        // directly and not using WriteMemory. The answer is that the gameboy
        // hardware does not allow writing to the divider register and when ever
        // the game tries to do so it resets the divider register to 0.

        this._mmu._zram[DIVIDER - 0xFF80]++;
    }
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
//
// Bit 2 specifies whether the timer is enabled(1) or disabled(0).

Timer.prototype.isTimerEnabled = function () {
    return this._mmu.readByte(TIMCONT) & 0x4 ? true : false;
};

Timer.prototype.getClockFreq = function (value) {

    var freq = value || this._mmu.readByte(TIMCONT);
    switch (freq & 0x3) {
        case 0: return CLOCK_SPEED / 4096;      // 00: 4096 Hz
        case 1: return CLOCK_SPEED / 262144;    // 01: 262144 Hz
        case 2: return CLOCK_SPEED / 65536;     // 10: 65536 Hz
        case 3: return CLOCK_SPEED / 16384;     // 11: 16384 Hz
    }

    debug('unknown clock frequency. stop');
    process.exit(1);
};

module.exports = Timer;
