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
        const palette = this._mmu.readByte(BGP);
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

            let tileDataSelect = 0x8000;
            if (!(control & 0x10)) {
                const v = mapTile;
                const offset = v & 0x80 ? -((0xff & ~v) + 1) : v;
                tileDataSelect = 0x9000 + offset;
            }

            const dataOffset = mapTileOffset + lineOffset;
            const data = this._mmu.readWord(tileDataSelect + dataOffset);

            for (let tileX = 7; tileX > -1; tileX--) {
                const hb = data >> 8;
                const lb = data & 0xff;

                const p1 = (hb >> tileX) & 1;
                const p2 = (lb >> tileX) & 1;
                const color =  p1 | p2 << 1;

                let shade;
                switch (color) {
                    case 0: shade = palette & 3; break;
                    case 1: shade = palette >> 2 & 3; break;
                    case 2: shade = palette >> 4 & 3; break;
                    case 3: shade = palette >> 6 & 3; break;
                }

                let value;
                switch (shade) {
                    case 0: value = [255, 255, 255]; break;
                    case 1: value = [192, 192, 192]; break;
                    case 2: value = [96, 96, 96]; break;
                    case 3: value = [0, 0, 0]; break;
                }

                const posX = 8 * tile + 7 - tileX;
                let index = (line * FRAME_WIDTH + posX) * 4;

                this._data[index] = value[0];
                this._data[++index] = value[1];
                this._data[++index] = value[2];
                this._data[++index] = 255;
            }
        }
    }
}

module.exports = Gpu;
