/** 挖词 15 分钟卡：固定四步勾选，进度只存本机 localStorage。不接付费 API、不存账号密码。 */
(function (global) {
  var STORE_KEY = 'gefei-dig15-card-v1';
  var STEPS = [
    { id: 'seed', label: '种子词', hint: '例：how to + 具体场景（how to merge PDF on Mac）' },
    { id: 'compete', label: '免费工具看竞争', hint: '用 Google / Keyword Surfer / AnswerThePublic 等免费工具扫一眼' },
    { id: 'outline', label: '一句话落地页大纲', hint: '痛点 → 方案 → 行动（写进笔记即可，不保证流量）' },
    { id: 'placeholder', label: '域名/仓库占位', hint: '记下候选域名或空仓库名；不含代注册，需你自己去注册' },
  ];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function ico(name) {
    return global.QuestIcons && QuestIcons.svg ? QuestIcons.svg(name) : '';
  }
  function toast(t) {
    if (global.QuestModal && QuestModal.showToast) QuestModal.showToast(t);
  }

  function emptyChecks() {
    var o = {};
    STEPS.forEach(function (s) { o[s.id] = false; });
    return o;
  }

  function load() {
    try {
      var o = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      if (!o || typeof o !== 'object' || Array.isArray(o)) o = {};
      var checks = emptyChecks();
      var src = o.checks && typeof o.checks === 'object' ? o.checks : {};
      STEPS.forEach(function (s) { checks[s.id] = !!src[s.id]; });
      return { open: !!o.open, checks: checks };
    } catch (_) {
      return { open: false, checks: emptyChecks() };
    }
  }

  function save(store) {
    var checks = emptyChecks();
    var src = store && store.checks && typeof store.checks === 'object' ? store.checks : {};
    STEPS.forEach(function (s) { checks[s.id] = !!src[s.id]; });
    var next = { open: !!(store && store.open), checks: checks };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch (_) {}
    return next;
  }

  function doneCount(checks) {
    var n = 0;
    STEPS.forEach(function (s) { if (checks && checks[s.id]) n++; });
    return n;
  }

  function stepHtml(step, checked, idx) {
    return '<li class="dig15-item' + (checked ? ' is-done' : '') + '">' +
      '<label class="dig15-check">' +
        '<input type="checkbox" data-dig15="' + esc(step.id) + '"' + (checked ? ' checked' : '') + ' />' +
        '<span class="dig15-num">' + (idx + 1) + '</span>' +
        '<span class="dig15-text">' +
          '<strong>' + esc(step.label) + '</strong>' +
          '<small>' + esc(step.hint) + '</small>' +
        '</span>' +
      '</label></li>';
  }

  function mount(container) {
    if (!container) return null;
    var painting = false;

    function paint() {
      painting = true;
      var store = load();
      var n = doneCount(store.checks);
      container.innerHTML =
        '<details class="cx-details dig15-card"' + (store.open ? ' open' : '') + '>' +
          '<summary>' + ico('calendar-check') + ' 挖词 15 分钟卡' +
            ' <small class="kw-badge">' + n + '/4</small></summary>' +
          '<div class="dig15-body">' +
            '<p class="kw-hint">把「挖词 → 上站」压成当天能勾完的四步。进度只存本机；不接付费 API、不存账号密码。</p>' +
            '<ol class="dig15-list">' +
              STEPS.map(function (s, i) { return stepHtml(s, !!store.checks[s.id], i); }).join('') +
            '</ol>' +
            '<div class="tool-actions dig15-actions">' +
              '<button type="button" class="btn btn-sm" data-dig15-act="reset">清空勾选</button>' +
            '</div>' +
            '<p class="kw-hint">不承诺收益。域名/仓库需你自行注册，本站不含代注册。</p>' +
          '</div></details>';
      painting = false;
    }

    paint();

    container.addEventListener('toggle', function (e) {
      if (painting) return;
      var d = e.target;
      if (!d || !d.classList || !d.classList.contains('dig15-card')) return;
      var store = load();
      store.open = !!d.open;
      save(store);
    }, true);

    container.addEventListener('change', function (e) {
      var input = e.target;
      if (!input || !input.getAttribute || !input.getAttribute('data-dig15')) return;
      var id = input.getAttribute('data-dig15');
      var store = load();
      store.checks[id] = !!input.checked;
      var live = container.querySelector('details.dig15-card');
      store.open = live ? !!live.open : store.open;
      save(store);
      var badge = container.querySelector('details.dig15-card > summary .kw-badge');
      if (badge) badge.textContent = doneCount(store.checks) + '/4';
      var li = input.closest('.dig15-item');
      if (li) {
        if (input.checked) li.classList.add('is-done');
        else li.classList.remove('is-done');
      }
    });

    container.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-dig15-act]') : null;
      if (!btn) return;
      e.preventDefault();
      if (btn.getAttribute('data-dig15-act') === 'reset') {
        var store = load();
        store.checks = emptyChecks();
        var live = container.querySelector('details.dig15-card');
        store.open = live ? !!live.open : true;
        save(store);
        paint();
        toast('已清空勾选');
      }
    });

    return container.querySelector('details.dig15-card');
  }

  global.QuestDig15Card = {
    mount: mount,
    load: load,
    save: save,
    STEPS: STEPS,
    STORE_KEY: STORE_KEY,
  };
})(typeof window !== 'undefined' ? window : globalThis);
