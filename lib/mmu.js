'use strict';

var fs = require('fs');
var assert = require('assert');
var util = require('util');
var EventEmitter = require('events');
var debug = require('debug')('mmu');


// - http://imrannazar.com/GameBoy-Emulation-in-JavaScript:-Memory
// - http://gbdev.gg8.se/wiki/articles/Gameboy_Bootstrap_ROM#Contents_of_the_ROM
// - http://gameboy.mongenel.com/dmg/asmmemmap.html
// - http://fms.komkon.org/GameBoy/Tech/Software.html

function Mmu(gpu) {

    this.gpu = gpu;

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
    // $4000-$7FFF  Cartridge ROM - Switchable Banks 1-xx   |
    // $0150-$3FFF  Cartridge ROM - Bank 0 (fixed)          |  Cart Area
    // $0100-$014F  Cartridge Header Area                   |   (32 kB)
    // $0000-$00FF  Restart and Interrupt Vectors           |

    this._zram = null;
    this._io = null;
    this._wram = null;
    this._eram = null;
    this._bank0 = null;

    // Interrupts

    // FFFF -- ISWITCH [RW] Interrupt Enable/Disable | when set to 1 | when set to 0
    // Bit4  Transition High->Low on pins P10-P13    | ENABLED       | DISABLED
    // Bit3  End of serial I/O transfer              | ENABLED       | DISABLED
    // Bit2  Timer overflow                          | ENABLED       | DISABLED
    // Bit1  LCD controller interrupt [see LCDSTAT]  | ENABLED       | DISABLED
    // Bit0  LCD vertical blanking impulse           | ENABLED       | DISABLED

    this._ie = 0;

    EventEmitter.call(this);

    Object.seal(this);
}

util.inherits(Mmu, EventEmitter);


Mmu.prototype.powerOn = function () {

    debug('power on');

    if (!this._isCartLoaded) {
        debug('cannot start without any cart loaded. stop');
        process.exit(1);
    }

    // Load BIOS

    this._bios = new Uint8Array(fs.readFileSync('./support/bios.bin'), 0, 0xFF);

    this._zram = new Uint8Array(0x80);
    this._io = new Uint8Array(0x80);
    this._wram = new Uint8Array(0x400);
    this._eram = new Uint8Array(0x2000);
};

Mmu.prototype.loadCart = function (cart) {

    if (!(cart && cart.data)) {
        debug('trying to load cart without being selected. stop');
        process.exit(1);
    }
    debug('load cart');

    this._bank0 = new Uint8Array(cart.data, 0, 0x4000);
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

            // $E000-$FDFF  Echo RAM - Reserved, Do Not Use

            if (addr < 0xFE00) return this._wram[addr - 0xE000];

            // $FFFF        Interrupt Enable Flag
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

                // $FFFF        Interrupt Enable Flag
                // $FF80-$FFFE  Zero Page - 127 bytes
                // $FF00-$FF7F  Hardware I/O Registers

                case 0xFF00:

                    // $FF00-$FF7F  Hardware I/O Registers

                    if (addr < 0xFF80) return this._io[addr - 0xFF00];

                    // $FF80-$FFFE  Zero Page - 127 bytes

                    else if (addr < 0xFFFF) return this._zram[addr - 0xFF80];

                    // $FFFF        Interrupt Enable Flag

                    else return this._ie;
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

            // $E000-$FDFF  Echo RAM - Reserved, Do Not Use

            if (addr < 0xFE00) return this._wram[addr - 0xE000] = value;

            // $FFFF        Interrupt Enable Flag
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

                // $FFFF        Interrupt Enable Flag
                // $FF80-$FFFE  Zero Page - 127 bytes
                // $FF00-$FF7F  Hardware I/O Registers

                case 0xFF00:

                    // $FF00-$FF7F  Hardware I/O Registers

                    if (addr < 0xFF80) {
                        var current = this._io[addr - 0xFF00];
                        var updated = this._io[addr - 0xFF00] = value;

                        this.emit('io_write', addr, current, updated);

                        return updated;
                    }

                    // $FF80-$FFFE  Zero Page - 127 bytes

                    else if (addr < 0xFFFF) {
                        return this._zram[addr - 0xFF80] = value;
                    }

                    else return this._ie = value;
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
