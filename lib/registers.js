'use strict';

/**
 * FF00 - JOYP - Joypad (R/W)
 *
 * The eight gameboy buttons/direction keys are arranged in form of a 2x4
 * matrix. Select either button or direction keys by writing to this
 * register, then read-out bit 0-3.
 *
 * Bit 7 - Not used
 * Bit 6 - Not used
 * Bit 5 - P15 Select Button Keys      (0=Select)
 * Bit 4 - P14 Select Direction Keys   (0=Select)
 * Bit 3 - P13 Input Down  or Start    (0=Pressed) (Read Only)
 * Bit 2 - P12 Input Up    or Select   (0=Pressed) (Read Only)
 * Bit 1 - P11 Input Left  or Button B (0=Pressed) (Read Only)
 * Bit 0 - P10 Input Right or Button A (0=Pressed) (Read Only)
 */
exports.JOYP = 0xff00;

/**
 * FF04 - DIV - Divider Register (R/W)
 *
 * This register is incremented at rate of 16384Hz (~16779Hz on SGB).
 * Writing any value to this register resets it to 00h.
 *
 * Note: The divider is affected by CGB double speed mode, and will
 * increment at 32768Hz in double speed.
 */
exports.DIV = 0xff04;

/**
 * FF05 - TIMA - Timer counter (R/W)
 *
 * This timer is incremented by a clock frequency specified by the TAC
 * register ($FF07). When the value overflows (gets bigger than FFh)
 * then it will be reset to the value specified in TMA (FF06), and an
 * interrupt will be requested, as described below.
 */
exports.TIMA = 0xff05;

/**
 * FF06 - TMA - Timer Modulo (R/W)
 *
 * When the TIMA overflows, this data will be loaded.
 */
exports.TMA = 0xff06;

/**
 * FF07 - TAC - Timer Control (R/W)
 *
 * Bit 2    - Timer Enable
 * Bits 1-0 - Input Clock Select
 *      00: CPU Clock / 1024 (DMG, CGB:   4096 Hz, SGB:   ~4194 Hz)
 *      01: CPU Clock / 16   (DMG, CGB: 262144 Hz, SGB: ~268400 Hz)
 *      10: CPU Clock / 64   (DMG, CGB:  65536 Hz, SGB:  ~67110 Hz)
 *      11: CPU Clock / 256  (DMG, CGB:  16384 Hz, SGB:  ~16780 Hz)
 *
 * Note: The "Timer Enable" bit only affects the timer, the divider is
 * ALWAYS counting.
 */
exports.TAC = 0xff07;

/**
 * FF0F - IF - Interrupt Flag (R/W)
 *
 * Bit 0: V-Blank  Interrupt Request (INT 40h)  (1=Request)
 * Bit 1: LCD STAT Interrupt Request (INT 48h)  (1=Request)
 * Bit 2: Timer    Interrupt Request (INT 50h)  (1=Request)
 * Bit 3: Serial   Interrupt Request (INT 58h)  (1=Request)
 * Bit 4: Joypad   Interrupt Request (INT 60h)  (1=Request)
 */
exports.IF = 0xff0f;

/**
 * FF40 - LCDC - LCD Control (R/W)
 *
 * Bit 7 - LCD Display Enable             (0=Off, 1=On)
 * Bit 6 - Window Tile Map Display Select (0=9800-9BFF, 1=9C00-9FFF)
 * Bit 5 - Window Display Enable          (0=Off, 1=On)
 * Bit 4 - BG & Window Tile Data Select   (0=8800-97FF, 1=8000-8FFF)
 * Bit 3 - BG Tile Map Display Select     (0=9800-9BFF, 1=9C00-9FFF)
 * Bit 2 - OBJ (Sprite) Size              (0=8x8, 1=8x16)
 * Bit 1 - OBJ (Sprite) Display Enable    (0=Off, 1=On)
 * Bit 0 - BG Display (for CGB see below) (0=Off, 1=On)
 */
exports.LCDC = 0xff40;

/**
 * FF41 - STAT - LCDC Status (R/W)
 *
 * Bit 6 - LYC=LY Coincidence Interrupt (1=Enable) (Read/Write)
 * Bit 5 - Mode 2 OAM Interrupt         (1=Enable) (Read/Write)
 * Bit 4 - Mode 1 V-Blank Interrupt     (1=Enable) (Read/Write)
 * Bit 3 - Mode 0 H-Blank Interrupt     (1=Enable) (Read/Write)
 * Bit 2 - Coincidence Flag  (0:LYC<>LY, 1:LYC=LY) (Read Only)
 * Bit 1-0 - Mode Flag       (Mode 0-3, see below) (Read Only)
 *           0: During H-Blank
 *           1: During V-Blank
 *           2: During Searching OAM-RAM
 *           3: During Transfering Data to LCD Driver
 */
