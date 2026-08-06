// @ts-check
import { defineConfig } from 'astro/config';

// 本地默认根路径；GitHub Actions 构建时注入 SITE_URL / BASE_PATH=/cloudcursor/
const site = process.env.SITE_URL || 'http://localhost:4321';
const base = process.env.BASE_PATH || '/';

// https://astro.build/config
export default defineConfig({
  site,
  base,
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
