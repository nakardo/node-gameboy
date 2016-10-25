'use strict';

const render = require('debug')('gpu:render');
const control = require('debug')('gpu:control');
const EventEmitter = require('events').EventEmitter;
const Canvas = require('./canvas');
const {
    LCDCONT, SCROLLY, SCROLLX, WNDPOSY, WNDPOSX, BGRDPAL
} = require('./registers');

// Non CGB gray shades

const GRAY_SHADES = [];

GRAY_SHADES[0] = [255, 255, 255, 255];
GRAY_SHADES[1] = [192, 192, 192, 255];
GRAY_SHADES[2] = [96, 96, 96, 255];
GRAY_SHADES[3] = [0, 0, 0, 255];


class Gpu extends EventEmitter {
    constructor (video) {
        super();
        this._video = video;

        // Registers

        this._lcdc = 0;
        this._scy = 0;
        this._scx = 0;
        this._bgp = 0;

        // Display

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
            case WNDPOSY: return this._wy;
            case WNDPOSX: return this._wx;
            case BGRDPAL: return this._bgp;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    writeByte (addr, val) {
        switch (addr) {
            case LCDCONT:
                this._video.dataSelect = val >> 4 & 1;
                return this._lcdc = val;
            case SCROLLY: return this._scy = val;
            case SCROLLX: return this._scx = val;
            case WNDPOSY: return this._wy = val;
            case WNDPOSX: return this._wx = val;
            case BGRDPAL:
                this._bgpal = this._getBackgroundPalette(val);
                return this._bgp = val;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    drawLine (line) {
        // Background

        if (this._lcdc & 1) {
            const mapSelect = this._lcdc >> 3 & 1;
            this._drawLayer(line, this._scx, this._scy, mapSelect);
        }

        // Window

        if (this._lcdc & 0x20) {
            const mapSelect = this._lcdc >> 6 & 1;
            this._drawLayer(line, this._wx - 7, this._wy, mapSelect);
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

    _drawLayer (line, offsetX, offsetY, mapSelect) {
        const y = offsetY + line;

        for (let j = 0; j < 160; j++) {
            const x = offsetX + j;

            const col = (x & 0xff) >> 3;
            const row = (y & 0xff) >> 3;

            const n = this._video.getMap(mapSelect, row, col);
            const color = this._bgpal[this._video.getTile(n)[y & 7][x & 7]];

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
