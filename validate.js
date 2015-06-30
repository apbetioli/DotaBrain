var mongojs = require('mongojs');
var db = mongojs('mongodb://localhost:27017/dota', ['validating']);

var net = require('./net');

var ok = 0;
var nok = 0;

db.validating.find().forEach(function (err, data) {

    if (!data) {
        console.log('OK: ' + ok);
        console.log('NOK: ' + nok);
        db.close();
        return;
    }

    var output = net.run(data.input);

    var keys = Object.keys(output);
    var dataKeys = Object.keys(data.output);

    if (keys[0] === dataKeys[0]) {
        ok++;
    }
    else {
        //console.log('Expected <' + keys[0] + '> but was <' + dataKeys[0] + '>');
        nok++;
    }


});