'use strict';

const step = require('debug')('timer:step');
const divider = require('debug')('timer:divider');
const counter = require('debug')('timer:counter');
const { DIV, TIMA, TMA, TAC, IF } = require('./registers');
const { INT_50 } = require('./interrupts');

const MAX_DIVIDER = 16384;


class Timer {
    constructor (mmu) {
        this._mmu = mmu;

        // Registers

        this._mmu.timer = this;

        this._div = 0;
        this._tima = 0;
        this._tma = 0;
        this._tac = 0;

        // Timers

        this._divider = MAX_DIVIDER;
        this._t = this._clockSelect();
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

        if (!(this._tac & 4)) return;

        this._t -= cycles;
        if (this._t > 0) return;

        this._tima = ++this._tima & 0xff;
        if (!this._tima) {
            this._tima = this._tma;

            const pre = this._mmu.readByte(IF);
            const cur = pre | INT_50;
            if (pre != cur) this._mmu.writeByte(IF, cur);
        }
        counter('0x%s', this._tima.toString(16));

        this._t += this._clockSelect();
    }

    readByte (addr) {
        switch (addr) {
            case DIV: return this._div;
            case TIMA: return this._tima;
            case TMA: return this._tma;
            case TAC: return this._tac;
        }

        return 0;
    }

    writeByte (addr, val) {
        switch (addr) {
            case DIV: return this._div = val;
            case TIMA: return this._tima = val;
            case TMA: return this._tma = val;
            case TAC: return this._tac = val;
        }

        return val;
    }

    _clockSelect () {
        switch (this._tac & 3) {
            case 0: return 4096;   // 00: CPU Clock / 1024
            case 1: return 262144; // 01: CPU Clock / 16
            case 2: return 65536;  // 10: CPU Clock / 64
            case 3: return 16384; // 11: CPU Clock / 256
        }
    }
}

module.exports = Timer;
