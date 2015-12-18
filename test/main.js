'use strict';

var assert     = require('stream-assert');
var File       = require('gulp-util').File;
var fs         = require('fs');
var path       = require('path');
var proxyquire = require('proxyquire');
var should     = require('should');
var sinon      = require('sinon');
var Stream     = require('stream');
var uxLint     = require('ux-lint');

require('mocha');

var testFile = 'fixtures/bad-javascript.js';

describe('gulp-ux-lint', function() {

	var stream, testBuffer;

	var reporterSpy = sinon.spy();
	sinon.spy(uxLint, 'check');
	sinon.spy(uxLint, 'fix');

	var linter = proxyquire('../', {
		'ux-lint': uxLint,
		'ux-lint/reporters/stylish': reporterSpy
	});

	beforeEach(function() {
		reporterSpy.reset();
		uxLint.check.reset();
		uxLint.fix.reset();
		stream = linter();
		testBuffer = new File({
			base: __dirname,
			path: path.join(__dirname, testFile),
			contents: new Buffer(fs.readFileSync(
				path.join(__dirname, testFile),
				{ encoding: 'utf8' }
			).trim())
		});
	});

	it('should call the reporter', function(done) {
		stream
			.pipe(assert.length(1))
			.pipe(assert.first(function(file) {
				file.should.eql(testBuffer);
			}))
			.pipe(assert.end(function() {
				sinon.assert.calledOnce(reporterSpy);
				(reporterSpy.firstCall.args[0].length).should.be.greaterThan(0);
				done();
			}));
		stream.write(testBuffer);
		stream.end();
	});

	it('should call the check() method', function(done) {
		stream
			.pipe(assert.length(1))
			.pipe(assert.end(function() {
				sinon.assert.calledOnce(uxLint.check);
				done();
			}));
		stream.write(testBuffer);
		stream.end();
	});

	it('should call the fix() method when { fix: true } is passed', function(done) {
		stream = linter({ fix: true });
		stream
			.pipe(assert.length(1))
			.pipe(assert.end(function() {
				sinon.assert.calledOnce(uxLint.fix);
				done();
			}));
		stream.write(testBuffer);
		stream.end();
	});

	it('should work with no files', function(done) {
		stream
			.pipe(assert.length(1))
			.pipe(assert.first(function(file) {
				file.should.eql(new File());
			}))
			.pipe(assert.end(function() {
				sinon.assert.calledOnce(reporterSpy);
				done();
			}));
		stream.write(new File());
		stream.end();
	});

	it('should emit an error with a streamed file', function(done) {
		stream
			.on('error', function(err) {
				err.message.should.eql('Streaming not supported');
				done();
			});
		stream.write(new File({
			base: __dirname,
			path: path.join(__dirname, testFile),
			contents: new Stream()
		}));
	});

});
