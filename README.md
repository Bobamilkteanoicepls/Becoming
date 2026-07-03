# Becoming — AI coach prototype

"Just talk. I remember everything."

## 在 Cursor 里跑起来(第一次)

1. 用 Cursor 打开这个文件夹
2. 终端里运行:
   ```
   npm install
   npm run dev
   ```
3. 浏览器打开 http://localhost:5173 — 手机尺寸预览:按 F12 → 点手机图标

## 推到 GitHub

1. github.com → New repository → 名字 becoming → Private → Create(不要勾选任何初始化文件)
2. 终端里(替换成你的地址):
   ```
   git init
   git add .
   git commit -m "Becoming v3 prototype"
   git remote add origin https://github.com/你的用户名/becoming.git
   git push -u origin main
   ```

## 部署上线(Vercel,免费)

1. vercel.com → 用 GitHub 登录 → Add New Project → 选 becoming 仓库 → Deploy
2. 完成后得到 https://becoming-xxx.vercel.app
3. 以后每次 git push,网站自动更新

## 装到手机(PWA)

iPhone:Safari 打开你的 vercel 网址 → 分享按钮 → "添加到主屏幕"
Android:Chrome 打开 → 菜单 → "安装应用"
(注意:微信内置浏览器不行,要用系统浏览器打开)

## 下一步(变成真产品前)

- [ ] 接 Supabase:存储 journal、聊天记录、Body Model
- [ ] 接 Claude API:替换 src/App.jsx 里的 classifyIntent + 各个 case 的固定回复
- [ ] 语气 system prompt:像朋友发微信 — 简短、温暖、有 emoji 但不多
- [ ] 认真做时:用 Expo (React Native) 重写界面层,拿到原生推送通知

## 接入真 AI 大脑(Claude API)

app 现在有两个大脑:线上是真的 Claude(/api/coach),没配 key 或本地 npm run dev 时自动退回到内置规则引擎。

1. 去 console.anthropic.com 注册,创建一个 API Key(充 $5 够用很久,一条消息约 ¥0.02-0.05)
2. Vercel → 你的项目 → Settings → Environment Variables → 添加:
   Name: ANTHROPIC_API_KEY   Value: 你的key
3. Deployments 页 → 最新一条 → ⋯ → Redeploy
4. 打开线上网址,和教练随便聊 — 现在它什么都能接住了

本地想连真大脑:npm i -g vercel,然后用 `vercel dev` 代替 `npm run dev`。

### 导入 ChatGPT 记忆
打开 api/coach.js,找到 PASTE ZONE,把你和 ChatGPT 的对话要点贴进去,push 即可。
