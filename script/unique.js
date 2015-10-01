#! /usr/local/bin/node

var _ = require('lodash');
var opcodes = require('../support/opcodes.json');


var parse = function (inst) {

    return _.chain(inst)
        .compact()
        .map(function (inst) {
            if (!inst.operands) return null;
            return JSON.stringify(inst.operands[1]);
        })
        .uniq()
        // .sortBy(function (s) { return s.charCodeAt(); })
        .value();
};

var unprefixed = parse(opcodes.unprefixed);
var cbprefixed = parse(opcodes.cbprefixed);

// console.log('unprefixed:', unprefixed);
// console.log('cbprefixed:', cbprefixed);
console.log('all:', _.merge(unprefixed, cbprefixed));
