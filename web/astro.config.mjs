// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    server: {
      fs: {
        allow: ['..'],
      },
      // 开发时把同源 /api/chat 转到 DeepSeek 代理，避免浏览器直连 127.0.0.1:8787 失败
      proxy: {
        '/api/chat': {
          target: process.env.CHAT_PROXY_TARGET || 'http://127.0.0.1:8787',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/chat/, '/chat'),
        },
      },
    },
  },
});

