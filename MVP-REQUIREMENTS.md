# MVP 需求文档 — Passport Photo Background Remover

**项目名称**: Passport Photo Background Remover  
**版本**: v1.0 MVP  
**创建日期**: 2026-04-02  
**目标上线**: 2 周内

---

## 一、项目背景

### 1.1 市场机会

"image background remover" 是高流量关键词，但竞争激烈（Canva、Remove.bg、Adobe 占主导）。  
**证件照（passport photo）** 是其中的垂直蓝海赛道：

- 搜索意图极其明确，用户来了就是要用
- 竞品少且垂直化不足
- 用户付费意愿强（签证、护照申请有时效压力）
- 可延伸至签证照、驾照、学生证等场景

### 1.2 核心价值主张

> "免费在线去除证件照背景，一键换白/红/蓝底，符合国际标准，无需注册，照片即用即删"

---

## 二、目标用户

| 用户类型 | 场景 | 痛点 |
|---------|------|------|
| 护照申请者 | 自拍换白底 | 不会 PS，照相馆贵 |
| 签证申请者 | 签证照换背景色 | 不同国家要求不同底色 |
| 留学生 | 各类证件照 | 在海外拍照不便 |
| 电商卖家 | 产品证件类图片 | 批量需求 |
| HR/行政 | 员工证件照处理 | 批量处理需求 |

---

## 三、核心功能（MVP 范围）

### 3.1 功能清单

| 优先级 | 功能 | 说明 |
|--------|------|------|
| P0 | 图片上传 | 支持点击上传 + 拖拽，格式 JPG/PNG/WEBP，最大 10MB |
| P0 | AI 去背景 | 调用 Remove.bg API，自动抠图 |
| P0 | 背景色替换 | 白色 / 红色 / 蓝色 / 深蓝 / 自定义颜色 |
| P0 | 结果下载 | 下载 PNG 格式（透明底或指定背景色） |
| P1 | Before/After 对比预览 | 左右滑动对比原图与处理结果 |
| P1 | 尺寸规格预设 | 常见证件照尺寸一键裁切 |
| P2 | 批量处理 | 多张图片同时处理（付费功能预留） |

### 3.2 P0 详细说明

#### 图片上传
- 支持拖拽到上传区域
- 支持点击弹出文件选择器
- 上传后即时预览原图
- 文件大小限制：10MB
- 支持格式：JPG、PNG、WEBP

#### AI 去背景
- 调用 Remove.bg API（`/v1.0/removebg`）
- 图片全程在内存中处理，不写入磁盘，不持久化存储
- 处理时间预计 1-3 秒，显示 loading 动画
- 失败时显示友好错误提示

#### 背景色替换
- 预设颜色：
  - ⬜ 白色 `#FFFFFF`（默认，护照标准）
  - 🟥 红色 `#FF0000`（中国签证照）
  - 🟦 蓝色 `#438EDB`（常用证件照）
  - 🟦 深蓝 `#003580`（部分签证要求）
  - 🎨 自定义（颜色选择器）
- 透明底（PNG 下载选项）

#### 结果下载
- 下载格式：PNG
- 文件名：`passport-photo-removed-bg.png`
- 下载后不在服务器保留任何文件

### 3.3 P1 详细说明

#### 尺寸规格预设
| 规格名称 | 尺寸 | 适用场景 |
|---------|------|---------|
| 中国护照 | 33×48mm (390×567px) | 中国护照、签证 |
| 美国护照 | 2×2 inch (600×600px) | 美国护照、绿卡 |
| 英国护照 | 35×45mm (413×531px) | 英国护照 |
| 欧盟标准 | 35×45mm | 欧洲各国证件 |
| 1寸照 | 25×35mm (295×413px) | 国内通用 |
| 2寸照 | 35×49mm (413×579px) | 国内通用 |

---

## 四、技术方案

### 4.1 技术栈

| 层次 | 技术选型 | 说明 |
|------|---------|------|
| 前端框架 | Next.js 14 (App Router) | SSR + 静态生成，SEO 友好 |
| 样式 | Tailwind CSS | 快速开发，响应式 |
| 动画 | Framer Motion | 上传动效、结果展示动画 |
| API 集成 | Remove.bg API | 核心 AI 抠图能力 |
| 部署 | Cloudflare Pages + Workers | 全球 CDN，无服务器费用 |
| CF 适配 | @cloudflare/next-on-pages | Next.js → Cloudflare 适配层 |

### 4.2 架构设计

```
用户浏览器
    │
    ▼
Cloudflare Pages（静态资源 + Next.js 前端）
    │
    ▼
Cloudflare Workers（Next.js API Route）
    │  图片以 FormData 传输，全程内存处理
    ▼
Remove.bg API（AI 抠图）
    │
    ▼
返回处理后图片 → 前端展示 → 用户下载
```

### 4.3 API Route 设计

**`POST /api/remove-bg`**

```
Request:
  Content-Type: multipart/form-data
  Body: { image: File, bg_color?: string }

Response (成功):
  Content-Type: image/png
  Body: 处理后的图片二进制流

Response (失败):
  Content-Type: application/json
  Body: { error: string, code: number }
```

### 4.4 环境变量

```env
REMOVE_BG_API_KEY=your_api_key_here
```

---

## 五、UI/UX 设计规范

### 5.1 视觉风格

- **主色调**: 深蓝 `#1E3A5F` + 白色 + 浅灰
- **强调色**: 蓝色 `#3B82F6`（按钮、高亮）
- **字体**: Inter（英文）
- **整体感**: 专业、可信赖、政务感（区别于花哨的通用工具）

