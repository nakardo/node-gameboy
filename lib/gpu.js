'use strict';

require('./number');

const debug = require('debug')('gpu');
const draw = require('debug')('gpu:draw');
const control = require('debug')('gpu:control');
const EventEmitter = require('events').EventEmitter;
const Canvas = require('./canvas');

const FRAME_WIDTH = 160;
const FRAME_HEIGHT = 144;


class Gpu extends EventEmitter {
    constructor (mmu) {
        super();

        this._mmu = mmu;
        this._canvas = new Canvas(FRAME_WIDTH, FRAME_HEIGHT);

        // Registers

        this._mmu.gpu = this;

        this.lcdc = 0;
        this.bgp = 0;
        this.scx = 0;
        this.scy = 0;

        // Canvas

        this._ctx = this._canvas.getContext('2d');
        this._image = this._ctx.getImageData(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
        this._data = this._image.data;
    }

    powerOn () {
        debug('power on');
    }

    render () {
        debug('render');

        // LCD Display Enable

        control('%s', this.lcdc.toString(2));

        if (!(this.lcdc & 0x80)) {
            this._ctx.fillStyle = 'white';
            this._ctx.fillRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
        }

        this._ctx.putImageData(this._image, 0, 0);
        this._ctx.drawImage(this._canvas, 0, 0);

        this.emit('frame', this._canvas);
    }

    drawLine (line) {
        draw('line %d', line);

        // BG Display

        if (this.lcdc & 1) {
            this._drawBackground(line);
        }
    }

    _drawBackground (line) {
        // BG Tile Map Display Select

        const tileMapSelect = this.lcdc & 8 ? 0x9c00 : 0x9800;

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
        const mapY = line + this.scy;
        const mapOffsetX = Math.floor(this.scx / 8);
        const mapOffsetY = Math.floor(mapY / 8) * 32;
        const mapOffset = tileMapSelect + mapOffsetX + mapOffsetY;

        for (let tile = 0; tile < 20; tile++) {
            const mapTile = this._mmu.readByte(mapOffset + tile);
            const mapTileOffset = mapTile * 16;
            const lineOffset = (mapY % 8) * 2;

            // BG & Window Tile Data Select

            const tileDataSelect = this._getTileDataSelect(mapTile);
            const dataOffset = mapTileOffset + lineOffset;
            const data = this._mmu.readWord(tileDataSelect + dataOffset);

            for (let tileX = 7; tileX > -1; tileX--) {
                const p1 = data >> 8 >> tileX & 1;
                const p2 = (data & 0xff) >> tileX & 1;
                const color = this._getBackgroundRGBData(p1 | p2 << 1);

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
            case 0: shade = this.bgp & 3; break;
            case 1: shade = this.bgp >> 2 & 3; break;
            case 2: shade = this.bgp >> 4 & 3; break;
            case 3: shade = this.bgp >> 6 & 3; break;
        }

        switch (shade) {
            case 0: return [255, 255, 255];
            case 1: return [192, 192, 192];
            case 2: return [96, 96, 96];
        }

        return [0, 0, 0];
    }

    _getTileDataSelect (tile) {
        return this.lcdc & 0x10
            ? 0x8000
            : 0x9000 + tile.signed();
    }
}

module.exports = Gpu;
