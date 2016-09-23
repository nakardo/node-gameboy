'use strict';

const debug = require('debug')('lcd');
const mode = require('debug')('lcd:mode');
const line = require('debug')('lcd:line');
const { LY, LYC, STAT, IF } = require('./registers');

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

        /**
         * The STAT register (FF41) selects the conditions that will generate
         * this interrupt (expecting that interrupts are enabled via EI or RETI
         * and that IE.1 (FFFF.1) is set).
         *      STAT.3        HBLANK  (start of mode 0)
         *      STAT.4        VBLANK  (start of mode 1) (additional to INT 40)
         *      STAT.5        OAM     (start of mode 2 and mode 1)
         *      STAT.6        LY=LYC  (see info about LY=00)
         */
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
            if (prev != cur) this._requestInterrupt();
            return;
        }

        // Line

        line('%d', ly);

        /**
         * INT 40 - V-Blank Interrupt
         *
         * The V-Blank interrupt occurs ca. 59.7 times a second on a regular GB
         * and ca. 61.1 times a second on a Super GB (SGB). This interrupt
         * occurs at the beginning of the V-Blank period (LY=144).
         * During this period video hardware is not using video ram so it may be
         * freely accessed. This period lasts approximately 1.1 milliseconds.
         */
        if (ly == 144) this._mmu.writeByte(IF, this._mmu.readByte(IF) | 1);

        // Coincidence line

        if (ly == this._mmu.readByte(LYC)) {
            this._requestInterrupt();
            stat |= 1 << 2;
        }

        this._mmu.writeByte(STAT, stat);
        this._mmu.writeByte(LY, ly < 153 ? ly + 1 : 0);

        if (ly < 144) this._gpu.drawLine(ly);

        if (ly < 153) this._t += MAX_CYCLES;
        else this._t = MAX_CYCLES;
    }

    _requestInterrupt () {
        /**
         * INT 48 - LCDC Status Interrupt
         *
         * There are various reasons for this interrupt to occur as
         * described by the STAT register ($FF40). One very popular reason
         * is to indicate to the user when the video hardware is about to
         * redraw a given LCD line. This can be useful for dynamically
         * controlling the SCX/SCY registers ($FF43/$FF42) to perform
         * special video effects.
         */
        this._mmu.writeByte(IF, this._mmu.readByte(IF) | 1 << 1);
    }
}

module.exports = Lcd;
