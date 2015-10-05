var debug = require('debug')('mmu');


function Mmu() {

    // Docs
    //
    // - http://imrannazar.com/GameBoy-Emulation-in-JavaScript:-Memory
    // - http://imrannazar.com/GameBoy-Emulation-in-JavaScript:-Interrupts
    // - http://gameboy.mongenel.com/dmg/asmmemmap.html

    this._hasRunBios = false;
    this._isCartLoaded = false;

    // Memory map
    //
    // [0000-3FFF]
    //
    // Cartridge ROM, bank 0: The first 16,384 bytes of the
    // cartridge program are always available at this point in the memory map.
    // Special circumstances apply:
    //
    // [0000-00FF]
    //
    // BIOS: When the CPU starts up, PC starts at 0000h, which is the start of
    // the 256-byte GameBoy BIOS code. Once the BIOS has run, it is removed from
    // the memory map, and this area of the cartridge rom becomes addressable.
    //
    // [0100-014F]
    //
    // Cartridge header: This section of the cartridge contains data about its
    // name and manufacturer, and must be written in a specific format.
    //
    // [4000-7FFF]
    //
    // Cartridge ROM, other banks: Any subsequent 16k "banks" of the cartridge
    // program can be made available to the CPU here, one by one; a chip on the
    // cartridge is generally used to switch between banks, and make a
    // particular area accessible. The smallest programs are 32k, which means
    // that no bank-selection chip is required.
    //
    // [8000-9FFF]
    //
    // Graphics RAM: Data required for the backgrounds and sprites used by the
    // graphics subsystem is held here, and can be changed by the cartridge
    // program. This region will be examined in further detail in part 3 of this
    // series.
    //
    // [A000-BFFF]
    //
    // Cartridge (External) RAM: There is a small amount of writeable memory
    // available in the GameBoy; if a game is produced that requires more RAM
    // than is available in the hardware, additional 8k chunks of RAM can be
    // made addressable here.
    //
    // [C000-DFFF]
    //
    // Working RAM: The GameBoy's internal 8k of RAM, which can be read from or
    // written to by the CPU.
    //
    // [E000-FDFF]
    //
    // Working RAM (shadow): Due to the wiring of the GameBoy hardware, an exact
    // copy of the working RAM is available 8k higher in the memory map. This
    // copy is available up until the last 512 bytes of the map, where other
    // areas are brought into access.
    //
    // [FE00-FE9F]
    //
    // Graphics: sprite information: Data about the sprites rendered by the
    // graphics chip are held here, including the sprites' positions and
    // attributes.
    //
    // [FF00-FF7F]
    //
    // Memory-mapped I/O: Each of the GameBoy's subsystems
    // (graphics, sound, etc.) has control values, to allow programs to create
    // effects and use the hardware. These values are available to the CPU
    // directly on the address bus, in this area.
    //
    // [FF80-FFFF]
    //
    // Zero-page RAM: A high-speed area of 128 bytes of RAM is available at the
    // top of memory. Oddly, though this is "page" 255 of the memory, it is
    // referred to as page zero, since most of the interaction between the
    // program and the GameBoy hardware occurs through use of this page of
    // memory.

    this._bios = null;

    this._bank0 = null;
    this._vram = null;
    this._eram = null;
    this._wram = null;
    this._oam = null;

    // Interrupts Flags

    // Interrupt enable
    //
    // Location: FFFF
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

    // Interrupt Flags
    //
    // Location: FF0F
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

    this._vram = new Uint8Array(0x1FFF);
    this._eram = new Uint8Array(0x1FFF);
    this._wram = new Uint8Array(0x03FF);
    this._oam = new Uint8Array(0x9F);
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
            if (addr < 0xFF && !this._hasRunBios) {
                return this._bios[addr];
            }
            this._hasRunBios = true;

            return this._bank0[addr];
        default:
            debug('0x%s reading unmapped address. stop', addr.toString(16));
            process.exit(1);
    }
};

Mmu.prototype.writeByte = function (addr, value) {

    debug('write byte 0x%s=%s', addr.toString(16), value.toString(16));

    value &= 0xFF;

    switch (addr & 0xF000) {

        // - [8000-9FFF] Graphics RAM

        case 0x8000: case 0x9000:
            return this._vram[addr - 0x8000] = value;

        // - [A000-BFFF] Cartridge (External) RAM

        case 0xA000: case 0xBFFF:
            return this._eram[addr - 0xA000] = value;

        // - [C000-DFFF] Working RAM
        // - [E000-FDFF] Working RAM (shadow)

        case 0xC000: case 0xD000: case 0xE000:
            return this._wram[addr - 0xC000] = value;

        // - [E000-FDFF] Working RAM (shadow)
        // - [FE00-FE9F] Graphics: sprite information
        // - [FF00-FF7F] Memory-mapped I/O
        // - [FF80-FFFF] Zero-page RAM

        case 0xF000:

            // - [E000-FDFF] Working RAM (shadow)

            if (addr < 0xFE00) return this._wram[addr - 0xC000] = value;

            // - [FE00-FE9F] Graphics: sprite information
            // - [FF00-FF7F] Memory-mapped I/O
            // - [FF80-FFFF] Zero-page RAM

            switch (addr & 0xFF00) {
                case 0xFE00:
                    if (addr < 0xFF00) this._oam[addr - 0xFE00] = value;
                    break;
                default:

            }

            // Interrupts

            if (addr === 0xFF0F) return this._if = value;
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

    debug('write word 0x%s=%s', addr.toString(16), value.toString(16));
    return this.writeByte(addr, value & 0xFF) |
           this.writeByte(addr + 1, value >> 8) << 8;
};

module.exports = Mmu;
