/** 资源库 · 分类筛选浏览 TRY_CHANNELS / PEER_METHODS / 文档 */
(function (global) {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderChannelCard(c) {
    return `
      <article class="peer-card channel-card" data-cat="${esc(c.cat)}">
        <h4>${esc(c.name)}</h4>
        <p class="peer-line">${esc(c.blurb)}</p>
        <p class="peer-steal"><span class="tag">怎么试</span> ${esc(c.how)}</p>
        <p class="peer-caveat">注意：${esc(c.caveat)}</p>
        ${c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">打开</a>` : ''}
      </article>`;
  }

  function renderPeerCard(p) {
    return `
      <article class="peer-card">
        <h4>${esc(p.name)}</h4>
        <p class="peer-line">${esc(p.oneLiner)}</p>
        <p class="peer-steal"><span class="tag">可偷</span> ${esc(p.steal)}</p>
        <p class="peer-caveat">注意：${esc(p.caveat)}</p>
        <a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">打开原文</a>
      </article>`;
  }

  /**
   * @param {HTMLElement} root
   * @param {{ embedded?: boolean }} opts embedded=true 时省略顶栏返回链（用于 SPA 页签）
   */
  function renderLibrary(root, opts) {
    if (!root) return;
    const embedded = !!(opts && opts.embedded);
    const cats = global.QuestData.TRY_CHANNEL_CATEGORIES || [];
    const channels = global.QuestData.TRY_CHANNELS || [];
    const peers = global.QuestData.PEER_METHODS || [];
    const docs = [
      { title: '可试渠道 · 羊毛与工具笔记', url: './docs/channels-and-tips.md' },
      { title: '同路人方法调研笔记', url: './docs/peer-methods.md' },
      { title: '周更模板', url: './docs/weekly-template.md' },
    ];

    const filterChips = [
      { id: 'all', label: '全部', emoji: '📚' },
      ...cats.map((c) => ({ id: c.id, label: c.name, emoji: c.emoji })),
      { id: 'peers', label: '同路人方法', emoji: '🤝' },
      { id: 'docs', label: '文档笔记', emoji: '📄' },
    ];

    root.innerHTML = `
      <div class="panel-head">
        <h2>资源库</h2>
        <p class="panel-sub">免费工具 · 托管 · 变现 · 可试路径 · 闲鱼非实物 · 技巧 · 同路人 · 文档。公开摘要，额度与规则会变；收入≠保证。</p>
        ${
          embedded
            ? ''
            : `<p class="res-back"><a href="./index.html">← 返回练站营</a></p>`
        }
      </div>

      <div class="res-filters" role="tablist" aria-label="资源分类">
        ${filterChips
          .map(
            (f, i) => `
          <button type="button" class="res-filter-btn${i === 0 ? ' active' : ''}" role="tab"
            data-filter="${esc(f.id)}" aria-selected="${i === 0 ? 'true' : 'false'}">
            ${f.emoji} ${esc(f.label)}
          </button>`
          )
          .join('')}
      </div>

      <p class="res-count" id="res-count" aria-live="polite"></p>

      <div class="res-sections" id="res-sections">
        ${cats
          .map((cat) => {
            const items = channels.filter((c) => c.cat === cat.id);
            if (!items.length) return '';
            return `
            <section class="res-section channel-cat" data-section="${esc(cat.id)}">
              <h3 class="channel-cat-title">${cat.emoji} ${esc(cat.name)} <span class="res-sec-n">(${items.length})</span></h3>
              <div class="peer-grid">${items.map(renderChannelCard).join('')}</div>
            </section>`;
          })
          .join('')}

        <section class="res-section channel-cat" data-section="peers">
          <h3 class="channel-cat-title">🤝 同路人方法 <span class="res-sec-n">(${peers.length})</span></h3>
          <p class="panel-sub peers-intro">公开博主 / 官方框架摘要（非付费社群课）。</p>
          <div class="peer-grid">${peers.map(renderPeerCard).join('')}</div>
        </section>

        <section class="res-section channel-cat" data-section="docs">
          <h3 class="channel-cat-title">📄 文档笔记 <span class="res-sec-n">(${docs.length})</span></h3>
          <ul class="resource-list res-doc-list">
            ${docs
              .map(
                (d) =>
                  `<li><a href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">${esc(d.title)}</a></li>`
              )
              .join('')}
          </ul>
        </section>
      </div>

      <p class="hint res-foot">
        ${embedded ? '<a href="./resources.html" target="_blank" rel="noopener noreferrer">独立页面打开资源库</a> · ' : ''}
        设置里仍保留「可试渠道 / 同路人」摘要面板。
      </p>`;

    const sectionsRoot = root.querySelector('#res-sections');
    const countEl = root.querySelector('#res-count');
    const buttons = root.querySelectorAll('.res-filter-btn');

    function applyFilter(filterId) {
      buttons.forEach((btn) => {
        const on = btn.getAttribute('data-filter') === filterId;
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      let visible = 0;
      sectionsRoot.querySelectorAll('.res-section').forEach((sec) => {
        const sid = sec.getAttribute('data-section');
        const show = filterId === 'all' || sid === filterId;
        sec.hidden = !show;
        if (show) {
          const n = sec.querySelectorAll('.peer-card, .res-doc-list li').length;
          visible += n;
        }
      });
      const label =
        filterId === 'all'
          ? '全部'
          : (filterChips.find((f) => f.id === filterId) || {}).label || filterId;
      countEl.textContent = `当前：${label} · ${visible} 条`;
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => applyFilter(btn.getAttribute('data-filter')));
    });
    applyFilter('all');
  }

  global.QuestResources = { renderLibrary };
})(typeof window !== 'undefined' ? window : globalThis);
