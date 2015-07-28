var fs = require('fs');
var brain = require('brain');
var mongojs = require('mongojs');

var db = mongojs('mongodb://localhost:27017/dota', ['training']);
var net = new brain.NeuralNetwork({
    momentum : 0.8
});

var initialTime =  new Date();

trainStream = net.createTrainStream({
    floodCallback: flood,
    doneTrainingCallback: doneTraining,
    log: true,
    learningRate: 0.3
});

flood();

function flood() {
    fs.writeFile("data/network.json", JSON.stringify(net.toJSON()), function (err) {
        if (err) throw err;
    });

    db.training.find().forEach(function (err, data) {
        if (err) throw err;

        if (data)
            trainStream.write(data);
        else
            trainStream.write(null);
    });
}

function doneTraining(info) {
    console.log("Done!");
    console.log('Started: ' + time(initialTime));
    console.log('Ended: ' + time(new Date()));

    db.close();
}

function time(date) {
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    return hour + ":" + min + ":" + sec;
}
