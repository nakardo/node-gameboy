'use strict';

const Serializable = require('../util/serializable');

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

const ROM_BANK_SIZE = 0x4000;
const ROM_BANK_TOTAL = [];

ROM_BANK_TOTAL[0x00] = 0;
ROM_BANK_TOTAL[0x01] = 4;
ROM_BANK_TOTAL[0x02] = 8;
ROM_BANK_TOTAL[0x03] = 16;
ROM_BANK_TOTAL[0x04] = 32;
ROM_BANK_TOTAL[0x05] = 64;
ROM_BANK_TOTAL[0x06] = 128;
ROM_BANK_TOTAL[0x07] = 256;
ROM_BANK_TOTAL[0x52] = 72;
ROM_BANK_TOTAL[0x53] = 80;
ROM_BANK_TOTAL[0x54] = 96;

const ROM_SIZE = [];

ROM_SIZE[0x00] = 0x8000;
ROM_SIZE[0x01] = ROM_BANK_SIZE * ROM_BANK_TOTAL[0x01];
ROM_SIZE[0x02] = ROM_BANK_SIZE * ROM_BANK_TOTAL[0x02];
ROM_SIZE[0x03] = ROM_BANK_SIZE * ROM_BANK_TOTAL[0x03];
ROM_SIZE[0x04] = ROM_BANK_SIZE * ROM_BANK_TOTAL[0x04];
ROM_SIZE[0x05] = ROM_BANK_SIZE * ROM_BANK_TOTAL[0x05];
ROM_SIZE[0x06] = ROM_BANK_SIZE * ROM_BANK_TOTAL[0x06];
ROM_SIZE[0x07] = ROM_BANK_SIZE * ROM_BANK_TOTAL[0x07];
ROM_SIZE[0x52] = ROM_BANK_SIZE * ROM_BANK_TOTAL[0x52];
ROM_SIZE[0x53] = ROM_BANK_SIZE * ROM_BANK_TOTAL[0x53];
ROM_SIZE[0x54] = ROM_BANK_SIZE * ROM_BANK_TOTAL[0x54];

/**
 * 0149 - RAM Size
 *
 * Specifies the size of the external RAM in the cartridge (if any).
 *
 * 00h - None
 * 01h - 2 KBytes
 * 02h - 8 Kbytes
 * 03h - 32 KBytes (4 banks of 8KBytes each)
 * 04h - 128 KBytes (16 banks of 8KBytes each)
 * 05h - 64 KBytes (8 banks of 8KBytes each)
 *
 * When using a MBC2 chip 00h must be specified in this entry, even though the
 * MBC2 includes a built-in RAM of 512 x 4 bits
 */

const RAM_BANK_SIZE = 0x2000;
const RAM_SIZE = [];

RAM_SIZE[0x00] = 0;
RAM_SIZE[0x01] = 0x800;
RAM_SIZE[0x02] = RAM_BANK_SIZE;
RAM_SIZE[0x03] = RAM_BANK_SIZE * 4;
RAM_SIZE[0x04] = RAM_BANK_SIZE * 16;
RAM_SIZE[0x05] = RAM_BANK_SIZE * 8;

function sliceToString (data, begin, end) {
    return String
        .fromCharCode(...data.slice(begin, end))
        .replace(/\0/g, '');
}


class Cart extends Serializable({ exclude: ['_rom'] }) {
    constructor (data) {
        super();

        // Cartridge Header

        this._title = sliceToString(data, 0x0134, 0x0143);
        this._type = data[0x0147];
        this._romSize = data[0x0148];
        this._ramSize = data[0x0149];

        console.log('type', this._type);
        console.log('romSize', this._romSize);
        console.log('ramSize', this._ramSize);

        this._rom = new Uint8Array(data);
        this._ram = new Uint8Array(RAM_SIZE[this._ramSize]);

        // MBC

        this._romBank = 1;
        this._ramBank = 0;
        this._ramEnabled = false;
        this._mode = 0;
    }

    fromJSON (obj) {
        super.fromJSON(obj);

        this._ram = new Uint8Array(obj._ram);
    }

    readByte (addr) {
        switch (addr >> 12) {
            case 0x0: case 0x1:
            case 0x2: case 0x3:
                return this._rom[addr];
            case 0x4: case 0x5:
            case 0x6: case 0x7: {
                addr &= 0x3fff;
                let bank = this._romBank;
                if (this._mode == 1) bank = this._romBank & 0x1f;
                const offset = ROM_BANK_SIZE * bank;
                return this._rom[offset + addr];
            }
            case 0xa: case 0xb: {
                // TODO(nakardo) does not apply for all ram sizes.
                addr &= 0x1fff;
                const bank = this._mode == 1 ? this._ramBank : 0;
                const offset = RAM_BANK_SIZE * bank;
                return this._ram[offset + addr];
            }
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    writeByte (addr, val) {
        switch (addr >> 12) {
            case 0x0: case 0x1:
                return this._ramEnabled = val & 0xf == 0xa;
            case 0x2: case 0x3: {
                val &= 0x1f;
                if (val == 0) val |= 1;
                const bank = (this._romBank & 0x60) | val;
                const mask = ROM_BANK_TOTAL[this._romSize] - 1;
                return this._romBank = bank & mask;
            }
            case 0x4: case 0x5: {
                val &= 3;
                const bank = (this._romBank & 0x1f) | (val << 5);
                const mask = ROM_BANK_TOTAL[this._romSize] - 1;
                return this._romBank = bank & mask;
            }
            case 0x6: case 0x7:
                return this._mode = val & 1;
            case 0xa: case 0xb: {
                if (!this._ramEnabled) return;
                addr &= 0x1fff;
                const offset = RAM_BANK_SIZE * this._ramBank;
                return this._ram[offset + addr] = val;
            }
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }
}

module.exports = Cart;
