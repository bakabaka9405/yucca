import { defineConfig } from '@farmfe/core';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  vitePlugins: [vue()],
  compilation: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    }
  }
});
