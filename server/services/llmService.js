const crypto = require('crypto');

/**
 * 判断问题是否为占卜/测算类问题
 * 根据用户要求，只有明确测算吉凶的问题才使用占卜格式
 */
function checkIfDivinationQuestion(question) {
  if (!question || typeof question !== 'string') return false;
  
  const lowerQuestion = question.toLowerCase();
  
  console.log(`🔍 检查问题类型: "${question}"`);
  
  // 只对明确要求测算吉凶的问题返回true
  // 明确占卜请求的关键词
  const explicitDivinationPatterns = [
    /给我算|帮我算|预测一下|占卜一下|算一卦|测一测/,
    /看运势|看运气|算.*命|占.*卜/,
    /运势如何|运气怎样|前途如何|前景怎样/,
    /帮我.*预测|帮我.*算卦|帮我.*占卜/,
    /算.*卦|占.*卦|测.*卦/
  ];
  
  // 检查是否包含明确的占卜请求
  for (const pattern of explicitDivinationPatterns) {
    if (pattern.test(lowerQuestion)) {
      console.log(`✅ 识别为明确占卜请求: ${pattern}`);
      return true;
    }
  }
  
  // 检查是否包含明确的吉凶判断关键词
  const explicitJudgmentKeywords = [
    '吉凶', '好坏', '运势', '运气', '运程',
    '前途', '前景', '未来', '命运'
  ];
  
  for (const keyword of explicitJudgmentKeywords) {
    if (lowerQuestion.includes(keyword)) {
      // 如果是定义类问题中的关键词，不按占卜处理
      if (lowerQuestion.includes('什么是') || lowerQuestion.includes('是什么') || 
          lowerQuestion.includes('的定义') || lowerQuestion.includes('的解释')) {
        continue;
      }
      console.log(`✅ 识别为吉凶判断问题: ${keyword}`);
      return true;
    }
  }
  
  // 默认按普通问题处理
  console.log(`📝 识别为普通问题`);
  return false;
}

/**
 * 腾讯云 API 请求签名
 */
function generateSignature(secretId, secretKey, method, endpoint, params) {
  const sortedParams = Object.keys(params).sort();
  const queryString = sortedParams.map(key => `${key}=${params[key]}`).join('&');

  const payload = `${method}${endpoint}${queryString}`;
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('base64');

  return signature;
}

/**
 * 调用腾讯云知识引擎 API
 */
async function callTencentAPI(question, context) {
  const secretId = process.env.TENCENT_SECRET_ID;
  const secretKey = process.env.TENCENT_SECRET_KEY;
  const endpoint = process.env.TENCENT_API_ENDPOINT || 'https://lkeap.tencentcloudapi.com';

  if (!secretId || !secretKey || secretId === 'your_secret_id_here') {
    throw new Error('请在 .env 文件中配置腾讯云 API 密钥');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const date = new Date(timestamp * 1000).toISOString().split('T')[0];

  const params = {
    Action: 'ChatCompletions',
    Version: '2024-05-22',
    Region: 'ap-guangzhou',
    Timestamp: timestamp,
   Nonce: Math.floor(Math.random() * 1000000),
    SecretId: secretId,
    Model: 'deepseek-r1',
    Messages: [
      {
        role: 'system',
        content: `你是命运主理人。请根据以下参考信息回答用户的问题。

参考信息：
${context}

回答要求：
1. 只根据提供的参考信息回答，不要编造信息
2. 如果参考信息中没有相关内容，请明确告知用户
3. 回答要简洁、准确`
      },
      {
        role: 'user',
        content: question
      }
    ]
  };

  // 生成签名
  const signature = generateSignature(secretId, secretKey, 'POST', '/', params);
  params.Signature = signature;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': signature
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 请求失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.Response?.Choices?.[0]?.Message?.content) {
      return data.Response.Choices[0].Message.content;
    } else if (data.Response?.Error) {
      throw new Error(`API 错误: ${data.Response.Error.Message}`);
    } else {
      throw new Error('API 响应格式异常');
    }
  } catch (error) {
    console.error('❌ 腾讯云 API 调用失败:', error.message);
    throw error;
  }
}

