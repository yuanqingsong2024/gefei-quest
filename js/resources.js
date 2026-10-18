/** 资源库 · 分类筛选 + 关键词搜索 */
(function (global) {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function channelLink(c) {
    if (!c.url) return '';
    if (/^https?:/i.test(c.url) && global.QuestSources) {
      var s = QuestSources.fromLegacy(c.url, '');
      s.title = '查看详情';
      return QuestSources.render([s], { compact: true });
    }
    var ext = /^https?:/i.test(c.url) || /^\.\//.test(c.url);
    return `<a class="card-link" href="${esc(c.url)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>查看详情 →</a>`;
  }
  function peerLink(p) {
    if (!p.url) return '';
    if (/^https?:/i.test(p.url) && global.QuestSources) {
      var s = QuestSources.fromLegacy(p.url, '');
      s.title = p.name || '原文';
      return QuestSources.render([s], { compact: true });
    }
    return `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">打开原文 ↗</a>`;
  }
  function renderChannelCard(c) {
    const hay = [c.name, c.blurb, c.how, c.caveat, c.id].join(' ').toLowerCase();
    return `
      <article class="peer-card channel-card" data-cat="${esc(c.cat)}" data-hay="${esc(hay)}">
        <h4>${esc(c.name)}</h4>
        <p class="peer-line">${esc(c.blurb)}</p>
        <p class="peer-steal"><span class="tag">怎么试</span> ${esc(c.how)}</p>
        <p class="peer-caveat">注意：${esc(c.caveat)}</p>
        ${channelLink(c)}
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
        ${peerLink(p)}
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

    const NV = global.QuestNav;
    const ico = (id) => {
      const c = NV ? NV.LIB_CATS.find((x) => x.id === id) : null;
      return NV ? NV.icon(c ? c.icon : 'toolbox') : '';
    };
    const filterChips = [
      { id: 'all', label: '全部' },
      ...cats.map((c) => ({ id: c.id, label: c.name })),
      { id: 'peers', label: '同路人方法' },
    ];

    root.innerHTML = `
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
            ${ico(f.id)}<span>${esc(f.label)}</span>
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
              <h3 class="channel-cat-title"><span class="card-ico">${ico(cat.id)}</span>${esc(cat.name)} <span class="res-sec-n">(${items.length})</span></h3>
              <div class="peer-grid">${items.map(renderChannelCard).join('')}</div>
            </section>`;
          })
          .join('')}

        <section class="res-section channel-cat" data-section="peers">
          <h3 class="channel-cat-title"><span class="card-ico">${ico('peers')}</span>同路人方法 <span class="res-sec-n">(${peers.length})</span></h3>
          <p class="panel-sub peers-intro">公开博主 / 官方框架摘要（非付费社群课）。</p>
          <div class="peer-grid">${peers.map(renderPeerCard).join('')}</div>
        </section>

      </div>

      <p class="hint res-foot">公开摘要，额度与规则以官网为准；收入≠保证。完整笔记见「手册与模板 › <a href="#guide-channels-and-tips">渠道与羊毛笔记</a>」。</p>`;

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
      let emptyEl = root.querySelector('#lib-empty');
      if (!emptyEl) { emptyEl = document.createElement('div'); emptyEl.id = 'lib-empty'; emptyEl.className = 'empty-illo'; countEl.parentNode.insertBefore(emptyEl, countEl.nextSibling); }
      emptyEl.hidden = visible > 0;
      emptyEl.innerHTML = visible > 0 ? '' : global.QuestIcons.illo('search') + '<p><b>没有匹配的资源</b><br>换个关键词，或切回「全部」分类；也可以按 <kbd>/</kbd> 搜索全站。</p>';
      countEl.textContent = q
        ? `当前：${label} · 搜索「${currentQ.trim()}」· ${visible} 条`
        : `当前：${label} · ${visible} 条`;
    }

    function filterFromHash() {
      const h = (location.hash || '').replace(/^#/, '');
      if (!h) return;
      const known = filterChips.map((f) => f.id);
      // support #tools / #xianyu / #cat-tools
      let id = h;
      if (id.indexOf('cat-') === 0) id = id.slice(4);
      if (known.indexOf(id) >= 0) currentFilter = id;
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        currentFilter = btn.getAttribute('data-filter');
        try {
          history.replaceState(null, '', currentFilter === 'all' ? '#lib' : '#lib-' + currentFilter);
          if (opts && opts.onFilter) opts.onFilter(currentFilter);
        } catch (_) {}
        apply();
      });
    });
    searchInput.addEventListener('input', () => {
      currentQ = searchInput.value || '';
      apply();
    });
    if (opts && opts.filter && filterChips.some((f) => f.id === opts.filter)) currentFilter = opts.filter;
    if (false) {
      filterFromHash();
      window.addEventListener('hashchange', () => {
        filterFromHash();
        apply();
      });
    }
    apply();
  }

  global.QuestResources = { renderLibrary };
})(typeof window !== 'undefined' ? window : globalThis);
