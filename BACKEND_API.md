# 后端API集成文档

## 概述

灵签占卜系统支持连接您提供的后端服务，包括大模型API和知识库API。

> **注意**: 向量搜索功能已经集成在知识库API中，不需要单独配置。您的知识库服务需要内部实现语义检索功能。

## 后端API规范

### 1. 知识库API

系统会向您的知识库服务发送检索请求：

**端点**: `{knowledgeBaseUrl}/api/search`

**方法**: POST

**请求头**:
```
Content-Type: application/json
Authorization: Bearer {knowledgeApiKey}
```

**请求体**:
```json
{
  "query": "用户的问题",
  "top_k": 4
}
```

**响应**:
```json
{
  "results": [
    {
      "content": "相关内容文本",
      "source": "来源名称"
    }
  ]
}
```

**重要说明**:
- 您的知识库服务需要内部实现**向量搜索/语义检索**功能
- 接收用户的查询文本后，使用向量嵌入模型计算相似度
- 返回最相关的文本片段和来源
- 前端不直接访问向量数据库，全部由您的后端处理

### 2. 大模型API

系统会向您的大模型服务发送请求：

**端点**: `{llmBaseUrl}/chat/completions`

**方法**: POST

**请求头**:
```
Content-Type: application/json
Authorization: Bearer {llmApiKey}
```

**请求体**:
```json
{
  "model": "模型名称",
  "messages": [
    {
      "role": "system",
      "content": "系统提示词..."
    },
    {
      "role": "user",
      "content": "用户问题"
    }
  ],
  "temperature": 0.8,
  "max_tokens": 2000
}
```

**响应** (OpenAI格式):
```json
{
  "choices": [
    {
      "message": {
        "content": "AI回答内容"
      }
    }
  ]
}
```

## 配置方式

### 方式1: 环境变量 (生产环境)

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_LLM_BASE_URL=https://your-llm-api.com/v1
NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key
NEXT_PUBLIC_LLM_MODEL=gpt-3.5-turbo

NEXT_PUBLIC_KNOWLEDGE_BASE_URL=https://your-knowledge-api.com
NEXT_PUBLIC_KNOWLEDGE_API_KEY=your_knowledge_api_key
```

### 方式2: UI配置 (开发/测试环境)

1. 点击右上角设置图标
2. 填写后端API配置
3. 点击"测试连接"验证
4. 点击"保存配置"

## 知识库内容建议

为了获得更好的占卜效果，您的知识库应包含：

### 推荐内容类型

1. **易经相关**
   - 六十四卦卦辞
   - 彖辞、象辞
   - 卦象解释

2. **占卜典籍**
   - 塔罗牌义
   - 六爻口诀
   - 八字基础
   - 紫微斗数

3. **传统智慧**
   - 黄帝内经节选
   - 易经解读
   - 风水基础

### 文档格式建议

- 使用纯文本或Markdown格式
- 每段内容不宜过长
- 清晰标注来源
- 保持内容准确性

## 测试API连接

使用配置面板中的"测试连接"功能验证您的API是否正常工作。

## 常见问题

### Q: 如何查看API调用日志？

A: 打开浏览器开发者工具，查看Network标签中的API请求。

### Q: 知识库返回空结果怎么办？

A: 检查知识库内容是否包含相关关键词，或调整检索参数。

### Q: 如何自定义占卜提示词？

A: 修改 `lib/backend-service.ts` 中的 `queryLLM` 函数的system prompt。

### Q: 支持哪些大模型？

A: 支持兼容OpenAI API格式的任何大模型，如：
- OpenAI GPT系列
- Azure OpenAI
- 国内大模型（通义千问、文心一言等，需适配）
- 自部署模型（通过API代理）

## 安全建议

1. **不要在前端暴露敏感信息**: 生产环境使用环境变量，而不是UI配置
2. **使用HTTPS**: 确保后端API使用HTTPS加密
3. **API Key管理**: 定期轮换API密钥
4. **访问控制**: 为API设置适当的访问控制和速率限制

## 示例后端实现

如果您需要自己实现后端，可以参考以下示例：

### 知识库服务 (Python/Flask)

```python
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/search', methods=['POST'])
def search():
    query = request.json.get('query')
    top_k = request.json.get('top_k', 4)

    # 从您的知识库搜索相关内容
    results = search_knowledge_base(query, top_k)

    return jsonify({
        'results': results
    })

if __name__ == '__main__':
    app.run(port=5000)
```

### 大模型代理 (Node.js)

```javascript
const express = require('express');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(express.json());
app.use(require('cors')());

app.post('/chat/completions', async (req, res) => {
    try {
        const response = await openai.createChatCompletion(req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000);
```

## 技术支持

如需技术支持或有任何问题，请查看项目GitHub Issues。
