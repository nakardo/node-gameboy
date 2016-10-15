'use strict';

const debug = require('debug');

/**
 * 0147 - Cartridge Type
 *
 * 0 - ROM ONLY
 * 1 - ROM+MBC1
 * 2 - ROM+MBC1+RAM
 * 3 - ROM+MBC1+RAM+BATTERY
 * 5 - ROM+MBC2
 * 6 - ROM+MBC2+BATTERY
 */

const CART_TYPE = [];

CART_TYPE[0] = 'ROM ONLY';
CART_TYPE[1] = 'MBC1';
CART_TYPE[2] = 'MBC1+RAM';
CART_TYPE[3] = 'MBC1+RAM+BATTERY';
CART_TYPE[5] = 'MBC2';
CART_TYPE[6] = 'MBC2+BATTERY';


/**
 * 0148 - ROM Size
 *
 * 0 - 256kBit =  32kB =  2 banks
 * 1 - 512kBit =  64kB =  4 banks
 * 2 -   1MBit = 128kB =  8 banks
 * 3 -   2MBit = 256kB = 16 banks
 * 4 -   4MBit = 512kB = 32 banks
 */

const ROM_SIZE = [];

ROM_SIZE[0] = 2;
ROM_SIZE[1] = 4;
ROM_SIZE[2] = 8;
ROM_SIZE[3] = 16;
ROM_SIZE[4] = 32;

/**
 * 0149 - RAM Size
 *
 * 0 - None
 * 1 -  16kBit =  2kB = 1 bank
 * 2 -  64kBit =  8kB = 1 bank
 * 3 - 256kBit = 32kB = 4 banks
 */

const RAM_SIZE = [];

RAM_SIZE[0] = 0
RAM_SIZE[1] = 1;
RAM_SIZE[2] = 1;
RAM_SIZE[3] = 4;


class Cart {
    constructor (cart) {
        this._cart = new Uint8Array(cart);

        // Cartridge Header

        this._title = this._dataSliceToString(0x0134, 0x0143);
        this._type = this._cart[0x0147];
        this._romSize = this._cart[0x0148];
        this._ramSize = this._cart[0x0149];

        // $A000-$BFFF  Cartridge RAM (If Available)
        // $4000-$7FFF  Cartridge ROM - Switchable Banks 1-xx
        // $0150-$3FFF  Cartridge ROM - Bank 0 (fixed)

        this._ram = new Uint8Array(RAM_SIZE[this._ramSize]);
    }

    readByte (addr) {
        addr &= 0xffff;

        switch (addr & 0xff00) {
            case 0:
            case 0x1000:
            case 0x2000:
            case 0x3000:
            case 0x4000:
            case 0x5000:
            case 0x6000:
            case 0x7000:
                return this._rom[addr];
            case 0xa000:
            case 0xb000:
                return this._ram[addr & 0x1fff];
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    writeByte (addr, val) {
        return val & 0xff;
    }

    toJSON () {
        return {
            title: this._title,
            type: this._type,
            romSize: this._romSize,
            ramSize: this._ramSize
        }
    }

    _dataSliceToString (begin, end) {
        return String
            .fromCharCode(...this._cart.slice(begin, end))
            .replace(/\0/g, '');
    }
}

module.exports = Cart;
