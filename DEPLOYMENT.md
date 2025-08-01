# 🆓 完全免费的 GitHub 部署方案

## 🎯 方案概述

这是一个完全基于 GitHub 的免费部署方案，无需任何外部平台的计费账户：

- **前端**: GitHub Pages（完全免费）
- **后端**: GitHub Actions（完全免费）
- **API**: GitHub API + GitHub Actions

## 🚀 快速开始

### 步骤1: 设置 GitHub Secrets

按照 [GitHub 设置指南](./GITHUB_SETUP.md) 设置必要的 Secrets：

1. **GEMINI_API_KEY**: Google Gemini API 密钥
2. **VITE_GITHUB_TOKEN**: GitHub Personal Access Token

### 步骤2: 启用 GitHub Pages

1. 进入仓库 "Settings" → "Pages"
2. Source: "Deploy from a branch"
3. Branch: `gh-pages`
4. Folder: `/ (root)`
5. 点击 "Save"

### 步骤3: 推送代码触发部署

```bash
git add .
git commit -m "Initial deployment setup"
git push origin main
```

## 📋 部署流程

### 自动部署流程

1. **推送代码到 main 分支**
2. **GitHub Actions 自动触发**
   - 运行测试
   - 构建前端
   - 部署到 GitHub Pages
3. **获取部署 URL**
   - 前端: `https://your-username.github.io/your-repo`

### API 处理流程

1. **用户在前端选择文本**
2. **前端调用 GitHub API**
3. **触发 GitHub Actions workflow**
4. **Actions 调用 Gemini API**
5. **创建 Issue 存储结果**
6. **前端获取结果并显示**


## 🔧 技术架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │    │  GitHub Actions │    │  GitHub Pages   │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │  Frontend │  │    │  │   Build   │  │    │  │  Static    │  │
│  │   (React) │  │    │  │   & Test  │  │    │  │  Files     │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │  API      │  │    │  │  Process  │  │    │  │  HTML/CSS  │  │
│  │  Handler  │  │    │  │  Request  │  │    │  │  /JS       │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  GitHub API     │    │  Gemini API     │    │  User Browser   │
│                 │    │                 │    │                 │
│  Trigger        │    │  AI Processing  │    │  Display        │
│  Workflow       │    │  Text Rewrite   │    │  Results        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 优势

### ✅ 完全免费
- 无需信用卡
- 无需计费账户
- 无需外部平台

### ✅ 自动化部署
- 推送代码自动部署
- 自动测试和构建
- 自动处理 API 请求

### ✅ 企业级服务
- GitHub Actions 的可靠性
- GitHub Pages 的全球 CDN
- GitHub API 的稳定性

### ✅ 易于维护
- 所有配置在代码中
- 版本控制管理
- 一键回滚

## 🔍 监控和日志

### 查看部署状态
1. 进入 GitHub 仓库 "Actions" 标签
2. 查看最新的 workflow 运行状态
3. 点击查看详细日志

### 查看 API 处理
1. 进入仓库 "Issues" 标签
2. 查看带有 `api-response` 标签的 issues
3. 每个 API 请求都会创建一个 issue

### 查看应用状态
- **前端**: 访问 `https://your-username.github.io/your-repo`
- **API**: 查看 GitHub Actions 日志

## 🚨 故障排除

### 常见问题

1. **部署失败**
   - 检查 GitHub Secrets 设置
   - 查看 Actions 日志
   - 验证 token 权限

2. **API 请求失败**
   - 检查 GitHub token 权限
   - 验证 Gemini API Key
   - 查看 Actions 日志

3. **GitHub Pages 不工作**
   - 检查 `gh-pages` 分支
   - 验证 Pages 设置
   - 等待几分钟让部署生效

### 调试步骤

1. **检查 Secrets**
   ```bash
   # 在 Actions 日志中验证环境变量
   echo $GEMINI_API_KEY
   ```

2. **测试本地构建**
   ```bash
   cd frontend && npm run build
   ```

3. **验证 API 调用**
   ```bash
   # 测试 GitHub API
   curl -H "Authorization: token YOUR_TOKEN" \
        https://api.github.com/repos/OWNER/REPO/dispatches
   ```

## 📞 获取帮助

- **GitHub Issues**: 在仓库中提交问题
- **Actions 日志**: 查看详细的部署日志
- **API Issues**: 查看 API 处理结果

## 🎉 开始使用

1. 按照 [GitHub 设置指南](./GITHUB_SETUP.md) 设置 Secrets
2. 推送代码到 main 分支
3. 等待自动部署完成
4. 访问你的应用！

**部署完成后，你将获得**：
- 🌐 前端 URL: `https://your-username.github.io/your-repo`
- 🔗 API 处理: 通过 GitHub Actions
- 📊 完全免费的部署方案 