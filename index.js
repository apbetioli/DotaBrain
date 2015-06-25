var express = require('express');
var app = express();
var nn = require('./neuralnetwork');
var _ = require("underscore")._;

app.get('/', function (req, res) {
	
	var input = parseInput(req);
	
	var output = nn.run(input);
		
	res.json(filter(input, output));
});

var server = app.listen(3000, function () {

  var port = server.address().port;

  console.log('Listening at port: %s', port);
});

function parseInput(req) {
	if(req.query.enemy == null || req.query.enemy.trim().length == 0) {
		res.send('Please send "enemy" and "ally" params.<br>Ex: ally=Luna,Omniknight,Sven,Wraith King&enemy=Phantom Lancer,Slark,Pugna,Jakiro,Windranger');
		return;
	}
	
	var input = {};
	
	var allies = req.query.ally != null ? req.query.ally.split(',') : []; 
	var enemies = req.query.enemy.split(',');

	for(i in allies)
		input[allies[i].trim()] = 1;
	
	for(i in enemies)
		input[enemies[i].trim()] = -1;
	
	return input;
}

function filter(input, output) {

	var result = [];

	var inputs = Object.keys(input);
	var keys = Object.keys(output);
	for(i in keys) {
		if(! _.contains(inputs, keys[i]))
			result.push({name:keys[i], value:output[keys[i]]});
	}
	
	result.sort(function(a, b){
		return b.value - a.value;
	});

	return result.length < 10 ? result : result.slice(0, 10);
}
