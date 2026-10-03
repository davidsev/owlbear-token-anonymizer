const path = require('node:path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DefinePlugin = require('webpack').DefinePlugin;

const version = process.env.NODE_ENV === 'development' ? 'DEV' : process.env.npm_package_version;

module.exports = {
    entry: './src/index.ts',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    devtool: process.env.NODE_ENV === 'development' ? 'eval-source-map' : false,
    performance: { hints: false },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            buffer: false,
            fs: false,
            path: false,
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Token Anonymizer',
            filename: 'frame.html',
        }),
        new DefinePlugin({
            URL_PREFIX: JSON.stringify(process.env.URL_PREFIX || ''),
            VERSION: JSON.stringify(version),
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: 'static',
                    globOptions: {
                        ignore: ['**/manifest.json'],
                    },
                },
                {
                    from: 'static/manifest.json',
                    transform: (content, _path) => {
                        const manifest = JSON.parse(content.toString());
                        manifest.version = version;
                        const url_prefix = process.env.URL_PREFIX || '';
                        // OBR requires every path in the manifest to be absolute in production —
                        // it doesn't resolve them relative to the manifest URL.
                        manifest.background_url = url_prefix + manifest.background_url;
                        manifest.icon = url_prefix + manifest.icon;
                        return JSON.stringify(manifest, null, 4);
                    },
                },
            ],
        }),
    ],
    devServer: {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    },
};
