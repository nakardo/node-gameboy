'use strict';

const debug = require('debug')('gpu');
const draw = require('debug')('gpu:draw');
const EventEmitter = require('events').EventEmitter;
const { LCDC, BGP, SCX, SCY } = require('./registers');

const FRAME_WIDTH = 160;
const FRAME_HEIGHT = 144;


class Gpu extends EventEmitter {
    constructor (mmu, canvas) {
        super();

        this._mmu = mmu;
        this._canvas = canvas;

        // Canvas

        this._ctx = canvas.getContext('2d');
        this._image = this._ctx.getImageData(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
        this._data = this._image.data;
    }

    powerOn () {
        debug('power on');
    }

    render () {
        debug('render');

        // LCD Display Enable

        const control = this._mmu.readByte(LCDC);
        if (!(control & 0x80)) {
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

        const control = this._mmu.readByte(LCDC);
        if (control & 1) {
            this._drawBackground(line);
        }
    }

    _drawBackground (line) {
        const scrollY = this._mmu.readByte(SCY);
        const scrollX = this._mmu.readByte(SCX);

        const control = this._mmu.readByte(LCDC);

        // BG Tile Map Display Select

        const tileMapSelect = control & 8 ? 0x9c00 : 0x9800;

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
        const mapY = line + scrollY;
        const mapOffsetX = Math.floor(scrollX / 8);
        const mapOffsetY = Math.floor(mapY / 8) * 32;
        const mapOffset = tileMapSelect + mapOffsetX + mapOffsetY;

        for (let tile = 0; tile < 20; tile++) {
            const mapTile = this._mmu.readByte(mapOffset + tile);
            const mapTileOffset = mapTile * 16;
            const lineOffset = (mapY % 8) * 2;

            // BG & Window Tile Data Select

            const tileDataSelect = this._getTileDataSelect(control);
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
        const palette = this._mmu.readByte(BGP);

        let shade;
        switch (color) {
            case 0: shade = palette & 3; break;
            case 1: shade = palette >> 2 & 3; break;
            case 2: shade = palette >> 4 & 3; break;
            case 3: shade = palette >> 6 & 3; break;
        }

        switch (shade) {
            case 0: return [255, 255, 255];
            case 1: return [192, 192, 192];
            case 2: return [96, 96, 96];
        }

        return [0, 0, 0];
    }

    _getTileDataSelect (control) {
        let data = 0x8000;
        if (!(control & 0x10)) {
            const v = mapTile;
            const offset = v & 0x80 ? -((0xff & ~v) + 1) : v;
            data = 0x9000 + offset;
        }

        return data;
    }
}

module.exports = Gpu;
