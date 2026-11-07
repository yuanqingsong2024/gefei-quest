/** OPC 一人公司 · #war-rank-opc
 *  常青块：政策摘要 / 可做业务 / 接活渠道 / 风险红线（公开整理，非法律税务意见）
 *  周报：js/opc-data.js 内嵌兜底 → fetch data/opc-briefs/latest.json
 *  latest 可以是条目数组，或 { updated, items }。不承诺收益，不写灰产。 */
(function (global) {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function safeUrl(u) {
    var s = String(u || '').trim();
    return /^https?:\/\//i.test(s) ? s : '';
  }
  function ext(href, label) {
    var u = safeUrl(href);
    if (!u) return '';
    return '<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + esc(label) + '</a>';
  }
  var TYPES = ['政策', '税务', '登记实务', '接活渠道', '合规案例', '工具'];
  var RISK = {
    info: { cls: 'opc-risk-info', label: '提示' },
    watch: { cls: 'opc-risk-watch', label: '留意' },
    critical: { cls: 'opc-risk-critical', label: '红线' },
  };
  var view = { type: 'all' };
  var cache = null;
  var fetching = false;

  var GOV_CO = 'https://www.gov.cn/yaowen/liebiao/202312/content_6923395.htm';
  var SAMR_CO = 'https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/fgs/art/2023/art_067c072db6ef4679a2e0180996be4cf8.html';
  var SZ_OPC = 'https://amr.sz.gov.cn/zcjzts/ssdj/content/post_11458245.html';
  var QZ_FAQ = 'https://scjgj.quanzhou.gov.cn/xxgk/hygq/202410/t20241017_3091815.htm';
  var HY_FAQ = 'https://www.hengyang.gov.cn/amr/xxgk/zcwjjjd/20240715/i3415577.html';
  var OLD_RULE = 'https://www.samr.gov.cn/djzcj/zcfg/qt/art/2023/art_70e46c8e986047a0aef313015586db7a.html';
  var SOLE_PROP = 'https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/fgs/art/2023/art_519614134f3c4afa9d7cd373b5491fdb.html';
  var CIT = 'https://www.gov.cn/gongbao/content/2007/content_609907.htm';
  var ANNUAL = 'https://www.samr.gov.cn/zt/ndzt/2025n/sqxzjcgs/jcbz/art/2025/art_671ac865c7a9410e832c3b95a1c786f7.html';
  var GSXT = 'http://www.gsxt.gov.cn/';
  var CQ_ANNUAL = 'http://scjgj.cq.gov.cn/zz/bnq/zwgk/gsgg_146794/202508/t20250815_14905812.html';
  var TAX_STD = 'https://www.chinatax.gov.cn/chinatax/n810356/n3255681/c5235450/content.html';
  var VAT = 'https://www.gov.cn/yaowen/liebiao/202412/content_6994557.htm';
  var VAT_REG = 'https://www.chinatax.gov.cn/chinatax/n810214/n810641/c102061/c102062/c3022137/content.html';
  var SME = 'https://www.gov.cn/zhengce/zhengceku/202308/content_6896379.htm';
  var PEOPLE = 'http://finance.people.com.cn/n1/2026/0911/c1004-40796960.html';
  var SCOPE = 'https://www.samr.gov.cn/fgs/zcfg/art/2023/art_3ff2b35134344671ae84c6db93c5b960.html';
  var FAKE_INV = 'https://zhejiang.chinatax.gov.cn/art/2024/5/17/art_24107_615514.html';
  var SAFE = 'https://www.safe.gov.cn/safe/2024/0407/24204.html';
  var MOFCOM = 'https://www.mofcom.gov.cn/zcfb/zgdwjjmywg/art/2020/art_0dd36157a03f494db7571002c7f785b8.html';
  var MCA_OPC = 'https://www.mca.gov.in/content/mca/global/en/help-faq/faqs/company-services/incorporation/one-person-company.html';

  var POLICY = [
    {
      title: '中国说的是一人有限公司',
      body: '口语里的「一人公司 / OPC」，在中国法上是只有一个股东的有限责任公司，是独立企业法人。印度 One Person Company 的成员资格、一人通常只能持一家等规则不能套到中国。',
      links: [[GOV_CO, '公司法全文（中国政府网）'], [MCA_OPC, '印度 MCA：OPC FAQ（仅供对照）']],
    },
    {
      title: '有限责任要自己守住财产独立',
      body: '股东原则上以认缴出资为限。只有一个股东的公司，股东不能证明公司财产独立于自己的财产的，应当对公司债务承担连带责任（《公司法》第 23 条第 3 款）。个人卡收公款、公账付私费、长期无凭证往来，是最常见的混同样子。',
      links: [[GOV_CO, '公司法全文'], [PEOPLE, '人民网：一人公司资产不是私产']],
    },
    {
      title: '和个体户、个人独资差在哪',
      body: '个体户、个人独资企业都不是法人，投资人通常以个人或家庭财产承担无限责任。一人有限公司是法人，账簿、公示和公私隔离的成本更高。税负没有统一答案，取决于利润、是否分红、能否用上小微或小规模优惠。业务很轻时有人会先用个体户；需要对公合同、专票或有限责任隔离时，有人会倾向一人有限公司。这是公开材料里的对照，不是替你做选择。',
      links: [[SOLE_PROP, '个人独资企业法（市监总局）'], [CIT, '企业所得税法（公报文本）']],
    },
    {
      title: '设立、认缴，以及能设几家',
      body: '通常要有一个股东、章程、名称和住所，以及符合要求的组织机构。小规模公司可不设董事会，设一名董事；经全体股东一致同意可不设监事。须经批准的项目应先拿许可。法定代表人按章程，由代表公司执行事务的董事或经理担任。注册资本自成立之日起五年内缴足（法律另有规定的除外）；公司不能清偿到期债务时，债权人可以要求未届期股东提前缴纳。认缴额写得过高，会在债务加速、授信和保证金场景里放大压力。新法之后，一个自然人可以投资设立多个一人公司，一人公司也可以再投资设立一人公司。部分旧登记页仍写「一个自然人只能设一个」，可能没随 2024-07-01 的新法更新，以新法文和当地市监解读为准。',
      links: [[SAMR_CO, '公司法（市监公开文本）'], [SZ_OPC, '深圳市监：限制取消'], [QZ_FAQ, '泉州市监问答'], [HY_FAQ, '衡阳市监解读'], [OLD_RULE, '旧设立条件汇编（可能过时）']],
    },
    {
      title: '年报和公示',
      body: '每年 1 月 1 日至 6 月 30 日，通过国家企业信用信息公示系统报送上一年度年报。当年设立的，自下一年起报送。出资、股权变更等即时信息，应自形成之日起 20 个工作日内公示。未按期年报，可能被列入经营异常名录。',
      links: [[ANNUAL, '企业信息公示暂行条例'], [GSXT, '国家企业信用信息公示系统'], [CQ_ANNUAL, '重庆年报指引（示例）']],
    },
    {
      title: '增值税身份，和小微企业所得税',
      body: '年应征增值税销售额 500 万元及以下，现行口径下一般为小规模纳税人，通常按征收率简易计税；超过标准原则上登记一般纳税人，销项减进项。登记为一般纳税人后，原则上不得转回小规模（另有规定除外）。专票以主管税务机关现行操作为准。财政部 税务总局公告 2023 年第 12 号：小型微利企业减按 25% 计算应纳税所得额，按 20% 税率缴纳企业所得税，延续至 2027-12-31。条件包括非限制禁止行业，且年应纳税所得额不超过 300 万元、从业人数不超过 300 人、资产总额不超过 5000 万元。同一公告里的个体户个税减半，不会自动套到一人公司。',
      links: [[TAX_STD, '税务总局：一般纳税人标准答复'], [VAT, '增值税法全文'], [VAT_REG, '一般纳税人登记管理办法'], [SME, '财税 2023 年第 12 号']],
    },
    {
      title: '给自己发钱，以及账户分开',
      body: '两条常见正规路径：一是签劳动合同，由公司账户发工资，代扣工资薪金个税，并依法参加社会保险（《公司法》第 16 条要求公司依法与职工签合同、参加社保）；二是公司先缴企业所得税，再按弥补亏损、提取法定公积金等规则分红，自然人股东的股息红利通常再缴 20%。不做工资、不做分红，长期公转私挂在「其他应收款」，或用个人微信、银行卡收公司货款，容易补税，也更难证明财产独立。公司资金不得以个人名义开立账户存储。年度财务会计报告应依法编制，并依法经会计师事务所审计（第 208 条）；小微、一人公司实务上怎么执行仍有讨论。只有股东一人时，各地对「要不要缴社保、按什么身份缴」口径不一。这些都要问当地社保、主管税务机关和会计师，不要只听代账口头承诺。服务出口能否零税率或免税，须单独核对现行文件，本页不展开操作。',
      links: [[PEOPLE, '人民网：工资、分红与公私混同'], [GOV_CO, '公司法全文']],
    },
  ];

  var BIZ = [
    { title: '软件开发 / 技术服务 / SaaS', body: '开发费、技术服务费。合同写清交付物和知识产权归属。', tags: ['适配出海', '国内定制'] },
    { title: '设计 / UI / 品牌视觉', body: '设计服务。交付物版权用书面约定，不卖别人的模板冒充原创。', tags: ['适配闲鱼原创', '适配出海'] },
    { title: '管理 / 营销 / SEO / 内容咨询', body: '咨询服务。不夸大效果。广告代理可能另要资质。', tags: ['适配出海'] },
    { title: '课程 / 电子书 / 原创 SOP', body: '卖自己写的内容。看清平台分成和发票抬头。', tags: ['适配闲鱼原创'] },
    { title: '英文出海小站', body: '联盟、广告、数字工具站的收入，入账主体要和站点主体一致，跨境收款走合规通道。', tags: ['适配出海'] },
    { title: '跨境数字服务', body: '开发、设计、写作、顾问。合同主体和收款主体一致。零税率或免税要单独核实。', tags: ['适配出海'] },
    { title: '建站维护 / 翻译本地化', body: '信息技术服务或翻译服务。代采域名、服务器时分开列示。', tags: ['适配出海'] },
    { title: '先有许可再做的几类', body: '经营范围写进去，不等于已经获准。人力资源服务、经营性互联网信息服务、食品经营、专利商标代理等，没有相应许可就不要做。数据分析只使用合法来源，不抓、不卖未授权的个人信息。', tags: ['需许可'], links: [[SCOPE, '企业经营范围登记管理规定']] },
  ];

  var CN_CHANNELS = [
    { title: '猪八戒等威客', body: '企业店，先接小单积累评价。平台托管后到对公。合同写清交付物、修改次数、验收和知识产权。' },
    { title: '电鸭等远程社区', body: '发服务帖或回招聘帖，写明可开发票、可对公。里程碑和违约责任写进合同。' },
    { title: '即刻 / 垂类社群', body: '靠案例和方法，不刷屏硬广。小额定金进对公。口头约定补一页服务协议。' },
    { title: '闲鱼「服务 / 虚拟资料」', body: '只卖自己原创的 SOP、模板或咨询时长，遵守平台规则。标明不含代实名、不含账号。大额转到对公。' },
    { title: '老客户转介', body: '季度更新可接清单。转介费入账并写进合同，不走账外。' },
    { title: '公开招标线索', body: '按技术开发、信息化、官网等关键词筛，经营范围要和标的匹配，对公签约。' },
    { title: '自有小站 + 表单', body: '内容获客后邮件跟进。报价单加工作说明书。收款走对公或合规支付通道。' },
  ];

  var OS_CHANNELS = [
    { title: 'Upwork', body: '按平台规则用企业主体入驻（若支持），先做小单。固定价写清里程碑。提现到企业账户，按平台和银行要求办。' },
    { title: 'Fiverr', body: '把服务做成边界清楚的 Gig。加购项单列，避免范围蔓延。' },
    { title: '合规冷邮件', body: '只用合法取得的商务邮箱，真实身份，提供退订，主题不误导。联系欧盟对象时尊重 GDPR。本页不提供规避办法。谈成后另发报价和发票。' },
    { title: '目录站 / Newsletter 自荐', body: '产品完成后再提交。站点要有隐私政策和退款政策。收款用持牌通道，再按国内结汇要求处理。' },
  ];

  var REDLINES = [
    '公私财产混同。不能证明财产独立时，股东对公司债务承担连带责任。',
    '滥用法人独立地位逃债，或用多家公司转移资产。可能被要求连带。',
    '虚开发票，包括为走账、刷流水而虚开。有行政责任，严重时可能刑事。',
    '隐匿收入，或用个人账户收公司货款却不申报。可能补税、滞纳金和罚款。',
    '无资质从业。写进经营范围，不等于已经拿到许可。',
    '抽逃出资，或用虚假材料骗取登记。',
    '不年报，或公示虚假信息。可能进经营异常名录，严重时有吊销风险。',
    '代实名、买卖账号、刷单炒信、侵权内容站、赌博或色情引流。不做，不写教程，不接单。',
  ];

  function pageBanner() {
    var T = global.QuestTheme;
    if (!T) return '';
    var art = 'rank-banner';
    return '<figure class="page-banner page-banner-opc" data-reveal><img data-art="' + art + '" src="' + T.art(art) + '" width="1280" height="720" loading="lazy" decoding="async" alt="' + T.artAlt(art) + '" />' +
      '<figcaption><span class="page-banner-k">OPC 一人公司</span><b>政策、业务、渠道，先核对再动手</b><small>每周约 3 次情报 · 公开整理 · 不承诺收益</small></figcaption></figure>';
  }
  function disclaimer() {
    return '<div class="rank-disclaimer" role="note"><b>免责声明</b>：本页整理公开的政策与渠道信息，' +
      '<b>不构成法律、税务或投资建议，也不承诺任何收益</b>。登记、税务和社保细则各地不同，以当地登记机关、主管税务机关、社保经办机构当场口径为准。' +
      '不收录灰产、代实名、账号转卖、刷单、逃税或规避外汇监管的做法。</div>';
  }
  function linksHtml(pairs) {
    var html = (pairs || []).map(function (p) { return ext(p[0], p[1]); }).filter(Boolean).join('');
    return html ? '<div class="opc-links">' + html + '</div>' : '';
  }
  function tagsHtml(tags) {
    var html = (tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).filter(Boolean).join('');
    return html ? '<div class="opc-tags">' + html + '</div>' : '';
  }
  function card(it) {
    return '<article class="opc-card glass">' +
      '<h3>' + esc(it.title) + '</h3>' +
      '<p>' + esc(it.body) + '</p>' +
      tagsHtml(it.tags) +
      linksHtml(it.links) +
      '</article>';
  }
  function channelCard(it) {
    return '<article class="opc-card glass"><h3>' + esc(it.title) + '</h3><p>' + esc(it.body) + '</p></article>';
  }
  function typeClass(t) {
    return 'opc-type-' + String(t || '').replace(/[^\w\u4e00-\u9fa5]+/g, '-');
  }
  function typesIn(items) {
    var present = {}, i, t, out = [];
    items.forEach(function (it) { if (it && it.type) present[it.type] = (present[it.type] || 0) + 1; });
    for (i = 0; i < TYPES.length; i++) {
      t = TYPES[i];
      if (present[t]) { out.push(t); delete present[t]; }
    }
    Object.keys(present).forEach(function (k) { out.push(k); });
    return out;
  }
  function riskPill(level) {
    if (!level) return '';
    var meta = RISK[level] || { cls: 'opc-risk-watch', label: String(level) };
    return '<span class="pill opc-risk ' + meta.cls + '">' + esc(meta.label) + '</span>';
  }
  function briefCard(it) {
    var src = safeUrl(it.source_url);
    var meta = [it.date ? esc(it.date) : '', it.region ? esc(it.region) : ''].filter(Boolean).join(' · ');
    return '<article class="opc-card glass ' + typeClass(it.type) + '">' +
      '<div class="opc-meta">' +
      (it.type ? '<span class="pill" data-type="' + esc(it.type) + '">' + esc(it.type) + '</span>' : '') +
      riskPill(it.risk_level) +
      (meta ? '<span class="opc-when">' + meta + '</span>' : '') +
      '</div>' +
      '<h3>' + esc(it.title || '未命名') + '</h3>' +
      (it.summary ? '<p>' + esc(it.summary) + '</p>' : '') +
      (it.action ? '<p class="opc-action"><b>建议核对</b> ' + esc(it.action) + '</p>' : '') +
      tagsHtml((it.tags || []).map(function (t) { return '#' + t; })) +
      (src ? '<div class="opc-links">' + ext(src, '查看来源') + '</div>' : '<p class="opc-when">这条没有可打开的来源链接</p>') +
      '</article>';
  }
  function archiveHtml(pack) {
    var items = (pack && pack.items) || [];
    var illo = global.QuestIcons ? global.QuestIcons.illo('list') : '';
    if (!items.length) {
      return '<div class="empty-illo">' + illo +
        '<p><b>还没有周报条目</b><br>采集写入 data/opc-briefs/latest.json 后会出现在这里。可先看上面的政策摘要和风险红线。</p></div>';
    }
    var types = typesIn(items);
    var list = items.filter(function (it) { return view.type === 'all' || it.type === view.type; });
    var chips = '<div class="chip-row" role="group" aria-label="按类型筛选">' +
      '<button type="button" class="chip' + (view.type === 'all' ? ' active' : '') + '" data-opctype="all" aria-pressed="' + (view.type === 'all') + '">全部 ' + items.length + '</button>' +
      types.map(function (t) {
        var n = items.filter(function (it) { return it.type === t; }).length;
        var on = view.type === t;
        return '<button type="button" class="chip ' + typeClass(t) + (on ? ' active' : '') + '" data-opctype="' + esc(t) + '" aria-pressed="' + on + '">' + esc(t) + ' ' + n + '</button>';
      }).join('') +
      '</div>';
    var head = '<p class="hint" id="opc-count">' + (pack.updated ? '更新 ' + esc(pack.updated) + ' · ' : '') + '显示 ' + list.length + ' / ' + items.length + ' 条</p>';
    var body = list.length
      ? '<div class="opc-grid">' + list.map(briefCard).join('') + '</div>'
      : '<div class="empty-illo">' + illo + '<p><b>这个类型还没有条目</b><br>切回「全部」看看。</p></div>';
    return chips + head + body;
  }
  function evergreen() {
    return '<nav class="chip-row opc-jump" aria-label="页内章节">' +
      '<button type="button" class="chip" data-opc-jump="opc-policy">政策摘要</button>' +
      '<button type="button" class="chip" data-opc-jump="opc-biz">可做业务</button>' +
      '<button type="button" class="chip" data-opc-jump="opc-channels">接活渠道</button>' +
      '<button type="button" class="chip" data-opc-jump="opc-red">风险红线</button>' +
      '<button type="button" class="chip" data-opc-jump="opc-archive">周报归档</button>' +
      '</nav>' +
      '<section id="opc-policy" class="opc-sec">' +
      '<h2>政策摘要</h2>' +
      '<p class="hint">条文和官网的短摘要，不是办理指南。各地材料、住所、社保以当场口径为准。</p>' +
      '<div class="opc-grid">' + POLICY.map(card).join('') + '</div></section>' +
      '<section id="opc-biz" class="opc-sec">' +
      '<h2>可做业务</h2>' +
      '<p class="hint">常见、合法的方向，不承诺能赚到钱。灰产、代实名、账号转卖、刷单、假票不在此列。</p>' +
      '<div class="opc-grid">' + BIZ.map(card).join('') + '</div></section>' +
      '<section id="opc-channels" class="opc-sec">' +
      '<h2>接活渠道</h2>' +
      '<p class="hint">门槛、收款和合同只写到能开工核对的程度。成交与否、费率以平台当时规则为准。</p>' +
      '<div class="opc-cols">' +
      '<div><h3 class="opc-kicker">国内</h3><div class="opc-stack">' + CN_CHANNELS.map(channelCard).join('') + '</div></div>' +
      '<div><h3 class="opc-kicker">海外</h3><div class="opc-stack">' + OS_CHANNELS.map(channelCard).join('') + '</div>' +
      '<article class="opc-card glass"><h3>跨境收款</h3><p>经常项目要保证交易真实、主体一致，优先走对公。不要把私户收境外款再拆分当成做法。某一支付机构能不能用，问银行、持牌机构和税务。</p>' +
      linksHtml([[SAFE, '外汇局：贸易外汇业务通知'], [MOFCOM, '经常项目外汇业务指引（公开转载）']]) +
      '</article></div></div></section>' +
      '<section id="opc-red" class="opc-sec">' +
      '<h2>风险红线</h2>' +
      '<div class="opc-card glass"><ol class="opc-redlines">' +
      REDLINES.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') +
      '</ol>' + linksHtml([[GOV_CO, '公司法全文'], [FAKE_INV, '浙江税务：虚开专票问答'], [ANNUAL, '企业信息公示暂行条例'], [SCOPE, '经营范围登记管理规定']]) +
      '</div></section>';
  }
  function normalize(raw) {
    if (!raw) return null;
    var items = Array.isArray(raw) ? raw : (Array.isArray(raw.items) ? raw.items : null);
    if (!items) return null;
    return {
      updated: (!Array.isArray(raw) && (raw.updated || raw.date)) || '',
      items: items.filter(function (it) { return it && (it.title || it.summary || it.source_url); }),
    };
  }
  function embedded() { return global.QUEST_OPC || null; }
  function getPack(cb) {
    var emb = normalize(embedded());
    if (cache) return cb(cache);
    if (emb) {
      cache = emb;
      cb(emb);
    } else {
      cb({ updated: '', items: [] });
    }
    if (!global.fetch || fetching) return;
    fetching = true;
    fetch('data/opc-briefs/latest.json', { cache: 'no-cache' }).then(function (res) {
      return res && res.ok ? res.json() : null;
    }).then(function (d) {
      fetching = false;
      var n = normalize(d);
      if (!n) return;
      var same = false;
      try { same = cache && JSON.stringify(cache) === JSON.stringify(n); } catch (e) { same = false; }
      cache = n;
      global.QUEST_OPC = n;
      if (!same) cb(n);
    }).catch(function () { fetching = false; });
  }
  function bindArchive(slot, pack) {
    slot.querySelectorAll('[data-opctype]').forEach(function (b) {
      b.addEventListener('click', function () {
        view.type = b.getAttribute('data-opctype') || 'all';
        slot.innerHTML = archiveHtml(pack);
        bindArchive(slot, pack);
      });
    });
  }
  function bindJump(root) {
    root.querySelectorAll('[data-opc-jump]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-opc-jump');
        var el = id && document.getElementById(id);
        if (!el) return;
        var reduce = false;
        try { reduce = document.documentElement.classList.contains('reduce-motion') || global.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { reduce = false; }
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }
  function paint(root, pack) {
    root.innerHTML = pageBanner() + disclaimer() +
      '<p class="opc-banner-note">公开整理，不是法律或税务意见，不承诺收益，不写灰产。</p>' +
      '<p class="rank-intro" data-reveal>一人有限责任公司的政策要点、常见合法业务和接活渠道。周报约每周 3 次，每条都附来源。</p>' +
      evergreen() +
      '<section id="opc-archive" class="opc-sec"><h2>周报归档</h2>' +
      '<p class="hint">最新一批短讯。历史快照在 data/opc-briefs/日期.json，页面展示 latest。</p>' +
      '<div id="opc-archive-slot"></div></section>';
    var slot = root.querySelector('#opc-archive-slot');
    if (slot) {
      slot.innerHTML = archiveHtml(pack);
      bindArchive(slot, pack);
    }
    bindJump(root);
    if (global.QuestNav) global.QuestNav.fixLinks(root);
    if (global.QuestShell && global.QuestShell.mountReveal) global.QuestShell.mountReveal(root);
  }
  function render(state, root) {
    root.innerHTML = '<div class="skeleton-doc" aria-busy="true"><i class="sk sk-title"></i><i class="sk"></i><i class="sk sk-short"></i></div>';
    var seq = (render._seq = (render._seq || 0) + 1);
    getPack(function (pack) {
      if (seq !== render._seq) return;
      paint(root, pack || { updated: '', items: [] });
    });
  }
  global.QuestOpc = { render: render, TYPES: TYPES };
})(typeof window !== 'undefined' ? window : globalThis);
