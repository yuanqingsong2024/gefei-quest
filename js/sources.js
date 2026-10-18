/** Phase 24 · 统一来源组件 QuestSources
 *  sources: [{ title, url, publisher, published, kind, checked }]
 *  kind: official | media | community
 *  Node-safe: kindOf / fromLegacy / hostOf work without DOM. */
(function (global) {
  var KIND_LABEL = { official: '官方', media: '媒体', community: '社区' };
  var COMMUNITY = [
    'reddit.com', 'v2ex.com', 'zhihu.com', 'xiaohongshu.com', 'xhslink.com',
    'nodeseek.com', 'tieba.baidu.com', 'discord.com', 'douban.com',
    'hupu.com', 'nga.cn', 'ngabbs.com', 'tianya.cn',
  ];
  var OFFICIAL = [
    'gov.cn', 'edu.cn', 'ac.cn', 'mil.cn',
    'jd.com', 'jingdong.com', 'taobao.com', 'tmall.com', 'alibaba.com', 'alipay.com', 'aliyun.com',
    '10086.cn', '10010.com', '10015.cn', '12306.cn',
    'bilibili.com', 'hdslb.com',
    'douyin.com', 'toutiao.com', 'ixigua.com', 'jinritemai.com', 'xingtu.cn', 'snssdk.com', 'bytedance.com',
    'kuaishou.com',
    'weixin.qq.com', 'wechat.com', 'channels.weixin.qq.com',
    'om.qq.com', 'write.qq.com', 'ac.qq.com',
    'unionpay.com', '95516.com',
    'google.com', 'youtube.com', 'gstatic.com',
    'amazon.com', 'amazon.co.jp', 'amazon.co.uk',
    'devpost.com',
    'github.com', 'github.io',
    'meta.com', 'facebook.com', 'instagram.com', 'fb.com',
    'twitter.com', 'x.com',
    'tiktok.com',
    'twitch.tv',
    'pinterest.com',
    'medium.com',
    'substack.com',
    'patreon.com',
    'gumroad.com',
    'notion.so', 'notion.com',
    'canva.com',
    'adobe.com',
    'shutterstock.com',
    'redbubble.com',
    'prolific.com',
    'usertesting.com',
    'goofish.com',
    'weibo.com', 'weibo.cn',
    'apple.com',
    'microsoft.com', 'bing.com',
    'cloudflare.com',
    'producthunt.com',
    'baijiahao.baidu.com',
    'mp.weixin.qq.com',
    'mp.toutiao.com', 'baike.toutiao.com',
    'mp.dayu.com',
    'mp.163.com',
    'fanqienovel.com',
    'qimao.com',
    'kuaikanmanhua.com',
    'hongguoduanju.com',
    'ximalaya.com',
    'zsxq.com',
    'xiaoe-tech.com',
    'hellorf.com',
    'vcg.com',
    'coolapk.com',
    'nrta.gov.cn',
    'ad.weixin.qq.com',
  ];
  var MEDIA_HINT = [
    'sina.com.cn', 'sina.cn', 'ifeng.com', 'thepaper.cn', 'eastmoney.com',
    'engadget.com', 'netinfluencer.com', '2i1i.com', 'lmtw.com',
    'inews.qq.com', 'news.qq.com', 'finance.sina', 'caifuhao.eastmoney.com',
    '10000yun.com', 'smzdm.com', 'aibetas.com', 'jxxy.net', 'nicheloom.com',
    'hunted.space', 'runmie.com', '91hym.cn', 'jiujiuxb.com', 'diqile.com',
    'xiuxai.com', 'sxleiyao.com', 'hdu-wiki.cn',
  ];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function hostOf(url) {
    var m = String(url || '').match(/^https?:\/\/([^\/?#]+)/i);
    if (!m) return '';
    return m[1].replace(/^www\./i, '').toLowerCase();
  }
  function matchHost(host, domain) {
    domain = String(domain || '').replace(/^\./, '').toLowerCase();
    host = String(host || '').toLowerCase();
    if (!host || !domain) return false;
    return host === domain || host.endsWith('.' + domain);
  }
  function kindOf(url) {
    var host = hostOf(url);
    if (!host) return 'media';
    var i;
    if (/(^|\.)gov(\.[a-z]+)?$/.test(host) || /\.gov\./.test(host)) return 'official';
    for (i = 0; i < COMMUNITY.length; i++) {
      if (matchHost(host, COMMUNITY[i])) return 'community';
    }
    if (/(^|\.)(bbs|forum)\./.test(host) || /(^|\.)bbs\./.test(host)) return 'community';
    for (i = 0; i < OFFICIAL.length; i++) {
      if (matchHost(host, OFFICIAL[i])) return 'official';
    }
    return 'media';
  }
  function fromLegacy(url, date) {
    return {
      title: '',
      url: String(url || ''),
      publisher: hostOf(url),
      published: '',
      kind: kindOf(url),
      checked: date || '',
    };
  }
  function of(item, date) {
    if (item && Array.isArray(item.sources) && item.sources.length) return item.sources;
    if (item && item.source_url) return [fromLegacy(item.source_url, date || '')];
    if (typeof item === 'string' && item) return [fromLegacy(item, date || '')];
    return [];
  }
  function isHttpUrl(u) {
    return /^https?:\/\/\S+$/i.test(String(u || ''));
  }
  function canonKind(kind, url) {
    if (kind === 'official' || kind === '官方') return 'official';
    if (kind === 'media' || kind === '媒体') return 'media';
    if (kind === 'community' || kind === '社区') return 'community';
    if (KIND_LABEL[kind]) return kind;
    return kindOf(url);
  }
  function kindBadge(kind) {
    var k = KIND_LABEL[kind] ? kind : 'media';
    return '<span class="qs-kind qs-kind-' + k + '">' + KIND_LABEL[k] + '</span>';
  }
  function unverifiedBadge(s) {
    return s && s.unverified ? '<span class="qs-unverified">未核实</span>' : '';
  }
  function isMediaHost(host) {
    var i;
    for (i = 0; i < MEDIA_HINT.length; i++) {
      if (matchHost(host, MEDIA_HINT[i]) || host.indexOf(MEDIA_HINT[i]) >= 0) return true;
    }
    return false;
  }
  function isOwnHost(url, ownHosts) {
    var host = hostOf(url);
    if (!host || isMediaHost(host)) return false;
    var i, h;
    ownHosts = ownHosts || [];
    for (i = 0; i < ownHosts.length; i++) {
      h = String(ownHosts[i] || '').replace(/^www\./i, '').toLowerCase();
      if (h && (host === h || host.endsWith('.' + h) || h.endsWith('.' + host))) return true;
    }
    return false;
  }
  function ownHostsOf(links) {
    var out = [], seen = {};
    (links || []).forEach(function (u) {
      var h = hostOf(typeof u === 'string' ? u : (u && (u.url || u[1])) || '');
      if (!h || isMediaHost(h) || seen[h]) return;
      seen[h] = 1;
      out.push(h);
    });
    return out;
  }
  function normalize(src, date) {
    src = src || {};
    var url = String(src.url || '');
    var out = {
      title: src.title == null ? '' : String(src.title),
      url: url,
      publisher: src.publisher ? String(src.publisher) : hostOf(url),
      published: src.published == null ? '' : String(src.published),
      kind: canonKind(src.kind, url),
      checked: src.checked ? String(src.checked) : (date || ''),
    };
    if (src.unverified === true) out.unverified = true;
    return out;
  }
  function render(sources, opts) {
    opts = opts || {};
    var list = (Array.isArray(sources) ? sources : of(sources, opts.date)).map(function (s) { return normalize(s, opts.date); }).filter(function (s) { return isHttpUrl(s.url); });
    if (!list.length) return '';
    var compact = !!opts.compact;
    var items = list.map(function (s) {
      var pub = s.publisher || hostOf(s.url) || '来源';
      var extra = typeof opts.badge === 'function' ? opts.badge(s) : '';
      if (compact) {
        return '<li class="qs-item">' +
          kindBadge(s.kind) +
          unverifiedBadge(s) +
          '<span class="qs-pub">' + esc(pub) + '</span>' +
          '<a class="qs-link" href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">↗</a>' +
          extra +
          '</li>';
      }
      return '<li class="qs-item">' +
        kindBadge(s.kind) +
        unverifiedBadge(s) +
        '<span class="qs-pub">' + esc(pub) + '</span>' +
        (s.published ? '<time class="qs-published" datetime="' + esc(s.published) + '">' + esc(s.published) + '</time>' : '') +
        (s.title ? '<span class="qs-title">' + esc(s.title) + '</span>' : '') +
        '<a class="qs-link" href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">链接 ↗</a>' +
        extra +
        (!s.unverified && s.checked ? '<span class="qs-checked">核实于 ' + esc(s.checked) + '</span>' : '') +
        '</li>';
    }).join('');
    return '<div class="qs' + (compact ? ' qs-compact' : '') + '">' +
      (compact ? '' : '<div class="qs-label">来源</div>') +
      '<ul class="qs-list">' + items + '</ul></div>';
  }
  function markLink(url, label, date) {
    if (!isHttpUrl(url)) {
      var href = String(url || '');
      if (!href) return esc(label || '');
      return '<a href="' + esc(href) + '">' + esc(label || href) + '</a>';
    }
    var s = fromLegacy(url, date || '');
    s.title = label || '';
    return '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(label || s.publisher) + '</a> ' + kindBadge(s.kind);
  }

  var QuestSources = {
    KIND_LABEL: KIND_LABEL,
    hostOf: hostOf,
    kindOf: kindOf,
    fromLegacy: fromLegacy,
    of: of,
    isHttpUrl: isHttpUrl,
    canonKind: canonKind,
    kindBadge: kindBadge,
    isMediaHost: isMediaHost,
    isOwnHost: isOwnHost,
    ownHostsOf: ownHostsOf,
    normalize: normalize,
    render: render,
    markLink: markLink,
  };
  global.QuestSources = QuestSources;
  if (typeof module !== 'undefined' && module.exports) module.exports = QuestSources;
})(typeof window !== 'undefined' ? window : globalThis);
