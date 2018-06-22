'use strict';

const read = require('debug')('gameboy:mmu:read');
const write = require('debug')('gameboy:mmu:write');
const Serializable = require('./util/serializable');
const { IF, IE } = require('./registers');

/**
 * GameBoy Memory Areas
 *
 * $FFFF        Interrupt Enable Flag
 * $FF80-$FFFE  Zero Page - 127 bytes
 * $FF00-$FF7F  Hardware I/O Registers
 * $FEA0-$FEFF  Unusable Memory
 * $FE00-$FE9F  OAM - Object Attribute Memory
 * $E000-$FDFF  Echo RAM - Reserved, Do Not Use
 * $D000-$DFFF  Internal RAM - Bank 1-7 (switchable - CGB only)
 * $C000-$CFFF  Internal RAM - Bank 0 (fixed)
 * $A000-$BFFF  Cartridge RAM (If Available)
 * $9C00-$9FFF  BG Map Data 2
 * $9800-$9BFF  BG Map Data 1
 * $8000-$97FF  Character RAM
 * $4000-$7FFF  Cartridge ROM - Switchable Banks 1-xx
 * $0150-$3FFF  Cartridge ROM - Bank 0 (fixed)
 * $0100-$014F  Cartridge Header Area
 * $0000-$00FF  Restart and Interrupt Vectors
 */

const exclude = [
    'video',
    'timer',
    'lcd',
    'gpu',
    'joypad'
];

class Mmu extends Serializable({ exclude }) {
    constructor (bios = []) {
        super();
        this._bios = new Uint8Array(bios);
        this._biosDisabled = this._bios.length == 0;

        // Mappings

        this.video = null;
        this.timer = null;
        this.lcd = null;
        this.gpu = null;
        this.joypad = null;

        // Memory Map

        this._wram = new Uint8Array(0x2000);
        this._io = new Uint8Array(0x80);
        this._zram = new Uint8Array(0x7f);
        this.cart = null;

        this.if = 0
        this.ie = 0;
    }

    init () {
        this._biosDisabled = this._bios.length == 0;

        this.if = 0
        this.ie = 0;
    }

    fromJSON (obj) {
        super.fromJSON(obj);

        this._bios = new Uint8Array(obj._bios);
        this._wram = new Uint8Array(obj._wram);
        this._io = new Uint8Array(obj._io);
        this._zram = new Uint8Array(obj._zram);
    }

    loadCart (cart) {
        this.cart = cart;
    }

    readByte (addr) {
        addr &= 0xffff;

        read('$%s', addr.toString(16));

        switch (addr >> 12) {
            case 0x0:
                if (!this._biosDisabled && addr < 0x100) {
                    return this._bios[addr];
                }
            case 0x1: case 0x2:
            case 0x3: case 0x4:
            case 0x5: case 0x6:
            case 0x7: case 0xa:
            case 0xb:
                return this.cart.readByte(addr);
            case 0x8: case 0x9:
                return this.video.readByte(addr);
            case 0xc: case 0xd:
                return this._wram[addr & 0x1fff];
            case 0xe: case 0xf:
                if (addr == IE) return this.ie;
                if (addr == IF) return this.if;
                if (addr > 0xff7f) return this._zram[addr & 0x7f];
                if (addr > 0xfeff) {
                    switch (addr & 0xff) {
                        case 0:
                            return this.joypad.readByte(addr);
                        case 0x04: case 0x05:
                        case 0x06: case 0x07:
                            return this.timer.readByte(addr);
                        case 0x40: case 0x42:
                        case 0x43: case 0x47:
                        case 0x48: case 0x49:
                        case 0x4a: case 0x4b:
                            return this.gpu.readByte(addr);
                        case 0x41: case 0x44:
                        case 0x45:
                            return this.lcd.readByte(addr);
                    }
                    return this._io[addr & 0xff];
                }
                if (addr > 0xfe9f) return 0;
                if (addr > 0xfdff) return this.video.readByte(addr);
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

        switch (addr >> 12) {
            case 0x0: case 0x1:
            case 0x2: case 0x3:
            case 0x4: case 0x5:
            case 0x6: case 0x7:
            case 0xa: case 0xb:
                return this.cart.writeByte(addr, val);
            case 0x8: case 0x9:
                return this.video.writeByte(addr, val);
            case 0xc: case 0xd:
                return this._wram[addr & 0x1fff] = val;
            case 0xe: case 0xf:
                if (addr == IE) return this.ie = val;
                if (addr == IF) return this.if = val;
                if (addr > 0xff7f) return this._zram[addr & 0x7f] = val;
                if (addr > 0xfeff) {
                    switch (addr & 0xff) {
                        case 0:
                            return this.joypad.writeByte(addr, val);
                        case 0x04: case 0x05:
                        case 0x06: case 0x07:
                            return this.timer.writeByte(addr, val);
                        case 0x40: case 0x42:
                        case 0x43: case 0x47:
                        case 0x48: case 0x49:
                        case 0x4a: case 0x4b:
                            return this.gpu.writeByte(addr, val);
                        case 0x41: case 0x44:
                        case 0x45:
                            return this.lcd.writeByte(addr, val);
                        case 0x46:
                            this.video.transfer(this, val);
                            break;
                        case 0x50:
                            this._biosDisabled = true;
                            break;
                    }
                    return this._io[addr & 0xff] = val;
                }
                if (addr > 0xfe9f) return;
                if (addr > 0xfdff) return this.video.writeByte(addr, val);
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
