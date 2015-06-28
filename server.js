var express = require('express');
var app = express();
var net = require('./net');
var _ = require("underscore")._;

app.set('port', (process.env.PORT || 5000));

app.get('/', function (req, res) {
	
	var input = parseInput(req, res);

	console.log('Input:' + JSON.stringify(input, null, 4));

	var output = net.run(input);
	var result = filter(input, output);

	console.log('Output:' + JSON.stringify(result, null, 4));

	res.json(result);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function parseInput(req, res) {
	if(req.query.enemy == null || req.query.enemy.trim().length == 0) {
		res.send('Please send "enemy" and "ally" params.<br>Ex: ally=Luna,Omniknight,Sven,Wraith King&enemy=Phantom Lancer,Slark,Pugna,Jakiro,Windranger');
		return;
	}
	
	var input = {};
	
	var allies = req.query.ally != null ? req.query.ally.split(',') : []; 
	var enemies = req.query.enemy.split(',');

	allies.sort();
	enemies.sort();

	for(var i in allies)
		input[allies[i].trim()] = 1;
	
	for(var i in enemies)
		input[enemies[i].trim()] = -1;

	return input;
}

function filter(input, output) {

	var result = [];

	var inputs = Object.keys(input);
	var keys = Object.keys(output);
	for(var i in keys) {
		if(! _.contains(inputs, keys[i]))
			result.push({name:keys[i], value:output[keys[i]]});
	}
	
	result.sort(function(a, b){
		return b.value - a.value;
	});

	return result.length < 10 ? result : result.slice(0, 10);
}