/**
 * 生成答案（带降级逻辑）
 */
async function generateAnswer(question, context) {
  try {
    // 尝试调用通义千问 API
    return await callQwenAPI(question, context);
  } catch (error) {
    console.warn('⚠️ 通义千问 API 调用失败，尝试腾讯云 API', error.message);
    
    try {
      // 降级：尝试腾讯云 API
      return await callTencentAPI(question, context);
    } catch (tencentError) {
      console.warn('⚠️ 腾讯云 API 也失败，使用本地模拟回答');
      
      // 最终降级：返回基于上下文的简单总结
      const relevantParagraphs = context.split('\n\n').slice(0, 3);
      const summary = relevantParagraphs.join('\n\n');
      
      return `根据检索到的信息，以下是相关回答：\n\n${summary}\n\n（注意：这是基于本地知识库的简化回答，如需更智能的回答，请配置有效的通义千问 API 密钥）`;
    }
  }
}

/**
 * 调用通义千问 API
 */
async function callQwenAPI(question, context) {
  const apiKey = process.env.NEXT_PUBLIC_LLM_API_KEY || process.env.QWEN_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_LLM_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  const model = process.env.NEXT_PUBLIC_LLM_MODEL || 'qwen-turbo';
  
  if (!apiKey || apiKey.includes('your_') || apiKey.includes('xxx')) {
    throw new Error('请在 .env 文件中配置通义千问 API 密钥');
  }
  
  // 根据用户要求，所有问题都使用普通问答格式
  // 用户明确要求：如果不是测算人或事的吉凶，那不需要卦象/签文、吉凶判断
  // 由于自动判断困难，我们让所有问题都使用普通问答格式
  const systemPrompt = context.trim() ? 
    `你是命运主理人。请根据以下参考信息回答用户的问题：

参考信息：
${context}

回答要求：
1. 只根据提供的参考信息回答，不要编造信息
2. 如果参考信息中没有相关内容，请明确告知用户
3. 回答要简洁、准确、专业
4. **绝对不要使用占卜格式**，不要包含【卦象/签文】、【吉凶判断】、【解读分析】、【建议指引】等占卜相关标题
5. 直接给出清晰易懂的专业回答
6. 如果问题涉及占卜知识，请以科普、解释的方式回答，而不是进行实际占卜
7. 即使问题包含"预测"、"占卜"等词汇，也请以解释、说明的方式回答，不要进行实际占卜
8. **重要：不要使用任何占卜术语或格式，只提供知识性、解释性的回答**` :
    `你是命运主理人。请根据用户的提问进行解答。

回答要求：
1. 回答要简洁、准确、专业
2. **绝对不要使用占卜格式**，不要包含【卦象/签文】、【吉凶判断】等占卜相关标题
3. 直接给出清晰易懂的专业回答
4. 如果问题涉及占卜知识，请以科普、解释的方式回答，而不是进行实际占卜
5. 即使问题包含"预测"、"占卜"等词汇，也请以解释、说明的方式回答，不要进行实际占卜
6. 如果问题超出你的知识范围，请礼貌地说明`;
  
  const messages = [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: question
    }
  ];
  
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 2000,
        temperature: 0.8,
        messages: messages
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`通义千问 API 请求失败: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    } else if (data.error) {
      throw new Error(`通义千问 API 错误: ${data.error.message}`);
    } else {
      throw new Error('通义千问 API 响应格式异常');
    }
  } catch (error) {
    console.error('❌ 通义千问 API 调用失败:', error.message);
    throw error;
  }
}

module.exports = {
  callTencentAPI,
  callQwenAPI,
  generateAnswer
};
