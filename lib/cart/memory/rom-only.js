'use strict';

const Serializable = require('../../util/serializable');


class RomOnly extends Serializable({ exclude: ['_rom'] }) {
    constructor (data) {
        super();
        this._rom = Uint8Array(data.slice(0, 0x8000));
    }

    readByte (addr) {
        if (addr < 0x8000) return this._rom[addr];
        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    writeByte (addr) {
        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }
}

module.exports = RomOnly;
