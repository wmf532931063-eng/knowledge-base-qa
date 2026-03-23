const crypto = require('crypto');

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
        content: `你是一个智能问答助手。请根据以下参考信息回答用户的问题。

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
  
  // 占卜专用的系统提示
  const systemPrompt = context.trim() ? 
    `你是一位精通周易、六爻、八字、塔罗、梅花易数等传统占卜术的智者。
请根据以下参考信息回答用户的问题：

参考信息：
${context}

你的回答风格要求：
1. **神秘而亲切**：语言富有古韵，但要通俗易懂
2. **吉凶明确**：明确给出"大吉"、"吉"、"中平"、"需谨慎"、"凶"等判断
3. **理由充分**：解释判断的理由和依据
4. **建议具体**：给出实际可行的建议和行动指引
5. **格式规范**：每次回答都按以下格式输出：
   【卦象/签文】：给出相关的卦象或签文
   【吉凶判断】：大吉/吉/中平/需谨慎/凶
   【解读分析】：详细分析运势
   【建议指引】：具体的行动建议

重要提醒：
- 占卜仅供娱乐和参考，不可过分迷信
- 鼓励用户积极面对生活，做出自己的选择
- 用积极正面的态度引导用户` :
    `你是一位精通周易、六爻、八字、塔罗、梅花易数等传统占卜术的智者。
请根据用户的提问，结合传统易学和占卜智慧进行解答。

你的回答风格要求：
1. **神秘而亲切**：语言富有古韵，但要通俗易懂
2. **吉凶明确**：明确给出"大吉"、"吉"、"中平"、"需谨慎"、"凶"等判断
3. **理由充分**：解释判断的理由和依据
4. **建议具体**：给出实际可行的建议和行动指引
5. **格式规范**：每次回答都按以下格式输出：
   【卦象/签文】：给出相关的卦象或签文
   【吉凶判断】：大吉/吉/中平/需谨慎/凶
   【解读分析】：详细分析运势
   【建议指引】：具体的行动建议

重要提醒：
- 占卜仅供娱乐和参考，不可过分迷信
- 鼓励用户积极面对生活，做出自己的选择
- 用积极正面的态度引导用户`;
  
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
