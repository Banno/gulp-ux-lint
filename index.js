'use strict';

var gutil    = require('gulp-util');
var linter   = require('ux-lint');
var reporter = require('ux-lint/reporters/stylish');
var through  = require('through2');

var PLUGIN_NAME = 'gulp-ux-lint';

module.exports = function(opts) {
	var allLintErrors = [];
	opts = opts || {};

	return through.obj(function(file, enc, cb) {
			if (file.isNull()) {
				cb(null, file);
				return;
			}

			if (file.isStream()) {
				cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
				return;
			}

			var func = opts.fix ? 'fix' : 'check';
			linter[func](file.path, opts, function(err, lintErrors) {
				if (err) {
					cb(new gutil.PluginError(PLUGIN_NAME, err));
					return;
				}
				file.lint = lintErrors;
				allLintErrors = allLintErrors.concat(lintErrors);
				cb(null, file);
			});
		}, function(cb) {
			reporter(allLintErrors);
			cb();
		});
};
