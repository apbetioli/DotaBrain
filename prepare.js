var mongojs = require('mongojs');
var db = mongojs('mongodb://localhost:27017/dota', ['matches', 'heroes', 'training', 'validating']);

var heroesNames = {};

db.heroes.find(function (err, heroes) {

    for (var h in heroes)
        heroesNames[heroes[h].id] = heroes[h].localized_name;

    prepareMatches(5000, 0, db.training);
    prepareMatches(200, 5000,  db.validating);

});

function prepareMatches(limit, skip, collection) {
    db.matches.find().limit(limit).skip(skip).forEach(function (err, match) {
        if (err) throw err;
        if (!match) return;
        add(match, collection);
    });
}

function add(match, collection) {
    collection.remove({match_id: match.match_id}, function (err, ok) {
        if (err) throw err;

        var trainingData = generateTrainingData(match);

        for (var z in trainingData) {
            var trainMatch = trainingData[z];
            trainMatch.match_id = match.match_id;

            collection.insert(trainMatch, function (err, result) {
                if (err) throw err;

                console.log('Inserted ' + result.match_id + '[' + z + ']');
            });
        }
    });
}

function generateTrainingData(match) {
    var trainingData = [];

    if (match.players.length != 10) {
        console.log('Invalid match: ' + match.match_id);
        return trainingData;
    }

    console.log('Generating training data for: ' + match.match_id);

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

    return trainingData;
}


