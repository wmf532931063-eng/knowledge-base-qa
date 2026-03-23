#!/usr/bin/env node

/**
 * 检查知识库AI问答系统部署状态
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

console.log('🔍 检查知识库AI问答系统部署状态...\n');
console.log('📅 检查时间:', new Date().toLocaleString());
console.log('==========================================\n');

// 检查函数
const checks = [];

// 1. 检查本地项目状态
checks.push({
  name: '本地项目结构',
  check: () => {
    const required = [
      'package.json',
      'server/index.js',
      'client/package.json',
      '.env'
    ];
    
    const results = {};
    required.forEach(file => {
      results[file] = fs.existsSync(file);
    });
    
    const allExist = Object.values(results).every(v => v);
    return {
      passed: allExist,
      details: results
    };
  }
});

// 2. 检查Git仓库
checks.push({
  name: 'Git仓库状态',
  check: () => {
    try {
      // 检查.git目录
      const hasGitDir = fs.existsSync('.git');
      
      // 检查是否有远程仓库
      let hasRemote = false;
      let remoteUrl = '';
      
      if (hasGitDir) {
        try {
          const remoteOutput = execSync('git remote -v', { encoding: 'utf8' });
          hasRemote = remoteOutput.trim().length > 0;
          if (hasRemote) {
            const lines = remoteOutput.split('\n');
            remoteUrl = lines[0].split('\t')[1];
          }
        } catch (e) {
          // 忽略错误
        }
      }
      
      return {
        passed: hasGitDir && hasRemote,
        details: {
          '有.git目录': hasGitDir,
          '有远程仓库': hasRemote,
          '远程地址': remoteUrl || '未设置'
        }
      };
    } catch (error) {
      return {
        passed: false,
        details: { error: error.message }
      };
    }
  }
});

// 3. 检查部署配置文件
checks.push({
  name: '部署配置文件',
  check: () => {
    const deployFiles = [
      'deploy.sh',
      'deploy-free.sh',
      'railway.toml',
      'vercel.json',
      'railway.json',
      'Dockerfile'
    ];
    
    const results = {};
    deployFiles.forEach(file => {
      results[file] = fs.existsSync(file);
    });
    
    const hasDeployFiles = Object.values(results).some(v => v);
    return {
      passed: hasDeployFiles,
      details: results
    };
  }
});

// 4. 检查本地服务状态
checks.push({
  name: '本地服务状态',
  check: () => {
    const ports = [3001, 5173];
    const results = {};
    
    ports.forEach(port => {
      try {
        // 简单检查端口是否被占用
        execSync(`lsof -i :${port} > /dev/null 2>&1`, { stdio: 'ignore' });
        results[`端口 ${port}`] = true;
      } catch (e) {
        results[`端口 ${port}`] = false;
      }
    });
    
    const allRunning = Object.values(results).every(v => v);
    return {
      passed: allRunning,
      details: results
    };
  }
});

// 5. 检查环境变量
checks.push({
  name: '环境变量配置',
  check: () => {
    const envFiles = ['.env', '.env.example', '.env.production.example'];
    const results = {};
    
    envFiles.forEach(file => {
      results[file] = fs.existsSync(file);
    });
    
    // 检查.env文件是否有内容
    if (results['.env']) {
      try {
        const envContent = fs.readFileSync('.env', 'utf8');
        const hasApiKey = envContent.includes('NEXT_PUBLIC_LLM_API_KEY=') && 
                         !envContent.includes('你的API密钥');
        results['API密钥已配置'] = hasApiKey;
      } catch (e) {
        results['API密钥检查'] = false;
      }
    }
    
    const hasEnvFile = results['.env'];
    return {
      passed: hasEnvFile,
      details: results
    };
  }
});

// 6. 检查项目依赖
checks.push({
  name: '项目依赖',
  check: () => {
    const nodeModules = [
      'node_modules',
      'client/node_modules'
    ];
    
    const results = {};
    nodeModules.forEach(dir => {
      results[dir] = fs.existsSync(dir);
    });
    
    const allInstalled = Object.values(results).every(v => v);
    return {
      passed: allInstalled,
      details: results
    };
  }
});

// 运行所有检查
let allPassed = true;
const summary = [];

checks.forEach((check, index) => {
  console.log(`${index + 1}. ${check.name}...`);
  
  try {
    const result = check.check();
    
    if (result.passed) {
      console.log('   ✅ 通过');
    } else {
      console.log('   ❌ 失败');
      allPassed = false;
    }
    
    // 显示详细信息
    if (result.details) {
      Object.entries(result.details).forEach(([key, value]) => {
        console.log(`      ${key}: ${value === true ? '✅' : value === false ? '❌' : value}`);
      });
    }
    
    summary.push({
      name: check.name,
      passed: result.passed,
      details: result.details
    });
    
  } catch (error) {
    console.log(`   ❌ 检查错误: ${error.message}`);
    allPassed = false;
    summary.push({
      name: check.name,
      passed: false,
      error: error.message
    });
  }
  
  console.log();
});

// 显示总结
console.log('📊 部署状态总结');
console.log('==========================================');

const statusEmoji = allPassed ? '✅' : '⚠️';
console.log(`整体状态: ${statusEmoji} ${allPassed ? '准备就绪' : '需要配置'}`);

console.log('\n🔍 详细状态:');
summary.forEach(item => {
  const status = item.passed ? '✅ 通过' : '❌ 需要配置';
  console.log(`  ${status} - ${item.name}`);
});

// 提供建议
console.log('\n🎯 下一步建议:');

if (!allPassed) {
  console.log('1. 完成必要的配置:');
  summary.filter(item => !item.passed).forEach(item => {
    console.log(`   - ${item.name}`);
  });
  
  console.log('\n2. 运行部署脚本:');
  if (fs.existsSync('deploy-free.sh')) {
    console.log('   bash deploy-free.sh  # 免费部署方案');
  }
  if (fs.existsSync('deploy.sh')) {
    console.log('   或 bash deploy.sh  # 完整部署方案');
  }
} else {
  console.log('1. 项目已准备就绪，可以开始部署!');
  console.log('\n2. 选择部署方案:');
  console.log('   A. 免费方案: Vercel + Railway');
  console.log('   B. 云服务器: 腾讯云/阿里云');
  console.log('\n3. 按照部署指南操作:');
  if (fs.existsSync('免费部署-10分钟搞定.md')) {
    console.log('   参考: 免费部署-10分钟搞定.md');
  }
}

console.log('\n🔗 重要文件:');
const importantFiles = [
  '免费部署-10分钟搞定.md',
  'DEPLOYMENT_GUIDE.md',
  '内测部署快速指南.md',
  '.env',
  'railway.toml'
];

importantFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   📄 ${file}`);
  }
});

console.log('\n💡 提示:');
console.log('  1. 免费方案适合10人以下内测');
console.log('  2. 确保API密钥已正确配置');
console.log('  3. 测试本地运行后再部署');
console.log('  4. 部署后立即测试所有功能');

console.log('\n🚀 开始部署命令:');
if (fs.existsSync('deploy-free.sh')) {
  console.log('  bash deploy-free.sh');
}

console.log('\n🎉 祝部署顺利！');

// 检查是否有已知的线上地址（通过配置文件推断）
console.log('\n🔍 检查可能的线上地址:');
try {
  // 检查是否有vercel.json
  if (fs.existsSync('vercel.json')) {
    console.log('  找到Vercel配置文件');
  }
  
  // 检查是否有railway配置
  if (fs.existsSync('railway.toml') || fs.existsSync('railway.json')) {
    console.log('  找到Railway配置文件');
  }
  
  // 检查package.json中的部署脚本
  if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (pkg.scripts && pkg.scripts.deploy) {
      console.log(`  找到部署脚本: npm run ${pkg.scripts.deploy}`);
    }
  }
} catch (e) {
  // 忽略错误
}

console.log('\n📞 如需帮助，请参考部署指南或联系技术支持。');