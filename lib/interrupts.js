'use strict';

/**
 * INT 40 - V-Blank Interrupt
 *
 * The V-Blank interrupt occurs ca. 59.7 times a second on a regular GB and ca.
 * 61.1 times a second on a Super GB (SGB). This interrupt occurs at the
 * beginning of the V-Blank period (LY=144).
 * During this period video hardware is not using video ram so it may be freely
 * accessed. This period lasts approximately 1.1 milliseconds.
 */
exports.INT_40 = 1;

/**
 * INT 48 - LCDC Status Interrupt
 *
 * There are various reasons for this interrupt to occur as described by the
 * STAT register ($FF40). One very popular reason is to indicate to the user
 * when the video hardware is about to redraw a given LCD line. This can be
 * useful for dynamically controlling the SCX/SCY registers ($FF43/$FF42) to
 * perform special video effects.
 */
exports.INT_48 = 1 << 1;

/**
 * INT 50 - Timer Interrupt
 *
 * Each time when the timer overflows (ie. when TIMA gets bigger than FFh), then
 * an interrupt is requested by setting Bit 2 in the IF Register (FF0F). When
 * that interrupt is enabled, then the CPU will execute it by calling the timer
 * interrupt vector at 0050h.
 */
exports.INT_50 = 1 << 2;

/**
 * INT 58 - Serial Interrupt
 *
 * When the transfer has completed (ie. after sending/receiving 8 bits, if any)
 * then an interrupt is requested by setting Bit 3 of the IF Register (FF0F).
 * When that interrupt is enabled, then the Serial Interrupt vector at 0058 is
 * called.
 */
exports.INT_58 = 1 << 3;

/**
 * INT 60 - Joypad Interrupt
 *
 * Joypad interrupt is requested when any of the above Input lines changes from
 * High to Low. Generally this should happen when a key becomes pressed
 * (provided that the button/direction key is enabled by above Bit4/5), however,
 * because of switch bounce, one or more High to Low transitions are usually
 * produced both when pressing or releasing a key.
 */
exports.INT_60 = 1 << 4;
