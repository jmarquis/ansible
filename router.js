var Route = require("route-parser");

var Router = module.exports.Router = function () {

	this.table = [];

	this.on = function (action, path, process) {
		this.table.push({
			route: new Route(action + "|" + path),
			process: process
		});
	};

	this.process = function (action, path, data) {
		for (var i = 0; i < this.table.length; i++) {
			var params = this.table[i].route.match(action + "|" + path);
			if (params !== false) return this.table[i].process(typeof data === "function" ? data({ action: action, path: path, params: params }) : data);
		}
		return false;
	};

};
