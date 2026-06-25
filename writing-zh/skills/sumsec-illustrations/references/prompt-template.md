# 生图提示词模板

每张图单独生成。根据正文内容替换变量，不要把多张图拼在一起。

```text
Generate one standalone 16:9 horizontal Chinese article illustration for a sumsec.me style technical blog.

Visual DNA:
Pure white background. Clean minimalist deep charcoal contour line art, not pixelated, with restrained low-saturation character color washes. Use fewer lines: clean outline, low-density details, minimal hair strokes, no dense sketch hatching. Lots of empty white space. Sparse cyan-blue and red-orange handwritten Chinese annotations. Clean restrained engineering sketch feeling, with dry humor. No gradients, no shadows, no paper texture, no complex background, no commercial vector style, no PPT infographic look, no cute mascot poster, no children's illustration, no realistic UI, no cyberpunk poster, no black-and-white pixel art, no 8-bit style, no dithered bitmap look, no low-resolution jagged edges.

Recurring SumSec personal avatar required:
SumSec Observer, an original personal avatar for sumsec.me: a young adult security researcher and system observer, late 20s to early 30s, inspired by the clear-water SUMSEC site identity and the cyan-blue liquid S emblem, clean minimalist deep charcoal contour line art with restrained low-saturation character color, young adult proportions, clear relaxed expression, bright relaxed narrow eyes, friendly clear gaze, subtle small smile, smooth clean-shaven jawline, no facial hair, no mustache, no beard, no stubble, no chin shadow, no age lines. Dark ink / dark brown-black short hair with slightly messy side-swept bangs partly covering one eyebrow, thin-frame glasses as default, natural upright posture, relaxed shoulders, not hunched, not round-backed, not slumped, not neck-forward. Slight forward lean is allowed only when inspecting something. Short jacket or lightweight hoodie with a pale cool-gray wash, dark cyan-blue inner lining or crossbody bag strap, very light warm skin-tone wash on face and hands, small muted gray-brown crossbody tool bag with log papers, clipboard, and tiny cyan cables, one brighter cyan-blue identifier, and red-orange evidence tags only when needed. Add one subtle SummerSec nameplate on the character's chest by default: a small work-ID / evidence badge clipped to the jacket chest, near the chest zipper, or attached to the crossbody strap where it crosses the chest; it says "SummerSec", with a tiny cyan-blue S mark and optional red-orange header strip, readable but small and secondary. For full-body compositions it may move to the tool bag or tool clip only if the chest area is blocked. One hand may be near the face, adjusting glasses, pressing the temple, holding a small evidence note, or pointing at a log; the hand has exactly two subtle cyan-blue SummerSec S-emblem rings as fixed identity anchors. Keep the rings small, restrained, and secondary. The character feels like a hands-on technical writer who debugs security research, Java vulnerabilities, CodeQL notes, AI agents, hooks, skills, and toolchains on paper. The character must perform the core engineering action, not decorate the scene. SummerSec badge may also appear as a tiny simplified cyan-blue water-S tool chip or evidence seal only when structurally useful; do not pile up extra S symbols. Do not make the SummerSec nameplate a big title, big logo, advertising badge, or central subject. Not gloomy, not stern, not deadpan cold, not middle-aged, not old, not bearded, not rugged detective, not a mascot, not overly cute, not a hacker villain, not cyberpunk, not anime idol, not superhero, not a children's cartoon, not an external IP character, not a flat commercial full-color cartoon. Do not replicate the reference GitHub profile image, bare-shoulder portrait, brown background, anime headshot composition, exact face, or the full character-sheet layout.

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
Deep charcoal for main line art. SumSec Observer must not be pure black-and-white: use pale cool gray for the jacket, dark cyan-blue for lining/strap/identifier and the two tiny S-emblem rings, very light warm skin tone for face and hands, dark ink for hair or cap, muted gray-brown for the tool bag. Cyan-blue outside the character is only for system state, agent/sync/tooling notes, transparent water-like flows, or tiny tool chips. Red-orange only for risks, vulnerabilities, warnings, evidence tags, failed assumptions, or key results. Orange for main flow/path/arrows when needed. Keep colors sparse and translucent, like light marker or watercolor washes.

Constraints:
One image explains only one core structure. Keep the main subject around 40%-60% of the canvas. Preserve at least 35% blank white space. Use at most 5-8 short handwritten Chinese labels. Do not write a title in the top-left corner. Do not write the structure type on the image. Do not make it a formal diagram, course slide, dense explainer, brand mascot poster, security vendor key visual, cyberpunk UI scene, black-and-white pixel avatar, 8-bit sprite, dithered bitmap, or low-resolution pixel-art image. Do not copy prior examples or reuse known case compositions unless explicitly requested; invent a fresh engineering metaphor for this specific article. It should be clear but not instructional, interesting but not childish, dryly funny but clean.
```

## 单独个人形象提示

