
// var $ = require('jquery');
// var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/main.ts',
    output: {
        filename: './dist/tintup-hex.bundle.js',
        libraryTarget: 'var',
        library: 'HexGenerator'
    },
    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.js']
    },
    module: {
        loaders: [
            { 
                test: /\.ts$/,
                loader: 'ts-loader'
             }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            { 
                context: 'src/assets',
                from: '**/*', 
                to: 'dist/assets' 
            }
        ]),
        new webpack.optimize.UglifyJsPlugin({ })
    ]
}