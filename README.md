PhantomDropbox
==============

Small auth driver for the [dropbox-js](https://github.com/dropbox/dropbox-js) library

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