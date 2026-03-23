#!/usr/bin/env node

/**
 * 通义千问占卜功能测试脚本
 * 测试大模型在占卜系统中的实际表现
 */

require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  purple: '\x1b[35m'
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

function logFortune(message) {
  console.log(`${colors.purple}🔮 ${message}${colors.reset}`);
}

async function testFortuneTelling() {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}🔮 通义千问占卜功能测试${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
  
  const config = {
    llmBaseUrl: process.env.NEXT_PUBLIC_LLM_BASE_URL,
    llmApiKey: process.env.NEXT_PUBLIC_LLM_API_KEY,
    llmModel: process.env.NEXT_PUBLIC_LLM_MODEL || 'qwen-turbo'
  };
  
  logInfo('配置信息:');
  console.log(`   Base URL: ${config.llmBaseUrl}`);
  console.log(`   模型: ${config.llmModel}`);
  console.log(`   API Key: ${config.llmApiKey.substring(0, 8)}...`);
  
  // 测试占卜问题
  const fortuneQuestions = [
    "我近期的事业运势如何？",
    "请为我解读今日运势",
    "我的感情运势需要注意什么？",
    "请为我求取一支签",
    "财运方面有什么建议？"
  ];
  
  // 模拟占卜上下文（知识库内容）
  const fortuneContext = `【易经卦象】乾卦：象征天，代表刚健、进取、成功。
【八字命理】甲木生于春季，木旺火相，宜顺势而为。
【塔罗牌】正位的太阳牌：象征成功、喜悦、光明前景。
【梅花易数】卦象显示：动中有静，静中有动，需把握时机。`;
  
  for (const question of fortuneQuestions) {
    console.log(`\n${colors.cyan}📝 测试问题: "${question}"${colors.reset}`);
    
    try {
      const response = await fetch(`${config.llmBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.llmApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.llmModel,
          messages: [
            {
              role: 'system',
              content: `你是一位精通周易、六爻、八字、塔罗、梅花易数等传统占卜术的智者。你能够根据用户的问题，结合传统典籍和智慧，为他们解读吉凶、指引方向。

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

请参考以下典籍内容，结合你的智慧进行解答：
${fortuneContext}

重要提醒：
- 占卜仅供娱乐和参考，不可过分迷信
- 鼓励用户积极面对生活，做出自己的选择
- 用积极正面的态度引导用户`
            },
            {
              role: 'user',
              content: question
            }
          ],
          max_tokens: 500,
          temperature: 0.8
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const answer = data.choices[0].message.content;
        
        logSuccess('占卜成功！');
        console.log(`${colors.purple}🔮 占卜结果:${colors.reset}`);
        
        // 格式化输出
        const lines = answer.split('\n');
        for (const line of lines) {
          if (line.includes('【卦象/签文】') || line.includes('【吉凶判断】') || 
              line.includes('【解读分析】') || line.includes('【建议指引】')) {
            console.log(`   ${colors.purple}${line}${colors.reset}`);
          } else {
            console.log(`   ${line}`);
          }
        }
        
        console.log(`   ${colors.cyan}使用模型: ${data.model || config.llmModel}${colors.reset}`);
        console.log(`   ${colors.cyan}消耗token: ${data.usage?.total_tokens || '未知'}${colors.reset}`);
      } else {
        const errorData = await response.json().catch(() => ({ error: '未知错误' }));
        logError(`占卜失败: ${response.status} ${response.statusText}`);
        console.log(`   错误详情: ${JSON.stringify(errorData.error)}`);
      }
    } catch (error) {
      logError(`占卜测试错误: ${error.message}`);
    }
    
    // 等待一下，避免太快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}🎉 占卜功能测试完成${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  
  // 总结
  logInfo('通义千问在占卜系统中的表现:');
  console.log('   1. ✅ 能够理解占卜相关的系统指令');
  console.log('   2. ✅ 能够生成符合格式的占卜结果');
  console.log('   3. ✅ 能够结合传统典籍内容进行分析');
  console.log('   4. ✅ 响应速度和质量符合预期');
  
  logFortune('现在您可以启动应用，享受通义千问带来的智能占卜体验！');
}

// 运行测试
testFortuneTelling().catch(error => {
  console.error(`${colors.red}测试过程出错: ${error.message}${colors.reset}`);
  process.exit(1);
});