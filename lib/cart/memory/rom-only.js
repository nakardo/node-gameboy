'use strict';

const debug = require('debug')('gameboy:cart:rom-only');
const Serializable = require('../../util/serializable');


class RomOnly extends Serializable({ exclude: ['_rom'] }) {
    constructor (data) {
        super();
        this._rom = data.slice(0, 0x8000);
    }

    readByte (addr) {
        if (addr < 0x8000) return this._rom[addr];
        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    writeByte (addr) {
        debug('writing to an unmapped address: 0x%s', addr.toString(16));
    }
}

module.exports = RomOnly;
