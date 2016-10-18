'use strict';

const step = require('debug')('lcd:step');
const mode = require('debug')('lcd:mode');
const line = require('debug')('lcd:line');
const { STAT, LY, LYC } = require('./registers');
const { INT_40, INT_48 } = require('./interrupts');

const MAX_CYCLES = 456;


class Lcd {
    constructor (mmu, gpu) {
        this._mmu = mmu;
        this._gpu = gpu;

        // Registers

        this._stat = 0;
        this._ly = 0;
        this._lyc = 0;

        // Timer

        this._t = MAX_CYCLES;
    }

    step (cycles) {
        step('%d', cycles);

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
        const ly = this._ly;
        if (ly < 144) {
            if (this._t > 376) stat |= 2;
            else if (this._t > 204) stat |= 3;
        }
        else if (ly < 154) stat |= 1;

        const pre = this._stat & 3;
        const cur = stat & 3;

        if (pre != cur) switch (cur) {
            case 1: this._stat |= 1 << 4;
            case 2: this._stat |= 1 << 5; break;
            case 0: this._stat |= 1 << 3; break;
        }

        mode('%d; ly=%d', cur, ly);

        if (this._t > 0) {
            if (pre != cur) this._mmu.if |= INT_48;
            return;
        }

        // Line

        line('%d', ly);

        if (ly == 144) this._mmu.if |= INT_40;

        // Coincidence line

        if (ly == this._lyc) {
            this._mmu.if |= INT_48;
            this._stat |= 1 << 2;
        }

        if (ly < 144) this._gpu.drawLine(ly);

        // Next Scanline

        this._ly = ly < 153 ? ly + 1 : 0;

        if (ly < 153) this._t += MAX_CYCLES;
        else this._t = MAX_CYCLES;
    }

    readByte (addr) {
        switch (addr) {
            case STAT: return this._stat;
            case LY: return this._ly;
            case LYC: return this._lyc;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    writeByte (addr, val) {
        switch (addr) {
            case STAT: return this._stat = val;
            case LY: return this._ly = val;
            case LYC: return this._lyc = val;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }
}

module.exports = Lcd;
