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

      <div class="channels-box">
        <h3>可试渠道 / 羊毛与工具</h3>
        <p class="panel-sub peers-intro">公开免费档、正规联盟、可试路径，以及单独一类「闲鱼·非实物」（数字品/技能服务）。额度与规则会变；收入≠保证。完整笔记见下方链接。</p>
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
