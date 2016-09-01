'use strict';

const debug = require('debug')('timer');


/**
 * FF04 - DIV - Divider Register (R/W)
 *
 * This register is incremented at rate of 16384Hz (~16779Hz on SGB). Writing
 * any value to this register resets it to 00h.
 *
 * Note: The divider is affected by CGB double speed mode, and will increment
 * at 32768Hz in double speed.
 */
const DIV = 0xff04;

/**
 * FF05 - TIMA - Timer counter (R/W)
 *
 * This timer is incremented by a clock frequency specified by the TAC
 * register ($FF07). When the value overflows (gets bigger than FFh) then it
 * will be reset to the value specified in TMA (FF06), and an interrupt will be
 * requested, as described below.
 */
const TIMA = 0xff05;

/**
 * FF06 - TMA - Timer Modulo (R/W)
 *
 * When the TIMA overflows, this data will be loaded.
 */
const TMA = 0xff06;

/**
 * FF07 - TAC - Timer Control (R/W)
 *
 * Bit 2    - Timer Enable
 * Bits 1-0 - Input Clock Select
 *            00: CPU Clock / 1024 (DMG, CGB:   4096 Hz, SGB:   ~4194 Hz)
 *            01: CPU Clock / 16   (DMG, CGB: 262144 Hz, SGB: ~268400 Hz)
 *            10: CPU Clock / 64   (DMG, CGB:  65536 Hz, SGB:  ~67110 Hz)
 *            11: CPU Clock / 256  (DMG, CGB:  16384 Hz, SGB:  ~16780 Hz)
 *
 * Note: The "Timer Enable" bit only affects the timer, the divider is ALWAYS
 * counting.
 */
const TAC = 0xff07;

class Timer {
    constructor () {

    }

    step () {
        debug('step');
    }
}

// // FF04 - DIV - Divider Register (R/W)
//
// if (this.t > MAX_DIVIDER) {
//     this._mmu.writeByte(0xff04, this._mmu.readByte(0xff04) + 1);
// }
//
// // FF07 - TAC - Timer Control (R/W)
// // FF05 - TIMA - Timer counter (R/W)
//
// const tac = this._mmu.readByte(0xff07);
// if (tac & 2) {
//     let tima = this._mmu.readByte(0xff05);
//     if (
//         (tac == 0 && this.t > MAX_CYCLES / 1024) ||
//         (tac == 1 && this.t > MAX_CYCLES / 16) ||
//         (tac == 2 && this.t > MAX_CYCLES / 64) ||
//         (tac == 3 && this.t > MAX_CYCLES / 256)
//     ) {
//         const tma = this._mmu.readByte(0xff06);
//         this._mmu.writeByte(0xff05, ++tima == 0 ? tma : tima);
//     }
// }
//
// if (this.t > MAX_CYCLES) {
//     console.log(new Date());
//     this.t = 0;
// }

module.exports = Timer;
