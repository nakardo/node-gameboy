'use strict';

const debug = require('debug')('mmu');
const read = require('debug')('mmu:read');
const write = require('debug')('mmu:write');
const { IE } = require('./registers');


class Mmu {
    constructor (bios) {
        // BIOS

        this._bios = new Uint8Array(bios);
        this._biosDisabled = bios == undefined & 1;

        // Registers

        this.timer = null;
        this.gpu = null;
        this.joypad = null;

        // Cartridge

        this._cart = null;

        // Memory Map

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
        this._oam = null;
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

        // $0000-$00FF  Restart and Interrupt Vectors
        // $0100-$014F  Cartridge Header Area
        // $0150-$3FFF  Cartridge ROM - Bank 0 (fixed)
        // $4000-$7FFF  Cartridge ROM - Switchable Banks 1-xx

        this._bank0 = new Uint8Array(this._cart, 0, 0x8000);

        // $8000-$97FF  Character RAM
        // $9800-$9BFF  BG Map Data 1
        // $9C00-$9FFF  BG Map Data 2

        this._vram = new Uint8Array(0x2000);

        // $A000-$BFFF  Cartridge RAM (If Available)

        this._eram = new Uint8Array(0x2000);

        // $C000-$CFFF  Internal RAM - Bank 0 (fixed)
        // $D000-$DFFF  Internal RAM - Bank 1-7 (switchable - CGB only)

        this._wram = new Uint8Array(0x2000);

        // $FE00-$FE9F  OAM - Object Attribute Memory

        this._oam = new Uint8Array(0xa0);

        // $FF00-$FF7F  Hardware I/O Registers

        this._io = new Uint8Array(0x80);

        // $FF80-$FFFE  Zero Page - 127 bytes

        this._zram = new Uint8Array(0x7f);

        // $FFFF        Interrupt Enable Flag

        this._ie = 0;
    }

    loadCart (data) {
        debug('loading cart');
        this._cart = data;
    }

