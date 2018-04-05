'use strict';

/**
 * FF00 - JOYP - Joypad (R/W)
 *
 * The eight gameboy buttons/direction keys are arranged in form of a 2x4
 * matrix. Select either button or direction keys by writing to this
 * register, then read-out bit 0-3.
 *
 *   Bit 7 - Not used
 *   Bit 6 - Not used
 *   Bit 5 - P15 Select Button Keys      (0=Select)
 *   Bit 4 - P14 Select Direction Keys   (0=Select)
 *   Bit 3 - P13 Input Down  or Start    (0=Pressed) (Read Only)
 *   Bit 2 - P12 Input Up    or Select   (0=Pressed) (Read Only)
 *   Bit 1 - P11 Input Left  or Button B (0=Pressed) (Read Only)
 *   Bit 0 - P10 Input Right or Button A (0=Pressed) (Read Only)
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
 *   Bit 2    - Timer Enable
 *   Bits 1-0 - Input Clock Select
 *        00: CPU Clock / 1024 (DMG, CGB:   4096 Hz, SGB:   ~4194 Hz)
 *        01: CPU Clock / 16   (DMG, CGB: 262144 Hz, SGB: ~268400 Hz)
 *        10: CPU Clock / 64   (DMG, CGB:  65536 Hz, SGB:  ~67110 Hz)
 *        11: CPU Clock / 256  (DMG, CGB:  16384 Hz, SGB:  ~16780 Hz)
 *
 * Note: The "Timer Enable" bit only affects the timer, the divider is
 * ALWAYS counting.
 */
exports.TAC = 0xff07;

/**
 * FF0F - IF - Interrupt Flag (R/W)
 *
 *   Bit 0: V-Blank  Interrupt Request (INT 40h)  (1=Request)
 *   Bit 1: LCD STAT Interrupt Request (INT 48h)  (1=Request)
 *   Bit 2: Timer    Interrupt Request (INT 50h)  (1=Request)
 *   Bit 3: Serial   Interrupt Request (INT 58h)  (1=Request)
 *   Bit 4: Joypad   Interrupt Request (INT 60h)  (1=Request)
 */
exports.IF = 0xff0f;

/**
 * FF40 - LCDC - LCD Control (R/W)
 *
 *   Bit 7 - LCD Display Enable             (0=Off, 1=On)
 *   Bit 6 - Window Tile Map Display Select (0=9800-9BFF, 1=9C00-9FFF)
 *   Bit 5 - Window Display Enable          (0=Off, 1=On)
 *   Bit 4 - BG & Window Tile Data Select   (0=8800-97FF, 1=8000-8FFF)
 *   Bit 3 - BG Tile Map Display Select     (0=9800-9BFF, 1=9C00-9FFF)
 *   Bit 2 - OBJ (Sprite) Size              (0=8x8, 1=8x16)
 *   Bit 1 - OBJ (Sprite) Display Enable    (0=Off, 1=On)
 *   Bit 0 - BG Display (for CGB see below) (0=Off, 1=On)
 */
exports.LCDC = 0xff40;

/**
 * FF41 - STAT - LCDC Status (R/W)
 *
 *   Bit 6 - LYC=LY Coincidence Interrupt (1=Enable) (Read/Write)
 *   Bit 5 - Mode 2 OAM Interrupt         (1=Enable) (Read/Write)
 *   Bit 4 - Mode 1 V-Blank Interrupt     (1=Enable) (Read/Write)
 *   Bit 3 - Mode 0 H-Blank Interrupt     (1=Enable) (Read/Write)
 *   Bit 2 - Coincidence Flag  (0:LYC<>LY, 1:LYC=LY) (Read Only)
 *   Bit 1-0 - Mode Flag       (Mode 0-3, see below) (Read Only)
 *             0: During H-Blank
 *             1: During V-Blank
 *             2: During Searching OAM-RAM
 *             3: During Transfering Data to LCD Driver
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
 *   Source:      XX00-XX9F   ;XX in range from 00-F1h
 *   Destination: FE00-FE9F
 *
 * It takes 160 microseconds until the transfer has completed (80 microseconds
 * in CGB Double Speed Mode), during this time the CPU can access only HRAM
 * (memory at FF80-FFFE). For this reason, the programmer must copy a short
 * procedure into HRAM, and use this procedure to start the transfer from
 * inside HRAM, and wait until the transfer has finished:
 *
 *     ld  (0FF46h),a ;start DMA transfer, a=start address/100h
 *     ld  a,28h      ;delay...
 *    wait:           ;total 5x40 cycles, approx 200ms
 *     dec a          ;1 cycle
 *     jr  nz,wait    ;4 cycles
 *
 * Most programs are executing this procedure from inside of their VBlank
 * procedure, but it is possible to execute it during display redraw also,
 * allowing to display more than 40 sprites on the screen (ie. for example 40
 * sprites in upper half, and other 40 sprites in lower half of the screen).
 */
