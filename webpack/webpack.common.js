const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
    entry: {
      app: path.join(srcDir, 'app.tsx'),
      new_tab: path.join(srcDir, 'new_tab.tsx'),
      notes: path.join(srcDir, 'notes.tsx'),
      options: path.join(srcDir, 'options.tsx'),
      background: path.join(srcDir, 'background.ts'),
      content_script: path.join(srcDir, 'content_script.tsx'),
    },
    output: {
        path: path.join(__dirname, "../dist/js"),
        filename: "[name].js",
    },
    optimization: {
        // splitChunks: {
        //     name: "vendor",
        //     chunks(chunk) {
        //       return chunk.name !== 'background';
        //     }
        // },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
              test: /\.css$/i,
              use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
            // {
            //   test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
            //   use: [
            //     {
            //       loader: 'file-loader',
            //       options: {
            //         name: '[name].[ext]',
            //         outputPath: 'fonts/'
            //       }
            //     }
            //   ]
            // },
            {
              test: /\.(png|svg|jpg|jpeg|gif)$/i,
              type: 'asset/resource',
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: ".", to: "../", context: "public" }],
            options: {},
        }),
    ],
};
