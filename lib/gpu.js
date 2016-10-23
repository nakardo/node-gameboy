'use strict';

const render = require('debug')('gpu:render');
const control = require('debug')('gpu:control');
const EventEmitter = require('events').EventEmitter;
const Canvas = require('./canvas');
const { LCDCONT, SCROLLY, SCROLLX, BGRDPAL } = require('./registers');

// Non CGB gray shades

const GRAY_SHADES = [];

GRAY_SHADES[0] = [255, 255, 255];
GRAY_SHADES[1] = [192, 192, 192];
GRAY_SHADES[2] = [96, 96, 96];
GRAY_SHADES[3] = [0, 0, 0];


class Gpu extends EventEmitter {
    constructor (video) {
        super();
        this._video = video;

        // Registers

        this._lcdc = 0;
        this._scy = 0;
        this._scx = 0;
        this._bgp = 0;

        // Palette

        this._bgpal = this._getBackgroundPalette();

        // Canvas

        this._canvas = new Canvas(160, 144);
        this._ctx = this._canvas.getContext('2d');
        this._image = this._ctx.getImageData(0, 0, 160, 144);
        this._data = this._image.data;
    }

    readByte (addr) {
        switch (addr) {
            case LCDCONT: return this._lcdc;
            case SCROLLY: return this._scy;
            case SCROLLX: return this._scx;
            case BGRDPAL: return this._bgp;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    writeByte (addr, val) {
        switch (addr) {
            case LCDCONT: return this._lcdc = val;
            case SCROLLY: return this._scy = val;
            case SCROLLX: return this._scx = val;
            case BGRDPAL:
                this._bgpal = this._getBackgroundPalette(val);
                return this._bgp = val;
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
            this._ctx.fillRect(0, 0, 160, 144);
        }

        this._ctx.putImageData(this._image, 0, 0);
        this._ctx.drawImage(this._canvas, 0, 0);

        this.emit('frame', this._canvas);
    }

    _drawBackground (line) {
        const map = this._video.getMap(this._lcdc >> 3 & 1);
        const y = this._scy + line;

        for (let j = 0; j < 160; j++) {
            const x = this._scx + j;
            const col = (x & 0xff) >> 3;
            const row = (y & 0xff) >> 3;

            const tile = map[row * 32 + col];
            const color = this._bgpal[tile[y & 7][x & 7]];

            let i = (line * 160 + j) * 4;

            this._data[i] = color[0];
            this._data[++i] = color[1];
            this._data[++i] = color[2];
            this._data[++i] = 255;
        }
    }

    _getBackgroundPalette (palette) {
        return [
            GRAY_SHADES[palette & 3],
            GRAY_SHADES[palette >> 2 & 3],
            GRAY_SHADES[palette >> 4 & 3],
            GRAY_SHADES[palette >> 6 & 3]
        ];
    }
}

module.exports = Gpu;
