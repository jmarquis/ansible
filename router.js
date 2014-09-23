var Route = require("rowt").Route;

var Router = module.exports.Router = function () {

	this.table = [];

	this.on = function (action, path, process) {
		console.log("Registering route:", "/" + action + path);
		this.table.push({
			route: new Route("/" + action + path),
			process: process
		});
	};

	this.process = function (action, path, data) {
		console.log("Router.process:", action, path);
		for (var i = 0; i < this.table.length; i++) {
			var params = this.table[i].route.match("/" + action + path);
			if (params !== false) {
				console.log("Params:", params);
				if (typeof data === "function") {
					return this.table[i].process.apply(undefined, data(action, path, params));
				} else {
					return this.table[i].process(data);
				}
			}
		}
		return false;
	};

};

Router.Route = Route;
