/**
 * XP / 等级 / 连击 / 章节通关 · DESIGN-SPEC §6
 */
(function (global) {
  const LEVELS = [
    { level: 1, title: '营地学徒', xp: 0 },
    { level: 2, title: '灯塔学徒', xp: 50 },
    { level: 3, title: '新手船长', xp: 120 },
    { level: 4, title: '蓝海水手', xp: 220 },
    { level: 5, title: '收录猎手', xp: 350 },
    { level: 6, title: '内页制图师', xp: 500 },
    { level: 7, title: '港口商人', xp: 680 },
    { level: 8, title: '航线规划师', xp: 900 },
    { level: 9, title: '果园主理', xp: 1150 },
    { level: 10, title: '出海老兵', xp: 1450 },
  ];

  function getLevel(xp) {
    let lv = 1;
    for (const row of LEVELS) {
      if (xp >= row.xp) lv = row.level;
    }
    return lv;
  }

  function getTitle(level) {
    const row = LEVELS.find((r) => r.level === level);
    return row ? row.title : LEVELS[0].title;
  }

  function xpProgress(xp) {
    const level = getLevel(xp);
    const cur = LEVELS.find((r) => r.level === level);
    const next = LEVELS.find((r) => r.level === level + 1);
    if (!next) {
      return {
        level,
        title: getTitle(level),
        into: 1,
        need: 0,
        pct: 100,
        curXp: cur.xp,
        nextXp: cur.xp,
        maxed: true,
      };
    }
    const into = xp - cur.xp;
    const need = next.xp - cur.xp;
    return {
      level,
      title: getTitle(level),
      into,
      need,
      pct: Math.min(100, Math.round((into / need) * 100)),
      curXp: cur.xp,
      nextXp: next.xp,
      maxed: false,
    };
  }

  function todayLocal() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function daysBetween(a, b) {
    // a, b as YYYY-MM-DD
    const da = new Date(a + 'T12:00:00');
    const db = new Date(b + 'T12:00:00');
    return Math.round((db - da) / 86400000);
  }

  /** 勾选或领商船时更新连击 */
  function applyCheckIn(state) {
    const today = todayLocal();
    const last = state.lastCheckIn;
    if (last === today) {
      return state; // 同日不重复加
    }
    let streak = state.streak || 0;
    if (!last) {
      streak = 1;
    } else {
      const diff = daysBetween(last, today);
      if (diff === 1) streak = streak + 1;
      else streak = 1; // 断一天以上重置为 1
    }
    return { ...state, streak, lastCheckIn: today };
  }

  function isChapterCleared(chapterId, state) {
    const quests = global.QuestData.getQuestsByChapter(chapterId);
    const required = quests.filter((q) => q.required);
    if (!required.length) return false;
    const done = new Set(state.done || []);
    return required.every((q) => done.has(q.id));
  }

  /** 根据 done 重算 unlocked / cleared（线性） */
  function recomputeUnlocks(state) {
    const chapters = global.QuestData.CHAPTERS.slice().sort(
      (a, b) => a.order - b.order
    );
    const cleared = [];
    const unlocked = [chapters[0].id];

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      if (isChapterCleared(ch.id, state)) {
        cleared.push(ch.id);
        if (ch.next && !unlocked.includes(ch.next)) {
          unlocked.push(ch.next);
        }
      } else {
        // 未通关则后续不再解锁（已写入的 unlocked 里只保留到当前可达）
        break;
      }
    }

    // 保证序章始终解锁
    if (!unlocked.includes('ch-prologue')) unlocked.unshift('ch-prologue');

    return { ...state, cleared, unlocked };
  }

  function chapterStatus(chapterId, state) {
    if ((state.cleared || []).includes(chapterId)) return 'cleared';
    if ((state.unlocked || []).includes(chapterId)) return 'active';
    return 'locked';
  }

  function getActiveChapterId(state) {
    const chapters = global.QuestData.CHAPTERS;
    for (const ch of chapters) {
      if (chapterStatus(ch.id, state) === 'active') return ch.id;
    }
    return 'ch-prologue';
  }

  function ensureEnergy(state) {
    if (!state.settings || !state.settings.energyEnabled) return state;
    const today = todayLocal();
    if (state.energy && state.energy.date === today) return state;
    return {
      ...state,
      energy: { date: today, left: 5 },
    };
  }

  function canSpendEnergy(state) {
    if (!state.settings || !state.settings.energyEnabled) return true;
    const s = ensureEnergy(state);
    return (s.energy.left || 0) > 0;
  }

  function spendEnergy(state) {
    if (!state.settings || !state.settings.energyEnabled) return state;
    let s = ensureEnergy(state);
    s = {
      ...s,
      energy: { ...s.energy, left: Math.max(0, (s.energy.left || 0) - 1) },
    };
    return s;
  }

  global.QuestProgress = {
    LEVELS,
    getLevel,
    getTitle,
    xpProgress,
    todayLocal,
    applyCheckIn,
    isChapterCleared,
    recomputeUnlocks,
    chapterStatus,
    getActiveChapterId,
    ensureEnergy,
    canSpendEnergy,
    spendEnergy,
  };
})(typeof window !== 'undefined' ? window : globalThis);
