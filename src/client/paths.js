import path from 'path';

const src = path.resolve('src/client');

export default {
  src,
  build: path.resolve(src, 'build/'),
  assets: path.resolve(src, 'assets/'),
  modules: path.resolve('node_modules'),
};
