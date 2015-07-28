var mongojs = require('mongojs');
var db = mongojs('mongodb://localhost:27017/dota', ['validating', 'training']);

var net = require('./net');
net.load();

var ok = 0;
var nok = 0;

db.training.find().limit(100).forEach(function (err, data) {

    if (!data) {
        console.log('OK: ' + ok);
        console.log('NOK: ' + nok);
        db.close();
        return;
    }

    nok++;

    var output = net.run(data.input);
    var dataKeys = Object.keys(data.output);

    for (var i in output) {
        for (var j in dataKeys) {
            if (output[i].name == dataKeys[j]) {
                ok++;
                nok--;
                break;
            }
        }
    }

});