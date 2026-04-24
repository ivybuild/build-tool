# 学习空间 - 个人学习网站

一个简约的个人学习网站，包含 **记录模块** 和 **学习记忆模块**，基于 Next.js + Supabase + Vercel 构建。

## 功能特性

- 📝 **记录模块**：文字 + 图片，支持 `#标签` 语法，显示创建/修改时间
- 🧠 **学习记忆模块**：遗忘曲线算法，填空卡片，科学复习提醒
- 📱 **手机端适配**：响应式设计，底部导航栏
- 🔐 **用户认证**：Supabase Auth 邮箱登录

---

## 部署步骤

### 第一步：创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)，注册并创建新项目
2. 记录以下信息（**Settings > API**）：
   - Project URL（`NEXT_PUBLIC_SUPABASE_URL`）
   - anon key（`NEXT_PUBLIC_SUPABASE_ANON_KEY`）
   - service_role key（`SUPABASE_SERVICE_ROLE_KEY`）

### 第二步：初始化数据库

1. 在 Supabase Dashboard 中，进入 **SQL Editor**
2. 复制 `supabase/migrations/001_initial_schema.sql` 文件内容并执行
3. 进入 **Storage**，创建名为 `note-images` 的存储桶，设置为 **Public**

### 第三步：上传代码到 GitHub

```bash
# 在 ivybuild 目录中
git init
git add .
git commit -m "init: 个人学习网站"

# 在 GitHub 创建新仓库后
git remote add origin https://github.com/你的用户名/学习空间.git
git push -u origin main
```

### 第四步：部署到 Vercel

1. 访问 [vercel.com](https://vercel.com)，登录后点击 **New Project**
2. 导入刚才创建的 GitHub 仓库
3. 在 **Environment Variables** 中添加以下变量：

| 变量名 | 值 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 你的 service_role key |
| `NEXT_PUBLIC_SITE_URL` | 部署后的 Vercel URL（如 `https://your-app.vercel.app`） |

4. 点击 **Deploy**，等待部署完成

### 第五步：配置 Supabase 认证回调

1. 在 Supabase Dashboard 中，进入 **Authentication > URL Configuration**
2. 将 **Site URL** 设置为你的 Vercel URL
3. 在 **Redirect URLs** 中添加：`https://your-app.vercel.app/**`

---

## 本地开发

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.local.example .env.local
# 编辑 .env.local，填入你的 Supabase 配置

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

---

## 卡片内容填空语法

创建学习卡片时，使用以下语法标记填空：

```
光合作用的产物是 {{葡萄糖}} 和 {{氧气}}。
牛顿第一定律又称为 ___惯性定律___。
```

**导入文件时**（`.txt` 或 `.md`）：
- 第一行作为卡片标题
- `==高亮内容==` 或 `**加粗内容**` 自动识别为填空

---

## 遗忘曲线算法

复习间隔遵循以下规则：

| 学习次数 | 下次复习间隔 |
|----------|-------------|
| 第 1 次  | 1 天后      |
| 第 2 次  | 3 天后      |
| 第 3 次  | 7 天后      |
| 第 4 次  | 14 天后     |
| 第 5 次  | 30 天后     |
| 第 6 次+ | 每次翻倍（最长 180 天）|

---

## 技术栈

- **框架**：Next.js 14 (App Router + TypeScript)
- **样式**：Tailwind CSS（等线/思源黑体字体）
- **数据库**：Supabase（PostgreSQL）
- **图片存储**：Supabase Storage
- **认证**：Supabase Auth
- **部署**：Vercel
