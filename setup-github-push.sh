#!/bin/bash

echo "🚀 GitHub自动推送配置脚本"
echo "=========================="

echo ""
echo "📋 当前Git状态："
git status
echo ""

echo "📊 需要推送的提交："
git log --oneline origin/main..HEAD
echo ""

echo "🔑 SSH密钥检查："
if [ -f ~/.ssh/id_rsa_github.pub ]; then
    echo "✅ SSH密钥存在"
    echo ""
    echo "📋 请将以下公钥添加到GitHub："
    echo "----------------------------------------"
    cat ~/.ssh/id_rsa_github.pub
    echo "----------------------------------------"
    echo ""
    echo "🌐 添加地址：https://github.com/settings/keys"
    echo ""
    read -p "添加完成后按回车继续..." -n 1
else
    echo "❌ SSH密钥不存在，正在生成..."
    ssh-keygen -t rsa -b 4096 -C "wmf532931063-eng@github.com" -f ~/.ssh/id_rsa_github -N ""
    echo ""
    echo "📋 请将以下公钥添加到GitHub："
    echo "----------------------------------------"
    cat ~/.ssh/id_rsa_github.pub
    echo "----------------------------------------"
    echo ""
    echo "🌐 添加地址：https://github.com/settings/keys"
    echo ""
    read -p "添加完成后按回车继续..." -n 1
fi

echo ""
echo "🔧 配置Git使用SSH..."
git remote set-url origin git@github.com:wmf532931063-eng/knowledge-base-qa.git

echo ""
echo "🔍 测试SSH连接..."
if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    echo "✅ SSH连接成功"
    
    echo ""
    echo "🚀 开始推送代码..."
    if git push origin main; then
        echo ""
        echo "🎉 推送成功！"
        echo ""
        echo "📊 推送的提交："
        git log --oneline -4
        echo ""
        echo "🔗 GitHub仓库：https://github.com/wmf532931063-eng/knowledge-base-qa"
        echo ""
        echo "📱 Render将自动开始部署..."
        echo "⏱️ 等待约2-3分钟完成部署"
        echo ""
        echo "🧪 部署后测试："
        echo "curl -X POST -H 'Content-Type: application/json' \\"
        echo "     -d '{\"question\":\"什么是四柱预测学？\"}' \\"
        echo "     https://knowledge-base-qa.onrender.com/api/qa/ask"
    else
        echo "❌ 推送失败"
        echo ""
        echo "💡 备用方案：使用GitHub Token"
        echo "1. 访问 https://github.com/settings/tokens"
        echo "2. 生成新的Token（选择'repo'权限）"
        echo "3. 运行：git remote set-url origin https://wmf532931063-eng:TOKEN@github.com/wmf532931063-eng/knowledge-base-qa.git"
        echo "4. 运行：git push origin main"
    fi
else
    echo "❌ SSH连接失败"
    echo ""
    echo "💡 请确认："
    echo "1. SSH公钥已添加到GitHub"
    echo "2. 网络连接正常"
    echo "3. 可以尝试备用方案（GitHub Token）"
fi