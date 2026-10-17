/**
 * 存档模块 · localStorage key: gefei-quest-save-v1
 * DESIGN-SPEC §8
 */
(function (global) {
  const SAVE_KEY = 'gefei-quest-save-v1';

  function getDefaultSave() {
    return {
      version: 1,
      xp: 0,
      done: [],
      unlocked: ['ch-prologue'],
      cleared: [],
      streak: 0,
      lastCheckIn: null,
      achievements: [],
      achievementDates: {},
      weeklyClaimed: [],
      settings: {
        muted: true,
        energyEnabled: false,
        reduceMotion: false,
      },
      energy: {
        date: null,
        left: 5,
      },
      notes: {},
      kit: { keyword: '', intro: '', domain: '', email: '', checks: {}, template: 'basic', templateDone: false },
      keywords: { items: [], s2Target: '', sort: 'score', filter: 'all' },
      sites: { items: [] },
      activity: {},
      doneDates: {},
      lastSeenChangelog: 0,
      rankFav: [],
      rankPlan: [],
      lastBackupAt: null,
      backupSnoozeUntil: null,
      updatedAt: new Date().toISOString(),
    };
  }

  function isValidSave(obj) {
    if (!obj || typeof obj !== 'object') return false;
    if (obj.version !== 1) return false;
    if (typeof obj.xp !== 'number' || !Array.isArray(obj.done)) return false;
    if (!Array.isArray(obj.unlocked) || !obj.settings) return false;
    if (typeof obj.settings.muted !== 'boolean') return false;
    if (typeof obj.settings.energyEnabled !== 'boolean') return false;
    return true;
  }

  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return getDefaultSave();
      const parsed = JSON.parse(raw);
      if (!isValidSave(parsed)) {
        console.warn('[save] invalid schema, using default');
        return getDefaultSave();
      }
      // 补齐缺字段
      const def = getDefaultSave();
      const merged = {
        ...def,
        ...parsed,
        settings: { ...def.settings, ...(parsed.settings || {}) },
        energy: { ...def.energy, ...(parsed.energy || {}) },
        achievementDates: parsed.achievementDates || {},
        notes: parsed.notes || {},
        activity: parsed.activity && typeof parsed.activity === 'object' ? parsed.activity : {},
        doneDates: parsed.doneDates && typeof parsed.doneDates === 'object' ? parsed.doneDates : {},
        rankFav: Array.isArray(parsed.rankFav) ? parsed.rankFav : [],
        rankPlan: Array.isArray(parsed.rankPlan) ? parsed.rankPlan : [],
        lastSeenChangelog: typeof parsed.lastSeenChangelog === 'number' ? parsed.lastSeenChangelog : 0,
      };
      return global.QuestTools ? global.QuestTools.ensure(merged) : merged;
    } catch (e) {
      console.warn('[save] parse failed, using default', e);
      return getDefaultSave();
    }
  }

  function saveSave(state) {
    if (global.QuestStats) {
      let prev = null;
      try { prev = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (_) {}
      global.QuestStats.record(state, global.QuestStats.signature(prev || getDefaultSave()));
    }
    const next = {
      ...state,
      version: 1,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(next));
    return next;
  }

  function resetSave() {
    localStorage.removeItem(SAVE_KEY);
    return getDefaultSave();
  }

  global.QuestSave = {
    SAVE_KEY,
    getDefaultSave,
    loadSave,
    saveSave,
    resetSave,
    isValidSave,
  };
})(typeof window !== 'undefined' ? window : globalThis);
