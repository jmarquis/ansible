var Router = require("./router").Router,
	Route = Router.Route;

var ansible = module.exports = function (io, debug) {

	var router = new Router();

	var item = function (data, path) {
		return {
			channel: path,
			data: data
		};
	};

	var list = function (data, path) {
		var list = [];
		for (var i = 0; i < data.length; i++) {
			list.push(item(data, new Route(path).fill(data || {})));
		}
		return list;
	};

	var process = function (action, path, data) {

		console.log("ansible.process:", action, path);
		return router.process(action, path, function (action, path, params) {
			return [params, data];
		});

	};

	io.on("connection", function (socket) {

		if (debug) console.log("Incoming connection");

		socket.on("ansible:subscribe", function (channel) {
			if (debug) console.log("Subscribing: " + channel);
			socket.join(channel);
			var result = process("get", channel);
			if (result) {
				socket.emit("ansible:update", {
					channel: channel,
					data: result
				});
			}
		});

		socket.on("ansible:unsubscribe", function (channel) {
			if (debug) console.log("Unsubscribing: " + channel);
			socket.leave(channel);
		});

		socket.on("ansible:get", function (channel, callback) {

			if (debug) console.log("Retrieving: " + channel);
			var result = process("get", channel);
			if (callback) callback(result);
			if (result) {
				socket.emit("ansible:update", {
					channel: channel,
					data: result
				});
			}

		});

		socket.on("ansible:update", function (message, callback) {

			if (debug) console.log("Incoming update: " + message.channel, message.data);
			var result = process("update", message.channel, message.data);
			if (debug) console.log("Processed:", result);
			if (callback) callback(result);
			if (result) {
				socket.broadcast.in(message.channel).emit("ansible:update", {
					channel: message.channel,
					data: result
				});
			}

		});

		socket.on("ansible:delete", function (channel, callback) {

			var result = process("delete", channel);
			if (callback) callback(result);
			if (result) {
				socket.broadcast.in(channel).emit("ansible:delete", {
					channel: channel
				});
			}

		});

		socket.on("ansible:query", function (path, callback) {
			// TODO
		});

	});

	return {

		on: function (action, path, process) {
			router.on(action, path, process);
		}

	};

};
