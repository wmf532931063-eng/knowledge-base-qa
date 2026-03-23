# 🌐 Vercel部署步骤指南

## 前置条件
✅ GitHub仓库已创建  
✅ Railway后端已部署并获得地址

## 第一步：登录Vercel
1. 访问 https://vercel.com
2. 使用GitHub账号登录
3. 完成邮箱验证（如果需要）

## 第二步：导入项目
1. 点击 **"New Project"**
2. 选择 **"Import Git Repository"**
3. 在仓库列表中，找到并选择 **"knowledge-base-qa"**
4. 点击 **"Import"**

## 第三步：配置项目
Vercel会自动检测项目类型，但我们需要确认配置：

### 基本配置：
- **Framework Preset**: Vite (Vercel应该自动识别)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 环境变量配置：
1. 在项目配置页面，找到 **"Environment Variables"**
2. 添加以下环境变量：

```env
# 前端API地址（使用你的Railway地址）
VITE_API_URL=https://your-project-name.up.railway.app

# 可选：其他配置
VITE_APP_NAME=知识库AI问答系统
VITE_APP_VERSION=1.0.0
```

3. 点击 **"Add"**

## 第四步：部署
1. 点击 **"Deploy"** 按钮
2. 等待部署完成（约1-2分钟）

## 第五步：获取前端地址
部署完成后：

1. 在项目页面，找到 **"Domains"** 部分
2. 你会看到一个地址，格式如：
   ```
   https://knowledge-base-qa.vercel.app
   ```
3. **访问这个地址**测试应用

## 第六步：测试前端功能
1. 访问你的Vercel地址
2. 测试以下功能：
   - ✅ 页面加载
   - ✅ 问答功能
   - ✅ 知识库搜索
   - ✅ 设置界面

## 配置优化（可选）

### 1. 自定义域名
1. 在项目设置中，点击 **"Domains"**
2. 添加你的自定义域名
3. 按照提示配置DNS

### 2. 自动部署
- 默认已启用：当GitHub仓库有push时自动部署
- 可以在设置中调整部署分支

### 3. 性能优化
- 启用Edge Functions（如果需要）
- 配置CDN缓存
- 开启图片优化

## 常见问题

### 问题1：前端无法连接后端
- 检查 `VITE_API_URL` 是否正确
- 查看浏览器控制台错误
- 确认CORS设置

### 问题2：构建失败
- 查看构建日志
- 检查依赖是否正确
- 确认Node.js版本兼容

### 问题3：样式丢失
- 检查CSS文件路径
- 确认构建输出目录
- 查看网络请求

## 重要提示
1. Vercel免费版每月有100GB带宽
2. 支持自动SSL证书
3. 可以设置部署预览
4. 支持自定义404页面

## 完成标志
✅ Vercel项目创建完成
✅ 环境变量配置完成
✅ 部署状态显示SUCCESS
✅ 获得前端地址：https://xxx.vercel.app
✅ 所有功能测试通过

## 🎉 部署完成！
现在你的应用已经在线上了！

**访问地址**：https://your-project.vercel.app  
**后端API**：https://your-project.up.railway.app

**分享给内测用户**：将前端地址分享给内测团队，开始收集反馈！