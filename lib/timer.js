'use strict';

const debug = require('debug');
const timer = require('debug')('timer');
const divider = require('debug')('divider');


/**
 * FF04 - DIV - Divider Register (R/W)
 *
 * This register is incremented at rate of 16384Hz (~16779Hz on SGB). Writing
 * any value to this register resets it to 00h.
 *
 * Note: The divider is affected by CGB double speed mode, and will increment
 * at 32768Hz in double speed.
 */
const DIV = 0xff04;

/**
 * FF05 - TIMA - Timer counter (R/W)
 *
 * This timer is incremented by a clock frequency specified by the TAC
 * register ($FF07). When the value overflows (gets bigger than FFh) then it
 * will be reset to the value specified in TMA (FF06), and an interrupt will be
 * requested, as described below.
 */
const TIMA = 0xff05;

/**
 * FF06 - TMA - Timer Modulo (R/W)
 *
 * When the TIMA overflows, this data will be loaded.
 */
const TMA = 0xff06;

/**
 * FF07 - TAC - Timer Control (R/W)
 *
 * Bit 2    - Timer Enable
 * Bits 1-0 - Input Clock Select
 *            00: CPU Clock / 1024 (DMG, CGB:   4096 Hz, SGB:   ~4194 Hz)
 *            01: CPU Clock / 16   (DMG, CGB: 262144 Hz, SGB: ~268400 Hz)
 *            10: CPU Clock / 64   (DMG, CGB:  65536 Hz, SGB:  ~67110 Hz)
 *            11: CPU Clock / 256  (DMG, CGB:  16384 Hz, SGB:  ~16780 Hz)
 *
 * Note: The "Timer Enable" bit only affects the timer, the divider is ALWAYS
 * counting.
 */
const TAC = 0xff07;

const MAX_DIVIDER = 16384;


class Timer {
    constructor (mmu) {
        this._mmu = mmu;

        this._divider = 0;
        this._t = 0;
    }

    step (cycles) {
        debug('step');

        this._divider += cycles;
        this._t += cycles;

        if (this._divider > MAX_DIVIDER) {
            const counter = this._mmu.readByte(DIV) + 1;

            divider('update %s', counter.toString(16));
            this._mmu.writeByte(DIV, counter);

            this._divider = 0;
        }

        const control = this._mmu.readByte(TAC);
        if (control & 0x4 == 0) {
            return;
        }

        if (this._t > this._clock(control)) {
            let counter = this._mmu.readByte(TIMA);
            if (++counter == 0) counter = this._mmu.readByte(TMA);

            timer('update 0x%s', counter.toString(16));

            this._mmu.writeByte(TIMA, counter);
        }
    }

    _clock (control) {
        switch (control & 0x3) {
            case 0: return 4096;   // 00: CPU Clock / 1024
            case 1: return 262144; // 01: CPU Clock / 16
            case 2: return 65536;  // 10: CPU Clock / 64
            case 3: return 16384;  // 11: CPU Clock / 256
        }
    }
}

module.exports = Timer;
