# gulp-ux-lint

This is a [gulp](http://gulpjs.com/) plugin for [ux-lint](https://github.com/Banno/ux-lint).

## Installation

```shell
$ npm install --save-dev gulp-ux-lint
```

## Usage

### Reporting

```javascript
var gulp = require('gulp');
var lint = require('gulp-ux-lint');

gulp.task('default', function() {
  return gulp.src('src/*.js')
    .pipe(lint());
});
```

### Fixing

```javascript
var gulp = require('gulp');
var lint = require('gulp-ux-lint');

gulp.task('fix-files', function() {
  return gulp.src('src/*.js')
    .pipe(lint({ fix: true }));
});
```

## Options

Linter plugin-specific options can also be passed through the options object. Like ux-lint, they should be keyed by the plugin name.

### extend

Type: `boolean`
Default: `true`

Looks for a `.lintrc` file in the current directory for configuration overrides. See the [ux-lint documentation](https://github.com/Banno/ux-lint/blob/master/README.md) for details.

### fix

Type: `boolean`
Default: `false`

Attempt to automatically fix the errors. Files are changed "inline", so there is no need to pipe to `gulp.dest()` if you use this option.

## Results

A `lint` array will be attached to the file object. It contains all the [ux-lint error objects](https://github.com/Banno/ux-lint#linters) for the file.

## Contributing

Development tasks are available through [npm scripts](https://docs.npmjs.com/cli/run-script):

```shell
npm test       # run tests
npm run lint   # run linting
```

Please add tests and maintain the existing styling when adding and updating the code.

## License

Copyright 2015 [Jack Henry & Associates Inc](https://www.jackhenry.com/).

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0).

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
