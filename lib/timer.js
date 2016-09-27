'use strict';

const debug = require('debug')('timer');
const divider = require('debug')('timer:divider');
const counter = require('debug')('timer:counter');
const { IF } = require('./registers');
const { INT_50 } = require('./interrupts');

const MAX_DIVIDER = 16384;


class Timer {
    constructor (mmu) {
        this._mmu = mmu;
        this._mmu.timer = this;

        // Registers

        this.div = 0;
        this.tac = 0;
        this.tma = 0;
        this.tima = 0;

        // Timers

        this._divider = MAX_DIVIDER;
        this._t = this._clockSelect();
    }

    step (cycles) {
        debug('step');

        // Divider

        this._divider -= cycles;
        if (this._divider <= 0) {
            this.div = ++this.div & 0xff;
            divider('0x%s', this.div.toString(16));

            this._divider += MAX_DIVIDER;
        }

        // Timer

        if (!(this.tac & 4)) return;

        this._t -= cycles;
        if (this._t > 0) return;

        this.tima = ++this.tima & 0xff;
        if (!this.tima) {
            this.tima = this.tma;
            this._mmu.writeByte(IF, this._mmu.readByte(IF) | INT_50);
        }
        counter('0x%s', this.tima.toString(16));

        this._t += this._clockSelect();
    }

    _clockSelect () {
        switch (this.tac & 3) {
            case 0: return 4096;   // 00: CPU Clock / 1024
            case 1: return 262144; // 01: CPU Clock / 16
            case 2: return 65536;  // 10: CPU Clock / 64
            default: return 16384; // 11: CPU Clock / 256
        }
    }
}

module.exports = Timer;
