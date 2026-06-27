# QA Checklist

## 必过项

- 是 16:9 横版。
- 背景是干净白底。
- 只要本轮有实际生图/重生成/改图输出，就确实参考了 `${CLAUDE_SKILL_DIR}/assets/sumsec-observer-target.png` 作为人物生成形象模板图；如果工具支持参考图输入，优先已传入；如果不支持，也已把其中的人物锚点落实到 prompt。
- 有 SumSec Observer 原创人物。
- SumSec Observer 承担核心动作，不只是装饰。
- 角色像 SumSec / sumsec.me 的个人化作者分身：年轻成人安全研究员 / 系统观测员，清醒、安静、低情绪、工作中略疲惫但不阴郁、克制。
- 角色带有来源转译后的稳定特征：深墨略凌乱短发、细框眼镜、清醒低情绪的窄眼、安静克制嘴部、浅冷灰高领连帽夹克、暗青蓝内衬/拉绳/斜挎包带、两枚青蓝 S 戒指。
- 角色姿态自然挺直，肩颈放松；允许轻微前倾观察，但不能严重驼背、塌肩、弓背或脖子前伸。
- 角色年龄感是年轻成人，不是中年大叔；脸部干净下颌，没有胡子、胡茬、小胡子、络腮胡或下巴阴影。
- 人物不是纯黑白线稿，保留低饱和色彩锚点：浅冷灰外套、暗青蓝内衬/包带、浅暖肤色面部与手部、深墨色头发或帽檐。
- 保留目标图物件系统：黑色内搭、深色裤子、胸前暗青蓝斜挎包带、侧身灰褐工具包、黑色夹板/平板、日志纸/便签/小夹子/细小青蓝线缆、红橙证据标签、黑色 S 工具芯片。
- 保留至少 4 个稳定识别锚点：细框眼镜、斜挎工具包、黑色夹板/平板、日志纸/小线缆、青蓝识别件、红橙证据标签、双 S 戒指、黑色 S 工具芯片。
- 角色不像吉祥物、表情包、儿童卡通、黑客反派、赛博角色、厂商代言人或外部 IP 角色。
- SummerSec 徽记只是小徽记、工具芯片或证据封签，不是主角、宠物或机器人伙伴。
- 人物手指上有两个低调的 SummerSec S 徽记戒指，且它们不是画面主角。
- 有一个低调可读的 `SummerSec` 铭牌，默认优先在人物胸前：夹克胸口、胸前拉链旁，或斜挎包带经过胸前的位置；像小工作证/调查牌，不能是大标题、大 logo 或广告牌。
- 没有复刻旧案例构图，而是为当前文章生成了新隐喻。
- 画面克制、冷幽默、有工程感、有意思。
- 线条少而干净，以深炭轮廓线为主，不是密集素描排线、凌乱草稿线、黑白像素风、8-bit、点阵或低分辨率锯齿边缘。
- 简洁清爽，主体不超过画面约 60%。
- 一张图只讲一个核心结构。
- 中文标注少、短、能读。
- 青蓝只用于系统状态、Agent/工具链、同步流、补充说明。
- 红橙只用于漏洞、风险、重点、问题、提醒或结果。
- 橙色只用于主路径或箭头。

## 失败信号

出现以下情况，重生成或局部编辑：

- 左上角有“常见坑 / Workflow / 系统架构图 / 路线图”等标题。
- 明明进入了实际生图流程，却既没有参考 `${CLAUDE_SKILL_DIR}/assets/sumsec-observer-target.png`，也没有把它的人物锚点落实到 prompt，导致人设漂移。
- 角色像吉祥物、表情包、儿童卡通或外部 IP 角色。
- 角色过于泛化，看不出 SumSec 的个人形象锚点。
- 角色像普通安全研究员，没有清水 S、双戒指、深墨短发、细框眼镜、暗青蓝包带、胸前铭牌、手靠近脸部等来源转译特征。
- 角色表情变成阳光笑脸、甜美笑脸、开心助手、可爱卖萌、过度亲和，丢失目标图的低情绪工作状态。
- 角色眼神完全没有忧郁/疲惫/专注感，或看起来太快乐、太营业、太像客服形象。
- 角色衣服被重设计：不是浅冷灰高领连帽夹克，缺少暗青蓝内衬/拉绳，黑色内搭消失，或变成西装、实验服、战术背心、普通 hoodie、风衣。
- 胸前暗青蓝斜挎包带缺失、颜色错误或被替换成普通背带。
- 侧身灰褐工具包缺失，或被替换成背包、腰包、公文包、武器包、购物袋。
- 黑色夹板/平板缺失，日志纸/便签/小夹子/细小青蓝线缆缺失，导致角色不像工作中的系统观测员。
- 黑色 S 工具芯片缺失或变成大 logo、宠物、机器人伙伴、主视觉。
- 手部反人类：插线动作扭曲、手腕不合理、手指交叠复杂、额外手指、融合手指、握物关系错误。
- 角色复刻 GitHub profile 的裸肩头像、棕色背景、日漫头像构图或具体脸型。
- 角色有胡子、胡茬、小胡子、络腮胡、下巴阴影或明显年龄纹，显得太老。
- 角色眼神阴郁、疲惫无神、过冷、过凶、厌世或像审讯脸。
- 线条太多，像密集铅笔速写、草稿、写实素描或头发丝过度堆叠。
- 角色没有色彩，只剩黑白线稿或黑色小人。
- 角色颜色过饱和、霓虹、赛博、商业插画或全彩卡通感。
- 角色严重驼背、塌肩、弓背、蜷缩或脖子前伸，把“疲惫”画成病态姿态。
- SummerSec 徽记被画成主角、宠物、机器人或圆滚滚吉祥物。
- 两个 S 徽记戒指被画得过大、过亮、像夸张珠宝或魔法道具。
- SummerSec 铭牌缺失、文字不是 `SummerSec`、挂到不显眼角落，或变成大标题、大 logo、广告牌、胸前大贴片、画面主角。
- 除两个 S 徽记戒指之外，额外堆叠大量 S 徽记导致身份符号泛滥。
- 角色像黑客兜帽、赛博反派、安全厂商 KV 人物、二次元头像或超级英雄。
- 画面像 PPT、课程课件、正式流程图。
- 画面像黑白像素头像、8-bit sprite、点阵图或低分辨率像素风。
- 元素太多、箭头太多、节点太多。
- 文字变成大段解释。
- 背景有纸纹、阴影、渐变、米色、噪点。
- 真实 UI 截图或科技感界面。
- 中文错字严重或标注不可读。
- 画面太死板，没有冷幽默工程隐喻。
- 和旧角色案例构图过于相似。
- 画面太像深色科技海报、商业安全厂商 KV 或营销封面。

