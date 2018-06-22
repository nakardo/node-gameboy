'use strict';

/**
 * 0147 - Cartridge Type
 *
 * Specifies which Memory Bank Controller (if any) is used in the cartridge,
 * and if further external hardware exists in the cartridge.
 *
 * 00h  ROM ONLY                 13h  MBC3+RAM+BATTERY
 * 01h  MBC1                     15h  MBC4
 * 02h  MBC1+RAM                 16h  MBC4+RAM
 * 03h  MBC1+RAM+BATTERY         17h  MBC4+RAM+BATTERY
 * 05h  MBC2                     19h  MBC5
 * 06h  MBC2+BATTERY             1Ah  MBC5+RAM
 * 08h  ROM+RAM                  1Bh  MBC5+RAM+BATTERY
 * 09h  ROM+RAM+BATTERY          1Ch  MBC5+RUMBLE
 * 0Bh  MMM01                    1Dh  MBC5+RUMBLE+RAM
 * 0Ch  MMM01+RAM                1Eh  MBC5+RUMBLE+RAM+BATTERY
 * 0Dh  MMM01+RAM+BATTERY        FCh  POCKET CAMERA
 * 0Fh  MBC3+TIMER+BATTERY       FDh  BANDAI TAMA5
 * 10h  MBC3+TIMER+RAM+BATTERY   FEh  HuC3
 * 11h  MBC3                     FFh  HuC1+RAM+BATTERY
 * 12h  MBC3+RAM
 */

const CART_TYPE = exports.CART_TYPE = [];

CART_TYPE[0] = 'ROM ONLY';
CART_TYPE[1] = 'MBC1';
CART_TYPE[2] = 'MBC1+RAM';
CART_TYPE[3] = 'MBC1+RAM+BATTERY';

/**
 * 0148 - ROM Size
 *
 * Specifies the ROM Size of the cartridge. Typically calculated as
 * "32KB shl N".
 *
 * 00h -  32KByte (no ROM banking)
 * 01h -  64KByte (4 banks)
 * 02h - 128KByte (8 banks)
 * 03h - 256KByte (16 banks)
 * 04h - 512KByte (32 banks)
 * 05h -   1MByte (64 banks)  - only 63 banks used by MBC1
 * 06h -   2MByte (128 banks) - only 125 banks used by MBC1
 * 07h -   4MByte (256 banks)
 * 52h - 1.1MByte (72 banks)
 * 53h - 1.2MByte (80 banks)
 * 54h - 1.5MByte (96 banks)
 */

const ROM_SIZE = exports.ROM_SIZE = [];

ROM_SIZE[0]    = 2;
ROM_SIZE[1]    = 4;
ROM_SIZE[2]    = 8;
ROM_SIZE[3]    = 16;
ROM_SIZE[4]    = 32;
ROM_SIZE[5]    = 64;
ROM_SIZE[6]    = 128;
ROM_SIZE[7]    = 256;
ROM_SIZE[0x52] = 72;
ROM_SIZE[0x53] = 80;
ROM_SIZE[0x54] = 96;

/**
 * 0149 - RAM Size
 *
 * Specifies the size of the external RAM in the cartridge (if any).
 *
 * 00h - None
 * 01h - 2 KBytes
 * 02h - 8 Kbytes
 * 03h - 32 KBytes (4 banks of 8KBytes each)
 * 04h - 128 KBytes (16 banks of 8KBytes each)
 * 05h - 64 KBytes (8 banks of 8KBytes each)
 *
 * When using a MBC2 chip 00h must be specified in this entry, even though the
 * MBC2 includes a built-in RAM of 512 x 4 bits
 */

const RAM_SIZE = exports.RAM_SIZE = [];

RAM_SIZE[0] = 0;
RAM_SIZE[1] = 1;
RAM_SIZE[2] = 1;
RAM_SIZE[3] = 4;
RAM_SIZE[4] = 16;
RAM_SIZE[5] = 8;
