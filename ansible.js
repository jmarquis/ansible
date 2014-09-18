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
			list.push(item(data, new Route(path).reverse(data)));
		}
		return list;
	};

	var process = function (action, path, data) {

		return router.process(action, path, function (_) {
			return {
				params: _.params,
				data: data,
				list: function (data, path) { return list(data, path); },
				item: function (data) { return item(data, new Route(_.path).reverse(_.params)); }
			};
		});

	};

	io.on("connection", function (socket) {

		if (debug) console.log("Incoming connection");

		socket.on("ansible:subscribe", function (channel) {
			if (debug) console.log("Subscribing: " + channel);
			socket.join(channel);
			var data = process("get", channel);
			console.log(data);
			if (data) {
				socket.emit("ansible:update", {
					channel: channel,
					data: data
				});
			}
		});

		socket.on("ansible:unsubscribe", function (channel) {
			if (debug) console.log("Unsubscribing: " + channel);
			socket.leave(channel);
		});

		socket.on("ansible:get", function (channel) {
			if (debug) console.log("Retrieving: " + channel);
			var data = process("get", channel);
			if (data) {
				socket.emit("ansible:update", {
					channel: channel,
					data: data
				});
			}
		});

		socket.on("ansible:update", function (message) {
			if (debug) console.log("Incoming update: " + message.channel, message.data);
			var processedData = process("update", message.channel, message.data);
			if (debug) console.log("Processed:", processedData);
			if (processedData) socket.broadcast.in(message.channel).emit("ansible:update", {
				channel: message.channel,
				data: processedData
			});
			else socket.emit("ansible:error", 400);
		});

	});

	return {

		on: function (action, path, process) {
			router.on(action, path, process);
		}

	};

};
