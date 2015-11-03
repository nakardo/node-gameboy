'use strict';

var fs = require('fs');
var assert = require('assert');
var debug = require('debug')('mmu');


function Mmu(gpu) {

    this.gpu = gpu;

    // Docs
    //
    // - http://imrannazar.com/GameBoy-Emulation-in-JavaScript:-Memory
    // - http://gbdev.gg8.se/wiki/articles/Gameboy_Bootstrap_ROM#Contents_of_the_ROM
    // - http://gameboy.mongenel.com/dmg/asmmemmap.html

    this._hasRunBios = false;
    this._isCartLoaded = false;

    // BIOS

    this._bios = null;

    // Memory map
    //
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

    this._bank0 = null;
    this._eram = null;
    this._wram = null;
    this._zram = null;

    // Interrupts Flags

    // Interrupt Enable Flag
    //
    // Location: $FFFF
    //
    // Notes: When bits are set, the corresponding interrupt can be triggered
    //
    // Details:
    //
    // +-----+--------------+-------------+
    // | Bit | When 0       | When 1      |
    // +-----+--------------+-------------+
    // |  0  | Vblank off   | Vblank on   |
    // |  1  | LCD stat off | LCD stat on |
    // |  2  | Timer off    | Timer on    |
    // |  3  | Serial off   | Serial on   |
    // |  4  | Joypad off   | Joypad on   |
    // +-----+--------------+-------------+

    this._ie = 0;

    // Interrupt flags
    //
    // Location: $FF0F
    //
    // Notes: When bits are set, an interrupt has happened
    //
    // Details: Bits in the same order as FFFF

    this._if = 0;

    Object.seal(this);
}

Mmu.prototype.powerOn = function () {

    debug('power on');

    if (!this._isCartLoaded) {
        debug('cannot start without any cart loaded. stop');
        process.exit(1);
    }

    // Load BIOS

    this._bios = new Uint8Array(fs.readFileSync('./support/bios.bin'), 0, 0xFF);

    this._eram = new Uint8Array(0x1FFF);
    this._wram = new Uint8Array(0x03FF);
    this._zram = new Uint8Array(0x7F);
};

Mmu.prototype.loadCart = function (cart) {

    if (!(cart && cart.data)) {
        debug('trying to load cart without being selected. stop');
        process.exit(1);
    }
    debug('load cart');

    this._bank0 = new Uint8Array(cart.data, 0, 0x3FFF);
    this._isCartLoaded = true;
};

Mmu.prototype.readByte = function (addr) {

    assert(!isNaN(addr), 'Invalid address');

    debug('read byte 0x%s', addr.toString(16));

    switch (addr & 0xF000) {

        // $0150-$3FFF  Cartridge ROM - Bank 0 (fixed)
        // $0100-$014F  Cartridge Header Area
        // $0000-$00FF  Restart and Interrupt Vectors

        case 0x0000:
        case 0x1000:
        case 0x2000:
        case 0x3000:

            // BIOS

            if (addr < 0x100 && !this._hasRunBios) return this._bios[addr];
            else if (!this._hasRunBios) {
                debug('leaving BIOS. mapping to bank 0 from now on');
                this._hasRunBios = true;
            }

            // $0150-$3FFF  Cartridge ROM - Bank 0 (fixed)

            return this._bank0[addr];

        // $E000-$FDFF  Echo RAM - Reserved, Do Not Use
        // $C000-$CFFF  Internal RAM - Bank 0 (fixed)

        case 0xC000:
        case 0xE000:
            return this._wram[addr - 0xC000];

        // $FFFF        Interrupt Enable Flag
        // $FF80-$FFFE  Zero Page - 127 bytes
        // $FF00-$FF7F  Hardware I/O Registers
        // $FEA0-$FEFF  Unusable Memory
        // $FE00-$FE9F  OAM - Object Attribute Memory
        // $E000-$FDFF  Echo RAM - Reserved, Do Not Use

        case 0xF000:

            // $FFFF        Interrupt Enable Flag

            if (addr === 0xFFFF) return this._ie = value;

            // $E000-$FDFF  Echo RAM - Reserved, Do Not Use

            if (addr < 0xFE00) return this._wram[addr - 0xFDFF] = value;

            // $FF80-$FFFE  Zero Page - 127 bytes
            // $FF00-$FF7F  Hardware I/O Registers
            // $FEA0-$FEFF  Unusable Memory
            // $FE00-$FE9F  OAM - Object Attribute Memory

            switch (addr & 0xFF00) {

                // $FEA0-$FEFF  Unusable Memory
                // $FE00-$FE9F  OAM - Object Attribute Memory

                case 0xFE00:

                    // $FE00-$FE9F  OAM - Object Attribute Memory

                    if (addr < 0xFEA0) this.gpu.oam[addr - 0xFE00];

                    // $FEA0-$FEFF  Unusable Memory

                    debug('0x%s reading unusable memory. stop',
                        addr.toString(16));
                    process.exit(1);

                // $FF80-$FFFE  Zero Page - 127 bytes
                // $FF00-$FF7F  Hardware I/O Registers

                case 0xFF00:

                    // $FF0F        Interrupt flags

                    if (addr === 0xFF0F) return this._if = value;

                    // $FF00-$FF7F  Hardware I/O Registers

                    else if (addr < 0xFF80) return 0;

                    // $FF80-$FFFE  Zero Page - 127 bytes

                    else if (addr < 0xFFFE) return this._zram[addr - 0xFF80];
            }

        default:
            debug('0x%s reading unmapped address. stop', addr.toString(16));
            process.exit(1);
    }
};

