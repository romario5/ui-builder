const rollup = require('rollup');
const babel = require("rollup-plugin-babel");

let babelConf = {
    "presets": ["es2015-rollup"]
};

let config = {
    input: 'src-es6/index.js',
    plugins: [ babel(babelConf) ]
};

rollup.rollup(config)
    .then(bundle => bundle.write({
        file: 'dist/ui-builder-es6.js',
        format: 'cjs'
    }));


