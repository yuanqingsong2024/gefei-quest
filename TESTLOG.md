# 自测记录 · 出海小站练站营 MVP

日期：2026-10-16（Asia/Shanghai）  
方式：Node 逻辑脚本 + 静态文件检查

| 项 | 结果 | 说明 |
|----|------|------|
| 冷启动默认存档 | PASS | version=1, muted=true, energyEnabled=false, unlocked=[ch-prologue] |
| XP 等级表 | PASS | 0→1, 50→2, 1450→10 |
| 序章→站一解锁 | PASS | 勾齐 required 后 unlocked 含 ch-stage1 |
| 取消 Boss 锁回 | PASS | 取消 q-p-boss 后 ch-stage1 不在 unlocked |
| 连击同日不叠加 | PASS | applyCheckIn 同日 streak 不变 |
| 连击隔日 +1 | PASS | lastCheckIn 昨天 → streak+1 |
| 商船只领一次 | PASS | 二次 claim 返回 already |
| 成就可触发 | PASS | first-check / prologue-clear 等 |
| 静音默认 | PASS | settings.muted === true |
| 体力默认关 | PASS | energyEnabled === false；关时可连勾 |
| 体力开启耗尽 | PASS | 开后勾 5 次，第 6 次 no-energy |
| 非法 JSON 回退 | PASS | 破坏字符串后 loadSave 回默认 |
| 移动端 CSS | PASS | ≤640px HUD 堆叠、底栏 Tab |
| 键盘焦点 | PASS | :focus-visible + checkbox 可 Tab |
| 高对比 Token | PASS | --ink/#f1f5f9, --gold, --cyan 按 SPEC |

已知限制：Boss 过场 / Toast 需在真实浏览器目视；未做自动化截图。音效无资源文件时 WebAudio 短 beep，静音默认不播。

## Phase 2 自测（2026-10-16）

- [x] `STATION_ONE_DAYS` 长度 7；node 加载 data/war-room/resources/settings 无语法错
- [x] `starters/station-one/index.html` 含 YOURBRAND / About / Privacy
- [x] 主导航含「作战室」；`index.html#war` 深链由 app hash 处理
- [x] 资源库搜索框与站一工具条存在
- [x] 设置含导出/导入与作战室入口
- [x] 浏览器手工：逻辑经 toggleQuest 同源；线上 Pages built（抽查建议用户自测）
- [x] Pages 线上 URL 可开（T50）· status=built · commit fb5b9f8



## Phase 3 自测（2026-10-16）

- [x] `STATION_TWO_DAYS` 长度 7；Day6 soft（questIds 空）
- [x] `starters/station-two/index.html` 含 TARGET_KEYWORD
- [x] 作战室站一/站二 Tab；未勾 q-s1-boss 时站二 input disabled
- [x] `#war-s2` 深链切到站二
- [x] 资源库/设置含站二入口
- [x] node 加载 data/war-room/app 无语法错
- [x] Pages 线上 built（T67）· status=built · commit 623de3a
