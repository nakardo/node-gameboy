'use strict';

const debug = require('debug')('gameboy:cart:mbc1');
const Serializable = require('../../util/serializable');
const { ROM_SIZE, RAM_SIZE } = require('../headers');


const createMemory = (count, size, data = []) => new Array(count)
    .fill(null)
    .map((v, i) => {
        const offset = i * size;
        if (offset + size <= data.length) {
            return data.slice(offset, offset + size);
        }
        return new Uint8Array(size);
    });

const wrap = (array, i) => array[i & (array.length - 1)];

class MBC1 extends Serializable({ exclude: ['_rom'] }) {
    constructor (data, romSize, ramSize) {
        super();

        this._lbank = 1;
        this._hbank = 0;
        this._ramEnabled = false;
        this._mode = 0;

        this._rom = createMemory(ROM_SIZE[romSize], 0x4000, data);
        this._ram = createMemory(RAM_SIZE[ramSize], 0x2000);
    }

    readByte (addr) {
        switch (addr >> 12) {
            case 0x0: case 0x1:
            case 0x2: case 0x3: {
                let bank = 0;
                if (this._mode == 1) bank = this._hbank << 5;
                return wrap(this._rom, bank)[addr];
            }
            case 0x4: case 0x5:
            case 0x6: case 0x7: {
                const bank = this._lbank | (this._hbank << 5);
                return wrap(this._rom, bank)[addr & 0x3fff];
            }
            case 0xa: case 0xb: {
                if (!this._ramEnabled) {
                    debug('cannot read ram while disabled');
                    return 0xff;
                } else if (this._ram.length == 0) {
                    throw new Error('cannot read ram if not created');
                }
                let bank = 0;
                if (this._mode == 1) bank = this._hbank;
                return wrap(this._ram, bank)[addr & 0x1fff];
            }
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    writeByte (addr, val) {
        switch (addr >> 12) {
            case 0x0: case 0x1:
                return this._ramEnabled = (val & 0xf) == 0xa;
            case 0x2: case 0x3:
                val &= 0x1f;
                if (val == 0) val = 1;
                return this._lbank = val;
            case 0x4: case 0x5:
                return this._hbank = val & 3;
            case 0x6: case 0x7:
                return this._mode = val & 1;
            case 0xa: case 0xb: {
                if (!this._ramEnabled) {
                    return debug('cannot write ram while disabled');
                } else if (this._ram.length == 0) {
                    throw new Error('cannot write ram if not created');
                }
                let bank = 0;
                if (this._mode == 1) bank = this._hbank;
                return wrap(this._ram, bank)[addr & 0x1fff] = val;
            }
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }
}

module.exports = MBC1;
