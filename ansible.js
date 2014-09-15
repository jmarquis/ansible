var route = require("path-match")();

var Router = function () {

	this.table = [];

	this.on = function (action, path, process) {
		this.table.push({
			match: route(action + "|" + path),
			process: process
		});
	};

	this.match = function (action, path, data) {
		for (var i = 0; i < this.table.length; i++) {
			var params = this.table[i].match(action + "|" + path);
			if (params !== false) return this.table[i].process(params, data);
		}
		return false;
	};

};

var router = new Router();

module.exports = function (io, debug) {

	io.on("connection", function (socket) {

		if (debug) console.log("Incoming connection");

		var retrieve = function (channel) {
			var data = router.match("get", channel);
			if (data) {
				socket.emit("ansible:update", {
					channel: channel,
					data: data
				});
			}
		};

		socket.on("ansible:subscribe", function (channel) {
			if (debug) console.log("Subscribing: " + channel);
			socket.join(channel);
			retrieve(channel);
		});

		socket.on("ansible:unsubscribe", function (channel) {
			if (debug) console.log("Unsubscribing: " + channel);
			socket.leave(channel);
		});

		socket.on("ansible:get", function (channel) {
			if (debug) console.log("Retrieving: " + channel);
			retrieve(channel);
		});

		socket.on("ansible:update", function (data) {
			if (debug) console.log("Incoming update: " + data.channel);
			router.match("update", data.channel);
			socket.broadcast.emit("ansible:update", data);
		});

	});

	return {

		on: function (action, path, process) {
			router.on(action, path, process);
		}

	};

};
