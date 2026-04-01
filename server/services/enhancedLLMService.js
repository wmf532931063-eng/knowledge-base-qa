/**
 * 增强版大模型服务
 * 支持多提供商和容错机制
 */

const crypto = require('crypto');

class EnhancedLLMService {
  constructor() {
    this.providers = [
      {
        name: '通义千问',
        call: this.callQwenAPI,
        priority: 1,
        enabled: true
      },
      {
        name: '腾讯云DeepSeek',
        call: this.callTencentAPI,
        priority: 2,
        enabled: process.env.TENCENT_SECRET_ID && process.env.TENCENT_SECRET_KEY
      },
      {
        name: '本地模拟',
        call: this.callLocalSimulation,
        priority: 3,
        enabled: true
      }
    ];
    
    // 连接统计
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      providerStats: {}
    };
    
    this.providers.forEach(provider => {
      this.stats.providerStats[provider.name] = {
        requests: 0,
        successes: 0,
        failures: 0,
        averageLatency: 0
      };
    });
  }
  
  /**
   * 生成答案（带容错机制）
   */
  async generateAnswer(question, context, maxRetries = 2) {
    this.stats.totalRequests++;
    
    // 过滤启用的提供商并按优先级排序
    const availableProviders = this.providers
      .filter(p => p.enabled)
      .sort((a, b) => a.priority - b.priority);
    
    // 记录最终使用的提供商
    let usedProvider = null;
    let fallbackReason = '';
    
    // 尝试所有启用的提供商
    for (const provider of availableProviders) {
      const providerName = provider.name;
      
      // 跳过本地模拟，除非所有其他提供商都失败
      if (providerName === '本地模拟' && availableProviders.length > 1) {
        continue;
      }
      
      // 记录提供商调用
      this.stats.providerStats[providerName].requests++;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔍 [${providerName}] 尝试生成答案 (第${attempt}次尝试)`);
          
          const startTime = Date.now();
          const answer = await provider.call.call(this, question, context);
          const endTime = Date.now();
          const latency = endTime - startTime;
          
          // 更新统计
          this.stats.successfulRequests++;
          this.stats.providerStats[providerName].successes++;
          
          // 更新平均延迟
          const stats = this.stats.providerStats[providerName];
          stats.averageLatency = (stats.averageLatency * (stats.successes - 1) + latency) / stats.successes;
          
          usedProvider = providerName;
          
          console.log(`✅ [${providerName}] 生成答案成功 (延迟: ${latency}ms)`);
          return answer;
          
        } catch (error) {
          console.warn(`⚠️ [${providerName}] 调用失败 (第${attempt}次尝试):`, error.message);
          
          this.stats.providerStats[providerName].failures++;
          
          if (attempt < maxRetries) {
            // 指数退避重试
            const delay = Math.pow(2, attempt - 1) * 1000;
            console.log(`⏳ [${providerName}] 等待 ${delay}ms 后重试...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            this.stats.failedRequests++;
            fallbackReason = `${providerName}: ${error.message}`;
          }
        }
      }
    }
    
    // 所有提供商都失败，使用本地模拟作为最后的手段
    try {
      console.log('🔄 所有提供商失败，尝试本地模拟...');
      const answer = await this.callLocalSimulation(question, context);
      console.log('✅ 本地模拟成功');
      return answer;
    } catch (error) {
      console.error('❌ 所有提供商包括本地模拟都失败');
      return this.getFallbackAnswer(question, context, fallbackReason);
    }
  }
  
  /**
   * 通义千问 API 调用
   */
  async callQwenAPI(question, context) {
    const apiKey = process.env.NEXT_PUBLIC_LLM_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_LLM_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    const model = process.env.NEXT_PUBLIC_LLM_MODEL || 'qwen-turbo';
    
    if (!apiKey || apiKey.includes('your_') || apiKey.includes('xxx')) {
      throw new Error('通义千问 API 密钥未正确配置');
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
    
    try {
      const response = await fetch(baseUrl + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: `你是命运主理人。请根据以下参考信息回答用户的问题：

参考信息：
${context}

回答要求：
1. 只根据提供的参考信息回答，不要编造信息
2. 如果参考信息中没有相关内容，请明确告知用户
3. 回答要简洁、准确、专业
4. **绝对不要使用占卜格式**，不要包含【卦象/签文】、【吉凶判断】、【解读分析】、【建议指引】等占卜相关标题
5. 直接给出清晰易懂的专业回答`
            },
            { role: 'user', content: question }
          ],
          max_tokens: 2000,
          temperature: 0.7
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`通义千问 API 请求失败: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      } else {
        throw new Error('通义千问 API 响应格式异常');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      // 如果是网络超时，提供更具体的错误信息
      if (error.name === 'AbortError') {
        throw new Error('通义千问 API 请求超时 (15秒)');
      }
      throw error;
    }
  }
  
  /**
   * 腾讯云 API 调用
   */
  async callTencentAPI(question, context) {
    const secretId = process.env.TENCENT_SECRET_ID;
    const secretKey = process.env.TENCENT_SECRET_KEY;
    const endpoint = process.env.TENCENT_API_ENDPOINT || 'https://lkeap.tencentcloudapi.com';
    
    if (!secretId || !secretKey || secretId.includes('your_')) {
      throw new Error('腾讯云 API 密钥未配置');
    }
    
    const timestamp = Math.floor(Date.now() / 1000);
    
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
          content: `你是命运主理人。请根据以下参考信息回答用户的问题：

参考信息：
${context}

回答要求：
1. 只根据提供的参考信息回答，不要编造信息
2. 如果参考信息中没有相关内容，请明确告知用户
3. 回答要简洁、准确`
        },
        { role: 'user', content: question }
      ]
    };
    
    // 生成签名
    const signature = this.generateSignature(secretId, secretKey, 'POST', '/', params);
    params.Signature = signature;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': signature
        },
        body: JSON.stringify(params),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`腾讯云 API 请求失败: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.Response?.Choices?.[0]?.Message?.content) {
        return data.Response.Choices[0].Message.content;
      } else if (data.Response?.Error) {
        throw new Error(`腾讯云 API 错误: ${data.Response.Error.Message}`);
      } else {
        throw new Error('腾讯云 API 响应格式异常');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('腾讯云 API 请求超时 (15秒)');
      }
      throw error;
    }
  }
  
  /**
   * 本地模拟回答
   */
  async callLocalSimulation(question, context) {
    // 基于上下文的简单总结
    const relevantParagraphs = context.split('\n\n').slice(0, 3);
    const summary = relevantParagraphs.join('\n\n');
    
    // 添加友好的提示
    return `基于本地知识库的简化回答：\n\n${summary}\n\n💡 提示：大模型服务暂时不可用，这是基于本地知识库的简化回答。如需更智能的回答，请稍后重试或联系管理员。`;
  }
  
  /**
   * 最终的降级答案
   */
  getFallbackAnswer(question, context, reason) {
    return `抱歉，当前无法处理您的问题。\n\n原因：${reason}\n\n请尝试以下操作：\n1. 稍后重试\n2. 联系系统管理员\n3. 检查网络连接\n\n问题上下文：\n${context.substring(0, 300)}...`;
  }
  
  /**
   * 腾讯云 API 签名生成
   */
  generateSignature(secretId, secretKey, method, endpoint, params) {
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
   * 获取服务统计信息
   */
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalRequests > 0 
        ? (this.stats.successfulRequests / this.stats.totalRequests * 100).toFixed(2) + '%'
        : '0%'
    };
  }
  
  /**
   * 测试所有提供商的连接
   */
  async testAllProviders() {
    const results = [];
    
    for (const provider of this.providers.filter(p => p.enabled)) {
      try {
        const startTime = Date.now();
        const answer = await provider.call.call(this, '连接测试', '这是一个连接测试');
        const endTime = Date.now();
        
        results.push({
          provider: provider.name,
          status: 'connected',
          latency: endTime - startTime,
          response: answer.substring(0, 50) + '...'
        });
      } catch (error) {
        results.push({
          provider: provider.name,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    return results;
  }
}

// 创建单例实例
const llmServiceInstance = new EnhancedLLMService();

module.exports = llmServiceInstance;