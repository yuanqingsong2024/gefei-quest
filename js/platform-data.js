/** Phase 15 · 平台变现资料（国内 + 海外）
 *  规则：数字只在有来源时写，并标注来源与日期；否则写 NA。不承诺收益；只写合法路径。
 *  rules: [文字, 来源名, 日期]；src: [标题, URL]（链接核实结果见 tools/check-platform-links.js 输出 data/platform-links.json） */
(function (global) {
  var NA = '官方未公开/以后台为准';
  var UP = '2026-10-17';
  var CATS = [
    { id: 'cn-media', group: 'cn', label: '图文 / 自媒体', icon: 'file', desc: '公众号、头条、百家号、知乎、小红书、微博等：广告分成、赞赏付费、品牌合作。' },
    { id: 'cn-longvideo', group: 'cn', label: '长视频', icon: 'island3', desc: 'B 站、西瓜视频、视频号：创作激励、商单、充电/会员。' },
    { id: 'cn-short', group: 'cn', label: '短视频', icon: 'rocket', desc: '抖音、快手、视频号：中视频/激励、星图/聚星商单、带货与团购。' },
    { id: 'cn-live', group: 'cn', label: '直播', icon: 'fire', desc: '抖音、快手、B 站、视频号直播：打赏、带货、付费连麦。' },
    { id: 'cn-novel', group: 'cn', label: '网文 / 小说', icon: 'book', desc: '起点/阅文、番茄、七猫、知乎盐选短篇、小说推文。' },
    { id: 'cn-comic', group: 'cn', label: '漫画 / 漫剧', icon: 'template', desc: '快看、腾讯动漫、哔哩哔哩漫画、AI 漫剧/动态漫投稿。' },
    { id: 'cn-drama', group: 'cn', label: '短剧', icon: 'target', desc: '红果免费短剧分账、抖音/快手短剧、小程序付费短剧、编剧投稿、分销推广、二创授权。' },
    { id: 'cn-audio', group: 'cn', label: '音频 / 播客', icon: 'bulb', desc: '喜马拉雅、番茄畅听有声书。' },
    { id: 'cn-knowledge', group: 'cn', label: '知识付费', icon: 'trophy', desc: '知识星球、小鹅通。' },
    { id: 'cn-assets', group: 'cn', label: '闲鱼 / 素材', icon: 'fish', desc: '闲鱼非实物、酷安、站酷海洛、视觉中国投稿。' },
    { id: 'gl-video', group: 'global', label: '海外 · 视频与直播', icon: 'globe', desc: 'YouTube、TikTok、Twitch。' },
    { id: 'gl-social', group: 'global', label: '海外 · 社交平台', icon: 'users', desc: 'X、Instagram / Facebook、Pinterest。' },
    { id: 'gl-writing', group: 'global', label: '海外 · 写作与会员', icon: 'ledger', desc: 'Medium、Substack、Patreon。' },
  ];
  var GROUPS = [{ id: 'cn', label: '国内平台', icon: 'flag' }, { id: 'global', label: '海外平台', icon: 'globe' }];
  var CN_RED = '红线：搬运/洗稿/未授权二创、刷量刷粉、虚假宣传与夸大功效、诱导打赏、未成年人打赏、违规导流到站外交易、未报备商单。';
  function P(o) { o.up = o.up || UP; o.rules = o.rules || [[NA]]; return o; }
  var PLATFORMS = [
    /* ---------- 图文 / 自媒体 ---------- */
    P({ id: 'wechat-mp', cat: 'cn-media', name: '微信公众号', ways: '流量主（程序化广告、返佣商品）、互选广告、赞赏、付费文章/付费合集', gate: '流量主：关注用户≥100 且符合运营规范；付费/赞赏需原创等资格（以后台为准）', level: 2,
      rules: [['流量主（返佣商品 + 程序化广告）开通门槛：关注用户达到 100 人', '微信广告官方指南', '2026-10-17 查阅'], ['程序化广告门槛由「粉丝数≥500」调整为「≥100」', '腾讯广告（新浪财经转载）', '2026-03-24'], ['广告分成比例、千次收益', NA]],
      steps: ['定一个垂直主题，先写 10 篇原创', '在公众平台「收入变现-流量主」查看是否可开通', '开通后选广告位并补全财务资料', '原创满足条件后再开赞赏/付费合集'], fit: '能持续写长文、有私域或朋友圈基础的人', risk: CN_RED + ' 刷粉账号不予通过流量主。',
      src: [['微信广告 · 流量主开通指南', 'https://ad.weixin.qq.com/guide/1188'], ['公众号创作者变现能力三大升级（新浪财经）', 'https://finance.sina.com.cn/roll/2026-03-24/doc-inhsavws1657899.shtml'], ['微信公众平台', 'https://mp.weixin.qq.com/']] }),
    P({ id: 'toutiao', cat: 'cn-media', name: '头条号', ways: '创作收益（文章、微头条、问答、视频）、头条首发激励、付费专栏、商单', gate: '微头条收益：粉丝（含西瓜）≥0、信用分 100、非国家机构/其他组织，可自主申请（以后台为准）', level: 1,
      rules: [['微头条创作收益开通条件：粉丝≥0、信用分 100 分', '头条创作者帮助中心（头条百科）', '2026-10-17 查阅'], ['千次阅读收益', NA]],
      steps: ['注册头条号并实名', '在「创作权益」查看可申请项', '优先首发原创，避免一稿多投被判非首发', '每周复盘阅读完成率'], fit: '擅长资讯解读、生活经验类短文的人', risk: CN_RED + ' 标题党与低质内容会扣信用分，信用分过低冻结收益。',
      src: [['微头条创作收益（头条创作者帮助中心）', 'https://baike.toutiao.com/detail/192/200/0'], ['头条号后台', 'https://mp.toutiao.com/']] }),
    P({ id: 'baijiahao', cat: 'cn-media', name: '百家号', ways: '广告分成、百+计划/激励活动、付费专栏、商单', gate: NA, level: 2, steps: ['注册并选好领域', '按领域持续发原创', '在后台「收益中心」查看开通条件'], fit: '写百科/问答型内容、懂百度搜索的人', risk: CN_RED, src: [['百家号', 'https://baijiahao.baidu.com/']] }),
    P({ id: 'zhihu', cat: 'cn-media', name: '知乎', ways: '盐选专栏/付费短篇、致知计划/心愿计划等激励、好物推荐、品牌任务', gate: NA, level: 3, steps: ['在擅长领域认真回答 20 个问题', '在创作中心查看可加入的计划', '有作品积累后尝试盐选短篇投稿'], fit: '有专业知识或会写故事的人', risk: CN_RED + ' 抄袭与 AI 批量洗稿会被处罚。', src: [['知乎创作中心', 'https://www.zhihu.com/creator']] }),
    P({ id: 'xiaohongshu', cat: 'cn-media', name: '小红书', ways: '蒲公英品牌合作、买手/带货、直播', gate: '蒲公英：个人专业号实名、年满 18、粉丝≥1000、近期无违规（第三方整理，以后台为准）', level: 2,
      rules: [['蒲公英入驻：专业号认证、≥18 岁、粉丝≥1000', '零壹电商（第三方整理）', '2024-07-16'], ['合作报价与平台服务费', NA]],
      steps: ['开通个人专业号并实名', '固定 1 个细分人群持续发笔记', '粉丝达标后在「内容合作」申请蒲公英', '所有商单走平台报备'], fit: '会拍图、懂审美、有真实使用体验的人', risk: CN_RED + ' 未报备的软广（私单）违规。',
      src: [['小红书蒲公英', 'https://pgy.xiaohongshu.com/'], ['蒲公英帮助中心', 'https://pgy.xiaohongshu.com/help/home'], ['蒲公英入驻门槛（零壹电商）', 'https://www.2i1i.com/70752.html']] }),
    P({ id: 'weibo', cat: 'cn-media', name: '微博', ways: '微博视频号计划/创作激励、付费订阅（V+ 等）、微任务商单、打赏', gate: '微任务：非企业认证用户授权后需审核（官方帮助页写通常 48 小时内）；其余以后台为准', level: 2,
      rules: [['微任务非企业认证用户审核通常 48 小时内完成', '微任务帮助中心', '2026-10-17 查阅'], ['视频号计划分成、付费订阅分成比例', NA]],
      steps: ['完善认证与领域标签', '在创作者中心查看视频激励/订阅入口', '粉丝稳定后授权微任务接单'], fit: '热点评论、垂类博主、已有粉丝的人', risk: CN_RED, src: [['微任务帮助中心', 'https://weirenwu.weibo.com/wrw/index.php?c=index.help'], ['微博', 'https://weibo.com/']] }),
    P({ id: 'dayu', cat: 'cn-media', name: '大鱼号（UC/优酷）', ways: '流量分成、激励计划', gate: NA, level: 2, steps: ['注册并实名', '在后台查看分成开通条件'], fit: '已有图文/视频内容想多平台分发的人', risk: CN_RED, src: [['大鱼号', 'https://mp.dayu.com/']] }),
    P({ id: 'qiehao', cat: 'cn-media', name: '企鹅号（腾讯内容开放平台）', ways: '流量分成、腾讯新闻/看点分发收益', gate: NA, level: 2, steps: ['注册并实名', '在后台查看收益权限'], fit: '多平台分发的图文作者', risk: CN_RED, src: [['腾讯内容开放平台', 'https://om.qq.com/']] }),
    P({ id: 'wangyihao', cat: 'cn-media', name: '网易号', ways: '流量分成、激励计划', gate: NA, level: 2, steps: ['注册并实名', '在后台查看收益权限'], fit: '多平台分发的图文作者', risk: CN_RED, src: [['网易号', 'https://mp.163.com/']] }),
    /* ---------- 长视频 ---------- */
    P({ id: 'bilibili', cat: 'cn-longvideo', name: '哔哩哔哩（B 站）', ways: '创作激励（视频/专栏/素材）、花火商单、充电、广告分成、升级玩法', gate: '视频创作激励：电磁力 Lv3 + 信用分要求（两个官方来源数值不同，以后台为准）', level: 3,
      rules: [['创作激励准入：电磁力等级 Lv3，且信用分达到 60 分', 'B 站官方《UP主的变现方式》PDF', '查阅 2026-10-17（文件未标日期）'], ['创作激励准入：电磁力 Lv3，且信用分不低于 80 分', 'B 站专栏文章（MoonTeam）', '2025-01-07'], ['爆款小目标：每周二开奖，每期 30 万奖金池；8 周内累计完成 3 次得 300 元激励金', 'B 站官方《UP主的变现方式》PDF', '查阅 2026-10-17'], ['单次播放收益', NA]],
      steps: ['选一个分区做系列视频', '在创作中心查看电磁力', '达标后申请创作激励，商单走花火报备'], fit: '能做 5 分钟以上深度视频的人', risk: CN_RED + ' 商业推广稿件不享受激励基础收益。',
      src: [['UP 主的变现方式（B 站官方 PDF）', 'https://activity.hdslb.com/blackboard/static/3ca9370fe7081d46a9590e1454872863/UP%E4%B8%BB%E7%9A%84%E5%8F%98%E7%8E%B0%E6%96%B9%E5%BC%8F.pdf'], ['什么是创作激励计划（B 站专栏）', 'https://www.bilibili.com/opus/1019572511064457217'], ['花火商单平台', 'https://huahuo.bilibili.com/'], ['B 站创作中心', 'https://member.bilibili.com/platform/home']] }),
    P({ id: 'xigua', cat: 'cn-longvideo', name: '西瓜视频', ways: '视频创作收益（与头条打通）、商单', gate: NA, level: 2, steps: ['用头条/抖音账号登录西瓜创作平台', '在收益页查看开通条件'], fit: '做横屏中长视频的人', risk: CN_RED, src: [['西瓜创作平台', 'https://studio.ixigua.com/']] }),
    P({ id: 'channels-long', cat: 'cn-longvideo', name: '微信视频号（中长视频）', ways: '创作分成、互选任务、付费订阅/会员专区、带货', gate: '创作分成需 100 有效粉丝；视频变现任务需 1000 有效粉丝或开通小店（官方权益指南，以后台为准）', level: 2,
      rules: [['创作分成：100 有效粉丝且内容合规；视频变现任务：1000 有效粉丝或开通小店', '微信视频号创作者权益指南（微信支持中心）', '2026-10-17 查阅'], ['会员专区定价区间 56–1316 微信豆', '视频号创作者会员专区功能介绍（微信支持中心）', '2026-10-17 查阅'], ['分成比例', NA]],
      steps: ['用视频号助手发布', '在「收入」查看已开通权益', '粉丝达标后申请互选/会员专区'], fit: '有微信私域、做知识/生活内容的人', risk: CN_RED,
      src: [['微信视频号创作者权益指南', 'https://support.weixin.qq.com/cgi-bin/mmsupportacctnodeweb-bin/pages/Vc24Lkjri1oIRvRM'], ['创作者会员专区功能介绍', 'https://support.weixin.qq.com/cgi-bin/mmsupportacctnodeweb-bin/pages/WTkGBEPA2qiTHHfI'], ['视频号助手', 'https://channels.weixin.qq.com/']] }),
    /* ---------- 短视频 ---------- */
    P({ id: 'douyin', cat: 'cn-short', name: '抖音', ways: '中视频计划/创作激励、星图商单、抖音商城带货（精选联盟）、团购达人', gate: NA, level: 3, steps: ['选垂类，先发 20 条原创', '在创作者中心查看可开通的变现能力', '带货先开通商品橱窗，团购在生活服务入口申请', '商单走星图'], fit: '会拍摄剪辑、有出镜意愿或产品知识的人', risk: CN_RED + ' 带货需真实试用，禁止虚假宣传与极限词。',
      src: [['抖音创作者中心', 'https://creator.douyin.com/'], ['巨量星图', 'https://www.xingtu.cn/'], ['抖音电商百应（达人带货）', 'https://buyin.jinritemai.com/']] }),
    P({ id: 'kuaishou', cat: 'cn-short', name: '快手', ways: '光合创作者计划、磁力聚星商单、快手小店带货', gate: NA, level: 3, steps: ['在快手创作者服务平台查看计划', '粉丝积累后入驻磁力聚星', '带货开通小店/分销'], fit: '接地气内容、下沉市场带货', risk: CN_RED, src: [['快手创作者服务平台', 'https://cp.kuaishou.com/']] }),
    P({ id: 'channels-short', cat: 'cn-short', name: '视频号（短视频）', ways: '互选平台商单、带货、创作分成', gate: '见「视频号（中长视频）」条目：创作分成 100 有效粉丝，变现任务 1000 有效粉丝或开通小店', level: 2,
      rules: [['创作分成 100 有效粉丝；视频变现任务 1000 有效粉丝或开通小店', '微信视频号创作者权益指南', '2026-10-17 查阅']], steps: ['在视频号助手查看权益', '达标后接互选任务或开小店'], fit: '微信生态用户', risk: CN_RED, src: [['微信视频号创作者权益指南', 'https://support.weixin.qq.com/cgi-bin/mmsupportacctnodeweb-bin/pages/Vc24Lkjri1oIRvRM']] }),
    /* ---------- 直播 ---------- */
    P({ id: 'live-douyin', cat: 'cn-live', name: '抖音直播', ways: '礼物打赏、直播带货、付费连麦/付费直播', gate: '实名、年满 18（平台规则，具体以后台为准）', level: 4, steps: ['实名认证', '先做固定时段的小场次', '带货直播需选品与资质'], fit: '有表达能力、能稳定开播的人', risk: CN_RED + ' 禁止诱导未成年人打赏、低俗擦边、虚假宣传。', src: [['抖音创作者中心', 'https://creator.douyin.com/']] }),
    P({ id: 'live-kuaishou', cat: 'cn-live', name: '快手直播', ways: '礼物打赏、带货', gate: NA, level: 4, steps: ['实名认证', '固定时段开播'], fit: '同上', risk: CN_RED, src: [['快手创作者服务平台', 'https://cp.kuaishou.com/']] }),
    P({ id: 'live-bili', cat: 'cn-live', name: 'B 站直播 / 视频号直播', ways: '打赏、舰长/会员、带货', gate: NA, level: 4, steps: ['在对应平台开通直播', '与视频内容联动'], fit: '已有视频粉丝的 UP 主', risk: CN_RED, src: [['B 站创作中心', 'https://member.bilibili.com/platform/home'], ['视频号助手', 'https://channels.weixin.qq.com/']] }),
    /* ---------- 网文 / 小说 ---------- */
    P({ id: 'qidian', cat: 'cn-novel', name: '起点 / 阅文（作家助手）', ways: '订阅分成、打赏、全勤/激励、版权改编', gate: '签约审核（以编辑与后台为准）', level: 4, steps: ['在阅文作家专区建书', '存稿后申请签约', '签约后按合同获得订阅分成'], fit: '能长期日更的长篇作者', risk: '抄袭、融梗、违规题材会被下架；合同条款需逐条读。', src: [['阅文作家专区', 'https://write.qq.com/']] }),
    P({ id: 'fanqie', cat: 'cn-novel', name: '番茄小说（免费阅读）', ways: '独家分成签约、优质保底签约、礼物收益、版权收益（短剧/有声/漫画等）', gate: '签约审核；保底签约面向高人气或有历史成绩的作家', level: 3,
      rules: [['礼物收益：作者获得扣除渠道费后的 70%', '番茄小说网 · 作家福利页', '2026-10-17 查阅'], ['优质保底签约：千字 15–3000 元的保底或买断稿费', '番茄小说网 · 作家福利页', '2026-10-17 查阅'], ['2026 短剧改编「爆款之源奖」50 万–300 万元/部；「优质原著奖」最高 30%', '腾讯新闻报道', '2026-01-17'], ['独家分成比例', '按合同约定，' + NA]],
      steps: ['在番茄作家后台建书', '完成新书期更新后申请签约', '关注年度作家福利与短剧改编计划'], fit: '擅长爽文节奏、能高频更新的作者', risk: '抄袭/融梗、违规内容下架；版权合同需看清授权范围。',
      src: [['番茄小说网 · 作家福利', 'https://fanqienovel.com/welfare'], ['2026 年番茄小说年度作家福利', 'https://fanqienovel.com/writer/zone/article/7587262439981318169'], ['8 倍收入暴涨，后短剧时代网文创作者（腾讯新闻）', 'https://view.inews.qq.com/a/20260117A05X2F00']] }),
    P({ id: 'qimao', cat: 'cn-novel', name: '七猫中文网', ways: '签约分成、保底、激励', gate: NA, level: 3, steps: ['在七猫作者后台投稿', '按编辑反馈修改后签约'], fit: '免费阅读赛道作者', risk: '同上', src: [['七猫中文网', 'https://www.qimao.com/']] }),
    P({ id: 'zhihu-short', cat: 'cn-novel', name: '知乎盐选短篇 / 晒客等短篇平台', ways: '短篇投稿买断或分成、短剧改编', gate: NA, level: 3, steps: ['写 1–3 万字完整短篇', '在知乎创作中心或对应平台投稿'], fit: '会写反转、强情绪短篇的人', risk: '抄袭与洗稿违规；注意买断条款。', src: [['知乎创作中心', 'https://www.zhihu.com/creator']] }),
    P({ id: 'novel-promo', cat: 'cn-novel', name: '小说推文 / 番茄推文（推广）', ways: '在短视频平台推广小说，按带来的阅读/拉新获得佣金', gate: NA, level: 2, rules: [['佣金与结算规则', '以官方推广后台为准；' + NA]], steps: ['只通过平台官方推广入口领取授权书目', '用授权素材或自写解说制作视频', '在视频中按要求挂载官方链接'], fit: '会剪辑、愿意批量出片的人', risk: '必须使用官方授权；搬运他人推文、侵权配音、虚假剧情标题都违规。第三方「推文代理」常有收费骗局。', src: [['番茄小说网', 'https://fanqienovel.com/']] }),
    /* ---------- 漫画 / 漫剧 ---------- */
    P({ id: 'kuaikan', cat: 'cn-comic', name: '快看漫画', ways: '签约稿费、分成、版权', gate: NA, level: 4, steps: ['准备 3 话以上样稿', '通过官方投稿渠道提交'], fit: '漫画作者/团队', risk: '画风或剧情抄袭违规。', src: [['快看漫画', 'https://www.kuaikanmanhua.com/']] }),
    P({ id: 'tencent-comic', cat: 'cn-comic', name: '腾讯动漫', ways: '签约稿费、分成、IP 改编', gate: NA, level: 4, steps: ['在腾讯动漫投稿', '签约后按合同结算'], fit: '漫画作者', risk: '同上', src: [['腾讯动漫', 'https://ac.qq.com/']] }),
    P({ id: 'bili-manga', cat: 'cn-comic', name: '哔哩哔哩漫画', ways: '签约、分成', gate: NA, level: 4, steps: ['在官方投稿入口提交作品'], fit: '漫画作者', risk: '同上', src: [['哔哩哔哩漫画', 'https://manga.bilibili.com/']] }),
    P({ id: 'ai-manju', cat: 'cn-comic', name: 'AI 漫剧 / 动态漫投稿', ways: '向短剧/漫剧平台投稿分账、接制作外包', gate: NA, level: 3, rules: [['分账比例与审核标准', NA]], steps: ['取得小说/剧本的改编授权', '用 AI 工具制作并人工精修', '按平台要求标注 AI 生成内容后投稿'], fit: '会 AI 绘图与剪辑的人', risk: '未授权改编侵权；AI 生成内容需按规定标识；人物肖像与配音须有授权。', src: [['红果短剧', 'https://www.hongguoduanju.com/']] }),
    /* ---------- 短剧 ---------- */
    P({ id: 'hongguo', cat: 'cn-drama', name: '红果短剧（免费短剧）', ways: '平台投资 + 流水分账、编剧/制作方合作、保底 + 分账（后期作品）', gate: '项目需通过平台评估（以短剧创作服务平台为准）', level: 4,
      rules: [['用户端：短剧仍免费观看，仅极少量影视需 VIP', '澎湃新闻（红果回应）', '查阅 2026-10-17'], ['「千部计划」撮合：单项目投资 13–22 万元；分账 平台 60% / 制作方 25% / 编剧 10% / 演员 5%；开机付 60%、上线付 40%；产生流水即分账', '流媒体网报道（平台通知）', '9 月 17 日（报道未标年份，见原文）'], ['「果燃计划」：单个项目最高投资 200 万元，投资比例最高 100%；后期作品采用保底 + 分账', '新浪科技', '2026-04-24'], ['分账透明化项目预计 2026 年第二季度全面开放', '新浪科技', '2026-04-24']],
      steps: ['编剧：写 ≥30 集剧本大纲与前 10 集，通过官方创作服务平台投递', '制作方：准备承制资质与过往作品', '个人：可先做剧本或参与授权二创，不要轻信收费「内部渠道」'], fit: '编剧、制作团队；个人建议从剧本切入', risk: '必须持证合规（备案/审核）；题材导向不正会被下架；警惕「交钱上剧」骗局。',
      src: [['最高 22 万，红果开始招真人短剧承制方（流媒体网）', 'https://lmtw.com/mzw/content/detail/id/258364'], ['红果短剧 5 亿专项资金（新浪科技）', 'https://finance.sina.com.cn/tech/mobile/n/n/2026-04-24/doc-inhvqwee3152210.shtml'], ['红果回应：短剧仍免费（澎湃新闻）', 'https://www.thepaper.cn/newsDetail_forward_33097373'], ['红果短剧官网', 'https://www.hongguoduanju.com/']] }),
    P({ id: 'dy-ks-drama', cat: 'cn-drama', name: '抖音 / 快手短剧分账', ways: '平台短剧分账、付费短剧、品牌定制剧', gate: '需机构/备案资质（以平台为准）', level: 5, rules: [['分账比例', NA]], steps: ['以机构身份对接平台短剧业务', '个人可做编剧或演员'], fit: '短剧公司/制作团队', risk: '未备案上线违规；擦边与价值导向问题会下架。', src: [['抖音创作者中心', 'https://creator.douyin.com/'], ['快手创作者服务平台', 'https://cp.kuaishou.com/'], ['国家广播电视总局', 'https://www.nrta.gov.cn/']] }),
    P({ id: 'mini-drama', cat: 'cn-drama', name: '小程序付费短剧', ways: '用户付费解锁、投流回收', gate: '需企业主体、备案与审核（以监管与平台规则为准）', level: 5, rules: [['分成与投流成本', NA]], steps: ['了解广电总局微短剧备案要求', '以企业主体合规运营'], fit: '有资金与资质的公司', risk: '投流亏损风险高；未备案、诱导付费、低俗内容违规。', src: [['国家广播电视总局', 'https://www.nrta.gov.cn/']] }),
    P({ id: 'drama-writer', cat: 'cn-drama', name: '短剧编剧投稿', ways: '剧本买断、分账（见红果「千部计划」编剧 10%）', gate: '剧本评估', level: 3, rules: [['红果「千部计划」编剧分账 10%', '流媒体网报道', '9 月 17 日（报道未标年份）']], steps: ['研究平台热门题材但保持原创', '写完整分集大纲', '通过官方平台投递，保留创作证据'], fit: '会写强节奏剧情的人', risk: '剧本被抄袭风险——投稿前做好存证；不付费给「中介」。', src: [['流媒体网报道', 'https://lmtw.com/mzw/content/detail/id/258364']] }),
    P({ id: 'drama-promo', cat: 'cn-drama', name: '短剧分销 / 推广号', ways: '用授权片段推广短剧，按充值或观看获得佣金', gate: NA, level: 2, rules: [['佣金比例', NA]], steps: ['只在平台官方推广任务中领取授权剧集', '按规则剪辑与挂载链接'], fit: '会剪辑、能批量出片的人', risk: '未授权搬运侵权；夸大剧情标题、诱导付费违规。', src: [['红果短剧', 'https://www.hongguoduanju.com/']] }),
    P({ id: 'drama-remix', cat: 'cn-drama', name: '剪辑二创授权', ways: '参加平台/片方授权的二创活动获得激励', gate: NA, level: 2, rules: [['激励规则', '以活动页为准；' + NA]], steps: ['只参加明确写明「授权二创」的活动', '保留授权截图'], fit: '剪辑爱好者', risk: '没有授权的影视剧剪辑属于侵权。', src: [['抖音创作者中心', 'https://creator.douyin.com/']] }),
    /* ---------- 音频 ---------- */
    P({ id: 'ximalaya', cat: 'cn-audio', name: '喜马拉雅', ways: '主播激励、付费专辑、打赏、有声书演播', gate: NA, level: 3, steps: ['用好麦克风录制试音', '在创作中心上传原创或已授权内容'], fit: '声音好、会讲故事或知识的人', risk: '朗读他人作品须有授权。', src: [['喜马拉雅', 'https://www.ximalaya.com/']] }),
    P({ id: 'fanqie-listen', cat: 'cn-audio', name: '番茄畅听（有声书）', ways: '有声书主播招募/分成', gate: NA, level: 3, steps: ['关注官方主播招募', '试音通过后按合作规则录制'], fit: '有演播能力的人', risk: '只录制平台授权书目。', src: [['番茄小说网', 'https://fanqienovel.com/']] }),
    /* ---------- 知识付费 ---------- */
    P({ id: 'zsxq', cat: 'cn-knowledge', name: '知识星球', ways: '付费社群', gate: NA, level: 3, rules: [['平台服务费', NA]], steps: ['先用免费内容验证需求', '设定明确的交付清单再开付费'], fit: '有专业经验、能持续答疑的人', risk: '禁止夸大承诺「包赚钱」；内容须原创或授权。', src: [['知识星球', 'https://zsxq.com/']] }),
    P({ id: 'xiaoe', cat: 'cn-knowledge', name: '小鹅通', ways: '课程店铺、直播课、会员', gate: '开店资质以官网为准', level: 3, rules: [['费用与套餐', '以官网报价为准；' + NA]], steps: ['先做一节免费课验证', '再上架付费课程'], fit: '讲师、培训机构', risk: '虚假宣传与「保过/保赚」违规。', src: [['小鹅通', 'https://www.xiaoe-tech.com/']] }),
    /* ---------- 闲鱼 / 素材 ---------- */
    P({ id: 'xianyu', cat: 'cn-assets', name: '闲鱼（非实物服务）', ways: '技能服务、设计、简历修改、模板等', gate: '实名，部分类目需资质', level: 1, rules: [['服务费规则', '以闲鱼规则中心为准；' + NA]], steps: ['挑你真会的一项技能', '写清交付内容与时间', '先做 3 单积累评价'], fit: '有一技之长的新手', risk: '禁止虚拟账号、代写、破解软件、引流站外私下交易。', src: [['闲鱼', 'https://www.goofish.com/']] }),
    P({ id: 'hellorf', cat: 'cn-assets', name: '站酷海洛', ways: '图片/视频素材投稿分成', gate: NA, level: 2, steps: ['注册供稿人', '上传原创素材并写好关键词'], fit: '摄影、设计师', risk: '人物需肖像授权，禁止上传他人作品。', src: [['站酷海洛', 'https://www.hellorf.com/']] }),
    P({ id: 'vcg', cat: 'cn-assets', name: '视觉中国（供稿）', ways: '图片/视频授权分成', gate: NA, level: 2, steps: ['申请成为签约摄影师/供稿人'], fit: '摄影师', risk: '同上', src: [['视觉中国', 'https://www.vcg.com/']] }),
    P({ id: 'coolapk', cat: 'cn-assets', name: '酷安', ways: '应用/主题开发者分发与推广，社区创作', gate: NA, level: 3, steps: ['在开发者平台发布自己的应用或主题'], fit: '安卓开发者、主题设计者', risk: '禁止破解版与盗版资源。', src: [['酷安', 'https://www.coolapk.com/']] }),
    /* ---------- 海外 ---------- */
    P({ id: 'youtube', cat: 'gl-video', name: 'YouTube', ways: 'YouTube 合作伙伴计划（广告分成）、Shorts 分成、频道会员、Super Thanks/Chat', gate: '1000 订阅 + 12 个月 4000 小时有效公开观看时长，或 1000 订阅 + 90 天 1000 万次有效 Shorts 观看', level: 3,
      rules: [['YPP 门槛：1,000 订阅 + 近 12 个月 4,000 小时有效观看，或 1,000 订阅 + 近 90 天 1,000 万次有效 Shorts 观看', 'YouTube 帮助中心（answer 72851）', '2026-10-17 查阅'], ['广告分成比例', '以 YouTube 合作伙伴计划条款与后台为准']],
      access: '中国大陆无法直接访问；需身处支持地区。本站不提供绕过方法。', payout: '通过 AdSense 收款（电汇等），需所在地区受支持', steps: ['选一个英文细分主题', '每周固定发布', '在 YouTube Studio「赚钱」页跟踪进度'], fit: '能做英文/多语言视频的人', risk: '重复/再利用内容不符合 YPP；版权声明与社区准则违规会失去资格。',
      src: [['YouTube 合作伙伴计划概览与资格', 'https://support.google.com/youtube/answer/72851?hl=en']] }),
    P({ id: 'tiktok', cat: 'gl-video', name: 'TikTok', ways: 'Creator Rewards Program、TikTok Shop 联盟带货、LIVE 礼物', gate: '18+、≥10,000 粉丝、近 30 天 ≥100,000 次视频观看、个人账号、所在地区开放', level: 3,
      rules: [['Creator Rewards：≥18 岁、≥10K 粉丝、近 30 天 ≥100K 观看；视频需 ≥1 分钟且原创', 'TikTok Newsroom / 帮助中心', '2026-10-17 查阅'], ['每千次奖励金额', NA]],
      access: '国际版 TikTok 在中国大陆不可用；项目仅在部分国家开放。', payout: '按 TikTok 后台支持的提现方式与地区', steps: ['确认所在国家是否开放', '做 1 分钟以上原创视频', '达标后在 App 内申请'], fit: '身处开放地区的短视频创作者', risk: '搬运、合拍/拼接不算原创；刷量违规。',
      src: [['Introducing the New Creator Rewards Program（TikTok Newsroom）', 'https://newsroom.tiktok.com/en-us/introducing-the-new-creator-rewards-program'], ['Creator Rewards Program 帮助中心', 'https://support.tiktok.com/es/business-and-creator/creator-rewards-program/creator-rewards-program']] }),
    P({ id: 'twitch', cat: 'gl-video', name: 'Twitch', ways: 'Affiliate/Partner：订阅、Bits、广告', gate: '30 天内：25 关注、直播 4 小时、4 个不同日期、4 天平均同时在线 ≥3', level: 4,
      rules: [['Affiliate 门槛：25 followers、4 小时、4 个不同日期、4 天平均 3 名同时观众（同一 30 天内）', 'Twitch 帮助中心', '2026-10-17 查阅'], ['门槛由 50 关注/8 小时/7 天下调至上述标准', 'Twitch 官方博客', '2026-05-13'], ['订阅分成比例', NA]],
      access: '中国大陆无法直接访问。', payout: '以 Twitch 支持的收款方式与税务资料为准', steps: ['开启 2FA', '固定时段直播', '在 Achievements 跟踪进度'], fit: '游戏/陪伴类主播', risk: '版权音乐、刷观众违规。',
      src: [['Joining the Affiliate Program', 'https://help.twitch.tv/s/article/joining-the-affiliate-program?language=en'], ['Monetization for All（Twitch Blog）', 'https://blog.twitch.tv/en/2026/05/13/monetization-for-all/']] }),
    P({ id: 'x', cat: 'gl-social', name: 'X（原 Twitter）', ways: 'Original Content Rewards（取代 Creator Revenue Sharing）、Subscriptions 订阅', gate: 'Premium 订阅、≥500 认证粉丝、近 90 天 ≥50 万次认证用户首页曝光、18+、开放国家', level: 4,
      rules: [['Creator Revenue Sharing 于 2026 年 9 月 7 日后停止，由 Original Content Rewards 取代', 'Engadget', '2026'], ['新门槛：Premium/Premium+/Premium Business、500 认证粉丝、近 90 天 500,000 次认证用户 Home Timeline 曝光（不含回复）', 'Engadget / NetInfluencer 报道', '2026'], ['单次曝光收益', NA]],
      access: '中国大陆无法直接访问。', payout: '经 X 的支付服务商（需身份验证）', steps: ['订阅 Premium', '发原创观点与长帖', '在 Creator Studio 查看资格'], fit: '英文观点型博主', risk: '刷曝光、机器流量不计入并可能封号。',
      src: [['X Is Replacing Revenue Sharing（Engadget）', 'https://www.engadget.com/2232981/x-replacing-revenue-sharing-with-original-content-rewards-program/'], ['X Details Eligibility Rules（NetInfluencer）', 'https://www.netinfluencer.com/x-details-eligibility-rules-for-new-original-content-rewards-program/']] }),
    P({ id: 'meta', cat: 'gl-social', name: 'Instagram / Facebook', ways: 'Facebook 内容变现（Content Monetization）、Stars、订阅、品牌合作', gate: NA, level: 3, rules: [['资格与分成', '以 Meta 专业控制面板为准；' + NA]], access: '中国大陆无法直接访问；部分功能仅限特定国家。', payout: '以 Meta 支持的收款方式为准', steps: ['开通专业/创作者账号', '在专业控制面板查看可用变现工具'], fit: '海外生活方式/视觉内容创作者', risk: '违反合作伙伴变现政策会失去资格。', src: [['Meta for Creators', 'https://creators.facebook.com/']] }),
    P({ id: 'pinterest', cat: 'gl-social', name: 'Pinterest', ways: '导流到自己网站（联盟/广告）、品牌合作', gate: NA, level: 2, rules: [['平台直接创作者分成', NA]], access: '中国大陆无法直接访问。', payout: '主要靠自己网站的变现', steps: ['为你的英文小站做竖版图', '每个 Pin 链接到对应页面'], fit: '有英文网站、做视觉类主题的人（与本站路线契合）', risk: '联盟链接需披露；禁止误导性 Pin。', src: [['Pinterest Business', 'https://business.pinterest.com/']] }),
    P({ id: 'medium', cat: 'gl-writing', name: 'Medium Partner Program', ways: '会员阅读分成（付费墙文章）', gate: 'Medium 付费会员、至少发布 1 篇、完整资料、银行在支持国家、18+', level: 2,
      rules: [['资格：付费会员、≥1 篇文章、完整资料、银行在支持国家、≥18 岁；符合即自动加入无需审核', 'Medium Help Center', '2026-10-17 查阅'], ['支持国家列表包含香港、澳门、台湾，不含中国大陆', 'Medium Help Center（支持国家列表）', '2026-10-17 查阅'], ['每次阅读收益', NA]],
      access: '中国大陆访问受限。', payout: 'Stripe（需支持国家的银行与税务居民身份）', steps: ['成为会员并完善资料', '写英文深度文章', '连接 Stripe 并提交税务信息'], fit: '能写英文长文的人', risk: '全 AI 生成内容不允许放付费墙。',
      src: [['Medium Partner Program eligibility', 'https://help.medium.com/hc/en-us/articles/39121627791639-Medium-Partner-Program-eligibility']] }),
    P({ id: 'substack', cat: 'gl-writing', name: 'Substack', ways: '付费订阅 Newsletter', gate: '免费开通；开启付费需连接 Stripe', level: 2,
      rules: [['开启付费订阅后 Substack 收取 10%；Stripe 另收 2.9% + $0.30（美国卡）及 0.7% 循环账单费', 'Substack 帮助中心', '2026-10-17 查阅']],
      access: '中国大陆访问受限。', payout: 'Stripe（以 Stripe 支持国家为准）', steps: ['先发免费 Newsletter 积累读者', '内容稳定后开付费档'], fit: '有固定主题、能每周写作的人', risk: '内容须原创；不得承诺投资收益等。', src: [['How much does Substack cost?', 'https://support.substack.com/hc/en-us/articles/360037607131-How-much-does-Substack-cost']] }),
    P({ id: 'patreon', cat: 'gl-writing', name: 'Patreon', ways: '会员订阅、单次购买', gate: '免费开通', level: 2,
      rules: [['2025-08-04 之后发布页面的新创作者：标准平台费 10% + 支付处理/换汇/提现费与税', 'Patreon 帮助中心 / 定价页', '2026-10-17 查阅']],
      access: '中国大陆访问受限。', payout: 'PayPal、Payoneer、直接存款等（以帮助中心与所在地区为准）', steps: ['设计 2–3 个会员档位', '给会员稳定的专属内容'], fit: '已有粉丝的创作者', risk: '禁止违规内容；会员权益需兑现。',
      src: [['Creator fees overview（Patreon）', 'https://support.patreon.com/hc/en-us/articles/11111747095181-Creator-fees-overview'], ['Patreon Pricing', 'https://www.patreon.com/pricing']] }),
  ];
  var GUIDE = [
    ['只想先试试、时间碎片', '闲鱼非实物技能服务、公众号/头条图文（门槛低，0 成本起步）'],
    ['会写作', '国内：公众号、知乎、番茄小说；海外：Medium、Substack（需身处支持地区）'],
    ['会剪辑/拍摄', 'B 站、视频号、抖音；只做原创或官方授权的推文/短剧推广'],
    ['会写故事', '番茄小说 → 短剧改编；短剧编剧投稿（警惕收费中介）'],
    ['已经在做英文小站（本站路线）', 'Pinterest 导流、YouTube 讲解视频、Medium 同步文章，最终回到自己网站变现'],
    ['想做直播/短剧制作', '先确认资质与备案要求，评估投流与时间成本，不建议零基础重投入'],
  ];
  global.QUEST_PLATFORMS = { NA: NA, UPDATED: UP, CATS: CATS, GROUPS: GROUPS, PLATFORMS: PLATFORMS, GUIDE: GUIDE };
})(typeof window !== 'undefined' ? window : globalThis);
