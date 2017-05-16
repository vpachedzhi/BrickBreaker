const webpack = require('webpack');
const path = require('path')
const fs = require('fs');
const SRC_DIR = path.join(__dirname, 'server/index.js')
const BUILD_DIR = path.join(__dirname, 'build')

const nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {
    entry: SRC_DIR,
    target: 'node',
    node: {
      __dirname: false
    },
    output: {
        path: BUILD_DIR,
        filename: 'backend.js'
    },
    externals: nodeModules,
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015', 'stage-2'],
                        plugins: [
                            require('babel-plugin-transform-object-rest-spread'),
                            require('babel-plugin-transform-flow-strip-types')
                        ]
                    }
                }
            }
        ]
    }
    // plugins: [
    //     new webpack.IgnorePlugin(/\.(css|less)$/),
    //     new webpack.BannerPlugin('require("source-map-support").install();',
    //         { raw: true, entryOnly: false })
    // ],
    // devtool: 'sourcemap'
}