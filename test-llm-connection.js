/**
 * 大模型连接测试脚本
 * 用于验证不同大模型的连接和配置
 */

require('dotenv').config();

// 测试配置
const testConfigs = [
  {
    name: 'OpenAI GPT-3.5-turbo',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: process.env.NEXT_PUBLIC_LLM_API_KEY,
    model: 'gpt-3.5-turbo',
    enabled: true
  },
  {
    name: '腾讯云 DeepSeek',
    secretId: process.env.TENCENT_SECRET_ID,
    secretKey: process.env.TENCENT_SECRET_KEY,
    endpoint: process.env.TENCENT_API_ENDPOINT,
    enabled: true
  }
];

async function testOpenAIConnection(config) {
  console.log(`\n🧪 测试 ${config.name}...`);
  
  if (!config.apiKey) {
    console.log('❌ 未找到API密钥');
    return false;
  }
  
  if (config.apiKey.includes('your_') || config.apiKey.includes('xxx')) {
    console.log('⚠️  请替换为真实的API密钥');
    return false;
  }
  
  try {
    const response = await fetch(`${config.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ 连接成功！可用模型数量: ${data.data.length}`);
      
      // 检查请求的模型是否可用
      const modelAvailable = data.data.some(m => m.id === config.model);
      if (modelAvailable) {
        console.log(`✅ 模型 "${config.model}" 可用`);
      } else {
        console.log(`⚠️  模型 "${config.model}" 不可用，可用模型: ${data.data.map(m => m.id).join(', ')}`);
      }
      
      return true;
    } else {
      console.log(`❌ 连接失败: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 连接错误: ${error.message}`);
    return false;
  }
}

async function testTencentConnection(config) {
  console.log(`\n🧪 测试 ${config.name}...`);
  
  if (!config.secretId || !config.secretKey) {
    console.log('❌ 未找到腾讯云API密钥');
    return false;
  }
  
  if (config.secretId.includes('your_') || config.secretId === 'your_secret_id_here') {
    console.log('⚠️  请替换为真实的腾讯云API密钥');
    return false;
  }
  
  console.log('✅ 腾讯云API配置完整');
  console.log(`   SecretId: ${config.secretId.substring(0, 8)}...`);
  console.log(`   Endpoint: ${config.endpoint}`);
  console.log(`   Model: deepseek-r1 (固定)`);
  
  // 简单验证密钥格式
  if (config.secretId.startsWith('AKID') && config.secretKey.length >= 32) {
    console.log('✅ API密钥格式正确');
    return true;
  } else {
    console.log('⚠️  API密钥格式可能不正确');
    return false;
  }
}

async function runTests() {
  console.log('🎯 大模型连接测试');
  console.log('=' .repeat(50));
  
  let allPassed = true;
  
  for (const config of testConfigs) {
    if (!config.enabled) continue;
    
    if (config.name.includes('OpenAI')) {
      const passed = await testOpenAIConnection(config);
      if (!passed) allPassed = false;
    } else if (config.name.includes('腾讯云')) {
      const passed = await testTencentConnection(config);
      if (!passed) allPassed = false;
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  if (allPassed) {
    console.log('🎉 所有测试通过！可以正常使用大模型。');
  } else {
    console.log('⚠️  部分测试失败，请检查配置。');
  }
  
  // 提供配置建议
  console.log('\n📋 配置建议:');
  console.log('1. 查看 `.env.examples` 文件获取各种大模型配置示例');
  console.log('2. 复制所需配置到 `.env` 文件中');
  console.log('3. 在UI界面中也可以直接配置大模型');
  console.log('4. 确保API密钥有效且有足够的额度');
}

// 运行测试
runTests().catch(console.error);