    readByte (addr) {
        addr &= 0xffff;

        read('$%s', addr.toString(16));

        switch (addr & 0xf000) {
            // $0000-$00FF  Restart and Interrupt Vectors
            // $0100-$014F  Cartridge Header Area
            // $0150-$3FFF  Cartridge ROM - Bank 0 (fixed)
            // $4000-$7FFF  Cartridge ROM - Switchable Banks 1-xx
            case 0:
            case 0x1000:
            case 0x2000:
            case 0x3000:
            case 0x4000:
            case 0x5000:
            case 0x6000:
            case 0x7000:
                if (!this._biosDisabled && addr < 0x100) {
                    return this._bios[addr];
                }
                return this._bank0[addr];
            // $8000-$97FF  Character RAM
            // $9800-$9BFF  BG Map Data 1
            // $9C00-$9FFF  BG Map Data 2
            case 0x8000:
            case 0x9000:
                return this._vram[addr & 0x1fff];
            // $A000-$BFFF  Cartridge RAM (If Available)
            case 0xa000:
            case 0xb000:
                return this._eram[addr & 0x1fff];
            // $D000-$DFFF  Internal RAM - Bank 1-7 (switchable - CGB only)
            // $C000-$CFFF  Internal RAM - Bank 0 (fixed)
            case 0xc000:
            case 0xd000:
                return this._wram[addr & 0x1fff];
            // $FFFF        Interrupt Enable Flag
            // $FF80-$FFFE  Zero Page - 127 bytes
            // $FF00-$FF7F  Hardware I/O Registers
            // $FEA0-$FEFF  Unusable Memory
            // $FE00-$FE9F  OAM - Object Attribute Memory
            // $E000-$FDFF  Echo RAM - Reserved, Do Not Use
            case 0xe000:
            case 0xf000:
                if (addr == IE) return this._ie;
                if (addr > 0xff7f) return this._zram[addr & 0x7f];
                if (addr > 0xfeff) {
                    switch (addr & 0xff) {
                        // Joypad Input
                        case 0x00: return this.joypad.readByte(addr);
                        // Timer and Divider Registers
                        case 0x04: case 0x05:
                        case 0x06: case 0x07:
                            return this.timer.readByte(addr);
                        // LCD Control Register
                        case 0x40: case 0x41:
                        case 0x42: case 0x43:
                        case 0x44: case 0x45:
                        case 0x47:
                            return this.gpu.readByte(addr);
                    }
                    return this._io[addr & 0xff];
                }
                if (addr > 0xfe9f) return 0;
                if (addr > 0xfdff) return this._oam[addr & 0xff];
                return this._wram[addr & 0x1fff];
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    readWord (addr) {
        return this.readByte(addr) | this.readByte(addr + 1) << 8;
    }

    writeByte (addr, val) {
        addr &= 0xffff;
        val &= 0xff;

        write('$%s = 0x%s', addr.toString(16), val.toString(16));

        if (process && process.env.TEST_ROM && addr == 0xff02 && val == 0x81) {
            const char = String.fromCharCode(this.readByte(0xff01));
            process.stdout.write(char);
        }

        switch (addr & 0xf000) {
            // $0000-$00FF  Restart and Interrupt Vectors
            // $0100-$014F  Cartridge Header Area
            // $0150-$3FFF  Cartridge ROM - Bank 0 (fixed)
            // $4000-$7FFF  Cartridge ROM - Switchable Banks 1-xx
            case 0:
            case 0x1000:
            case 0x2000:
            case 0x3000:
            case 0x4000:
            case 0x5000:
            case 0x6000:
            case 0x7000:
                // TODO(dmacosta) switchable banks
                return;
            // $8000-$97FF  Character RAM
            // $9800-$9BFF  BG Map Data 1
            // $9C00-$9FFF  BG Map Data 2
            case 0x8000:
            case 0x9000:
                return this._vram[addr & 0x1fff] = val;
            // $A000-$BFFF  Cartridge RAM (If Available)
            case 0xa000:
            case 0xb000:
                return this._eram[addr & 0x1fff] = val;
            // $D000-$DFFF  Internal RAM - Bank 1-7 (switchable - CGB only)
            // $C000-$CFFF  Internal RAM - Bank 0 (fixed)
            case 0xc000:
            case 0xd000:
                return this._wram[addr & 0x1fff] = val;
            // $FFFF        Interrupt Enable Flag
            // $FF80-$FFFE  Zero Page - 127 bytes
            // $FF00-$FF7F  Hardware I/O Registers
            // $FEA0-$FEFF  Unusable Memory
            // $FE00-$FE9F  OAM - Object Attribute Memory
            // $E000-$FDFF  Echo RAM - Reserved, Do Not Use
            case 0xe000:
            case 0xf000:
                if (addr == IE) return this._ie = val;
                if (addr > 0xff7f) return this._zram[addr & 0x7f] = val;
                if (addr > 0xfeff) {
                    switch (addr & 0xff) {
                        // Joypad Input
                        case 0x00: return this.joypad.writeByte(addr, val);
                        // Timer and Divider Registers
                        case 0x04: case 0x05:
                        case 0x06: case 0x07:
                            return this.timer.writeByte(addr, val);
                        // LCD Control Register
                        case 0x40: case 0x41:
                        case 0x42: case 0x43:
                        case 0x44: case 0x45:
                        case 0x47:
                            return this.gpu.writeByte(addr, val);
                        case 0x50:
                            this._biosDisabled = 1;
                            break;
                    }
                    return this._io[addr & 0xff] = val;
                }
                if (addr > 0xfe9f) return 0;
                if (addr > 0xfdff) return this._oam[addr & 0xff] = val;
                return this._wram[addr & 0x1fff] = val;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    writeWord (addr, val) {
        this.writeByte(addr, val);
        this.writeByte(addr + 1, val >> 8);
    }
}

module.exports = Mmu;
