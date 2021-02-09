'use strict';

global.navigator = global.navigator ? global.navigator : { appName: 'nodejs' }; // fake the navigator object if not present
global.window = global.window ? global.window : {}; // fake the window object if not present

// Node compatible adaptation of jsencrypt
var JSEncrypt = require('jsencrypt').default;

module.exports = JSEncrypt;