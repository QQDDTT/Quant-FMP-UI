# 前端静态资源与数据切片中心 (`ui/assets/`)

本目录承载 Quant-FMP 前端静态展示看板所需的全部视觉样式（CSS）、交互逻辑（JS）与纯静态展示数据切片契约（JSON）。

---

## 目录结构与各子目录职责

```
ui/assets/
├── css/                             # 原生 Vanilla CSS 样式系统 (零 Tailwind 依赖)
│   ├── style.css                    # 基础排版、现代暗黑背景 (#0D1117) 与设计系统变量
│   ├── components.css               # 博客式技术卡片、多空排位榜单与状态徽章
│   └── responsive.css               # 电脑宽屏与手机移动端自适应响应式布局
│
├── js/                              # 原生 ES Modules 前端脚本
│   └── utils.js                     # 异步获取 static JSON 数据并动态渲染表格与卡片
│
├── data/                            # 纯静态 JSON 展示数据契约 (Data Contracts)
│   ├── base_data_summary.json       # 基础数据入库流水与资产卡片数据
│   ├── predictions_latest.json      # 最新全截面预测榜单与时序验证表现
│   ├── trading_orders_latest.json   # 模拟沙盘参考组合与调仓限价单 (显式声明零持仓)
│   ├── model_registry.json          # 现役与历史模型注册元数据
│   ├── transaction_registry.json    # 历史执行事务统计与审计日志
│   ├── stock_cluster_assignments.json # 标的四大专家聚类归属表
│   └── platform_meta.json           # 平台元数据与重大里程碑时间轴
│
└── favicon.svg                      # 平台矢量 Favicon 站点图标
```

---

## 静态契约规范 (Data Contract)
所有存储在 `data/` 下的文件均为纯静态只读 JSON，由自动化调度脚本（`scripts/publish_ui_repo.ps1`）在执行完云端事务后直接同步推送到 GitHub Pages 仓库，前端页面通过 `fetch()` 原生加载，确保前后端绝对解耦与资金安全。
