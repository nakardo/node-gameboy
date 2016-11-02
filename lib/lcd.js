'use strict';

const step = require('debug')('lcd:step');
const stat = require('debug')('lcd:stat');
const { LCDSTAT, CURLINE, CMPLINE } = require('./registers');
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

        /**
         * Mode Flag
         *
         * Mode 0 is present between 201-207 clks, 2 about 77-83 clks, and
         * 3 about 169-175 clks. A complete cycle through these states takes
         * 456 clks. VBlank lasts 4560 clks. A complete screen refresh
         * occurs every 70224 clks.
         */
        let mode = 0;

        if (this._ly < 144) {
            if (this._t > 376) mode = 2;
            else if (this._t > 204) mode = 3;
        }
        else if (this._ly < 154) mode = 1;

        if (mode != (this._stat & 3)) {
            this._stat &= ~3;
            this._stat |= mode;

            let intf = false;
            switch (mode) {
                case 0: if (this._stat & 8) intf = true; break;
                case 2: if (this._stat & 0x10) intf = true;
                case 1: if (this._stat & 0x20) intf = true;
            }

            if (intf) this._mmu.if |= INT_48;
        }

        if (this._t > 0) return;

        stat('mode=%d; ly=%d; 0b%s', mode, this._ly, this._stat.toString(2));

        // V-Blank

        if (this._ly == 144) this._mmu.if |= INT_40;

        // Draw

        if (this._ly < 144) this._gpu.drawLine(this._ly);

        if (this._ly < 153) {
            this._t += MAX_CYCLES;
            this._ly++;
        } else {
            this._t = MAX_CYCLES;
            this._ly = 0;
        }

        // Coincidence line

        if (this._ly == this._lyc) {
            this._stat |= 1 << 2;
            if (this._stat & 0x40) this._mmu.if |= INT_48;
        }
        else this._stat &= ~(1 << 2);
    }

    readByte (addr) {
        switch (addr) {
            case LCDSTAT: return this._stat;
            case CURLINE: return this._ly;
            case CMPLINE: return this._lyc;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    writeByte (addr, val) {
        switch (addr) {
            case LCDSTAT: return this._stat |= val & 0x78;
            case CURLINE: return this._ly = 0;
            case CMPLINE: return this._lyc = val;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }
}

module.exports = Lcd;
