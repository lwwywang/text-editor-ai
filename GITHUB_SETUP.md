# 🔧 GitHub 设置指南

## 设置 GitHub Secrets

### 步骤1: 访问仓库设置

1. 进入你的 GitHub 仓库
2. 点击 "Settings" 标签
3. 在左侧菜单中点击 "Secrets and variables" → "Actions"

### 步骤2: 添加必要的 Secrets

#### 1. GEMINI_API_KEY
**用途**: Google Gemini API 密钥

**获取步骤**:
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录 Google 账户
3. 点击 "Create API Key"
4. 复制生成的 API Key

**在 GitHub 中设置**:
- **Name**: `GEMINI_API_KEY`
- **Value**: 你的 Gemini API Key

#### 2. VITE_GITHUB_TOKEN
**用途**: GitHub Personal Access Token

**获取步骤**:
1. 访问 [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 填写信息：
   - **Note**: `text-editor-ai-deployment`
   - **Expiration**: 选择合适的时间（建议 90 天）
4. 选择权限：
   - ✅ `repo` (完整仓库访问权限)
   - ✅ `workflow` (工作流权限)
5. 点击 "Generate token"
6. 复制生成的 token（注意：只显示一次）

**在 GitHub 中设置**:
- **Name**: `VITE_GITHUB_TOKEN`
- **Value**: 你的 GitHub Personal Access Token

### 步骤3: 启用 GitHub Pages

1. 进入仓库 "Settings"
2. 点击左侧菜单 "Pages"
3. 在 "Source" 部分：
   - 选择 "Deploy from a branch"
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. 点击 "Save"

### 步骤4: 启用 GitHub Actions

1. 进入仓库 "Settings"
2. 点击左侧菜单 "Actions" → "General"
3. 在 "Actions permissions" 部分：
   - 选择 "Allow all actions and reusable workflows"
4. 点击 "Save"

## 验证设置

### 检查 Secrets
确保以下 Secrets 已正确设置：
- ✅ `GEMINI_API_KEY`
- ✅ `VITE_GITHUB_TOKEN`

### 检查权限
确保 GitHub Actions 有足够权限：
- ✅ Actions 已启用
- ✅ Pages 已配置
- ✅ Token 有正确权限

## 部署流程

### 自动部署
1. 推送代码到 `main` 分支
2. GitHub Actions 自动触发
3. 前端部署到 GitHub Pages
4. API 处理通过 GitHub Actions

### 手动部署
1. 进入 "Actions" 标签
2. 选择 "Deploy to Production"
3. 点击 "Run workflow"
4. 等待部署完成

## 故障排除

### 常见问题

1. **Token 权限不足**
   - 确保 token 有 `repo` 权限
   - 确保 token 有 `workflow` 权限
   - 检查 token 是否过期

2. **API Key 无效**
   - 检查 `GEMINI_API_KEY` 是否正确
   - 确保 API Key 有足够权限

3. **GitHub Pages 不工作**
   - 检查 `gh-pages` 分支是否存在
   - 确保 Pages 源设置正确

### 调试技巧

1. **查看 Actions 日志**
   - 进入 "Actions" 标签
   - 点击失败的 workflow
   - 查看详细日志

2. **测试本地构建**
   ```bash
   cd frontend && npm run build
   ```

3. **验证环境变量**
   - 在 Actions 日志中检查环境变量是否正确设置 