### 5.2 页面布局

```
┌─────────────────────────────────────┐
│  Logo    导航（Home / How it works）  │  ← Header
├─────────────────────────────────────┤
│                                     │
│   Passport Photo Background Remover │  ← Hero 标题
│   Free · Instant · ICAO Compliant   │  ← 副标题
│                                     │
│   ┌─────────────────────────────┐   │
│   │   📎 Drop your photo here   │   │  ← 上传区（拖拽）
│   │   or click to upload        │   │
│   └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  [原图]        [处理结果]             │  ← Before/After
│         ◀──┃──▶                     │  ← 滑动对比
│                                     │
│  背景色: ⬜ 🟥 🟦 🎨               │  ← 颜色选择
│  尺寸:  [中国护照 ▼]                 │  ← 规格选择
│                                     │
│         [⬇ Download PNG]            │  ← 下载按钮
├─────────────────────────────────────┤
│  ✓ ICAO标准  ✓ 无需注册  ✓ 即用即删  │  ← 信任背书
├─────────────────────────────────────┤
│  How it works: 上传→处理→下载（3步） │  ← 使用说明
├─────────────────────────────────────┤
│  适用场景: 护照/签证/驾照/学生证      │  ← 场景说明
└─────────────────────────────────────┘
```

### 5.3 交互细节

- 拖拽上传区：鼠标悬停时边框发光动效
- 处理中：进度动画 + "Removing background..." 文字
- 处理完成：结果图片从模糊到清晰的淡入动效
- 下载按钮：点击后有成功反馈（✓ Downloaded）

---

## 六、SEO 策略

### 6.1 主页目标关键词

- 主词：`passport photo background remover`
- 次要：`id photo background changer`、`remove background from passport photo`

### 6.2 落地页矩阵（MVP 后迭代）

| 路径 | 目标关键词 |
|------|-----------|
| `/` | passport photo background remover |
| `/visa-photo` | visa photo background changer |
| `/id-card` | id card photo background white |
| `/driving-license` | driving license photo background remover |
| `/us-passport-photo` | us passport photo requirements |

### 6.3 技术 SEO

- Next.js SSR，所有页面服务端渲染
- 完整 meta title / description / og:image
- Schema.org 结构化数据（WebApplication）
- sitemap.xml 自动生成
- 页面加载速度 < 2s（Cloudflare CDN 加持）

---

## 七、变现路径

### MVP 阶段（免费）
- 使用 Remove.bg 免费额度（50张/月）
- 建立用户基础，验证需求

### 增长阶段（付费）
- 高清下载（MVP 免费，后期付费）
- 批量处理（5张起，$4.99/50次）
- API 接口（面向开发者）

### 支付集成（MVP 后）
- Stripe 支付
- 按次付费 / 订阅制

---

## 八、项目结构

```
passport-bg-remover/
├── app/
│   ├── page.tsx                 # 主页
│   ├── layout.tsx               # 全局布局（SEO meta）
│   ├── globals.css
│   └── api/
│       └── remove-bg/
│           └── route.ts         # Remove.bg API 代理
├── components/
│   ├── HeroSection.tsx          # 首屏标题 + 上传
│   ├── UploadZone.tsx           # 拖拽上传组件
│   ├── BeforeAfterSlider.tsx    # 对比滑块
│   ├── BgColorPicker.tsx        # 背景色选择
│   ├── SizePresetSelector.tsx   # 尺寸规格选择
│   ├── DownloadButton.tsx       # 下载按钮
│   ├── TrustBadges.tsx          # 信任背书
│   └── HowItWorks.tsx           # 使用说明
├── lib/
│   └── removebg.ts              # Remove.bg API 封装
├── public/
│   ├── og-image.png             # 社交分享图
│   └── favicon.ico
├── .env.local.example
├── next.config.js               # Cloudflare 适配配置
├── tailwind.config.ts
├── package.json
└── README.md
```

---

## 九、开发里程碑

| 阶段 | 任务 | 预计时间 |
|------|------|---------|
| Day 1 | 项目初始化、基础布局、上传组件 | 1天 |
| Day 2 | Remove.bg API 集成、去背景功能 | 1天 |
| Day 3 | 背景色替换、尺寸裁切、下载功能 | 1天 |
| Day 4 | Before/After 滑块、UI 精修 | 1天 |
| Day 5 | SEO 配置、Cloudflare 部署、测试 | 1天 |
| Day 6-7 | Bug 修复、性能优化、上线 | 2天 |

**总计**: 约 1 周完成 MVP

---

## 十、成功指标

| 指标 | MVP 目标（上线1个月）|
|------|-------------------|
| 月访问量 | 500+ UV |
| 工具使用次数 | 200+ 次 |
| Google 收录 | 主页 + 核心关键词进入前50 |
| 页面速度 | Lighthouse 性能分 > 90 |
| 用户停留时长 | > 1分30秒 |

---

## 附录：外部依赖

| 服务 | 用途 | 费用 |
|------|------|------|
| Remove.bg API | AI 抠图 | 免费50次/月，$0.2/次 |
| Cloudflare Pages | 部署托管 | 免费 |
| Cloudflare Workers | API 路由 | 免费（10万次/天） |
| Vercel（备选） | 备用部署 | 免费 |

---

*文档版本: v1.0 | 下次更新: 开发完成后同步实际实现情况*