exports.DMA = 0xff46;

/**
 * FF47 - BGP - BG Palette Data (R/W) - Non CGB Mode Only
 *
 * This register assigns gray shades to the color numbers of the BG and
 * Window tiles.
 *
 *   Bit 7-6 - Shade for Color Number 3
 *   Bit 5-4 - Shade for Color Number 2
 *   Bit 3-2 - Shade for Color Number 1
 *   Bit 1-0 - Shade for Color Number 0
 *
 * The four possible gray shades are:
 *
 *   0  White
 *   1  Light gray
 *   2  Dark gray
 *   3  Black
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
 * FF4D - KEY1 - CGB Mode Only - Prepare Speed Switch
 *
 *   Bit 7: Current Speed     (0=Normal, 1=Double) (Read Only)
 *   Bit 0: Prepare Speed Switch (0=No, 1=Prepare) (Read/Write)
 *
 * This register is used to prepare the gameboy to switch between CGB Double
 * Speed Mode and Normal Speed Mode. The actual speed switch is performed by
 * executing a STOP command after Bit 0 has been set. After that Bit 0 will be
 * cleared automatically, and the gameboy will operate at the 'other' speed.
 * The recommended speed switching procedure in pseudo code would be:
 *
 *   IF KEY1_BIT7 <> DESIRED_SPEED THEN
 *     IE=00H       ;(FFFF)=00h
 *     JOYP=30H     ;(FF00)=30h
 *     KEY1=01H     ;(FF4D)=01h
 *     STOP         ;STOP
 *   ENDIF
 *
 * The CGB is operating in Normal Speed Mode when it is turned on. Note that
 * using the Double Speed Mode increases the power consumption, it would be
 * recommended to use Single Speed whenever possible. However, the display will
 * flicker (white) for a moment during speed switches, so this cannot be done
 * permanentely.
 *
 * In Double Speed Mode the following will operate twice as fast as normal:
 *   The CPU (2.10 MHz, 1 Cycle = approx. 0.5us)
 *   Timer and Divider Registers
 *   Serial Port (Link Cable)
 *   DMA Transfer to OAM
 *
 * And the following will keep operating as usual:
 *   LCD Video Controller
 *   HDMA Transfer to VRAM
 *   All Sound Timings and Frequencies
 */
exports.KEY1 = 0xff4d;

/**
 * FF4F - VBK - CGB Mode Only - VRAM Bank
 *
 * This 1bit register selects the current Video Memory (VRAM) Bank.
 *
 *    Bit 0 - VRAM Bank (0-1)
 *
 * Bank 0 contains 192 Tiles, and two background maps, just as for monochrome
 * games. Bank 1 contains another 192 Tiles, and color attribute maps for the
 * background maps in bank 0.
 */
exports.VBK = 0xff4f;

