/*
* Primary file for the API
*
*/

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const fs = require('fs');
const _data = require('./lib/data');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

// Instantiating http server
let httpServer = http.createServer(function(req, res) {
	unifiedServer(req, res);
});

// Start the server, and have it listen on port 3000
httpServer.listen(config.httpPort, function() {
	console.log(`The server is listening on ${config.httpPort} in ${config.envName} mode`);
});

// httpsServerOptions
const httpsServerOptions = {
	key: fs.readFileSync('./https/key.pem'),
	cert: fs.readFileSync('./https/cert.pem'),
}

// Instantiating https server
let httpsServer = https.createServer(httpsServerOptions, function(req, res) {
	unifiedServer(req, res);
})

// Start the server, and have it listen on port 3000
httpsServer.listen(config.httpsPort, function() {
	console.log(`The server is listening on ${config.httpsPort} in ${config.envName} mode`);
});

// Define a request router
let router = {
	'ping': handlers.ping,
	'users': handlers.users,
	'tokens': handlers.tokens
}

function unifiedServer(req, res) {

	// Get the URL and parse it
	let parsedUrl = url.parse(req.url, true);

	// Get the path
	let path = parsedUrl.pathname;
	let trimmedPath = path.replace(/^\/+|\/+#/g,'');

	// Get the query string as an object
	let queryStringObject = parsedUrl.query;


	// Get the HTTP Method
	let method = req.method.toLowerCase();
	
	// Get the headers as an object
	let headers = req.headers;

	// Get the payload, if any
	let decoder = new StringDecoder('utf-8');
	let buffer = '';
	
	req.on('data', function(data) {
		buffer += decoder.write(data);
	});

	req.on('end', function() {
		buffer += decoder.end();
		
		// Choose the handler this request should go to. If one is not found choose the notFound handler
		let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		// Construct the data object to send to the handler
		let data = {
			trimmedPath,
			queryStringObject,
			method,
			headers,
			'payload': helpers.parseJsonToObject(buffer)
		};


		// Route the request to the handler specified in the router
		chosenHandler(data, function(statusCode, payload) {

			// Use the status code called back by the handler, or default handler
			statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

			// Use the payload called back by the handler, or default to an empty object
			payload = typeof(payload) === 'object' ? payload : {};

			// Convert payload to a string
			let payloadString = JSON.stringify(payload);
			
			// Return the response
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadString);

			//Log the response
			console.log('Returning this response:', statusCode, payloadString); 

		});
	})
}
