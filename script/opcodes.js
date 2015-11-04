#! /usr/local/bin/node

var fs = require('fs')
  , request = require('request')
  , cheerio = require('cheerio');

var URL = 'http://www.pastraiser.com/cpu/gameboy/gameboy_opcodes.html'
  , FILE_OUT = './support/opcodes.json';


var parseElement = function (_, elem) {

    if (elem.length !== 3) return null;

    var l1 = elem.get(0).data.split(' ')
      , l2 = elem.get(1).data.match(/^(\w+)\s*([0-9\/]+)$/) || []
      , op = {};

    op.mnemonic = l1[0];
    if (l1.length > 1) {
        op.operands = l1[1].split(',');
    }
    if (l2.length > 1) {
        op.bytes = parseInt(l2[1], 10);

        // Note
        // opcodes with conditional duration (e.g. CALL C,a16 3 12/24)
        // will keep first value.

        op.cycles = parseInt(l2[2], 10);
    }
    op.flags_znhc = elem.get(2).data.split(' ');

    return op;
};

var parseTable = function ($, selector) {

    var opcodes = [];

    $('tr:nth-of-type(n+2)', selector)
        .map(function (i, elem) {
            return $('td:nth-of-type(n+2)', elem).get();
        })
        .map(function (i, elem) {
            return $(elem).contents().filter(function () {
                return this.type == 'text';
            });
        })
        .map(function (i, elem) {
            opcodes.push(parseElement(i, elem));
        });

    return opcodes;
};

// - http://www.pastraiser.com/cpu/gameboy/gameboy_opcodes.html
// - https://github.com/NewbiZ/gbemu/tree/master/scripts

request(URL, function (err, response, body) {

    var $ = cheerio.load(body);

    var opcodes = {
        unprefixed: parseTable($, 'body > table:nth-of-type(1)'),
        cbprefixed: parseTable($, 'body > table:nth-of-type(2)')
    };

    fs.writeFile(FILE_OUT, JSON.stringify(opcodes, null, 4), function (err) {
        if (err) { console.log(err); process.exit(1); }
        process.exit();
    });
});
