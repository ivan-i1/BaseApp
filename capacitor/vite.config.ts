import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset URLs: the native shells serve dist/ from their own scheme, not a server root.
  base: './',
  // The game code lives in the Expo app's src/engines/phaser/ one directory up.
  server: { fs: { allow: ['..'] } },
  // Phaser alone is ~1.3 MB minified and loads once from local files, so the 500 kB web warning does not apply.
  build: { target: 'es2020', outDir: 'dist', emptyOutDir: true, chunkSizeWarningLimit: 2000 },
});
