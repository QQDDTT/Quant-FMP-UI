/**
 * Quant-FMP Research PWA 客户端运行时管理器 (pwa-app.js)
 * 
 * 职责:
 *  1. Service Worker 渐进式探测与全生命周期注册
 *  2. 桌面与移动端 Web App 安装提权 (A2HS - Add to Home Screen)
 *  3. 离线缓存状态感知与网络通断平滑提示
 *  4. Standalone 独立应用沉浸式状态栏与视口优化
 */

(function () {
  'use strict';

  let deferredInstallPrompt = null;

  // 1. 注册 Service Worker
  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] 当前浏览器环境不支持 Service Worker');
      return;
    }

    window.addEventListener('load', () => {
      // 动态识别当前基准路径，确保在根域名或二级目录均可准确定位 sw.js
      const swUrl = './sw.js';

      navigator.serviceWorker.register(swUrl, { scope: './' })
        .then((registration) => {
          console.log('[PWA] Service Worker 注册成功，作用域:', registration.scope);

          // 监听更新
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('[PWA] 发现新版本数据与代码，已就绪可随时静默切换');
                    showToast('平台数据与界面已更新至最新版本', 'info');
                  } else {
                    console.log('[PWA] 内容已离线缓存，支持离线秒开访问');
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker 注册失败:', error);
        });
    });
  }

  // 2. 捕获 PWA 安装引导事件 (A2HS)
  function initInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // 阻止浏览器默认粗暴弹窗
      e.preventDefault();
      deferredInstallPrompt = e;
      console.log('[PWA] 捕获到可安装事件 (beforeinstallprompt)');

      // 渲染顶栏安装轻量入口
      renderInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] 应用已成功安装到用户主屏幕/系统桌面');
      deferredInstallPrompt = null;
      removeInstallButton();
      showToast('Quant-FMP 已成功添加到主屏幕！', 'success');
    });
  }

  // 3. 渲染顶栏极简安装按钮
  function renderInstallButton() {
    if (document.getElementById('pwaInstallBtn')) return;

    const navContainer = document.querySelector('.nav-container');
    if (!navContainer) return;

    const installBtn = document.createElement('button');
    installBtn.id = 'pwaInstallBtn';
    installBtn.className = 'pwa-install-btn';
    installBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: -2px;">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      安装桌面应用
    `;
    installBtn.setAttribute('title', '将 Quant-FMP 作为独立全功能客户端安装至电脑或手机主屏幕');

    installBtn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      console.log(`[PWA] 用户安装选择: ${outcome}`);
      deferredInstallPrompt = null;
      removeInstallButton();
    });

    // 插入在菜单按钮前
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
      navContainer.insertBefore(installBtn, menuToggle);
    } else {
      navContainer.appendChild(installBtn);
    }
  }

  function removeInstallButton() {
    const btn = document.getElementById('pwaInstallBtn');
    if (btn) btn.remove();
  }

  // 4. 网络在线/离线平滑状态感知
  function initNetworkStatusWatchdog() {
    function updateNetworkStatus() {
      if (!navigator.onLine) {
        showToast('已进入离线只读模式 · 数据完全由本地缓存安全提供', 'warning', 6000);
        document.body.classList.add('is-offline');
      } else {
        document.body.classList.remove('is-offline');
      }
    }

    window.addEventListener('online', () => {
      showToast('网络已恢复连接 · 正在同步最新量化数据', 'success', 3000);
      document.body.classList.remove('is-offline');
    });
    window.addEventListener('offline', updateNetworkStatus);

    if (!navigator.onLine) {
      updateNetworkStatus();
    }
  }

  // 5. 极简金融极客风 Toast 提示框
  function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('pwaToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'pwaToastContainer';
      container.className = 'pwa-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `pwa-toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // 6. 判定是否已处于独立应用模式 (Standalone Mode)
  function checkDisplayMode() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      console.log('[PWA] 运行于 Standalone 原生应用容器模式');
      document.documentElement.classList.add('pwa-standalone');
    }
  }

  // 初始化执行
  registerServiceWorker();
  initInstallPrompt();
  initNetworkStatusWatchdog();
  checkDisplayMode();
})();
