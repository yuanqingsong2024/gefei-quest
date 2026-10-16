/** 站一作战室 · 固定 Day1–7 */
(function (global) {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function chapterUnlocked(state, chapterId) {
    return (state.unlocked || []).indexOf(chapterId) >= 0;
  }

  function isDone(state, id) {
    return (state.done || []).indexOf(id) >= 0;
  }

  function dayProgress(state, day) {
    const ids = day.questIds || [];
    const done = ids.filter((id) => isDone(state, id)).length;
    return { done, total: ids.length, complete: ids.length > 0 && done === ids.length };
  }

  function firstIncompleteDayIndex(state, days) {
    for (let i = 0; i < days.length; i++) {
      if (!dayProgress(state, days[i]).complete) return i;
    }
    return Math.max(0, days.length - 1);
  }

  function renderQuestRow(state, q, locked) {
    if (!q) return '';
    const checked = isDone(state, q.id);
    const tags = [];
    if (q.boss) tags.push('<span class="tag tag-boss">BOSS</span>');
    if (q.side) tags.push('<span class="tag">支线</span>');
    return `
      <label class="war-quest ${locked ? 'is-locked' : ''} ${checked ? 'is-done' : ''}">
        <input type="checkbox" data-quest-id="${esc(q.id)}"
          ${checked ? 'checked' : ''} ${locked ? 'disabled' : ''} />
        <span class="war-quest-body">
          <span class="war-quest-title">${esc(q.title)} ${tags.join(' ')}</span>
          <span class="war-quest-action">${esc(q.action || '')}</span>
          <span class="war-quest-meta"><code>${esc(q.id)}</code> · ${q.xp || 0} XP</span>
        </span>
      </label>`;
  }

  /**
   * @param {object} state
   * @param {HTMLElement} root
   * @param {{ onToggle: Function, onGotoQuest?: Function }} handlers
   */
  function renderWarRoom(state, root, handlers) {
    if (!root) return;
    const days = global.QuestData.STATION_ONE_DAYS || [];
    let mainDone = 0;
    let mainTotal = 0;
    days.forEach((d) => {
      const p = dayProgress(state, d);
      mainDone += p.done;
      mainTotal += p.total;
    });
    const focusIdx = firstIncompleteDayIndex(state, days);

    root.innerHTML = `
      <div class="panel-head">
        <h2>站一作战室</h2>
        <p class="panel-sub">固定 Day1–7 · 勾选与「任务」页同源存档 · <strong>无需选路径</strong></p>
        <div class="war-toolbar">
          <span class="war-progress" aria-live="polite">主线进度 ${mainDone}/${mainTotal}</span>
          <a class="btn btn-primary btn-sm" href="./starters/station-one/" target="_blank" rel="noopener noreferrer">打开 Starter</a>
          <a class="btn btn-sm" href="./docs/station-one-playbook.md" target="_blank" rel="noopener noreferrer">作战手册</a>
          <button type="button" class="btn btn-sm" id="war-goto-quest">打开任务板</button>
        </div>
      </div>
      <div class="war-days">
        ${days
          .map((day, idx) => {
            const prog = dayProgress(state, day);
            const isToday = idx === focusIdx;
            const rows = (day.questIds || [])
              .map((id) => {
                const q = global.QuestData.getQuest(id);
                const locked = q ? !chapterUnlocked(state, q.chapterId) : true;
                return renderQuestRow(state, q, locked);
              })
              .join('');
            const opt = (day.optionalQuestIds || [])
              .map((id) => {
                const q = global.QuestData.getQuest(id);
                const locked = q ? !chapterUnlocked(state, q.chapterId) : true;
                return renderQuestRow(state, q, locked);
              })
              .join('');
            return `
            <section class="war-day ${isToday ? 'war-day-today' : ''} ${prog.complete ? 'war-day-done' : ''}" data-day="${day.day}">
              <header class="war-day-head">
                <h3>Day ${day.day} · ${esc(day.title)}</h3>
                <span class="war-day-count">${prog.done}/${prog.total}${isToday ? ' · 当前推进' : ''}${prog.complete ? ' · 完成' : ''}</span>
              </header>
              <p class="war-day-tip">${esc(day.tip || '')}</p>
              <div class="war-quest-list">${rows}</div>
              ${
                opt
                  ? `<details class="war-optional"><summary>可选支线</summary><div class="war-quest-list">${opt}</div></details>`
                  : ''
              }
            </section>`;
          })
          .join('')}
      </div>
      <p class="hint war-foot">收录慢时 Day7 Boss 可延后勾选。诚实声明：不保证收益。</p>`;

    root.querySelectorAll('input[data-quest-id]').forEach((input) => {
      input.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-quest-id');
        if (handlers && handlers.onToggle) {
          handlers.onToggle(id, e.target.checked, e.target);
        }
      });
    });
    const gotoBtn = root.querySelector('#war-goto-quest');
    if (gotoBtn && handlers && handlers.onGotoQuest) {
      gotoBtn.addEventListener('click', () => handlers.onGotoQuest());
    }
  }

  global.QuestWarRoom = { renderWarRoom, dayProgress, firstIncompleteDayIndex };
})(typeof window !== 'undefined' ? window : globalThis);
