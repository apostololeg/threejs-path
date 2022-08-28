import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve'


export default {
  input: 'index.ts',
  output: {
    file: 'bundle.js',
    format: 'iife',
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      useTsconfigDeclarationDir: true,
      tsconfig: 'tsconfig.json',
    }),
    livereload(),
    serve({
      contentBase: '',
      port: 4141,
    })
  ],
};
