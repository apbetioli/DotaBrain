var mongojs = require('mongojs');
var db = mongojs('mongodb://localhost:27017/dota', ['matches', 'heroes', 'training', 'validating']);

var heroesNames = {};
var heroesIndex = {};
var size = 10;

db.heroes.find().sort({localized_name: 1}, function (err, heroes) {

    var i = 0;
    for (var h in heroes) {
        heroesNames[heroes[h].id] = heroes[h].localized_name;
        heroesIndex[heroes[h].localized_name] = i++;
    }

    console.log(JSON.stringify(heroesIndex));

    prepareMatches(size, 0, db.training);
    //prepareMatches(size / 10, size, db.validating);

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
        if (match.players[i].hero_id == 0) {
            console.log('Invalid hero from match: ' + match.match_id);
            return trainingData;
        }

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
            input: [],
            output: []
        };

        for (var i = 0; i < 110; i++) {
            data.input.push(0);
            data.output.push(0);
        }

        var index = heroesIndex[winners[x]];
        data.output[index] = 1;

        for (var y = 0; y < 5; y++) {
            if (x != y) {
                var index = heroesIndex[winners[y]];
                data.input[index] = 1;
            }
        }

        for (var y = 0; y < 5; y++) {
            var index = heroesIndex[loosers[y]];
            data.input[index] = -1;
        }

        trainingData.push(data);
    }

    return trainingData;
}


