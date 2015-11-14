'use strict';

var assert = require('assert');
var debug = require('debug')('timer');

// - http://www.codeslinger.co.uk/pages/projects/gameboy/timers.html
// - http://fms.komkon.org/GameBoy/Tech/Software.html

var CLOCK_SPEED = 4194304;

// FF04 -- DIVIDER [RW] Divider [meaning unknown]

var DIVIDER = 0xFF04;

// FF05 -- TIMECNT [RW] Timer Counter
// This register contains constantly increasing number. The timer interrupt
// occurs when this register overflows.

var TIMECNT = 0xFF05;

// FF06 -- TIMEMOD [RW] Timer Modulo
// The contents of TIMEMOD are loaded into TIMECNT every time TIMECNT overflows.

var TIMEMOD = 0xFF06;

// FF07 -- TIMCONT [RW] Timer Control            | when set to 1 | when set to 0
// Bit2    Start/Stop timer                      | COUNTING      | STOPPED
// Bit1-0  Timer clock select:
// 00 - 4096Hz    01 - 262144Hz    10 - 65536Hz    11 - 16384Hz

var TIMCONT = 0xFF07;

var onIoWriteEvent = function (addr, current, updated) {

    debug('hreg update 0x%s=0x%s', addr.toString(16), updated.toString(16));

    switch (addr) {
        case DIVIDER:
            this._mmu._zram[DIVIDER - 0xFF00] = 0;
            break;
        case TIMECNT:
            var newfreq = this.getClockFreq();
            if (this.getClockFreq(current) !== newfreq) {
                this._counter = newfreq;
            }
            break;
    }
}


function Timer(cpu, mmu) {

    this._cpu = cpu;
    this._mmu = mmu;

    // Events

    this._mmu.on('io_write', onIoWriteEvent.bind(this));

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

    debug('step');

    this.updateDivider(cycles);

    if (!this.isTimerEnabled()) return;

    this._counter -= cycles;

    if (this._counter <= 0) {
        this._counter = this.getClockFreq();

        debug('reset counter, updated freq %s hz.', this._counter);

        var counter = this._mmu.readByte(TIMECNT);
        if (counter === 0xFF) {
            this._mmu.writeByte(TIMECNT, this._mmm.readByte(TIMEMOD));
            this._cpu.serviceInterrupt(2);
        } else {
            this._mmu.writeByte(TIMECNT, ++counter);
        }
    }
};

// Divider Register:
//
// The final timing related area that needs emulating is the Divider Register.
// It works very similar to the timers which is why I have included it in this
// section aswell as put the code to emulate it inside the UpdateTimers
// function. The way it works is it continually counts up from 0 to 255 and then
// when it overflows it starts from 0 again. It does not cause an interupt when
// it overflows and it cannot be paused like the timers. It counts up at a
// frequency of 16382 which means every 256 CPU clock cycles the divider
// register needs to increment.

Timer.prototype.updateDivider = function (cycles) {

    debug('update divider');

    this._divider += cycles;

    if (this._divider >= 0xFF) {
        this._divider = 0;

        debug('reset divider');

        // You may be wondering why I am incrementing the divider register
        // directly and not using WriteMemory. The answer is that the gameboy
        // hardware does not allow writing to the divider register and when ever
        // the game tries to do so it resets the divider register to 0.

        this._mmu._zram[DIVIDER - 0xFF00]++;
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
