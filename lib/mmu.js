var debug = require('debug')('mmu');


function Mmu(gpu) {

    this.gpu = gpu;

    // Docs
    //
    // - http://imrannazar.com/GameBoy-Emulation-in-JavaScript:-Memory
    // - http://imrannazar.com/GameBoy-Emulation-in-JavaScript:-Interrupts
    // - http://gameboy.mongenel.com/dmg/asmmemmap.html

    this._hasRunBios = false;
    this._isCartLoaded = false;

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

    this._bios = null;

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
}

Mmu.prototype.powerOn = function () {

    debug('power on');

    if (!this._isCartLoaded) {
        debug('cannot start without any cart loaded. stop');
        process.exit(1);
    }

    // Load BIOS

    this._bios = new Uint8Array([
        0x31, 0xFE, 0xFF, 0xAF, 0x21, 0xFF, 0x9F, 0x32, 0xCB, 0x7C, 0x20, 0xFB,
        0x21, 0x26, 0xFF, 0x0E, 0x11, 0x3E, 0x80, 0x32, 0xE2, 0x0C, 0x3E, 0xF3,
        0xE2, 0x32, 0x3E, 0x77, 0x77, 0x3E, 0xFC, 0xE0, 0x47, 0x11, 0x04, 0x01,
        0x21, 0x10, 0x80, 0x1A, 0xCD, 0x95, 0x00, 0xCD, 0x96, 0x00, 0x13, 0x7B,
        0xFE, 0x34, 0x20, 0xF3, 0x11, 0xD8, 0x00, 0x06, 0x08, 0x1A, 0x13, 0x22,
        0x23, 0x05, 0x20, 0xF9, 0x3E, 0x19, 0xEA, 0x10, 0x99, 0x21, 0x2F, 0x99,
        0x0E, 0x0C, 0x3D, 0x28, 0x08, 0x32, 0x0D, 0x20, 0xF9, 0x2E, 0x0F, 0x18,
        0xF3, 0x67, 0x3E, 0x64, 0x57, 0xE0, 0x42, 0x3E, 0x91, 0xE0, 0x40, 0x04,
        0x1E, 0x02, 0x0E, 0x0C, 0xF0, 0x44, 0xFE, 0x90, 0x20, 0xFA, 0x0D, 0x20,
        0xF7, 0x1D, 0x20, 0xF2, 0x0E, 0x13, 0x24, 0x7C, 0x1E, 0x83, 0xFE, 0x62,
        0x28, 0x06, 0x1E, 0xC1, 0xFE, 0x64, 0x20, 0x06, 0x7B, 0xE2, 0x0C, 0x3E,
        0x87, 0xF2, 0xF0, 0x42, 0x90, 0xE0, 0x42, 0x15, 0x20, 0xD2, 0x05, 0x20,
        0x4F, 0x16, 0x20, 0x18, 0xCB, 0x4F, 0x06, 0x04, 0xC5, 0xCB, 0x11, 0x17,
        0xC1, 0xCB, 0x11, 0x17, 0x05, 0x20, 0xF5, 0x22, 0x23, 0x22, 0x23, 0xC9,
        0xCE, 0xED, 0x66, 0x66, 0xCC, 0x0D, 0x00, 0x0B, 0x03, 0x73, 0x00, 0x83,
        0x00, 0x0C, 0x00, 0x0D, 0x00, 0x08, 0x11, 0x1F, 0x88, 0x89, 0x00, 0x0E,
        0xDC, 0xCC, 0x6E, 0xE6, 0xDD, 0xDD, 0xD9, 0x99, 0xBB, 0xBB, 0x67, 0x63,
        0x6E, 0x0E, 0xEC, 0xCC, 0xDD, 0xDC, 0x99, 0x9F, 0xBB, 0xB9, 0x33, 0x3E,
        0x3c, 0x42, 0xB9, 0xA5, 0xB9, 0xA5, 0x42, 0x4C, 0x21, 0x04, 0x01, 0x11,
        0xA8, 0x00, 0x1A, 0x13, 0xBE, 0x20, 0xFE, 0x23, 0x7D, 0xFE, 0x34, 0x20,
        0xF5, 0x06, 0x19, 0x78, 0x86, 0x23, 0x05, 0x20, 0xFB, 0x86, 0x20, 0xFE,
        0x3E, 0x01, 0xE0, 0x50
    ]);

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

    debug('read byte 0x%s', addr.toString(16));

    switch (addr >> 15) {

        // - [0000-3FFF] Cartridge ROM, bank 0
        //   * [0000-00FF] BIOS
        //   * [0100-014F] Cartridge header

        case 0: case 1: case 2: case 3:

            // - [0000-00FF] BIOS

            if (addr < 0xFF && !this._hasRunBios) return this._bios[addr];
            else if (!this._hasRunBios) {
                debug('leaving BIOS. mapping to bank 0 from now on');
                this._hasRunBios = true;
            }

            // - [0000-3FFF] Cartridge ROM, bank 0

            return this._bank0[addr];

        default:
            debug('0x%s reading unmapped address. stop', addr.toString(16));
            process.exit(1);
    }
};

