import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { config } from 'dotenv';

import webpack from 'webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPartialsPlugin from 'html-webpack-partials-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

// @ts-ignore
const env = config().parsed;
console.log('env', env);

// @ts-ignore
// import pkg from '../../../package.json';
const pkg = require('../../package.json');

import paths from './paths.js';

export default (_env, argv) => {
  const isDev = argv.mode === 'development';
  const config = {
    entry: `${paths.src}/index.tsx`,
    output: {
      path: paths.build,
    },

    resolve: {
      modules: [paths.src, 'node_modules'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.styl'],
      alias: {
        theme: `${paths.src}/theme.styl`,
      },
    },

    optimization: {
      moduleIds: 'named',
      minimize: false,
    },

    module: {
      rules: [
        {
          test: /\.(j|t)sx?$/,
          // loader: 'babel-loader',
          use: [
            {
              loader: require.resolve('babel-loader'),
              options: {
                plugins: [
                  isDev && require.resolve('react-refresh/babel'),
                ].filter(Boolean),
              },
            },
          ],
          include: [paths.src],
          // exclude: paths.modules,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.styl$/,
          use: [
            'style-loader',
            { loader: 'css-modules-typescript-loader' },
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[name]__[local]___[hash:base64:5]',
                },
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  ident: 'postcss',
                  plugins: [
                    ['postcss-preset-env', { stage: 3, autoprefixer: true }],
                  ],
                },
              },
            },
            {
              loader: 'stylus-loader',
            },
          ],
        },
        {
          test: /\.svg$/,
          exclude: paths.modules,
          oneOf: [
            {
              issuer: /\.(t|j)sx?$/,
              use: [
                {
                  loader: 'babel-loader',
                },
                {
                  loader: 'react-svg-loader',
                },
              ],
            },
            {
              loader: 'file-loader',
              options: {
                name: 'static/[name].[ext]',
                outputPath: 'images/',
              },
            },
          ],
        },
        {
          test: /\.(woff|woff2|eot|ttf)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: 'static/[name].[ext]',
              outputPath: 'images/',
            },
          },
        },
      ],
    },

    plugins: [
      new CleanWebpackPlugin({ verbose: true }),

      new webpack.ProvidePlugin({
        React: 'react',
      }),

      new webpack.DefinePlugin({
        isDEV: JSON.stringify(isDev),
        VERSION: JSON.stringify(pkg.version),
        MAPBOX_TOKEN: JSON.stringify(env.MAPBOX_TOKEN),
      }),

      new CopyWebpackPlugin({
        patterns: [
          {
            from: `${paths.assets}/*.css`,
            to: `${paths.build}/[name].css`,
          },
          {
            from: `${paths.assets}/fonts`,
            to: `${paths.build}/fonts`,
          },
          {
            from: `${paths.assets}/models`,
            to: `${paths.build}/models`,
          },
          {
            from: `${paths.assets}/images`,
            to: `${paths.build}/images`,
          },
          {
            from: `${paths.assets}/logo.svg`,
            to: paths.build,
          },
        ],
      }),

      !isDev &&
        new HtmlWebpackPartialsPlugin({
          path: `${paths.assets}/analytics.html`,
          location: 'body',
          priority: 'low',
        }),

      new HtmlWebpackPlugin({
        // lang: PAGE_LANG,
        // title: PAGE_TITLE,
        baseUrl: '/',
        filename: 'index.html',
        template: `${paths.assets}/index.html`,
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
      }),

      new MiniCssExtractPlugin({
        filename: isDev ? '[name].css' : '[name].[hash].css',
        chunkFilename: isDev ? '[id].css' : '[id].[hash].css',
      }),

      process.env.BUNDLE_ANALYZER &&
        new BundleAnalyzerPlugin({
          openAnalyzer: isDev,
          reportFilename: isDev,
        }),

      isDev && new webpack.HotModuleReplacementPlugin(),
      isDev && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
  };

  if (isDev) {
    Object.assign(config, {
      devtool: 'source-map',
      devServer: {
        hot: true,
        port: '3002',
        historyApiFallback: true,
        // open: true,
        devMiddleware: {
          writeToDisk: true,
        },
      },
    });
  }

  return config;
};
