/** 港口商船 · WEEKLY_UPDATES */
(function (global) {
  function renderShip(state, root, onClaim) {
    if (!root) return;
    const items = global.QuestData.WEEKLY_UPDATES || [];
    const claimed = new Set(state.weeklyClaimed || []);

    root.innerHTML = `
      <div class="panel-head">
        <h2>本周补给卡</h2>
        <p class="panel-sub">读完一张卡可领一次 XP。当前已暂停每周追加；已有卡片仍可领取，不会影响你的存档。</p>
      </div>
      <div class="ship-list">
        ${
          items.length
            ? items
                .map((w) => {
                  const got = claimed.has(w.id);
                  const tags = (w.tags || [])
                    .map((t) => `<span class="tag">${t}</span>`)
                    .join('');
                  const link = w.url
                    ? `<a href="${w.url}" target="_blank" rel="noopener noreferrer">阅读详情 →</a>`
                    : '<span class="hint">无外链详情（见上方摘要）</span>';
                  return `
              <article class="ship-card ${got ? 'claimed' : ''}">
                <div class="ship-top">
                  <h3>${w.title}</h3>
                  <span class="ship-week">${w.week || ''}</span>
                </div>
                <p class="ship-summary">${w.summary}</p>
                <div class="ship-tags">${tags}</div>
                <div class="ship-actions">
                  ${link}
                  <button type="button" class="btn btn-gold btn-sm"
                    data-claim="${w.id}" ${got ? 'disabled' : ''}>
                    ${got ? '已领取' : `领取 +${w.xp || 5} XP`}
                  </button>
                </div>
              </article>`;
                })
                .join('')
            : '<div class="empty-illo">' + global.QuestIcons.illo('list') + '<p><b>暂无补给</b><br>周一再来看看。</p></div>'
        }
      </div>`;

    root.querySelectorAll('[data-claim]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-claim');
        if (onClaim) onClaim(id);
      });
    });
  }

  function claimWeekly(state, id) {
    if ((state.weeklyClaimed || []).includes(id)) {
      return { state, ok: false, reason: 'already' };
    }
    const item = (global.QuestData.WEEKLY_UPDATES || []).find((w) => w.id === id);
    if (!item) return { state, ok: false, reason: 'missing' };

    let next = {
      ...state,
      xp: (state.xp || 0) + (item.xp || 5),
      weeklyClaimed: [...(state.weeklyClaimed || []), id],
    };
    next = global.QuestProgress.applyCheckIn(next);
    const ach = global.QuestAchievements.checkAchievements(next);
    next = ach.state;
    return { state: next, ok: true, xp: item.xp || 5, newly: ach.newly };
  }

  global.QuestWeekly = { renderShip, claimWeekly };
})(typeof window !== 'undefined' ? window : globalThis);
