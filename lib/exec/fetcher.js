'use strict';

var assert = require('assert');
var debug = require('debug')('fetcher');


// Docs
//
// - http://www.pastraiser.com/cpu/gameboy/gameboy_opcodes.html

var immediate = function (cpu, pc, operand) {

    assert(arguments.length > 2, 'Immediate operand cannot be assigned');

    debug('fetch operand %s', operand.toUpperCase());

    var r8;
    var value;

    var next = pc + 1;

    switch (operand) {

        // 8-bit registers

        case 'a': case 'b': case 'c': case 'd': case 'e': case 'h': case 'l':

        // 16-bit registers

        case 'af': case 'bc': case 'de': case 'hl': case 'hl+': case 'hl-':
        case 'sp':
            value = cpu[operand.match(/\w+/)[0]];
            break;

        // Flags

        case 'z':  value = cpu.f >> 7; break;
        case 'nz': value = cpu.f >> 7 ? 0 : 1; break;
        case 'nc': value = cpu.f >> 4 & 1 ? 0 : 1; break;

        // Immediate data

        case 'd8': value = cpu.mmu.readByte(next); break;
        case 'r8':
            r8 = cpu.mmu.readByte(next);
            if (r8 > 127) value = -((~r8 + 1) & 0xFF);
            else value = r8;
            break;
        case 'a8': value = 0xFF00 + cpu.mmu.readByte(next); break;
        case 'a16': case 'd16': value = cpu.mmu.readWord(next); break;

        // SP + Offset
        //
        // SP+r8

        case 'sp+r8':
            r8 = cpu.mmu.readByte(next);
            if (r8 > 127) value = cpu.sp + -((~r8 + 1) & 0xFF);
            else value = cpu.sp + r8;
            break;

        // Integer values
        //
        // 0, 1, 2, 3, 4, 5, 6, 7

        case '0': case '1': case '2': case '3': case '4': case '5': case '6':
        case '7':
            value = parseInt(operand, 10);
            break;

        // Hex values
        //
        // 00H, 08H, 10H, 18H, 20H, 28H, 30H, 38H

        case '00h': case '08h': case '10h': case '18h': case '20h': case '28h':
        case '30h': case '38h':
            value = parseInt(operand.match(/\d+/)[0], 16);
            break;

        default:
            debug('%s operand is unknown. stop', operand);
            process.exit(1);
    }

    if (value === undefined) {
        debug('%s operand is \'undefined\'. stop', operand);
        process.exit(1);
    }

    return value;
}

var indirect = function (cpu, pc, operand, pos) {

    var reference = immediate(cpu, pc, operand);

    return function (source) {

        if (source !== undefined && pos == 1) {
            debug('cannot use read operand to write to memory. stop');
            process.exit(1);
        }

        // HLI, HLD

        switch (operand) {
            case 'hl+': cpu.hl++; break;
            case 'hl-': cpu.hl--; break;
        }

        // Write

        if (source !== undefined) {
            if (source.operand === 'sp') {
                return cpu.mmu.writeWord(reference, source());
            }

            switch (operand) {
                case 'c': case 'a8':
                    return cpu.mmu.writeByte(0xFF00 + reference, source());
                default:
                    return cpu.mmu.writeByte(reference, source());
            }
        }

        // Read

        switch (operand) {
            case 'c': case 'a8': return cpu.mmu.readByte(0xFF00 + reference);
            case 'a16': return cpu.mmu.readWord(reference);
            default: return reference;
        }
    }
}

var fetch = function (cpu, operands, pos) {

    if (!(operands && operands[pos])) return null;

    // Indirect operand

    var isIndirect = /\(.+\)/.test(operands[pos]);

    // Wrap operand fetching

    var operand = operands[pos].match(/[\w\d+-]+/)[0].toLowerCase();

    var fetch = isIndirect
        ? indirect(cpu, cpu.pc, operand, pos)
        : immediate.bind(this, cpu, cpu.pc, operand);

    fetch.operand = operand.match(/[\w\d]+/)[0]; // strip HL+, HL-
    fetch.indirect = isIndirect;

    return fetch;
}

module.exports = fetch;
