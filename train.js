var fs = require('fs');
var brain = require('brain');
var mongojs = require('mongojs');

var db = mongojs('mongodb://localhost:27017/dota', ['training']);
var net = new brain.NeuralNetwork();

console.log('Start at: ' + time());

trainStream = net.createTrainStream({
    floodCallback: flood,
    doneTrainingCallback: doneTraining,
    log:true,
    iterations: 5000,
    learningRate: 0.5
});

flood();

function flood() {
    db.training.find().forEach(function (err, data) {
	if(data)
		trainStream.write(data);
	else
		trainStream.write(null);

    });
}

function doneTraining(info) {
  console.log("Done!");
  console.log('End at: ' + time());

  fs.writeFile("data/network.json", JSON.stringify(net.toJSON()), function (err) {
    if (err)
	throw err;

    db.close();
  });
}

function time() {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    return hour + ":" + min + ":" + sec;
}
