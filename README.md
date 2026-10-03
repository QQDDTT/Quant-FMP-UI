# Quant-FMP UI Dashboard

美股量化系统 **Quant-FMP** 静态展示看板（GitHub Pages 纯前端呈现层）。

## 页面模块
- **基础数据面板 (`index.html` / `base-data-transactions.html`)**: 展示全美股标的池画像、实时行情异动与基本面财报就绪状态。
- **模型概览与训练流水线 (`model-transactions.html`)**: 展示模型池排行榜（LightGBM、PatchTST 等）与滚动时序切片指标。
- **动态预测与多空排行榜 (`transactions.html`)**: 结合事实新闻调参推演的多空胜率排行榜。

## 架构说明
本项目遵守系统架构分工：
- 仅作为轻量级静态展示前端（UI）。
- 不运行任何后端或重度计算，所有数据源由主工程或 GCP 节点生成并推送到 `assets/data/` 目录供页面呈现。
