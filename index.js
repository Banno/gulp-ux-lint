'use strict';

var extend   = require('extend');
var fs       = require('fs');
var gutil    = require('gulp-util');
var linter   = require('ux-lint');
var path     = require('path');
var reporter = require('ux-lint/reporters/stylish');
var through  = require('through2');

var PLUGIN_NAME = 'gulp-ux-lint';

module.exports = function(opts) {
	var allLintErrors = [];
	opts = opts || {};

	opts.cwd = opts.cwd || process.cwd();

	if (opts.extend || typeof opts.extend === 'undefined') {
		var lintrc = {};
		try {
			lintrc = JSON.parse(fs.readFileSync(path.resolve(opts.cwd, '.lintrc'), 'utf8'));
		} catch (e) {
			// Only ignore errors where .lintrc doesn't exist.
			if (e.code !== 'ENOENT') { throw e; }
		}
		extend(opts, lintrc);
	}

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
