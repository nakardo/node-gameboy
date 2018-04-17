'use strict';

const read = require('debug')('gameboy:mmu:read');
const write = require('debug')('gameboy:mmu:write');
const Serializable = require('./util/serializable');
const { DMA, KEY1, VBK, SVBK, IF, IE } = require('./registers');

/**
 * General Memory Map
 *
 * 0000-3FFF   16KB ROM Bank 00     (in cartridge, fixed at bank 00)
 * 4000-7FFF   16KB ROM Bank 01..NN (in cartridge, switchable bank number)
 * 8000-9FFF   8KB Video RAM (VRAM) (switchable bank 0-1 in CGB Mode)
 * A000-BFFF   8KB External RAM     (in cartridge, switchable bank, if any)
 * C000-CFFF   4KB Work RAM Bank 0 (WRAM)
 * D000-DFFF   4KB Work RAM Bank 1 (WRAM)  (switchable bank 1-7 in CGB Mode)
 * E000-FDFF   Same as C000-DDFF (ECHO)    (typically not used)
 * FE00-FE9F   Sprite Attribute Table (OAM)
 * FEA0-FEFF   Not Usable
 * FF00-FF7F   I/O Ports
 * FF80-FFFE   High RAM (HRAM)
 * FFFF        Interrupt Enable Register
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
        this._biosDisabled = (this._bios.length == 0);

        this._wramBank = 1;
        this._wram = new Array(8).fill().map(() => new Uint8Array(0x2000));
        this._io = new Uint8Array(0x80);
        this._zram = new Uint8Array(0x7f);

        this.cpu = null;
        this.video = null;
        this.timer = null;
        this.lcd = null;
        this.gpu = null;
        this.joypad = null;

        // Memory Map

        this._wram0 = new Uint8Array(0x1000);
        this._wram1 = new Uint8Array(0x7000);
        this._io = new Uint8Array(0x80);
        this._zram = new Uint8Array(0x7f);
        this.cart = null;

        this.if = 0
        this.ie = 0;
    }

    init () {
        this._biosDisabled = (this._bios.length == 0);
        this.if = 0;
        this.ie = 0;
    }

    fromJSON (obj) {
        super.fromJSON(obj);
        this._bios = new Uint8Array(obj._bios);
        this._wram = obj._wram.map(v => new Uint8Array(v));
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
            case 0xc:
                return this._wram[0][addr & 0x1fff];
            case 0xd:
                return this._wram[this._wramBank][addr & 0x1fff];
            case 0xe: case 0xf:
                if (addr == IF) return this.if;
                if (addr == IE) return this.ie;

                if (addr < 0xfe00) return this._wram[0][addr & 0x1fff];
                if (addr < 0xfea0) return this.video.readByte(addr);
                if (addr < 0xff00) return; // unusable
                if (addr < 0xff80) {
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
                if (addr < 0xffff) return this._zram[addr & 0x7f];
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

        switch (addr >> 12) {
            case 0x0: case 0x1:
            case 0x2: case 0x3:
            case 0x4: case 0x5:
            case 0x6: case 0x7:
            case 0xa: case 0xb:
                return this.cart.writeByte(addr, val);
            case 0x8: case 0x9:
                return this.video.writeByte(addr, val);
            case 0xc:
                return this._wram[0][addr & 0x1fff] = val;
            case 0xd:
                return this._wram[this._wramBank][addr & 0x1fff] = val;
            case 0xe: case 0xf:
                if (addr == IF) return this.if = val;
                if (addr == IE) return this.ie = val;

                switch (addr) {
                    case VBK: this.video.ramBank = val & 1; break;
                    case DMA: this.video.transfer(this, val); break;
                    case SVBK:
                        const bank = val & 0x7;
                        this._wramBank = bank > 0 ? bank : 1;
                        break;
                    case KEY1:
                        if (val & 1) this.cpu._toggleSpeed();
                        val = this.cpu._isDoubleSpeed ? 0x80 : 0;
                        break;
                }

                if (addr < 0xfe00) return this._wram[0][addr & 0x1fff] = val;
                if (addr < 0xfea0) return this.video.writeByte(addr, val);
                if (addr < 0xff00) return; // unusable
                if (addr < 0xff80) {
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
                        case 0x50:
                            this._biosDisabled = true;
                            break;
                    }
                    return this._io[addr & 0xff] = val;
                }
                if (addr < 0xffff) return this._zram[addr & 0x7f] = val;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    writeWord (addr, val) {
        this.writeByte(addr, val);
        this.writeByte(addr + 1, val >> 8);
    }
}

module.exports = Mmu;
