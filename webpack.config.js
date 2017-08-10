var CopyWebpackPlugin = require('copy-webpack-plugin');
// var $ = require('jquery');
// var path = require('path');
// var webpack = require('webpack');

module.exports = {
    entry: './src/main.ts',
    output: {
        filename: './dist/tintup-hex.bundle.js'
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
        ])
    ]
}