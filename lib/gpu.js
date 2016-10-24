'use strict';

const render = require('debug')('gpu:render');
const control = require('debug')('gpu:control');
const EventEmitter = require('events').EventEmitter;
const Canvas = require('./canvas');
const {
    LCDCONT, SCROLLY, SCROLLX, WNDPOSY, WNDPOSX, BGRDPAL
} = require('./registers');

require('./number');

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
            case LCDCONT: return this._lcdc = val;
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
        const dataSelect = this._lcdc >> 4 & 1;

        // Background

        if (this._lcdc & 1) {
            const mapSelect = this._lcdc >> 3 & 1;
            this._draw(line, this._scx, this._scy, mapSelect, dataSelect);
        }

        // Window

        if (this._lcdc & 0x20) {
            const mapSelect = this._lcdc >> 6 & 1;
            this._draw(line, this._wx - 7, this._wy, mapSelect, dataSelect);
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

    _draw (line, offsetX, offsetY, mapSelect, dataSelect) {
        const map = this._video.bgMap[mapSelect];
        const posY = offsetY + line;

        const y = posY & 7;
        const row = (posY & 0xff) >> 3;

        let x = offsetX & 7;
        let col = (offsetX & 0xff) >> 3;

        const n = map[row * 32 + col];
        let tile = dataSelect ? n : 256 + n.signed();

        let offset = line * 160 * 4;

        for (let i = 0; i < 160; i++) {
            const color = this._bgpal[this._video.tiles[tile][y][x]];

            this._data[offset + 0] = color[0];
            this._data[offset + 1] = color[1];
            this._data[offset + 2] = color[2];
            this._data[offset + 3] = color[3];
            offset += 4;

            x++;
            if (x == 8) {
                x = 0;
                col = ++col & 31;
                const n = map[row * 32 + col];
                tile = dataSelect ? n : 256 + n.signed();
            }
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
