module.exports = {
  apps: [
    // 后端Express服务
    {
      name: 'knowledge-backend',
      script: 'index.js',
      cwd: './server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
    
    // 前端开发服务（生产环境可考虑使用Nginx替代）
    {
      name: 'knowledge-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: './client',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ],

  // 部署配置
  deploy: {
    production: {
      user: 'ubuntu',
      host: ['你的服务器IP'],
      ref: 'origin/main',
      repo: 'https://github.com/你的用户名/knowledge-base-qa.git',
      path: '/var/www/knowledge-base-qa',
      'post-deploy': 'npm run install:all && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-deploy-local': 'echo "开始部署到生产环境..."',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};