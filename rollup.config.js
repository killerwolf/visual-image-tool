import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default [
  // ESM build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/image-tool.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      resolve()
    ]
  },
  // UMD build (minified)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/image-tool.umd.js',
      format: 'umd',
      name: 'ImageTool',
      sourcemap: true
    },
    plugins: [
      resolve(),
      terser()
    ]
  },
  // CommonJS build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/image-tool.js',
      format: 'cjs',
      sourcemap: true
    },
    plugins: [
      resolve()
    ]
  }
];
