const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractPlugin = new ExtractTextPlugin({
    filename: 'main.css',
});

module.exports = {
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, 'phonegap/www'),
        filename: 'bundle.js',
        publicPath: '/dist'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['es2015']
                        }
                    }
                ]
            },
            {
                test: /\.scss$/,
                use: extractPlugin.extract({
                    use: ['css-loader', 'sass-loader']
                })
            },
            {
                test: /\.(wav|mp3)$/,
                use: [{
                    loader: 'file-loader',
                }],
            },
            {
                test: /\.(jpe?g|gif|png|svg|woff|ttf)$/,
                use: [{
                    loader: 'file-loader'
                }],
            },
            {
                test: /\.html$/,
                loader: "ng-cache-loader?prefix=[dir]/[dir]"
            },
            {
                test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts/',
                        publicPath: '../'       // override the default path
                    }
                }]
            }
        ]
    },
    plugins: [
        extractPlugin
    ]
};