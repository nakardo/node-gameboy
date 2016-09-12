'use strict';

const debug = require('debug')('gpu');
const EventEmitter = require('events').EventEmitter;
const Canvas = require('canvas');

const FRAME_WIDTH = 160;
const FRAME_HEIGHT = 144;

/**
 * FF40 - LCDC - LCD Control (R/W)
 *
 * Bit 7 - LCD Display Enable             (0=Off, 1=On)
 * Bit 6 - Window Tile Map Display Select (0=9800-9BFF, 1=9C00-9FFF)
 * Bit 5 - Window Display Enable          (0=Off, 1=On)
 * Bit 4 - BG & Window Tile Data Select   (0=8800-97FF, 1=8000-8FFF)
 * Bit 3 - BG Tile Map Display Select     (0=9800-9BFF, 1=9C00-9FFF)
 * Bit 2 - OBJ (Sprite) Size              (0=8x8, 1=8x16)
 * Bit 1 - OBJ (Sprite) Display Enable    (0=Off, 1=On)
 * Bit 0 - BG Display (for CGB see below) (0=Off, 1=On)
 */
const LCDC = 0xff40;


class Screen extends EventEmitter {
    constructor (mmu) {
        super();

        this._mmu = mmu;

        // Canvas

        this._canvas = new Canvas(FRAME_WIDTH, FRAME_HEIGHT);
        this._ctx = this._canvas.getContext('2d');
    }

    powerOn () {
        debug('power on');
    }

    render () {
        debug('render');

        this._ctx.fillStyle = 'white';
        this._ctx.fillRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);

        const control = this._mmu.readByte(LCDC);
        if (control & 0x80 == 0) {
            return;
        }

        this.emit('frame', this._canvas.toBuffer());
    }
}

module.exports = Screen;
