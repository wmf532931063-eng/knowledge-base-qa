/**
 * 环境变量验证器
 * 确保所有必要的环境变量都已正确配置
 */

function validateEnvironment() {
  console.log('🔍 验证环境变量配置...');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_LLM_API_KEY',
    'NEXT_PUBLIC_LLM_BASE_URL',
    'NEXT_PUBLIC_LLM_MODEL',
    'PORT'
  ];
  
  const missingVars = [];
  const invalidVars = [];
  
  for (const varName of requiredEnvVars) {
    const value = process.env[varName];
    
    if (!value) {
      missingVars.push(varName);
      continue;
    }
    
    // 特殊验证规则
    if (varName === 'NEXT_PUBLIC_LLM_API_KEY') {
      if (value.includes('your_') || value.includes('xxx') || value.length < 20) {
        invalidVars.push(`${varName}: "${value}" (格式不正确)`);
      }
    }
    
    if (varName === 'NEXT_PUBLIC_LLM_BASE_URL') {
      if (!value.startsWith('http')) {
        invalidVars.push(`${varName}: "${value}" (不是有效的URL)`);
      }
    }
  }
  
  if (missingVars.length > 0) {
    console.error('❌ 缺少必要环境变量:', missingVars.join(', '));
    console.error('💡 请在.env文件或Render环境变量中设置这些变量');
    return false;
  }
  
  if (invalidVars.length > 0) {
    console.error('❌ 环境变量格式不正确:', invalidVars.join(', '));
    return false;
  }
  
  console.log('✅ 环境变量验证通过');
  console.log('   API密钥:', process.env.NEXT_PUBLIC_LLM_API_KEY);
  console.log('   API地址:', process.env.NEXT_PUBLIC_LLM_BASE_URL);
  console.log('   模型:', process.env.NEXT_PUBLIC_LLM_MODEL);
  console.log('   端口:', process.env.PORT);
  
  return true;
}

function getEnvironmentSummary() {
  const envSummary = {
    apiKey: process.env.NEXT_PUBLIC_LLM_API_KEY,
    baseUrl: process.env.NEXT_PUBLIC_LLM_BASE_URL,
    model: process.env.NEXT_PUBLIC_LLM_MODEL,
    port: process.env.PORT,
    embeddingModel: process.env.EMBEDDING_MODEL,
    nodeEnv: process.env.NODE_ENV
  };
  
  return envSummary;
}

module.exports = {
  validateEnvironment,
  getEnvironmentSummary
};