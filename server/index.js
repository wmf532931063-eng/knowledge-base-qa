require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const qaRoutes = require('./routes/qa');
const knowledgeRoutes = require('./routes/knowledge');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

// API 路由
app.use('/api/qa', qaRoutes);
app.use('/api/knowledge', knowledgeRoutes);

// 前端路由 - 返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
});

module.exports = app;
