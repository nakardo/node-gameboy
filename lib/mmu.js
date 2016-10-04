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
            // $FEA0-$FEFF  Unusable Memory
            // $FE00-$FE9F  OAM - Object Attribute Memory
            // $E000-$FDFF  Echo RAM - Reserved, Do Not Use
            case 0xf000:
                if (pos == IE) return this._ie;
                else if (pos >= 0xff80) return this._zram[pos - 0xff80];
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
                else if (pos >= 0xff00) switch (pos) {
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
                    default: return this._io[pos - 0xff00];
                }
                else if (pos >= 0xfe00) break; // TODO(dmacosta) unimplemented
                return this._wram[pos - 0xe000];
            // $E000-$FDFF  Echo RAM - Reserved, Do Not Use
            case 0xe000:
                return this._wram[pos - 0xe000];
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
                if (!this._biosDisabled && pos < 0x100) return this._bios[pos];
                return this._bank0[pos];
        }

        throw new Error(`unmapped address 0x${pos.toString(16)}`);
    }

    readWord (pos) {
        return this.readByte(pos) | this.readByte(pos + 1) << 8;
    }

    writeByte (pos, value) {
        value &= 0xff;

        write('$%s = 0x%s', pos.toString(16), value.toString(16));

        if (pos == 0xff02 && value == 0x81) {
            const char = String.fromCharCode(this.readByte(0xff01));
            process.stdout.write(char);
        }

        switch (pos & 0xf000) {
            // $FFFF        Interrupt Enable Flag
            // $FF80-$FFFE  Zero Page - 127 bytes
            // $FF00-$FF7F  Hardware I/O Registers
            // $FEA0-$FEFF  Unusable Memory
            // $FE00-$FE9F  OAM - Object Attribute Memory
            // $E000-$FDFF  Echo RAM - Reserved, Do Not Use
            case 0xf000:
                if (pos == IE) return this._ie = value;
                else if (pos >= 0xff80) return this._zram[pos - 0xff80] = value;
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
                else if (pos >= 0xff00) switch (pos) {
                    case BGP: return this.gpu.bgp = value;
                    case LYC: return this.lcd.lyc = value;
                    case LY: return this.lcd.ly = value;
                    case SCX: return this.gpu.scx = value;
                    case SCY: return this.gpu.scy = value;
                    case STAT: return this.lcd.stat = value;
                    case LCDC: return this.gpu.lcdc = value;
                    case TIMA: return this.timer.tima = value;
                    case TMA: return this.timer.tma = value;
                    case TAC: return this.timer.tac = value;
                    case DIV: return this.timer.div = 0;
                    case BIOS_DISABLED: this._biosDisabled = 1;
                    default: return this._io[pos - 0xff00] = value;
                }
                else if (pos >= 0xfe00) break; // TODO(dmacosta) unimplemented
                return this._wram[pos - 0xe000] = value;
            // $E000-$FDFF  Echo RAM - Reserved, Do Not Use
            case 0xe000:
                return this._wram[pos - 0xe000] = value;
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
