const path = require('path');

module.exports = {
  entry: './src/debugger/index.js',
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader', "eslint-loader"]
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: "style-loader",
            options: { injectType: "lazyStyleTag" },
          },
          "css-loader",
        ],
      },
    ],
    
  },
  resolve: {
    extensions: ['*', '.js', '.css']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: {
      name: 'WmDbg',
      type: 'umd'
    }
  },
};