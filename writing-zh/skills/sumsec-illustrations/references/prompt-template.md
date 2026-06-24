# 生图提示词模板

每张图单独生成。根据正文内容替换变量，不要把多张图拼在一起。

```text
Generate one standalone 16:9 horizontal Chinese article illustration for a sumsec.me style technical blog.

Visual DNA:
Pure white background. Minimalist black hand-drawn line art. Slightly wobbly pen lines. Lots of empty white space. Sparse cyan-blue and red-orange handwritten Chinese annotations. Clean restrained engineering sketch feeling, with dry humor. No gradients, no shadows, no paper texture, no complex background, no commercial vector style, no PPT infographic look, no cute mascot poster, no children's illustration, no realistic UI, no cyberpunk poster.

Recurring SumSec personal avatar required:
SumSec Observer, an original personal avatar for sumsec.me: an adult security researcher and system observer, minimalist black hand-drawn line art, adult proportions, calm restrained expression, slightly tired but lucid, short jacket or lightweight hoodie, small crossbody tool bag with log papers and tiny cables, optional thin-frame glasses or low visor cap, one small cyan-blue identifier, and red-orange evidence tags only when needed. The character feels like a hands-on technical writer who debugs security research, AI agents, hooks, skills, and toolchains on paper. The character must perform the core engineering action, not decorate the scene. SumSec Core may appear only as a small badge, tool chip, or evidence seal carried by the character. Not a mascot, not cute, not a hacker villain, not a cyberpunk character, not a children's cartoon, not an external IP character.

Theme:
{正文配图主题}

Structure type:
{结构类型：Workflow / 系统局部 / 漏洞链路 / Agent 编排 / 证据栈 / 前后对比 / 角色状态 / 概念隐喻 / 方法分层 / 地图路线 / 小漫画分镜}

Core idea:
{这张图要表达的核心意思}

Composition:
{具体画面：SumSec Observer 在哪里、正在做什么，SumSec Core 如何作为小徽记/工具芯片/证据封签参与结构，主要物件是什么，信息如何流动}

Suggested elements:
{元素1} / {元素2} / {元素3} / {元素4}

Chinese handwritten labels:
{标注词1} / {标注词2} / {标注词3} / {标注词4} / {可选标注词5}

Color use:
Black for main line art and the SumSec Observer character. Cyan-blue for system state, agent/sync/tooling notes, transparent water-like flows, or a small character identifier. Red-orange only for risks, vulnerabilities, warnings, evidence tags, failed assumptions, or key results. Orange for main flow/path/arrows when needed.

Constraints:
One image explains only one core structure. Keep the main subject around 40%-60% of the canvas. Preserve at least 35% blank white space. Use at most 5-8 short handwritten Chinese labels. Do not write a title in the top-left corner. Do not write the structure type on the image. Do not make it a formal diagram, course slide, dense explainer, brand mascot poster, security vendor key visual, or cyberpunk UI scene. Do not copy prior examples or reuse known case compositions unless explicitly requested; invent a fresh engineering metaphor for this specific article. It should be clear but not instructional, interesting but not childish, dryly funny but clean.
```

## 单独个人形象提示

当用户只要求优化 SumSec 个人形象、头像、角色设定或角色 prompt，而不是为具体文章生成配图时，使用更窄的角色提示：

```text
Create a clean character study of SumSec Observer, the original personal avatar for sumsec.me. Pure white background, minimalist black hand-drawn line art, adult security researcher / system observer, calm restrained expression, slightly tired but lucid. Adult proportions, not chibi. Short jacket or lightweight hoodie, small crossbody tool bag with visible log papers and tiny cables, optional thin-frame glasses or low visor cap, one small cyan-blue identifier, tiny red-orange evidence tag if needed. The character should feel like a hands-on technical writer who debugs security research, AI agents, hooks, skills, and toolchains on paper. Keep the drawing sparse, deadpan, engineering-sketch-like, with lots of blank space. Do not make it a mascot, cute cartoon, hacker villain, cyberpunk character, children's illustration, anime character, superhero, vendor logo figure, or external IP character. SumSec Core may appear only as a tiny badge, tool chip, or evidence seal.
```

## 图像编辑提示

去掉左上角标题：

```text
Edit the provided image. Remove only the handwritten title "{要删除的文字}" and its underline from the top-left corner. Fill that area with the same clean white background, matching the surrounding blank paper. Preserve everything else exactly: characters, labels, paths, line style, composition, aspect ratio, and image quality. Do not add any new text or objects.
```

增强怪诞感：

```text
Regenerate this illustration with the same core meaning and simple layout, using SumSec Observer as the active personal avatar: an original adult security researcher / system observer for sumsec.me, calm, restrained, slightly tired but lucid, doing the engineering action. Keep the crossbody tool bag, small cyan-blue identifier, and SumSec Core only as a tiny badge, tool chip, or evidence seal. Keep it clean, sparse, hand-drawn, restrained, deadpan, and not mascot-like.
```
