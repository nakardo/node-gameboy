'use strict';

const debug = require('debug')('mmu');
const read = require('debug')('mmu:read');
const write = require('debug')('mmu:write');


class Mmu {
    constructor (bios) {
        // BIOS

        this._bios = new Uint8Array(bios);
        this._isBiosDisabled = bios == undefined & 1;

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

        this._ie = null;
        this._zram = null;
        this._io = null;
        this._eram = null;
        this._wram = null;
        this._vram = null;
        this._bank0 = null;
    }

    powerOn () {
        debug('power on');

        if (!this._cart) {
            throw new Error('no cart loaded!')
        }

        // $FFFF        Interrupt Enable Flag

        this._ie = 0;

        // $FF80-$FFFE  Zero Page - 127 bytes

        this._zram = new Uint8Array(0x7f);

        // $FF00-$FF7F  Hardware I/O Registers

        this._io = new Uint8Array(0x80);

        // $D000-$DFFF  Internal RAM - Bank 1-7 (switchable - CGB only)
        // $C000-$CFFF  Internal RAM - Bank 0 (fixed)

        this._wram = new Uint8Array(0x2000);

        // $A000-$BFFF  Cartridge RAM (If Available)

        this._eram = new Uint8Array(0x2000);

        // $9C00-$9FFF  BG Map Data 2
        // $9800-$9BFF  BG Map Data 1
        // $8000-$97FF  Character RAM

        this._vram = new Uint8Array(0x2000);

        // $4000-$7FFF  Cartridge ROM - Switchable Banks 1-xx
        // $0150-$3FFF  Cartridge ROM - Bank 0 (fixed)
        // $0100-$014F  Cartridge Header Area
        // $0000-$00FF  Restart and Interrupt Vectors

        this._bank0 = new Uint8Array(this._cart, 0, 0x8000);
    }

    loadCart (data) {
        debug('loading cart');
        this._cart = data;
    }

    readByte (pos) {
        read('$%s', pos.toString(16));

        switch (pos & 0xf000) {
            // $FFFF        Interrupt Enable Flag
            // $FF80-$FFFE  Zero Page - 127 bytes
            // $FF00-$FF7F  Hardware I/O Registers
            case 0xf000:
                if (pos == 0xffff) return this._ie;
                if (pos > 0xff7f) return this._zram[pos - 0xff80];
                return this._io[pos - 0xff00];
            // $D000-$DFFF  Internal RAM - Bank 1-7 (switchable - CGB only)
            // $C000-$CFFF  Internal RAM - Bank 0 (fixed)
            case 0xd000:
            case 0xc000:
                return this._wram[pos - 0xc000];
            // $A000-$BFFF  Cartridge RAM (If Available)
            case 0xb000:
            case 0xa000:
                return this._eram[pos - 0xa000];
            // $9C00-$9FFF  BG Map Data 2
            // $9800-$9BFF  BG Map Data 1
            // $8000-$97FF  Character RAM
            case 0x9000:
            case 0x8000:
                return this._vram[pos - 0x8000];
            // $4000-$7FFF  Cartridge ROM - Switchable Banks 1-xx
            // $0150-$3FFF  Cartridge ROM - Bank 0 (fixed)
            // $0100-$014F  Cartridge Header Area
            // $0000-$00FF  Restart and Interrupt Vectors
            case 0x7000:
            case 0x6000:
            case 0x5000:
            case 0x4000:
            case 0x3000:
            case 0x2000:
            case 0x1000:
            case 0:
                if (!this._isBiosDisabled && pos < 0x100) {
                    return this._bios[pos];
                }
                return this._bank0[pos];
        }

        throw new Error(`unmapped address 0x${pos.toString(16)}`);
    }

    readWord (pos) {
        return this.readByte(pos) | this.readByte(pos + 1) << 8;
    }

    writeByte (pos, value) {
        write('$%s', pos.toString(16));

        switch (pos & 0xf000) {
            // $FFFF        Interrupt Enable Flag
            // $FF80-$FFFE  Zero Page - 127 bytes
            // $FF00-$FF7F  Hardware I/O Registers
            case 0xf000:
                if (pos == 0xffff) return this._ie = value;
                if (pos == 0xff50) return this._isBiosDisabled = value;
                if (pos > 0xff7f) return this._zram[pos - 0xff80] = value;
                return this._io[pos - 0xff00] = value;
            // $D000-$DFFF  Internal RAM - Bank 1-7 (switchable - CGB only)
            // $C000-$CFFF  Internal RAM - Bank 0 (fixed)
            case 0xd000:
            case 0xc000:
                return this._wram[pos - 0xc000] = value;
            // $A000-$BFFF  Cartridge RAM (If Available)
            case 0xb000:
            case 0xa000:
                return this._eram[pos - 0xa000] = value;
            // $9C00-$9FFF  BG Map Data 2
            // $9800-$9BFF  BG Map Data 1
            // $8000-$97FF  Character RAM
            case 0x9000:
            case 0x8000:
                return this._vram[pos - 0x8000] = value;
            // $4000-$7FFF  Cartridge ROM - Switchable Banks 1-xx
            // $0150-$3FFF  Cartridge ROM - Bank 0 (fixed)
            // $0100-$014F  Cartridge Header Area
            // $0000-$00FF  Restart and Interrupt Vectors
            case 0x7000:
            case 0x6000:
            case 0x5000:
            case 0x4000:
            case 0x3000:
            case 0x2000:
            case 0x1000:
            case 0:
                return this._bank0[pos];
        }

        throw new Error(`unmapped address 0x${pos.toString(16)}`);
    }

    writeWord (pos, value) {
        this.writeByte(pos, value);
        this.writeByte(pos + 1, value >> 8);
    }
}

module.exports = Mmu;
