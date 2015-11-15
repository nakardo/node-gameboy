'use strict';

var debug = require('debug')('lcd');

// - http://www.codeslinger.co.uk/pages/projects/gameboy/lcd.html

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

    debug('io update 0x%s=0x%s', addr.toString(16), updated.toString(16));

    if (addr === CURLINE) {
        return this._mmu._io[CURLINE - 0xFF00] = 0;
    }
};


function Lcd(cpu, mmu) {

    this._cpu = cpu;
    this._mmu = mmu;

    // Events

    this._mmu.on('io_write', onIoWriteEvent.bind(this));

    // Status

    this._counter = 0;
    this._status = 0;

    Object.seal(this);
}

Lcd.prototype.powerOn = function () {
    debug('power on');
};

Lcd.prototype.step = function (cycles) {

    debug('step');

    this._updateStatus();

    if (!this._isLcdEnabled()) return;

    this._counter -= cycles;

    if (this._counter <= 0) {
        this._counter = SCANLINE_CYCLES;

        debug('reset counter');

        // The reason why I access memory directly when writing to the current
        // scanline address (0xFF44) rather than using WriteMemory is because
        // when the game tries to write to 0xFF44 it resets the current scanline
        // to 0, so we cannot use WriteMemory to increment the scanline as it
        // will always set it to 0.

        var currentLine = this._mmu._io[CURLINE - 0xFF00]++;

        debug('update current scanline %d=0x%d', CURLINE, currentLine);

        if (currentLine === 144) this._cpu.interrupt(0);
        else if (currentLine < 144) this._drawScanline();
        else this._mmu._io[CURLINE - 0xFF00] = 0;
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

Lcd.prototype._updateStatus = function () {
    // body...
};

Lcd.prototype._isLcdEnabled = function () {
    return this._mmu.readByte(LCDCONT) & 0x80 ? true : false;
};

Lcd.prototype._drawScanline = function () {
    // body...
};

module.exports = Lcd;
