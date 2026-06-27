# 生图提示词模板

每张图单独生成。根据正文内容替换变量，不要把多张图拼在一起。

实际调用生图工具时，必须参考 `${CLAUDE_SKILL_DIR}/assets/sumsec-observer-target.png` 作为人物生成形象模板图。它负责锁定 SumSec Observer 的人物一致性；下面的文字 prompt 只负责约束主题、构图、动作和禁忌。若当前工具支持参考图输入，优先把这张图一并传入；若不支持，也要按它提炼出的角色约束来写 prompt。

```text
Generate one standalone 16:9 horizontal Chinese article illustration for a sumsec.me style technical blog.

Visual DNA:
Pure white background. Clean minimalist deep charcoal contour line art, not pixelated, with restrained low-saturation character color washes. Use fewer lines: clean outline, low-density details, minimal hair strokes, no dense sketch hatching. Lots of empty white space. Sparse cyan-blue and red-orange handwritten Chinese annotations. Clean restrained engineering sketch feeling, with dry humor. No gradients, no shadows, no paper texture, no complex background, no commercial vector style, no PPT infographic look, no cute mascot poster, no children's illustration, no realistic UI, no cyberpunk poster, no black-and-white pixel art, no 8-bit style, no dithered bitmap look, no low-resolution jagged edges.

Recurring SumSec personal avatar required:
SumSec Observer, an original personal avatar for sumsec.me: a young adult security researcher and system observer, late 20s to early 30s. Preserve the reference character identity strictly: quiet sober eyes, low-key melancholic working expression, slightly tired from work but not dramatic or depressed, focused, intelligent, restrained, no cheerful smile, no sweet smile, no mascot expression. Smooth clean-shaven jawline, no facial hair, no mustache, no beard, no stubble, no chin shadow, no age lines. Dark ink / dark brown-black short hair, slightly messy side-swept bangs partly covering the forehead and one eyebrow, thin-frame glasses. Natural upright posture with relaxed shoulders; slight forward lean is allowed only when inspecting something, but do not make the character hunched, round-backed, slumped, or neck-forward. Young adult proportions, not chibi.

Do not redesign the outfit or equipment. Use a pale cool-gray high-collar lightweight hooded jacket, dark cyan-blue inner lining and drawstrings, black inner shirt, dark pants, dark cyan-blue crossbody strap across the chest, muted gray-brown side crossbody tool bag filled with log papers, notes, small clips, tiny cyan cables, red-orange evidence tags, black clipboard/tablet, small work-ID / evidence badge labeled "SummerSec", exactly two subtle silver rings with cyan-blue SummerSec S emblems, and a small black tool chip with cyan S logo used only for recording and analysis. Cyan-blue identifiers must be small and restrained, not large logos. The character must perform the core engineering action, not decorate the scene.

Allowed simple hand poses only: adjusting glasses, holding a small evidence note, holding a black clipboard/tablet, writing on the clipboard, placing one label, or pointing at a log. Avoid cable-plugging hands, twisted wrists, complex interlocked fingers, extra fingers, and impossible hand anatomy. SummerSec badge may also appear as a tiny simplified cyan-blue water-S tool chip or evidence seal only when structurally useful; do not pile up extra S symbols. Do not make the SummerSec nameplate a big title, big logo, advertising badge, or central subject. Not cyberpunk, not hacker villain, not gloomy collapse, not cheerful mascot, not middle-aged, not old, not bearded, not rugged detective, not overly cute, not anime idol, not superhero, not a children's cartoon, not an external IP character, not flat commercial full-color cartoon. Do not replicate the reference GitHub profile image, bare-shoulder portrait, brown background, anime headshot composition, exact face, or the full character-sheet layout.

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
Deep charcoal for main line art. SumSec Observer must not be pure black-and-white: use pale cool gray for the high-collar hooded jacket, dark cyan-blue for inner lining / drawstrings / crossbody strap / tiny S-emblem rings, very light warm skin tone for face and hands, dark ink for hair, black for inner shirt and clipboard/tablet, muted gray-brown for the side tool bag, tiny red-orange evidence tags. Cyan-blue outside the character is only for system state, agent/sync/tooling notes, transparent water-like flows, or tiny tool chips. Red-orange only for risks, vulnerabilities, warnings, evidence tags, failed assumptions, or key results. Orange for main flow/path/arrows when needed. Keep colors sparse and translucent, like light marker or watercolor washes.

Constraints:
One image explains only one core structure. Keep the main subject around 40%-60% of the canvas. Preserve at least 35% blank white space. Use at most 5-8 short handwritten Chinese labels. Do not write a title in the top-left corner. Do not write the structure type on the image. Do not make it a formal diagram, course slide, dense explainer, brand mascot poster, security vendor key visual, cyberpunk UI scene, black-and-white pixel avatar, 8-bit sprite, dithered bitmap, or low-resolution pixel-art image. Do not copy prior examples or reuse known case compositions unless explicitly requested; invent a fresh engineering metaphor for this specific article. It should be clear but not instructional, interesting but not childish, dryly funny but clean.
```

