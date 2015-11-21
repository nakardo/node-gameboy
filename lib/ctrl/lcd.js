'use strict';

var debug = require('debug')('lcd');
var bitutil = require('../bitutil');

// - http://www.codeslinger.co.uk/pages/projects/gameboy/lcd.html

// It takes 456 cpu clock cycles to draw one scanline and move onto the next.

var SCANLINE_CYCLES = 456;

// FF40 -- LCDCONT [RW] LCD Control              | when set to 1 | when set to 0
// Bit7  LCD operation                           | ON            | OFF
// Bit6  Window Tile Table address               | 9C00-9FFF     | 9800-9BFF
// Bit5  Window display                          | ON            | OFF
// Bit4  Tile Pattern Table address              | 8000-8FFF     | 8800-97FF
// Bit3  Background Tile Table address           | 9C00-9FFF     | 9800-9BFF
// Bit2  Sprite size                             | 8x16          | 8x8
// Bit1  Color #0 transparency in the window     | SOLID         | TRANSPARENT
// Bit0  Background display                      | ON            | OFF

var LCDCONT = 0xFF40;

// FF41 -- LCDSTAT [RW] LCD Status               | when set to 1 | when set to 0
// Bit6    Interrupt on scanline coincidence     | ON            | OFF
// Bit5    Interrupt on controller mode 10       | ON            | OFF
// Bit4    Interrupt on controller mode 01       | ON            | OFF
// Bit3    Interrupt on controller mode 00       | ON            | OFF
// Bit2    Scanline coincidence flag             | COINCIDENCE   | NO COINCIDENCE
// Bit1-0  LCD Controller mode:
// 00 - Horizontal blanking impulse [VRAM 8000-9FFF can be accessed by CPU]
// 01 - Vertical blanking impulse [VRAM 8000-9FFF can be accessed by CPU]
// 10 - OAM FE00-FE90 is accessed by LCD controller
// 11 - Both OAM FE00-FE90 and VRAM 8000-9FFF are accessed by LCD controller

var LCDSTAT = 0xFF41;

// FF44 -- CURLINE [RW] Current Scanline
// This register contains the number of a screen line currently being scanned.
// It can take values 0-153 where 144-153 indicate the vertical blanking period.
// Writing into this register resets it.

var CURLINE = 0xFF44;

// FF45 -- CMPLINE [RW] Scanline Comparison
// When contents of CURLINE are equal to contents of CMPLINE, scanline coincidence
// flag is set in the LCD status register and an interrupt may occur.

var CMPLINE = 0xFF45;

var onIoWriteEvent = function (addr, current, updated) {
    if (addr === CURLINE) this._mmu._io[CURLINE - 0xFF00] = 0;
};


function Lcd(cpu, mmu) {

    this._cpu = cpu;
    this._mmu = mmu;

    // Events

    this._mmu.on('io_write', onIoWriteEvent.bind(this));

    // Counter

    this._counter = 0;

    Object.seal(this);
}

Lcd.prototype.powerOn = function () {

    debug('power on');

    this._counter = SCANLINE_CYCLES;
};

Lcd.prototype.step = function (cycles) {

    debug('step');

    this._updateStatus();

    if (!this._isLcdEnabled()) return debug('lcd is disabled');

    this._counter -= cycles;

    if (this._counter <= 0) {
        debug('reset counter');

        this._counter = SCANLINE_CYCLES;

        // The reason why I access memory directly when writing to the current
        // scanline address (0xFF44) rather than using WriteMemory is because
        // when the game tries to write to 0xFF44 it resets the current scanline
        // to 0, so we cannot use WriteMemory to increment the scanline as it
        // will always set it to 0.

        var currentLine = this._mmu._io[CURLINE - 0xFF00]++;

        debug('update current scanline 0x%s=0x%s', CURLINE.toString(16),
            currentLine.toString(16));

        //  If the new scanline is 144 then this is the beginning of the
        //  vertical blank interupt so we need to request this interupt
        //  (remember that the vblank interupt is bit 0).

        if (currentLine === 144) this._cpu.interrupt(0);
        else if (currentLine < 144) this._drawScanline();
        else if (currentLine > 153) this._mmu._io[CURLINE - 0xFF00] = 0;
    }
};

