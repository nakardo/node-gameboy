'use strict';

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
 * 11h  MBC3
 */

const CART_TYPE = [];

CART_TYPE[0x00] = 'ROM ONLY';
CART_TYPE[0x01] = 'MBC1';
CART_TYPE[0x02] = 'MBC1+RAM';
CART_TYPE[0x03] = 'MBC1+RAM+BATTERY';
CART_TYPE[0x05] = 'MBC2';
CART_TYPE[0x06] = 'MBC2+BATTERY';

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

ROM_SIZE[0x00] = 1;
ROM_SIZE[0x01] = 2;
ROM_SIZE[0x02] = 4;
ROM_SIZE[0x03] = 8;
ROM_SIZE[0x04] = 16;

/**
 * 0149 - RAM Size
 *
 * Specifies the size of the external RAM in the cartridge (if any).
 *
 * 00h - None
 * 01h - 2 KBytes
 * 02h - 8 Kbytes
 * 03h - 32 KBytes (4 banks of 8KBytes each)
 *
 * When using a MBC2 chip 00h must be specified in this entry, even though the
 * MBC2 includes a built-in RAM of 512 x 4 bits
 */

const RAM_SIZE = [];

RAM_SIZE[0x00] = 0
RAM_SIZE[0x01] = 2;
RAM_SIZE[0x02] = 8;
RAM_SIZE[0x03] = 32;


class Cart {
    constructor (cart) {
        this._cart = new Uint8Array(cart);

        // Cartridge Header

        this._title = this._dataSliceToString(0x0134, 0x0143);
        this._type = this._cart[0x0147];
        this._romSize = this._cart[0x0148];
        this._ramSize = this._cart[0x0149];

        // Memory Map

        this._ram = new Uint8Array(RAM_SIZE[0x800 * this._ramSize]);

        // MBC

        this._romBank = 1;
        this._ramBank = 0;
        this._ramEnabled = false;
        this._mode = 0;
    }

    readByte (addr) {
        switch (addr >> 12) {
            case 0x0: case 0x1:
            case 0x2: case 0x3:
                return this._cart[addr];
            case 0x4: case 0x5:
            case 0x6: case 0x7: {
                const offset = 0x4000 * this._romBank;
                addr &= 0x3fff;
                return this._cart[offset + addr];
            }
            case 0xa: case 0xb: {
                const offset = 0x2000 * this._ramBank;
                addr &= 0x1fff;
                return this._ram[offset + addr];
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
                return this._romBank = (val & 0xf) == 0 ? val++ : val;
            case 0x4: case 0x5:
                val &= 3;
                if (this._mode == 1) return this._ramBank = val;
                return this._romBank |= val << 5;
            case 0x6: case 0x7:
                return this._mode = val & 1;
            case 0xa: case 0xb:
                if (!this._ramEnabled) return;
                const offset = 0x2000 * this._ramBank;
                addr &= 0x1fff;
                return this._ram[offset + addr] = val;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
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
