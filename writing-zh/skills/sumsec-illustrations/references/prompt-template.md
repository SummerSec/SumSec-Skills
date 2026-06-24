# 生图提示词模板

每张图单独生成。根据正文内容替换变量，不要把多张图拼在一起。

```text
Generate one standalone 16:9 horizontal Chinese article illustration for a sumsec.me style technical blog.

Visual DNA:
Pure white background. Minimalist black hand-drawn continuous pen line art, not pixelated. Slightly wobbly pen lines. Lots of empty white space. Sparse cyan-blue and red-orange handwritten Chinese annotations. Clean restrained engineering sketch feeling, with dry humor. No gradients, no shadows, no paper texture, no complex background, no commercial vector style, no PPT infographic look, no cute mascot poster, no children's illustration, no realistic UI, no cyberpunk poster, no black-and-white pixel art, no 8-bit style, no dithered bitmap look, no low-resolution jagged edges.

Recurring SumSec personal avatar required:
SumSec Observer, an original personal avatar for sumsec.me: an adult security researcher and system observer, minimalist black hand-drawn line art, adult proportions, calm restrained expression, slightly tired but lucid, natural upright posture, relaxed shoulders, not hunched, not round-backed, not slumped, not neck-forward. Slight forward lean is allowed only when inspecting something. Short jacket or lightweight hoodie, small crossbody tool bag with log papers and tiny cables, optional thin-frame glasses or low visor cap, one small cyan-blue identifier, and red-orange evidence tags only when needed. The character has exactly two subtle SummerSec S-emblem rings on the fingers as fixed identity anchors; keep them small, restrained, and secondary. The character feels like a hands-on technical writer who debugs security research, AI agents, hooks, skills, and toolchains on paper. The character must perform the core engineering action, not decorate the scene. SummerSec badge may also appear as a tiny simplified cyan-blue water-S tool chip or evidence seal only when structurally useful; do not pile up extra S symbols. Not a mascot, not cute, not a hacker villain, not a cyberpunk character, not a children's cartoon, not an external IP character.

Theme:
{正文配图主题}

Structure type:
{结构类型：Workflow / 系统局部 / 漏洞链路 / Agent 编排 / 证据栈 / 前后对比 / 角色状态 / 概念隐喻 / 方法分层 / 地图路线 / 小漫画分镜}

Core idea:
{这张图要表达的核心意思}

Composition:
{具体画面：SumSec Observer 在哪里、正在做什么，SummerSec 徽记如何作为小徽记/工具芯片/证据封签参与结构，主要物件是什么，信息如何流动}

Suggested elements:
{元素1} / {元素2} / {元素3} / {元素4}

Chinese handwritten labels:
{标注词1} / {标注词2} / {标注词3} / {标注词4} / {可选标注词5}

Color use:
Black for main line art and the SumSec Observer character. Cyan-blue for system state, agent/sync/tooling notes, transparent water-like flows, or a small character identifier. Red-orange only for risks, vulnerabilities, warnings, evidence tags, failed assumptions, or key results. Orange for main flow/path/arrows when needed.

Constraints:
One image explains only one core structure. Keep the main subject around 40%-60% of the canvas. Preserve at least 35% blank white space. Use at most 5-8 short handwritten Chinese labels. Do not write a title in the top-left corner. Do not write the structure type on the image. Do not make it a formal diagram, course slide, dense explainer, brand mascot poster, security vendor key visual, cyberpunk UI scene, black-and-white pixel avatar, 8-bit sprite, dithered bitmap, or low-resolution pixel-art image. Do not copy prior examples or reuse known case compositions unless explicitly requested; invent a fresh engineering metaphor for this specific article. It should be clear but not instructional, interesting but not childish, dryly funny but clean.
```

## 单独个人形象提示

当用户只要求优化 SumSec 个人形象、头像、角色设定或角色 prompt，而不是为具体文章生成配图时，使用更窄的角色提示：

```text
Create a clean character study of SumSec Observer, the original personal avatar for sumsec.me. Pure white background, minimalist black hand-drawn continuous pen line art, adult security researcher / system observer, calm restrained expression, slightly tired but lucid. Natural upright posture with relaxed shoulders; tiredness is only in the eyes and expression, not in the body posture. Adult proportions, not chibi. Do not make the character hunched, round-backed, slumped, collapsed, or neck-forward. Short jacket or lightweight hoodie, small crossbody tool bag with visible log papers and tiny cables, optional thin-frame glasses or low visor cap, one small cyan-blue identifier, tiny red-orange evidence tag if needed. Add exactly two subtle SummerSec S-emblem rings on the fingers as fixed identity anchors; keep the rings small, restrained, and not decorative jewelry-focused. The character should feel like a hands-on technical writer who debugs security research, AI agents, hooks, skills, and toolchains on paper. Keep the drawing sparse, deadpan, engineering-sketch-like, with lots of blank space. Do not make it a mascot, cute cartoon, hacker villain, cyberpunk character, children's illustration, anime character, superhero, vendor logo figure, external IP character, black-and-white pixel avatar, 8-bit sprite, dithered bitmap, or low-resolution pixel-art image. Do not pile up extra S symbols beyond the two rings unless a tiny tool chip or evidence seal is structurally necessary.
```

## 图像编辑提示

去掉左上角标题：

```text
Edit the provided image. Remove only the handwritten title "{要删除的文字}" and its underline from the top-left corner. Fill that area with the same clean white background, matching the surrounding blank paper. Preserve everything else exactly: characters, labels, paths, line style, composition, aspect ratio, and image quality. Do not add any new text or objects.
```

增强怪诞感：

```text
Regenerate this illustration with the same core meaning and simple layout, using SumSec Observer as the active personal avatar: an original adult security researcher / system observer for sumsec.me, calm, restrained, slightly tired but lucid, doing the engineering action with natural upright posture and relaxed shoulders. Slight forward lean is acceptable for inspection, but do not make the character hunched, round-backed, slumped, collapsed, or neck-forward. Keep the crossbody tool bag, small cyan-blue identifier, and exactly two subtle SummerSec S-emblem rings on the fingers as fixed identity anchors. Do not make the rings oversized, glossy, magical, or the main subject. Keep it clean, sparse, hand-drawn with continuous pen lines, restrained, deadpan, and not mascot-like. Do not use black-and-white pixel art, 8-bit style, dithered bitmap texture, or low-resolution jagged edges.
```

