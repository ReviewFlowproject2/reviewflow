// 全局代理注入 - 强制 Node.js 所有 HTTP/HTTPS 请求走 FLClash
const { bootstrap } = require('global-agent')
if (process.env.GLOBAL_AGENT_HTTP_PROXY || process.env.HTTP_PROXY) {
  bootstrap()
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // App Router已默认启用
  },
}

module.exports = nextConfig
