/** 任务板 · 勾选结算 */
(function (global) {
  function floatXp(anchor, amount, reduceMotion) {
    if (!anchor) return;
    const el = document.createElement('span');
    el.className = 'xp-float';
    el.textContent = `+${amount} XP`;
    const rect = anchor.getBoundingClientRect();
    el.style.left = rect.left + rect.width / 2 + 'px';
    el.style.top = rect.top + 'px';
    document.body.appendChild(el);
    if (reduceMotion) {
      setTimeout(() => el.remove(), 600);
    } else {
      requestAnimationFrame(() => el.classList.add('xp-float-go'));
      setTimeout(() => el.remove(), 900);
    }
  }

  function renderBoard(state, chapterId, root, onToggle) {
    if (!root) return;
    const ch = global.QuestData.getChapter(chapterId);
    if (!ch) {
      root.innerHTML = '<p class="empty">未知章节</p>';
      return;
    }
    const quests = global.QuestData.getQuestsByChapter(chapterId);
    const done = new Set(state.done || []);
    const status = global.QuestProgress.chapterStatus(chapterId, state);

    root.innerHTML = `
      <div class="panel-head">
                <h2 class="with-ico"><span class="card-ico">${global.QuestNav ? global.QuestNav.icon(ch.icon) : ch.emoji}</span>${ch.name}<small class="nick">${ch.nick || ''}</small></h2>
        <p class="panel-sub">${ch.blurb} · 状态：${
          status === 'cleared' ? '已通关' : status === 'active' ? '进行中' : '锁定'
        }</p>
      </div>
      <div class="quest-list">
        ${quests
          .map((q) => {
            const checked = done.has(q.id);
            const tags = [];
            if (q.boss) tags.push('<span class="tag tag-boss">Boss</span>');
            else if (q.side) tags.push('<span class="tag tag-side">支线</span>');
            else tags.push('<span class="tag">主线</span>');
            if (q.required) tags.push('<span class="tag tag-req">必做</span>');
            return `
            <article class="quest-card ${checked ? 'done' : ''} ${q.boss ? 'is-boss' : ''}">
              <label class="quest-check">
                <input type="checkbox" data-quest="${q.id}" ${checked ? 'checked' : ''}
                  ${status === 'locked' ? 'disabled' : ''} />
                <span class="quest-title-wrap">
                  <span class="quest-title">${q.title}</span>
                  <span class="quest-xp">+${q.xp} XP</span>
                </span>
              </label>
              <div class="quest-tags">${tags.join('')}</div>
              <details class="quest-details">
                <summary>动作 / 工具 / 标准 / 坑</summary>
                <dl>
                  <dt>动作</dt><dd>${q.action}</dd>
                  <dt>工具</dt><dd>${q.tools}</dd>
                  <dt>完成标准</dt><dd>${q.doneCriteria}</dd>
                  ${q.pitfalls ? `<dt>常见坑</dt><dd>${q.pitfalls}</dd>` : ''}
                </dl>
              </details>
            </article>`;
          })
          .join('')}
      </div>`;

    const back = root.querySelector('#back-map');
    if (back && onToggle) {
      back.addEventListener('click', () => onToggle({ type: 'back' }));
    }

    root.querySelectorAll('[data-quest]').forEach((box) => {
      box.addEventListener('change', (e) => {
        const id = box.getAttribute('data-quest');
        if (onToggle) onToggle({ type: 'toggle', questId: id, checked: box.checked, el: box });
      });
    });
  }

  /**
   * 勾选或取消
   * @returns {{ state, ok, reason?, xpDelta?, newly?, chapterCleared?, chapter? }}
   */
  function toggleQuest(state, questId, checked) {
    const q = global.QuestData.getQuest(questId);
    if (!q) return { state, ok: false, reason: 'missing' };

    const status = global.QuestProgress.chapterStatus(q.chapterId, state);
    if (status === 'locked') return { state, ok: false, reason: 'locked' };

    const done = new Set(state.done || []);
    let next = { ...state, done: [...done] };
    let xpDelta = 0;
    let chapterCleared = false;
    let chapter = null;

    if (checked) {
      if (done.has(questId)) return { state, ok: false, reason: 'already' };
      if (!global.QuestProgress.canSpendEnergy(next)) {
        return { state, ok: false, reason: 'no-energy' };
      }
      next = global.QuestProgress.spendEnergy(next);
      next.done = [...done, questId];
      next.xp = (next.xp || 0) + q.xp;
      xpDelta = q.xp;
      next = global.QuestProgress.applyCheckIn(next);

      const beforeCleared = new Set(next.cleared || []);
      next = global.QuestProgress.recomputeUnlocks(next);
      const afterCleared = new Set(next.cleared || []);
      if (afterCleared.has(q.chapterId) && !beforeCleared.has(q.chapterId)) {
        chapterCleared = true;
        chapter = global.QuestData.getChapter(q.chapterId);
      }
    } else {
      if (!done.has(questId)) return { state, ok: false, reason: 'not-done' };
      done.delete(questId);
      next.done = Array.from(done);
      next.xp = Math.max(0, (next.xp || 0) - q.xp);
      xpDelta = -q.xp;
      next = global.QuestProgress.recomputeUnlocks(next);
    }

    const ach = global.QuestAchievements.checkAchievements(next);
    next = ach.state;

    return {
      state: next,
      ok: true,
      xpDelta,
      newly: ach.newly,
      chapterCleared,
      chapter,
      quest: q,
    };
  }

  global.QuestBoard = { renderBoard, toggleQuest, floatXp };
})(typeof window !== 'undefined' ? window : globalThis);
