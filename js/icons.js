/** Phase 11 · 统一图标家族
 *  规格：24×24 网格 · 2px 安全边 · stroke 1.75 · round caps/joins · currentColor
 *  每个图标 = 线稿 + 一块淡色强调面（<g class="ia">，fill currentColor 22%），保证同一家族的体量感一致。
 *  badge(name)：渐变圆角底 + 图标；色调由 TONE 决定（gold / cyan / green / violet / rose / slate）。 */
(function (global) {
  function A(d) { return '<g class="ia" fill="currentColor" stroke="none" opacity=".15">' + d + '</g>'; }
  var P = {
    lighthouse: A('<path d="M10.2 9h3.6l1 11H9.2z"/>') + '<path d="M9 21l1.2-12h3.6L15 21"/><path d="M9.2 9h5.6"/><path d="M10.4 9l.6-4h2l.6 4"/><path d="M12 3v2"/><path d="M4 6.5l3.5 1M20 6.5l-3.5 1"/><path d="M5 21h14"/>',
    map: A('<path d="M9 4l6 2v14l-6-2z"/>') + '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
    list: A('<rect x="3" y="4" width="5" height="16" rx="1.5"/>') + '<path d="M11 6.5h9M11 12h9M11 17.5h9"/><path d="M4 6.5l1 1 2-2M4 12l1 1 2-2M4 17.5l1 1 2-2"/>',
    target: A('<circle cx="12" cy="12" r="5"/>') + '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.25"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21"/>',
    toolbox: A('<rect x="3" y="8" width="18" height="5" rx="1"/>') + '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8.5 8V6a2 2 0 012-2h3a2 2 0 012 2v2"/><path d="M3 13h18M10 12v3h4v-3"/>',
    book: A('<path d="M5 5a2 2 0 012-2h12v13H7a2 2 0 00-2 2z"/>') + '<path d="M5 18V5a2 2 0 012-2h12v16H7a2 2 0 100 4h12"/><path d="M9 7.5h6M9 11h4"/>',
    calendar: A('<rect x="3" y="5" width="18" height="5" rx="2"/>') + '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="M7.5 14h3v3h-3z"/>',
    user: A('<circle cx="12" cy="8" r="4"/>') + '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
    trophy: A('<path d="M8 4h8v5a4 4 0 01-8 0z"/>') + '<path d="M8 4h8v5a4 4 0 01-8 0z"/><path d="M8 6H5.5a2.5 2.5 0 002.8 4M16 6h2.5a2.5 2.5 0 01-2.8 4"/><path d="M12 13v4M8 21h8M9.5 17h5"/>',
    code: A('<rect x="3" y="4" width="18" height="16" rx="2"/>') + '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 9.5L6.5 12 9 14.5M15 9.5l2.5 2.5-2.5 2.5M13 8.5l-2 7"/>',
    flag: A('<path d="M6 4h11l-2 4 2 4H6z"/>') + '<path d="M6 21V3.5"/><path d="M6 4h11l-2 4 2 4H6"/>',
    island1: A('<path d="M7 16c1-3 3-4.5 5-4.5s4 1.5 5 4.5z"/>') + '<path d="M3 19c3-2 6-2 9 0s6 2 9 0"/><path d="M7 16c1-3 3-4.5 5-4.5s4 1.5 5 4.5"/><path d="M12 11.5V4.5l4 2-4 2"/>',
    island2: A('<path d="M11 16c1-3 3-5 5-5s3.5 2 4.5 5z"/>') + '<path d="M3 19c3-2 6-2 9 0s6 2 9 0"/><path d="M4.5 16c1-2 2.3-3 4-3s3 1 4 3M11 16c1-3 3-5 5-5s3.5 2 4.5 5"/><path d="M16 11V5.5l3 1.5-3 1.5"/>',
    island3: A('<path d="M9 16c1-2 2-3 3-3s2 1 3 3z"/>') + '<path d="M3 19c3-2 6-2 9 0s6 2 9 0"/><path d="M3 16c.7-1.5 1.5-2 2.5-2s1.8.5 2.5 2M9 16c1-2 2-3 3-3s2 1 3 3M16 16c.7-1.5 1.5-2 2.5-2s1.8.5 2.5 2"/><path d="M12 13V6.5l3 1.5-3 1.5"/>',
    chart: A('<path d="M4 20l3-5 4-4 3 3 5-6v12z"/>') + '<path d="M4 4v16h16"/><path d="M7 15l4-4 3 3 5-6"/><path d="M15.5 8H19v3.5"/>',
    rocket: A('<path d="M12 15c4-3 6-7 6-12-5 0-9 2-12 6z"/>') + '<path d="M12 15c4-3 6-7 6-12-5 0-9 2-12 6z"/><path d="M9 12l-4 1 2-4M12 15l-1 4 4-2"/><circle cx="14" cy="8" r="1.5"/><path d="M6.5 17.5L4 20"/>',
    wrench: A('<circle cx="16" cy="8" r="4"/>') + '<path d="M14.5 5a4 4 0 004.5 4.5L11 17.5a2.1 2.1 0 01-3-3l8-8A4 4 0 0114.5 5z"/><path d="M14.5 5L16 3.5M19 9.5L20.5 8"/>',
    globe: A('<path d="M12 3c3 3 3 15 0 18-3-3-3-15 0-18z"/>') + '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    coin: A('<circle cx="12" cy="12" r="9"/>') + '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2"/>',
    route: A('<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/>') + '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 000-6H9a3 3 0 010-6h6.5"/>',
    fish: A('<path d="M4 12c3-4 6.5-6 10-6 3 0 5 2 7 6-2 4-4 6-7 6-3.5 0-7-2-10-6z"/>') + '<path d="M4 12c3-4 6.5-6 10-6 3 0 5 2 7 6-2 4-4 6-7 6-3.5 0-7-2-10-6z"/><path d="M4 12L2.5 8.5M4 12l-1.5 3.5"/><circle cx="16" cy="11" r=".9"/>',
    bulb: A('<path d="M12 3a6 6 0 00-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0012 3z"/>') + '<path d="M9 18.5h6M10 21.5h4"/><path d="M12 3a6 6 0 00-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0012 3z"/>',
    users: A('<circle cx="9" cy="8" r="3.5"/>') + '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14a6 6 0 013.5 6"/>',
    file: A('<path d="M14 3v5h5z"/>') + '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
    template: A('<rect x="3" y="4" width="18" height="5" rx="2"/>') + '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
    ship: A('<path d="M12 4l6 9h-6z"/>') + '<path d="M3 16l2 4h14l2-4z"/><path d="M12 3v13M12 4l6 9h-6M12 6l-5 7h5"/>',
    compass: A('<path d="M15.5 8.5l-2 5-5 2 2-5z"/>') + '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    search: A('<circle cx="11" cy="11" r="6.5"/>') + '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    build: A('<path d="M9 21v-6h6v6z"/>') + '<path d="M4 21V10l8-6 8 6v11z"/><path d="M9 21v-6h6v6"/>',
    star: A('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>') + '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    gear: A('<circle cx="12" cy="12" r="6"/>') + '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M2.5 12h3M18.5 12h3M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    download: A('<rect x="4" y="17" width="16" height="4" rx="1"/>') + '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    lock: A('<rect x="5" y="11" width="14" height="10" rx="2"/>') + '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3M12 15v2"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v6H4V6h6"/>',
    kit: A('<path d="M4 7h16v4H4z"/>') + '<path d="M4 7h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1z"/><path d="M9 7V5h6v2"/><path d="M8.5 13.5l2 2 4-4"/>',
    tag: A('<path d="M3 12V4h8l9 9-8 8z"/>') + '<path d="M3 12V4h8l9 9-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
    ledger: A('<rect x="4" y="3" width="4" height="18" rx="1"/>') + '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 3v18"/><path d="M11 8h6M11 12h6M11 16h4"/>',
    fire: A('<path d="M12 21c-2.5 0-4-1.8-4-4 0-2 1.5-3 2.5-5 .5 1.5 1.5 2 2 2.5.5-1 1-2.5.5-4 2 1.5 3 3.5 3 6.5 0 2.2-1.5 4-4 4z"/>') + '<path d="M12 21c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-3 3-5 5-5 8 0 4 3 7 7 7z"/>',
    sparkle: A('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>') + '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16v4M17 18h4"/>',
    home: A('<path d="M9.5 20.5v-5.5h5v5.5z"/>') + '<path d="M4 11.5L12 4.5l8 7"/><path d="M6 10.2V20.5h12V10.2"/><path d="M9.5 20.5v-5.5h5v5.5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    'book-open': A('<path d="M12 6.2c-1.6-1.2-4-1.7-7.2-1.2v13.2c3.2-.5 5.6.1 7.2 1.3z"/>') + '<path d="M12 6.2c-1.6-1.2-4-1.7-7.2-1.2v13.2c3.2-.5 5.6.1 7.2 1.3 1.6-1.2 4-1.8 7.2-1.3V5c-3.2-.5-5.6.1-7.2 1.2z"/><path d="M12 6.2v13.3"/>',
    tools: A('<path d="M14.2 4.8a2.3 2.3 0 0 1 2.6 3.4L9.2 15.8a1.6 1.6 0 0 1-2.3-2.3l7.6-7.6a2.3 2.3 0 0 1-.3-1.1z"/>') + '<path d="M14.6 5.2a2.2 2.2 0 0 1 2.2 3.1L8.8 16.3a1.5 1.5 0 1 1-2.1-2.1l8-8a2.2 2.2 0 0 1-.1-1z"/><path d="M6.2 6.2l2.4 2.4M5.2 8.2l8.6 8.6M16.2 16.6l2.2 2.2"/>',
    checklist: A('<rect x="5" y="3.5" width="14" height="17" rx="2"/>') + '<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M8 8.2l1.2 1.2 2.1-2.2M8 13l1.2 1.2 2.1-2.2M13 8.5h4M13 13.2h4"/>',
    'file-text': A('<path d="M14 3.5V8h4.5z"/>') + '<path d="M7 3.5h7l4.5 4.5V20.5H7z"/><path d="M14 3.5V8h4.5M10 12.2h6M10 15.8h4"/>',
    archive: A('<rect x="4" y="4" width="16" height="4.2" rx="1.2"/>') + '<path d="M5 8.2V19.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.2"/><rect x="4" y="4" width="16" height="4.2" rx="1.2"/><path d="M10 12.5h4"/>',
    'calendar-check': A('<rect x="4" y="5.5" width="16" height="14.5" rx="2"/>') + '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8 3.5v3.2M16 3.5v3.2M8.6 15.2l2 2 4.2-4.4"/>',
    wand: A('<path d="M14.2 5.2l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1z"/>') + '<path d="M5 19.2L13.2 11"/><path d="M14.2 5.2l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1z"/><path d="M17.2 14.5v2M16.2 15.5h2M18.2 4.2v1.6"/>',
    send: A('<path d="M5 12.2L19 5.5l-5.2 13.2-2.2-5.6z"/>') + '<path d="M5 12.2L19 5.5l-5.2 13.2-2.2-5.6z"/><path d="M11.6 13.1L19 5.5"/>',
    dashboard: A('<rect x="4" y="4" width="7" height="7" rx="1.4"/>') + '<rect x="4" y="4" width="7" height="7" rx="1.4"/><rect x="13" y="4" width="7" height="4.2" rx="1.4"/><rect x="13" y="10.2" width="7" height="9.8" rx="1.4"/><rect x="4" y="13" width="7" height="7" rx="1.4"/>',
    'chart-line': A('<path d="M5 16.5l3.2-3.6 2.8 2.2 5-5.6"/>') + '<path d="M4.5 5.5v14h15"/><path d="M7 16l3.2-3.6 2.8 2.2L18 8.2"/><path d="M15.2 8.2H18v2.6"/>',
    'clipboard-check': A('<rect x="6.5" y="5" width="11" height="15" rx="1.6"/>') + '<rect x="6.5" y="5" width="11" height="15" rx="1.6"/><path d="M9.2 4.2h5.6v2.4H9.2zM9 13.2l1.8 1.8 3.6-3.8"/>',
    wallet: A('<rect x="3.5" y="7" width="17" height="12" rx="2"/>') + '<rect x="3.5" y="7" width="17" height="12" rx="2"/><path d="M3.5 11h17"/><circle cx="16.2" cy="14.6" r="1.1"/><path d="M7.5 7V5.6h8.2"/>',
    gauge: A('<path d="M5.2 16.8a6.8 6.8 0 1 1 13.6 0"/>') + '<path d="M5.2 16.8a6.8 6.8 0 1 1 13.6 0"/><path d="M12 16.8l3.6-3.4"/><circle cx="12" cy="16.8" r="1.1"/>',
    'bar-chart': A('<path d="M7 19V12.2h0z"/>') + '<path d="M4.5 19.2h15"/><path d="M7 19.2V12M12 19.2V7.5M17 19.2V10.2"/>',
    key: A('<circle cx="8.2" cy="12" r="3.1"/>') + '<circle cx="8.2" cy="12" r="3.1"/><path d="M11.1 12H20M16.6 12v2.6M19.2 12v1.8"/>',
    history: A('<path d="M12 7.5V12l2.4 1.8z"/>') + '<path d="M5.2 12a6.8 6.8 0 1 0 1.8-4.6"/><path d="M5 6.2V9.2H8"/><path d="M12 8v4l2.6 1.8"/>',
    sitemap: A('<rect x="9" y="3.5" width="6" height="4" rx="1"/>') + '<rect x="9" y="3.5" width="6" height="4" rx="1"/><rect x="3.5" y="16.2" width="6" height="4" rx="1"/><rect x="14.5" y="16.2" width="6" height="4" rx="1"/><path d="M12 7.5v3.2M12 10.7H6.5V16.2M12 10.7h5.5V16.2"/>',
  };
  var TONE = {
    lighthouse: 'gold', map: 'cyan', list: 'cyan', target: 'rose', toolbox: 'green', book: 'violet', calendar: 'cyan', user: 'gold', trophy: 'gold',
    code: 'slate', flag: 'gold', island1: 'cyan', island2: 'green', island3: 'violet', chart: 'green', rocket: 'rose', wrench: 'slate', globe: 'cyan',
    coin: 'gold', route: 'violet', fish: 'cyan', bulb: 'gold', users: 'violet', file: 'slate', template: 'violet', ship: 'cyan', compass: 'gold',
    search: 'cyan', build: 'green', star: 'gold', gear: 'slate', download: 'green', lock: 'slate', kit: 'green', tag: 'rose', ledger: 'violet', fire: 'rose',
    sparkle: 'gold', home: 'gold',
    'book-open': 'cyan', tools: 'green', checklist: 'cyan', 'file-text': 'violet', archive: 'green', 'calendar-check': 'cyan',
    wand: 'green', send: 'cyan', dashboard: 'slate', 'chart-line': 'green', 'clipboard-check': 'gold', wallet: 'gold',
    gauge: 'gold', 'bar-chart': 'cyan', key: 'slate', history: 'violet', sitemap: 'cyan',
  };
  function svg(name, cls) {
    var d = P[name] || P.compass;
    return '<svg class="ico ico-' + (P[name] ? name : 'compass') + ' tone-' + (TONE[name] || 'slate') + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + d + '</svg>';
  }
  function badge(name, size) { return '<span class="card-ico' + (size === 'lg' ? ' card-ico-lg' : '') + '">' + svg(name) + '</span>'; }
  /** 空状态插画：小岛 + 灯塔 + 波浪（自带配色，160×110） */
  function illo(kind) {
    var mark = { search: '<circle cx="104" cy="40" r="13" fill="none" stroke="#7dd3fc" stroke-width="4"/><path d="M114 50l10 10" stroke="#7dd3fc" stroke-width="5" stroke-linecap="round"/>',
      list: '<rect x="92" y="24" width="34" height="40" rx="5" fill="#1e293b" stroke="#7dd3fc" stroke-width="3"/><path d="M99 36h20M99 45h20M99 54h12" stroke="#fde68a" stroke-width="3" stroke-linecap="round"/>' }[kind] || '<path d="M108 22l3.5 9 9.5 1-7 6.5 2 9.5-8-4.5-8 4.5 2-9.5-7-6.5 9.5-1z" fill="#fde68a"/>';
    return '<svg class="illo" viewBox="0 0 160 110" width="160" height="110" aria-hidden="true">' +
      '<defs><linearGradient id="illo-sea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#38bdf8" stop-opacity=".55"/><stop offset="1" stop-color="#1e3a8a" stop-opacity=".2"/></linearGradient></defs>' +
      '<ellipse cx="80" cy="92" rx="70" ry="12" fill="url(#illo-sea)"/><path d="M30 88c10-16 24-24 40-24s28 8 36 24z" fill="#334155"/>' +
      '<path d="M52 86l4-38h10l4 38z" fill="#f1f5f9"/><path d="M53.5 72h15M54.6 60h12.8" stroke="#ef4444" stroke-width="5"/><rect x="54" y="40" width="14" height="9" rx="2" fill="#fbbf24"/><path d="M61 34v6" stroke="#f1f5f9" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M20 98c8-5 16-5 24 0s16 5 24 0 16-5 24 0 16 5 24 0 16-5 24 0" fill="none" stroke="#7dd3fc" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>' + mark + '</svg>';
  }
  global.QuestIcons = { svg: svg, badge: badge, illo: illo, names: Object.keys(P), TONE: TONE };
})(typeof window !== 'undefined' ? window : globalThis);
