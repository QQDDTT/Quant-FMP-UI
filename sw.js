/**
 * Quant-FMP Research PWA Service Worker (sw.js)
 * 
 * 核心特性:
 *  1. 静态骨架预缓存 (Pre-cache Shell): 秒开离线量化大屏
 *  2. 运行时动态数据切片 (Stale-While-Revalidate): 零延迟渲染 + 异步静默增量刷新
 *  3. 离线降级防穿透 (Offline Fallback)
 *  4. 自动版本演进与过期旧缓存清理 (Cache Busting & Clients Claim)
 */

const CACHE_VERSION = 'quant-fmp-pwa-v1.0.1';
const DATA_CACHE_NAME = 'quant-fmp-data-v1.0.1';

// 核心骨架静态资源清单
const CORE_PRECACHE_ASSETS = [
  './',
  './index.html',
  './transactions.html',
  './base-data-transactions.html',
  './model-transactions.html',
  './trading-transactions.html',
  './assets/css/style.css',
  './assets/css/components.css',
  './assets/css/responsive.css',
  './assets/js/utils.js',
  './assets/js/pwa-app.js',
  './assets/favicon.svg',
  './manifest.webmanifest',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable.png',
  './assets/icons/apple-touch-icon.png',
  './assets/data/platform_meta.json',
  './assets/data/transaction_registry.json',
  './assets/data/paper_trading_latest.json',
  './assets/data/predictions_latest.json',
  './assets/data/model_registry.json',
  './assets/data/base_data_summary.json',
  './assets/data/data_validation_summary.json'
];

// 1. 安装生命周期 (Install)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('[ServiceWorker] 预缓存平台骨架与核心数据切片...');
      // 容错预缓存: 逐个抓取，防止单个文件 404 导致整个 ServiceWorker 安装失败
      return Promise.allSettled(
        CORE_PRECACHE_ASSETS.map((url) => {
          return fetch(url, { cache: 'no-cache' }).then((response) => {
            if (!response.ok) {
              throw new Error(`Failed to fetch ${url} (status: ${response.status})`);
            }
            return cache.put(url, response);
          });
        })
      ).then(() => {
        console.log('[ServiceWorker] 核心资源缓存就绪，立即接管客户端');
        return self.skipWaiting();
      });
    })
  );
});

// 2. 激活生命周期 (Activate)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_VERSION && name !== DATA_CACHE_NAME) {
            console.log(`[ServiceWorker] 清理过时旧缓存: ${name}`);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] 新版本已完全激活，立即接管页面请求');
      return self.clients.claim();
    })
  );
});

// 3. 拦截请求与路由缓存策略 (Fetch)
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 只处理 GET 请求且同源请求
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // 策略 A: 数据切片 JSON 文件采用 Stale-While-Revalidate 策略
  if (url.pathname.includes('/assets/data/') && url.pathname.endsWith('.json')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((err) => {
            console.warn(`[ServiceWorker] 数据网络拉取失败，依赖本地缓存: ${url.pathname}`, err);
            return cachedResponse;
          });

          // 如果缓存中有，立即返回缓存加速首屏，同时后台拉取；如果缓存没有，则等待网络
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 策略 B: 页面导航请求 (HTML) 采用 Network-First 降级 Cache 策略 (确保发布后用户能快速看到新版本)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // 找不到具体页面时回退到首页
          return caches.match('./index.html');
        });
      })
    );
    return;
  }

  // 策略 C: 样式、脚本、图片、字体等静态资源采用 Cache-First 策略
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return networkResponse;
      });
    })
  );
});
