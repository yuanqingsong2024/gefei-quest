/** 作战室 · 站一 / 站二 · 固定 Day1–7 */
(function (global) {
  let activeStation = 1; // 1 | 2

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

  /** 站二勾选解锁：站一 Boss 已勾 或 站二岛已开 */
  function stationTwoInteractive(state) {
    return isDone(state, 'q-s1-boss') || chapterUnlocked(state, 'ch-stage2');
  }

  function dayProgress(state, day) {
    const ids = day.questIds || [];
    if (ids.length === 0) {
      // 巩固日：无强制主线，不挡「当前推进」
      return { done: 0, total: 0, complete: true, soft: true };
    }
    const done = ids.filter((id) => isDone(state, id)).length;
    return { done, total: ids.length, complete: done === ids.length, soft: false };
  }

  function firstIncompleteDayIndex(state, days) {
    for (let i = 0; i < days.length; i++) {
      const p = dayProgress(state, days[i]);
      if (p.soft) continue;
      if (!p.complete) return i;
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

  function renderDays(state, days, stationLocked) {
    const focusIdx = firstIncompleteDayIndex(state, days);
    return days
      .map((day, idx) => {
        const prog = dayProgress(state, day);
        const isToday = !stationLocked && idx === focusIdx && !prog.soft;
        const rows = (day.questIds || [])
          .map((id) => {
            const q = global.QuestData.getQuest(id);
            const chapterLock = q ? !chapterUnlocked(state, q.chapterId) : true;
            const locked = stationLocked || chapterLock;
            return renderQuestRow(state, q, locked);
          })
          .join('');
        const opt = (day.optionalQuestIds || [])
          .map((id) => {
            const q = global.QuestData.getQuest(id);
            const chapterLock = q ? !chapterUnlocked(state, q.chapterId) : true;
            const locked = stationLocked || chapterLock;
            return renderQuestRow(state, q, locked);
          })
          .join('');
        let countLabel;
        if (prog.soft) {
          countLabel = '巩固日 · 无强制主线';
        } else {
          countLabel =
            prog.done +
            '/' +
            prog.total +
            (isToday ? ' · 当前推进' : '') +
            (prog.complete ? ' · 完成' : '');
        }
        return `
            <section class="war-day ${isToday ? 'war-day-today' : ''} ${
              prog.complete && !prog.soft ? 'war-day-done' : ''
            } ${prog.soft ? 'war-day-soft' : ''}" data-day="${day.day}">
              <header class="war-day-head">
                <h3>Day ${day.day} · ${esc(day.title)}</h3>
                <span class="war-day-count">${countLabel}</span>
              </header>
              <p class="war-day-tip">${esc(day.tip || '')}</p>
              <div class="war-quest-list">${rows || (prog.soft ? '<p class="hint">本日无强制勾选；可展开可选支线。</p>' : '')}</div>
              ${
                opt
                  ? `<details class="war-optional"><summary>可选支线</summary><div class="war-quest-list">${opt}</div></details>`
                  : ''
              }
            </section>`;
      })
      .join('');
  }

  function setActiveStation(n) {
    activeStation = n === 2 ? 2 : 1;
  }

  function getActiveStation() {
    return activeStation;
  }

  /**
   * @param {object} state
   * @param {HTMLElement} root
   * @param {{ onToggle: Function, onGotoQuest?: Function, onStationChange?: Function }} handlers
   */
  function renderWarRoom(state, root, handlers) {
    if (!root) return;
    const s1 = global.QuestData.STATION_ONE_DAYS || [];
    const s2 = global.QuestData.STATION_TWO_DAYS || [];
    const station = activeStation === 2 ? 2 : 1;
    const days = station === 2 ? s2 : s1;
    const s2ok = stationTwoInteractive(state);
    const stationLocked = station === 2 && !s2ok;

    let mainDone = 0;
    let mainTotal = 0;
    days.forEach((d) => {
      const p = dayProgress(state, d);
      if (p.soft) return;
      mainDone += p.done;
      mainTotal += p.total;
    });

    const starterHref =
      station === 2 ? './starters/station-two/' : './starters/station-one/';
    const playbookHref =
      station === 2
        ? './docs/station-two-playbook.md'
        : './docs/station-one-playbook.md';
    const title = station === 2 ? '站二作战室' : '站一作战室';
    const sub =
      station === 2
        ? '固定 Day1–7 · 一词一岛 · 勾选与「任务」页同源 · <strong>无需选路径</strong>'
        : '固定 Day1–7 · 勾选与「任务」页同源存档 · <strong>无需选路径</strong>';

    root.innerHTML = `
      <div class="panel-head">
        <h2>作战室</h2>
        <p class="panel-sub">站一练上线收录 · 站二练一词承接 · 无路径分支</p>
        <div class="war-station-tabs" role="tablist" aria-label="作战站切换">
          <button type="button" class="war-station-btn ${
            station === 1 ? 'active' : ''
          }" role="tab" data-war-station="1" aria-selected="${
            station === 1 ? 'true' : 'false'
          }">站一</button>
          <button type="button" class="war-station-btn ${
            station === 2 ? 'active' : ''
          }" role="tab" data-war-station="2" aria-selected="${
            station === 2 ? 'true' : 'false'
          }">站二 ${s2ok ? '' : '<span class="war-lock-badge" title="需站一 Boss">🔒</span>'}</button>
        </div>
        <h3 class="war-station-title">${title}</h3>
        <p class="panel-sub">${sub}</p>
        <div class="war-toolbar">
          <span class="war-progress" aria-live="polite">主线进度 ${mainDone}/${mainTotal}</span>
          <a class="btn btn-primary btn-sm" href="${starterHref}" target="_blank" rel="noopener noreferrer">打开 Starter</a>
          <a class="btn btn-sm" href="${playbookHref}" target="_blank" rel="noopener noreferrer">作战手册</a>
          <button type="button" class="btn btn-sm" id="war-goto-quest">打开任务板</button>
        </div>
      </div>
      ${
        stationLocked
          ? `<div class="war-lock-banner" role="status">站二日程可先浏览。勾选已灰锁：请先完成<strong>站一 Boss（呼名）</strong>，或在地图通关站一解锁本岛后再勾。</div>`
          : ''
      }
      <div class="war-days ${stationLocked ? 'war-station-locked' : ''}">
        ${renderDays(state, days, stationLocked)}
      </div>
      <p class="hint war-foot">${
        station === 2
          ? 'Boss 需有曝光向好迹象再勾。诚实声明：不保证收益。'
          : '收录慢时 Day7 Boss 可延后勾选。诚实声明：不保证收益。'
      }</p>`;

    root.querySelectorAll('.war-station-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const n = Number(btn.getAttribute('data-war-station')) === 2 ? 2 : 1;
        setActiveStation(n);
        if (handlers && handlers.onStationChange) {
          handlers.onStationChange(n);
        } else {
          renderWarRoom(state, root, handlers);
        }
      });
    });

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
      gotoBtn.addEventListener('click', () => handlers.onGotoQuest(station));
    }
  }

  global.QuestWarRoom = {
    renderWarRoom,
    dayProgress,
    firstIncompleteDayIndex,
    stationTwoInteractive,
    setActiveStation,
    getActiveStation,
  };
})(typeof window !== 'undefined' ? window : globalThis);
