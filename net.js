var fs = require('fs');
var _ = require("underscore")._;

var networkData = JSON.parse(fs.readFileSync('data/network.json', 'utf8'));

var brain = require('brain');
var net = new brain.NeuralNetwork();
net.fromJSON(networkData);

console.log('Network loaded.');

exports.net = net;

exports.run = function(input) {
	var output = net.run(input);
	return filter(input, output);	
};

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