## 单独个人形象提示

当用户只要求优化 SumSec 个人形象、头像、角色设定或角色 prompt，而不是为具体文章生成配图时，使用更窄的角色提示：

如果后续要把这段 prompt 真正拿去生图，仍然必须参考 `${CLAUDE_SKILL_DIR}/assets/sumsec-observer-target.png`；若工具支持参考图输入，优先一并传入。

```text
Create a clean character study of SumSec Observer, the original personal avatar for sumsec.me. Pure white background, clean minimalist deep charcoal contour line art with restrained low-saturation watercolor / marker character color. Use fewer lines: clean outline, low-detail face, minimal hair strokes, no dense sketch hatching. Young adult security researcher / system observer, late 20s to early 30s. Preserve the reference character identity strictly: quiet sober eyes, low-key melancholic working expression, slightly tired from work but not dramatic or depressed, focused, intelligent, restrained, no cheerful smile, no sweet smile, no mascot expression. Smooth clean-shaven jawline, no facial hair, no mustache, no beard, no stubble, no chin shadow, no age lines. Dark ink / dark brown-black short hair, slightly messy side-swept bangs partly covering the forehead and one eyebrow, thin-frame glasses. Natural upright posture with relaxed shoulders; do not make the character hunched, round-backed, slumped, collapsed, or neck-forward. Young adult proportions, not chibi.

Do not redesign the outfit or equipment. Use a pale cool-gray high-collar lightweight hooded jacket, dark cyan-blue inner lining and drawstrings, black inner shirt, dark pants, dark cyan-blue crossbody strap across the chest, muted gray-brown side crossbody tool bag filled with log papers, notes, small clips, tiny cyan cables, red-orange evidence tags, black clipboard/tablet, small work-ID / evidence badge labeled "SummerSec", exactly two subtle silver rings with cyan-blue SummerSec S emblems, and a small black tool chip with cyan S logo used only for recording and analysis. Cyan-blue identifiers must be small and restrained, not large logos. Allowed simple hand poses only: adjusting glasses, holding a small evidence note, holding a black clipboard/tablet, writing on the clipboard, placing one label, or pointing at a log. Avoid cable-plugging hands, twisted wrists, complex interlocked fingers, extra fingers, and impossible hand anatomy. The character should feel like a hands-on technical writer who debugs security research, Java vulnerabilities, CodeQL notes, AI agents, hooks, skills, and toolchains on paper. Keep the drawing sparse, clean, engineering-sketch-like, with lots of blank space. Do not make it cyberpunk, hacker villain, mascot, chibi, childish, superhero, commercial vector art, flat corporate illustration, dense pencil sketch, realistic portrait, dark dramatic poster, overly cute anime idol, middle-aged detective, bearded man, messy background, UI interface, neon lighting, big logo, advertisement badge, or crowded infographic.
```

## Character Design Sheet Prompt

当用户要求“角色设定图 / 设计一套人物形象 / 提取目标图提示词 / 复刻这张设定图的信息密度”时，优先使用英文版。它适合方图或设定图，不适合正文 16:9 配图；正文配图仍使用上面的文章插图模板。这类输出应说明：这是基于画面反推的稳定 prompt，不是原始 prompt。中文标注必须用引号保留原文。

如果要实际生成这类设定图，也必须参考 `${CLAUDE_SKILL_DIR}/assets/sumsec-observer-target.png`；若工具支持参考图输入，优先一并传入。

