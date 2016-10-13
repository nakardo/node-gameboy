'use strict';

/**
 * Tests:
 *
 * Passed
 * - 03-op sp,hl.gb
 * - 04-op r,imm.gb
 * - 05-op rp.gb
 * - 06-ld r,r.gb
 * - 10-bit ops.gb
 * - 11-op a,(hl).gb
 *
 * Failed
 * - 01-special.gb
 * - 02-interrupts.gb
 * - 08-misc instrs.gb
 * - 07-jr,jp,call,ret,rst.gb
 * - 09-op r,r.gb
 */

const fs = require('fs');
const cart = fs.readFileSync('./roms/01-special.gb');
const bios = fs.readFileSync('./support/bios.bin');
const Gameboy = require('../');


const gameboy = new Gameboy();
gameboy.loadCart(cart);
gameboy.powerOn();

// let i = 0;
// gameboy.gpu.on('frame', (canvas) => {
//     if (++i % 60) return;
//     fs.writeFile(`./screenshot/${i / 60}.png`, canvas.toBuffer());
// });
