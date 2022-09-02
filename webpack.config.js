const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

const BASE_JSPATH = "./src/client/js/";

module.exports = {
  entry: {
    main: BASE_JSPATH + "main.js",
    videoPlayer: BASE_JSPATH + "videoPlayer.js",
    recorder: BASE_JSPATH + "recorder.js",
    commentSection: BASE_JSPATH + "commentSection.js",
    location: BASE_JSPATH + "location.js",
    userprofile: BASE_JSPATH + "userprofile.js",
    hashtag: BASE_JSPATH + "hashtag.js",
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/styles.css",
    }),
  ],
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "assets"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
};
