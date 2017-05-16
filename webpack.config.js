const webpack = require('webpack')
const path = require('path')

const BUILD_DIR = path.resolve(__dirname, 'webapp/build')
const SRC_DIR = path.resolve(__dirname, 'webapp/src')

module.exports = {
    entry: SRC_DIR + '/index.jsx',
    output: {
        path: BUILD_DIR,
        filename: 'bundle.js'
    },
    devtool: 'source-map',
    module: {
        rules: [{
            test: /\.jsx*$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader'
            }
        }]
    }
};