import path from "path";
export default {
  entry: {
    background: "./src/background/background.js",
    content: "./src/content/content.js",
    popup: "./src/popup/popup.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve("dist"),
  },
  mode: "production",
  experiments: {
    outputModule: true, // Required for ES modules in Webpack 5+
  },
};