'use strict';

const dma = require('debug')('gameboy:video:dma');
const Serializable = require('../util/serializable');


class Video extends Serializable() {
    constructor () {
        super();
        this._ram = new Uint8Array(0x2000);
        this._oam = new Uint8Array(0xa0);

        this.bgMap = [new Array(0x400).fill(0), new Array(0x400).fill(0)];
        this.tiles = this._initTiles(32 * 32);
        this.sprites = this._initSprites(40);
    }

    fromJSON (obj) {
        super.fromJSON(obj);

        this._ram = new Uint8Array(obj._ram);
        this._oam = new Uint8Array(obj._oam);

        this._ram.forEach((v, i) => this.writeByte(0x8000 + i, v));
        this._oam.forEach((v, i) => this.writeByte(0xfe00 + i, v));
    }

    transfer (mmu, val) {
        const start = (val & 0xff) << 8;

        dma('transfer from 0x%s', start.toString(16));

        for (let addr = start; addr < start + 0xa0; addr++) {
            const data = mmu.readByte(addr);
            const pos = addr & 0xff;

            dma('copy $%s = 0x%s', addr.toString(16), data.toString(16));

            this.sprites[pos >> 2][pos & 3] = data;
            this._oam[pos] = data;
        }
    }

    readByte (addr) {
        switch (addr >> 12) {
            case 0x8: case 0x9:
                return this._ram[addr & 0x1fff];
            case 0xf:
                if (addr > 0xfe9f) break;
                if (addr > 0xfdff) return this._oam[addr & 0xff];
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    writeByte (addr, val) {
        switch (addr >> 12) {
            case 0x8: case 0x9:
                if (addr > 0x97ff) {
                    this.bgMap[addr >> 10 & 1][addr & 0x3ff] = val;
                }
                else {
                    const pos = addr & 0x1fff;
                    const res = this._sumBytes(this._ram[pos - 1], val);
                    this.tiles[pos >> 4][pos >> 1 & 7] = res;
                }
                return this._ram[addr & 0x1fff] = val;
            case 0xf:
                if (addr > 0xfe9f) break;
                if (addr > 0xfdff) {
                    const pos = addr & 0xff;
                    this.sprites[pos >> 2][pos & 3] = val;
                    return this._oam[pos] = val;
                }
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    _initTiles (length) {
        const tiles = [];
        for (let i = 0; i < length; i++) tiles[i] = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ]

        return tiles;
    }

    _initSprites (length) {
        const sprites = [];
        for (let i = 0; i < length; i++) sprites[i] = [0, 0, 0, 0];
        return sprites;
    }

    _sumBytes (x, y) {
        const line = [];
        for (let b = 7; b > -1; b--) {
            const val = (x >> b & 1) | (y >> b & 1) << 1;
            line[7 - b] = val;
        }

        return line;
    }
}

module.exports = Video;