/**
 * FF51 - HDMA1 - CGB Mode Only - New DMA Source, High
 * FF52 - HDMA2 - CGB Mode Only - New DMA Source, Low
 * FF53 - HDMA3 - CGB Mode Only - New DMA Destination, High
 * FF54 - HDMA4 - CGB Mode Only - New DMA Destination, Low
 * FF55 - HDMA5 - CGB Mode Only - New DMA Length/Mode/Start
 *
 * These registers are used to initiate a DMA transfer from ROM or RAM to VRAM.
 * The Source Start Address may be located at 0000-7FF0 or A000-DFF0, the lower
 * four bits of the address are ignored (treated as zero). The Destination
 * Start Address may be located at 8000-9FF0, the lower four bits of the
 * address are ignored (treated as zero), the upper 3 bits are ignored either
 * (destination is always in VRAM).
 *
 * Writing to FF55 starts the transfer, the lower 7 bits of FF55 specify the
 * Transfer Length (divided by 10h, minus 1). Ie. lengths of 10h-800h bytes can
 * be defined by the values 00h-7Fh. And the upper bit of FF55 indicates the
 *
 * Transfer Mode:
 *
 * Bit7=0 - General Purpose DMA
 * When using this transfer method, all data is transferred at once. The
 * execution of the program is halted until the transfer has completed. Note
 * that the General Purpose DMA blindly attempts to copy the data, even if the
 * LCD controller is currently accessing VRAM. So General Purpose DMA should be
 * used only if the Display is disabled, or during V-Blank, or (for rather
 * short blocks) during H-Blank.
 * The execution of the program continues when the transfer has been completed,
 * and FF55 then contains a value if FFh.
 *
 * Bit7=1 - H-Blank DMA
 * The H-Blank DMA transfers 10h bytes of data during each H-Blank, ie. at
 * LY=0-143, no data is transferred during V-Blank (LY=144-153), but the
 * transfer will then continue at LY=00. The execution of the program is halted
 * during the separate transfers, but the program execution continues during
 * the 'spaces' between each data block.
 * Note that the program may not change the Destination VRAM bank (FF4F), or
 * the Source ROM/RAM bank (in case data is transferred from bankable memory)
 * until the transfer has completed!
 * Reading from Register FF55 returns the remaining length (divided by 10h,
 * minus 1), a value of 0FFh indicates that the transfer has completed. It is
 * also possible to terminate an active H-Blank transfer by writing zero to Bit
 * 7 of FF55. In that case reading from FF55 may return any value for the lower
 * 7 bits, but Bit 7 will be read as "1".
 *
 * Confirming if the DMA Transfer is Active
 *
 * Reading Bit 7 of FF55 can be used to confirm if the DMA transfer is active
 * (1=Not Active, 0=Active). This works under any circumstances - after
 * completion of General Purpose, or H-Blank Transfer, and after manually
 * terminating a H-Blank Transfer.
 *
 * Transfer Timings
 *
 * In both Normal Speed and Double Speed Mode it takes about 8us to transfer a
 * block of 10h bytes. That are 8 cycles in Normal Speed Mode, and 16 'fast'
 * cycles in Double Speed Mode.
 * Older MBC controllers (like MBC1-4) and slower ROMs are not guaranteed to
 * support General Purpose or H-Blank DMA, that's because there are always 2
 * bytes transferred per microsecond (even if the itself program runs it Normal
 * Speed Mode).
 */
exports.HDMA1 = 0xff51;
exports.HDMA2 = 0xff52;
exports.HDMA3 = 0xff53;
exports.HDMA4 = 0xff54;
exports.HDMA5 = 0xff55;

/**
 * FF56 - RP - CGB Mode Only - Infrared Communications Port
 *
 * This register allows to input and output data through the CGBs built-in
 * Infrared Port. When reading data, bit 6 and 7 must be set (and obviously Bit
 * 0 must be cleared - if you don't want to receive your own gameboys IR
 * signal).
 * After sending or receiving data you should reset the register to 00h to
 * reduce battery power consumption again.
 *
 *   Bit 0:   Write Data   (0=LED Off, 1=LED On)             (Read/Write)
 *   Bit 1:   Read Data    (0=Receiving IR Signal, 1=Normal) (Read Only)
 *   Bit 6-7: Data Read Enable (0=Disable, 3=Enable)         (Read/Write)
 *
 * Note that the receiver will adapt itself to the normal level of IR pollution
 * in the air, so if you would send a LED ON signal for a longer period, then
 * the receiver would treat that as normal (=OFF) after a while. For example, a
 * Philips TV Remote Control sends a series of 32 LED ON/OFF pulses (length
 * 10us ON, 17.5us OFF each) instead of a permanent 880us LED ON signal.
 * Even though being generally CGB compatible, the GBA does not include an
 * infra-red port.
 */
exports.RP = 0xff56;

