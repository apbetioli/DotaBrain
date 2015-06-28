var fs = require('fs');
var brain = require('brain');
var net = new brain.NeuralNetwork();

var mongojs = require('mongojs');
var db = mongojs('mongodb://localhost:27017/dota', ['matches', 'heroes']);

console.log('Start at: ' + time());

var heroesNames = {};

db.heroes.find(function (err, heroes) {

    for (var h in heroes)
        heroesNames[heroes[h].id] = heroes[h].localized_name;

    findMatches();
});

function findMatches() {
    db.matches.find().limit(5000, function (err, matches) {

        db.close();

        train(matches);

        console.log("Network trained!");
        console.log('Saving network...');

        fs.writeFile("data/network.json", JSON.stringify(net.toJSON()), function (err) {
            if (err)
                throw err;

            console.log('Done');
            console.log('End at: ' + time());
        });

    });
}

function train(matches, finishedTraining) {

    var trainingData = [];

    for (var m in matches) {
        var match = matches[m];

        if (match.players.length != 10) {
            console.log('Ignoring incomplete match ' + match.match_seq_num);
            continue;
        }

        var radiants = [];
        var dires = [];

        for (var i in match.players) {
            if (match.players[i].player_slot < 100) {
                radiants.push(heroesNames[match.players[i].hero_id]);
            } else {
                dires.push(heroesNames[match.players[i].hero_id]);
            }
        }

        var winners = match.radiant_win ? radiants : dires;
        var loosers = !match.radiant_win ? radiants : dires;

        winners.sort();
        loosers.sort();

        for (var x = 0; x < 5; x++) {

            var data = {
                input: {},
                output: {}
            };

            data.output[winners[x]] = 1;

            for (var y = 0; y < 5; y++)
                if (y != x)
                    data.input[winners[y]] = 1;

            for (var y = 0; y < 5; y++)
                data.input[loosers[y]] = -1;

            trainingData.push(data);
        }
    }

    if (trainingData.length == 0) {
        throw 'No data to train';
    }
    console.log("Training with " + trainingData.length + ' matches');

    net.train(trainingData, {
        log: true,
        iterations: 5000,
        learningRate: 0.5
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
};
