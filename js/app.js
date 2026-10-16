/**
 * 出海小站练站营 · 应用入口
 */
(function () {
  let state = null;
  let currentTab = 'home';
  let currentChapter = 'ch-prologue';

  const $ = (sel) => document.querySelector(sel);

  function persist() {
    state = QuestSave.saveSave(state);
  }

  function applyMotionClass() {
    document.documentElement.classList.toggle(
      'reduce-motion',
      !!(state.settings && state.settings.reduceMotion)
    );
  }

  function renderHUD() {
    const hud = $('#hud');
    if (!hud) return;
    const prog = QuestProgress.xpProgress(state.xp || 0);
    const activeId = QuestProgress.getActiveChapterId(state);
    const activeCh = QuestData.getChapter(activeId);
    const achTotal = QuestData.ACHIEVEMENTS.length;
    const achHave = (state.achievements || []).length;
    const energyOn = state.settings && state.settings.energyEnabled;
    let energyHtml = '';
    if (energyOn) {
      state = QuestProgress.ensureEnergy(state);
      energyHtml = `
        <div class="hud-energy" title="今日体力">
          <span>⚡</span>
          <div class="bar"><i style="width:${(state.energy.left / 5) * 100}%"></i></div>
          <span class="hud-num">${state.energy.left}/5</span>
        </div>`;
    }

    hud.innerHTML = `
      <div class="hud-left">
        <div class="avatar" aria-hidden="true">🧭</div>
        <div>
          <div class="hud-name">冒险者 · Lv.${prog.level}</div>
          <div class="hud-title">${prog.title}</div>
        </div>
      </div>
      <div class="hud-mid">
        <div class="hud-xp-label">XP ${state.xp || 0}${
          prog.maxed ? ' · MAX' : ` · 距下级 ${prog.need - prog.into}`
        }</div>
        <div class="bar bar-xp" role="progressbar" aria-valuenow="${prog.pct}" aria-valuemin="0" aria-valuemax="100">
          <i style="width:${prog.pct}%"></i>
        </div>
        ${energyHtml}
      </div>
      <div class="hud-right">
        <div>📍 ${activeCh ? activeCh.name : '—'}</div>
        <div>🔥 连击 ${state.streak || 0} 天</div>
        <div>🏅 成就 ${achHave}/${achTotal}</div>
        <div class="hud-save">本机浏览器</div>
      </div>`;
  }

  function renderTabs() {
    document.body.classList.toggle('is-home', currentTab === 'home');
    document.querySelectorAll('.site-links a[data-nav]').forEach((a) => {
      const n = a.getAttribute('data-nav');
      a.classList.toggle('active', (n === 'home' && currentTab === 'home') || (n === 'war' && currentTab === 'war'));
    });
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      const tab = btn.getAttribute('data-tab');
      btn.classList.toggle('active', tab === currentTab);
      btn.setAttribute('aria-selected', tab === currentTab ? 'true' : 'false');
    });
    document.querySelectorAll('.tab-panel').forEach((panel) => {
      const id = panel.id.replace('panel-', '');
      panel.hidden = id !== currentTab;
    });
  }

  function showNewlyAchievements(newly) {
    if (!newly || !newly.length) return;
    newly.forEach((id) => {
      const a = QuestData.ACHIEVEMENTS.find((x) => x.id === id);
      if (a) {
        QuestModal.showToast(`成就解锁：${a.name}`);
        QuestSfx.play('ach', state.settings.muted);
      }
    });
  }

  function renderAll() {
    applyMotionClass();
    renderHUD();
    renderTabs();

    if (currentTab === 'home') {
      QuestHome.renderHome($('#panel-home'), {
        onNavigate(action, target) {
          if (action === 'tab') {
            currentTab = target;
            if (target === 'quest' && !currentChapter) {
              currentChapter = QuestProgress.getActiveChapterId(state);
            }
            try {
              location.hash = target;
            } catch (_) {}
            renderAll();
            return;
          }
          if (action === 'hash') {
            applyHashTabFromValue(target);
            try {
              location.hash = target;
            } catch (_) {}
            renderAll();
          }
        },
      });
    } else if (currentTab === 'map') {
      QuestMap.renderMap(state, $('#panel-map'), (chapterId) => {
        currentChapter = chapterId;
        currentTab = 'quest';
        renderAll();
      });
    } else if (currentTab === 'war') {
      QuestWarRoom.renderWarRoom(state, $('#panel-war'), {
        onToggle(questId, checked, el) {
          handleToggle(questId, checked, el);
        },
        onGotoQuest(station) {
          const map = { 1: 'ch-stage1', 2: 'ch-stage2', 3: 'ch-stage3', 4: 'ch-monetize', 5: 'ch-scale' };
          const prefer = map[station] || 'ch-stage1';
          currentChapter = prefer;
          if ((state.unlocked || []).indexOf(prefer) < 0) {
            currentChapter = QuestProgress.getActiveChapterId(state);
          }
          currentTab = 'quest';
          location.hash = 'quest';
          renderAll();
        },
        onStationChange(n) {
          QuestWarRoom.setActiveStation(n);
          try {
            location.hash = QuestWarRoom.hashForStation(n);
          } catch (_) {}
          renderAll();
        },
      });
    } else if (currentTab === 'quest') {
      QuestBoard.renderBoard(state, currentChapter, $('#panel-quest'), (msg) => {
        if (msg.type === 'back') {
          currentTab = 'map';
          renderAll();
          return;
        }
        if (msg.type === 'toggle') {
          handleToggle(msg.questId, msg.checked, msg.el);
        }
      });
    } else if (currentTab === 'ship') {
      QuestWeekly.renderShip(state, $('#panel-ship'), (id) => {
        const res = QuestWeekly.claimWeekly(state, id);
        if (!res.ok) {
          if (res.reason === 'already') QuestModal.showToast('这条卷轴已经领取过了');
          return;
        }
        state = res.state;
        persist();
        QuestSfx.play('claim', state.settings.muted);
        QuestModal.showToast(`+${res.xp} XP · 卷轴已收入`);
        showNewlyAchievements(res.newly);
        renderAll();
      });
    } else if (currentTab === 'ach') {
      QuestAchievements.renderWall(state, $('#panel-ach'));
    } else if (currentTab === 'resources') {
      QuestResources.renderLibrary($('#panel-resources'), { embedded: true });
    } else if (currentTab === 'settings') {
      QuestSettings.renderSettings(state, $('#panel-settings'), {
        onToggle(key, value) {
          state = {
            ...state,
            settings: { ...state.settings, [key]: value },
          };
          if (key === 'energyEnabled' && value) {
            state = QuestProgress.ensureEnergy(state);
          }
          persist();
          applyMotionClass();
          renderAll();
        },
        onGotoResources() {
          currentTab = 'resources';
          try { location.hash = 'resources'; } catch (_) {}
          renderAll();
        },
        onGotoWar(station) {
          currentTab = 'war';
          const n = globalThis.QuestWarRoom
            ? QuestWarRoom.normalizeStation(station)
            : (station === 2 || station === 3 || station === 4 || station === 5 ? station : 1);
          if (globalThis.QuestWarRoom) QuestWarRoom.setActiveStation(n);
          try {
            location.hash = globalThis.QuestWarRoom
              ? QuestWarRoom.hashForStation(n)
              : 'war';
          } catch (_) {}
          renderAll();
        },
        onExportSave() {
          const blob = new Blob([JSON.stringify(state, null, 2)], {
            type: 'application/json',
          });
          const aEl = document.createElement('a');
          aEl.href = URL.createObjectURL(blob);
          aEl.download = 'gefei-quest-save-v1.json';
          aEl.click();
          setTimeout(() => URL.revokeObjectURL(aEl.href), 2000);
          QuestModal.showToast('存档已导出');
        },
        onImportSave(obj) {
          if (!QuestSave.isValidSave(obj)) {
            QuestModal.showToast('导入失败：存档格式无效');
            return;
          }
          const def = QuestSave.getDefaultSave();
          state = {
            ...def,
            ...obj,
            settings: { ...def.settings, ...(obj.settings || {}) },
            energy: { ...def.energy, ...(obj.energy || {}) },
            achievementDates: obj.achievementDates || {},
            notes: obj.notes || {},
          };
          state = QuestProgress.recomputeUnlocks(state);
          persist();
          currentChapter = QuestProgress.getActiveChapterId(state);
          QuestModal.showToast('存档已导入');
          renderAll();
        },
        onReset() {
          QuestModal.confirmReset(() => {
            QuestSave.resetSave();
            state = QuestSave.getDefaultSave();
            // 尊重系统减少动态建议
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
              state.settings.reduceMotion = true;
            }
            persist();
            currentChapter = 'ch-prologue';
            currentTab = 'home';
            QuestModal.showToast('存档已重置');
            renderAll();
          });
        },
      });
    }
  }

  function handleToggle(questId, checked, el) {
    const beforeXp = state.xp;
    const res = QuestBoard.toggleQuest(state, questId, checked);
    if (!res.ok) {
      // 回滚 checkbox
      if (el) el.checked = !checked;
      if (res.reason === 'no-energy') {
        QuestModal.showToast('体力不足：明日再来，或去设置关闭体力系统');
      } else if (res.reason === 'locked') {
        QuestModal.showToast('该岛尚未解锁');
      }
      return;
    }
    state = res.state;
    persist();

    if (res.xpDelta > 0) {
      QuestSfx.play('check', state.settings.muted);
      QuestBoard.floatXp(el, res.xpDelta, state.settings.reduceMotion);
    } else if (res.xpDelta < 0) {
      QuestModal.showToast(`撤回 ${Math.abs(res.xpDelta)} XP`);
    }

    showNewlyAchievements(res.newly);

    if (res.chapterCleared && res.chapter) {
      QuestSfx.play('boss', state.settings.muted);
      QuestModal.showBossVictory(res.chapter, state.settings.reduceMotion, () => {
        renderAll();
      });
      // 仍刷新 HUD
      renderHUD();
      return;
    }

    renderAll();
  }

  function applyHashTabFromValue(h) {
    const raw = (h || '').replace(/^#/, '');
    if (/^home-/.test(raw || '')) {
      currentTab = 'home';
      setTimeout(() => {
        const el = document.getElementById(raw);
        if (el) el.scrollIntoView({ behavior: document.documentElement.classList.contains('reduce-motion') ? 'auto' : 'smooth' });
      }, 30);
      return;
    }
    const warMap = {
      'war-s2': 2,
      'war-s3': 3,
      'war-m': 4,
      'war-x': 5,
      war: 1,
      'war-s1': 1,
    };
    if (Object.prototype.hasOwnProperty.call(warMap, raw)) {
      currentTab = 'war';
      if (globalThis.QuestWarRoom) QuestWarRoom.setActiveStation(warMap[raw]);
      return;
    }
    const allowed = [
      'home',
      'map',
      'war',
      'quest',
      'ship',
      'ach',
      'resources',
      'settings',
    ];
    if (allowed.indexOf(raw) >= 0) {
      currentTab = raw;
      return;
    }
    if (!raw) currentTab = 'home';
  }

  function tabFromHash() {
    const h = (location.hash || '').replace(/^#/, '');
    if (
      h === 'war-s2' ||
      h === 'war-s3' ||
      h === 'war-m' ||
      h === 'war-x' ||
      h === 'war-s1' ||
      h === 'war'
    )
      return 'war';
    const allowed = [
      'home',
      'map',
      'war',
      'quest',
      'ship',
      'ach',
      'resources',
      'settings',
    ];
    return allowed.indexOf(h) >= 0 ? h : null;
  }

  function applyHashTab() {
    applyHashTabFromValue((location.hash || '').replace(/^#/, ''));
  }

  function init() {
    let hadSave = false;
    try {
      hadSave = !!localStorage.getItem(QuestSave.SAVE_KEY);
    } catch (_) {}
    state = QuestSave.loadSave();
    if (
      !hadSave &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      state.settings.reduceMotion = true;
    }

    state = QuestProgress.recomputeUnlocks(state);
    currentChapter = QuestProgress.getActiveChapterId(state);
    applyHashTab();
    try {
      if (!(location.hash || '').replace(/^#/, '')) {
        location.replace(location.pathname + location.search + '#home');
      }
    } catch (_) {}

    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentTab = btn.getAttribute('data-tab');
        if (currentTab === 'quest' && !currentChapter) {
          currentChapter = QuestProgress.getActiveChapterId(state);
        }
        try {
          if (currentTab === 'war' && globalThis.QuestWarRoom) {
            location.hash = QuestWarRoom.hashForStation(QuestWarRoom.getActiveStation());
          } else {
            location.hash = currentTab;
          }
        } catch (_) {}
        renderAll();
      });
    });

    window.addEventListener('hashchange', () => {
      applyHashTab();
      renderAll();
    });

    QuestModal.ensureRoots();
    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
