'use strict';

const debug = require('debug');

/**
 * 0147 - Cartridge Type
 *
 * Specifies which Memory Bank Controller (if any) is used in the cartridge,
 * and if further external hardware exists in the cartridge.
 *
 * 00h  ROM ONLY                 13h  MBC3+RAM+BATTERY
 * 01h  MBC1                     15h  MBC4
 * 02h  MBC1+RAM                 16h  MBC4+RAM
 * 03h  MBC1+RAM+BATTERY         17h  MBC4+RAM+BATTERY
 * 05h  MBC2                     19h  MBC5
 * 06h  MBC2+BATTERY             1Ah  MBC5+RAM
 * 08h  ROM+RAM                  1Bh  MBC5+RAM+BATTERY
 * 09h  ROM+RAM+BATTERY          1Ch  MBC5+RUMBLE
 * 0Bh  MMM01                    1Dh  MBC5+RUMBLE+RAM
 * 0Ch  MMM01+RAM                1Eh  MBC5+RUMBLE+RAM+BATTERY
 * 0Dh  MMM01+RAM+BATTERY        FCh  POCKET CAMERA
 * 0Fh  MBC3+TIMER+BATTERY       FDh  BANDAI TAMA5
 * 10h  MBC3+TIMER+RAM+BATTERY   FEh  HuC3
 * 11h  MBC3                     FFh  HuC1+RAM+BATTERY
 * 12h  MBC3+RAM
 */

const CART_TYPE = [];

CART_TYPE[0x00] = 'ROM ONLY';
CART_TYPE[0x01] = 'MBC1';
CART_TYPE[0x02] = 'MBC1+RAM';
CART_TYPE[0x03] = 'MBC1+RAM+BATTERY';
CART_TYPE[0x05] = 'MBC2';
CART_TYPE[0x06] = 'MBC2+BATTERY';
CART_TYPE[0x08] = 'ROM+RAM';
CART_TYPE[0x09] = 'ROM+RAM+BATTERY';
CART_TYPE[0x0b] = 'MMM01';
CART_TYPE[0x0c] = 'MMM01+RAM';
CART_TYPE[0x0d] = 'MMM01+RAM+BATTERY';
CART_TYPE[0x0f] = 'MBC3+TIMER+BATTERY';
CART_TYPE[0x10] = 'MBC3+TIMER+RAM+BATTERY';
CART_TYPE[0x11] = 'MBC3';
CART_TYPE[0x12] = 'MBC3+RAM';
CART_TYPE[0x13] = 'MBC3+RAM+BATTERY';
CART_TYPE[0x15] = 'MBC4';
CART_TYPE[0x16] = 'MBC4+RAM';
CART_TYPE[0x17] = 'MBC4+RAM+BATTERY';
CART_TYPE[0x19] = 'MBC5';
CART_TYPE[0x1a] = 'MBC5+RAM';
CART_TYPE[0x1b] = 'MBC5+RAM+BATTERY';
CART_TYPE[0x1c] = 'MBC5+RUMBLE';
CART_TYPE[0x1d] = 'MBC5+RUMBLE+RAM';
CART_TYPE[0x1e] = 'MBC5+RUMBLE+RAM+BATTERY';
CART_TYPE[0xfc] = 'POCKET CAMERA';
CART_TYPE[0xfd] = 'BANDAI TAMA5';
CART_TYPE[0xfe] = 'HuC3';
CART_TYPE[0xff] = 'HuC1+RAM+BATTERY';

/**
 * 0148 - ROM Size
 *
 * Specifies the ROM Size of the cartridge. Typically calculated as
 * "32KB shl N".
 *
 * 00h -  32KByte (no ROM banking)
 * 01h -  64KByte (4 banks)
 * 02h - 128KByte (8 banks)
 * 03h - 256KByte (16 banks)
 * 04h - 512KByte (32 banks)
 * 05h -   1MByte (64 banks)  - only 63 banks used by MBC1
 * 06h -   2MByte (128 banks) - only 125 banks used by MBC1
 * 07h -   4MByte (256 banks)
 * 52h - 1.1MByte (72 banks)
 * 53h - 1.2MByte (80 banks)
 * 54h - 1.5MByte (96 banks)
 */

const ROM_SIZE = [];

ROM_SIZE[0x00] = '32KByte';
ROM_SIZE[0x01] = '64KByte';
ROM_SIZE[0x02] = '128KByte';
ROM_SIZE[0x03] = '256KByte';
ROM_SIZE[0x04] = '512KByte';
ROM_SIZE[0x05] = '1MByte';
ROM_SIZE[0x06] = '2MByte';
ROM_SIZE[0x07] = '4MByte';
ROM_SIZE[0x52] = '1.1MByte';
ROM_SIZE[0x53] = '1.2MByte';
ROM_SIZE[0x54] = '1.5MByte';

/**
 * 0149 - RAM Size
 *
 * Specifies the size of the external RAM in the cartridge (if any).
 *
 * 00h - None
 * 01h - 2 KBytes
 * 02h - 8 Kbytes
 * 03h - 32 KBytes (4 banks of 8KBytes each)
 */

const RAM_SIZE = [];

RAM_SIZE[0x00] = 'None';
RAM_SIZE[0x01] = '2 KBytes';
RAM_SIZE[0x02] = '8 Kbytes';
RAM_SIZE[0x03] = '32 KBytes';


class Cart {
    constructor (data) {
        this._data = new Uint8Array(data);

        this._title = this._dataSliceToString(0x0134, 0x0143);
        this._type = this._data[0x0147];
        this._romSize = this._data[0x0148];
        this._ramSize = this._data[0x0149];

        // MBC
    }

    readByte (addr) {
        return this._data[addr & 0xffff];
    }

    writeByte (addr, val) {
        return val & 0xff;
    }

    toJSON () {
        return {
            title: this._title,
            type: CART_TYPE[this._type],
            romSize: ROM_SIZE[this._romSize],
            ramSize: RAM_SIZE[this._ramSize]
        }
    }

    _dataSliceToString (begin, end) {
        return String
            .fromCharCode(...this._data.slice(begin, end))
            .replace(/\0/g, '');
    }
}

module.exports = Cart;
