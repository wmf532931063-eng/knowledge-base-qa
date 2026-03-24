#!/usr/bin/env node

const { execSync } = require('child_process');
const https = require('https');

// 测试问题
const testQuestions = [
  "什么是四柱预测学？",
  "帮我算一下明天的运势",
  "预测一下我的工作前景",
  "四柱预测的定义是什么？",
  "四柱预测学是什么？",
  "什么是吉凶？"
];

console.log('🚀 测试LLM逻辑修改...\n');

// 测试本地代码逻辑
console.log('📋 本地代码检查:');
const fs = require('fs');
const llmServicePath = './server/services/llmService.js';
const llmServiceContent = fs.readFileSync(llmServicePath, 'utf8');

// 检查系统提示是否包含"绝对不要使用占卜格式"
const hasNoDivinationFormat = llmServiceContent.includes('绝对不要使用占卜格式');
const hasNoDivinationTitles = llmServiceContent.includes('【卦象/签文】') || llmServiceContent.includes('【吉凶判断】');

console.log(`  1. 系统提示包含"绝对不要使用占卜格式": ${hasNoDivinationFormat ? '✅' : '❌'}`);
console.log(`  2. 系统提示排除占卜标题: ${hasNoDivinationTitles ? '✅' : '❌'}`);

// 检查函数定义
const hasSingleFunction = (llmServiceContent.match(/function checkIfDivinationQuestion/g) || []).length === 1;
console.log(`  3. checkIfDivinationQuestion函数定义唯一: ${hasSingleFunction ? '✅' : '❌'}`);

console.log('\n🌐 测试Render服务器API...');

// 测试Render服务器
testQuestions.forEach((question, index) => {
  console.log(`\n  ${index + 1}. 问题: "${question}"`);
  
  const postData = JSON.stringify({ question });
  
  const options = {
    hostname: 'knowledge-base-qa.onrender.com',
    port: 443,
    path: '/api/qa/ask',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    },
    timeout: 30000
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log(`    状态码: ${res.statusCode}`);
        console.log(`    答案: ${result.answer ? result.answer.substring(0, 100) + '...' : '无答案'}`);
        
        // 检查是否包含占卜格式
        if (result.answer) {
          const hasDivinationFormat = result.answer.includes('【卦象/签文】') || 
                                     result.answer.includes('【吉凶判断】') ||
                                     result.answer.includes('【解读分析】') ||
                                     result.answer.includes('【建议指引】');
          console.log(`    包含占卜格式: ${hasDivinationFormat ? '❌' : '✅'}`);
        }
      } catch (error) {
        console.log(`    解析响应失败: ${error.message}`);
      }
    });
  });
  
  req.on('error', (error) => {
    console.log(`    请求失败: ${error.message}`);
  });
  
  req.on('timeout', () => {
    console.log(`    请求超时`);
    req.destroy();
  });
  
  req.write(postData);
  req.end();
  
  // 简单延迟避免请求过快
  setTimeout(() => {}, 1000);
});

console.log('\n📊 总结:');
console.log('1. 检查本地代码修改是否完整');
console.log('2. 测试Render服务器响应');
console.log('3. 验证回答格式是否符合要求（不含占卜格式）');