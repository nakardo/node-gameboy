'use strict';

const debug = require('debug')('gameboy:cart');
const Serializable = require('../util/serializable');
const MEMORY_TYPES = require('./memory/types');
const { TITLE, CART_TYPE, ROM_SIZE, RAM_SIZE } = require('./headers');

const sliceToString = (data, begin, end) => String
    .fromCharCode(...data.slice(begin, end))
    .replace(/\0/g, '');


class Cart extends Serializable() {
    constructor (buffer) {
        super();

        const data = new Uint8Array(buffer);

        // Cartridge Header

        this.title = sliceToString(data, TITLE[0], TITLE[1]);
        this.type = data[CART_TYPE];
        this.romSize = data[ROM_SIZE];
        this.ramSize = data[RAM_SIZE];

        debug('title: %s', this.title);
        debug('type: %s', this.type);
        debug('romSize: %d', this.romSize);
        debug('ramSize: %d', this.ramSize);

        const MemoryType = MEMORY_TYPES[this.type];
        this._memory = new MemoryType(data, this.romBanks, this.ramBanks);
    }

    get typeDescription () {
        switch (this.type) {
            case 0: return 'ROM ONLY';
            case 1: return 'MBC1';
            case 2: return 'MBC1+RAM';
            case 3: return 'MBC1+RAM+BATTERY';
        }
        return 'UNKNOWN';
    }

    get romBanks () {
        switch (this.romSize) {
            case 0: return 2;
            case 1: return 4;
            case 2: return 8;
            case 3: return 16;
            case 4: return 32;
            case 5: return 64;
            case 6: return 128;
            case 7: return 256;
            case 0x52: return 72;
            case 0x53: return 80;
            case 0x54: return 96;
        }
        return 2;
    }

    get ramBanks () {
        switch (this.ramSize) {
            case 0: return 0;
            case 1: return 1;
            case 2: return 1;
            case 3: return 4;
            case 4: return 16;
            case 5: return 8;
        }
        return 0;
    }

    readByte (addr) {
        return this._memory.readByte(addr);
    }

    writeByte (addr, val) {
        return this._memory.writeByte(addr, val);
    }
}

module.exports = Cart;
