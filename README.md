# AI 知识库问答系统

基于 React + Node.js + 腾讯云大模型的知识库问答系统。

## 功能特性

- 📚 支持 Markdown 和 TXT 文档
- 🔍 向量相似度检索
- 🤖 腾讯云 DeepSeek 大模型集成
- 💬 友好的问答界面
- 📝 问答历史记录

## 快速开始

### 1. 安装依赖

```bash
npm run install:all
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入您的腾讯云 API 密钥：

```env
TENCENT_SECRET_ID=您的SecretId
TENCENT_SECRET_KEY=您的SecretKey
TENCENT_API_ENDPOINT=https://lkeap.tencentcloudapi.com
PORT=3001
```

### 3. 启动服务

```bash
npm run dev
```

- 前端: http://localhost:5173
- 后端: http://localhost:3001

### 4. 使用流程

1. 在 `knowledge-base/` 目录下添加您的文档（.md 或 .txt 格式）
2. 打开浏览器访问 http://localhost:5173
3. 点击"重建知识库"按钮构建索引
4. 输入问题并发送

## 项目结构

```
.
├── client/                 # React 前端
│   ├── src/
│   │   ├── App.jsx        # 主组件
│   │   └── index.css     # 样式
│   └── package.json
├── server/                 # Node.js 后端
│   ├── index.js           # 服务入口
│   ├── routes/            # API 路由
│   │   ├── qa.js          # 问答接口
│   │   └── knowledge.js   # 知识库管理
│   └── services/           # 业务服务
│       ├── documentParser.js  # 文档解析
│       ├── vectorStore.js      # 向量存储
│       └── llmService.js       # LLM 服务
├── knowledge-base/        # 知识库文档目录
│   └── example.md         # 示例文档
├── .env                   # 环境变量
└── package.json
```

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/qa/ask` | POST | 问答接口 |
| `/api/knowledge/stats` | GET | 获取知识库状态 |
| `/api/knowledge/rebuild` | POST | 重建知识库 |
| `/api/knowledge/files` | GET | 获取文件列表 |

## 技术栈

- **前端**: React + Vite + Axios
- **后端**: Node.js + Express
- **向量数据库**: ChromaDB
- **嵌入模型**: Xenova Transformers
- **大模型**: 支持多种大模型（OpenAI兼容格式）

## 🎯 大模型更换指南

本项目支持多种大模型，您可以轻松更换到您喜欢的模型：

### 🔧 更换方式

#### 方式一：通过UI界面配置（推荐）
1. 访问应用首页
2. 点击右上角设置按钮
3. 在"大模型配置"中填写：
   - **API Base URL**: 模型API地址
   - **API Key**: 您的API密钥
   - **模型名称**: 如 gpt-3.5-turbo

#### 方式二：通过环境变量配置
1. 复制 `.env.examples` 为 `.env`
2. 根据您选择的模型取消注释相应配置
3. 填写您的API密钥
4. 重启应用

### 🤖 支持的大模型

#### ✅ OpenAI兼容格式（推荐）
- **OpenAI GPT系列**: GPT-3.5-turbo, GPT-4, GPT-4o
- **Claude API**: Claude-3系列
- **Azure OpenAI**: 微软托管服务
- **国内大模型**:
  - 通义千问（阿里云）
  - 文心一言（百度）
  - 智谱GLM（清华）
  - 月之暗面（Kimi）
  - DeepSeek（深度求索）
- **Ollama**: 本地部署模型

#### 🔄 腾讯云DeepSeek（原配置）
- 通过 `.env` 中的腾讯云配置
- 模型固定为 DeepSeek-r1

### 📋 快速配置示例

#### 🎯 通义千问（当前已配置）
```env
# 已预设为通义千问配置，只需替换API密钥
NEXT_PUBLIC_LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
NEXT_PUBLIC_LLM_API_KEY=sk-您的真实API密钥  # ← 替换这里
NEXT_PUBLIC_LLM_MODEL=qwen-turbo            # 可选：qwen-plus, qwen-max
```

#### OpenAI GPT-3.5-turbo
```env
NEXT_PUBLIC_LLM_BASE_URL=https://api.openai.com/v1
NEXT_PLIC_LLM_API_KEY=sk-xxx
NEXT_PUBLIC_LLM_MODEL=gpt-3.5-turbo
```

#### Claude API
```env
NEXT_PUBLIC_LLM_BASE_URL=https://api.anthropic.com
NEXT_PUBLIC_LLM_API_KEY=sk-ant-xxx
NEXT_PUBLIC_LLM_MODEL=claude-3-sonnet-20240229
```

### 🔍 验证配置
1. 启动应用
2. 在界面中配置大模型
3. 尝试提问，检查是否正常响应
4. 如果遇到问题，查看控制台日志
