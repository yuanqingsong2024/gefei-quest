/**
 * 出海小站练站营 · 应用入口
 */
(function () {
  let state = null;
  let currentTab = 'map';
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

    if (currentTab === 'map') {
      QuestMap.renderMap(state, $('#panel-map'), (chapterId) => {
        currentChapter = chapterId;
        currentTab = 'quest';
        renderAll();
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
            currentTab = 'map';
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

    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentTab = btn.getAttribute('data-tab');
        if (currentTab === 'quest' && !currentChapter) {
          currentChapter = QuestProgress.getActiveChapterId(state);
        }
        renderAll();
      });
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
