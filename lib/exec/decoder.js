var debug = require('debug')('decoder');


// Docs
//
// - http://www.pastraiser.com/cpu/gameboy/gameboy_opcodes.html

var fetcher = function (cpu, operand) {

    debug('fetch operand %s', operand);

    var value;
    var next = cpu.pc + 1;

    switch (operand) {

        // 8-bit registers

        case 'A': case 'B': case 'C': case 'D': case 'E': case 'H': case 'L':

        // 16-bit registers

        case 'AF': case 'BC': case 'DE': case 'HL': case 'HL+': case 'HL-':
        case 'SP':
            value = cpu[operand.match(/(\w+)/)[0].toLowerCase()];
            break;

        // Flags

        case 'Z':  value = cpu.f & 0x80; break;
        case 'NZ': value = !(cpu.f & 0x80); break;
        case 'NC': value = !(cpu.f & 0x10); break;

        // Inmediate data

        case 'd8': value = cpu.mmu.readByte(next); break;
        case 'r8': value = cpu.pc + cpu.mmu.readByte(next); break;
        case 'a16': case 'd16': value = cpu.mmu.readWord(next); break;

        // SP + Offset
        //
        // SP+r8

        case 'SP+r8': value = cpu.sp + cpu.mmu.readByte(next); break;

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

        case '00H': case '08H': case '10H': case '18H': case '20H': case '28H':
        case '30H': case '38H':
            value = parseInt(operand.match(/(\d+)/)[0], 16);
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

var indirect = function (cpu, operand, pos) {

    var addr = fetcher(cpu, operand);

    return function (updated) {

        if (updated && pos == 1) {
            debug('cannot use read operand to write to memory. stop');
            process.exit(1);
        }

        // HLI, HLD

        switch (operand) {
            case 'HL+': cpu.hl++; break;
            case 'HL-': cpu.hl--; break;
        }

        // Write

        if (updated) switch (operand) {
            case 'a8': case 'C':
                return cpu.mmu.writeByte(addr, updated);
            case 'a16': case 'BC': case 'DE': case 'HL': case 'HL+': case 'HL-':
                return cpu.mmu.writeWord(addr, updated);
            default:
                debug('%s operand cannot be updated. stop', operand);
                process.exit(1);
        }

        // Read

        switch (operand) {
            case 'a8': case 'C':
                return cpu.mmu.readByte(addr);
            case 'a16': case 'BC': case 'DE': case 'HL': case 'HL+': case 'HL-':
                return cpu.mmu.readWord(addr);
            default:
                debug('%s operand cannot be updated. stop', operand);
                process.exit(1);
        }
    }
}
var decode = function (cpu, operands, pos) {

    if (!(operands && operands[pos])) return null;

    var operand = operands[pos];
    var resolve = operand.match(/\(([A-Za-z+-]+)\)/);

    return resolve ? indirect(cpu, resolve[1], pos) : fetcher(cpu, operand);
}

module.exports = decode;
