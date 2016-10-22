'use strict';

const step = require('debug')('timer:step');
const divider = require('debug')('timer:divider');
const counter = require('debug')('timer:counter');
const { INT_50 } = require('./interrupts');

const MAX_DIVIDER = 16384;

/**
 * FF04 - DIVIDER - Divider Register (R/W)
 *
 * This register is incremented at rate of 16384Hz (~16779Hz on SGB).
 * Writing any value to this register resets it to 00h.
 *
 * Note: The divider is affected by CGB double speed mode, and will
 * increment at 32768Hz in double speed.
 */
const DIVIDER = 0xff04;

/**
 * FF05 - TIMECNT - Timer counter (R/W)
 *
 * This timer is incremented by a clock frequency specified by the TAC
 * register ($FF07). When the value overflows (gets bigger than FFh)
 * then it will be reset to the value specified in TMA (FF06), and an
 * interrupt will be requested, as described below.
 */
const TIMECNT = 0xff05;

/**
 * FF06 - TIMEMOD - Timer Modulo (R/W)
 *
 * When the TIMA overflows, this data will be loaded.
 */
const TIMEMOD = 0xff06;

/** FF07 - TIMCONT - Timer Control (R/W)
 *
 * Bit 2    - Timer Enable
 * Bits 1-0 - Input Clock Select
 *      00: CPU Clock / 1024 (DMG, CGB:   4096 Hz, SGB:   ~4194 Hz)
 *      01: CPU Clock / 16   (DMG, CGB: 262144 Hz, SGB: ~268400 Hz)
 *      10: CPU Clock / 64   (DMG, CGB:  65536 Hz, SGB:  ~67110 Hz)
 *      11: CPU Clock / 256  (DMG, CGB:  16384 Hz, SGB:  ~16780 Hz)
 *
 * Note: The "Timer Enable" bit only affects the timer, the divider is
 * ALWAYS counting.
 */
const TIMCONT = 0xff07;

// Timer Clock Select

const CLOCK_SELECT = [];

CLOCK_SELECT[0] = 4096;   // 00: CPU Clock / 1024
CLOCK_SELECT[1] = 262144; // 01: CPU Clock / 16
CLOCK_SELECT[2] = 65536;  // 10: CPU Clock / 64
CLOCK_SELECT[3] = 16384;  // 11: CPU Clock / 256


class Timer {
    constructor (mmu) {
        this._mmu = mmu;

        // Registers

        this._div = 0;
        this._tima = 0;
        this._tma = 0;
        this._tac = 0;

        // Timers

        this._divider = MAX_DIVIDER;
        this._t = CLOCK_SELECT[0];
    }

    step (cycles) {
        step('%d', cycles);

        // Divider

        this._divider -= cycles;
        if (this._divider <= 0) {
            this._div = ++this._div & 0xff;
            divider('0x%s', this._div.toString(16));

            this._divider += MAX_DIVIDER;
        }

        // Timer

        if ((this._tac & 4) == 0) return;

        this._t -= cycles;
        if (this._t > 0) return;

        this._tima = ++this._tima & 0xff;
        if (this._tima == 0) {
            this._tima = this._tma;
            this._mmu.if |= INT_50;
        }
        counter('0x%s', this._tima.toString(16));

        this._t += CLOCK_SELECT[this._tac & 3];
    }

    readByte (addr) {
        switch (addr) {
            case DIVIDER: return this._div;
            case TIMECNT: return this._tima;
            case TIMEMOD: return this._tma;
            case TIMCONT: return this._tac;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    writeByte (addr, val) {
        switch (addr) {
            case DIVIDER: return this._div = 0;
            case TIMECNT: return this._tima = val;
            case TIMEMOD: return this._tma = val;
            case TIMCONT: return this._tac = val;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }
}

module.exports = Timer;