// Setting the LCD Status:
//
// The memory address 0xFF41 holds the current status of the LCD. The LCD goes
// through 4 different modes. These are "V-Blank Period", "H-Blank Period",
// "Searching Sprite Attributes" and "Transferring Data to LCD Driver".
// Bit 1 and 0 of the lcd status at address 0xFF41 reflects the current LCD mode
// like so:
//
// 00: H-Blank
// 01: V-Blank
// 10: Searching Sprites Atts
// 11: Transfering Data to LCD Driver
//
// When the LCD status changes its mode to either Mode 0, 1 or 2 then this can
// cause an LCD Interupt Request to happen. Bits 3, 4 and 5 of the LCD Status
// register (0xFF41) are interupt enabled flags (the same as the Interupt
// Enabled Register 0xFFFF, see interupts chapter). These bits are set by the
// game not the emulator and they represent the following:
//
// Bit 3: Mode 0 Interupt Enabled
// Bit 4: Mode 1 Interupt Enabled
// Bit 5: Mode 2 Interupt Enabled
//
// The last part of the LCD status register (0xFF41) is the Coincidence flag.
// Basically Bit 2 of the status register is set to 1 if register (0xFF44) is
// the same value as (0xFF45) otherwise it is set to 0.
//
// Bit 6 of the LCD status register (0xFF44) is the same as the interupt enabled
// bits 3-5 but it isnt to do with the current lcd mode it is to do with the
// bit 2 coincidence flag.

Lcd.prototype._updateStatus = function () {

    var status = this._mmu.readWord(LCDSTAT);

    if (!this._isLcdEnabled()) {
        this._counter = SCANLINE_CYCLES;
        this._mmu._io[CURLINE - 0xFF00] = 0;

        // Mode 1

        status &= 252; // 0b11111100
        status = bitutil.set(status, 0);

        return this._mmu.writeWord(LCDSTAT, status);
    }

    var currentLine = this._mmu.readByte(CURLINE);
    var currentMode = status & 0x3;

    var mode = 0;
    var requestInterrupt = false;

    // The screen resolution is 160x144 meaning there are 144 visible scanlines.
    // The Gameboy draws each scanline one at a time starting from 0 to 153,
    // this means there are 144 visible scanlines and 8 invisible scanlines.
    // When the current scanline is between 144 and 153 this is the vertical
    // blank period.

    if (currentLine >= 144) {
        debug('line %d in v-blank period', currentLine);

        mode = 1;
        status = bitutil.set(status, 0);
        status = bitutil.reset(status, 1);
        requestInterrupt = bitutil.test(status, 4) === 1;
    }

    // When starting a new scanline the lcd status is set to 2, it then moves on
    // to 3 and then to 0. It then goes back to and continues then pattern until
    // the v-blank period starts where it stays on mode 1. When the vblank
    // period ends it goes back to 2 and continues this pattern over and over.
    // As previously mentioned it takes 456 clock cycles to draw one scanline
    // before moving onto the next. This can be split down into different
    // sections which will represent the different modes.
    // Mode 2 (Searching Sprites Atts) will take the first 80 of the 456 clock
    // cycles. Mode 3 (Transfering to LCD Driver) will take 172 clock cycles of
    // the 456 and the remaining clock cycles of the 456 is for
    // Mode 0 (H-Blank).

    else {
        var mode2bounds = SCANLINE_CYCLES - 80;
        var mode3bounds = mode2bounds - 172;

        // Mode 2

        if (this._counter >= mode2bounds) {
            mode = 2;
            status = bitutil.set(status, 1);
            status = bitutil.reset(status, 0);
            requestInterrupt = bitutil.test(status, 5) === 1;
        }

        // Mode 3

        else if (this._counter >= mode3bounds) {
            mode = 3;
            status = bitutil.set(status, 1);
            status = bitutil.set(status, 0);
        }

        // Mode 0

        else {
            mode = 0;
            status = bitutil.reset(status, 1);
            status = bitutil.reset(status, 0);
            requestInterrupt = bitutil.test(status, 3) === 1;
        }
    }

    // Just entered a new mode so request interupt

    if (requestInterrupt && (mode !== currentmode)) {
        debug('changing to mode %d', mode);
        this._cpu.interrupt(1);
    }

    // Check the conincidence flag

    if (currentLine === this._mmu.readByte(CMPLINE)) {
        debug('coincidence for line %d', currentLine);

        status = bitutil.set(status, 2);
        if (bitutil.test(status, 6)) this._cpu.interrupt(1);
    } else {
        status = bitutil.reset(status, 2);
    }

    this._mmu.writeWord(LCDSTAT, status);
};

Lcd.prototype._isLcdEnabled = function () {
    return bitutil.test(this._mmu.readWord(LCDCONT), 7);
};

Lcd.prototype._drawScanline = function () {
    // body...
};

module.exports = Lcd;