## 迭代方法

- 太普通：让 SumSec Observer 成为动作主体，加入一个奇怪但成立的工程隐喻。
- 人设漂移：先检查本轮是否真的参考了 `${CLAUDE_SKILL_DIR}/assets/sumsec-observer-target.png`；如果没有，先补上模板图约束；如果工具支持参考图输入，也优先补传后再重生成。
- 太复杂：删节点，只保留一个动作和 3-5 个短标注。
- 太可爱：强调 restrained slight smile、clear relaxed eyes、not childish、not mascot。
- 太老/有胡子：重生成并强调 young adult, late 20s to early 30s, clean-shaven, smooth jawline, no beard, no mustache, no stubble, no chin shadow, no age lines。
- 线条太多：重生成并强调 clean contour line art, fewer lines, low-density details, minimal hair strokes, no dense sketch hatching。
- 表情太阳光/太甜：重生成并强调 quiet sober eyes, low-key melancholic working expression, slightly tired from work but not dramatic or depressed, focused, intelligent, restrained, no cheerful smile, no sweet smile, no mascot expression。
- 衣服物件跑偏：重生成并强调 Do not redesign the outfit or equipment. Pale cool-gray high-collar lightweight hooded jacket, dark cyan-blue inner lining and drawstrings, black inner shirt, dark pants, dark cyan-blue crossbody strap across the chest, muted gray-brown side tool bag, black clipboard/tablet, log papers, notes, small clips, tiny cyan cables, red-orange evidence tags。
- 手部错误：重生成并强调 Allowed simple hand poses only: adjusting glasses, holding a small evidence note, holding a black clipboard/tablet, writing on the clipboard, placing one label, or pointing at a log. Avoid cable-plugging hands, twisted wrists, complex interlocked fingers, extra fingers, and impossible hand anatomy。
- 不像 SumSec：补回 young adult security researcher / system observer、clear-water SUMSEC identity、dark ink slightly messy side-swept hair、thin-frame glasses、quiet sober low-key melancholic eyes、clean-shaven jawline、pale cool-gray high-collar hooded jacket、dark cyan-blue lining/drawstrings/crossbody strap、two subtle cyan-blue S-emblem rings、small chest SummerSec nameplate、light warm skin tone on face and hands、muted gray-brown side tool bag、black clipboard/tablet、log papers、black S tool chip。
- 铭牌不对：局部编辑或重生成，强调 small readable "SummerSec" work-ID / evidence badge on the character's chest, clipped to jacket chest / chest zipper / crossbody strap where it crosses the chest, optional red-orange header strip, not a big logo or central subject。
- 人物没色彩：只给人物补低饱和局部色，优先补外套、内衬/包带、面部手部和工具包，不要把背景和结构一起涂满。
- 太驼背：重生成并强调 natural upright posture、relaxed shoulders、not hunched、not slumped、not neck-forward；疲惫只留在眼神和表情。
- 太 PPT：去掉标题、边框、整齐网格和过多箭头，改成手绘场景。
- 太像旧案例：保留核心意思，换掉主物件和 SumSec Observer 的动作。
- 太像像素风：重生成并强调 continuous pen line art、no pixel art、no 8-bit、no dithered bitmap、no jagged edges。
- 文字错：优先局部编辑；错得多就重生成并减少标注数量。

## 交付判断

高质量图应该让读者先觉得“有点怪”，然后 1 秒内看懂结构。

如果第一眼像教程页、营销海报或安全厂商方案图，而不是白纸上的冷幽默工程草图，就不合格。
