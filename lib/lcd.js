'use strict';

const debug = require('debug')('lcd');
const line = require('debug')('lcd:line');

const MAX_CYCLES = 456;


class Lcd {
    constructor (mmu) {
        this._mmu = mmu;

        this._t = 0;
    }

    step (cycles) {
        debug('step');

        this._t += cycles;

        /**
         * FF44 - LY - LCDC Y-Coordinate (R)
         *
         * The LY indicates the vertical line to which the present data is
         * transferred to the LCD Driver. The LY can take on any value between
         * 0 through 153. The values between 144 and 153 indicate the V-Blank
         * period. Writing will reset the counter.
         */
        if (this._t > MAX_CYCLES) {
            let counter = this._mmu.readByte(0xff44) + 1;

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
            if (counter == 144) {
                const ief = this._mmu.readByte(0xff0f);
                this._mmu.writeByte(0xff0f, ief | 1);
            } else if (counter == 154) {
                counter = 0;
            }
            line('current line %s', counter);
            this._mmu.writeByte(0xff44, counter);

            this._t = 0;
        }
    }
}

module.exports = Lcd;
