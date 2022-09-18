import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';
import injectProcessEnv from 'rollup-plugin-inject-process-env';

const env = require('dotenv').config();

export default {
  input: 'src/client/index.ts',
  output: {
    file: 'src/client/public/bundle.js',
    format: 'iife',
  },
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    typescript({
      useTsconfigDeclarationDir: true,
      tsconfig: 'tsconfig.json',
    }),
    injectProcessEnv({
      PORT: env.PORT,
    }),
    env.LIVERELOAD && livereload(),
    serve({
      contentBase: '',
      port: 4141,
    }),
  ],
};
