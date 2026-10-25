/** Phase 11 · 统一图标家族
 *  规格：24×24 网格 · currentColor · 可选 <g class="ia"> 淡色面
 *  P = ocean 基线（stroke 1.75 · round）。P_ink / P_pixel 只覆盖需要换形状的名字，缺的回退 P。
 *  ILLUST_NAMES：html[data-theme] 为 ink|ocean|pixel 时改用 assets/icons/{theme}/{name}.webp（与 index.html 的 assets/ 相对路径一致）。其它名字仍走 SVG pack。
 *  svg() 读 html[data-theme]。QuestIcons.refresh() 换掉文档里已有的 svg.ico 和 img.ico / img.ico-img。
 *  badge(name)：渐变圆角底 + 图标；色调由 TONE 决定（gold / cyan / green / violet / rose / slate）。 */
(function (global) {
  function A(d) { return '<g class="ia" fill="currentColor" stroke="none" opacity=".15">' + d + '</g>'; }
  function Aink(d) { return '<g class="ia" fill="currentColor" stroke="none" opacity=".28">' + d + '</g>'; }
  function Apx(d) { return '<g class="ia" fill="currentColor" stroke="none" opacity=".34">' + d + '</g>'; }
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
  /* 水墨：笔锋粗细不匀、轮廓略歪。描边单独标 stroke-width（1.6–2.4）。 */
  var P_ink = {
    flag: Aink('<path d="M7.3 5.5c2.4-.8 5 .6 7.4-.2 1.2 1 .2 2.3-.6 3 1.4.7 2.3 1.7 1.2 3.2-2.6.9-5.4-.5-8.2.5z"/>') +
      '<path stroke-width="2.35" d="M6.6 21.3c.25-5.2-.3-10.2.2-16.2"/>' +
      '<path stroke-width="1.85" d="M7.2 5.4c2.5-.9 5.2.7 7.7-.15.8 1.2 0 2.2-.7 2.9 1.5.6 2.4 1.7 1.1 3.2-2.6.8-5.5-.6-8.2.5"/>' +
      '<path stroke-width="1.65" d="M8.3 8.2c1.6.4 2.9-.25 4.4.3"/>',
    map: Aink('<path d="M4.5 7.5c.6-1.6 2.5-2.3 4.1-.8l3.5 1.8c1 .5 2.1.2 3.1-.4l3.3-1.4c.8-.3 1.6.4 1.5 1.3l-.4 10.5c0 .9-.8 1.5-1.6 1.3l-3.6-1.1c-1.1-.4-2.2.1-3.2.8l-3.7 1.5c-.8.3-1.6-.2-1.7-1.1z"/>') +
      '<path stroke-width="1.9" d="M4.4 7.6c.5-1.4 2.3-2.2 3.9-1l3.8 1.9c1 .5 2.2.15 3.2-.45l3.2-1.4c.8-.3 1.6.5 1.5 1.3l-.35 10.3c0 .8-.7 1.4-1.5 1.2l-3.6-1c-1.1-.4-2.3.1-3.2.8l-3.6 1.5c-.7.3-1.5-.2-1.6-1z"/>' +
      '<path stroke-width="1.65" d="M8.7 6.9c.25 3.5-.35 7.1.15 10.5"/>' +
      '<path stroke-width="2.15" d="M14.9 7.7c-.2 3.2.35 6.5-.1 10.1"/>',
    'calendar-check': Aink('<path d="M5.2 7.3c.4-1.3 1.7-1.7 3.1-.1h8.1c1.3-.5 2.7.2 2.9 1.6.2 3.3-.2 6.8.2 10.1-.2 1.1-1.2 1.7-2.4 1.6H7c-1.3.1-2.2-.6-2.1-1.8.1-3.4.2-7 .3-11.4z"/>') +
      '<path stroke-width="1.9" d="M5 7.4c.3-1.1 1.6-1.8 3.2-.4h8.3c1.3-.5 2.7.1 2.9 1.5.2 3.1-.3 6.6.15 9.9-.2 1-1.1 1.6-2.3 1.5H6.8c-1.2.1-2-.6-1.9-1.7.1-3.5-.2-7 .1-10.8z"/>' +
      '<path stroke-width="2.2" d="M4.8 10.5c4.8.3 9.4-.25 14.3.2"/>' +
      '<path stroke-width="2.35" d="M8.1 3.6c.15 1.1-.1 2 .2 2.9"/>' +
      '<path stroke-width="1.7" d="M15.7 3.8c.2 1 .05 1.8.3 2.7"/>' +
      '<path stroke-width="2.4" d="M8.4 14.9c.75.95 1.55 1.75 2.25 2.35 1.55-1.85 3.05-3.45 4.9-5"/>',
    rocket: Aink('<path d="M12.2 3.6c1.9 2.3 2.8 5 2.5 7.8-.3 2.2-1.1 4.2-1.5 6.2-.9.5-2.5.8-3.7.1-.15-2.3-.55-4.5-.3-6.8.4-2.7 1.3-5.3 3-7.3z"/>') +
      '<path stroke-width="2.05" d="M12.1 3.4c2.05 2.45 3.05 5.3 2.7 8.1-.3 2.4-1.25 4.4-1.65 6.4-1.05.6-2.85.7-3.85 0-.1-2.45-.5-4.7-.15-7.1.4-2.85 1.35-5.45 2.95-7.4z"/>' +
      '<path stroke-width="1.7" d="M13.7 8.1c.75.5.6 1.55-.15 1.95-.75.35-1.55-.15-1.65-.95-.1-.75.5-1.35 1.15-1.1"/>' +
      '<path stroke-width="2.25" d="M8.3 13.7c-1.55.95-2.75 2.05-3.15 2.65.95.1 2.15-.75 3.35-1.45"/>' +
      '<path stroke-width="1.8" d="M15.9 13.5c1.45.7 2.65 1.65 3.15 2.05-.85.2-1.95-.65-3.25-1.35"/>' +
      '<path stroke-width="1.65" d="M10.5 18.3c.55 1.25 1.15 2.25 1.6 2.85.55-.75 1.15-1.85 1.35-2.95"/>',
    trophy: Aink('<path d="M8.4 4.7h7.1c.2 2.05-.45 3.85-.85 5.45-.7 1.85-2.15 3.05-3.25 3.15-1.35-.1-2.65-1.45-3.25-3.25-.3-1.55-.45-3.45.25-5.35z"/>') +
      '<path stroke-width="2.3" d="M7.9 4.4c2.7-.4 5.7.3 8.3-.2"/>' +
      '<path stroke-width="1.85" d="M8.3 5.1c-.25 2.15.55 4.05.1 5.9-.65 1.75-2.05 2.95-3.45 3.05 1.45.4 2.85 0 3.85-.25 1.35.35 2.85.55 4.05-.25-1.35-.75-2.35-2.15-2.75-3.75-.25-1.75.35-3.65 0-5.05"/>' +
      '<path stroke-width="1.7" d="M8.4 6.5c-2.25.1-3.25 1.65-2.2 3.25.75.95 1.85.6 2.45-.15"/>' +
      '<path stroke-width="2.15" d="M15.7 6.3c2.35-.2 3.45 1.55 2.35 3.15-.65.95-1.85.75-2.55 0"/>' +
      '<path stroke-width="1.9" d="M11.6 13.7c.25 1.45-.35 2.45.25 3.45"/>' +
      '<path stroke-width="2.4" d="M8.1 20.5c2.3-.55 5.5.25 7.9-.35"/>',
    home: Aink('<path d="M6.5 11.7c.2 2.85-.1 5.65.2 8.4h10.9c.15-2.85-.2-5.65.1-8.5L12.1 6.1z"/>') +
      '<path stroke-width="2.4" d="M3.7 12.5c2.65-2.45 5.45-5.05 8.4-7.3 2.75 2.15 5.55 4.65 8.2 7"/>' +
      '<path stroke-width="1.75" d="M6.3 11.5c.2 3.05.05 6.1-.1 8.9h11.7c-.15-2.9.2-5.9-.25-8.7"/>' +
      '<path stroke-width="2.1" d="M10.3 20.3c.1-1.65-.2-3.15.25-4.7h3.3c.2 1.55-.1 3.05.2 4.7"/>' +
      '<path stroke-width="2.2" d="M16.2 6.1c.2 1.15-.1 2.05.25 2.9"/>',
    'book-open': Aink('<path d="M12 6.6C10.1 5.2 7 4.6 4.3 5.4 4.5 9.2 4.1 13.2 4.9 17.2 7.5 16.3 10.1 16.9 12 18.3 14.2 16.7 16.9 16.2 19.3 17.1 19.7 12.9 19.2 8.9 19.5 5.2 16.7 4.5 13.9 5.1 12 6.6z"/>') +
      '<path stroke-width="1.75" d="M12 6.5C10 5.1 6.9 4.5 4.2 5.3 4.4 9.2 4 13.4 4.8 17.4 7.5 16.5 10.2 17.1 12 18.4"/>' +
      '<path stroke-width="2.15" d="M12 6.4c1.85-1.35 4.9-1.95 7.5-1.1.2 3.85-.25 7.9.15 11.9-2.65-.85-5.25-.4-7.4 1.15"/>' +
      '<path stroke-width="2.3" d="M12.1 6.4c-.2 3.9.25 7.7-.05 12"/>' +
      '<path stroke-width="1.6" d="M6.5 9.3c1.55.3 2.85-.2 4.1.35M14.2 9.1c1.45-.25 2.75.35 3.9.1"/>',
    tools: Aink('<path d="M15.2 4.7c1.55.35 2.55 1.65 2.2 3.15-.35 1.15-1.35 1.65-1.85 2.7L8.1 17.5c-.75.75-1.95.65-2.55-.25-.65-.95-.25-2.15.7-2.75l7.5-7.3c.55-.6.85-1.55.65-2.25z"/>') +
      '<path stroke-width="2.25" d="M15.4 4.5c1.65.45 2.65 1.85 2.2 3.4-.4 1.25-1.45 1.75-2.05 2.9L8 17.7c-.85.85-2.15.75-2.75-.35-.75-1.05-.15-2.3.75-2.9l7.7-7.5c.65-.65 1.05-1.7.75-2.5"/>' +
      '<path stroke-width="1.65" d="M16.7 5.4c.95.75.7 1.75-.25 2.25"/>' +
      '<path stroke-width="2.1" d="M5.1 6.3c1.15 1.15 2.25 2.15 3.4 3.3"/>' +
      '<path stroke-width="1.7" d="M15.1 16.5c.85.85 1.75 1.65 2.7 2.25"/>',
    coin: Aink('<path d="M12 3.4c4.5.35 7.9 3.55 8.1 8 .2 4.65-3.25 8.4-7.9 8.7-4.55.25-8.3-3.25-8.5-7.8C3.5 7.3 7.2 3.2 12 3.4z"/>') +
      '<path stroke-width="2.2" d="M12.2 3.5c4.15.45 7.5 3.55 7.7 7.85.25 4.5-3.15 8.15-7.7 8.45-4.4.3-8.15-3.15-8.35-7.55-.3-4.6 3.25-8.35 8.35-8.75z"/>' +
      '<path stroke-width="1.65" d="M12 6.3c2.9.25 5 2.3 5.15 5.25.2 3.1-2.15 5.45-5.2 5.65-2.9.15-5.35-2.1-5.45-4.95-.2-3.1 2.25-5.65 5.5-5.95"/>' +
      '<path stroke-width="2.35" d="M14.8 9c-.45-1.15-1.75-1.75-3.15-1.45-1.55.35-2.45 1.35-2.2 2.5.3 1.15 1.75 1.65 3.25 2.05 1.55.45 2.65 1.15 2.4 2.4-.35 1.25-1.75 1.85-3.25 1.6"/>' +
      '<path stroke-width="1.7" d="M12.1 5.8c.1 1.05-.05 1.45.1 2.15M11.9 16c.15.95 0 1.45.2 2.15"/>',
  };
  /* 像素：只有水平、垂直和 45° 台阶，方角由 svg 根上的 square/miter 决定。 */
  var P_pixel = {
    flag: Apx('<path d="M7 4h9v2H14v2h2v2H7z"/>') +
      '<path d="M6 3v18"/>' +
      '<path d="M6 4h11v2H14v2h3v2H6"/>',
    map: Apx('<path d="M4 6h6V4h6v2h4v12h-6v2h-4v-2H4z"/>') +
      '<path d="M4 6h6V4h6v2h4v12h-6v2h-4v-2H4z"/>' +
      '<path d="M10 4v14"/>' +
      '<path d="M16 6v14"/>',
    'calendar-check': Apx('<path d="M4 6h16v13H4z"/>') +
      '<path d="M4 5h16v15H4z"/>' +
      '<path d="M4 9h16"/>' +
      '<path d="M8 3v4"/>' +
      '<path d="M16 3v4"/>' +
      '<path d="M8 14h2v2h2v-2h2v-2h2v-2"/>',
    rocket: Apx('<path d="M8 7h8v9H8z"/>') +
      '<path d="M12 3l4 4H8z"/>' +
      '<path d="M12 3l4 4v9H8V7z"/>' +
      '<path d="M8 11H5v4h3"/>' +
      '<path d="M16 11h3v4h-3"/>' +
      '<path d="M11 8h2v2h-2z"/>' +
      '<path d="M11 16h2v2h2v2H9v-2h2z"/>',
    trophy: Apx('<path d="M8 4h8v3h2v3h-2v2h-2l-2 2h-4l-2-2H8V10H6V7h2z"/>') +
      '<path d="M8 4h8v3h2v3h-2v2h-2l-2 2h-4l-2-2H8V10H6V7h2z"/>' +
      '<path d="M8 6H5v3h3"/>' +
      '<path d="M16 6h3v3h-3"/>' +
      '<path d="M11 14h2v4"/>' +
      '<path d="M7 18h10v2H7z"/>',
    home: Apx('<path d="M7 12h10v8H7z"/>') +
      '<path d="M12 4L4 12h16z"/>' +
      '<path d="M12 4L20 12v8H4V12z"/>' +
      '<path d="M10 14h4v6h-4z"/>' +
      '<path d="M15 6h3v3h-3z"/>',
    'book-open': Apx('<path d="M3 6h8v12H3z"/>') +
      '<path d="M13 6h8v12H13z"/>' +
      '<path d="M3 6h8v12H3z"/>' +
      '<path d="M13 6h8v12H13z"/>' +
      '<path d="M11 5h2v14h-2z"/>' +
      '<path d="M5 9h5M5 12h5M14 9h5M14 12h4"/>',
    tools: Apx('<path d="M14 4h4v2h2v2h-2v2h-2V8h-2V6h-2V4h2z"/>') +
      '<path d="M13 4h5v2h2v3h-2V7h-2v2h-2V7h-2V5h1z"/>' +
      '<path d="M14 9L8 15"/>' +
      '<path d="M5 14h5v4H5z"/>' +
      '<path d="M4 5h2v2h2v2"/>' +
      '<path d="M16 17h2v2h2"/>',
    coin: Apx('<path d="M8 4h8l4 4v8l-4 4H8l-4-4V8z"/>') +
      '<path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z"/>' +
      '<path d="M9 7h6l3 3v4l-3 3H9l-3-3v-4z"/>' +
      '<path d="M15 8H10v3h5v2H10v3h5"/>' +
      '<path d="M12 6v2M12 16v2"/>',
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
  var STROKE = {
    ocean: ' fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"',
    ink: ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"',
    pixel: ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"'
  };
  var ILLUST_NAMES = ['flag', 'map', 'calendar-check', 'rocket', 'trophy', 'home', 'book-open', 'tools', 'coin'];
  var ILLUST = {};
  var ILLUST_THEMES = { ink: 1, ocean: 1, pixel: 1 };
  var illustI;
  for (illustI = 0; illustI < ILLUST_NAMES.length; illustI++) ILLUST[ILLUST_NAMES[illustI]] = 1;
  function isIllust(name) { return !!ILLUST[name]; }
  function currentTheme() {
    try {
      var doc = global.document;
      var root = doc && doc.documentElement;
      return (root && root.getAttribute('data-theme')) || '';
    } catch (e0) { return ''; }
  }
  function packFor(name) {
    var theme = currentTheme();
    if (theme === 'ink' && P_ink[name]) return 'ink';
    if (theme === 'pixel' && P_pixel[name]) return 'pixel';
    return 'ocean';
  }
  function svg(name, cls) {
    var extra = cls ? ' ' + cls : '';
    var theme = currentTheme();
    if (ILLUST_THEMES[theme] && ILLUST[name]) {
      return '<img class="ico ico-img ico-' + name + ' ico-pack-' + theme + ' tone-' + (TONE[name] || 'slate') + extra + '" src="assets/icons/' + theme + '/' + name + '.webp" width="24" height="24" alt="" aria-hidden="true" draggable="false">';
    }
    var known = !!P[name];
    var resolved = known ? name : 'compass';
    var pack = packFor(resolved);
    var body = pack === 'ink' ? P_ink[resolved] : (pack === 'pixel' ? P_pixel[resolved] : (P[resolved] || P.compass));
    return '<svg class="ico ico-' + resolved + ' ico-pack-' + pack + ' tone-' + (TONE[name] || 'slate') + extra + '" viewBox="0 0 24 24" width="24" height="24"' + STROKE[pack] + ' aria-hidden="true" focusable="false">' + body + '</svg>';
  }
  var PACK_CLASS = { 'ico-pack-ink': 1, 'ico-pack-ocean': 1, 'ico-pack-pixel': 1 };
  function refresh(root) {
    var doc = global.document;
    var scope = root || doc;
    if (!scope || !scope.querySelectorAll) return;
    var found = scope.querySelectorAll('svg.ico, img.ico, img.ico-img');
    var nodes = [];
    var i, el, classes, n, c, name, keep, html;
    for (i = 0; i < found.length; i++) nodes.push(found[i]);
    for (i = 0; i < nodes.length; i++) {
      el = nodes[i];
      classes = String(el.getAttribute('class') || '').split(/\s+/);
      name = '';
      keep = [];
      for (n = 0; n < classes.length; n++) {
        c = classes[n];
        if (!c || c === 'ico' || c === 'ico-img' || PACK_CLASS[c] || c.indexOf('tone-') === 0) continue;
        if (c.indexOf('ico-') === 0 && (P[c.slice(4)] || ILLUST[c.slice(4)])) { name = c.slice(4); continue; }
        keep.push(c);
      }
      if (!name) continue;
      html = svg(name, keep.join(' '));
      el.outerHTML = html;
    }
  }
  function badge(name, size) { return '<span class="card-ico' + (size === 'lg' ? ' card-ico-lg' : '') + '">' + svg(name) + '</span>'; }
  /** 空状态插画：小岛 + 灯塔 + 波浪（自带配色，160×110） */
  function illo(kind) {
    var mark = { search: '<circle cx="104" cy="40" r="13" fill="none" stroke="#7dd3fc" stroke-width="4"/><path d="M114 50l10 10" stroke="#7dd3fc" stroke-width="5" stroke-linecap="round"/>',
      list: '<rect x="92" y="24" width="34" height="40" rx="5" fill="#f4f1ea" stroke="#0f766e" stroke-width="3"/><path d="M99 36h20M99 45h20M99 54h12" stroke="#1e3a5f" stroke-width="3" stroke-linecap="round"/>' }[kind] || '<path d="M108 22l3.5 9 9.5 1-7 6.5 2 9.5-8-4.5-8 4.5 2-9.5-7-6.5 9.5-1z" fill="#1e3a5f"/>';
    return '<svg class="illo" viewBox="0 0 160 110" width="160" height="110" aria-hidden="true">' +
      '<defs><linearGradient id="illo-sea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#38bdf8" stop-opacity=".55"/><stop offset="1" stop-color="#1e3a8a" stop-opacity=".2"/></linearGradient></defs>' +
      '<ellipse cx="80" cy="92" rx="70" ry="12" fill="url(#illo-sea)"/><path d="M30 88c10-16 24-24 40-24s28 8 36 24z" fill="#e7e5e4"/>' +
      '<path d="M52 86l4-38h10l4 38z" fill="#f1f5f9"/><path d="M53.5 72h15M54.6 60h12.8" stroke="#ef4444" stroke-width="5"/><rect x="54" y="40" width="14" height="9" rx="2" fill="#fbbf24"/><path d="M61 34v6" stroke="#f1f5f9" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M20 98c8-5 16-5 24 0s16 5 24 0 16-5 24 0 16 5 24 0 16-5 24 0" fill="none" stroke="#7dd3fc" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>' + mark + '</svg>';
  }
  global.QuestIcons = { svg: svg, badge: badge, illo: illo, refresh: refresh, names: Object.keys(P), TONE: TONE, isIllust: isIllust, ILLUST_NAMES: ILLUST_NAMES };
})(typeof window !== 'undefined' ? window : globalThis);
