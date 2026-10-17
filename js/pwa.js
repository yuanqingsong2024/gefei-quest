/** PWA：仅 http/https 注册 Service Worker；安装按钮；离线提示；备份提醒条。
 *  Playwright（navigator.webdriver）默认不注册，避免控制后续测试请求。
 *  site-check 的 P19c 在脚本运行前写入 localStorage gefei-quest-sw-test=1 才会注册。
 *  网络优先已经保证 JS/CSS 不会用旧缓存，这里再跳过注册，是为了不让 claim() 抢在测试请求之前。 */
(function (global) {
  var DAY = 14 * 24 * 60 * 60 * 1000;
  var deferred = null;
  global.__pwaRegisterAttempted = false;
  var regRef = null;
  var armReload = false;
  var handlers = { exportSave: null, openImport: null, snooze: null };

  function canRegister() {
    try {
      if (location.protocol !== 'http:' && location.protocol !== 'https:') return false;
      if (!('serviceWorker' in navigator) || !navigator.serviceWorker) return false;
      if (navigator.webdriver) {
        var flag = '';
        try { flag = localStorage.getItem('gefei-quest-sw-test') || ''; } catch (e) { return false; }
        if (flag !== '1') return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function isStandalone() {
    try {
      if (global.matchMedia && global.matchMedia('(display-mode: standalone)').matches) return true;
      if (navigator.standalone === true) return true;
    } catch (e) {}
    return false;
  }

  function isIOS() {
    var ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/i.test(ua)) return true;
    try {
      if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true;
    } catch (e) {}
    return false;
  }

  function hasProgress(state) {
    if (!state || typeof state !== 'object') return false;
    if (Array.isArray(state.done) && state.done.length) return true;
    var sites = state.sites && state.sites.items;
    if (Array.isArray(sites) && sites.length) return true;
    var kws = state.keywords && state.keywords.items;
    if (Array.isArray(kws) && kws.length) return true;
    if (Array.isArray(state.reviews) && state.reviews.length) return true;
    return false;
  }

  function due(state) {
    if (!hasProgress(state)) return false;
    var snooze = state.backupSnoozeUntil && Date.parse(state.backupSnoozeUntil);
    if (snooze && snooze > Date.now()) return false;
    var t = state.lastBackupAt && Date.parse(state.lastBackupAt);
    if (!t) return true;
    return (Date.now() - t) > DAY;
  }

  function backupHtml(state) {
    if (!due(state)) return '';
    var I = global.QuestIcons ? global.QuestIcons.svg('download') : '';
    return '<div id="backup-reminder" class="backup-reminder" role="status">' +
      '<p>' + I + '进度只保存在这个浏览器里。换浏览器、清站点数据或换设备都会丢失，请定期导出一份 JSON 备份。</p>' +
      '<div class="backup-actions">' +
      '<button type="button" class="btn btn-sm btn-primary" id="backup-export">导出备份</button>' +
      '<button type="button" class="btn btn-sm" id="backup-import">从备份恢复</button>' +
      '<button type="button" class="btn btn-sm" id="backup-snooze">14 天后再提醒</button>' +
      '</div></div>';
  }

  function showUpdateBar() {
    if (document.getElementById('pwa-update')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'pwa-update';
    btn.className = 'pwa-update';
    btn.textContent = '有新版本，点此刷新';
    document.body.appendChild(btn);
  }

  function track(reg) {
    if (!reg) return;
    regRef = reg;
    function waiting() {
      if (reg.waiting && navigator.serviceWorker.controller) showUpdateBar();
    }
    waiting();
    reg.addEventListener('updatefound', function () {
      var sw = reg.installing;
      if (!sw) return;
      sw.addEventListener('statechange', function () {
        if (sw.state === 'installed' && navigator.serviceWorker.controller) showUpdateBar();
      });
    });
  }

  function postSkip() {
    armReload = true;
    var reg = regRef;
    var send = function (r) {
      var worker = r && r.waiting;
      if (worker) worker.postMessage({ type: 'SKIP_WAITING' });
    };
    if (reg && reg.waiting) { send(reg); return; }
    if (!navigator.serviceWorker || !navigator.serviceWorker.getRegistration) return;
    navigator.serviceWorker.getRegistration().then(send).catch(function () {});
  }

  function runPrompt() {
    if (!deferred || typeof deferred.prompt !== 'function') return;
    var pending = deferred;
    var result = pending.prompt();
    var choice = pending.userChoice;
    var finish = function () { if (deferred === pending) deferred = null; sync(); };
    if (choice && typeof choice.then === 'function') choice.then(finish, finish);
    else if (result && typeof result.then === 'function') result.then(finish, finish);
    else finish();
  }

  function sync() {
    try { document.documentElement.classList.toggle('is-offline', navigator.onLine === false); } catch (e) {}
    var buttons = document.querySelectorAll('[data-pwa-install]');
    if (!document.getElementById('pwa-install') && buttons[0]) buttons[0].id = 'pwa-install';
    var showInstall = !!deferred && !isStandalone();
    for (var i = 0; i < buttons.length; i++) buttons[i].hidden = !showInstall;
    var ios = isIOS() && !deferred && !isStandalone();
    var hints = document.querySelectorAll('.pwa-ios-hint');
    for (var j = 0; j < hints.length; j++) hints[j].hidden = !ios;
  }

  function registerSW() {
    if (!canRegister()) return;
    global.__pwaRegisterAttempted = true;
    navigator.serviceWorker.register('./sw.js').then(track).catch(function () {});
  }

  if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (!armReload) return;
      armReload = false;
      global.location.reload();
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('#backup-export, #backup-import, #backup-snooze, #pwa-update, #pwa-install, [data-pwa-install]');
    if (!t) return;
    if (t.id === 'backup-export') { e.preventDefault(); if (handlers.exportSave) handlers.exportSave(); return; }
    if (t.id === 'backup-import') { e.preventDefault(); if (handlers.openImport) handlers.openImport(); return; }
    if (t.id === 'backup-snooze') { e.preventDefault(); if (handlers.snooze) handlers.snooze(); return; }
    if (t.id === 'pwa-update') { e.preventDefault(); postSkip(); return; }
    if (t.id === 'pwa-install' || t.hasAttribute('data-pwa-install')) { e.preventDefault(); runPrompt(); }
  });

  global.addEventListener('beforeinstallprompt', function (e) {
    if (e && e.preventDefault) e.preventDefault();
    deferred = e;
    sync();
  });
  global.addEventListener('appinstalled', function () {
    deferred = null;
    sync();
  });
  global.addEventListener('online', sync);
  global.addEventListener('offline', sync);

  registerSW();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync);
  else sync();

  global.QuestPWA = {
    backupHtml: backupHtml,
    due: due,
    hasProgress: hasProgress,
    sync: sync,
    bind: function (h) {
      if (!h) return;
      if (h.exportSave) handlers.exportSave = h.exportSave;
      if (h.openImport) handlers.openImport = h.openImport;
      if (h.snooze) handlers.snooze = h.snooze;
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
