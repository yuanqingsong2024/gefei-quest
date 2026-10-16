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
        <div class="setting-row setting-danger">
          <span>
            <strong>重置存档</strong>
            <small>需输入「重置」二次确认</small>
          </span>
          <button type="button" class="btn btn-danger btn-sm" id="set-reset">重置…</button>
        </div>
      </div>

      <div class="res-lib-banner war-entry-banner">
        <h3>⚔️ 作战室（站一 / 站二）</h3>
        <p class="panel-sub">固定 Day1–7 + Starter；站二灰锁至站一 Boss。无需选路径。</p>
        <p class="res-lib-actions">
          <button type="button" class="btn btn-primary btn-sm" id="set-goto-war">打开站一作战室</button>
          <button type="button" class="btn btn-sm" id="set-goto-war-s2">打开站二作战室</button>
          <a href="./starters/station-one/" class="btn btn-sm" target="_blank" rel="noopener noreferrer">站一 Starter</a>
          <a href="./starters/station-two/" class="btn btn-sm" target="_blank" rel="noopener noreferrer">站二 Starter</a>
          <a href="./docs/station-one-playbook.md" class="btn btn-sm" target="_blank" rel="noopener noreferrer">站一手册</a>
          <a href="./docs/station-two-playbook.md" class="btn btn-sm" target="_blank" rel="noopener noreferrer">站二手册</a>
        </p>
      </div>

      <div class="res-lib-banner">
        <h3>📚 资源库</h3>
        <p class="panel-sub">免费工具、托管、变现、可试路径、闲鱼·非实物、技巧、同路人与文档，分类筛选一站浏览。</p>
        <p class="res-lib-actions">
          <a href="./resources.html" class="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">打开独立资源库页</a>
          <button type="button" class="btn btn-sm" id="set-goto-resources">在本页打开「资源库」页签</button>
        </p>
      </div>

      <div class="channels-box">
        <h3>可试渠道 / 羊毛与工具</h3>
        <p class="panel-sub peers-intro">摘要面板（与「资源库」同源数据）。额度与规则会变；收入≠保证。完整分类筛选见上方资源库。</p>
        ${(global.QuestData.TRY_CHANNEL_CATEGORIES || [])
          .map((cat) => {
            const items = (global.QuestData.TRY_CHANNELS || []).filter((c) => c.cat === cat.id);
            if (!items.length) return '';
            return `
            <div class="channel-cat">
              <h4 class="channel-cat-title">${cat.emoji} ${cat.name}</h4>
              <div class="peer-grid">
                ${items
                  .map(
                    (c) => `
                  <article class="peer-card channel-card">
                    <h4>${c.name}</h4>
                    <p class="peer-line">${c.blurb}</p>
                    <p class="peer-steal"><span class="tag">怎么试</span> ${c.how}</p>
                    <p class="peer-caveat">注意：${c.caveat}</p>
                    ${c.url ? `<a href="${c.url}" target="_blank" rel="noopener noreferrer">打开</a>` : ''}
                  </article>`
                  )
                  .join('')}
              </div>
            </div>`;
          })
          .join('')}
        <p class="hint"><a href="./docs/channels-and-tips.md" target="_blank" rel="noopener noreferrer">完整渠道与技巧笔记</a></p>
      </div>

      <div class="peers-box">
        <h3>同路人方法</h3>
        <p class="panel-sub peers-intro">公开博主 / 官方框架摘要（非付费社群课）。点开读原文；收入案例≠保证。</p>
        <div class="peer-grid">
          ${(global.QuestData.PEER_METHODS || [])
            .map(
              (p) => `
            <article class="peer-card">
              <h4>${p.name}</h4>
              <p class="peer-line">${p.oneLiner}</p>
              <p class="peer-steal"><span class="tag">可偷</span> ${p.steal}</p>
              <p class="peer-caveat">注意：${p.caveat}</p>
              <a href="${p.url}" target="_blank" rel="noopener noreferrer">打开原文</a>
            </article>`
            )
            .join('')}
        </div>
        <p class="hint"><a href="./docs/peer-methods.md" target="_blank" rel="noopener noreferrer">完整调研笔记</a></p>
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
        <p class="hint">版本 Phase 2 · 出海小站练站营 · 非收益承诺</p>
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
