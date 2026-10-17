/** 设置面板 */
(function (global) {
  function renderSettings(state, root, handlers) {
    if (!root) return;
    const s = state.settings || {};
    root.innerHTML = `
      <div class="panel-head">
        <h2>偏好与存档</h2>
        <p class="panel-sub">进度存在本机浏览器 · key: <code>${global.QuestSave.SAVE_KEY}</code></p>
      </div>
      <div class="settings-list">
        <label class="setting-row">
          <span>
            <strong>静音</strong>
            <small>默认开启；关闭后勾选可播短提示音</small>
          </span>
          <input type="checkbox" id="set-muted" ${s.muted ? 'checked' : ''} />
        </label>
        <label class="setting-row">
          <span>
            <strong>体力系统</strong>
            <small>默认关闭；开启后每日 5 点，每勾选耗 1</small>
          </span>
          <input type="checkbox" id="set-energy" ${s.energyEnabled ? 'checked' : ''} />
        </label>
        <label class="setting-row">
          <span>
            <strong>减少动态</strong>
            <small>关闭 XP 飘字位移与长过场动画</small>
          </span>
          <input type="checkbox" id="set-motion" ${s.reduceMotion ? 'checked' : ''} />
        </label>
        <div class="setting-row">
          <span>
            <strong>导出 / 导入存档</strong>
            <small>JSON 仅本机；换浏览器可带走进度</small>
          </span>
          <span class="setting-actions">
            <button type="button" class="btn btn-sm" id="set-export">导出</button>
            <button type="button" class="btn btn-sm" id="set-import">导入…</button>
            <input type="file" id="set-import-file" accept="application/json,.json" hidden />
          </span>
        </div>
        <div class="setting-row" id="pwa-install-row">
          <span>
            <strong>安装到桌面</strong>
            <small>安装后可从主屏幕打开。进度仍只在本机浏览器。</small>
          </span>
          <span class="setting-actions">
            <button type="button" class="btn btn-sm" id="pwa-install" data-pwa-install hidden>安装到桌面</button>
          </span>
        </div>
        <p class="hint pwa-ios-hint" hidden>Safari 分享 → 添加到主屏幕</p>
        <div class="setting-row setting-danger">
          <span>
            <strong>重置存档</strong>
            <small>需输入「重置」二次确认</small>
          </span>
          <button type="button" class="btn btn-danger btn-sm" id="set-reset">重置…</button>
        </div>
      </div>

    `;

    root.querySelector('#set-muted').addEventListener('change', (e) => {
      handlers.onToggle('muted', e.target.checked);
    });
    root.querySelector('#set-energy').addEventListener('change', (e) => {
      handlers.onToggle('energyEnabled', e.target.checked);
    });
    root.querySelector('#set-motion').addEventListener('change', (e) => {
      handlers.onToggle('reduceMotion', e.target.checked);
    });
    root.querySelector('#set-reset').addEventListener('click', () => {
      handlers.onReset();
    });
    const gotoRes = root.querySelector('#set-goto-resources');
    if (gotoRes && handlers.onGotoResources) {
      gotoRes.addEventListener('click', () => handlers.onGotoResources());
    }
    const gotoWar = root.querySelector('#set-goto-war');
    if (gotoWar && handlers.onGotoWar) {
      gotoWar.addEventListener('click', () => handlers.onGotoWar(1));
    }
    const gotoWar2 = root.querySelector('#set-goto-war-s2');
    if (gotoWar2 && handlers.onGotoWar) {
      gotoWar2.addEventListener('click', () => handlers.onGotoWar(2));
    }
    const gotoWar3 = root.querySelector('#set-goto-war-s3');
    if (gotoWar3 && handlers.onGotoWar) {
      gotoWar3.addEventListener('click', () => handlers.onGotoWar(3));
    }
    const gotoWarM = root.querySelector('#set-goto-war-m');
    if (gotoWarM && handlers.onGotoWar) {
      gotoWarM.addEventListener('click', () => handlers.onGotoWar(4));
    }
    const gotoWarX = root.querySelector('#set-goto-war-x');
    if (gotoWarX && handlers.onGotoWar) {
      gotoWarX.addEventListener('click', () => handlers.onGotoWar(5));
    }
    const exp = root.querySelector('#set-export');
    if (exp && handlers.onExportSave) {
      exp.addEventListener('click', () => handlers.onExportSave());
    }
    const imp = root.querySelector('#set-import');
    const file = root.querySelector('#set-import-file');
    if (imp && file && handlers.onImportSave) {
      imp.addEventListener('click', () => file.click());
      file.addEventListener('change', () => {
        const f = file.files && file.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const obj = JSON.parse(String(reader.result || ''));
            handlers.onImportSave(obj);
          } catch (e) {
            if (global.QuestModal) global.QuestModal.showToast('导入失败：不是合法 JSON');
          }
          file.value = '';
        };
        reader.readAsText(f);
      });
    }
  }

  global.QuestSettings = { renderSettings };
})(typeof window !== 'undefined' ? window : globalThis);