```text
Create a clean character design sheet for "SumSec Observer", an original personal avatar for sumsec.me.

Square composition, pure white background, lots of blank space, clean hand-drawn concept sheet layout. Minimalist deep charcoal contour line art with restrained watercolor / marker color washes. Slightly sketchy but clean, low-density detail lines, delicate anime-inspired illustration, technical notebook character sheet feeling. Add small handwritten annotations in Chinese and English.

Main character:
A young adult security researcher / system observer, late 20s to early 30s. Preserve the reference character identity strictly: quiet sober eyes, low-key melancholic working expression, slightly tired from work but not dramatic or depressed, focused, intelligent, restrained, no cheerful smile, no sweet smile, no mascot expression. Dark ink / dark brown-black short hair, slightly messy and side-swept, soft bangs partly covering the forehead and one eyebrow. Thin-frame glasses, narrow clear eyes, clean-shaven face, smooth young jawline, pale warm skin tone. Expression is quiet, sober, restrained, with a very subtle seriousness.

Clothing and equipment:
Do not redesign the outfit or equipment. Pale cool-gray high-collar lightweight hooded jacket, dark cyan-blue inner lining and drawstrings, black inner shirt, dark pants. A dark cyan-blue crossbody strap across the chest. Muted gray-brown crossbody tool bag hanging at the side, filled with log papers, notes, small tools, clips, and tiny cyan cables. The bag has small evidence tags and labels. The character holds a black clipboard / tablet and writes or checks notes, looking like he is working. Do not replace the jacket with a suit, lab coat, tactical vest, generic hoodie, or trench coat. Do not replace the side tool bag with a backpack, waist bag, or briefcase.

Identity details:
Two subtle silver rings on the fingers, each with a cyan-blue SummerSec S emblem. A small work-ID / evidence badge or nameplate labeled "SummerSec", white or light gray with a red-orange header strip and tiny cyan S mark. A small black tool chip with cyan S logo, used only for recording and analysis. Cyan-blue identifiers should be small and restrained, not large logos.

Hand anatomy and pose:
Use simple natural hand poses only. The bust portrait hand may adjust glasses or hold one small evidence note. The working pose may hold a black clipboard/tablet or write on it. Avoid cable-plugging hands, twisted wrists, complex interlocked fingers, extra fingers, fused fingers, and impossible hand anatomy.

Sheet layout:
Show multiple views on one sheet:
1. Large bust portrait on the left, one hand near the glasses, showing the two S-emblem rings, holding a small evidence note.
2. Full-body or 3/4 working pose in the center/right, holding clipboard, wearing jacket and crossbody tool bag.
3. Small simplified icon form at the lower right, still recognizable with glasses, dark hair, gray jacket, cyan strap, and small tool bag.
4. Small object callouts for the two rings and the S tool chip.

Handwritten labels:
Top-left handwritten title: "SumSec Observer" and "sumsec.me".
Small handwritten Chinese annotations, written exactly as quoted: "清澈", "工作中", "图标形态", "两枚戒指，SummerSec S 标识", "工具芯片", "仅用于记录与分析".
Right-side small bullet list: "hook", "CodeQL", "skill".

Color palette:
Deep charcoal black line art, pale cool gray jacket, dark cyan-blue lining / drawstrings / strap, muted gray-brown bag, very light warm skin tone, dark ink hair, small cyan-blue S emblems, tiny red-orange evidence tags. Keep colors sparse and translucent, like light watercolor or marker.

Mood:
Clean white-paper engineering sketch, personal technical writer avatar, security research, logs, CodeQL, hooks, skills, calm observation, clear-water transparency, understated intelligence, quiet low-key melancholic working state.

Negative prompt:
Do not make it cyberpunk, hacker villain, mascot, chibi, childish, superhero, commercial vector art, flat corporate illustration, dense pencil sketch, realistic portrait, dark dramatic poster, overly cute anime idol, middle-aged detective, bearded man, cheerful smiling assistant, messy background, UI interface, neon lighting, big logo, advertisement badge, crowded infographic, redesigned outfit, wrong bag, wrong jacket, missing crossbody strap, missing clipboard, impossible hands, cable-plugging hands, twisted wrists, extra fingers, or fused fingers.
```

更贴近目标图布局时，可以追加：

```text
保持角色参考设定图的构图，而不是单张肖像：大半身头像、全身工作姿态、小图标版本、戒指和工具芯片 callout，全部安排在一张干净的白色画布上。
```

## 图像编辑提示

去掉左上角标题：

```text
Edit the provided image. Remove only the handwritten title "{要删除的文字}" and its underline from the top-left corner. Fill that area with the same clean white background, matching the surrounding blank paper. Preserve everything else exactly: characters, labels, paths, line style, composition, aspect ratio, and image quality. Do not add any new text or objects.
```

增强怪诞感：

```text
Regenerate this illustration with the same core meaning and simple layout, using SumSec Observer as the active personal avatar: an original young adult security researcher / system observer for sumsec.me, late 20s to early 30s. Preserve the reference character identity strictly: quiet sober eyes, low-key melancholic working expression, slightly tired from work but not dramatic or depressed, focused, intelligent, restrained, no cheerful smile, no sweet smile, smooth clean-shaven jawline, no facial hair, no mustache, no beard, no stubble. Natural upright posture with relaxed shoulders; slight forward lean is acceptable for inspection, but do not make the character hunched, round-backed, slumped, collapsed, or neck-forward. Do not redesign the outfit or equipment: dark ink slightly messy side-swept short hair, thin-frame glasses, pale cool-gray high-collar lightweight hooded jacket, dark cyan-blue inner lining / drawstrings / crossbody strap, black inner shirt, dark pants, muted gray-brown side tool bag with log papers / notes / clips / tiny cyan cables, black clipboard/tablet, tiny red-orange evidence tags, one small readable "SummerSec" work-ID / evidence badge, exactly two subtle cyan-blue SummerSec S-emblem rings on the fingers, and one small black S tool chip. Use simple natural hand poses only: adjusting glasses, holding a small evidence note, holding a black clipboard/tablet, writing on the clipboard, placing one label, or pointing at a log. Avoid cable-plugging hands, twisted wrists, complex interlocked fingers, extra fingers, fused fingers, and impossible hand anatomy. Keep it clean and sparse with fewer deep charcoal contour lines, low-density details, minimal hair strokes, and no dense sketch hatching. Do not use black-and-white pixel art, 8-bit style, dithered bitmap texture, low-resolution jagged edges, cyberpunk neon, flat commercial full-color cartoon rendering, middle-aged rugged detective styling, facial hair, cheerful assistant expression, sweet smile, mascot expression, big logo, or advertisement badge.
```
