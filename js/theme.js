/** 站点主题：ink 水墨纸 / ocean 海岸青 / pixel 像素暖沙。立即切换并写入 localStorage。 */
(function (global) {
  var KEY = 'gefei-theme';
  var THEMES = ['ink', 'ocean', 'pixel'];
  var COLORS = { ink: '#fafaf8', ocean: '#e0f2fe', pixel: '#f5f0e6' };
  var LABELS = { ink: '水墨纸', ocean: '海岸青', pixel: '像素暖沙' };

  function valid(theme) {
    return THEMES.indexOf(theme) >= 0 ? theme : 'ink';
  }

  function get() {
    try { return valid(localStorage.getItem(KEY)); }
    catch (e) { return 'ink'; }
  }

  function sync(root) {
    var theme = valid(global.document.documentElement.getAttribute('data-theme'));
    var nodes = (root || global.document).querySelectorAll('[data-theme-set]');
    var i, node, on;
    for (i = 0; i < nodes.length; i++) {
      node = nodes[i];
      on = node.getAttribute('data-theme-set') === theme;
      node.classList.toggle('is-active', on);
      if (node.getAttribute('role') === 'menuitemradio') node.setAttribute('aria-checked', on ? 'true' : 'false');
      else node.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function apply(theme) {
    theme = valid(theme);
    var doc = global.document;
    doc.documentElement.setAttribute('data-theme', theme);
    var meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', COLORS[theme]);
    sync(doc);
    return theme;
  }

  function set(theme) {
    theme = valid(theme);
    try { localStorage.setItem(KEY, theme); }
    catch (e) {}
    theme = apply(theme);
    if (global.QuestIcons && global.QuestIcons.refresh) global.QuestIcons.refresh();
    return theme;
  }

  function bind(root) { sync(root || global.document); }

  function init() {
    apply(get());
    if (init.bound) return;
    init.bound = true;
    global.document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-theme-set]') : null;
      if (!btn) return;
      set(btn.getAttribute('data-theme-set'));
    });
  }

  global.QuestTheme = {
    apply: apply,
    get: get,
    set: set,
    init: init,
    bind: bind,
    THEMES: THEMES,
    LABELS: LABELS
  };

  if (global.document.readyState === 'loading') global.document.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : globalThis);
