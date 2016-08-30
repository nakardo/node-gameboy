'use strict';

const fs = require('fs');
const debug = require('debug')('mmu');
const write = require('debug')('mmu:write');

const GB_BIOS = fs.readFileSync('./support/bios.bin');


class Mmu {
    constructor () {

        // BIOS

        this._bios = new Uint8Array(GB_BIOS);

        // Cartridge

        this._cart = null;

        // Interrupt Enable Register
        // --------------------------- FFFF
        // Internal RAM
        // --------------------------- FF80
        // Empty but unusable for I/O
        // --------------------------- FF4C
        // I/O ports
        // --------------------------- FF00
        // Empty but unusable for I/O
        // --------------------------- FEA0
        // Sprite Attrib Memory (OAM)
        // --------------------------- FE00
        // Echo of 8kB Internal RAM
        // --------------------------- E000
        // 8kB Internal RAM
        // --------------------------- C000
        // 8kB switchable RAM bank
        // --------------------------- A000
        // 8kB Video RAM
        // --------------------------- 8000 --
        // 16kB switchable ROMbank           |
        // --------------------------- 4000  | = 32kB Cartridge
        // 16kB ROMbank #0                   |
        // --------------------------- 0000 --

        this._vram = null;
        this._bank0 = null;
    }

    powerOn () {
        debug('power on');

        if (!this._cart) {
            throw new Error('no cart loaded!')
        }

        this._bank0 = new Uint8Array(0x4000);
        this._vram = new Uint8Array(0x2000);
    }

    loadCart (data) {
        debug('loading cart');

        this._cart = data;
        this._bank0 = new Uint8Array(this._cart, 0, 0x4000);
    }

    readByte (pos) {
        if (pos < 0x100) {
            return this._bios[pos];
        }

        switch (pos & 0x8000) {
            case 0x0:
            case 0x1000:
            case 0x2000:
            case 0x3000:
                return this._bank0[pos];
            default: break
        }

        throw new Error(`unmapped address 0x${pos.toString(16)}`);
    }

    readWord (pos) {
        return this.readByte(pos) | this.readByte(pos + 1) << 8;
    }

    writeByte (pos, value) {
        write('writing $%s', pos.toString(16));

        switch (pos & 0x8000) {
            case 0x8000:
            case 0x9000:
                return this._vram[pos] = value;
            default: break;
        }

        throw new Error(`unmapped address 0x${pos.toString(16)}`);
    }
}

module.exports = Mmu;