当用户只要求优化 SumSec 个人形象、头像、角色设定或角色 prompt，而不是为具体文章生成配图时，使用更窄的角色提示：

```text
Create a clean character study of SumSec Observer, the original personal avatar for sumsec.me, inspired by SUMSEC's clear-water site identity and cyan-blue liquid S emblem. Pure white background, clean minimalist deep charcoal contour line art with restrained low-saturation character color. Use fewer lines: clean outline, low-detail face, minimal hair strokes, no dense sketch hatching. Young adult security researcher / system observer, late 20s to early 30s, clear relaxed expression, bright relaxed narrow eyes, friendly clear gaze, subtle small smile, smooth clean-shaven jawline, no facial hair, no mustache, no beard, no stubble, no chin shadow, no age lines. Dark ink / dark brown-black short hair with slightly messy side-swept bangs partly covering one eyebrow, thin-frame glasses. Natural upright posture with relaxed shoulders; keep the mood clear and quietly cheerful, not tired, not gloomy. Young adult proportions, not chibi. Do not make the character hunched, round-backed, slumped, collapsed, or neck-forward. Short jacket or lightweight hoodie with pale cool-gray color wash, dark cyan-blue inner lining or crossbody bag strap, very light warm skin-tone wash on face and hands, small crossbody tool bag in muted gray-brown with visible log papers, clipboard, and tiny cyan cables, one brighter cyan-blue identifier, tiny red-orange evidence tag if needed. Add one small SummerSec nameplate on the character's chest by default: tiny work-ID / evidence badge clipped to the jacket chest, near the chest zipper, or on the crossbody strap where it crosses the chest; readable "SummerSec" text, tiny cyan-blue S mark, optional red-orange header strip, secondary and restrained. One hand may be near the face, adjusting glasses, pressing the temple, holding a small evidence note, or pointing at a log; add exactly two subtle cyan-blue SummerSec S-emblem rings on the fingers as fixed identity anchors; keep the rings small, restrained, and not decorative jewelry-focused. The character should feel like a hands-on technical writer who debugs security research, Java vulnerabilities, CodeQL notes, AI agents, hooks, skills, and toolchains on paper. Keep the drawing sparse, clean, relaxed, engineering-sketch-like, with lots of blank space. Do not make the SummerSec nameplate a big title, big logo, advertising badge, or central subject. Do not make it gloomy, stern, deadpan cold, middle-aged, old, bearded, rugged, a mascot, overly cute cartoon, hacker villain, cyberpunk character, children's illustration, anime idol, superhero, vendor logo figure, external IP character, black-and-white pixel avatar, 8-bit sprite, dithered bitmap, low-resolution pixel-art image, flat commercial full-color cartoon, or dense pencil sketch. Do not replicate the reference GitHub profile image, bare-shoulder portrait, brown background, anime headshot composition, exact face, or full character-sheet layout. Do not leave the character as pure black-and-white; keep the controlled color anchors visible.
```

## 图像编辑提示

去掉左上角标题：

```text
Edit the provided image. Remove only the handwritten title "{要删除的文字}" and its underline from the top-left corner. Fill that area with the same clean white background, matching the surrounding blank paper. Preserve everything else exactly: characters, labels, paths, line style, composition, aspect ratio, and image quality. Do not add any new text or objects.
```

增强怪诞感：

```text
Regenerate this illustration with the same core meaning and simple layout, using SumSec Observer as the active personal avatar: an original young adult security researcher / system observer for sumsec.me, late 20s to early 30s, clear relaxed expression, bright relaxed narrow eyes, subtle small smile, smooth clean-shaven jawline, no facial hair, no mustache, no beard, no stubble, doing the engineering action with natural upright posture and relaxed shoulders. Slight forward lean is acceptable for inspection, but do not make the character hunched, round-backed, slumped, collapsed, or neck-forward. Keep the restrained character color anchors: dark ink slightly messy short hair, thin-frame glasses, pale cool-gray jacket, dark cyan-blue lining or crossbody bag strap, very light warm skin tone on face and hands, muted gray-brown tool bag with log papers / clipboard / tiny cyan cables, small brighter cyan-blue identifier, one small readable SummerSec nameplate on the character's chest by default, and exactly two subtle cyan-blue SummerSec S-emblem rings on the fingers. The nameplate should look like a small work-ID / evidence badge clipped to the jacket chest or crossbody strap, with optional red-orange header strip; do not make the nameplate or rings oversized, glossy, magical, or the main subject. Keep it clean and sparse with fewer deep charcoal contour lines, low-density details, minimal hair strokes, relaxed friendly expression, and no dense sketch hatching. Do not use black-and-white pixel art, 8-bit style, dithered bitmap texture, low-resolution jagged edges, cyberpunk neon, flat commercial full-color cartoon rendering, middle-aged rugged detective styling, facial hair, gloomy expression, stern face, or deadpan cold stare.
```
