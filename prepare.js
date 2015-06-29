var mongojs = require('mongojs');
var db = mongojs('mongodb://localhost:27017/dota', ['matches', 'heroes', 'training']);

var heroesNames = {};

db.heroes.find(function (err, heroes) {

	for (var h in heroes)
		heroesNames[heroes[h].id] = heroes[h].localized_name;

	findMatches();
});

function findMatches() {
	db.matches.find().forEach(function (err, match) {
		if(!match) {
		    return;
		}

		db.training.remove({match_id: match.match_id}, function(err, ok) {

			var trainingData = generateTrainingData(match);

			for(z in trainingData) {
				var trainMatch = trainingData[z];
				trainMatch.match_id = match.match_id;

				db.training.insert(trainMatch,  function (err, result) {
					if (err) {
					    console.log(err);
					    throw err;
					}

					console.log('Inserted ' + match.match_id + '[' + z + ']');
			    	});
			}


		});

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