Mmu.prototype.writeByte = function (addr, value) {

    assert(!isNaN(addr), 'Invalid address');

    debug('write byte 0x%s=0x%s', addr.toString(16), value.toString(16));

    switch (addr & 0xF000) {

        // $9C00-$9FFF  BG Map Data 2
        // $9800-$9BFF  BG Map Data 1
        // $8000-$97FF  Character RAM

        case 0x8000:
        case 0x9000:
            return this.gpu.vram[addr - 0x8000] = value;

        // $A000-$BFFF  Cartridge RAM (If Available)

        case 0xA000:
        case 0xB000:
            return this._eram[addr - 0xA000] = value;

        // $E000-$FDFF  Echo RAM - Reserved, Do Not Use
        // $C000-$CFFF  Internal RAM - Bank 0 (fixed)

        case 0xC000:
        case 0xE000:
            return this._wram[addr - 0xC000] = value;

        // $FFFF        Interrupt Enable Flag
        // $FF80-$FFFE  Zero Page - 127 bytes
        // $FF00-$FF7F  Hardware I/O Registers
        // $FEA0-$FEFF  Unusable Memory
        // $FE00-$FE9F  OAM - Object Attribute Memory

        case 0xF000:

            // $FFFF        Interrupt Enable Flag

            if (addr === 0xFFFF) return this._ie = value;

            // $E000-$FDFF  Echo RAM - Reserved, Do Not Use

            if (addr < 0xFE00) return this._wram[addr - 0xFDFF] = value;

            // $FF80-$FFFE  Zero Page - 127 bytes
            // $FF00-$FF7F  Hardware I/O Registers
            // $FEA0-$FEFF  Unusable Memory
            // $FE00-$FE9F  OAM - Object Attribute Memory

            switch (addr & 0xFF00) {

                // $FEA0-$FEFF  Unusable Memory
                // $FE00-$FE9F  OAM - Object Attribute Memory

                case 0xFE00:

                    // $FE00-$FE9F  OAM - Object Attribute Memory

                    if (addr < 0xFEA0) {
                        return this.gpu.oam[addr - 0xFE00] = value;
                    }

                    // $FEA0-$FEFF  Unusable Memory

                    debug('0x%s writing unusable memory. stop',
                        addr.toString(16));
                    process.exit(1);

                // $FF80-$FFFE  Zero Page - 127 bytes
                // $FF00-$FF7F  Hardware I/O Registers

                case 0xFF00:

                    // $FF0F        Interrupt flags

                    if (addr === 0xFF0F) return this._if = value;

                    // $FF00-$FF7F  Hardware I/O Registers

                    else if (addr < 0xFF80) return value;

                    // $FF80-$FFFE  Zero Page - 127 bytes

                    else if (addr < 0xFFFE) {
                        return this._zram[addr - 0xFF80] = value;
                    }
            }

        default:
            debug('0x%s writing unmapped address. stop', addr.toString(16));
            process.exit(1);
    }
};

Mmu.prototype.readWord = function (addr) {

    assert(!isNaN(addr), 'Invalid address');

    debug('read word');
    return this.readByte(addr) | this.readByte(addr + 1) << 8;
};

Mmu.prototype.writeWord = function (addr, value) {

    assert(!isNaN(addr), 'Invalid address');

    debug('write word');
    return this.writeByte(addr, value & 0xFF) |
           this.writeByte(addr + 1, (value & 0xFF00) >> 8) << 8;
};

module.exports = Mmu;
