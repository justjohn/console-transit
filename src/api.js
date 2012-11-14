
var xml2object = require('xml2object'),
	http = require('http'),
	Q = require('q');

var API = function(agency) {
	this.agency = agency;
};

API.prototype.call = function(command, params) {
	var deferred = Q.defer();
	var paramStr = ["command="+command];

	if (params) for (var key in params)
	{
		paramStr.push(key+"="+params[key]);
	}

	var query = paramStr.join("&");

	var options = {
	  host: 'webservices.nextbus.com',
	  port: 80,
	  path: '/service/publicXMLFeed?a=' + this.agency + "&" + query,
	  method: 'GET'
	};

	console.log("URL: " + JSON.stringify(options));

	// Pipe a request into the parser
	http.get(options, function(res) {
		var parser = new xml2object(['body'], res);
		var data = {};

		parser.on('object', function(name, obj) {
			data[name] = obj;
		});

		parser.on('end', function() {
		    deferred.resolve(data);
		});

		parser.start();
	});

	return deferred.promise;
};

API.prototype.routeList = function() {
	return this.call("routeList").then(function(obj) {
		var deferred = Q.defer();
		deferred.resolve(obj.body.route);
		return deferred.promise;
	});
};

API.prototype.routeConfig = function(routeTag) {
	return this.call("routeConfig", {r: routeTag}).then(function(obj) {
		var deferred = Q.defer();
		deferred.resolve(obj.body.route);
		return deferred.promise;
	});
};

API.prototype.predictions = function(routeTag, stopTag) {
	// if only one argument is specified, assume it's a stopId
	if (stopTag === undefined)
		return this.predictionsStopId(routeTag);

	return this.call("predictions", {r: routeTag, s: stopTag}).then(function(obj) {
		var deferred = Q.defer();
		deferred.resolve(obj.body.predictions);
		return deferred.promise;
	});
};

API.prototype.predictionsStopId = function(stopId) {
	return this.call("predictions", {stopId: stopId}).then(function(obj) {
		var deferred = Q.defer();
		deferred.resolve(obj.body.predictions);
		return deferred.promise;
	});
};

exports.API = API;
