'use strict';

const Serializable = require('../../util/serializable');
const { ROM_SIZE, RAM_SIZE } = require('../headers');


const createMemory = (count, size, data = []) => new Array(count)
    .fill([])
    .map((v, i) => {
        const offset = i * size;
        return new Uint8Array(data.slice(offset, offset + size));
    });

const wrap = (array, i) => array[i & (array.length - 1)];

class MBC1 extends Serializable({ exclude: ['_rom'] }) {
    constructor (data, romSize, ramSize) {
        super();

        this._romBank = 1;
        this._ramBank = 0;
        this._ramEnabled = false;
        this._mode = 0;

        this._rom = createMemory(ROM_SIZE[romSize], 0x4000, data);
        this._ram = createMemory(RAM_SIZE[ramSize], 0x2000);
        console.log(this._rom);
    }

    readByte (addr) {
        switch (addr >> 12) {
            case 0x0: case 0x1:
            case 0x2: case 0x3:
                return this._rom[0][addr];
            case 0x4: case 0x5:
            case 0x6: case 0x7:
                return wrap(this._rom, this._romBank)[addr & 0x3fff];
            case 0xa: case 0xb:
                return wrap(this._ram, this._ramBank)[addr & 0x1fff];
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    writeByte (addr, val) {
        switch (addr >> 12) {
            case 0x0: case 0x1:
                return this._ramEnabled = val & 0xf == 0xa;
            case 0x2: case 0x3:
                val &= 0x1f;
                if (val == 0) val = 1;
                this._romBank &= 0x60;
                return this._romBank |= val;
            case 0x4: case 0x5:
                val &= 3;
                if (this._mode == 0) {
                    this._romBank &= 0x1f;
                    return this._romBank |= val << 5;
                }
                return this._ramBank = val;
            case 0x6: case 0x7:
                return this._mode = val & 1;
            case 0xa: case 0xb:
                if (!this._ramEnabled) return;
                return wrap(this._ram, this._ramBank)[addr & 0x1fff] = val;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }
}

module.exports = MBC1;
