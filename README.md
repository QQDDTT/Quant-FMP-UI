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
├── README.md                    # 本看板说明文档
│
├── .github/workflows/           # GitHub Actions 自动化部署流水线
│   └── pages.yml                # 标准双 Job (build -> deploy) Pages 构建部署契约
│
└── assets/                      # 【二级目录】前端静态资源中心
    ├── css/                     # 原生 Vanilla CSS 样式系统 (无 Tailwind 外部依赖)
    │   ├── style.css            # 基础排版、现代深色模式与主题变量
    │   ├── components.css       # 博客式卡片、多空排位榜单与徽章组件
    │   └── responsive.css       # 电脑宽屏与移动手机端响应式自适应适配
    ├── js/                      # 原生 ES Modules 前端交互逻辑
    │   └── utils.js             # 异步静态 JSON 切片加载与渲染引擎
    ├── data/                    # 纯静态 JSON 展示数据切片 (Data Contracts)
    │   ├── base_data_summary.json       # 基础数据入库流水与资产卡片
    │   ├── predictions_latest.json      # 全截面预测排行榜与时序验证指标
    │   ├── paper_trading_latest.json    # 30 日零成本沙盘验证组合、碎股执行单与考核指标
    │   ├── trading_orders_latest.json   # 沙盘参考组合与调仓指令 (标注零持仓)
    │   ├── model_registry.json          # 模型资产版本注册表
    │   ├── transaction_registry.json    # 全系统事务日志与调用流水
    │   ├── stock_cluster_assignments.json # 标的四大专家聚类归属表
    │   └── platform_meta.json           # 平台元数据与配置
    └── favicon.svg              # 站点矢量图标
```

---

## 架构红线与原则
1. **纯静态只读呈现**：
   - 严格杜绝在前端执行模型推演、特征计算或业务逻辑。所有展示数据均由 GCP 算力集群或调度脚本生成为静态 JSON 切片后推入 `assets/data/`。
2. **零构建轻量化**：
   - 采用标准 HTML5 + Vanilla CSS + 原生 JavaScript，宿主机无需安装 Node.js、npm 或构建打包工具，双击即改即看。
3. **资金安全隔离**：
   - 前端绝对禁止包含任何真实交易下单私钥凭据。所有展示的挂单均标明为基准沙盘参考模型。
