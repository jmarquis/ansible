var app = require("express")(),
	server = require("http").Server(app),
	io = require("socket.io")(server),
	ansible = require("./ansible")(io, true);

server.listen(29000);

ansible.on("get", "/test/123", function () {
	return "data!";
});