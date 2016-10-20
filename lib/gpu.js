'use strict';

require('./number');

const render = require('debug')('gpu:render');
const control = require('debug')('gpu:control');
const EventEmitter = require('events').EventEmitter;
const Canvas = require('./canvas');

const FRAME_WIDTH = 160;
const FRAME_HEIGHT = 144;


class Gpu extends EventEmitter {
    constructor (video) {
        super();
        this._video = video;

        // Registers

        this._lcdc = 0;
        this._scy = 0;
        this._scx = 0;
        this._bgp = 0;

        // Canvas

        this._canvas = new Canvas(FRAME_WIDTH, FRAME_HEIGHT);
        this._ctx = this._canvas.getContext('2d');
        this._image = this._ctx.getImageData(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
        this._data = this._image.data;
    }

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
     *
     *
     * FF42 - SCY - Scroll Y (R/W)
     * FF43 - SCX - Scroll X (R/W)
     *
     * Specifies the position in the 256x256 pixels BG map (32x32 tiles) which
     * is to be displayed at the upper/left LCD display position.
     *
     * Values in range from 0-255 may be used for X/Y each, the video
     * controller automatically wraps back to the upper (left) position in BG
     * map when drawing exceeds the lower (right) border of the BG map area.
     *
     *
     * FF47 - BGP - BG Palette Data (R/W) - Non CGB Mode Only
     *
     * This register assigns gray shades to the color numbers of the BG and
     * Window tiles.
     *
     * Bit 7-6 - Shade for Color Number 3
     * Bit 5-4 - Shade for Color Number 2
     * Bit 3-2 - Shade for Color Number 1
     * Bit 1-0 - Shade for Color Number 0
     *
     * The four possible gray shades are:
     * 0  White
     * 1  Light gray
     * 2  Dark gray
     * 3  Black
     *
     * In CGB Mode the Color Palettes are taken from CGB Palette Memory instead.
     */

    readByte (addr) {
        switch (addr) {
            case 0xff40: return this._lcdc;
            case 0xff42: return this._scy;
            case 0xff43: return this._scx;
            case 0xff47: return this._bgp;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    writeByte (addr, val) {
        switch (addr) {
            case 0xff40: return this._lcdc = val;
            case 0xff42: return this._scy = val;
            case 0xff43: return this._scx = val;
            case 0xff47: return this._bgp = val;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    drawLine (line) {
        // BG Display

        if (this._lcdc & 1) {
            this._drawBackground(line);
        }
    }

    render () {
        render('frame');

        // LCD Display Enable

        control('%s', this._lcdc.toString(2));

        if (this._lcdc & 0x80 == 0) {
            this._ctx.fillStyle = 'white';
            this._ctx.fillRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
        }

        this._ctx.putImageData(this._image, 0, 0);
        this._ctx.drawImage(this._canvas, 0, 0);

        this.emit('frame', this._canvas);
    }

    _drawBackground (line) {
        /**
         * BG Map Tile Number
         *
         * An area of VRAM known as Background Tile Map contains the numbers of
         * tiles to be displayed. It is organized as 32 rows of 32 bytes each.
         * Each byte contains a number of a tile to be displayed. Tile patterns
         * are taken from the Tile Data Table located either at $8000-8FFF or
         * $8800-97FF. In the first case, patterns are numbered with unsigned
         * numbers from 0 to 255 (i.e. pattern #0 lies at address $8000).
         * In the second case, patterns have signed numbers from -128 to
         * 127 (i.e. pattern #0 lies at address $9000). The Tile Data Table
         * address for the background can be selected via LCDC register.
         */
        const mapY = line + this._scy;
        const mapOffsetX = Math.floor(this._scx / 8);
        const mapOffsetY = Math.floor(mapY / 8) * 32;
        const mapOffset = mapOffsetX + mapOffsetY;

        for (let tile = 0; tile < 20; tile++) {
            const mapTile = this._video._bgmap[0][mapOffset + tile];
            const data = mapTile[mapY % 8];

            for (let tileX = 7; tileX > -1; tileX--) {
                const color = this._getBackgroundRGBData(data[tileX]);

                const posX = 8 * tile + 7 - tileX;
                let index = (line * FRAME_WIDTH + posX) * 4;

                this._data[index] = color[0];
                this._data[++index] = color[1];
                this._data[++index] = color[2];
                this._data[++index] = 255;
            }
        }
    }

    _getBackgroundRGBData (color) {
        let shade;
        switch (color) {
            case 0: shade = this._bgp & 3; break;
            case 1: shade = this._bgp >> 2 & 3; break;
            case 2: shade = this._bgp >> 4 & 3; break;
            case 3: shade = this._bgp >> 6 & 3; break;
        }

        switch (shade) {
            case 0: return [255, 255, 255];
            case 1: return [192, 192, 192];
            case 2: return [96, 96, 96];
        }

        return [0, 0, 0];
    }
}

module.exports = Gpu;
