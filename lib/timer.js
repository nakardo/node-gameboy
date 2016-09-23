'use strict';

const debug = require('debug')('timer');
const divider = require('debug')('timer:divider');
const counter = require('debug')('timer:counter');
const { DIV, TAC, TMA, TIMA, IF } = require('./registers');

const MAX_DIVIDER = 16384;


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

        if (!(tac & 4)) return;

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
