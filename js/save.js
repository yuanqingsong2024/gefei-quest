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
      return {
        ...def,
        ...parsed,
        settings: { ...def.settings, ...(parsed.settings || {}) },
        energy: { ...def.energy, ...(parsed.energy || {}) },
        achievementDates: parsed.achievementDates || {},
        notes: parsed.notes || {},
      };
    } catch (e) {
      console.warn('[save] parse failed, using default', e);
      return getDefaultSave();
    }
  }

  function saveSave(state) {
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
