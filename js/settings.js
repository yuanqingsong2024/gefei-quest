/** 设置面板 */
(function (global) {
  function renderSettings(state, root, handlers) {
    if (!root) return;
    const s = state.settings || {};
    root.innerHTML = `
      <div class="panel-head">
        <h2>设置</h2>
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
        <div class="setting-row setting-danger">
          <span>
            <strong>重置存档</strong>
            <small>需输入「重置」二次确认</small>
          </span>
          <button type="button" class="btn btn-danger btn-sm" id="set-reset">重置…</button>
        </div>
      </div>
      <div class="resources-box">
        <h3>资料柜</h3>
        <ul class="resource-list">
          ${(global.QuestData.RESOURCES || [])
            .map(
              (r) =>
                `<li><a href="${r.url}" target="_blank" rel="noopener noreferrer">${r.title}</a></li>`
            )
            .join('')}
        </ul>
        <p class="hint">版本 MVP · 出海小站练站营 · 非收益承诺</p>
      </div>`;

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
  }

  global.QuestSettings = { renderSettings };
})(typeof window !== 'undefined' ? window : globalThis);
