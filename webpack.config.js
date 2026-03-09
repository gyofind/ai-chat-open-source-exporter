import path from "path";
import { fileURLToPath } from 'url';
import CopyPlugin from "copy-webpack-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: "development", // Change to 'production' only when finishing
  devtool: "cheap-module-source-map",
  entry: {
    background: "./src/background/background.js",
    content: "./src/content/content.js",
    popup: "./src/popup/popup.js", // Ensure this matches your src/ structure!
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: true, // Empties dist/ before every build
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "manifest.json", to: "." },
        { from: "src/popup/popup.html", to: "." }, // Adjusted path
        //{ from: "src/popup/popup.css", to: "." },
        { from: "public/icons", to: "icons" },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env'] }
        }
      }
    ]
  }
};