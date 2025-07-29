const path = require('path');
const webpack = require('webpack');

const isDev = process.env.NODE_ENV !== 'production';
console.log(`mode is: ${isDev ? 'development' : 'production'}\n`);
const webpackConfig = {
  mode: isDev ? 'development' : 'production',
  entry: {
    index: isDev
      ? [
        'webpack-hot-middleware/client?path=/__webpack_hmr&reload=true',
        './src/index.js'
      ]
      : ['./src/index.js']
  },
  resolve: {
    modules: ['src', 'node_modules'],
    extensions: ['.ts', '.tsx','.js', '.jsx', '.json'],
    alias: {
      constants: path.resolve(__dirname, './src/constants'),
    }
  },
  devtool: isDev ? 'eval-source-map' : false,
  output: {
    filename: 'custom_chart_0.js',
    path: path.resolve(__dirname, 'build'),
    publicPath: "/plugins/",
    library: 'CustomChart0',
    libraryTarget: 'umd'
  },
  externals: [
    {
      'react': 'React',
      'react-dom': 'ReactDOM',
      'echarts': 'echarts'
    }
  ],
  module: {
    rules: [
      {
        test: /\.m?jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.tsx?$/, // Обработка файлов .ts и .tsx
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(scss|css)$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/,
        use: ['url-loader'],
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'DEV_URL': JSON.stringify(process.env.DEV_URL || false)
    }),
  ]
};

if (isDev) {
  webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
}

module.exports = webpackConfig;
