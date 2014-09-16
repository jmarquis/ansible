var app = require("express")(),
	server = require("http").Server(app),
	io = require("socket.io")(server),
	ansible = require("./ansible")(io, true);

server.listen(29000);

var data = "hello!";

setInterval(function () {
	console.log(data);
}, 3000);

ansible.on("get", "/test/:id", function (_) {
	return data;
});

ansible.on("update", "/test/:id", function (_) {
	data = _.data;
	return data;
});
