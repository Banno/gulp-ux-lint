'use strict';

const extend   = require('extend');
const fs       = require('fs');
const gutil    = require('gulp-util');
const linter   = require('ux-lint');
const path     = require('path');
const reporter = require('ux-lint/reporters/stylish');
const through  = require('through2');

const PLUGIN_NAME = 'gulp-ux-lint';

module.exports = function(opts) {
	let allLintErrors = [];
	opts = opts || {};

	opts.cwd = opts.cwd || process.cwd();

	if (opts.extend || typeof opts.extend === 'undefined') {
		let lintrc = {};
		try {
			lintrc = JSON.parse(fs.readFileSync(path.resolve(opts.cwd, '.lintrc'), 'utf8'));
		} catch (e) {
			// Only ignore errors where .lintrc doesn't exist.
			if (e.code !== 'ENOENT') { throw e; }
		}
		extend(opts, lintrc);
	}

	return through.obj((file, enc, cb) => {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return;
		}

		let func = opts.fix ? 'fix' : 'check';
		linter[func](file.path, opts, (err, lintErrors) => {
			if (err) {
				cb(new gutil.PluginError(PLUGIN_NAME, err));
				return;
			}
			file.lint = lintErrors;
			allLintErrors = allLintErrors.concat(lintErrors);
			cb(null, file);
		});
	}, cb => {
		reporter(allLintErrors);
		cb();
	});
};
