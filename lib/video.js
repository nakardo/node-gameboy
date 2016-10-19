'use strict';

class Video {
    constructor () {
        this._ram = new Uint8Array(0x2000);

        // VRAM Background Maps

        this._map1 = [];
        this._map2 = [];
        this._data = [];
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
                return this._ram[addr & 0x1fff] = val;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }
}

module.exports = Video;
