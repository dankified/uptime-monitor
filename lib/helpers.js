/*
* Helpers for various tasks
*/

//Dependencies
const crypto = require('crypto');
const config = require('./config');

//Container for all the helpers
const helpers = {};

// Create a SHA256 hash

helpers.hash = function(str) {
	if(typeof(str) == 'string' && str.length > 0) {
		const hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
		return hash;
	} else {
		return false;
	}
};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str) {
	try {
		const obj = JSON.parse(str) 
		return obj;
	} catch(e) {
		return {};
	}
}

// Create a string of random alphanumeric characters, of a given length

helpers.createRandomString = function(strLength) {
	strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : 20;
	const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
	let str = '';
	let i = 0;
	while(i < strLength) {
		str += possibleCharacters[Math.floor(Math.random() * possibleCharacters.length)]
		i++;
	}
	return str
}

// Export the module
module.exports = helpers;