'use strict';

const debug = require('debug')('mmu');
const read = require('debug')('mmu:read');
const write = require('debug')('mmu:write');

const {
    DIV,  // FF04 - DIV - Divider Register (R/W)
    TAC,  // FF07 - TAC - Timer Control (R/W)
    TMA,  // FF06 - TMA - Timer Modulo (R/W)
    TIMA, // FF05 - TIMA - Timer counter (R/W)
    LCDC, // FF40 - LCDC - LCD Control (R/W)
    STAT, // FF41 - STAT - LCDC Status (R/W)
    SCY,  // FF42 - SCY - Scroll Y (R/W)
    SCX,  // FF43 - SCX - Scroll X (R/W)
    LY,   // FF44 - LY - LCDC Y-Coordinate (R)
    LYC,  // FF45 - LYC - LY Compare (R/W)
    BGP,  // FF47 - BGP - BG Palette Data (R/W) - Non CGB Mode Only
    IE    // FFFF - IE - Interrupt Enable (R/W)
} = require('./registers');

const BIOS_DISABLED = 0xff50;


class Mmu {
    constructor (bios) {
        // BIOS

        this._bios = new Uint8Array(bios);
        this._biosDisabled = bios == undefined & 1;

        // Registers

        this.gpu = null;
        this.timer = null;
        this.lcd = null;

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

    readByte (pos) {
        pos &= 0xffff;

        read('$%s', pos.toString(16));

        switch (pos & 0xf000) {
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
                if (!this._biosDisabled && pos < 0x100) return this._bios[pos];
                return this._bank0[pos];
            // $8000-$97FF  Character RAM
            // $9800-$9BFF  BG Map Data 1
            // $9C00-$9FFF  BG Map Data 2
            case 0x8000:
            case 0x9000:
                return this._vram[pos & 0x1fff];
            // $A000-$BFFF  Cartridge RAM (If Available)
            case 0xa000:
            case 0xb000:
                return this._eram[pos & 0x1fff];
            // $D000-$DFFF  Internal RAM - Bank 1-7 (switchable - CGB only)
            // $C000-$CFFF  Internal RAM - Bank 0 (fixed)
            case 0xc000:
            case 0xd000:
                return this._wram[pos & 0x1fff];
            // $E000-$FDFF  Echo RAM - Reserved, Do Not Use
            // $FE00-$FE9F  OAM - Object Attribute Memory
            // $FEA0-$FEFF  Unusable Memory
            // $FF00-$FF7F  Hardware I/O Registers
            // $FF80-$FFFE  Zero Page - 127 bytes
            // $FFFF        Interrupt Enable Flag
            case 0xe000:
            case 0xf000:
                if (pos == IE) return this._ie;
                if (pos > 0xff7f) return this._zram[pos & 0x7f];
                if (pos > 0xfeff) switch (pos) {
                    // FF47 - BGP - BG Palette Data (R/W) - Non CGB Mode Only
                    // FF45 - LYC - LY Compare (R/W)
                    // FF44 - LY - LCDC Y-Coordinate (R)
                    // FF43 - SCX - Scroll X (R/W)
                    // FF42 - SCY - Scroll Y (R/W)
                    // FF41 - STAT - LCDC Status (R/W)
                    // FF40 - LCDC - LCD Control (R/W)
                    // FF05 - TIMA - Timer counter (R/W)
                    // FF06 - TMA - Timer Modulo (R/W)
                    // FF07 - TAC - Timer Control (R/W)
                    // FF04 - DIV - Divider Register (R/W)
                    case BGP: return this.gpu.bgp;
                    case LYC: return this.lcd.lyc;
                    case LY: return this.lcd.ly;
                    case SCX: return this.gpu.scx;
                    case SCY: return this.gpu.scy;
                    case STAT: return this.lcd.stat;
                    case LCDC: return this.gpu.lcdc;
                    case TIMA: return this.timer.tima;
                    case TMA: return this.timer.tma;
                    case TAC: return this.timer.tac;
                    case DIV: return this.timer.div;
                    default: return this._io[pos & 0xff];
                }
                if (pos > 0xfe9f) return 0;
                if (pos > 0xfdff) return this._oam[pos & 0xff];
                return this._wram[pos & 0x1fff];
        }

        throw new Error(`unmapped address 0x${pos.toString(16)}`);
    }

    readWord (pos) {
        return this.readByte(pos) | this.readByte(pos + 1) << 8;
    }

    writeByte (pos, val) {
        pos &= 0xffff;
        val &= 0xff;

        write('$%s = 0x%s', pos.toString(16), val.toString(16));

        if (pos == 0xff02 && val == 0x81) {
            const char = String.fromCharCode(this.readByte(0xff01));
            process.stdout.write(char);
        }

        switch (pos & 0xf000) {
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
                return this._vram[pos & 0x1fff] = val;
            // $A000-$BFFF  Cartridge RAM (If Available)
            case 0xa000:
            case 0xb000:
                return this._eram[pos & 0x1fff] = val;
            // $D000-$DFFF  Internal RAM - Bank 1-7 (switchable - CGB only)
            // $C000-$CFFF  Internal RAM - Bank 0 (fixed)
            case 0xc000:
            case 0xd000:
                return this._wram[pos & 0x1fff] = val;
            // $E000-$FDFF  Echo RAM - Reserved, Do Not Use
            // $FE00-$FE9F  OAM - Object Attribute Memory
            // $FEA0-$FEFF  Unusable Memory
            // $FF00-$FF7F  Hardware I/O Registers
            // $FF80-$FFFE  Zero Page - 127 bytes
            // $FFFF        Interrupt Enable Flag
            case 0xe000:
            case 0xf000:
                if (pos == IE) return this._ie = val;
                if (pos > 0xff7f) return this._zram[pos & 0x7f] = val;
                if (pos > 0xfeff) switch (pos) {
                    // FF47 - BGP - BG Palette Data (R/W) - Non CGB Mode Only
                    // FF45 - LYC - LY Compare (R/W)
                    // FF44 - LY - LCDC Y-Coordinate (R)
                    // FF43 - SCX - Scroll X (R/W)
                    // FF42 - SCY - Scroll Y (R/W)
                    // FF41 - STAT - LCDC Status (R/W)
                    // FF40 - LCDC - LCD Control (R/W)
                    // FF05 - TIMA - Timer counter (R/W)
                    // FF06 - TMA - Timer Modulo (R/W)
                    // FF07 - TAC - Timer Control (R/W)
                    // FF04 - DIV - Divider Register (R/W)
                    case BGP: return this.gpu.bgp = val;
                    case LYC: return this.lcd.lyc = val;
                    case LY: return this.lcd.ly = val;
                    case SCX: return this.gpu.scx = val;
                    case SCY: return this.gpu.scy = val;
                    case STAT: return this.lcd.stat = val;
                    case LCDC: return this.gpu.lcdc = val;
                    case TIMA: return this.timer.tima = val;
                    case TMA: return this.timer.tma = val;
                    case TAC: return this.timer.tac = val;
                    case DIV: return this.timer.div = 0;
                    case BIOS_DISABLED: this._biosDisabled = 1;
                    default: return this._io[pos & 0xff] = val;
                }
                if (pos > 0xfe9f) return 0;
                if (pos > 0xfdff) return this._oam[pos & 0xff] = val;
                return this._wram[pos & 0x1fff] = val;
        }

        throw new Error(`unmapped address 0x${pos.toString(16)}`);
    }

    writeWord (pos, val) {
        this.writeByte(pos, val);
        this.writeByte(pos + 1, val >> 8);
    }
}

module.exports = Mmu;
