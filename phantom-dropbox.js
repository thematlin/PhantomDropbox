var Dropbox = require('dropbox'),
    spawn = require('child_process').spawn;

Dropbox.AuthDriver.PhantomDropbox = (function() {

  function PhantomDropbox(username, password, options) {
    if (!username || !password) {
      throw new Error('Username and password must be set!');
    }
    this._username = username;
    this._password = password;

    this._port = (options != null ? options.port : void 0) || 8912;
    if (options != null ? options.tls : void 0) {
      this._tlsOptions = options.tls;
      if (typeof this._tlsOptions === 'string' || this._tlsOptions instanceof Buffer) {
        this._tlsOptions = {
          key: this._tlsOptions,
          cert: this._tlsOptions
        };
      }
    } else {
      this._tlsOptions = null;
    }
    this._fs = Dropbox.Env.require('fs');
    this._http = Dropbox.Env.require('http');
    this._https = Dropbox.Env.require('https');
    this._open = Dropbox.Env.require('open');
    this._callbacks = {};
    this._nodeUrl = Dropbox.Env.require('url');
    this.createApp();
  }

  PhantomDropbox.prototype.authType = function() {
    return "code";
  };

  PhantomDropbox.prototype.url = function() {
    var protocol;
    protocol = this._tlsOptions === null ? 'http' : 'https';
    return "" + protocol + "://localhost:" + this._port + "/oauth_callback";
  };

  PhantomDropbox.prototype.doAuthorize = function(authUrl, stateParam, client, callback) {
    this._callbacks[stateParam] = callback;
    return this.runPhantom(authUrl);
  };

  PhantomDropbox.prototype.runPhantom = function(url) {
    if (!url.match(/^https?:\/\//)) {
      throw new Error("Not a http/https URL: " + url);
    }

    var phantom = spawn('lib/phantomjs/phantomjs.exe', ['lib/phantomjs/dropbox.js',  url, this._username, this._password])

    phantom.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
    });

    phantom.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });

    phantom.on('close', function (code) {
      console.log('child process exited with code ' + code);
    });
  };

  PhantomDropbox.prototype.createApp = function() {
    var _this = this;
    if (this._tlsOptions) {
      this._app = this._https.createServer(this._tlsOptions, function(request, response) {
        return _this.doRequest(request, response);
      });
    } else {
      this._app = this._http.createServer(function(request, response) {
        return _this.doRequest(request, response);
      });
    }
    return this._app.listen(this._port);
  };

  PhantomDropbox.prototype.closeServer = function() {
    return this._app.close();
  };

  PhantomDropbox.prototype.doRequest = function(request, response) {
    var data, stateParam, url,
      _this = this;

    url = this._nodeUrl.parse(request.url, true);
    if (url.pathname === '/oauth_callback') {
      stateParam = url.query.state;
      if (this._callbacks[stateParam]) {
        this._callbacks[stateParam](url.query);
        delete this._callbacks[stateParam];
      }
    }
    data = '';
    request.on('data', function(dataFragment) {
      return data += dataFragment;
    });
    return request.on('end', function() {
      return _this.closeBrowser(response);
    });
  };

  PhantomDropbox.prototype.closeBrowser = function(response) {
    var closeHtml;
    closeHtml = "<!doctype html>\n<p>Please close this window.</p>";
    response.writeHead(200, {
      'Content-Length': closeHtml.length,
      'Content-Type': 'text/html'
    });
    response.write(closeHtml);
    return response.end();
  };

  return PhantomDropbox;

})();