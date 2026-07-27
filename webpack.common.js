const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { version } = require("./package.json");

module.exports = {
  entry: {
    background: "./src/background.ts",
    content: "./src/index.tsx",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-react",
                "@babel/preset-typescript",
              ],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "static",
          // static/manifest.json's own "version" field is a placeholder and is
          // never the source of truth — package.json is. Stamp it in here so
          // dist/manifest.json (and thus the Chrome Web Store upload) always
          // matches package.json, and the two can never drift.
          transform: (content, absoluteFrom) => {
            if (path.basename(absoluteFrom) !== "manifest.json") {
              return content;
            }
            const manifest = JSON.parse(content.toString());
            manifest.version = version;
            return JSON.stringify(manifest, null, 2);
          },
        },
        { from: "data", to: "data" },
      ],
    }),
  ],
};
