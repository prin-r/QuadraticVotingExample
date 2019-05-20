const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

module.exports = env => {
  const isProduction = env === 'production'
  console.log('env : ', env)
  console.log('isProduction : ', isProduction)
  return {
    mode: env,
    entry: [
      '@babel/polyfill',
      'core-js/modules/es6.promise',
      'core-js/modules/es6.array.iterator',
      './src/index.js',
    ],
    output: {
      path: path.join(__dirname, 'public'),
      filename: 'dist/bundle.js',
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /\.(js)?$/,
          exclude: path.join(__dirname, './node_modules'),
          use: [
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
              },
            },
          ],
        },
        {
          test: /\.s?css$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
        {
          test: /\.(png|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          include: path.join(__dirname, './public'),
          use: [
            {
              loader: 'file-loader',
            },
          ],
        },
      ],
    },
    devtool: isProduction ? 'source-map' : 'cheap-module-eval-source-map',
    devServer: {
      contentBase: path.join(__dirname, 'public'),
      historyApiFallback: true,
    },
    plugins: [new BundleAnalyzerPlugin()],
  }
}
