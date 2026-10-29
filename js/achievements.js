/** 成就检测与墙 · DESIGN-SPEC §6.3 */
(function (global) {
  function checkAchievements(state) {
    const have = new Set(state.achievements || []);
    const newly = [];
    const dates = { ...(state.achievementDates || {}) };
    const done = new Set(state.done || []);
    const cleared = new Set(state.cleared || []);

    const tryUnlock = (id) => {
      if (have.has(id)) return;
      have.add(id);
      newly.push(id);
      dates[id] = new Date().toISOString().slice(0, 10);
    };

    if ((state.done || []).length >= 1) tryUnlock('ach-first-check');
    if (cleared.has('ch-prologue')) tryUnlock('ach-prologue-clear');
    if (cleared.has('ch-stage1')) tryUnlock('ach-site-indexed');
    if (done.has('q-s1-04')) tryUnlock('ach-gsc-ready');
    if (cleared.has('ch-stage2')) tryUnlock('ach-blue-sea');
    if (cleared.has('ch-stage3')) tryUnlock('ach-archipelago');
    if ((state.weeklyClaimed || []).length >= 4) tryUnlock('ach-ship-4');
    if ((state.streak || 0) >= 7) tryUnlock('ach-streak-7');
    if (cleared.has('ch-monetize')) tryUnlock('ach-monetize-aware');
    if (cleared.has('ch-scale')) tryUnlock('ach-scale-plan');

    return {
      state: {
        ...state,
        achievements: Array.from(have),
        achievementDates: dates,
      },
      newly,
    };
  }

  function renderWall(state, root) {
    if (!root) return;
    const list = global.QuestData.ACHIEVEMENTS;
    const have = new Set(state.achievements || []);
    const dates = state.achievementDates || {};

    root.innerHTML = `
      <div class="panel-head">
        <h2>成就墙</h2>
        <p class="panel-sub">已解锁 <strong>${have.size}</strong> / ${list.length} · 一旦获得不随取消勾选消失</p>
      </div>
      <div class="ach-grid">
        ${list
          .map((a) => {
            const unlocked = have.has(a.id);
            const date = dates[a.id] || '';
            return `
            <article class="ach-card ${unlocked ? 'unlocked' : 'locked'}" title="${a.desc}">
              <div class="ach-icon" aria-hidden="true">${a.icon}</div>
              <h3>${a.name}</h3>
              <p class="ach-desc">${a.desc}</p>
              <p class="ach-meta">${unlocked ? (date ? '解锁于 ' + date : '已解锁') : '未解锁'}</p>
            </article>`;
          })
          .join('')}
      </div>`;
  }

  global.QuestAchievements = { checkAchievements, renderWall };
})(typeof window !== 'undefined' ? window : globalThis);
