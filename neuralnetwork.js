var fs = require('fs');
var brain = require('brain');

var net = new brain.NeuralNetwork();

loadNetwork();

module.exports = net;

function loadNetwork() {
	var networkData = JSON.parse(fs.readFileSync('data/network.json', 'utf8'));
	net.fromJSON(networkData);
	console.log('Network loaded.');
}

