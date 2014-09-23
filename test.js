var app = require("express")(),
	server = require("http").Server(app),
	io = require("socket.io")(server),
	ansible = require("./ansible")(io, true);

server.listen(29000);

var people = {
	123: {
		name: "John"
	},
	456: {
		name: "Billy"
	}
};

setInterval(function () {
	console.log(people);
}, 3000);

ansible.on("get", "/test/:id", function (params, data) {
	return people[params.id] || null;
});

ansible.on("update", "/test/:id", function (params, data) {
	people[params.id] = data;
	return people[params.id];
});
