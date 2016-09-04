'use strict';

const debug = require('debug')('lcd');
const debugLy = require('debug')('lcd:ly');

const MAX_CYCLES = 456;

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
        debugLy('current line %s', ly);
        this._mmu.writeByte(LY, ly);

        this._t = 0;
    }
}

module.exports = Lcd;
