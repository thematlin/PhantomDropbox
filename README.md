PhantomDropbox
==============

Small auth driver for the [dropbox-js](https://github.com/dropbox/dropbox-js) library with inspiration taken from their [https://github.com/dropbox/dropbox-js/blob/stable/guides/builtin_drivers.md#dropboxauthdrivernodeserver](NodeServer) auth driver. PhantomDropbox creates a simple http server and launches a phantomjs process that logs in with specified credentials and allows application. Callback is recieved in http server and client is authenticated.

Simple usage:
--------------
```JavaScript
var Dropbox = require('dropbox');

require('./phantom-dropbox');

var client = new Dropbox.Client({
    key: "your-key",
    secret: "your-secret"
});

client.authDriver(new Dropbox.AuthDriver.PhantomDropbox('your-username', 'your-password', { port: 8191 }));
```

TODO
--------------

* Support for *nix environments