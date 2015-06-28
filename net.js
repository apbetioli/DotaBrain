var fs = require('fs');
var networkData = JSON.parse(fs.readFileSync('data/network.json', 'utf8'));

var brain = require('brain');
var net = new brain.NeuralNetwork();
net.fromJSON(networkData);

console.log('Network loaded.');

module.exports = net;
