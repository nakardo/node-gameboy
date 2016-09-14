'use strict';

const debug = require('debug')('timer');
const divider = require('debug')('timer:divider');
const counter = require('debug')('timer:counter');

const MAX_DIVIDER = 16384;

/**
 * FF04 - DIV - Divider Register (R/W)
 *
 * This register is incremented at rate of 16384Hz (~16779Hz on SGB).
 * Writing any value to this register resets it to 00h.
 *
 * Note: The divider is affected by CGB double speed mode, and will
 * increment at 32768Hz in double speed.
 */
const DIV = 0xff04;

/**
 * FF05 - TIMA - Timer counter (R/W)
 *
 * This timer is incremented by a clock frequency specified by the TAC
 * register ($FF07). When the value overflows (gets bigger than FFh)
 * then it will be reset to the value specified in TMA (FF06), and an
 * interrupt will be requested, as described below.
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
 *      00: CPU Clock / 1024 (DMG, CGB:   4096 Hz, SGB:   ~4194 Hz)
 *      01: CPU Clock / 16   (DMG, CGB: 262144 Hz, SGB: ~268400 Hz)
 *      10: CPU Clock / 64   (DMG, CGB:  65536 Hz, SGB:  ~67110 Hz)
 *      11: CPU Clock / 256  (DMG, CGB:  16384 Hz, SGB:  ~16780 Hz)
 *
 * Note: The "Timer Enable" bit only affects the timer, the divider is
 * ALWAYS counting.
 */
const TAC = 0xff07;

/**
 * FF0F - IF - Interrupt Flag (R/W)
 *
 * Bit 0: V-Blank  Interrupt Request (INT 40h)  (1=Request)
 * Bit 1: LCD STAT Interrupt Request (INT 48h)  (1=Request)
 * Bit 2: Timer    Interrupt Request (INT 50h)  (1=Request)
 * Bit 3: Serial   Interrupt Request (INT 58h)  (1=Request)
 * Bit 4: Joypad   Interrupt Request (INT 60h)  (1=Request)
 */
const IF = 0xff0f;


class Timer {
    constructor (mmu) {
        this._mmu = mmu;

        // Timers

        this._divider = MAX_DIVIDER;
        this._t = this._clockSelect(0);
    }

    step (cycles) {
        debug('step');

        this._divider -= cycles;
        this._t -= cycles;

        // Divider

        if (this._divider <= 0) {
            const div = this._mmu.writeByte(DIV, this._mmu.readByte(DIV) + 1);
            divider('0x%s', div.toString(16));

            this._divider += MAX_DIVIDER;
        }

        // Timer

        const tac = this._mmu.readByte(TAC);

        // Timer Enable

        if (tac & 4 == 0) return;

        // Timer counter

        if (this._t > 0) return;

        let tima = this._mmu.readByte(TIMA) + 1 & 0xff;
        if (tima == 0) {
            tima = this._mmu.readByte(TMA);

            /**
             * INT 50 - Timer Interrupt
             *
             * Each time when the timer overflows (ie. when TIMA gets
             * bigger than FFh), then an interrupt is requested by setting
             * Bit 2 in the IF Register (FF0F). When that interrupt is
             * enabled, then the CPU will execute it by calling the timer
             * interrupt vector at 0050h.
             */
            this._mmu.writeByte(IF, this._mmu.readByte(IF) | 1 << 2);
        }
        this._mmu.writeByte(TIMA, tima);
        counter('0x%s', tima.toString(16));

        this._t += this._clockSelect(tac);
    }

    _clockSelect (input) {
        switch (input & 3) {
            case 0: return 4096;   // 00: CPU Clock / 1024
            case 1: return 262144; // 01: CPU Clock / 16
            case 2: return 65536;  // 10: CPU Clock / 64
            default: return 16384; // 11: CPU Clock / 256
        }
    }
}

module.exports = Timer;
