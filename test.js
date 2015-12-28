require("babel-register");

var glob        = require('glob');
var resolvePath = require('path').resolve;
var cwd         = process.cwd();

var pattern = '**!(node_modules)/__tests__/**-test.js';

glob(pattern, function (err, files) {
  files.forEach(function (file) {
    if (file.indexOf('node_modules') === -1) {
      require(resolvePath(cwd, file));
    }
  });
});
