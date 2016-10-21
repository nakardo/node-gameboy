'use strict';


class Video {
    constructor () {
        this._ram = new Uint8Array(0x2000);

        // Background Maps

        this.bgmap = [[], []];
        this._tiles = this._initTiles(32 * 32);
    }

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
                    case 0x88: case 0x89: case 0x91: case 0x92:
                    case 0x93: case 0x94: case 0x95: case 0x96:
                    case 0x97:
                        if (addr % 2 == 0) break;

                        const pos = addr & 0x1fff;
                        const idx = Math.floor(pos / 16);
                        const res = this._sumBytes(val, this._ram[pos - 1]);

                        this._tiles[idx][pos >> 1 & 7] = res;
                        break;
                    case 0x98: case 0x99:
                    case 0x9a: case 0x9b:
                        this.bgmap[0][addr & 0x3ff] = this._tiles[val];
                        break;
                    case 0x9c: case 0x9d:
                    case 0x9e: case 0x9f:
                        this.bgmap[1][addr & 0x3ff] = this._tiles[val];
                        break;
                }
                return this._ram[addr & 0x1fff] = val;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    _initTiles (length) {
        const tiles = [];
        for (let i = 0; i < length; i++) tiles[i] = [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0]
        ];

        return tiles;
    }

    _sumBytes (x, y) {
        const line = [];
        for (let b = 7; b > -1; b--) {
            const val = (x >> b) & 1 | ((y >> b) & 1) << 1;
            line[7 - b] = val;
        }

        return line;
    }
}

module.exports = Video;
