/** 统一线性 SVG 图标集 · 24 视框 · stroke 1.75 · round caps · currentColor */
(function (global) {
  var P = {
    lighthouse: '<path d="M10 21l1-12h2l1 12"/><path d="M9 9h6"/><path d="M10.5 9l.5-4h2l.5 4"/><path d="M12 3v2"/><path d="M4 7l4 1M20 7l-4 1"/><path d="M6 21h12"/>',
    map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    toolbox: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M3 13h18M10 13v2h4v-2"/>',
    book: '<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 19V5M8 7h7M8 11h5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="M8 14h3v3H8z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 01-8 0z"/><path d="M8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4"/><path d="M12 13v4M8 21h8M9 17h6"/>',
    code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
    island1: '<path d="M3 18c3-2 6-2 9 0s6 2 9 0"/><path d="M7 15c1-3 3-4 5-4s4 1 5 4"/><path d="M12 11V5l4 2-4 2"/>',
    island2: '<path d="M3 19c3-2 6-2 9 0s6 2 9 0"/><path d="M5 16c1-2 2-3 4-3s3 1 4 3M11 16c1-3 3-5 5-5s3 2 4 5"/><path d="M16 11V6"/>',
    island3: '<path d="M3 19c3-2 6-2 9 0s6 2 9 0"/><path d="M3 16c.7-1.5 1.5-2 2.5-2s1.8.5 2.5 2M9 16c1-2 2-3 3-3s2 1 3 3M16 16c.7-1.5 1.5-2 2.5-2s1.8.5 2.5 2"/><path d="M6 14v-3M12 13V8M18.5 14v-3"/>',
    chart: '<path d="M4 20V4M4 20h16"/><path d="M7 15l4-4 3 3 5-6"/><path d="M15 8h4v4"/>',
    rocket: '<path d="M12 15c4-3 6-7 6-12-5 0-9 2-12 6z"/><path d="M9 12l-4 1 2-4M12 15l-1 4 4-2"/><circle cx="14" cy="8" r="1.5"/><path d="M6 18l-2 2"/>',
    wrench: '<path d="M14 6a4 4 0 005 5l-8 8a2 2 0 01-3-3l8-8a4 4 0 01-2-2z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2"/>',
    route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3 3 0 000-6H9a3 3 0 010-6h7"/>',
    fish: '<path d="M3 12c3-4 7-6 11-6 3 0 5 2 7 6-2 4-4 6-7 6-4 0-8-2-11-6z"/><path d="M3 12l-1-3M3 12l-1 3"/><circle cx="16" cy="11" r="1"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 00-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0012 3z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14a6 6 0 013.5 6"/>',
    file: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
    template: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
    ship: '<path d="M3 16l2 4h14l2-4z"/><path d="M12 3v13M12 4l6 9h-6M12 6l-5 7h5"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>',
    build: '<path d="M4 21V10l8-6 8 6v11z"/><path d="M9 21v-6h6v6"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v6H4V6h6"/>',
    kit: '<path d="M4 7h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1z"/><path d="M9 7V5h6v2"/><path d="M8 12l2 2 4-4"/>',
    tag: '<path d="M3 12V4h8l9 9-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
    ledger: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 3v18"/><path d="M11 8h6M11 12h6M11 16h4"/>',
    fire: '<path d="M12 21c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-3 3-5 5-5 8 0 4 3 7 7 7z"/>',
  };
  function svg(name, cls) {
    var d = P[name] || P.compass;
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + d + '</svg>';
  }
  global.QuestIcons = { svg: svg, names: Object.keys(P) };
})(typeof window !== 'undefined' ? window : globalThis);
