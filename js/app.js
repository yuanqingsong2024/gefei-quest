/**
 * 出海小站练站营 · 应用入口（Phase 8：统一壳 + 路由，名称见 js/nav.js SITE_NAV）
 */
(function () {
  let state = null;
  let route = { section: 'home', view: 'home', hash: 'home' };
  let currentChapter = 'ch-prologue';
  const N = window.QuestNav;
  const I = N.icon;
  const $ = (sel) => document.querySelector(sel);
  const PANELS = ['home', 'path', 'war', 'lib', 'guides', 'weekly', 'me', 'start', 'sitemap'];

  function persist() {
    state = QuestSave.saveSave(state);
  }

  function exportSave() {
    state = { ...state, lastBackupAt: new Date().toISOString() };
    persist();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gefei-quest-save-v1.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    window.__lastDownload = { name: 'gefei-quest-save-v1.json', blob };
    document.querySelectorAll('#backup-reminder').forEach((el) => el.remove());
    if (window.QuestModal) QuestModal.showToast('存档已导出');
  }

  function importSave(obj) {
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
      onboarding: QuestSave.mergeOnboarding(obj.onboarding),
      hints: QuestSave.mergeHints(obj.hints),
      lastRoute: typeof obj.lastRoute === 'string' ? obj.lastRoute : '',
    };
    state = QuestTools.ensure(state);
    state = QuestProgress.recomputeUnlocks(state);
    persist();
    currentChapter = QuestProgress.getActiveChapterId(state);
    QuestModal.showToast('存档已导入');
    renderAll();
  }

  function openImport() {
    const existing = document.getElementById('set-import-file');
    if (existing) { existing.click(); return; }
    let input = document.getElementById('quest-backup-import-file');
    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      input.id = 'quest-backup-import-file';
      input.accept = 'application/json,.json';
      input.hidden = true;
      document.body.appendChild(input);
      input.addEventListener('change', () => {
        const f = input.files && input.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => {
          try { importSave(JSON.parse(String(reader.result || ''))); }
          catch (e) { if (window.QuestModal) QuestModal.showToast('导入失败：不是合法 JSON'); }
          input.value = '';
        };
        reader.readAsText(f);
      });
    }
    input.click();
  }

  function snoozeBackup() {
    state = { ...state, backupSnoozeUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() };
    persist();
    document.querySelectorAll('#backup-reminder').forEach((el) => el.remove());
  }

  function backupBar() {
    // #work 和 #me 各自渲染时会留下同 id 的条。先清掉隐藏面板里的旧条，保证全页只有一个。
    document.querySelectorAll('#backup-reminder').forEach((el) => el.remove());
    return window.QuestPWA ? QuestPWA.backupHtml(state) : '';
  }
  function go(hash) {
    if (location.hash === hash) { route = N.parse(hash); renderAll(); return; }
    location.hash = hash;
  }

  function applyMotionClass() {
    document.documentElement.classList.toggle('reduce-motion', !!(state.settings && state.settings.reduceMotion));
  }

  function statsHtml() {
    const prog = QuestProgress.xpProgress(state.xp || 0);
    const activeCh = QuestData.getChapter(QuestProgress.getActiveChapterId(state));
    const achTotal = QuestData.ACHIEVEMENTS.length;
    const achHave = (state.achievements || []).length;
    let energy = '';
    if (state.settings && state.settings.energyEnabled) {
      state = QuestProgress.ensureEnergy(state);
      energy = `<div class="stat"><span class="card-ico">${I('fire')}</span><b>${state.energy.left}/5</b><small>今日体力</small></div>`;
    }
    return `
      <div class="me-level glass">
        <div class="me-lv"><span class="card-ico card-ico-lg">${I('compass')}</span><div><b>Lv.${prog.level} · ${prog.title}</b>
        <small>XP ${state.xp || 0}${prog.maxed ? ' · 已满级' : ` · 距下一级 ${prog.need - prog.into}`}</small></div></div>
        <div class="bar bar-xp" role="progressbar" aria-valuenow="${prog.pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${prog.pct}%"></i></div>
      </div>
      <div class="stat-grid">
        <div class="stat"><span class="card-ico">${I('map')}</span><b>${activeCh ? activeCh.name : '—'}</b><small>当前章节</small></div>
        <div class="stat"><span class="card-ico">${I('list')}</span><b>${(state.done || []).length}</b><small>已完成任务</small></div>
        <div class="stat"><span class="card-ico">${I('fire')}</span><b>${state.streak || 0} 天</b><small>连击</small></div>
        <div class="stat"><span class="card-ico">${I('trophy')}</span><b>${achHave}/${achTotal}</b><small>成就</small></div>
        ${energy}
      </div>`;
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

  function subTabs(items, activeId) {
    return `<nav class="sub-tabs" aria-label="子页面">${items
      .map((t) => `<a href="${t.hash}" class="sub-tab${t.id === activeId ? ' active' : ''}"${t.id === activeId ? ' aria-current="page"' : ''}>${I(t.icon)}<span>${t.label}</span></a>`)
      .join('')}</nav>`;
  }

  function chapterChips() {
    return `<div class="chip-row" role="tablist" aria-label="章节">${QuestData.CHAPTERS.map((ch) => {
      const st = QuestProgress.chapterStatus(ch.id, state);
      return `<button type="button" class="chip${ch.id === currentChapter ? ' active' : ''}${st === 'locked' ? ' is-locked' : ''}" data-ch="${ch.id}" role="tab" aria-selected="${ch.id === currentChapter}">${I(st === 'locked' ? 'lock' : ch.icon)}<span>${ch.name}</span></button>`;
    }).join('')}</div>`;
  }

  function renderShell(extraCrumb) {
    N.renderTopNav(route.section === 'dev' ? '' : route.section);
    N.renderSectionHead(route, extraCrumb);
    N.renderFooter();
    N.titleFor(route, extraCrumb);
    document.body.classList.toggle('is-home', route.section === 'home');
    const panel = route.section === 'dev' ? 'guides' : route.section;
    PANELS.forEach((id) => {
      const el = document.getElementById('panel-' + id);
      if (el) el.hidden = id !== panel;
    });
    if (window.QuestShell) {
      QuestShell.renderBottomBar(route.section === 'dev' ? '' : route.section);
      if (renderShell._last !== route.hash) QuestShell.fade('panel-' + panel);
      renderShell._last = route.hash;
    }
    if (window.QuestPWA) QuestPWA.sync();
  }

  function renderAll() {
    applyMotionClass();
    let crumb = '';
    const sec = route.section;
    if (sec === 'home') {
      QuestHome.renderHome($('#panel-home'), state);
      $('#panel-home').querySelectorAll('[data-today-ch]').forEach((a) => a.addEventListener('click', () => { currentChapter = a.getAttribute('data-today-ch'); }));
    } else if (sec === 'path') {
      const root = $('#panel-path');
      const quests = route.view === 'quests';
      crumb = quests ? '任务清单' : '';
      root.innerHTML = subTabs(N.PATH_TABS, quests ? 'quests' : 'map') +
        (quests ? chapterChips() : '') + `<p class="hint path-tools">动手工具：<a href="#war-keywords">${I('tag')}选词练习板</a> · <a href="#war-kit">${I('kit')}站一实操助手</a> · <a href="#me-sites">${I('ledger')}我的站点台账</a></p>` + '<div id="path-body"></div>';
      if (quests) {
        root.querySelectorAll('[data-ch]').forEach((b) => b.addEventListener('click', () => {
          const id = b.getAttribute('data-ch');
          if (QuestProgress.chapterStatus(id, state) === 'locked') { QuestModal.showToast('该章节尚未解锁：先完成上一章'); return; }
          currentChapter = id; renderAll();
        }));
        QuestBoard.renderBoard(state, currentChapter, $('#path-body'), (msg) => {
          if (msg.type === 'back') { go('#path'); return; }
          if (msg.type === 'toggle') handleToggle(msg.questId, msg.checked, msg.el);
        });
      } else {
        QuestMap.renderMap(state, $('#path-body'), (chapterId) => { currentChapter = chapterId; go('#path-quests'); });
      }
    } else if (sec === 'war' && route.view === 'rank') {
      crumb = '每日赚钱榜';
      $('#panel-war').innerHTML = subTabs(N.WAR_TABS, 'rank') + '<div id="tool-body"></div>';
      QuestRank.renderRank(state, $('#tool-body'), toolCtx());
    } else if (sec === 'war' && (route.view === 'work' || route.view === 'review')) {
      const wk = route.view === 'work';
      crumb = wk ? '工作台' : '每周复盘';
      $('#panel-war').innerHTML = (wk ? backupBar() : '') + subTabs(N.WAR_TABS, route.view) + '<div id="tool-body"></div>';
      QuestWork[wk ? 'renderWork' : 'renderReview'](state, $('#tool-body'), toolCtx());
    } else if (sec === 'war' && route.view === 'share') {
      crumb = '内容分发';
      $('#panel-war').innerHTML = subTabs(N.WAR_TABS, 'share') + '<div id="tool-body"></div>';
      QuestShare.render(state, $('#tool-body'), toolCtx());
    } else if (sec === 'war' && route.view === 'publish') {
      crumb = '发布上线';
      $('#panel-war').innerHTML = subTabs(N.WAR_TABS, 'publish') + '<div id="tool-body"></div>';
      QuestWorkbench.renderPublish(state, $('#tool-body'), toolCtx());
    } else if (sec === 'war' && (route.view === 'kit' || route.view === 'keywords')) {
      const root = $('#panel-war');
      const kit = route.view === 'kit';
      crumb = kit ? '站一实操助手' : '选词练习板';
      root.innerHTML = subTabs(N.WAR_TABS, route.view) + '<div id="tool-body"></div>' + (kit ? '<div id="kit-plan"></div>' : '');
      QuestTools[kit ? 'renderKit' : 'renderKeywords'](state, $('#tool-body'), toolCtx());
      $('#tool-body').insertAdjacentHTML('afterbegin', QuestWorkbench.pipeline(state, route.view));
      $('#tool-body').addEventListener('input', () => setTimeout(() => { const pn = $('#tool-body .wb-pipe'); if (pn) pn.outerHTML = QuestWorkbench.pipeline(state, route.view); }, 60));
      if (kit) { const kp = $('#kit-plan'); kp.innerHTML = QuestRank.planHtml(state); QuestRank.bindPlan(state, kp, toolCtx()); }
    } else if (sec === 'war') {
      $('#panel-war').innerHTML = subTabs(N.WAR_TABS, 'days') + '<div id="war-body"></div>';
      QuestWarRoom.setActiveStation(route.param || 1);
      const st = N.STATIONS.find((x) => x.n === (route.param || 1));
      crumb = st ? st.label : '';
      QuestWarRoom.renderWarRoom(state, $('#war-body'), {
        onToggle(questId, checked, el) { handleToggle(questId, checked, el); },
        onGotoQuest(station) {
          const map = { 1: 'ch-stage1', 2: 'ch-stage2', 3: 'ch-stage3', 4: 'ch-monetize', 5: 'ch-scale' };
          const prefer = map[station] || 'ch-stage1';
          currentChapter = (state.unlocked || []).indexOf(prefer) < 0 ? QuestProgress.getActiveChapterId(state) : prefer;
          go('#path-quests');
        },
        onStationChange(n) { go(QuestWarRoom.hashForStation(n)); },
      });
    } else if (sec === 'lib' && route.view === 'pm') {
      crumb = QuestPlatforms.titleOf(route.param);
      QuestPlatforms.render($('#panel-lib'), route.param);
    } else if (sec === 'lib') {
      const c = N.LIB_CATS.find((x) => x.id === route.param);
      crumb = c ? c.label : '';
      QuestResources.renderLibrary($('#panel-lib'), {
        embedded: true,
        filter: route.param,
        onFilter(f) {
          const cc = N.LIB_CATS.find((x) => x.id === f);
          route = N.parse(f === 'all' ? 'lib' : 'lib-' + f);
          N.renderSectionHead(route, cc ? cc.label : '');
          N.titleFor(route, cc ? cc.label : '');
        },
      });
      if (window.QUEST_PLATFORMS && !$('#pm-banner')) $('#panel-lib').insertAdjacentHTML('afterbegin', '<a id="pm-banner" class="pm-banner" href="#pm">' + QuestIcons.svg('coin') + '<span><b>平台变现 · 国内 + 海外</b><small>' + window.QUEST_PLATFORMS.PLATFORMS.length + ' 个平台的变现方式、门槛、分成规则与官方来源 · 新手怎么选</small></span>' + QuestIcons.svg('arrowRight') + '</a>');
    } else if (sec === 'guides' || sec === 'dev') {
      const root = $('#panel-guides');
      if (route.view === 'doc') {
        crumb = QuestGuides.docTitle(route.param, sec === 'dev');
        const want = route.hash, isDev = sec === 'dev', param = route.param;
        root.innerHTML = '<div class="skeleton-doc" aria-busy="true" aria-label="加载中">' + '<i class="sk sk-title"></i>' + '<i class="sk"></i><i class="sk"></i><i class="sk sk-short"></i>'.repeat(3) + '</div>';
        setTimeout(() => { if (route.hash !== want) return; QuestGuides.renderDoc(root, param, isDev); N.fixLinks(root); }, 16);
      } else if (sec === 'dev') {
        QuestGuides.renderDev(root);
      } else {
        QuestGuides.renderGuides(root);
      }
    } else if (sec === 'weekly') {
      QuestWeekly.renderShip(state, $('#panel-weekly'), (id) => {
        const res = QuestWeekly.claimWeekly(state, id);
        if (!res.ok) {
          if (res.reason === 'already') QuestModal.showToast('这张补给卡已经领取过了');
          return;
        }
        state = res.state;
        persist();
        QuestSfx.play('claim', state.settings.muted);
        QuestModal.showToast(`+${res.xp} XP · 已领取`);
        showNewlyAchievements(res.newly);
        renderAll();
      });
    } else if (sec === 'me') {
      const root = $('#panel-me');
      if (route.view === 'accounts' || route.view === 'analytics') {
        const acc = route.view === 'accounts';
        crumb = acc ? '账号中心' : '数据分析';
        root.innerHTML = subTabs(N.ME_TABS, route.view) + '<div id="wb-body"></div>';
        QuestWorkbench[acc ? 'renderAccounts' : 'renderAnalytics'](state, $('#wb-body'), toolCtx());
        renderShell(crumb); N.fixLinks(document.getElementById('app')); scrollTopIfChanged(); afterRoute(); return;
      }
      if (route.view === 'ai') {
        crumb = 'AI 设置';
        root.innerHTML = subTabs(N.ME_TABS, 'ai') + '<div id="ai-body"></div>';
        QuestAI.renderSettings($('#ai-body'));
        renderShell(crumb); N.fixLinks(document.getElementById('app')); scrollTopIfChanged(); afterRoute(); return;
      }
      if (route.view === 'stats' || route.view === 'changelog') {
        const cl = route.view === 'changelog';
        crumb = cl ? '更新日志' : '学习统计';
        root.innerHTML = subTabs(N.ME_TABS, route.view) + '<div id="stats-body"></div>';
        if (cl) {
          QuestStats.renderChangelog(state, $('#stats-body'));
          if ((state.lastSeenChangelog || 0) < QuestStats.latestId()) { state.lastSeenChangelog = QuestStats.latestId(); persist(); }
        } else QuestStats.renderStats(state, $('#stats-body'));
        renderShell(crumb); N.fixLinks(document.getElementById('app')); scrollTopIfChanged(); afterRoute(); return;
      }
      if (route.view === 'sites') {
        crumb = '我的站点台账';
        root.innerHTML = subTabs(N.ME_TABS, 'sites') + '<div id="sites-body"></div>';
        QuestTools.renderSites(state, $('#sites-body'), toolCtx());
        $('#sites-body').insertAdjacentHTML('afterbegin', QuestWorkbench.pipeline(state, 'sites'));
        renderShell(crumb); N.fixLinks(document.getElementById('app')); scrollTopIfChanged(); afterRoute(); return;
      }
      root.innerHTML = backupBar() + subTabs(N.ME_TABS, 'overview') + `<section class="block"><h2 class="block-title">${I('chart')}概览</h2>${statsHtml()}</section>
        <section class="block" id="me-ach-wrap"><div id="me-ach"></div></section>
        <section class="block" id="me-settings-wrap"><div id="me-settings"></div></section>`;
      QuestAchievements.renderWall(state, $('#me-ach'));
      QuestSettings.renderSettings(state, $('#me-settings'), {
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
          go('#lib');
        },
        onGotoWar(station) { go(QuestWarRoom.hashForStation(QuestWarRoom.normalizeStation(station))); },
        onExportSave() { exportSave(); },
        onImportSave(obj) { importSave(obj); },
        onReset() {
          QuestModal.confirmReset(() => {
            QuestSave.resetSave();
            state = QuestTools.ensure(QuestSave.getDefaultSave());
            // 尊重系统减少动态建议
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
              state.settings.reduceMotion = true;
            }
            persist();
            currentChapter = 'ch-prologue';
            
            QuestModal.showToast('存档已重置');
            renderAll();
          });
        },
      });
    } else if (sec === 'sitemap') {
      N.renderSitemap($('#panel-sitemap'));
    } else if (sec === 'start') {
      if (window.QuestStart) QuestStart.render($('#panel-start'), state);
    }
    renderShell(crumb);
    N.fixLinks(document.getElementById('app'));
    const at = document.querySelector('.tab-panel:not([hidden]) .sub-tab.active');
    if (at && at.parentNode.scrollWidth > at.parentNode.clientWidth) at.parentNode.scrollLeft = at.getBoundingClientRect().left - at.parentNode.getBoundingClientRect().left + at.parentNode.scrollLeft - 16;
    const changed = renderAll._last !== route.hash;
    renderAll._last = route.hash;
    if (changed) {
      if (route.section !== 'home' || !route.param) {
        window.scrollTo(0, 0);
      } else {
        setTimeout(() => {
          const el = document.getElementById(route.param);
          if (el) el.scrollIntoView({ behavior: document.documentElement.classList.contains('reduce-motion') ? 'auto' : 'smooth' });
        }, 30);
      }
    }
    afterRoute();
  }

  function rememberRoute() {
    var h = route && route.hash;
    if (!h || h === 'home' || h.indexOf('home-') === 0) return;
    if (state.lastRoute === h) return;
    state.lastRoute = h;
    try {
      var raw = localStorage.getItem(QuestSave.SAVE_KEY);
      if (!raw) return;
      var obj = JSON.parse(raw);
      if (!obj || obj.version !== 1 || obj.lastRoute === h) return;
      obj.lastRoute = h;
      localStorage.setItem(QuestSave.SAVE_KEY, JSON.stringify(obj));
    } catch (_) {}
  }

  function afterRoute() {
    rememberRoute();
    if (window.QuestHints) QuestHints.mount(route);
    if (window.QuestTour) QuestTour.afterRender(route);
  }

  function scrollTopIfChanged() {
    if (renderAll._last !== route.hash) { renderAll._last = route.hash; window.scrollTo(0, 0); }
  }
  function toolCtx() {
    return {
      save() { QuestSave.saveSave(state); },
      rerender() { renderAll(); },
      tickQuest(id, el) { handleToggle(id, true, null); },
    };
  }

  function handleToggle(questId, checked, el) {
    const beforeXp = state.xp;
    const res = QuestBoard.toggleQuest(state, questId, checked);
    if (!res.ok) {
      // 回滚 checkbox
      if (el) el.checked = !checked;
      if (res.reason === 'no-energy') {
        QuestModal.showToast('体力不足：明日再来，或在「我的进度」关闭体力系统');
      } else if (res.reason === 'locked') {
        QuestModal.showToast('该章节尚未解锁');
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
      return;
    }

    renderAll();
  }

  function onHash() {
    let raw = (location.hash || '').replace(/^#/, '');
    let q = '';
    const iq = raw.indexOf('?');
    if (iq >= 0) { q = raw.slice(iq + 1); raw = raw.slice(0, iq); }
    const canon = N.canonical(raw);
    if (canon !== raw || q) {
      try { history.replaceState(null, '', '#' + canon); } catch (_) {}
    }
    route = N.parse(canon);
    route.tour = /(^|&)tour(=|&|$)/.test(q);
  }

  function init() {
    let hadSave = false;
    try { hadSave = !!localStorage.getItem(QuestSave.SAVE_KEY); } catch (_) {}
    state = QuestRank.ensure(QuestTools.ensure(QuestSave.loadSave()));
    if (!hadSave && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      state.settings.reduceMotion = true;
    }
    state = QuestProgress.recomputeUnlocks(state);
    currentChapter = QuestProgress.getActiveChapterId(state);
    window.QuestApp = {
      update(fn) {
        const next = fn(state);
        if (next && typeof next === 'object') state = next;
        persist();
        return state;
      },
      get() { return state; },
    };
    onHash();
    window.addEventListener('hashchange', () => { onHash(); renderAll(); });
    QuestModal.ensureRoots();
    if (window.QuestPWA) QuestPWA.bind({ exportSave: exportSave, openImport: openImport, snooze: snoozeBackup });
    renderAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
