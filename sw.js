/* 出海小站练站营 · Service Worker
 * CACHE_VERSION：发布时请 +1。缓存名是 gefei-quest-v<CACHE_VERSION>。
 * 激活时会删掉其他 gefei-quest-* 缓存。
 * HTML / JSON / JS / CSS / webmanifest 以及导航请求走网络优先（失败才用缓存），
 * 所以 GitHub Pages 上的新文件下次打开就会生效，不必等用户点「刷新」。
 * 图片和字体走缓存优先。只缓存同源 GET 且 status === 200 的响应。
 * skipWaiting 只在页面 postMessage {type:'SKIP_WAITING'} 之后。 */
const CACHE_VERSION = 5;
const CACHE_NAME = 'gefei-quest-v' + CACHE_VERSION;

const PRECACHE = [
  './index.html',
  './manifest.webmanifest',
  './daily.json',
  './css/tokens.css',
  './css/ui.css',
  './js/icons.js',
  './js/nav.js',
  './js/save.js',
  './js/data.js',
  './js/progress.js',
  './js/sfx.js',
  './js/ui-modal.js',
  './js/achievements.js',
  './js/weekly.js',
  './js/settings.js',
  './js/resources.js',
  './js/guides-data.js',
  './js/guides.js',
  './js/tools.js',
  './js/changelog.js',
  './js/stats.js',
  './js/rank-data.js',
  './js/rank.js',
  './js/platform-data.js',
  './js/platform-links.js',
  './js/platforms.js',
  './js/home.js',
  './js/war-room.js',
  './js/map.js',
  './js/quest.js',
  './js/ai.js',
  './js/workbench.js',
  './js/share.js',
  './js/google.js',
  './js/work.js',
  './js/ideas.js',
  './js/compact.js',
  './js/shell.js',
  './js/pwa.js',
  './js/start.js',
  './js/tour.js',
  './js/hints.js',
  './js/app.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/logo.svg',
  './assets/hero-bg.webp',
];

self.addEventListener('install', (event) => {
  event.waitUntil(precache());
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (data && data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('gefei-quest-') && k !== CACHE_NAME).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function precache() {
  const cache = await caches.open(CACHE_NAME);
  for (let i = 0; i < PRECACHE.length; i++) {
    const url = PRECACHE[i];
    const res = await fetch(new Request(url, { cache: 'reload' }));
    if (!res || res.status !== 200) throw new Error('precache ' + url + ' status ' + (res && res.status));
    await cache.put(url, res);
  }
}

function pathOf(url) {
  return url.pathname || '';
}

function networkFirstKind(url, req) {
  if (req.mode === 'navigate') return true;
  const path = pathOf(url);
  if (path.endsWith('/')) return true;
  return /\.(html?|json|webmanifest|js|css)$/i.test(path);
}

function cacheFirstKind(url) {
  return /\.(png|jpe?g|gif|webp|svg|ico|avif|woff2?|ttf|otf|eot)$/i.test(pathOf(url));
}

function canStore(res) {
  return !!(res && res.status === 200 && res.type === 'basic' && !res.redirected);
}

function cacheKey(req) {
  const u = new URL(req.url);
  u.hash = '';
  return new Request(u.toString(), { method: 'GET' });
}

async function store(req, res) {
  if (!canStore(res)) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(cacheKey(req), res.clone());
  } catch (e) { /* 个别响应无法写入时忽略 */ }
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  const nav = req.mode === 'navigate';
  try {
    const res = await fetch(req);
    if (canStore(res)) await store(req, res);
    return res;
  } catch (err) {
    const hit = await cache.match(cacheKey(req)) || await cache.match(req);
    if (hit) return hit;
    if (nav || /\.html?$/i.test(new URL(req.url).pathname)) {
      const index = await cache.match('./index.html');
      if (index) return index;
    }
    return new Response('离线，且没有可用缓存', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  const hit = await cache.match(cacheKey(req));
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (canStore(res)) await store(req, res);
    return res;
  } catch (err) {
    return hit || new Response('', { status: 503 });
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;
  if (networkFirstKind(url, req)) {
    event.respondWith(networkFirst(req));
    return;
  }
  if (cacheFirstKind(url)) {
    event.respondWith(cacheFirst(req));
    return;
  }
  event.respondWith(networkFirst(req));
});
