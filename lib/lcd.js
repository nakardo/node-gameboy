'use strict';

const debug = require('debug')('lcd');
const debugLy = require('debug')('lcd:ly');

const MAX_CYCLES = 456;

/**
 * FF41 - STAT - LCDC Status (R/W)
 *
 * Bit 6 - LYC=LY Coincidence Interrupt (1=Enable) (Read/Write)
 * Bit 5 - Mode 2 OAM Interrupt         (1=Enable) (Read/Write)
 * Bit 4 - Mode 1 V-Blank Interrupt     (1=Enable) (Read/Write)
 * Bit 3 - Mode 0 H-Blank Interrupt     (1=Enable) (Read/Write)
 * Bit 2 - Coincidence Flag  (0:LYC<>LY, 1:LYC=LY) (Read Only)
 * Bit 1-0 - Mode Flag       (Mode 0-3, see below) (Read Only)
 *           0: During H-Blank
 *           1: During V-Blank
 *           2: During Searching OAM-RAM
 *           3: During Transfering Data to LCD Driver
 */
const STAT = 0xff41;

/**
 * FF44 - LY - LCDC Y-Coordinate (R)
 *
 * The LY indicates the vertical line to which the present data is
 * transferred to the LCD Driver. The LY can take on any value between
 * 0 through 153. The values between 144 and 153 indicate the V-Blank
 * period. Writing will reset the counter.
 */
const LY = 0xff44;

/**
 * FF45 - LYC - LY Compare (R/W)
 *
 * The gameboy permanently compares the value of the LYC and LY registers. When
 * both values are identical, the coincident bit in the STAT register becomes
 * set, and (if enabled) a STAT interrupt is requested.
 */
const LYC = 0xff45;

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


class Lcd {
    constructor (mmu) {
        this._mmu = mmu;

        this._t = 0;
    }

    step (cycles) {
        debug('step');

        this._t += cycles;

        if (this._t < MAX_CYCLES) return;

        const stat = this._mmu.readByte(STAT);

        // LY register

        let ly = this._mmu.readByte(LY) + 1;
        if (ly == 144) {
            /**
             * INT 40 - V-Blank Interrupt
             *
             * The V-Blank interrupt occurs ca. 59.7 times a second on a
             * regular GB and ca. 61.1 times a second on a Super GB (SGB).
             * This interrupt occurs at the beginning of the V-Blank
             * period (LY=144).
             *
             * During this period video hardware is not using video ram so
             * it may be freely accessed. This period lasts approximately
             * 1.1 milliseconds.
             */
            this._mmu.writeByte(IF, this._mmu.readByte(IF) | 1);
        }
        else if (ly == 154) {
            ly = 0;
        }
        debugLy('current %d', ly);
        this._mmu.writeByte(LY, ly);

        // LYC=LY Coincidence

        let lyc = this._mmu.readByte(LYC);
        if (lyc == ly) {
            this._mmu.writeByte(STAT, stat | 1 << 2);

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
            if (stat >> 7) {
                this._mmu.writeByte(IF, this._mmu.readByte(IF) | 1 << 1)
            }
        }

        this._t = 0;
    }
}

module.exports = Lcd;
