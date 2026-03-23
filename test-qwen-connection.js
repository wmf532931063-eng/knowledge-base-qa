#!/usr/bin/env node

/**
 * 通义千问API连接测试脚本
 * 专门用于测试通义千问大模型的连接和配置
 */

require('dotenv').config();

const QWEN_CONFIG = {
  name: '通义千问 (阿里云)',
  baseUrl: process.env.NEXT_PUBLIC_LLM_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  apiKey: process.env.NEXT_PUBLIC_LLM_API_KEY,
  model: process.env.NEXT_PUBLIC_LLM_MODEL || 'qwen-turbo',
  models: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen2.5-32b-instruct']
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function logHeader(message) {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}${message}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

async function testQwenConnection() {
  logHeader('通义千问API连接测试');
  
  // 1. 检查环境变量
  logInfo('1. 检查环境变量配置...');
  console.log(`   Base URL: ${QWEN_CONFIG.baseUrl}`);
  console.log(`   API Key: ${QWEN_CONFIG.apiKey ? `${QWEN_CONFIG.apiKey.substring(0, 8)}...` : '未设置'}`);
  console.log(`   模型: ${QWEN_CONFIG.model}`);
  
  if (!QWEN_CONFIG.apiKey) {
    logError('未找到NEXT_PUBLIC_LLM_API_KEY环境变量');
    return false;
  }
  
  if (QWEN_CONFIG.apiKey.includes('your_') || QWEN_CONFIG.apiKey.includes('xxx')) {
    logWarning('请将API密钥替换为真实的通义千问API密钥');
    console.log('   获取地址: https://dashscope.console.aliyun.com/');
    return false;
  }
  
  // 2. 测试API连接
  logInfo('2. 测试API连接...');
  try {
    const response = await fetch(`${QWEN_CONFIG.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${QWEN_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      logSuccess(`API连接成功！状态码: ${response.status}`);
      
      // 检查可用的模型
      if (data.data && Array.isArray(data.data)) {
        const availableModels = data.data.map(m => m.id);
        console.log(`   可用模型数量: ${availableModels.length}`);
        
        // 检查配置的模型是否可用
        const modelAvailable = availableModels.some(m => 
          m.toLowerCase().includes('qwen') || 
          QWEN_CONFIG.models.some(qwenModel => m.toLowerCase().includes(qwenModel))
        );
        
        if (modelAvailable) {
          logSuccess(`通义千问模型可用`);
          // 显示匹配的模型
          const matchedModels = availableModels.filter(m => 
            m.toLowerCase().includes('qwen') || 
            QWEN_CONFIG.models.some(qwenModel => m.toLowerCase().includes(qwenModel))
          );
          console.log(`   匹配的模型: ${matchedModels.join(', ')}`);
        } else {
          logWarning(`未找到通义千问模型，可用模型: ${availableModels.slice(0, 5).join(', ')}...`);
        }
      }
      
      return true;
    } else {
      const errorText = await response.text();
      logError(`API连接失败: ${response.status} ${response.statusText}`);
      console.log(`   错误详情: ${errorText.substring(0, 200)}...`);
      return false;
    }
  } catch (error) {
    logError(`连接错误: ${error.message}`);
    return false;
  }
}

async function testQwenChat() {
  logInfo('3. 测试聊天功能（简单测试）...');
  
  try {
    const testQuestion = '你好，请用一句话介绍你自己';
    
    const response = await fetch(`${QWEN_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QWEN_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: QWEN_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: '你是一个乐于助人的助手。'
          },
          {
            role: 'user',
            content: testQuestion
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const answer = data.choices[0].message.content;
        logSuccess(`聊天测试成功！`);
        console.log(`   问题: "${testQuestion}"`);
        console.log(`   回答: "${answer.substring(0, 100)}${answer.length > 100 ? '...' : ''}"`);
        console.log(`   使用模型: ${data.model || QWEN_CONFIG.model}`);
        console.log(`   消耗token: ${data.usage?.total_tokens || '未知'}`);
        return true;
      } else {
        logWarning(`响应格式异常: ${JSON.stringify(data).substring(0, 200)}...`);
        return false;
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      logError(`聊天请求失败: ${response.status} ${response.statusText}`);
      if (errorData.error) {
        console.log(`   错误信息: ${JSON.stringify(errorData.error)}`);
      }
      return false;
    }
  } catch (error) {
    logError(`聊天测试错误: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  logHeader('通义千问大模型配置测试');
  
  console.log(`${colors.cyan}🎯 目标: 将大模型切换到通义千问${colors.reset}\n`);
  
  // 运行测试
  const connectionTest = await testQwenConnection();
  let chatTest = false;
  
  if (connectionTest) {
    chatTest = await testQwenChat();
  }
  
  // 总结
  logHeader('测试结果总结');
  
  if (connectionTest && chatTest) {
    logSuccess('🎉 所有测试通过！通义千问配置成功！');
    console.log('\n📋 下一步:');
    console.log('1. 启动应用: npm run dev');
    console.log('2. 访问: http://localhost:5173');
    console.log('3. 通义千问已配置完成，可以直接使用');
  } else if (connectionTest) {
    logWarning('⚠️  API连接成功，但聊天功能测试失败');
    console.log('\n🔧 可能的原因:');
    console.log('   - API密钥权限不足');
    console.log('   - 模型名称不正确');
    console.log('   - 账户余额不足');
  } else {
    logError('❌ 连接测试失败');
    console.log('\n🔧 解决方案:');
    console.log('1. 检查API密钥是否正确');
    console.log('2. 确认已开通通义千问API服务');
    console.log('3. 访问 https://dashscope.console.aliyun.com/ 获取API密钥');
    console.log('4. 确保账户有足够的额度');
  }
  
  // 显示当前配置
  console.log(`\n${colors.cyan}📋 当前配置:${colors.reset}`);
  console.log(`   Base URL: ${QWEN_CONFIG.baseUrl}`);
  console.log(`   模型: ${QWEN_CONFIG.model}`);
  console.log(`   API Key: ${QWEN_CONFIG.apiKey ? '已设置' : '未设置'}`);
  
  // 提供配置示例
  console.log(`\n${colors.cyan}💡 配置示例 (.env文件):${colors.reset}`);
  console.log(`   NEXT_PUBLIC_LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1`);
  console.log(`   NEXT_PUBLIC_LLM_API_KEY=sk-您的真实API密钥`);
  console.log(`   NEXT_PUBLIC_LLM_MODEL=qwen-turbo`);
}

// 运行所有测试
runAllTests().catch(error => {
  console.error(`${colors.red}测试过程出错: ${error.message}${colors.reset}`);
  process.exit(1);
});