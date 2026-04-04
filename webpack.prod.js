const { merge } = require("webpack-merge");
const webpack = require("webpack");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "production",
  devtool: false,
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(false),
    }),
  ],
});
