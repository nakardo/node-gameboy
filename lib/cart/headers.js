'use strict';

/**
 * 0104-0133 - Nintendo Logo
 * These bytes define the bitmap of the Nintendo logo that is displayed when the
 * gameboy gets turned on. The hexdump of this bitmap is:
 *   CE ED 66 66 CC 0D 00 0B 03 73 00 83 00 0C 00 0D
 *   00 08 11 1F 88 89 00 0E DC CC 6E E6 DD DD D9 99
 *   BB BB 67 63 6E 0E EC CC DD DC 99 9F BB B9 33 3E
 * The gameboys boot procedure verifies the content of this bitmap (after it
 * has displayed it), and LOCKS ITSELF UP if these bytes are incorrect. A CGB
 * verifies only the first 18h bytes of the bitmap, but others (for example a
 * pocket gameboy) verify all 30h bytes.
 */
exports.NINTENDO_LOGO = [0x104, 0x133];

/**
 * 0134-0143 - Title
 * Title of the game in UPPER CASE ASCII. If it is less than 16 characters then
 * the remaining bytes are filled with 00's. When inventing the CGB, Nintendo
 * has reduced the length of this area to 15 characters, and some months later
 * they had the fantastic idea to reduce it to 11 characters only. The new
 * meaning of the ex-title bytes is described below.
 */
exports.TITLE = [0x134, 0x143];

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
exports.CART_TYPE = 0x147;

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
exports.ROM_SIZE = 0x148;

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
exports.RAM_SIZE = 0x149;
