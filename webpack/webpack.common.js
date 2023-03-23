const webpack =  require("webpack")
const path = require("path")
const CopyPlugin = require("copy-webpack-plugin")
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
    entry: {
      style: path.join(srcDir, 'style.tsx'),
      devb: path.join(srcDir, 'devb.tsx'),
      dev: path.join(srcDir, 'dev.tsx'),
      new_tab: path.join(srcDir, 'new_tab.tsx'),
      search: path.join(srcDir, 'search.tsx'),
      background: path.join(srcDir, 'background.ts'),
      content: path.join(srcDir, 'content.ts'),
      intro: path.join(srcDir, 'intro.tsx'),
    },
    output: {
        path: path.join(__dirname, "../dist/js"),
        filename: "[name].js",
    },
    optimization: {
      usedExports: true,
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
