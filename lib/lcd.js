'use strict';

const debug = require('debug')('lcd');
const mode = require('debug')('lcd:mode');
const line = require('debug')('lcd:line');
const { LY, LYC, STAT, IF } = require('./registers');
const { INT_40, INT_48 } = require('./interrupts');

const MAX_CYCLES = 456;


class Lcd {
    constructor (mmu, gpu) {
        this._mmu = mmu;
        this._gpu = gpu;

        this._t = MAX_CYCLES;
    }

    step (cycles) {
        debug('step');

        this._t -= cycles;

        // LCDC Status

        let stat = 0;

        /**
         * Mode Flag
         *
         * Mode 0 is present between 201-207 clks, 2 about 77-83 clks, and
         * 3 about 169-175 clks. A complete cycle through these states takes
         * 456 clks. VBlank lasts 4560 clks. A complete screen refresh
         * occurs every 70224 clks.
         */
        const ly = this._mmu.readByte(LY);
        if (ly < 144) {
            if (this._t > 376) stat |= 2;
            else if (this._t > 204) stat |= 3;
        }
        else if (ly < 154) stat |= 1;

        const prev = this._mmu.readByte(STAT) & 3;
        const cur = stat & 3;

        if (prev != cur) switch (cur) {
            case 1: stat |= 1 << 4;
            case 2: stat |= 1 << 5; break;
            case 0: stat |= 1 << 3; break;
        }

        mode('%d; ly=%d', cur, ly);

        if (this._t > 0) {
            this._mmu.writeByte(STAT, stat);
            if (prev != cur) this._requestInterrupt(INT_48);
            return;
        }

        // Line

        line('%d', ly);

        if (ly == 144) this._requestInterrupt(INT_40);

        // Coincidence line

        if (ly == this._mmu.readByte(LYC)) {
            this._requestInterrupt(INT_48);
            stat |= 1 << 2;
        }

        this._mmu.writeByte(STAT, stat);
        this._mmu.writeByte(LY, ly < 153 ? ly + 1 : 0);

        if (ly < 144) this._gpu.drawLine(ly);

        if (ly < 153) this._t += MAX_CYCLES;
        else this._t = MAX_CYCLES;
    }

    _requestInterrupt (mask) {
        this._mmu.writeByte(IF, this._mmu.readByte(IF) | mask);
    }
}

module.exports = Lcd;
