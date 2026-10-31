/**
 * ==============================================================================
 * Quant-FMP Research - 原生数据加载与工具函数 (utils.js)
 * 零构建 ES 模块：支持防缓存异步 fetch 与内联平滑贝塞尔 SVG 微走势绘制
 * ==============================================================================
 */

/**
 * 异步读取 GCP 离线导出的纯静态切片 JSON
 * @param {string} filename - assets/data 下的文件名
 * @returns {Promise<Object|null>}
 */
export async function fetchStaticData(filename) {
  const url = `assets/data/${filename}?_t=${Date.now()}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[Quant-FMP] 读取静态数据 ${filename} 异常:`, err);
    return null;
  }
}

/**
 * 纯原生 SVG 绘制无依赖贝塞尔平滑微走势 (Sparkline)
 * @param {number[]} values - 价格点序列
 * @param {string} color - 走势线条颜色 (#3FB950 或 #F85149)
 * @returns {string} SVG HTML 字符串
 */
export function generateSparklineSVG(values, color = '#3FB950') {
  if (!values || values.length < 2) return '';
  const width = 80, height = 24, padding = 2;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((val, idx) => {
    const x = padding + (idx / (values.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((val - min) / range) * (height - 2 * padding);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="display:inline-block;vertical-align:middle;">
      <path d="${pathD}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

/**
 * 初始化通用移动端汉堡折叠导航
 */
export function setupMobileNav() {
  const toggleBtn = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }
}

/**
 * 通用弹窗控制器
 * @param {string} modalId - 弹窗容器 ID
 * @returns {{ open: (title: string, contentHtml: string, footerHtml?: string) => void, close: () => void }}
 */
export function createModal(modalId) {
  let modal = document.getElementById(modalId);
  if (!modal) {
    modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-dialog" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title" id="${modalId}_title">详情信息</div>
          <button class="modal-close-btn" id="${modalId}_close" aria-label="关闭">&times;</button>
        </div>
        <div class="modal-tabs" id="${modalId}_tabs" style="display:none;"></div>
        <div class="modal-body" id="${modalId}_body"></div>
        <div class="modal-footer" id="${modalId}_footer"></div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = document.getElementById(`${modalId}_close`);
    closeBtn.addEventListener('click', () => closeModal());

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
  }

  const titleEl = document.getElementById(`${modalId}_title`);
  const tabsEl = document.getElementById(`${modalId}_tabs`);
  const bodyEl = document.getElementById(`${modalId}_body`);
  const footerEl = document.getElementById(`${modalId}_footer`);

  function openModal(title, bodyHtml, options = {}) {
    titleEl.innerHTML = title;
    bodyEl.innerHTML = bodyHtml;

    if (options.tabs && options.tabs.length > 0) {
      tabsEl.style.display = 'flex';
      tabsEl.innerHTML = options.tabs.map((tab, idx) => `
        <button class="modal-tab-btn ${idx === 0 ? 'active' : ''}" data-tab-target="${tab.id}">${tab.label}</button>
      `).join('');

      tabsEl.querySelectorAll('.modal-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          tabsEl.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const targetId = btn.getAttribute('data-tab-target');
          bodyEl.querySelectorAll('.modal-tab-pane').forEach(pane => {
            pane.style.display = pane.id === targetId ? 'block' : 'none';
          });
        });
      });
    } else {
      tabsEl.style.display = 'none';
      tabsEl.innerHTML = '';
    }

    if (options.footer) {
      footerEl.style.display = 'flex';
      footerEl.innerHTML = options.footer;
    } else {
      footerEl.style.display = 'none';
      footerEl.innerHTML = '';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  return { open: openModal, close: closeModal };
}

/**
 * 绘制真实走势 vs 多模型预测的轻量级对比 SVG 图表
 * @param {Array<{ date: string, actual?: number, actual_return_5d?: number, predA?: number, pred_active_model?: number, predB?: number, pred_exp_lgbm_v1?: number }>} dataSeries
 * @param {number} width
 * @param {number} height
 * @returns {string} SVG HTML
 */
export function generateComparisonSVG(dataSeries, width = 680, height = 220) {
  if (!dataSeries || dataSeries.length < 2) return '<div style="color:var(--text-muted);padding:1rem;">暂无足够的对齐序列</div>';
  const pad = { top: 20, right: 30, bottom: 30, left: 45 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  // 统一字段适配：支持 actual / actual_return_5d, predA / pred_active_model, predB / pred_exp_lgbm_v1
  const normalizedSeries = dataSeries.map(d => ({
    date: d.date || '',
    actual: Number(d.actual != null ? d.actual : d.actual_return_5d),
    predA: Number(d.predA != null ? d.predA : d.pred_active_model),
    predB: (d.predB != null || d.pred_exp_lgbm_v1 != null) ? Number(d.predB != null ? d.predB : d.pred_exp_lgbm_v1) : null
  }));

  let allVals = [];
  normalizedSeries.forEach(d => {
    if (!isNaN(d.actual)) allVals.push(d.actual);
    if (!isNaN(d.predA)) allVals.push(d.predA);
    if (d.predB != null && !isNaN(d.predB)) allVals.push(d.predB);
  });

  if (allVals.length === 0) {
    return '<div style="color:var(--text-muted);padding:1rem;">序列数据不全，无法生成对比图</div>';
  }

  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const range = (maxVal - minVal) === 0 ? 0.01 : (maxVal - minVal);

  const getX = (idx) => pad.left + (idx / Math.max(1, normalizedSeries.length - 1)) * innerW;
  const getY = (val) => {
    if (isNaN(val)) return pad.top + innerH / 2;
    return pad.top + innerH - ((val - minVal) / range) * innerH;
  };

  const actualPoints = normalizedSeries.map((d, i) => `${getX(i).toFixed(1)},${getY(d.actual).toFixed(1)}`).join(' L ');
  const predAPoints = normalizedSeries.map((d, i) => `${getX(i).toFixed(1)},${getY(d.predA).toFixed(1)}`).join(' L ');
  const hasPredB = normalizedSeries.some(d => d.predB != null && !isNaN(d.predB));
  const predBPoints = hasPredB ? normalizedSeries.map((d, i) => `${getX(i).toFixed(1)},${getY(d.predB != null ? d.predB : d.predA).toFixed(1)}`).join(' L ') : '';

  // 生成网格线与 Y 轴刻度
  const yTicks = [minVal, (minVal + maxVal) / 2, maxVal];
  const gridLines = yTicks.map(t => {
    const yVal = getY(t);
    const y = isNaN(yVal) ? (pad.top + innerH / 2).toFixed(1) : yVal.toFixed(1);
    return `
      <line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="var(--border-muted)" stroke-dasharray="3,3" />
      <text x="${pad.left - 8}" y="${(parseFloat(y) + 4).toFixed(1)}" fill="var(--text-muted)" font-size="10" text-anchor="end">${(t * 100).toFixed(1)}%</text>
    `;
  }).join('');

  // X 轴日期标注（首、中、尾）
  const xLabels = [0, Math.floor(normalizedSeries.length / 2), normalizedSeries.length - 1].map(idx => {
    const d = normalizedSeries[idx];
    if (!d || !d.date) return '';
    return `<text x="${getX(idx).toFixed(1)}" y="${height - 8}" fill="var(--text-muted)" font-size="10" text-anchor="middle">${d.date.slice(5)}</text>`;
  }).join('');

  return `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow:visible; font-family:var(--font-mono);">
      ${gridLines}
      ${xLabels}
      <!-- 真实价格超额收益折线 (实线 白色/强调) -->
      <path d="M ${actualPoints}" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
      <!-- 模型 A 预测折线 (青色 虚线) -->
      <path d="M ${predAPoints}" fill="none" stroke="#58A6FF" stroke-width="2" stroke-dasharray="5,4" stroke-linecap="round" />
      <!-- 模型 B 预测折线 (紫色 点线) -->
      ${hasPredB ? `<path d="M ${predBPoints}" fill="none" stroke="#BC8CFF" stroke-width="2" stroke-dasharray="2,3" stroke-linecap="round" />` : ''}
    </svg>
    <div style="display:flex; justify-content:center; gap:1.5rem; margin-top:0.75rem; font-size:0.8rem; font-family:var(--font-mono);">
      <span style="display:flex; align-items:center; gap:0.4rem; color:#FFFFFF;"><span style="display:inline-block;width:14px;height:3px;background:#FFFFFF;"></span> 真实 5 日收益</span>
      <span style="display:flex; align-items:center; gap:0.4rem; color:#58A6FF;"><span style="display:inline-block;width:14px;height:2px;background:#58A6FF;border-top:1px dashed #58A6FF;"></span> Active Model 预测</span>
      ${hasPredB ? `<span style="display:flex; align-items:center; gap:0.4rem; color:#BC8CFF;"><span style="display:inline-block;width:14px;height:2px;background:#BC8CFF;"></span> 基线候选对比</span>` : ''}
    </div>
  `;
}
