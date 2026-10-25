/** 闲鱼方案上架卡：根据站内手册本地生成标题/卖点/交付物，一键复制。不调用外部 AI。 */
(function (global) {
  var STORE_KEY = 'gefei-xianyu-card-v1';
  var SITE = 'https://yuanqingsong2024.github.io/gefei-quest/';
  var COMPLIANCE = '只卖教程和方案，不卖账号、兑换码，也不做代领，不承诺收益。';
  var TITLE_LIMIT = 30;
  var FALLBACK_POINTS = ['按站内手册逐步操作', '交付文字步骤与链接清单', '可本地保存反复查看'];
  var BASE_DELIVERY = [
    '文字版步骤说明（可另存 PDF）',
    '站内原文链接清单',
    '上架前自检（禁区：账号/兑换码/代领）',
  ];
  var SKIP_H2 = /^(原则|诚实声明|版权与诚实|禁止|写入游戏|结论|取消项)/;
  var UNSAFE = /日入|月入|年入|躺赚|稳赚|保证收益|承诺收益|代领|兑换码|卖账号|买账号|账号出租/;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function cpLen(s) { return Array.from(String(s == null ? '' : s)).length; }
  function clip(s, n) {
    var a = Array.from(String(s == null ? '' : s));
    return a.length <= n ? a.join('') : a.slice(0, n).join('');
  }
  function nowIso() {
    try { return new Date().toISOString(); } catch (_) { return ''; }
  }
  function ico(name) {
    return global.QuestIcons && QuestIcons.svg ? QuestIcons.svg(name) : '';
  }
  function toast(t) {
    if (global.QuestModal && QuestModal.showToast) QuestModal.showToast(t);
  }

  function pickerGuides() {
    var Nv = global.QuestNav;
    if (!Nv || !Nv.GUIDES) return [];
    var prefer = { playbook: 0, note: 1 };
    return Nv.GUIDES.filter(function (g) { return g && g.id && !g.href; }).slice().sort(function (a, b) {
      var pa = prefer.hasOwnProperty(a.group) ? prefer[a.group] : 9;
      var pb = prefer.hasOwnProperty(b.group) ? prefer[b.group] : 9;
      if (pa !== pb) return pa - pb;
      return 0;
    });
  }

  function stripMd(s) {
    return String(s == null ? '' : s)
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[`*_>#]+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function h2s(md) {
    var out = [], seen = {};
    String(md || '').replace(/\r/g, '').split('\n').forEach(function (l) {
      var m = l.match(/^##\s+(.*)$/);
      if (!m) return;
      var t = stripMd(m[1]);
      if (!t || SKIP_H2.test(t) || seen[t] || UNSAFE.test(t)) return;
      seen[t] = 1;
      out.push(t);
    });
    return out;
  }

  function sourceUrl(id) {
    return SITE + '#guide-' + id;
  }

  function generate(guideId) {
    var Nv = global.QuestNav;
    var id = String(guideId || '');
    var g = Nv && Nv.guideById ? Nv.guideById(id) : null;
    if (!g && Nv && Nv.GUIDES) {
      var list = pickerGuides();
      g = list[0] || null;
      if (g) id = g.id;
    }
    var titleBase = (g && g.title) ? g.title : (id || '站内手册');
    var suffix = (g && g.group === 'note') ? '·可复制教程' : '·步骤方案';
    var title = clip(titleBase + suffix, TITLE_LIMIT);

    var md = (global.QUEST_GUIDES_MD || {})[id] || '';
    var heads = h2s(md);
    var points = [];
    var desc = g && g.desc ? stripMd(g.desc).replace(/[。．.]+$/, '') : '';
    if (desc && !UNSAFE.test(desc)) points.push(desc);
    heads.forEach(function (h) {
      if (points.length >= 3) return;
      var p = '含「' + clip(h, 18) + '」等分步说明';
      if (points.indexOf(p) >= 0 || UNSAFE.test(p)) return;
      points.push(p);
    });
    FALLBACK_POINTS.forEach(function (p) {
      if (points.length >= 3) return;
      if (points.indexOf(p) < 0) points.push(p);
    });
    points = points.slice(0, 3);

    var delivery = BASE_DELIVERY.slice();
    heads.slice(0, 2).forEach(function (h) {
      var item = '「' + clip(h, 22) + '」对照清单';
      if (delivery.indexOf(item) < 0) delivery.push(item);
    });

    return {
      guideId: id,
      title: title,
      points: points,
      delivery: delivery,
      sourceUrl: sourceUrl(id),
      compliance: COMPLIANCE,
      updatedAt: nowIso(),
    };
  }

  function loadAll() {
    try {
      var o = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
    } catch (_) { return {}; }
  }

  function load(guideId) {
    var d = loadAll()[guideId];
    return d && typeof d === 'object' ? d : null;
  }

  function save(guideId, draft) {
    if (!guideId || !draft) return draft;
    var all = loadAll();
    draft.guideId = guideId;
    draft.updatedAt = nowIso();
    draft.compliance = COMPLIANCE;
    all[guideId] = draft;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(all)); } catch (_) {}
    return draft;
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

  function formatAll(d) {
    var pts = (d.points || []).map(function (p, i) { return (i + 1) + '. ' + p; }).join('\n');
    var del = Array.isArray(d.delivery) ? d.delivery.join('\n') : String(d.delivery || '');
    return [
      '标题', d.title || '',
      '',
      '卖点', pts,
      '',
      '交付物清单', del,
      '',
      '原文来源', d.sourceUrl || '',
      '',
      '合规提示', COMPLIANCE,
    ].join('\n');
  }

  function readDraft(root, guideId) {
    var q = function (sel) { return root.querySelector(sel); };
    var titleEl = q('[data-xy="title"]');
    var delEl = q('[data-xy="delivery"]');
    var srcEl = q('[data-xy="source"]');
    return {
      guideId: guideId,
      title: clip(titleEl ? titleEl.value : '', TITLE_LIMIT),
      points: [1, 2, 3].map(function (i) {
        var el = q('[data-xy="point' + i + '"]');
        return el ? String(el.value || '').trim() : '';
      }),
      delivery: delEl ? String(delEl.value || '').split(/\n/).map(function (x) { return x.trim(); }).filter(Boolean) : [],
      sourceUrl: srcEl ? (srcEl.getAttribute('data-url') || srcEl.textContent || '') : sourceUrl(guideId),
      compliance: COMPLIANCE,
      updatedAt: nowIso(),
    };
  }

  function fill(root, d) {
    if (!d) return;
    var q = function (sel) { return root.querySelector(sel); };
    var titleEl = q('[data-xy="title"]');
    if (titleEl) titleEl.value = d.title || '';
    (d.points || []).forEach(function (p, i) {
      var el = q('[data-xy="point' + (i + 1) + '"]');
      if (el) el.value = p;
    });
    var delEl = q('[data-xy="delivery"]');
    if (delEl) delEl.value = (d.delivery || []).join('\n');
    var src = d.sourceUrl || sourceUrl(d.guideId);
    var srcEl = q('[data-xy="source"]');
    if (srcEl) {
      srcEl.textContent = src;
      srcEl.setAttribute('href', src);
      srcEl.setAttribute('data-url', src);
    }
    var comp = q('[data-xy="compliance"]');
    if (comp) comp.textContent = COMPLIANCE;
    updateCount(root);
  }

  function updateCount(root) {
    var titleEl = root.querySelector('[data-xy="title"]');
    var countEl = root.querySelector('[data-xy-count]');
    if (!titleEl || !countEl) return;
    var n = cpLen(titleEl.value);
    countEl.textContent = n + '/' + TITLE_LIMIT;
    countEl.classList.toggle('over', n > TITLE_LIMIT);
  }

  function hydrate(root, guideId, force) {
    var d = force ? null : load(guideId);
    if (!d || !d.title) {
      d = generate(guideId);
      save(guideId, d);
    }
    fill(root, d);
    return d;
  }

  function pickerHtml(currentId) {
    var list = pickerGuides();
    if (!list.length) return '';
    var groups = [];
    var order = ['playbook', 'note'];
    var by = {};
    list.forEach(function (g) {
      var k = g.group || 'other';
      if (!by[k]) { by[k] = []; groups.push(k); }
      by[k].push(g);
    });
    groups.sort(function (a, b) {
      var ia = order.indexOf(a), ib = order.indexOf(b);
      return (ia < 0 ? 9 : ia) - (ib < 0 ? 9 : ib);
    });
    var labels = { playbook: '作战手册', note: '笔记', template: '开站模板', other: '其它' };
    var html = '<label class="xy-fld xy-pick"><span class="xy-fld-head"><span>选用手册</span></span><select data-xy="guide">';
    groups.forEach(function (k) {
      html += '<optgroup label="' + esc(labels[k] || k) + '">';
      by[k].forEach(function (g) {
        html += '<option value="' + esc(g.id) + '"' + (g.id === currentId ? ' selected' : '') + '>' + esc(g.title) + '</option>';
      });
      html += '</optgroup>';
    });
    html += '</select></label>';
    return html;
  }

  function field(key, label, rows, extraHead) {
    extraHead = extraHead || '';
    var copyBtn = '<button type="button" class="btn btn-sm btn-ghost" data-xy-copy="' + esc(key) + '">复制</button>';
    if (rows <= 1) {
      return '<label class="xy-fld"><span class="xy-fld-head"><span>' + label + '</span>' + extraHead + copyBtn + '</span>' +
        '<input type="text" data-xy="' + esc(key) + '"' + (key === 'title' ? ' maxlength="' + TITLE_LIMIT + '"' : '') + ' /></label>';
    }
    return '<label class="xy-fld"><span class="xy-fld-head"><span>' + label + '</span>' + extraHead + copyBtn + '</span>' +
      '<textarea rows="' + rows + '" data-xy="' + esc(key) + '"></textarea></label>';
  }

  function renderHtml(guideId, allowPick) {
    var count = '<span class="xy-count" data-xy-count>0/' + TITLE_LIMIT + '</span>';
    return '<details class="cx-details xy-card">' +
      '<summary>' + ico('fish') + ' 生成闲鱼上架卡</summary>' +
      '<div class="xy-card-body">' +
        (allowPick ? pickerHtml(guideId) : '') +
        field('title', '标题', 1, count) +
        field('point1', '卖点 1', 2) +
        field('point2', '卖点 2', 2) +
        field('point3', '卖点 3', 2) +
        field('delivery', '交付物清单', 6) +
        '<div class="xy-fld"><span class="xy-fld-head"><span>原文来源</span>' +
          '<button type="button" class="btn btn-sm btn-ghost" data-xy-copy="source">复制</button></span>' +
          '<a class="xy-source" data-xy="source" href="#" target="_blank" rel="noopener noreferrer"></a></div>' +
        '<div class="xy-fld"><span class="xy-fld-head"><span>合规提示</span>' +
          '<button type="button" class="btn btn-sm btn-ghost" data-xy-copy="compliance">复制</button></span>' +
          '<p class="xy-compliance" data-xy="compliance">' + esc(COMPLIANCE) + '</p></div>' +
        '<div class="tool-actions xy-actions">' +
          '<button type="button" class="btn btn-sm" data-xy-act="regen">重新生成</button>' +
          '<button type="button" class="btn btn-sm btn-primary" data-xy-act="copy-all">复制全部</button>' +
          '<button type="button" class="btn btn-sm" data-xy-act="save">保存草稿</button>' +
        '</div>' +
        '<p class="xy-hint">草稿只存在本机浏览器</p>' +
      '</div></details>';
  }

  function fieldText(root, key, draft) {
    if (key === 'title') return draft.title || '';
    if (key === 'point1' || key === 'point2' || key === 'point3') {
      var i = +key.slice(5) - 1;
      return (draft.points && draft.points[i]) || '';
    }
    if (key === 'delivery') return (draft.delivery || []).join('\n');
    if (key === 'source') return draft.sourceUrl || '';
    if (key === 'compliance') return COMPLIANCE;
    return '';
  }

  function mount(container, opts) {
    if (!container) return null;
    opts = opts || {};
    var list = pickerGuides();
    var currentId = opts.guideId || (list[0] && list[0].id) || '';
    var allowPick = !!opts.allowPick;
    container.innerHTML = renderHtml(currentId, allowPick);
    var details = container.querySelector('details.xy-card');

    function currentDraft(force) {
      return hydrate(container, currentId, !!force);
    }

    currentDraft(false);

    if (details) {
      details.addEventListener('toggle', function () {
        if (details.open) currentDraft(false);
      });
    }

    var sel = container.querySelector('[data-xy="guide"]');
    if (sel) {
      sel.addEventListener('change', function () {
        currentId = sel.value;
        currentDraft(false);
      });
    }

    var timer = 0;
    container.addEventListener('input', function (e) {
      var el = e.target.closest('[data-xy]');
      if (!el || el.getAttribute('data-xy') === 'guide') return;
      if (el.getAttribute('data-xy') === 'title') {
        var next = clip(el.value, TITLE_LIMIT);
        if (next !== el.value) el.value = next;
        updateCount(container);
      }
      clearTimeout(timer);
      timer = setTimeout(function () {
        save(currentId, readDraft(container, currentId));
      }, 280);
    });

    container.addEventListener('click', function (e) {
      var copyBtn = e.target.closest('[data-xy-copy]');
      if (copyBtn) {
        e.preventDefault();
        var key = copyBtn.getAttribute('data-xy-copy');
        var d = readDraft(container, currentId);
        copyText(fieldText(container, key, d)).then(function (ok) {
          if (ok) toast('已复制');
        });
        return;
      }
      var act = e.target.closest('[data-xy-act]');
      if (!act) return;
      e.preventDefault();
      var kind = act.getAttribute('data-xy-act');
      if (kind === 'regen') {
        currentDraft(true);
        toast('已重新生成');
      } else if (kind === 'copy-all') {
        var all = readDraft(container, currentId);
        copyText(formatAll(all)).then(function (ok) {
          if (ok) toast('已复制全部');
        });
      } else if (kind === 'save') {
        save(currentId, readDraft(container, currentId));
        toast('草稿已保存');
      }
    });

    return details;
  }

  global.QuestXianyuCard = {
    mount: mount,
    generate: generate,
    load: load,
    save: save,
    copyText: copyText,
    COMPLIANCE: COMPLIANCE,
    STORE_KEY: STORE_KEY,
  };
})(typeof window !== 'undefined' ? window : globalThis);
