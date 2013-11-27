var page = require('webpage').create(),
	fs = require('fs'),
	system = require('system');

require('./stdlib');

page.resources = [];

var url = system.args[1],
	username = system.args[2],
	password = system.args[3];
if (!url.match(/^https?:\/\//)) {
  	throw new Error("Not a http/https URL: " + url);
}

function injectjQuery() {
	page.injectJs('http://code.jquery.com/jquery-2.0.3.min.js');
	return page.evaluate(function() {
		return jQuery.noConflict();
	});
}

function doLogin() {
	return page.evaluate(function(username, password) {
		jQuery('#login_email').val(username);
		jQuery('#login_password').val(password);

		jQuery('form[action="/login"]').submit();
		return true;
	}, username, password);
}

function allowApp() {
	return page.evaluate(function() {
		jQuery('input[name="allow_access"]').click();

		return true;
	});
}

function exitPhantom() {
	try {
		var now = new Date();
		fs.write('./log_' + now.format("d-m-Y H.i.s") + '.txt', JSON.stringify(page.resources, undefined, 4), 'w');
	} catch(e) {
		console.log(e);
	}

	return phantom.exit();
}

page.onResourceRequested = function(request) {
  page.resources.push(request);
};
page.onResourceReceived = function(response) {
  page.resources.push(response);
};

page.onLoadFinished = function(status) {
	if (status === 'success') {
		if (!phantom.state) {
			injectjQuery();
			doLogin();
			return phantom.state = 'auth';
		} else if (phantom.state === 'auth') {
			injectjQuery();
			allowApp();
			return phantom.state = 'callback';
		} else if (phantom.state === 'callback') {
			exitPhantom();
		}
	} else {
		console.log('Connection failed... ');
		return exitPhantom();
	}
}

page.onConsoleMessage = function(msg) {
	return console.log(msg);
}

page.open(url);