exports.STAT = 0xff41;

/**
 * FF42 - SCY - Scroll Y (R/W)
 * FF43 - SCX - Scroll X (R/W)
 *
 * Specifies the position in the 256x256 pixels BG map (32x32 tiles) which
 * is to be displayed at the upper/left LCD display position.
 *
 * Values in range from 0-255 may be used for X/Y each, the video
 * controller automatically wraps back to the upper (left) position in BG
 * map when drawing exceeds the lower (right) border of the BG map area.
 */
exports.SCY = 0xff42;
exports.SCX = 0xff43;

/**
 * FF44 - LY - LCDC Y-Coordinate (R)
 *
 * The LY indicates the vertical line to which the present data is
 * transferred to the LCD Driver. The LY can take on any value between 0
 * through 153. The values between 144 and 153 indicate the V-Blank period.
 * Writing will reset the counter.
 */
exports.LY = 0xff44;

/**
 * FF45 - LYC - LY Compare (R/W)
 *
 * The gameboy permanently compares the value of the LYC and LY registers.
 * When both values are identical, the coincident bit in the STAT register
 * becomes set, and (if enabled) a STAT interrupt is requested.
 */
exports.LYC = 0xff45;

/**
 * FF46 - DMA - DMA Transfer and Start Address (W)
 *
 * Writing to this register launches a DMA transfer from ROM or RAM to OAM
 * memory (sprite attribute table). The written value specifies the transfer
 * source address divided by 100h, ie. source & destination are:
 *
 * Source:      XX00-XX9F   ;XX in range from 00-F1h
 * Destination: FE00-FE9F
 */
exports.DMA = 0xff46;

/**
 * FF47 - BGP - BG Palette Data (R/W) - Non CGB Mode Only
 *
 * This register assigns gray shades to the color numbers of the BG and
 * Window tiles.
 *
 * Bit 7-6 - Shade for Color Number 3
 * Bit 5-4 - Shade for Color Number 2
 * Bit 3-2 - Shade for Color Number 1
 * Bit 1-0 - Shade for Color Number 0
 *
 * The four possible gray shades are:
 * 0  White
 * 1  Light gray
 * 2  Dark gray
 * 3  Black
 *
 * In CGB Mode the Color Palettes are taken from CGB Palette Memory instead.
 */
exports.BGP = 0xff47;

/**
 * FF48 - OBP0 - Object Palette 0 Data (R/W) - Non CGB Mode Only
 *
 * This register assigns gray shades for sprite palette 0. It works exactly as
 * BGP (FF47), except that the lower two bits aren't used because sprite data
 * 00 is transparent.
 */
exports.OBP0 = 0xff48;

/**
 * FF49 - OBP1 - Object Palette 1 Data (R/W) - Non CGB Mode Only
 *
 * This register assigns gray shades for sprite palette 1. It works exactly as
 * BGP (FF47), except that the lower two bits aren't used because sprite data
 * 00 is transparent.
 */
exports.OBP1 = 0xff49;

/**
 * FF4A - WY - Window Y Position (R/W)
 * FF4B - WX - Window X Position minus 7 (R/W)
 *
 * Specifies the upper/left positions of the Window area. (The window is an
 * alternate background area which can be displayed above of the normal
 * background. OBJs (sprites) may be still displayed above or behind the
 * window, just as for normal BG.)
 * The window becomes visible (if enabled) when positions are set in range
 * WX=0..166, WY=0..143. A postion of WX=7, WY=0 locates the window at upper
 * left, it is then completly covering normal background.
 */
exports.WY = 0xff4a;
exports.WX = 0xff4b;

/**
 * FFFF - IE - Interrupt Enable (R/W)
 *
 * Bit 0: V-Blank  Interrupt Enable  (INT 40h)  (1=Enable)
 * Bit 1: LCD STAT Interrupt Enable  (INT 48h)  (1=Enable)
 * Bit 2: Timer    Interrupt Enable  (INT 50h)  (1=Enable)
 * Bit 3: Serial   Interrupt Enable  (INT 58h)  (1=Enable)
 * Bit 4: Joypad   Interrupt Enable  (INT 60h)  (1=Enable)
 */
exports.IE = 0xffff;
