var _ = require('lodash');
var opcodes = require('../support/opcodes.json');


var parse = function (inst) {

    return _.chain(inst)
        .compact()
        .uniq('mnemonic')
        .map(function (inst) { return inst.mnemonic; })
        .sortBy(function (s) { return s.charCodeAt(); })
        .value()
        .toString();
};

console.log('unprefixed:', parse(opcodes.unprefixed));
console.log('cbprefixed:', parse(opcodes.cbprefixed));