Mmu.prototype.writeByte = function (addr, value) {

    debug('write byte 0x%s=0x%s', addr.toString(16), value.toString(16));

    value &= 0xFF;

    switch (addr & 0xF000) {

        // - [8000-9FFF] Graphics RAM

        case 0x8000: case 0x9000:
            return this.gpu._vram[addr - 0x8000] = value;

        // - [A000-BFFF] Cartridge (External) RAM

        case 0xA000: case 0xB000:
            return this._eram[addr - 0xA000] = value;

        // - [C000-DFFF] Working RAM
        // - [E000-FDFF] Working RAM (shadow)

        case 0xC000: case 0xD000: case 0xE000:
            return this._wram[addr - 0xC000] = value;

        // - [E000-FDFF] Working RAM (shadow)
        // - [FE00-FE9F] Graphics: sprite information
        // - [FF00-FF7F] Memory-mapped I/O
        // - [FF80-FFFE] Zero-page RAM

        case 0xF000:

            // - [E000-FDFF] Working RAM (shadow)

            if (addr <= 0xFDFF) return this._wram[addr - 0xFDFF] = value;

            // - [FE00-FE9F] Graphics: sprite information
            // - [FF00-FF7F] Memory-mapped I/O
            // - [FF80-FFFE] Zero-page RAM

            switch (addr & 0xFF00) {

                // - [FE00-FE9F] Graphics: sprite information

                case 0xFE00: return this.gpu._oam[addr - 0xFE00] = value;

                case 0xFF00:

                    // - [FF0F] Interrupt flags

                    if (addr === 0xFF0F) return this._if = value;

                    // - [FF00-FF7F] Memory-mapped I/O

                    else if (addr < 0xFF80) return 0;

                    // - [FF80-FFFE] Zero-page RAM

                    else if (addr < 0xFFFE) {
                        return this._zram[addr - 0xFE00] = value;
                    }

                default: break
            }

            // - [FFFF] Interrupt enable flag

            if (addr === 0xFFFF) return this._ie = value;

        default:
            debug('0x%s writing unmapped address. stop', addr.toString(16));
            process.exit(1);
    }
};

Mmu.prototype.readWord = function (addr) {

    debug('read word 0x%s', addr.toString(16));
    return this.readByte(addr) | this.readByte(addr + 1) << 8;
};

Mmu.prototype.writeWord = function (addr, value) {

    debug('write word 0x%s=0x%s', addr.toString(16), value.toString(16));
    return this.writeByte(addr, value & 0xFF) |
           this.writeByte(addr + 1, value >> 8) << 8;
};

module.exports = Mmu;
