# 生图提示词模板

每张图单独生成。根据正文内容替换变量，不要把多张图拼在一起。

```text
Generate one standalone 16:9 horizontal Chinese article illustration for a sumsec.me style technical blog.

Visual DNA:
Pure white background. Minimalist black hand-drawn line art. Slightly wobbly pen lines. Lots of empty white space. Sparse cyan-blue and red-orange handwritten Chinese annotations. Clean restrained engineering sketch feeling, with dry humor. No gradients, no shadows, no paper texture, no complex background, no commercial vector style, no PPT infographic look, no cute mascot poster, no children's illustration, no realistic UI, no cyberpunk poster.

Recurring IP character required:
SumSec 黑色操作员, a small solid-black absurd creature/operator with white dot eyes, tiny thin legs, blank serious expression, slightly uneven hand-drawn body shape. It must perform the core engineering action, not decorate the scene. Make it serious, deadpan, slightly bizarre, not cute.

Theme:
{正文配图主题}

Structure type:
{结构类型：Workflow / 系统局部 / 漏洞链路 / Agent 编排 / 证据栈 / 前后对比 / 角色状态 / 概念隐喻 / 方法分层 / 地图路线 / 小漫画分镜}

Core idea:
{这张图要表达的核心意思}

Composition:
{具体画面：黑色操作员在哪里、正在做什么、主要物件是什么、信息如何流动}

Suggested elements:
{元素1} / {元素2} / {元素3} / {元素4}

Chinese handwritten labels:
{标注词1} / {标注词2} / {标注词3} / {标注词4} / {可选标注词5}

Color use:
Black for main line art and the black operator. Cyan-blue for system state, agent/sync/tooling notes, transparent water-like flows, or secondary explanations. Red-orange only for risks, vulnerabilities, warnings, failed assumptions, or key results. Orange for main flow/path/arrows when needed.

Constraints:
One image explains only one core structure. Keep the main subject around 40%-60% of the canvas. Preserve at least 35% blank white space. Use at most 5-8 short handwritten Chinese labels. Do not write a title in the top-left corner. Do not write the structure type on the image. Do not make it a formal diagram, course slide, or dense explainer. Do not copy prior examples or reuse known case compositions unless explicitly requested; invent a fresh engineering metaphor for this specific article. It should be clear but not instructional, interesting but not childish, dryly funny but clean.
```

## 图像编辑提示

去掉左上角标题：

```text
Edit the provided image. Remove only the handwritten title "{要删除的文字}" and its underline from the top-left corner. Fill that area with the same clean white background, matching the surrounding blank paper. Preserve everything else exactly: characters, labels, paths, line style, composition, aspect ratio, and image quality. Do not add any new text or objects.
```

增强怪诞感：

```text
Regenerate this illustration with the same core meaning and simple layout, but make the SumSec black operator more central to the engineering action. The operator should be doing the strange work that explains the idea, not standing beside the diagram. Keep it clean, sparse, hand-drawn, restrained, and not cute.
```
