// Railway极简测试服务器
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3001;

// 健康检查
app.get('/health', (req, res) => {
  console.log('健康检查被调用');
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Minimal server is healthy'
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: '极简测试服务器',
    version: '1.0.0',
    status: 'running'
  });
});

// 启动服务器 - 必须监听0.0.0.0
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 极简服务器启动成功`);
  console.log(`📡 监听地址: http://0.0.0.0:${PORT}`);
  console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 Node版本: ${process.version}`);
});

// 优雅关闭处理
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在优雅关闭...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

console.log('🚀 极简服务器启动脚本加载完成');