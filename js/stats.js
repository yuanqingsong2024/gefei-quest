/** Phase 10 · 学习统计 #me-stats · 今日任务卡片 · 更新日志 #changelog
 *  存档追加字段：activity {date:count} · doneDates {questId:date} · lastSeenChangelog (number) */
(function (global) {
  var I = function (n) { return global.QuestIcons.svg(n); };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var a = s.split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }
  function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); return x; }
  function monday(d) { return addDays(d, -((d.getDay() + 6) % 7)); }
  function today() { return ymd(new Date()); }
  function log() { return global.QUEST_CHANGELOG || []; }

  /* ---------- 存档记录（由 QuestSave.saveSave 调用，原地修改） ---------- */
  function record(state, prevRaw) {
    if (!state || typeof state !== 'object') return state;
    var t = today();
    var act = state.activity && typeof state.activity === 'object' ? state.activity : {};
    var dd = state.doneDates && typeof state.doneDates === 'object' ? state.doneDates : {};
    var done = Array.isArray(state.done) ? state.done : [];
    var changed = false;
    done.forEach(function (id) { if (!dd[id]) { dd[id] = t; changed = true; } });
    Object.keys(dd).forEach(function (id) { if (done.indexOf(id) < 0) delete dd[id]; });
    // 有效活动：新完成任务、工具/补给数据有变化
    var sig = JSON.stringify([done.length, state.weeklyClaimed, state.kit, state.keywords && state.keywords.items, state.keywords && state.keywords.s2Target, state.sites]);
    if (prevRaw == null || sig !== prevRaw || changed) act[t] = (act[t] || 0) + 1;
    state.activity = act; state.doneDates = dd;
    if (typeof state.lastSeenChangelog !== 'number') state.lastSeenChangelog = 0;
    return state;
  }
  function signature(state) {
    if (!state) return null;
    return JSON.stringify([(state.done || []).length, state.weeklyClaimed, state.kit, state.keywords && state.keywords.items, state.keywords && state.keywords.s2Target, state.sites]);
  }

  /* ---------- 计算 ---------- */
  function streaks(act) {
    var days = Object.keys(act || {}).filter(function (k) { return act[k] > 0; }).sort();
    var longest = 0, run = 0, prev = null;
    days.forEach(function (d) {
      run = prev && ymd(addDays(parse(prev), 1)) === d ? run + 1 : 1;
      if (run > longest) longest = run; prev = d;
    });
    var cur = 0, set = {}; days.forEach(function (d) { set[d] = 1; });
    var c = new Date(); if (!set[ymd(c)]) c = addDays(c, -1);
    while (set[ymd(c)]) { cur++; c = addDays(c, -1); }
    return { current: cur, longest: longest, total: days.length, today: !!set[today()] };
  }
  function weekly(dd, weeks) {
    var start = monday(new Date()), out = [];
    for (var i = weeks - 1; i >= 0; i--) {
      var a = addDays(start, -7 * i), b = addDays(a, 7), n = 0;
      Object.keys(dd || {}).forEach(function (id) { var d = parse(dd[id]); if (d >= a && d < b) n++; });
      out.push({ label: pad(a.getMonth() + 1) + '/' + pad(a.getDate()), n: n });
    }
    return out;
  }
  function nextQuests(state, n) {
    var D = global.QuestData, done = state.done || [], unlocked = state.unlocked || [];
    var list = D.QUESTS.filter(function (q) { return done.indexOf(q.id) < 0 && unlocked.indexOf(q.chapterId) >= 0; });
    list.sort(function (a, b) { return (a.side ? 1 : 0) - (b.side ? 1 : 0); });
    return list.slice(0, n || 3);
  }
  function unseen(state) { var s = (state && state.lastSeenChangelog) || 0; return log().filter(function (e) { return e.id > s; }).length; }
  function latestId() { return log().reduce(function (m, e) { return Math.max(m, e.id); }, 0); }

  /* ---------- SVG ---------- */
  function heatmap(act) {
    var W = 26, cell = 13, gap = 3, L = 26, T = 18;
    var start = addDays(monday(new Date()), -7 * (W - 1)), t = today(), rects = '', months = '', lastM = -1;
    for (var w = 0; w < W; w++) {
      var ws = addDays(start, 7 * w);
      if (ws.getMonth() !== lastM) { lastM = ws.getMonth(); months += '<text x="' + (L + w * (cell + gap)) + '" y="11" class="hm-txt">' + (lastM + 1) + '月</text>'; }
      for (var d = 0; d < 7; d++) {
        var day = addDays(ws, d), k = ymd(day); if (k > t) continue;
        var c = (act && act[k]) || 0, lv = c === 0 ? 0 : c < 3 ? 1 : c < 6 ? 2 : c < 10 ? 3 : 4;
        rects += '<rect class="hm-' + lv + (k === t ? ' hm-today' : '') + '" data-date="' + k + '" x="' + (L + w * (cell + gap)) + '" y="' + (T + d * (cell + gap)) + '" width="' + cell + '" height="' + cell + '" rx="3"><title>' + k + '：' + c + ' 次活动</title></rect>';
      }
    }
    var lbl = ['一', '', '三', '', '五', '', '日'].map(function (s, i) { return s ? '<text x="0" y="' + (T + i * (cell + gap) + 10) + '" class="hm-txt">' + s + '</text>' : ''; }).join('');
    var vw = L + W * (cell + gap), vh = T + 7 * (cell + gap);
    return '<div class="hm-wrap hm-wrap-hm"><svg class="heatmap" viewBox="0 0 ' + vw + ' ' + vh + '" role="img" aria-label="近 26 周打卡热力图">' + months + lbl + rects + '</svg></div>' +
      '<p class="hm-legend">少 <i class="hm-0"></i><i class="hm-1"></i><i class="hm-2"></i><i class="hm-3"></i><i class="hm-4"></i> 多 · 一次有效操作（勾任务、领补给、工具保存）记 1 次</p>';
  }
  function bars(data) {
    var W = 560, H = 190, P = 28, max = Math.max.apply(null, data.map(function (d) { return d.n; }).concat([1]));
    var bw = (W - P * 2) / data.length, out = '';
    data.forEach(function (d, i) {
      var h = (H - P * 2) * d.n / max, x = P + i * bw + bw * 0.18, y = H - P - h;
      out += '<rect class="bar-rect" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (bw * 0.64).toFixed(1) + '" height="' + Math.max(h, d.n ? 2 : 0).toFixed(1) + '" rx="3"><title>' + d.label + ' 周：' + d.n + ' 个</title></rect>' +
        (d.n ? '<text class="bar-val" x="' + (x + bw * 0.32).toFixed(1) + '" y="' + (y - 5).toFixed(1) + '" text-anchor="middle">' + d.n + '</text>' : '') +
        (i % 2 === 0 || i === data.length - 1 ? '<text class="bar-lbl" x="' + (x + bw * 0.32).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + d.label + '</text>' : '');
    });
    return '<div class="hm-wrap"><svg class="week-bars" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="近 12 周每周完成任务数"><line x1="' + P + '" y1="' + (H - P) + '" x2="' + (W - P) + '" y2="' + (H - P) + '" class="bar-axis"/>' + out + '</svg></div>';
  }

  /* ---------- 页面 ---------- */
  function renderStats(state, root) {
    var D = global.QuestData, T = global.QuestTools, s = streaks(state.activity), wk = weekly(state.doneDates, 12);
    var wkTotal = wk[wk.length - 1].n, done = state.done || [];
    var undated = done.filter(function (id) { return !(state.doneDates || {})[id]; }).length;
    var chapters = D.CHAPTERS.map(function (ch) {
      var qs = D.getQuestsByChapter(ch.id), n = qs.filter(function (q) { return done.indexOf(q.id) >= 0; }).length, pct = qs.length ? Math.round(n * 100 / qs.length) : 0;
      return '<li class="mod-row"><span class="card-ico">' + I(ch.icon) + '</span><b>' + esc(ch.name) + '</b><div class="bar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + pct + '%"></i></div><span class="mod-num">' + n + '/' + qs.length + '</span></li>';
    }).join('');
    var kw = (state.keywords && state.keywords.items) || [], good = 0, mid = 0, star = 0;
    kw.forEach(function (k) { var sc = T.score(k); if (sc >= 65) good++; else if (sc >= 40) mid++; if (k.star) star++; });
    var S = T.summary(JSON.parse(JSON.stringify({ sites: state.sites })));
    var allLogs = 0, totUsd = 0, totClicks = 0;
    ((state.sites && state.sites.items) || []).forEach(function (x) { (x.logs || []).forEach(function (l) { allLogs++; totUsd += +l.usd || 0; totClicks += +l.clicks || 0; }); });
    root.innerHTML =
      '<section class="block"><h2 class="block-title">' + I('fire') + '连续学习</h2><div class="stat-grid" id="stats-streak">' +
      '<div class="stat"><span class="card-ico">' + I('fire') + '</span><b id="st-cur">' + s.current + ' 天</b><small>当前连续</small></div>' +
      '<div class="stat"><span class="card-ico">' + I('trophy') + '</span><b id="st-long">' + s.longest + ' 天</b><small>最长连续</small></div>' +
      '<div class="stat"><span class="card-ico">' + I('calendar') + '</span><b id="st-days">' + s.total + ' 天</b><small>累计学习天数</small></div>' +
      '<div class="stat"><span class="card-ico">' + I('list') + '</span><b>' + wkTotal + '</b><small>本周完成任务</small></div></div>' +
      '<p class="hint">' + (s.today ? '今天已打卡，保持住。' : '今天还没有记录：勾一个任务或在工具里保存一次，就算打卡。') + '</p></section>' +
      '<section class="block glass"><h2 class="block-title">' + I('calendar') + '打卡热力图 <small>近 26 周</small></h2>' + heatmap(state.activity) + '</section>' +
      '<section class="block glass"><h2 class="block-title">' + I('chart') + '每周完成任务 <small>近 12 周</small></h2>' + bars(wk) +
      (undated ? '<p class="hint">有 ' + undated + ' 个任务是在统计功能上线前完成的，没有日期，不计入柱状图。</p>' : '') + '</section>' +
      '<section class="block glass"><h2 class="block-title">' + I('map') + '各章节进度</h2><ul class="mod-list">' + chapters + '</ul></section>' +
      '<section class="block"><h2 class="block-title">' + I('toolbox') + '工具汇总</h2><div class="stat-grid">' +
      '<a class="stat stat-link" href="#war-keywords"><span class="card-ico">' + I('tag') + '</span><b id="st-kw">' + kw.length + '</b><small>候选词 · 适合练手 ' + good + ' · 可以试 ' + mid + ' · 星标 ' + star + '</small></a>' +
      '<a class="stat stat-link" href="#me-sites"><span class="card-ico">' + I('ledger') + '</span><b id="st-sites">' + S.count + '</b><small>站点 · ' + (S.t ? esc(S.month) + ' 点击 ' + S.t.clicks : '暂无月度记录') + '</small></a>' +
      '<a class="stat stat-link" href="#me-sites"><span class="card-ico">' + I('coin') + '</span><b>$' + totUsd.toFixed(2) + '</b><small>累计记录收入 · ' + allLogs + ' 条月记录 · 点击 ' + totClicks + '</small></a>' +
      '<a class="stat stat-link" href="#war-kit"><span class="card-ico">' + I('kit') + '</span><b>' + Object.keys((state.kit && state.kit.checks) || {}).filter(function (k) { return state.kit.checks[k]; }).length + '</b><small>站一自查表已勾项</small></a>' +
      '</div></section>' +
      '<p class="tool-privacy">' + I('lock') + '统计全部由本机浏览器里的存档计算，不上传。</p>';
  }

  function renderChangelog(state, root) {
    var seen = state.lastSeenChangelog || 0;
    root.innerHTML = '<section class="block"><p class="hint">网站有新内容时会记在这里；顶栏「我的进度」和首页出现红点即表示有没看过的更新。机器可读版本：<a href="daily.json" target="_blank" rel="noopener">daily.json</a>。</p>' +
      '<ol class="cl-list">' + log().map(function (e) {
        return '<li class="cl-item glass' + (e.id > seen ? ' is-new' : '') + '" data-cl="' + e.id + '"><div class="cl-head"><span class="pill">' + esc(e.tag) + '</span><time>' + esc(e.date) + '</time>' + (e.id > seen ? '<span class="new-badge">NEW</span>' : '') + '</div>' +
          '<h3>' + (e.href ? '<a href="' + esc(e.href) + '">' + esc(e.title) + '</a>' : esc(e.title)) + '</h3><ul>' + e.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></li>';
      }).join('') + '</ol></section>';
  }

  function todayCard(state) {
    var s = streaks(state.activity), qs = nextQuests(state, 3), D = global.QuestData, u = unseen(state), latest = log()[0];
    return '<section class="lp-sec today-sec" id="home-today"><div class="glass today-card">' +
      '<div class="today-head"><div><span class="sec-kicker">TODAY</span><h2>今日任务</h2></div>' +
      '<div class="today-streak"><span class="card-ico">' + I('fire') + '</span><b id="today-streak">' + s.current + '</b><small>天连续' + (s.today ? ' · 今日已打卡' : ' · 今日未打卡') + '</small></div></div>' +
      (qs.length ? '<ol class="today-list" id="today-list">' + qs.map(function (q) {
        var ch = D.getChapter(q.chapterId);
        return '<li><a href="#path-quests" data-today-ch="' + esc(q.chapterId) + '"><span class="card-ico">' + I(ch ? ch.icon : 'flag') + '</span><span><b>' + esc(q.title) + '</b><small>' + esc(ch ? ch.name : '') + ' · ' + esc(q.action).slice(0, 48) + (q.action.length > 48 ? '…' : '') + '</small></span><em>+' + q.xp + ' XP</em></a></li>';
      }).join('') + '</ol>' : '<p class="hint">已解锁的任务都完成了，去作战室继续下一站。</p>') +
      '<div class="today-foot"><a class="btn btn-sm" href="#me-stats">' + I('chart') + '学习统计</a>' +
      '<a class="btn btn-sm cl-link" href="#changelog" id="today-changelog">' + I('bulb') + '更新日志' + (u ? '<span class="red-dot" aria-label="' + u + ' 条新更新">' + u + '</span>' : '') + '</a>' +
      (latest ? '<span class="today-latest">最新：' + esc(latest.date) + ' · ' + esc(latest.title) + '</span>' : '') + '</div></div></section>';
  }

  global.QuestStats = { record: record, signature: signature, streaks: streaks, weekly: weekly, nextQuests: nextQuests, unseen: unseen, latestId: latestId, renderStats: renderStats, renderChangelog: renderChangelog, todayCard: todayCard, ymd: ymd };
})(typeof window !== 'undefined' ? window : globalThis);
