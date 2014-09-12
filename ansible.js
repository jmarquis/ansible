var director = require("director"),
	router = new director.Router();

module.exports = function (io, debug) {

	io.on("connection", function (socket) {

		if (debug) console.log("Incoming connection");

		socket.emit("ansible:update", { some: "data" });

		socket.on("ansible:joinroom", function (room) {
			if (debug) console.log("Joining room: " + room);
			socket.join(room);
			router.dispatch("get", room, function (err, data) {
				console.log(err);
				console.log(data);
			});
		});

	});

	return {

		on: function (action, path, fn) {
			router.on(action, path, fn);
		}

	};

};
