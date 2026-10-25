/** 作战室 · 站一 / 站二 / 站三 / 变现 / 放大 · 固定 Day1–7 */
(function (global) {
  let activeStation = 1; // 1 | 2 | 3 | 4 | 5（4=变现，5=放大）

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function normalizeStation(n) {
    const v = Number(n);
    if (v === 2 || v === 3 || v === 4 || v === 5) return v;
    return 1;
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

  /** 站三勾选解锁：站二 Boss 已勾 或 站三岛已开 */
  function stationThreeInteractive(state) {
    return isDone(state, 'q-s2-boss') || chapterUnlocked(state, 'ch-stage3');
  }

  /** 变现勾选解锁：站三 Boss 已勾 或 变现港已开 */
  function monetizeInteractive(state) {
    return isDone(state, 'q-s3-boss') || chapterUnlocked(state, 'ch-monetize');
  }

  /** 放大勾选解锁：变现 Boss 已勾 或 放大航线已开 */
  function scaleInteractive(state) {
    return isDone(state, 'q-m-boss') || chapterUnlocked(state, 'ch-scale');
  }

  function dayProgress(state, day) {
    const ids = day.questIds || [];
    if (ids.length === 0) {
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
    activeStation = normalizeStation(n);
  }

  function getActiveStation() {
    return activeStation;
  }

  function hashForStation(n) {
    const s = normalizeStation(n);
    if (s === 2) return 'war-s2';
    if (s === 3) return 'war-s3';
    if (s === 4) return 'war-m';
    if (s === 5) return 'war-x';
    return 'war';
  }

  function daysForStation(station) {
    const QD = global.QuestData;
    if (station === 2) return QD.STATION_TWO_DAYS || [];
    if (station === 3) return QD.STATION_THREE_DAYS || [];
    if (station === 4) return QD.MONETIZE_DAYS || [];
    if (station === 5) return QD.SCALE_DAYS || [];
    return QD.STATION_ONE_DAYS || [];
  }

  function metaForStation(station, state) {
    if (station === 2) {
      return {
        title: '站二 · 一词一站',
        sub: '固定 Day1–7 · 一词一岛 · 勾选与「学习路线」同步 · <strong>无需选路径</strong>',
        starterHref: './starters/station-two/',
        playbookHref: '#guide-station-two-playbook',
        showStarter: true,
        locked: !stationTwoInteractive(state),
        lockBanner:
          '站二日程可先浏览。勾选已灰锁：请先完成<strong>站一 Boss（呼名）</strong>，或在学习路线通关站一解锁本岛后再勾。',
        foot: 'Boss 需有曝光向好迹象再勾。诚实声明：不保证收益。',
        chapterPrefer: 'ch-stage2',
      };
    }
    if (station === 3) {
      return {
        title: '站三 · 扩内页',
        sub: '固定 Day1–7 · 扩内页与内链 · 勾选与「学习路线」同步 · <strong>无需选路径</strong>',
        starterHref: null,
        playbookHref: '#guide-station-three-playbook',
        showStarter: false,
        locked: !stationThreeInteractive(state),
        lockBanner:
          '站三日程可先浏览。勾选已灰锁：请先完成<strong>站二 Boss（航道打通）</strong>，或在学习路线通关站二解锁本岛后再勾。',
        foot: '多页收录 + 点击趋势再勾 Boss。诚实声明：不保证收益。',
        chapterPrefer: 'ch-stage3',
      };
    }
    if (station === 4) {
      return {
        title: '变现 · 广告与联盟',
        sub: '固定 Day1–7 · 路径意识 · 过审非必须 · <strong>无需选路径</strong>',
        starterHref: null,
        playbookHref: '#guide-monetize-playbook',
        showStarter: false,
        locked: !monetizeInteractive(state),
        lockBanner:
          '变现日程可先浏览。勾选已灰锁：请先完成<strong>站三 Boss（群岛连线）</strong>，或在学习路线通关站三解锁变现港后再勾。',
        foot: '写出路径文档即可勾 Boss；申请成功非必须。诚实声明：不保证收益。',
        chapterPrefer: 'ch-monetize',
      };
    }
    if (station === 5) {
      return {
        title: '放大 · 复制到多站',
        sub: '固定 Day1–7 · 复用船体 · 一词一船 · 反空壳 · <strong>无需选路径</strong>',
        starterHref: null,
        playbookHref: '#guide-scale-playbook',
        showStarter: false,
        locked: !scaleInteractive(state),
        lockBanner:
          '放大日程可先浏览。勾选已灰锁：请先完成<strong>变现港 Boss（升旗仪式）</strong>，或在学习路线通关变现港解锁放大航线后再勾。',
        foot: '先跑通一站再谈量产；空壳站难申广告。诚实声明：不保证收益。',
        chapterPrefer: 'ch-scale',
      };
    }
    return {
      title: '站一 · 上线第一站',
      sub: '固定 Day1–7 · 勾选与「学习路线」同步存档 · <strong>无需选路径</strong>',
      starterHref: './starters/station-one/',
      playbookHref: '#guide-station-one-playbook',
      showStarter: true,
      locked: false,
      lockBanner: '',
      foot: '收录慢时 Day7 Boss 可延后勾选。诚实声明：不保证收益。',
      chapterPrefer: 'ch-stage1',
    };
  }

  function tabBtn(station, label, ok) {
    const active = activeStation === station;
    const NV = global.QuestNav;
    const st = NV ? NV.STATIONS.find((x) => x.n === station) : null;
    const ico = NV && st ? NV.icon(st.icon) : '';
    const lock = ok ? '' : `<span class="war-lock-badge" title="需先通关上一站">${NV ? NV.icon('lock') : '🔒'}</span>`;
    return `<button type="button" class="war-station-btn ${
      active ? 'active' : ''
    }" role="tab" data-war-station="${station}" aria-selected="${
      active ? 'true' : 'false'
    }">${ico}<span>${label}</span> ${lock}</button>`;
  }

  /**
   * @param {object} state
   * @param {HTMLElement} root
   * @param {{ onToggle: Function, onGotoQuest?: Function, onStationChange?: Function }} handlers
   */
  function renderWarRoom(state, root, handlers) {
    if (!root) return;
    const station = normalizeStation(activeStation);
    activeStation = station;
    const days = daysForStation(station);
    const meta = metaForStation(station, state);
    const stationLocked = !!meta.locked;
    const s2ok = stationTwoInteractive(state);
    const s3ok = stationThreeInteractive(state);
    const mok = monetizeInteractive(state);
    const xok = scaleInteractive(state);

    let mainDone = 0;
    let mainTotal = 0;
    days.forEach((d) => {
      const p = dayProgress(state, d);
      if (p.soft) return;
      mainDone += p.done;
      mainTotal += p.total;
    });

    const starterBtn = meta.showStarter
      ? `<a class="btn btn-primary btn-sm" href="${meta.starterHref}" target="_blank" rel="noopener noreferrer">打开单页模板 ↗</a>`
      : '';

    root.innerHTML = `
      <div class="panel-head">
        <div class="war-station-tabs" role="tablist" aria-label="作战站切换">
          ${tabBtn(1, '站一', true)}
          ${tabBtn(2, '站二', s2ok)}
          ${tabBtn(3, '站三', s3ok)}
          ${tabBtn(4, '变现', mok)}
          ${tabBtn(5, '放大', xok)}
        </div>
        <h2 class="war-station-title">${meta.title}</h2>
        <p class="panel-sub">${meta.sub}</p>
        <div class="war-toolbar">
          <span class="war-progress" aria-live="polite">主线进度 ${mainDone}/${mainTotal}</span>
          ${starterBtn}
          <a class="btn ${meta.showStarter ? 'btn-sm' : 'btn-primary btn-sm'}" href="${meta.playbookHref}">阅读本站手册</a>
          <button type="button" class="btn btn-sm" id="war-goto-quest">在学习路线查看</button>
        </div>
        ${meta.playbookHref ? '<div class="xy-card-slot war-xy-slot"></div>' : ''}
      </div>
      ${
        stationLocked
          ? `<div class="war-lock-banner" role="status">${meta.lockBanner}</div>`
          : ''
      }
      <div class="war-days ${stationLocked ? 'war-station-locked' : ''}">
        ${renderDays(state, days, stationLocked)}
      </div>
      <p class="hint war-foot">${meta.foot}</p>`;

    root.querySelectorAll('.war-station-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const n = normalizeStation(btn.getAttribute('data-war-station'));
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
    const xySlot = root.querySelector('.war-xy-slot');
    if (xySlot && global.QuestXianyuCard && meta.playbookHref) {
      const m = String(meta.playbookHref).match(/#guide-([A-Za-z0-9_-]+)/);
      global.QuestXianyuCard.mount(xySlot, { guideId: m ? m[1] : '', allowPick: true });
    }
  }

  global.QuestWarRoom = {
    renderWarRoom,
    dayProgress,
    firstIncompleteDayIndex,
    stationTwoInteractive,
    stationThreeInteractive,
    monetizeInteractive,
    scaleInteractive,
    setActiveStation,
    getActiveStation,
    hashForStation,
    normalizeStation,
  };
})(typeof window !== 'undefined' ? window : globalThis);
