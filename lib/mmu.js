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

        // $FFFF        Interrupt Enable Flag
        // $FF80-$FFFE  Zero Page - 127 bytes
        // $FF00-$FF7F  Hardware I/O Registers
        // $FEA0-$FEFF  Unusable Memory
        // $FE00-$FE9F  OAM - Object Attribute Memory
        // $E000-$FDFF  Echo RAM - Reserved, Do Not Use
        // $D000-$DFFF  Internal RAM - Bank 1-7 (switchable - CGB only)
        // $C000-$CFFF  Internal RAM - Bank 0 (fixed)
        // $A000-$BFFF  Cartridge RAM (If Available)
        // $9C00-$9FFF  BG Map Data 2
        // $9800-$9BFF  BG Map Data 1
        // $8000-$97FF  Character RAM
        // $4000-$7FFF  Cartridge ROM - Switchable Banks 1-xx
        // $0150-$3FFF  Cartridge ROM - Bank 0 (fixed)
        // $0100-$014F  Cartridge Header Area
        // $0000-$00FF  Restart and Interrupt Vectors

        this._zram = null;
        this._vram = null;
        this._bank0 = null;
    }

    powerOn () {
        debug('power on');

        if (!this._cart) {
            throw new Error('no cart loaded!')
        }

        this._zram = new Uint8Array(0x80);
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

        switch (pos & 0xf000) {
            case 0:
            case 0x1000:
            case 0x2000:
            case 0x3000:
                return this._bank0[pos];
            case 0xf000:
                // $FFFF        Interrupt Enable Flag
                // $FF80-$FFFE  Zero Page - 127 bytes
                // $FF00-$FF7F  Hardware I/O Registers
                if (pos < 0xff80) return 0;
                else return this._zram[pos - 0xff80];
                return this._if;
        }

        throw new Error(`unmapped address 0x${pos.toString(16)}`);
    }

    readWord (pos) {
        return this.readByte(pos) | this.readByte(pos + 1) << 8;
    }

    writeByte (pos, value) {
        write('writing $%s', pos.toString(16));

        value = value & 0xff;

        switch (pos & 0xf000) {
            case 0x8000:
            case 0x9000:
                return this._vram[pos] = value;
            case 0xf000:
                // $FFFF        Interrupt Enable Flag
                // $FF80-$FFFE  Zero Page - 127 bytes
                // $FF00-$FF7F  Hardware I/O Registers
                if (pos < 0xff80) return 0;
                else this._zram[pos - 0xff80] = value;
                return this._if = value;
        }

        throw new Error(`unmapped address 0x${pos.toString(16)}`);
    }

    writeWord (pos, value) {
        this.writeByte(pos, value);
        this.writeByte(pos + 1, value >> 8);
    }
}

module.exports = Mmu;
