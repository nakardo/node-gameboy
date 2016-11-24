'use strict';

const render = require('debug')('gameboy:gpu:render');
const control = require('debug')('gameboy:gpu:control');
const EventEmitter = require('events').EventEmitter;
const Canvas = require('../shims/canvas');
const Serializable = require('../util/serializable');
const { LCDC, SCY, SCX, WY, WX, BGP, OBP0, OBP1 } = require('../registers');

require('../util/number');

// Non CGB gray shades

const GRAY_SHADES = [];

GRAY_SHADES[0] = [255, 255, 255];
GRAY_SHADES[1] = [192, 192, 192];
GRAY_SHADES[2] = [96, 96, 96];
GRAY_SHADES[3] = [0, 0, 0];

const FRAME_WIDTH = 160;
const FRAME_HEIGHT = 144;


const include = [
    '_lcdc',
    '_scy',
    '_scx',
    '_wy',
    '_wx',
    '_bgp',
    '_obp0',
    '_obp1',
    '_bgpal',
    '_objpal'
];

class Gpu extends Serializable({ include }, EventEmitter) {
    constructor (video) {
        super();
        this._video = video;

        // Registers

        this._lcdc = 0;
        this._scy = 0;
        this._scx = 0;
        this._wy = 0;
        this._wx = 0;
        this._bgp = 0;
        this._obp0 = 0;
        this._obp1 = 0;

        // Display

        this._bgpal = null;
        this._objpal = [];

        // Canvas

        this._canvas = new Canvas(FRAME_WIDTH, FRAME_HEIGHT);
        this._ctx = this._canvas.getContext('2d');
        this._image = this._ctx.getImageData(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
        this._data = this._image.data;
    }

    readByte (addr) {
        switch (addr) {
            case LCDC: return this._lcdc;
            case SCY: return this._scy;
            case SCX: return this._scx;
            case BGP: return this._bgp;
            case OBP0: return this._obp0;
            case OBP1: return this._obp1;
            case WY: return this._wy;
            case WX: return this._wx;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    writeByte (addr, val) {
        switch (addr) {
            case LCDC: return this._lcdc = val;
            case SCY: return this._scy = val;
            case SCX: return this._scx = val;
            case BGP:
                this._bgpal = this._createPalette(val);
                return this._bgp = val;
            case OBP0:
                this._objpal[0] = this._createPalette(val);
                return this._obp0 = val;
            case OBP1:
                this._objpal[1] = this._createPalette(val);
                return this._obp1 = val;
            case WY: return this._wy = val;
            case WX: return this._wx = val;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    drawLine (line) {
        const data = this._lcdc >> 4 & 1;

        // Background

        if (this._lcdc & 1) {
            const map = this._lcdc >> 3 & 1;
            this._drawBackground(line, this._scx, this._scy, map, data);
        }

        // Window

        if (this._lcdc & 0x20 && line >= this._wy) {
            const map = this._lcdc >> 6 & 1;
            this._drawWindow(line, this._wx - 7, this._wy, map, data);
        }

        // Sprites

        if (this._lcdc & 2) {
            this._drawSprites(line);
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

    _createPalette (palette) {
        return [
            GRAY_SHADES[palette & 3],
            GRAY_SHADES[palette >> 2 & 3],
            GRAY_SHADES[palette >> 4 & 3],
            GRAY_SHADES[palette >> 6 & 3]
        ];
    }

    _drawBackground (line, offsetX, offsetY, mapSelect, dataSelect) {
        const map = this._video.bgMap[mapSelect];
        const y = offsetY + line;

        for (let i = 0; i < FRAME_WIDTH; i++) {
            const x = offsetX + i;

            const col = (x & 0xff) >> 3;
            const row = (y & 0xff) >> 3;

            const n = map[row * 32 + col];
            const tile = this._video.tiles[dataSelect ? n : 256 + n.signed()];
            const shade = this._bgpal[tile[y & 7][x & 7]];

            let offset = (line * FRAME_WIDTH + i) * 4;

            this._data[offset] = shade[0];
            this._data[++offset] = shade[1];
            this._data[++offset] = shade[2];
            this._data[++offset] = 255;
        }
    }

    _drawWindow (line, posX, posY, mapSelect, dataSelect) {
        const map = this._video.bgMap[mapSelect];
        const y = line - posY;

        for (let i = posX; i < FRAME_WIDTH; i++) {
            const x = i - posX;

            const col = x >> 3;
            const row = y >> 3;

            const n = map[row * 32 + col];
            const tile = this._video.tiles[dataSelect ? n : 256 + n.signed()];
            const shade = this._bgpal[tile[y & 7][x & 7]];

            let offset = (line * FRAME_WIDTH + i) * 4;

            this._data[offset] = shade[0];
            this._data[++offset] = shade[1];
            this._data[++offset] = shade[2];
            this._data[++offset] = 255;
        }
    }

    _drawSprites (line) {
        const height = this._lcdc & 4 ? 16 : 8;
        const sprites = this._video.sprites
            .slice()
            .sort((a, b) => a[1] - b[1]);

        for (let i = sprites.length - 1; i > -1 ; i--) {
            const sprite = sprites[i];

            // Position

            const sy = sprite[0] - 16;
            const sx = sprite[1] - 8;

            if (!(line >= sy && line < sy + height)) continue;
            if (sx >= FRAME_WIDTH) continue;

            // Tile/Pattern Number

            const n = this._lcdc & 4 ? sprite[2] & 0xfe : sprite[2];

            // Attributes/Flags

            const attrs = sprite[3];

            const priority = attrs >> 7 & 1;
            const yflip = attrs >> 6 & 1;
            const xflip = attrs >> 5 & 1;
            const palette = this._objpal[attrs >> 4 & 1];

            // Draw

            const py = yflip ? (height - 1) - (line - sy) : line - sy;
            const data = this._data;

            for (let x = sx; x < sx + 8 && x < FRAME_WIDTH; x++) {
                if (x < 0) continue;

                const offset = (line * FRAME_WIDTH + x) * 4;

                if (priority &&
                    data[offset + 0] != 255 &&
                    data[offset + 1] != 255 &&
                    data[offset + 2] != 255
                ) continue;

                const tile = this._video.tiles[n + (py >> 3 & 1)];
                const color = tile[py & 7][xflip ? 7 - (x - sx) : x - sx];
                if (color == 0) continue;

                const shade = palette[color];

                data[offset + 0] = shade[0];
                data[offset + 1] = shade[1];
                data[offset + 2] = shade[2];
                data[offset + 3] = 255;
            }
        };
    }
}

module.exports = Gpu;
