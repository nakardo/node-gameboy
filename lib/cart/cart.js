'use strict';

const debug = require('debug')('gameboy:cart');
const Serializable = require('../util/serializable');
const Memory = require('./memory/memory');
const { CART_TYPE } = require('./headers');


const sliceToString = (data, begin, end) => String
    .fromCharCode(...data.slice(begin, end))
    .replace(/\0/g, '');

class Cart extends Serializable() {
    constructor (data) {
        super();

        // Cartridge Header

        this.title = sliceToString(data, 0x0134, 0x0143);
        this.type = data[0x0147];
        this.romSize = data[0x0148];
        this.ramSize = data[0x0149];

        debug('title: %s', this.title);
        debug('type: %s', this.type);
        debug('romSize: %d', this.romSize);
        debug('ramSize: %d', this.ramSize);

        this._memory = new Memory[this.type](data, this.romSize, this.ramSize);
    }

    readByte (addr) {
        return this._memory.readByte(addr);
    }

    writeByte (addr, val) {
        return this._memory.writeByte(addr, val);
    }
}

module.exports = Cart;
