# Cloudflare Pages 部署指南

## 🌐 **为什么选择Cloudflare Pages？**

**对于中国大陆用户最佳选择：**
- ✅ **在中国大陆访问速度最快**
- ✅ **有中国香港节点**，网络优化好
- ✅ **无限带宽**（免费套餐）
- ✅ 自动SSL、CDN加速
- ✅ 支持Vite、Next.js等多种框架

---

## 🚀 **部署步骤**

### **第一步：登录Cloudflare Pages**
1. 访问 https://pages.cloudflare.com
2. 用GitHub账号登录

### **第二步：创建项目**
1. 点击 **"Create a project"**
2. 选择你的仓库：`wmf532931063-eng/knowledge-base-qa`
3. 点击 **"Begin setup"**

### **第三步：配置构建设置**

| 设置项 | 值 | 说明 |
|--------|-----|------|
| **Project name** | `knowledge-base-qa` | 项目名称 |
| **Production branch** | `main` | 生产分支 |
| **Framework preset** | `Vite` | 框架预设 |
| **Build command** | `npm run build` | 构建命令 |
| **Build output directory** | `dist` | 输出目录 |
| **Root directory** | `client` | 前端代码目录 |

### **第四步：环境变量配置**

在 **"Environment variables"** 部分添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_API_URL` | `https://knowledge-base-qa.onrender.com` | **最重要**：Render后端地址 |
| `NODE_VERSION` | `18` | Node.js版本 |

### **第五步：部署**
1. 点击 **"Save and Deploy"**
2. 等待构建完成（约2-3分钟）

---

## 🔧 **自定义域名（可选）**

如果你想使用自己的域名：

1. 在Cloudflare Pages项目设置中，点击 **"Custom domains"**
2. 添加你的域名（如：`qa.yourdomain.com`）
3. 按照指引配置DNS记录

---

## 📊 **部署后验证**

### **1. 检查部署状态**
- 访问：`https://knowledge-base-qa.pages.dev`
- 或你的自定义域名

### **2. 测试功能**
1. 打开应用
2. 查看知识库状态
3. 尝试提问："你好"

### **3. 监控日志**
- 在Cloudflare Pages控制台查看构建日志
- 检查是否有错误

---

## ⚠️ **常见问题**

### **Q: 前端无法连接到后端API？**
**检查：**
1. 环境变量 `VITE_API_URL` 是否正确
2. Render后端是否正在运行
3. 网络请求是否被CORS阻止

### **Q: 构建失败？**
**可能原因：**
1. Node版本不匹配
2. 依赖安装失败
3. 构建脚本错误

### **Q: 中国大陆访问慢？**
**解决方案：**
1. Cloudflare Pages**自动优化**中国大陆访问
2. 免费套餐已经足够快

---

## 🎯 **性能优化建议**

### **1. 图片优化**
- 使用WebP格式
- 压缩图片大小

### **2. 代码分割**
- Vite自动优化
- 路由懒加载

### **3. 缓存策略**
- Cloudflare自动缓存
- 静态资源长期缓存

---

## 📞 **技术支持**

如果遇到问题：
1. 检查Cloudflare Pages构建日志
2. 查看浏览器控制台错误
3. 测试Render后端API是否正常
4. 检查环境变量配置

---

## 🎉 **部署完成**

部署完成后，你将获得：
- ✅ 中国大陆友好的访问速度
- ✅ 无限带宽的免费托管
- ✅ 自动SSL证书
- ✅ 全球CDN加速
- ✅ 完整的问答系统

**部署地址示例：**
- 默认：`https://knowledge-base-qa.pages.dev`
- 自定义：`https://qa.yourdomain.com`