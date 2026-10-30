/** 挖词候选卡：本机收词，一键复制当闲鱼方案素材。不调用外部 AI。
 *  同 slot 附「SERP 标题拆解便签」：纯前端拆解最多 3 行标题，一键填入拟标题。 */
(function (global) {
  var STORE_KEY = 'gefei-keyword-card-v1';
  var SERP_KEY = 'gefei-serp-note-v1';
  var COMPLIANCE = (global.QuestXianyuCard && QuestXianyuCard.COMPLIANCE) || '只卖教程和方案，不卖账号、兑换码，也不做代领，不承诺收益。';
  var SERP_MODS = [
    { re: /\bhow\s+to\b/i, label: 'how to' },
    { re: /\bbest\b/i, label: 'best' },
    { re: /\btop\b/i, label: 'top' },
    { re: /\bfree\b/i, label: 'free' },
    { re: /\bvs\.?\b/i, label: 'vs' },
    { re: /\breview\b/i, label: 'review' },
    { re: /\bguide\b/i, label: 'guide' },
    { re: /\bfor\b/i, label: 'for' },
    { re: /最好/, label: '最好' },
    { re: /免费/, label: '免费' },
    { re: /怎么/, label: '怎么' },
    { re: /教程/, label: '教程' },
    { re: /对比/, label: '对比' },
    { re: /指南/, label: '指南' },
    { re: /最新/, label: '最新' },
  ];
  var SERP_KEEP_EN = {
    how: 1, to: 1, vs: 1, versus: 1, for: 1, with: 1, without: 1,
    in: 1, on: 1, of: 1, and: 1, or: 1, the: 1, a: 1, an: 1,
    best: 1, top: 1, free: 1, review: 1, guide: 1, online: 1,
  };
  var SERP_KEEP_PRETTY = {
    best: 'Best', top: 'Top', free: 'Free', review: 'review', guide: 'guide',
    vs: 'vs', versus: 'vs', online: 'online', for: 'for', with: 'with',
    without: 'without', in: 'in', on: 'on', of: 'of', and: 'and', or: 'or',
    the: 'the', a: 'a', an: 'an', how: 'How', to: 'to',
  };

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

  function loadSerp() {
    try {
      var o = JSON.parse(localStorage.getItem(SERP_KEY) || '{}');
      if (!o || typeof o !== 'object' || Array.isArray(o)) o = {};
      return {
        open: o.open === true,
        raw: typeof o.raw === 'string' ? o.raw : '',
        lastAt: typeof o.lastAt === 'string' ? o.lastAt : '',
      };
    } catch (_) {
      return { open: false, raw: '', lastAt: '' };
    }
  }

  function saveSerp(store) {
    var next = {
      open: !!(store && store.open),
      raw: store && typeof store.raw === 'string' ? store.raw : '',
      lastAt: store && typeof store.lastAt === 'string' && store.lastAt ? store.lastAt : nowIso(),
    };
    try { localStorage.setItem(SERP_KEY, JSON.stringify(next)); } catch (_) {}
    return next;
  }

  function persistSerp(patch) {
    var cur = loadSerp();
    if (patch && typeof patch === 'object') {
      if (Object.prototype.hasOwnProperty.call(patch, 'open')) cur.open = !!patch.open;
      if (Object.prototype.hasOwnProperty.call(patch, 'raw')) cur.raw = str(patch.raw);
    }
    cur.lastAt = nowIso();
    return saveSerp(cur);
  }

  function titleHasYear(t) {
    t = str(t);
    if (/\b(?:19|20)\d{2}\b/.test(t)) return true;
    if (/(?:19|20)\d{2}年/.test(t)) return true;
    return /(?:^|[^\dA-Za-z])(?:19|20)\d{2}(?=[^\dA-Za-z]|$)/.test(t);
  }

  function findSerpMods(t) {
    var out = [], seen = {};
    SERP_MODS.forEach(function (m) {
      if (m.re.test(t) && !seen[m.label]) {
        seen[m.label] = 1;
        out.push(m.label);
      }
    });
    return out;
  }

  function serpBare(w) {
    return str(w).replace(/^[^A-Za-z0-9\u4e00-\u9fff]+|[^A-Za-z0-9\u4e00-\u9fff]+$/g, '');
  }

  function isKeepEn(w) {
    return !!SERP_KEEP_EN[String(w || '').toLowerCase()];
  }

  function prettyKeep(w) {
    var l = String(w || '').toLowerCase();
    return SERP_KEEP_PRETTY[l] || w;
  }

  function skeletonEn(title) {
    var words = trim(title).split(/\s+/).filter(Boolean);
    var out = [];
    var i = 0;
    function takeContent() {
      var n = 0;
      while (i < words.length) {
        var w = serpBare(words[i]);
        if (!w) { i++; continue; }
        if (/^(?:19|20)\d{2}$/.test(w) || /^\d+(?:st|nd|rd|th)?$/i.test(w) || isKeepEn(w)) break;
        i++;
        n++;
      }
      return n;
    }
    while (i < words.length) {
      var w = serpBare(words[i]);
      if (!w) { i++; continue; }
      if (/^(?:19|20)\d{2}$/.test(w)) { out.push('{年份}'); i++; continue; }
      if (/^\d+(?:st|nd|rd|th)?$/i.test(w)) { out.push('{数字}'); i++; continue; }
      if (/^how$/i.test(w) && words[i + 1] && /^to$/i.test(serpBare(words[i + 1]))) {
        out.push('How to');
        i += 2;
        if (i < words.length && serpBare(words[i]) && !isKeepEn(serpBare(words[i])) &&
            !/^(?:19|20)\d{2}$/.test(serpBare(words[i])) && !/^\d+(?:st|nd|rd|th)?$/i.test(serpBare(words[i]))) {
          out.push('{动作}');
          i++;
        }
        if (takeContent()) out.push('{对象}');
        continue;
      }
      if (/^for$/i.test(w)) {
        out.push('for');
        i++;
        while (i < words.length && /^(the|a|an)$/i.test(serpBare(words[i]))) i++;
        if (takeContent()) out.push('{人群}');
        continue;
      }
      if (/^without$/i.test(w) || /^with$/i.test(w)) {
        out.push(w.toLowerCase());
        i++;
        if (takeContent()) out.push('{条件}');
        continue;
      }
      if (isKeepEn(w)) {
        out.push(prettyKeep(w));
        i++;
        continue;
      }
      if (takeContent()) out.push('{对象}');
    }
    return out.join(' ').replace(/\s+/g, ' ').trim();
  }

  function skeletonZh(title) {
    var s = str(title);
    var mods = ['最好', '免费', '怎么选', '怎么', '教程', '对比', '指南', '最新'];
    var Y = '\uE000', N = '\uE001', P = '\uE002', O = '\uE003';
    function mTok(i) { return String.fromCharCode(0xE010 + i); }
    s = s.replace(/(?:19|20)\d{2}年?/g, Y);
    s = s.replace(/\d+/g, N);
    s = s.replace(/[A-Za-z][A-Za-z0-9+\-./]*\s*用户/g, P);
    s = s.replace(/[\u4e00-\u9fff]{0,8}用户/g, P);
    mods.forEach(function (m, i) {
      s = s.replace(new RegExp(m, 'g'), mTok(i));
    });
    s = s.replace(/[A-Za-z][A-Za-z0-9+\-./]*/g, O);
    s = s.replace(/[\u4e00-\u9fff]{2,}/g, O);
    s = s.split(Y).join('{年份}');
    s = s.split(N).join('{数字}');
    s = s.split(P).join('{人群}');
    s = s.split(O).join('{对象}');
    mods.forEach(function (m, i) {
      s = s.split(mTok(i)).join(m);
    });
    s = s.replace(/(?:\{对象\}\s*)+/g, '{对象}');
    return s.replace(/\s+/g, ' ').trim();
  }

  function makeSkeleton(t) {
    t = trim(t);
    if (!t) return '';
    return /[\u4e00-\u9fff]/.test(t) ? skeletonZh(t) : skeletonEn(t);
  }

  function parseSerpTitle(t) {
    t = trim(t);
    var tokens = t.split(/\s+/).filter(Boolean);
    var chars = Array.from(t).length;
    var mods = findSerpMods(t);
    return {
      text: t,
      len: chars,
      words: tokens.length,
      hasNumber: /\d/.test(t),
      hasYear: titleHasYear(t),
      modifiers: mods,
      skeleton: makeSkeleton(t),
    };
  }

  function parseSerpRaw(raw) {
    var lines = str(raw).replace(/\r/g, '').split('\n').map(trim).filter(Boolean);
    return {
      rows: lines.slice(0, 3).map(parseSerpTitle),
      extra: lines.length > 3,
    };
  }

  function lenLabel(row) {
    var w = row && row.words ? row.words : 0;
    var c = row && row.len ? row.len : 0;
    if (w <= 1 && c) return c + ' 字';
    return w + ' 词 / ' + c + ' 字';
  }

  function yn(v) { return v ? '是' : '否'; }

  function serpItemHtml(row, idx) {
    var mods = (row.modifiers && row.modifiers.length) ? row.modifiers.join('、') : '无';
    return '<li class="serp-item">' +
      '<p class="serp-item-text">' + esc(row.text) + '</p>' +
      '<p class="serp-item-meta">' +
        '<span>' + esc(lenLabel(row)) + '</span>' +
        '<span>含数字：' + yn(row.hasNumber) + '</span>' +
        '<span>含年份：' + yn(row.hasYear) + '</span>' +
        '<span>修饰词：' + esc(mods) + '</span>' +
      '</p>' +
      '<p class="serp-item-skel"><span>可仿写骨架</span>' + esc(row.skeleton || '—') + '</p>' +
      '<div class="serp-item-actions">' +
        '<button type="button" class="btn btn-sm" data-serp-act="fill-one" data-i="' + idx + '">用此条填入</button>' +
      '</div></li>';
  }

  function serpResultsHtml(rows) {
    if (!rows || !rows.length) {
      return '<p class="kw-empty serp-empty">先粘贴 1–3 行标题，点「拆解」。</p>';
    }
    return '<ol class="serp-list">' + rows.map(serpItemHtml).join('') + '</ol>';
  }

  function serpHtml(st, rows) {
    var n = rows && rows.length ? rows.length : 0;
    return '<details class="cx-details serp-note"' + (st && st.open ? ' open' : '') + '>' +
      '<summary>' + ico('list') + ' SERP 标题拆解便签' +
        (n ? ' <small class="kw-badge">' + n + '</small>' : '') + '</summary>' +
      '<div class="serp-note-body">' +
        '<p class="kw-hint">从谷歌结果页复制最多 3 条标题，本机拆解词长 / 数字年份 / 修饰词，并生成可仿写骨架；不上传、不调外部 AI。</p>' +
        '<label class="kw-fld"><span class="kw-fld-head"><span>标题</span></span>' +
          '<textarea data-serp="raw" rows="3" placeholder="每行一条标题，最多 3 行"></textarea></label>' +
        '<div class="tool-actions serp-actions">' +
          '<button type="button" class="btn btn-sm btn-primary" data-serp-act="parse">拆解</button>' +
          '<button type="button" class="btn btn-sm" data-serp-act="fill-skel">填入拟标题</button>' +
        '</div>' +
        '<div class="serp-results" data-serp="results">' + serpResultsHtml(rows) + '</div>' +
        '<p class="kw-hint">拆解只在本机完成。不调用外部 AI，也不上传。</p>' +
      '</div></details>';
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
    var lastRows = [];

    function storeNow() { return load(); }
    var painting = false;

    function readSerpRaw() {
      var ta = container.querySelector('[data-serp="raw"]');
      return ta ? ta.value : loadSerp().raw;
    }

    function currentParse() {
      return parseSerpRaw(readSerpRaw());
    }

    function paintSerpResults(rows) {
      lastRows = rows || [];
      var box = container.querySelector('[data-serp="results"]');
      if (box) box.innerHTML = serpResultsHtml(lastRows);
      var badge = container.querySelector('details.serp-note > summary .kw-badge');
      var sum = container.querySelector('details.serp-note > summary');
      if (sum) {
        if (lastRows.length) {
          if (badge) badge.textContent = String(lastRows.length);
          else {
            var sm = document.createElement('small');
            sm.className = 'kw-badge';
            sm.textContent = String(lastRows.length);
            sum.appendChild(sm);
          }
        } else if (badge) {
          badge.remove();
        }
      }
    }

    function fillTitle(text) {
      text = trim(text);
      if (!text) { toast('先粘贴 1–3 行标题'); return; }
      var kwCard = container.querySelector('details.kw-card');
      var didOpen = false;
      if (kwCard && !kwCard.open) {
        kwCard.open = true;
        var store = storeNow();
        store.open = true;
        save(store);
        didOpen = true;
      }
      var el = container.querySelector('[data-kw="title"]');
      if (!el) { toast('未找到拟标题栏'); return; }
      el.value = text;
      try { if (el.focus) el.focus(); } catch (_) {}
      toast(didOpen ? '已展开候选卡并填入拟标题' : '已填入拟标题');
    }

    function paint() {
      painting = true;
      var liveNote = container.querySelector('details.serp-note');
      var liveTa = container.querySelector('[data-serp="raw"]');
      if (liveNote || liveTa) {
        persistSerp({
          open: liveNote ? !!liveNote.open : loadSerp().open,
          raw: liveTa ? liveTa.value : loadSerp().raw,
        });
      }
      var store = storeNow();
      var cards = store.cards;
      var editing = editingId ? cardById(cards, editingId) : null;
      if (editingId && !editing) editingId = '';
      var n = cards.length;
      var serp = loadSerp();
      lastRows = parseSerpRaw(serp.raw).rows;
      container.innerHTML =
        '<details class="cx-details kw-card"' + (store.open ? ' open' : '') + '>' +
          '<summary>' + ico('search') + ' 挖词候选卡 <small class="kw-badge">' + n + '</small></summary>' +
          '<div class="kw-card-body">' +
            '<p class="kw-hint">把挖到的词收成小卡，可复制当闲鱼方案素材；草稿只存本机。计数只含本卡，不含「选词练习板」里的候选词。</p>' +
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
          '</div></details>' +
        serpHtml(serp, lastRows);
      if (editing) fillForm(container, editing);
      var ta = container.querySelector('[data-serp="raw"]');
      if (ta) ta.value = serp.raw || '';
      painting = false;
    }

    paint();

    container.addEventListener('toggle', function (e) {
      if (painting) return;
      var d = e.target;
      if (!d || !d.classList) return;
      if (d.classList.contains('kw-card')) {
        var store = storeNow();
        store.open = !!d.open;
        save(store);
        return;
      }
      if (d.classList.contains('serp-note')) {
        persistSerp({ open: !!d.open, raw: readSerpRaw() });
      }
    }, true);

    container.addEventListener('input', function (e) {
      var ta = e.target && e.target.closest ? e.target.closest('[data-serp="raw"]') : null;
      if (!ta) return;
      persistSerp({ raw: ta.value });
    });

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
      var serpBtn = e.target.closest('[data-serp-act]');
      if (serpBtn) {
        e.preventDefault();
        var sAct = serpBtn.getAttribute('data-serp-act');
        try {
          var parsed = currentParse();
          persistSerp({ raw: readSerpRaw() });
          if (sAct === 'parse') {
            lastRows = parsed.rows;
            paintSerpResults(lastRows);
            if (!lastRows.length) toast('先粘贴 1–3 行标题');
            else if (parsed.extra) toast('只拆解前 3 行');
            return;
          }
          if (sAct === 'fill-skel') {
            lastRows = parsed.rows;
            paintSerpResults(lastRows);
            if (!lastRows.length) { toast('先粘贴 1–3 行标题'); return; }
            fillTitle(lastRows[0].skeleton);
            return;
          }
          if (sAct === 'fill-one') {
            lastRows = parsed.rows;
            var idx = parseInt(serpBtn.getAttribute('data-i'), 10);
            var row = lastRows[idx];
            if (!row) { toast('先粘贴 1–3 行标题'); return; }
            fillTitle(row.text);
          }
        } catch (_) {
          toast('拆解失败，请检查标题格式');
        }
        return;
      }
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
    SERP_KEY: SERP_KEY,
    loadSerp: loadSerp,
    saveSerp: saveSerp,
    parseSerp: parseSerpRaw,
    parseSerpTitle: parseSerpTitle,
  };
})(typeof window !== 'undefined' ? window : globalThis);
