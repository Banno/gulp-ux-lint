'use strict';

const assert     = require('stream-assert');
const File       = require('gulp-util').File;
const fs         = require('fs-extra');
const path       = require('path');
const proxyquire = require('proxyquire');
const sinon      = require('sinon');
const Stream     = require('stream');
const uxLint     = require('ux-lint');

require('mocha');
require('should');

const testFile = 'fixtures/bad-javascript.js';

describe('gulp-ux-lint', () => {

	let stream, testBuffer;

	let reporterSpy = sinon.spy();
	sinon.spy(uxLint, 'check');
	sinon.spy(uxLint, 'fix');

	let linter = proxyquire('../', {
		'ux-lint': uxLint,
		'ux-lint/reporters/stylish': reporterSpy
	});

	beforeEach(() => {
		reporterSpy.reset();
		uxLint.check.reset();
		uxLint.fix.reset();
		stream = linter({ extend: false });
		testBuffer = new File({
			base: __dirname,
			path: path.join(__dirname, testFile),
			contents: new Buffer(fs.readFileSync(
				path.join(__dirname, testFile),
				{ encoding: 'utf8' }
			).trim())
		});
	});

	it('should call the reporter', done => {
		stream
			.pipe(assert.length(1))
			.pipe(assert.first(file => {
				file.should.eql(testBuffer);
			}))
			.pipe(assert.end(() => {
				sinon.assert.calledOnce(reporterSpy);
				(reporterSpy.firstCall.args[0].length).should.be.greaterThan(0);
				done();
			}));
		stream.write(testBuffer);
		stream.end();
	});

	it('should add a "lint" object to the file object', done => {
		stream
			.pipe(assert.length(1))
			.pipe(assert.first(file => {
				file.lint.should.be.instanceOf(Array);
			}))
			.pipe(assert.end(done));
		stream.write(testBuffer);
		stream.end();
	});

	it('should call the check() method', done => {
		stream
			.pipe(assert.length(1))
			.pipe(assert.end(() => {
				sinon.assert.calledOnce(uxLint.check);
				done();
			}));
		stream.write(testBuffer);
		stream.end();
	});

	it('should call the fix() method when { fix: true } is passed', done => {
		stream = linter({ extend: false, fix: true });
		stream
			.pipe(assert.length(1))
			.pipe(assert.end(() => {
				sinon.assert.calledOnce(uxLint.fix);
				done();
			}));
		stream.write(testBuffer);
		stream.end();
	});

	describe('"extend" option', () => {

		let tmpPath = 'test/.tmp';
		let tmpFile = tmpPath + '/' + path.basename(testFile);

		beforeEach(() => {
			fs.mkdirsSync(tmpPath);
			fs.copySync('test/fixtures/lintrc', tmpPath + '/.lintrc');
			fs.copySync('test/' + testFile, tmpFile);
			testBuffer = new File({
				base: path.resolve(tmpPath),
				path: path.resolve(tmpFile),
				contents: new Buffer(fs.readFileSync(
					path.resolve(tmpFile),
					{ encoding: 'utf8' }
				).trim())
			});
		});

		afterEach(() => {
			fs.removeSync(tmpPath);
		});

		it('should take the .lintrc config into consideration', done => {
			stream = linter({ cwd: tmpPath });
			stream
				.pipe(assert.first(file => {
					file.lint.should.have.lengthOf(0);
				}))
				.pipe(assert.end(done));
			stream.write(testBuffer);
			stream.end();
		});

		it('should *not* include the .lintrc config if { extend: false } is passed', done => {
			stream = linter({ cwd: tmpPath, extend: false });
			stream
				.pipe(assert.first(file => {
					file.lint.should.not.have.lengthOf(0);
				}))
				.pipe(assert.end(done));
			stream.write(testBuffer);
			stream.end();
		});

	});

	it('should work with no files', done => {
		stream
			.pipe(assert.length(1))
			.pipe(assert.first(file => {
				file.should.eql(new File());
			}))
			.pipe(assert.end(() => {
				sinon.assert.calledOnce(reporterSpy);
				done();
			}));
		stream.write(new File());
		stream.end();
	});

	it('should emit an error with a streamed file', done => {
		stream
			.on('error', err => {
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
