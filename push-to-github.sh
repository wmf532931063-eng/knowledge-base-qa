#!/bin/bash

echo "🚀 推送代码到GitHub..."
echo "仓库地址: https://github.com/wmf532931063-eng/knowledge-base-qa.git"

# 设置用户名和邮箱（如果需要）
git config user.name "wangminfei"
git config user.email "wangminfei@example.com"

# 推送代码
echo "开始推送..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ 代码推送成功！"
    echo "🌐 访问: https://github.com/wmf532931063-eng/knowledge-base-qa"
else
    echo "❌ 推送失败，请检查网络连接或权限"
fi