const webpack = require('webpack')
const path = require('path')
const ExtractTextPlugin = require("extract-text-webpack-plugin");


const BUILD_DIR = path.resolve(__dirname, 'webapp/build')
const SRC_DIR = path.resolve(__dirname, 'webapp/src')

module.exports = {
    entry: SRC_DIR + '/index.jsx',
    output: {
        path: BUILD_DIR,
        filename: 'bundle.js'
    },
    plugins: [
        new ExtractTextPlugin("bundle.css")
    ],
    devtool: 'source-map',
    module: {
        rules: [{
            test: /\.jsx*$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader'
            }
        },{
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: [{
                    loader: "css-loader",
                    options: {
                        modules: true,
                        localIdentName: "[local]--[hash:base64:5]",
                        importLoaders: true,
                        root: '.'
                    }
                }]
            })
        },{
            test: /\.json$/,
            loader: 'json-loader',
        }]
    }
};