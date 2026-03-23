#!/bin/bash

# 防火墙配置脚本
# 适用于Ubuntu/Debian系统

set -e

echo "🔒 配置防火墙..."
echo "=========================================="

# 检查ufw是否安装
if ! command -v ufw &> /dev/null; then
    echo "安装ufw防火墙..."
    apt update
    apt install -y ufw
fi

# 重置防火墙规则
echo "重置防火墙规则..."
ufw --force reset

# 设置默认策略
echo "设置默认策略..."
ufw default deny incoming
ufw default allow outgoing

# 允许SSH
echo "允许SSH连接..."
ufw allow ssh

# 允许HTTP/HTTPS
echo "允许HTTP/HTTPS..."
ufw allow http
ufw allow https

# 允许应用端口
echo "允许应用端口..."
ufw allow 3001/tcp  # 后端API端口
ufw allow 5173/tcp  # 前端开发端口

# 启用防火墙
echo "启用防火墙..."
ufw enable

# 显示规则
echo "防火墙规则："
ufw status verbose

echo -e "\n✅ 防火墙配置完成！"
echo "允许的端口："
echo "  - SSH (22)"
echo "  - HTTP (80)"
echo "  - HTTPS (443)"
echo "  - 后端API (3001)"
echo "  - 前端开发 (5173)"

echo -e "\n⚠️  注意："
echo "  1. 确保SSH端口已正确配置"
echo "  2. 如需其他端口，请手动添加"
echo "  3. 查看完整规则: sudo ufw status numbered"
echo "  4. 删除规则: sudo ufw delete <规则编号>"