'use strict';


class Video {
    constructor () {
        this._ram = new Uint8Array(0x2000);

        // Background Maps

        this._bgmap = [[], []];
        this._tiles = this._initTiles(32 * 32);
    }

    getMap (select) { return this._bgmap[select]; }

    readByte (addr) {
        switch (addr >> 12) {
            case 0x8: case 0x9:
                return this._ram[addr & 0x1fff];
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    writeByte (addr, val) {
        switch (addr >> 12) {
            case 0x8: case 0x9:
                switch (addr >> 8) {
                    case 0x80: case 0x81: case 0x82: case 0x83:
                    case 0x84: case 0x85: case 0x86: case 0x87:
                    case 0x88: case 0x89: case 0x90: case 0x91:
                    case 0x92: case 0x93: case 0x94: case 0x95:
                    case 0x96: case 0x97: {
                        if (addr & 1 == 0) break;

                        const pos = addr & 0x1fff;
                        const res = this._sumBytes(this._ram[pos - 1], val);
                        this._tiles[pos >> 4][pos >> 1 & 7] = res;
                        break;
                    }
                    case 0x98: case 0x99:
                    case 0x9a: case 0x9b: {
                        const pos = addr & 0x3ff;
                        this._bgmap[0][pos] = this._tiles[val & 0x3ff];
                        break;
                    }
                    case 0x9c: case 0x9d:
                    case 0x9e: case 0x9f: {
                        const pos = addr & 0x3ff;
                        this._bgmap[1][pos] = this._tiles[val & 0x3ff];
                        break;
                    }
                }
                return this._ram[addr & 0x1fff] = val;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    _initTiles (length) {
        const tiles = [];
        for (let i = 0; i < length; i++) {
            const tile = tiles[i] = [
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0]
            ];

            this._bgmap[0][i] = tile;
        }

        return tiles;
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
