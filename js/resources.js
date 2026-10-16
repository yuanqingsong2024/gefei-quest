/** 资源库 · 分类筛选 + 关键词搜索 */
(function (global) {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderChannelCard(c) {
    const hay = [c.name, c.blurb, c.how, c.caveat, c.id].join(' ').toLowerCase();
    return `
      <article class="peer-card channel-card" data-cat="${esc(c.cat)}" data-hay="${esc(hay)}">
        <h4>${esc(c.name)}</h4>
        <p class="peer-line">${esc(c.blurb)}</p>
        <p class="peer-steal"><span class="tag">怎么试</span> ${esc(c.how)}</p>
        <p class="peer-caveat">注意：${esc(c.caveat)}</p>
        ${c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">打开</a>` : ''}
      </article>`;
  }

  function renderPeerCard(p) {
    const hay = [p.name, p.oneLiner, p.steal, p.caveat].join(' ').toLowerCase();
    return `
      <article class="peer-card" data-hay="${esc(hay)}">
        <h4>${esc(p.name)}</h4>
        <p class="peer-line">${esc(p.oneLiner)}</p>
        <p class="peer-steal"><span class="tag">可偷</span> ${esc(p.steal)}</p>
        <p class="peer-caveat">注意：${esc(p.caveat)}</p>
        <a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">打开原文</a>
      </article>`;
  }

  /**
   * @param {HTMLElement} root
   * @param {{ embedded?: boolean }} opts
   */
  function renderLibrary(root, opts) {
    if (!root) return;
    const embedded = !!(opts && opts.embedded);
    const cats = global.QuestData.TRY_CHANNEL_CATEGORIES || [];
    const channels = global.QuestData.TRY_CHANNELS || [];
    const peers = global.QuestData.PEER_METHODS || [];
    const docs = [
      { title: '站一作战手册', url: './docs/station-one-playbook.md' },
      { title: '站二作战手册', url: './docs/station-two-playbook.md' },
      { title: '站三作战手册', url: './docs/station-three-playbook.md' },
      { title: '变现港作战手册', url: './docs/monetize-playbook.md' },
      { title: '放大航线作战手册', url: './docs/scale-playbook.md' },
      { title: 'Phase 2 路线图', url: './docs/PHASE2-ROADMAP.md' },
      { title: 'Phase 3 路线图', url: './docs/PHASE3-ROADMAP.md' },
      { title: 'Phase 4 路线图', url: './docs/PHASE4-ROADMAP.md' },
      { title: 'Phase 5 路线图', url: './docs/PHASE5-ROADMAP.md' },
      { title: '资源库扩容配方', url: './docs/resource-expansion.md' },
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
        <div class="war-toolbar res-station-bar">
          <a class="btn btn-primary btn-sm" href="./index.html#war">站一</a>
          <a class="btn btn-sm" href="./index.html#war-s2">站二</a>
          <a class="btn btn-sm" href="./index.html#war-s3">站三</a>
          <a class="btn btn-sm" href="./index.html#war-m">变现</a>
          <a class="btn btn-sm" href="./index.html#war-x">放大</a>
          <a class="btn btn-sm" href="./starters/station-one/" target="_blank" rel="noopener noreferrer">站一 Starter</a>
          <a class="btn btn-sm" href="./starters/station-two/" target="_blank" rel="noopener noreferrer">站二 Starter</a>
          <a class="btn btn-sm" href="./docs/station-one-playbook.md" target="_blank" rel="noopener noreferrer">站一手册</a>
          <a class="btn btn-sm" href="./docs/station-two-playbook.md" target="_blank" rel="noopener noreferrer">站二手册</a>
          <a class="btn btn-sm" href="./docs/station-three-playbook.md" target="_blank" rel="noopener noreferrer">站三手册</a>
          <a class="btn btn-sm" href="./docs/monetize-playbook.md" target="_blank" rel="noopener noreferrer">变现手册</a>
          <a class="btn btn-sm" href="./docs/scale-playbook.md" target="_blank" rel="noopener noreferrer">放大手册</a>
        </div>
        ${
          embedded
            ? ''
            : `<p class="res-back"><a href="./index.html">← 返回练站营</a></p>`
        }
      </div>

      <div class="res-search-row">
        <label class="res-search-label" for="res-search">搜索</label>
        <input type="search" id="res-search" class="res-search" placeholder="关键词：如 闲鱼、GSC、AdSense…" autocomplete="off" />
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
                  `<li data-hay="${esc(d.title.toLowerCase())}"><a href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">${esc(d.title)}</a></li>`
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
    const searchInput = root.querySelector('#res-search');
    let currentFilter = 'all';
    let currentQ = '';

    function apply() {
      buttons.forEach((btn) => {
        const on = btn.getAttribute('data-filter') === currentFilter;
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      const q = currentQ.trim().toLowerCase();
      let visible = 0;
      sectionsRoot.querySelectorAll('.res-section').forEach((sec) => {
        const sid = sec.getAttribute('data-section');
        const sectionOk = currentFilter === 'all' || sid === currentFilter;
        if (!sectionOk) {
          sec.hidden = true;
          return;
        }
        let sectionVisible = 0;
        sec.querySelectorAll('.peer-card, .res-doc-list li').forEach((card) => {
          const hay = (card.getAttribute('data-hay') || card.textContent || '').toLowerCase();
          const match = !q || hay.indexOf(q) >= 0;
          card.hidden = !match;
          if (match) {
            sectionVisible += 1;
            visible += 1;
          }
        });
        sec.hidden = sectionVisible === 0;
      });
      const label =
        currentFilter === 'all'
          ? '全部'
          : (filterChips.find((f) => f.id === currentFilter) || {}).label || currentFilter;
      countEl.textContent = q
        ? `当前：${label} · 搜索「${currentQ.trim()}」· ${visible} 条`
        : `当前：${label} · ${visible} 条`;
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        currentFilter = btn.getAttribute('data-filter');
        apply();
      });
    });
    searchInput.addEventListener('input', () => {
      currentQ = searchInput.value || '';
      apply();
    });
    apply();
  }

  global.QuestResources = { renderLibrary };
})(typeof window !== 'undefined' ? window : globalThis);
