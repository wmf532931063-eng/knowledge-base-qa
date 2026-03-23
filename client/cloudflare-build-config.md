# Cloudflare Pages 构建配置指南

## 🔧 **正确的Cloudflare Pages配置**

### **构建设置:**
| 设置项 | 正确的值 | 错误的配置 |
|--------|----------|------------|
| **Project name** | `knowledge-base-qa` | 任意名称 |
| **Production branch** | `main` | ✅ 正确 |
| **Framework preset** | `Vite` | ✅ 正确 |
| **Build command** | `npm run build` | ✅ 正确 |
| **Build output directory** | `dist` | **必须设为`dist`** |
| **Root directory** | `client` | **关键！必须设置为`client`** |

### **环境变量 (必需):**
| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_API_URL` | `https://knowledge-base-qa.onrender.com` | **最关键的配置** |
| `NODE_VERSION` | `18` | 或 `20`，必须设置 |

### **NPM构建脚本 (在 `client/package.json` 中):**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 🚨 **常见问题及解决方案**

### **问题1: 样式完全丢失**
**症状:** 页面只有纯文本，没有CSS样式
**原因:** 
1. 构建没有生成CSS文件
2. CSS文件引用路径错误
3. Vite构建配置问题

**解决方案:**
1. **检查构建日志** - 查看Cloudflare Pages构建输出
2. **本地测试构建**:
   ```bash
   cd client
   npm run build
   ```
   查看`dist/`目录是否有`index.html`和CSS文件

3. **验证构建命令** - 确保构建命令正确

### **问题2: JavaScript不工作**
**症状:** 交互功能失效
**原因:** 
1. JavaScript文件未正确加载
2. 模块加载错误
3. 构建问题

**解决方案:**
1. **检查浏览器控制台错误**
2. **测试本地构建**:
   ```bash
   cd client
   npm run build && npm run preview
   ```
3. **检查`index.html`中的脚本引用**

### **问题3: API连接失败**
**症状:** 无法连接后端API
**原因:** 
1. `VITE_API_URL`环境变量未设置
2. CORS配置问题
3. 网络问题

**解决方案:**
1. **验证环境变量** - 确保`VITE_API_URL`正确
2. **测试API连接**:
   ```bash
   curl https://knowledge-base-qa.onrender.com/health
   ```

---

## 📁 **正确的项目结构**

```
knowledge-base-qa/
├── client/                    # Cloudflare Pages根目录
│   ├── src/
│   │   ├── App.jsx           # 主应用组件
│   │   ├── main.jsx          # 入口文件 (导入index.css)
│   │   └── index.css         # 主样式文件
│   ├── index.html           # 主HTML文件
│   ├── package.json         # 前端依赖
│   └── vite.config.js       # Vite配置
└── server/                  # Render后端
```

---

## 🔄 **重新部署步骤**

### **方案A: 通过Cloudflare控制台**
1. 访问 https://dash.cloudflare.com
2. 选择 **Workers & Pages**
3. 选择你的项目 `knowledge-base-qa`
4. 点击 **"Configuration"**
5. 验证所有设置正确
6. 点击 **"Redeploy"**

### **方案B: 通过GitHub推送**
1. 确保前端代码正确
2. 本地测试构建:
   ```bash
   cd client
   npm run build
   ```
3. 推送代码到GitHub:
   ```bash
   git add .
   git commit -m "修复CSS构建问题"
   git push origin main
   ```
4. Cloudflare Pages会自动重新部署

---

## 🎯 **验证部署成功**

### **1. 检查构建日志**
- 查看是否有CSS文件生成
- 检查是否有构建错误

### **2. 测试页面**
- 打开 https://knowledge-base-qa.pages.dev
- 检查是否有样式
- 检查控制台是否有错误

### **3. 验证功能**
- 测试提问功能
- 检查API连接

---

## 🛠 **故障排除命令**

### **本地构建测试:**
```bash
cd client
npm install
npm run build
# 检查dist目录
ls -la dist/
```

### **本地预览测试:**
```bash
npm run preview
# 访问 http://localhost:4173
```

### **检查构建输出:**
```bash
# 检查HTML中的资源引用
grep -E '(link|script|href|src)' client/dist/index.html
```

---

## 📞 **技术支持**

如果问题仍然存在:
1. 查看Cloudflare Pages构建日志
2. 分享错误信息
3. 检查网络请求（浏览器开发者工具）
4. 验证环境变量配置