/**
 * FF68 - BCPS/BGPI - CGB Mode Only - Background Palette Index
 *
 * This register is used to address a byte in the CGBs Background Palette
 * Memory. Each two byte in that memory define a color value. The first 8 bytes
 * define Color 0-3 of Palette 0 (BGP0), and so on for BGP1-7.
 *
 *    Bit 0-5   Index (00-3F)
 *    Bit 7     Auto Increment  (0=Disabled, 1=Increment after Writing)
 *
 * Data can be read/written to/from the specified index address through
 * Register FF69. When the Auto Increment Bit is set then the index is
 * automatically incremented after each <write> to FF69. Auto Increment has no
 * effect when <reading> from FF69, so the index must be manually incremented
 * in that case.
 */
exports.BGPI = 0xff68;

/**
 * FF69 - BCPD/BGPD - CGB Mode Only - Background Palette Data
 *
 * This register allows to read/write data to the CGBs Background Palette
 * Memory, addressed through Register FF68.
 *
 * Each color is defined by two bytes (Bit 0-7 in first byte).
 *
 *    Bit 0-4   Red Intensity   (00-1F)
 *    Bit 5-9   Green Intensity (00-1F)
 *    Bit 10-14 Blue Intensity  (00-1F)
 *
 * Much like VRAM, Data in Palette Memory cannot be read/written during the
 * time when the LCD Controller is reading from it. (That is when the STAT
 * register indicates Mode 3).
 *
 * Note: Initially all background colors are initialized as white.
 */
exports.BGPD = 0xff69;

/**
 * FF6A - OCPS/OBPI - CGB Mode Only - Sprite Palette Index
 * FF6B - OCPD/OBPD - CGB Mode Only - Sprite Palette Data
 *
 * These registers are used to initialize the Sprite Palettes OBP0-7,
 * identically as described above for Background Palettes. Note that four
 * colors may be defined for each OBP Palettes - but only Color 1-3 of each
 * Sprite Palette can be displayed, Color 0 is always transparent, and can be
 * initialized to a don't care value.
 *
 * Note: Initially all sprite colors are uninitialized.
 */
exports.OBPI = 0xff6a;
exports.OBPD = 0xff6b;

/**
 * FF6C - Undocumented (FEh) - Bit 0   (Read/Write) - CGB Mode Only
 * FF72 - Undocumented (00h) - Bit 0-7 (Read/Write)
 * FF73 - Undocumented (00h) - Bit 0-7 (Read/Write)
 * FF74 - Undocumented (00h) - Bit 0-7 (Read/Write) - CGB Mode Only
 * FF75 - Undocumented (8Fh) - Bit 4-6 (Read/Write)
 * FF76 - Undocumented (00h) - Always 00h (Read Only)
 * FF77 - Undocumented (00h) - Always 00h (Read Only)
 *
 * These are undocumented CGB Registers. The numbers in brackets () indicate
 * the initial values. Purpose of these registers is unknown (if any).
 * Registers FF6C and FF74 are always FFh if the CGB is in Non CGB Mode.
 */

/**
 * FF70 - SVBK - CGB Mode Only - WRAM Bank
 *
 * In CGB Mode 32 KBytes internal RAM are available. This memory is divided
 * into 8 banks of 4 KBytes each. Bank 0 is always available in memory at
 * C000-CFFF,
 * Bank 1-7 can be selected into the address space at D000-DFFF.
 *
 *   Bit 0-2  Select WRAM Bank (Read/Write)
 *
 * Writing a value of 01h-07h will select Bank 1-7, writing a value of 00h will
 * select Bank 1 either.
 */
exports.SVBK = 0xff70;

/**
 * FFFF - IE - Interrupt Enable (R/W)
 *
 *   Bit 0: V-Blank  Interrupt Enable  (INT 40h)  (1=Enable)
 *   Bit 1: LCD STAT Interrupt Enable  (INT 48h)  (1=Enable)
 *   Bit 2: Timer    Interrupt Enable  (INT 50h)  (1=Enable)
 *   Bit 3: Serial   Interrupt Enable  (INT 58h)  (1=Enable)
 *   Bit 4: Joypad   Interrupt Enable  (INT 60h)  (1=Enable)
 */
exports.IE = 0xffff;
