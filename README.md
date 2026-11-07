# Quant-FMP 前端静态展示看板 (`ui/`)

本目录承载 Quant-FMP 系统的只读展示层，长期通过 GitHub Actions 部署托管于 GitHub Pages，提供现代美观的技术博客式阅读看板体验。

- **线上生产访问地址**：[http://quant.evotensor.dev/](http://quant.evotensor.dev/)

---

## 目录结构与二级子目录分工

```
ui/
├── index.html                   # 平台主页：核心功能介绍、大事记 (Milestones) 与导航
├── transactions.html            # 事务总览页面：数据/训练/预测事务统计流水与执行计划
├── base-data-transactions.html  # 基础数据事务页面：美股标的微观画像、最新价格与财报
├── model-transactions.html      # 模型预测事务页面：多空 Alpha 排行榜与沙盘调仓换算
├── trading-transactions.html    # 交易事务看板页面：30 日零成本沙盘验证、碎股调仓与频率论证
├── sw.js                        # 【PWA 核心】Service Worker 离线缓存、骨架秒开与增量更新策略
├── manifest.webmanifest         # 【PWA 标准】现代 W3C Web App Manifest 渐进式应用配置文件
├── manifest.json                # 【PWA 兼容】标准 JSON 格式 Web App Manifest 镜像
├── README.md                    # 本看板说明文档
│
├── .github/workflows/           # GitHub Actions 自动化部署流水线
│   └── pages.yml                # 标准双 Job (build -> deploy) Pages 构建部署契约
│
└── assets/                      # 【二级目录】前端静态资源中心
    ├── css/                     # 原生 Vanilla CSS 样式系统 (无 Tailwind 外部依赖)
    │   ├── style.css            # 基础排版、现代深色模式与主题变量
    │   ├── components.css       # 博客式卡片、多空排位榜单与 PWA 安装提示组件
    │   └── responsive.css       # 电脑宽屏与移动手机端响应式自适应适配
    ├── js/                      # 原生 ES Modules 前端交互逻辑
    │   ├── utils.js             # 异步静态 JSON 切片加载与渲染引擎
    │   └── pwa-app.js           # PWA 运行时控制器 (SW 注册、A2HS 安装引导、网络状态感知)
    ├── icons/                   # 【二级目录】PWA 全尺寸图标库 (192px/512px/maskable/apple-touch)
    ├── data/                    # 纯静态 JSON 展示数据切片 (Data Contracts)
    │   ├── base_data_summary.json       # 基础数据入库流水与资产卡片
    │   ├── predictions_latest.json      # 全截面预测排行榜与时序验证指标
    │   ├── paper_trading_latest.json    # 30 日零成本沙盘验证组合、碎股执行单与考核指标
    │   ├── model_registry.json          # 模型资产版本注册表
    │   ├── transaction_registry.json    # 全系统事务日志与调用流水
    │   ├── stock_cluster_assignments.json # 标的四大专家聚类归属表
    │   └── platform_meta.json           # 平台元数据与配置
    └── favicon.svg              # 站点矢量图标
```

---

## PWA (Progressive Web App) 渐进式应用标准实现

本平台全面落地现代 W3C PWA 工业级应用规范：
1. **可安装到桌面与移动设备 (Installable / A2HS)**：
   - 支持 Chrome、Edge、Safari、Firefox 等浏览器将平台一键安装为独立桌面/移动原生窗口应用；
   - 彻底隐藏浏览器地址栏与控制标签，提供 100% 沉浸式量化研究终端视觉体验。
2. **极速秒开与离线降级访问 (Offline First / Stale-While-Revalidate)**：
   - 页面骨架与静态资源由 Service Worker 预缓存，弱网或离线环境下依然毫秒级瞬间呈现；
   - 数据切片采用 `Stale-While-Revalidate` 策略，首屏立即从本地缓存呈现历史切片，后台异步向远程静默同步最新数据并无感替换。
3. **全平台图标与暗黑主题契合 (Adaptive Icons & Maskable)**：
   - 提供 192×192、512×512、`maskable` 自适应裁切及 Apple Touch Icon 全套图腾。

---

## 架构红线与原则
1. **纯静态只读呈现**：
   - 严格杜绝在前端执行模型推演、特征计算或业务逻辑。所有展示数据均由 GCP 算力集群或调度脚本生成为静态 JSON 切片后推入 `assets/data/`。
2. **零构建轻量化**：
   - 采用标准 HTML5 + Vanilla CSS + 原生 JavaScript，宿主机无需安装 Node.js、npm 或构建打包工具，双击即改即看。
3. **资金安全隔离**：
   - 前端绝对禁止包含任何真实交易下单私钥凭据。所有展示的挂单均标明为基准沙盘参考模型。

## 子目录说明 : assets

#### 前端静态资源与数据切片中心 (`ui/assets/`)

本目录承载 Quant-FMP 前端静态展示看板所需的全部视觉样式（CSS）、交互逻辑（JS）与纯静态展示数据切片契约（JSON）。

---

##### 目录结构与各子目录职责

```
ui/assets/
├── css/                             # 原生 Vanilla CSS 样式系统 (零 Tailwind 依赖)
│   ├── style.css                    # 基础排版、现代暗黑背景 (#0D1117) 与设计系统变量
│   ├── components.css               # 博客式技术卡片、多空排位榜单与状态徽章
│   └── responsive.css               # 电脑宽屏与手机移动端自适应响应式布局
│
├── js/                              # 原生 ES Modules 前端脚本
│   ├── utils.js                     # 异步获取 static JSON 数据并动态渲染表格与卡片
│   └── pwa-app.js                   # PWA 运行时注册与生命周期控制器
│
├── icons/                           # 【二级目录】PWA 全套应用图标 (SVG/PNG/Maskable/Apple-Touch)
│   ├── icon-192.svg / icon-192.png  # 192px 标准桌面/移动端应用图标
│   ├── icon-512.svg / icon-512.png  # 512px 高清启动屏图标
│   ├── icon-maskable.*              # 512px 自适应裁切遮罩图标
│   ├── apple-touch-icon.png         # iOS Safari 专用桌面图标
│   └── README.md                    # 图标库设计与技术规范文档
│
├── data/                            # 纯静态 JSON 展示数据契约 (Data Contracts)
│   ├── base_data_summary.json       # 基础数据入库流水与资产卡片数据
│   ├── predictions_latest.json      # 最新全截面预测榜单与时序验证表现
│   ├── model_registry.json          # 现役与历史模型注册元数据
│   ├── transaction_registry.json    # 历史执行事务统计与审计日志
│   ├── stock_cluster_assignments.json # 标的四大专家聚类归属表
│   └── platform_meta.json           # 平台元数据与重大里程碑时间轴
│
└── favicon.svg                      # 平台矢量 Favicon 站点图标
```

---

##### 静态契约规范 (Data Contract)
所有存储在 `data/` 下的文件均为纯静态只读 JSON，由自动化调度脚本（`scripts/publish_ui_repo.ps1`）在执行完云端事务后直接同步推送到 GitHub Pages 仓库，前端页面通过 `fetch()` 原生加载，确保前后端绝对解耦与资金安全。

## 子目录说明 : assets/icons

#### Quant-FMP 平台图标与 PWA 资产库 (UI Icons & PWA Assets)

> **位置**: `ui/assets/icons/`  
> **所属模块**: 前端展示层 (UI Dashboard) 资产层  
> **规范级别**: 二级目录说明文档  

---

##### 1. 目录概述 (Overview)

本目录归档 Quant-FMP 量化研究展示看板全套 Web 图标与 PWA (Progressive Web App) 渐进式应用图标资产。设计语言深度契合美股量化深空极客美学，以“Q”字环形底座、Alpha 动量上行折线与多色数据节点构成品牌图腾。

---

##### 2. 文件资产清单 (Asset Inventory)

| 文件名 | 格式 / 尺寸 | 用途与标准 | 适用平台与规范 |
| :--- | :--- | :--- | :--- |
| [`icon-192.svg`](file:///g:/我的云端硬盘/workspace/Quant-FMP/ui/assets/icons/icon-192.svg) | SVG 矢量 (192×192) | PWA 标准矢量图标源 | 现代浏览器 / 高分屏 |
| [`icon-192.png`](file:///g:/我的云端硬盘/workspace/Quant-FMP/ui/assets/icons/icon-192.png) | PNG 位图 (192×192) | PWA 标配主屏幕安装图标 | Android Chrome / 桌面 PWA |
| [`icon-512.svg`](file:///g:/我的云端硬盘/workspace/Quant-FMP/ui/assets/icons/icon-512.svg) | SVG 矢量 (512×512) | PWA 高清启动屏矢量源 | 超大屏 / 启动画面 (Splash Screen) |
| [`icon-512.png`](file:///g:/我的云端硬盘/workspace/Quant-FMP/ui/assets/icons/icon-512.png) | PNG 位图 (512×512) | PWA 高清启动画面位图 | 应用商城 / PWA 启动屏 |
| [`icon-maskable.svg`](file:///g:/我的云端硬盘/workspace/Quant-FMP/ui/assets/icons/icon-maskable.svg) | SVG 矢量 (512×512) | 自适应遮罩裁切矢量源 | Android 自适应图标系统 |
| [`icon-maskable.png`](file:///g:/我的云端硬盘/workspace/Quant-FMP/ui/assets/icons/icon-maskable.png) | PNG 位图 (512×512) | 自适应遮罩裁切位图 (Purpose: maskable) | Android 10+ 动态圆角/水滴形 |
| [`apple-touch-icon.png`](file:///g:/我的云端硬盘/workspace/Quant-FMP/ui/assets/icons/apple-touch-icon.png) | PNG 位图 (180×180) | iOS Safari 主屏幕快捷方式 | iPhone / iPad iOS WebClip |

---

##### 3. 设计规范与技术参数 (Design Specifications)

- **主色系**：
  - 极客深空背景：`#161B22` $\rightarrow$ `#090D12`（45° 线性微流光）；
  - 核心 Q 环：`#79C0FF` $\rightarrow$ `#388BFD`（科技蓝，代表稳固数据底座）；
  - Alpha 动量折线：`#388BFD` $\rightarrow$ `#BC8CFF` $\rightarrow$ `#3FB950`（蓝到紫到绿，代表模型超额 Alpha）；
- **安全边距**：
  - `maskable` 图标核心视觉区域严格收纳于中心 80% 安全圆形圈内，保证在各手机厂商自定义裁切（圆形、圆角矩形、水滴形）下不露白、不切断核心徽标。

## 子目录说明 : .github/workflows

#### GitHub Actions 自动化部署流水线配置 (`ui/.github/workflows/`)

> **位置**: `ui/.github/workflows/`  
> **所属模块**: 展示层 CI/CD 自动化流水线  
> **规范级别**: 二级目录说明文档  

---

##### 1. 目录职责概述

本目录归档 Quant-FMP 前端静态展示看板推送到远程仓库后触发的自动化部署工作流。严格遵守 GitHub Pages 官方推荐的无构建纯静态发布契约。

---

##### 2. 工作流文件清单

| 文件名 | 触发条件 | 执行环境 | 核心职责 |
| :--- | :--- | :--- | :--- |
| [`pages.yml`](file:///g:/我的云端硬盘/workspace/Quant-FMP/ui/.github/workflows/pages.yml) | `push` 至 `main` 分支 / 手动触发 | `ubuntu-latest` | 校验静态文件完整性，自动打包并部署至 GitHub Pages 托管服务 |

---

##### 3. 安全与权限规范

- **只读内容权限 (`contents: read`)**：严禁赋予写代码库权限；
- **环境安全隔离**：部署环境严格限定于 `github-pages`；
- **并发控制**：`concurrency.group: pages` 锁定串行部署，杜绝版本回退与文件冲突。
