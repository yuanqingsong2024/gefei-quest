/** 挖词候选卡：本机收词，一键复制当闲鱼方案素材。不调用外部 AI。 */
(function (global) {
  var STORE_KEY = 'gefei-keyword-card-v1';
  var COMPLIANCE = (global.QuestXianyuCard && QuestXianyuCard.COMPLIANCE) || '只卖教程和方案，不卖账号、兑换码，也不做代领，不承诺收益。';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function nowIso() {
    try { return new Date().toISOString(); } catch (_) { return ''; }
  }
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function ico(name) {
    return global.QuestIcons && QuestIcons.svg ? QuestIcons.svg(name) : '';
  }
  function toast(t) {
    if (global.QuestModal && QuestModal.showToast) QuestModal.showToast(t);
  }
  function str(s) { return String(s == null ? '' : s); }
  function trim(s) { return str(s).trim(); }

  function load() {
    try {
      var o = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      if (!o || typeof o !== 'object' || Array.isArray(o)) o = {};
      return {
        cards: Array.isArray(o.cards) ? o.cards.filter(function (c) { return c && typeof c === 'object'; }) : [],
        open: !!o.open,
      };
    } catch (_) {
      return { cards: [], open: false };
    }
  }

  function save(store) {
    var next = {
      cards: store && Array.isArray(store.cards) ? store.cards : [],
      open: !!(store && store.open),
    };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch (_) {}
    return next;
  }

  function copyText(t) {
    t = String(t == null ? '' : t);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(t).then(function () { return true; }, fallback);
      }
    } catch (_) {}
    return Promise.resolve(fallback());
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = t;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (_) {}
      ta.remove();
      return ok;
    }
  }

  function formatOne(card) {
    card = card || {};
    return [
      '词：' + trim(card.word),
      '搜索意图：' + trim(card.intent),
      '拟标题：' + trim(card.title),
      '变现方式：' + trim(card.monetize),
    ].join('\n');
  }

  function formatAll(cards) {
    var body = (Array.isArray(cards) ? cards : []).map(formatOne).join('\n\n');
    return body + '\n合规提示\n' + COMPLIANCE;
  }

  function readForm(root) {
    var q = function (k) {
      var el = root.querySelector('[data-kw="' + k + '"]');
      return el ? trim(el.value) : '';
    };
    return { word: q('word'), intent: q('intent'), title: q('title'), monetize: q('monetize') };
  }

  function fillForm(root, card) {
    card = card || {};
    ['word', 'intent', 'title', 'monetize'].forEach(function (k) {
      var el = root.querySelector('[data-kw="' + k + '"]');
      if (el) el.value = card[k] || '';
    });
  }

  function cardById(cards, id) {
    var i;
    for (i = 0; i < cards.length; i++) if (cards[i] && cards[i].id === id) return cards[i];
    return null;
  }

  function noteOf(card) {
    return [trim(card && card.intent), trim(card && card.title)].filter(Boolean).join(' · ').slice(0, 80);
  }

  function ensureKeywords(saveObj) {
    if (!saveObj.keywords || typeof saveObj.keywords !== 'object') {
      saveObj.keywords = { items: [], s2Target: '', sort: 'score', filter: 'all' };
    } else if (!Array.isArray(saveObj.keywords.items)) {
      saveObj.keywords.items = [];
    }
    return saveObj.keywords.items;
  }

  function makeKeyword(word, note) {
    var data = { kw: word, src: '其它', vol: '', big: '', weak: '', intent: 'tool', note: note, star: false };
    if (global.QuestTools && typeof QuestTools.newKeyword === 'function') {
      return QuestTools.newKeyword(data);
    }
    return {
      id: uid(),
      at: Date.now(),
      star: false,
      kw: word,
      src: '其它',
      vol: '',
      big: '',
      weak: '',
      intent: 'tool',
      note: note,
    };
  }

  function hasWord(items, word) {
    return (items || []).some(function (x) { return x && trim(x.kw) === word; });
  }

  function sendToBoard(card) {
    var word = trim(card && card.word);
    if (!word) { toast('请先填写词'); return; }
    var note = noteOf(card);
    var SAVE_KEY = (global.QuestSave && QuestSave.SAVE_KEY) || 'gefei-quest-save-v1';

    if (global.QuestApp && typeof QuestApp.update === 'function' && typeof QuestApp.get === 'function') {
      var live = QuestApp.get() || {};
      if (hasWord(live.keywords && live.keywords.items, word)) { toast('练习板已有该词'); return; }
      QuestApp.update(function (s) {
        var items = ensureKeywords(s);
        if (!hasWord(items, word)) items.push(makeKeyword(word, note));
        return s;
      });
      toast('已填入选词练习板');
      return;
    }

    var saveObj;
    if (global.QuestSave && typeof QuestSave.loadSave === 'function') {
      saveObj = QuestSave.loadSave();
    } else {
      try { saveObj = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'); } catch (_) { saveObj = {}; }
    }
    if (!saveObj || typeof saveObj !== 'object') saveObj = {};
    var items = ensureKeywords(saveObj);
    if (hasWord(items, word)) { toast('练习板已有该词'); return; }
    items.push(makeKeyword(word, note));
    if (global.QuestSave && typeof QuestSave.saveSave === 'function') {
      QuestSave.saveSave(saveObj);
    } else {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(saveObj)); } catch (_) {}
    }
    toast('已填入选词练习板');
  }

  function field(key, label, ph) {
    return '<label class="kw-fld"><span class="kw-fld-head"><span>' + label + '</span></span>' +
      '<input type="text" data-kw="' + esc(key) + '" placeholder="' + esc(ph) + '" autocomplete="off" /></label>';
  }

  function itemHtml(c) {
    return '<li class="kw-item" data-kw-id="' + esc(c.id) + '">' +
      '<div class="kw-item-body">' +
        '<p><span>词</span>' + esc(c.word || '（空）') + '</p>' +
        '<p><span>搜索意图</span>' + esc(c.intent || '—') + '</p>' +
        '<p><span>拟标题</span>' + esc(c.title || '—') + '</p>' +
        '<p><span>变现方式</span>' + esc(c.monetize || '—') + '</p>' +
      '</div>' +
      '<div class="kw-item-actions">' +
        '<button type="button" class="btn btn-sm" data-kw-act="edit" data-id="' + esc(c.id) + '">编辑</button>' +
        '<button type="button" class="btn btn-sm btn-ghost" data-kw-act="copy" data-id="' + esc(c.id) + '">复制</button>' +
        '<button type="button" class="btn btn-sm" data-kw-act="to-board" data-id="' + esc(c.id) + '">填入选词练习板</button>' +
        '<button type="button" class="btn btn-sm btn-danger" data-kw-act="del" data-id="' + esc(c.id) + '">删除</button>' +
      '</div></li>';
  }

  function mount(container) {
    if (!container) return null;
    var editingId = '';

    function storeNow() { return load(); }
    var painting = false;

    function paint() {
      painting = true;
      var store = storeNow();
      var cards = store.cards;
      var editing = editingId ? cardById(cards, editingId) : null;
      if (editingId && !editing) editingId = '';
      var n = cards.length;
      container.innerHTML =
        '<details class="cx-details kw-card"' + (store.open ? ' open' : '') + '>' +
          '<summary>' + ico('search') + ' 挖词候选卡 <small class="kw-badge">' + n + '</small></summary>' +
          '<div class="kw-card-body">' +
            '<p class="kw-hint">把挖到的词收成小卡，可复制当闲鱼方案素材；草稿只存本机。</p>' +
            '<form class="kw-form" data-kw-form>' +
              field('word', '词', '例：pdf merge for mac') +
              field('intent', '搜索意图', '例：找免费在线合并工具') +
              field('title', '拟标题', '例：Mac 上合并 PDF 的免费方案') +
              field('monetize', '变现方式', '例：闲鱼卖步骤教程') +
              '<div class="tool-actions kw-form-actions">' +
                '<button type="submit" class="btn btn-sm btn-primary" data-kw-act="submit">' +
                  (editing ? '保存修改' : '添加') + '</button>' +
                (editing ? '<button type="button" class="btn btn-sm" data-kw-act="cancel">取消</button>' : '') +
              '</div>' +
            '</form>' +
            (n
              ? '<ol class="kw-list">' + cards.map(itemHtml).join('') + '</ol>'
              : '<p class="kw-empty">还没有候选卡。填四个字段后点「添加」。</p>') +
            '<div class="tool-actions kw-actions">' +
              '<button type="button" class="btn btn-sm btn-primary" data-kw-act="copy-all">复制全部</button>' +
            '</div>' +
            '<p class="kw-hint">全文末尾固定合规提示。不调用外部 AI，也不上传。</p>' +
          '</div></details>';
      if (editing) fillForm(container, editing);
      painting = false;
    }

    paint();

    container.addEventListener('toggle', function (e) {
      if (painting) return;
      var d = e.target;
      if (!d || !d.classList || !d.classList.contains('kw-card')) return;
      var store = storeNow();
      store.open = !!d.open;
      save(store);
    }, true);

    container.addEventListener('submit', function (e) {
      var form = e.target.closest('[data-kw-form]');
      if (!form) return;
      e.preventDefault();
      var f = readForm(container);
      if (!f.word) { toast('请填写词'); return; }
      var store = storeNow();
      if (editingId) {
        var cur = cardById(store.cards, editingId);
        if (cur) {
          cur.word = f.word;
          cur.intent = f.intent;
          cur.title = f.title;
          cur.monetize = f.monetize;
          cur.updatedAt = nowIso();
        }
        editingId = '';
        toast('已保存');
      } else {
        store.cards.push({
          id: uid(),
          word: f.word,
          intent: f.intent,
          title: f.title,
          monetize: f.monetize,
          updatedAt: nowIso(),
        });
        toast('已添加');
      }
      store.open = true;
      save(store);
      paint();
    });

    container.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-kw-act]');
      if (!btn) return;
      var act = btn.getAttribute('data-kw-act');
      if (act === 'submit') return;
      e.preventDefault();
      var id = btn.getAttribute('data-id');
      var store = storeNow();
      var card = id ? cardById(store.cards, id) : null;

      if (act === 'cancel') {
        editingId = '';
        paint();
        return;
      }
      if (act === 'edit') {
        if (!card) return;
        editingId = card.id;
        store.open = true;
        save(store);
        paint();
        var wordEl = container.querySelector('[data-kw="word"]');
        if (wordEl && wordEl.focus) wordEl.focus();
        return;
      }
      if (act === 'copy') {
        if (!card) return;
        copyText(formatOne(card)).then(function (ok) { if (ok) toast('已复制'); });
        return;
      }
      if (act === 'del') {
        if (!card) return;
        if (global.confirm && !global.confirm('删除「' + (card.word || '这张卡') + '」？')) return;
        store.cards = store.cards.filter(function (c) { return c && c.id !== id; });
        if (editingId === id) editingId = '';
        save(store);
        paint();
        toast('已删除');
        return;
      }
      if (act === 'to-board') {
        if (!card) return;
        sendToBoard(card);
        return;
      }
      if (act === 'copy-all') {
        copyText(formatAll(store.cards)).then(function (ok) { if (ok) toast('已复制'); });
      }
    });

    return container.querySelector('details.kw-card');
  }

  global.QuestKeywordCard = {
    mount: mount,
    load: load,
    save: save,
    formatOne: formatOne,
    formatAll: formatAll,
    COMPLIANCE: COMPLIANCE,
    STORE_KEY: STORE_KEY,
  };
})(typeof window !== 'undefined' ? window : globalThis);
