'use strict';

const debug = require('debug')('gameboy:cart:mbc1');
const Serializable = require('../../util/serializable');
const { NINTENDO_LOGO } = require('../headers');

const [LOGO_START, LOGO_END] = NINTENDO_LOGO;

const LOGO_DATA = [
    0xce, 0xed, 0x66, 0x66, 0xcc, 0x0d, 0x00, 0x0b, 0x03, 0x73, 0x00, 0x83,
    0x00, 0x0c, 0x00, 0x0d, 0x00, 0x08, 0x11, 0x1f, 0x88, 0x89, 0x00, 0x0e,
    0xdc, 0xcc, 0x6e, 0xe6, 0xdd, 0xdd, 0xd9, 0x99, 0xbb, 0xbb, 0x67, 0x63,
    0x6e, 0x0e, 0xec, 0xcc, 0xdd, 0xdc, 0x99, 0x9f, 0xbb, 0xb9, 0x33, 0x3e
];

function isMulticart (data, romBanks) {
    if (romBanks != 64) {
        return false;
    }

    let count = 0;
    for (let i = 0; i < data.length; i += 0x4000) {
        const offset = i + LOGO_START;
        const logo = data.slice(offset, i + LOGO_END);

        let match = true;
        for (let j = 0; j < logo.length; j++) {
            match = match && data[offset + j] == LOGO_DATA[j];
            if (!match) break;
        }
        if (match) count++;
    }
    return count > 1;
}

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
    constructor (data, romBanks, ramBanks) {
        super();

        this._lbank = 1;
        this._hbank = 0;
        this._ramEnabled = false;
        this._isMulticart = isMulticart(data, romBanks);
        this._mode = 0;

        this._rom = createMemory(romBanks, 0x4000, data);
        this._ram = createMemory(ramBanks, 0x2000);
    }

    readByte (addr) {
        switch (addr >> 12) {
            case 0x0: case 0x1:
            case 0x2: case 0x3: {
                let bank = 0;
                if (this._mode == 1) {
                    if (this._isMulticart) bank = this._hbank << 4;
                    else bank = this._hbank << 5;
                }
                return wrap(this._rom, bank)[addr];
            }
            case 0x4: case 0x5:
            case 0x6: case 0x7: {
                let bank;
                if (this._isMulticart) {
                    bank = this._lbank & 0xf | (this._hbank & 0x3) << 4;
                } else {
                    bank = this._lbank | (this._hbank << 5);
                }
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
