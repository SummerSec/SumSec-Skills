# QA Checklist

## 必过项

- 是 16:9 横版。
- 背景是干净白底。
- 有 SumSec Observer 原创人物。
- SumSec Observer 承担核心动作，不只是装饰。
- 角色像 SumSec / sumsec.me 的个人化作者分身：年轻成人安全研究员 / 系统观测员，清醒、放松、轻微笑意、克制。
- 角色带有来源转译后的稳定特征：深墨略凌乱短发、细框眼镜、明亮放松的窄眼、轻微笑意、冷灰外套、暗青蓝内衬/包带、两枚青蓝 S 戒指。
- 角色姿态自然挺直，肩颈放松；允许轻微前倾观察，但不能严重驼背、塌肩、弓背或脖子前伸。
- 角色年龄感是年轻成人，不是中年大叔；脸部干净下颌，没有胡子、胡茬、小胡子、络腮胡或下巴阴影。
- 人物不是纯黑白线稿，保留低饱和色彩锚点：浅冷灰外套、暗青蓝内衬/包带、浅暖肤色面部与手部、深墨色头发或帽檐。
- 保留至少 2 个稳定识别锚点：斜挎工具包、日志纸/小线缆、细框眼镜或低檐帽、青蓝识别件、红橙证据标签。
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
- 角色像吉祥物、表情包、儿童卡通或外部 IP 角色。
- 角色过于泛化，看不出 SumSec 的个人形象锚点。
- 角色像普通安全研究员，没有清水 S、双戒指、深墨短发、细框眼镜、暗青蓝包带、胸前铭牌、手靠近脸部等来源转译特征。
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
- 太复杂：删节点，只保留一个动作和 3-5 个短标注。
- 太可爱：强调 restrained slight smile、clear relaxed eyes、not childish、not mascot。
- 太老/有胡子：重生成并强调 young adult, late 20s to early 30s, clean-shaven, smooth jawline, no beard, no mustache, no stubble, no chin shadow, no age lines。
- 线条太多：重生成并强调 clean contour line art, fewer lines, low-density details, minimal hair strokes, no dense sketch hatching。
- 眼神太冷/太累：重生成并强调 bright relaxed narrow eyes, friendly clear gaze, subtle small smile, quietly cheerful, not gloomy, not stern, not deadpan cold。
- 不像 SumSec：补回 young adult security researcher / system observer、clear-water SUMSEC identity、dark ink slightly messy short hair with side-swept bangs、thin-frame glasses、bright relaxed narrow eyes、subtle small smile、clean-shaven jawline、pale cool-gray jacket、dark cyan-blue lining/crossbody strap、two subtle cyan-blue S-emblem rings、small chest SummerSec nameplate、light warm skin tone on face and hands、crossbody tool bag、log papers / clipboard。
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
