const exec = require('child_process').execSync;
const pkg = require('./package.json');

const lib = 'afform';
const entry = `src/${lib}.js`;
const output = `dist/${lib}.js`;
const outputMinified = `dist/${lib}.min.js`;

const preamble =`
/**
 * Automatically validate your forms using the HTML5 builtin methods
 *
 * Afform - the best way to validate a form
 * @version v${pkg.version}
 * @link https://github.com/kylealwyn/afform
 * @license MIT
 *
 * Copyright (c) 2016 @kylealwyn
 * The MIT License. Copyright © 2016 Kyle Alwyn.
 */
`;

const uglifyOpts = `--screw-ie8 --preamble="${preamble}"`;

exec('rm -rf dist');
exec('mkdir dist');

exec(`babel ${entry} --out-file=${output}`);
exec(`uglifyjs ${output} ${uglifyOpts} --beautify -o ${output}`);
exec(`uglifyjs ${output} ${uglifyOpts} --compress --mangle -o ${outputMinified}`);
