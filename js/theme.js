/** 站点主题：ink 水墨纸 / ocean 海岸青 / pixel 像素暖沙。立即切换并写入 localStorage。 */
(function (global) {
  var KEY = 'gefei-theme';
  var THEMES = ['ink', 'ocean', 'pixel'];
  var COLORS = { ink: '#fafaf8', ocean: '#e0f2fe', pixel: '#f5f0e6' };
  var LABELS = { ink: '水墨纸', ocean: '海岸青', pixel: '像素暖沙' };

  function valid(theme) {
    theme = String(theme || '').trim().toLowerCase();
    return THEMES.indexOf(theme) >= 0 ? theme : 'ink';
  }

  function get() {
    try {
      var stored = localStorage.getItem(KEY);
      if (stored == null || stored === '') return 'ink';
      if (THEMES.indexOf(String(stored).trim().toLowerCase()) < 0) {
        try { localStorage.removeItem(KEY); } catch (e2) {}
        return 'ink';
      }
      return valid(stored);
    } catch (e) { return 'ink'; }
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


  /** 主题配图：水墨在 assets/art/，其它主题在 assets/art/<theme>/。img 带 data-art="<name>"，切主题时自动换图与 alt。 */
  var ART_ALT = {
    ink: {
      'hero-voyage': '水墨风插画：一艘载着笔记本电脑的小帆船从群山驶向海上日出，天空漂着网页卡片',
      'today-quest': '水墨风插画：背包旅人沿灯笼照亮的石阶登山，山顶插着红旗',
      'rank-banner': '水墨风插画：蜿蜒山路通往山顶一箱金币和卷轴地图，沿途插着小旗',
      'agent-banner': '水墨风插画：竹亭里的小机器人对着笔记本电脑工作，身边漂着工作流节点，金币落进瓷罐',
      'home-mid': '水墨风插画：书案上摊开的空白笔记本、毛笔与砚台、一杯茶，窗边有竹影'
    },
    ocean: {
      'hero-voyage': '水彩海岸插画：载着笔记本电脑的白色帆船驶过碧蓝海面，岬角上有白色灯塔，天空漂着网页卡片',
      'today-quest': '水彩海岸插画：背包旅人沿沙丘木栈道走向插着小旗的白色灯塔',
      'rank-banner': '水彩海岸插画：碧蓝浅海里的踏石小路通往沙洲上的一箱金币和卷轴地图',
      'agent-banner': '水彩海岸插画：海边小屋门廊上的白色小机器人对着笔记本电脑工作，金币落进玻璃罐',
      'home-mid': '水彩海岸插画：靠海窗边的木桌上摊开空白笔记本、贝壳和小盆栽'
    },
    pixel: {
      'hero-voyage': '像素风插画：粉色帆的小木船载着发光笔记本电脑驶向晚霞落日，沙滩上有棕榈树',
      'today-quest': '像素风插画：背包小人沿石阶爬上沙丘，山顶插着粉色旗子，旁边有灯笼和棕榈树',
      'rank-banner': '像素风插画：沙滩上插着检查点小旗的石板路通往一箱金币和藏宝图',
      'agent-banner': '像素风插画：沙滩遮阳伞下的小机器人对着笔记本电脑工作，工作流图标漂在空中，金币落进陶罐',
      'home-mid': '像素风插画：窗边书桌上摊开空白书本、台灯和粉红药水瓶，窗外是晚霞'
    }
  };
  function art(name, theme) {
    theme = valid(theme || global.document.documentElement.getAttribute('data-theme'));
    return 'assets/art/' + (theme === 'ink' ? '' : theme + '/') + name + '.webp';
  }
  function artAlt(name, theme) {
    theme = valid(theme || global.document.documentElement.getAttribute('data-theme'));
    return (ART_ALT[theme] && ART_ALT[theme][name]) || '';
  }
  function refreshArt(root) {
    var nodes = (root || global.document).querySelectorAll('img[data-art]');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i].getAttribute('data-art'), src = art(n);
      if (nodes[i].getAttribute('src') !== src) nodes[i].setAttribute('src', src);
      nodes[i].setAttribute('alt', artAlt(n));
    }
  }

  function apply(theme) {
    theme = valid(theme);
    var doc = global.document;
    doc.documentElement.setAttribute('data-theme', theme);
    var meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', COLORS[theme]);
    sync(doc);
    refreshArt(doc);
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
    art: art,
    artAlt: artAlt,
    refreshArt: refreshArt,
    THEMES: THEMES,
    LABELS: LABELS
  };

  try { apply(get()); } catch (e) {}
  if (global.document.readyState === 'loading') global.document.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : globalThis);
