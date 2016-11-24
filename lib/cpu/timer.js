'use strict';

const step = require('debug')('gameboy:timer:step');
const divider = require('debug')('gameboy:timer:divider');
const counter = require('debug')('gameboy:timer:counter');
const Serializable = require('../util/serializable');
const { DIV, TIMA, TMA, TAC } = require('../registers');
const { INT_50 } = require('../interrupts');

const MAX_DIVIDER = 16384;

// Timer Clock Select

const CLOCK_SELECT = [];

CLOCK_SELECT[0] = 4096;   // 00: CPU Clock / 1024
CLOCK_SELECT[1] = 262144; // 01: CPU Clock / 16
CLOCK_SELECT[2] = 65536;  // 10: CPU Clock / 64
CLOCK_SELECT[3] = 16384;  // 11: CPU Clock / 256


class Timer extends Serializable({ exclude: ['_mmu'] }) {
    constructor (mmu) {
        super();
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

    init () {
        this._div = 0;
        this._tima = 0;
        this._tma = 0;
        this._tac = 0;

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
            case DIV: return this._div;
            case TIMA: return this._tima;
            case TMA: return this._tma;
            case TAC: return this._tac;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    writeByte (addr, val) {
        switch (addr) {
            case DIV: return this._div = 0;
            case TIMA: return this._tima = val;
            case TMA: return this._tma = val;
            case TAC: return this._tac = val;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }
}

module.exports = Timer;
