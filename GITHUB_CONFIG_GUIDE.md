# GitHub自动推送配置详细指南

## 🔍 当前问题
- 本地有4个未推送的关键提交
- 包括修改回答逻辑的核心修改（移除占卜格式）
- Render服务器部署的是旧版本代码

## 🎯 目标
配置GitHub，使我可以自动推送最新的代码到仓库，触发Render自动部署。

## 📋 配置步骤

### 第一步：将SSH公钥添加到GitHub

#### A. 查看本地SSH公钥
```bash
# 运行这个命令查看公钥
cat ~/.ssh/id_rsa_github.pub
```

你会看到类似这样的输出：
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCvQHT2pXlIVJAwe4WQe9OpvOCr48d6HyiC+z4S0rSkgRUhTpI+wdV0cS9zsupV50VZswfuPwJ8heTCSicsRX+I+lCUzj0k/T77p1xjCbzADXKSOFaVeh9GhojvJO3UdbXrvz8qT9dePK/pyQBEkLeGvJavaLCoxl2SUgUf4o+pwOJg7dPOKc2Gg6IiK9LNh17AeZOMR0ye2owOKxyWyyKAjgcITksbaqiwJLLloiUKf2PTJmmOOE+hxsJUjXYsdBPYnzuPt7MtLqbHm3CMk96jw1xbA5QjS5TwC8IhlHZ1TyT72Qt601WYIAKh9gJ7x80eNmff1odBs+xzIJwpwoIHXQLD96AMoJ0yZHR43dvPswwLACAsoJ3r+5+Sqi3zf1PFCMkpybCoe89khk8dOjYMmk9uKup8vCZE8YiNpMB2dsBh8JNLarzUEg8woprEzjqp9svjkRsiT4ABgirTn54hT8WcAGfT2B8H18JfaHGVDutHQJRJCZv7YdN8G8+bk1GGutcrNY5vvV5ZlCQXwxZbFA2VrwRWyQaMEM2Ju8MohcIyK8Pm3CjEdrq1FEACVHgyHcxIH8KBiOghgihETtdCxrHdAPZ3NzBC8fnCaogQ5ERS6QgJ/Vc4mkHTLtrq1X9Kid8BjtHjuRImCt1i37WjbPFw4xOkbw/1EKg/OPgmxw== wmf532931063-eng@github.com
```

#### B. 在GitHub网站添加SSH密钥
1. **登录GitHub**：https://github.com
2. **进入设置页面**：
   - 点击右上角你的头像
   - 选择 **"Settings"**
3. **找到SSH密钥设置**：
   - 左侧菜单向下滚动
   - 点击 **"SSH and GPZ keys"**
4. **添加新的SSH密钥**：
   - 点击绿色的 **"New SSH key"** 按钮
5. **填写信息**：
   - **Title**：`MacBook Deployment Key`
   - **Key type**：保持默认（Authentication Key）
   - **Key**：粘贴刚才复制的公钥内容
6. **保存**：
   - 点击 **"Add SSH key"**

#### C. 验证SSH连接
```bash
# 运行这个命令测试连接
ssh -T git@github.com
```

成功的话会看到：
```
Hi wmf532931063-eng! You've successfully authenticated, but GitHub does not provide shell access.
```

### 第二步：配置Git使用SSH

```bash
# 修改远程仓库URL为SSH方式
git remote set-url origin git@github.com:wmf532931063-eng/knowledge-base-qa.git

# 验证配置
git remote -v
```

应该看到：
```
origin  git@github.com:wmf532931063-eng/knowledge-base-qa.git (fetch)
origin  git@github.com:wmf532931063-eng/knowledge-base-qa.git (push)
```

### 第三步：推送代码

```bash
# 一次性推送所有本地提交
git push origin main
```

## 🔄 备选方案：GitHub Personal Access Token

如果SSH方式不行，使用Token：

### A. 生成GitHub Token
1. 访问 https://github.com/settings/tokens
2. 点击 **"Generate new token"**
3. 设置：
   - **Note**：`Auto-Push Deployment Token`
   - **Expiration**：建议选 **"No expiration"**
   - **Select scopes**：勾选 **"repo"**（完全控制仓库）
4. 点击 **"Generate token"**
5. **立即复制Token**（只会显示一次！）

### B. 使用Token推送
```bash
# 设置远程仓库URL（替换YOUR_TOKEN）
git remote set-url origin https://wmf532931063-eng:YOUR_TOKEN@github.com/wmf532931063-eng/knowledge-base-qa.git

# 推送代码
git push origin main
```

## 🧪 验证部署

部署完成后，测试修改是否生效：

```bash
curl -X POST -H "Content-Type: application/json" \
     -d '{"question":"什么是四柱预测学？"}' \
     https://knowledge-base-qa.onrender.com/api/qa/ask
```

**正确结果**：简洁、准确、专业的回答，**不包含**：
- 【卦象/签文】
- 【吉凶判断】
- 【解读分析】
- 【建议指引】

## 📊 本地未推送的提交内容

1. **`ce9fb25`** - 修改回答逻辑：所有问题都使用普通问答格式，移除占卜格式
   - 修改系统提示，明确禁止使用占卜格式
   - 添加"绝对不要使用占卜格式"要求

2. **`b45901b`** - 修复llmService.js中的重复函数定义
   - 清理重复的checkIfDivinationQuestion函数
   - 确保回答逻辑正确

3. **`de2cf56`** - 清理临时文件，添加手动部署指南

4. **`8d8971f`** - 更新手动部署指南

## 🆘 常见问题解决

### Q1：SSH连接失败
```bash
# 检查SSH配置
cat ~/.ssh/config

# 重新生成密钥
ssh-keygen -t rsa -b 4096 -C "your-email@example.com" -f ~/.ssh/id_rsa -N ""
```

### Q2：提示权限被拒绝
```bash
# 检查GitHub账户权限
# 确保你有推送权限到该仓库
```

### Q3：网络问题
```bash
# 测试网络连接
ping github.com

# 检查防火墙设置
```

## 📞 技术支持

如果需要我帮你执行推送，请：
1. 确认SSH公钥已添加到GitHub
2. 告诉我是否可以运行脚本
3. 或者手动执行第三步的命令

配置完成后，我就可以自动推送最新的代码到GitHub，Render会自动检测并部署！