# -*- coding: utf-8 -*-
"""Build the main-site introduction as a Word document."""

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.shared import Pt, Cm, RGBColor

CJK = "微软雅黑"
INK = RGBColor(0x1A, 0x1A, 0x1A)
MUTED = RGBColor(0x6B, 0x6B, 0x6B)
ACCENT = RGBColor(0xC2, 0x4B, 0x1E)

OUT = r"D:\个人作品网站\docs\个人作品网站-项目介绍.docx"
IMAGES = r"D:\个人作品网站\docs\images"


def set_run_font(run, size, bold=False, color=INK, spacing=None):
    run.font.name = CJK
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = rpr.makeelement(qn("w:rFonts"), {})
        rpr.append(rfonts)
    rfonts.set(qn("w:ascii"), CJK)
    rfonts.set(qn("w:hAnsi"), CJK)
    rfonts.set(qn("w:eastAsia"), CJK)
    if spacing is not None:
        run._element.get_or_add_rPr().append(
            run._element.makeelement(qn("w:spacing"), {qn("w:val"): str(spacing)})
        )


def para(doc, text="", size=10.5, bold=False, color=INK, before=0, after=6,
         line=1.5, indent=None, align=None):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(before)
    pf.space_after = Pt(after)
    pf.line_spacing = line
    if indent is not None:
        pf.left_indent = Cm(indent)
    if align is not None:
        pf.alignment = align
    if text:
        run = p.add_run(text)
        set_run_font(run, size, bold, color)
    return p


def heading(doc, text, number=None):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(15)
    pf.keep_with_next = True
    pf.space_after = Pt(8)
    pf.line_spacing = 1.2
    if number:
        r = p.add_run(number + "  ")
        set_run_font(r, 9, True, ACCENT)
    r = p.add_run(text)
    set_run_font(r, 14, True, INK)
    # thin rule under the heading
    pPr = p._element.get_or_add_pPr()
    borders = pPr.makeelement(qn("w:pBdr"), {})
    bottom = borders.makeelement(
        qn("w:bottom"),
        {qn("w:val"): "single", qn("w:sz"): "4", qn("w:space"): "6",
         qn("w:color"): "D8D2C6"},
    )
    borders.append(bottom)
    pPr.append(borders)
    return p


def bullet(doc, head, body):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.left_indent = Cm(0.9)
    pf.first_line_indent = Cm(-0.45)
    pf.space_before = Pt(0)
    pf.space_after = Pt(4)
    pf.line_spacing = 1.55
    r = p.add_run("·  ")
    set_run_font(r, 10.5, True, ACCENT)
    if head:
        r = p.add_run(head)
        set_run_font(r, 10.5, True, INK)
    r = p.add_run(body)
    set_run_font(r, 10.5, False, INK)
    return p


def figure(doc, filename, caption):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.keep_with_next = True
    p.add_run().add_picture(f"{IMAGES}\\{filename}", width=Cm(13.2))
    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_after = Pt(6)
    r = cap.add_run(caption)
    set_run_font(r, 8.5, False, MUTED)


doc = Document()

# page setup: A4, comfortable margins
sec = doc.sections[0]
sec.page_width = Cm(21)
sec.page_height = Cm(29.7)
sec.left_margin = Cm(2.6)
sec.right_margin = Cm(2.6)
sec.top_margin = Cm(2.4)
sec.bottom_margin = Cm(2.2)

normal = doc.styles["Normal"]
normal.font.name = CJK
normal.font.size = Pt(10.5)
normal.element.rPr.rFonts.set(qn("w:eastAsia"), CJK)

# ---------- cover block ----------
p = para(doc, "PORTFOLIO · 2026", 8.5, True, MUTED, before=0, after=14)
for r in p.runs:
    r.font.all_caps = True

p = doc.add_paragraph()
p.paragraph_format.space_after = Pt(4)
r = p.add_run("个人作品网站")
set_run_font(r, 30, True, INK)

para(doc, "把电影剪辑台的语汇搬进网页", 13, False, MUTED, after=16)

para(doc, "一条可以横着拖动的胶片带，每帧都是一个做过的小项目；框选某一帧，"
          "它就“唰”地摊成整幅剧照——整个站点是一台在放映的机器。", 10.5, False, INK, after=14)

p = doc.add_paragraph()
p.paragraph_format.space_after = Pt(4)
r = p.add_run("线上地址　")
set_run_font(r, 9, True, MUTED)
r = p.add_run("https://atop49.github.io/portfolio/")
set_run_font(r, 10.5, True, ACCENT)

p = doc.add_paragraph()
p.paragraph_format.space_after = Pt(2)
r = p.add_run("技术栈　")
set_run_font(r, 9, True, MUTED)
r = p.add_run("Next.js（App Router，静态导出）· TypeScript · Tailwind CSS v4 · GSAP / Flip · 自绘 SVG 素材")
set_run_font(r, 10, False, INK)

# ---------- 01 films ----------
heading(doc, "SELECTED WORK　胶片带", "01")
para(doc, "一条 16:9 的胶片，横向排着 5 帧作品。首屏把中间那张推到眼前，两侧的帧以 45° 向内折过去、"
          "去色压暗，越靠右越淡，最后融进黑场。", after=6)
figure(doc, "01-films.png", "图 1　胶片带：中间一帧处于显影状态，两侧向深处折去")
bullet(doc, "一格一张　", "滚轮每滚一格就走一张卡，不再需要连滚好几次。")
bullet(doc, "无限循环　", "往任一方向拖都不会到头，副本首尾相接，看不见接缝。")
bullet(doc, "中心显影　", "正中那张是彩色、明亮的，往两侧走会逐帧变成黑白并压暗；鼠标停上去，"
                          "那一帧会当场“洗”成彩色。")
bullet(doc, "刻度与时间码　", "底部是 5 格刻度尺（可点，点了直接跳到那一帧），左上角还有滚动的 REC 时间码。")

# ---------- 02 inspector ----------
heading(doc, "INSPECTOR　检片台", "02")
para(doc, "点任意一帧，卡面会带着翻页动画放大成整幅剧照，左右两侧同时换成“检片台”的版式。", after=6)
figure(doc, "02-inspector.png", "图 2　检片台：左侧项目档案，右侧整幅剧照")
bullet(doc, "项目档案　", "一句话简介、Overview 详情、Tech Stack 技术栈、Process 制作流程、"
                          "Changelog 更新日志（目前留空，显示“暂无更新”）。")
bullet(doc, "独立滚动　", "档案区可单独滚动，滚轮在左栏里滚不会带动后面的胶片。")
bullet(doc, "相纸微倾斜　", "右侧剧照跟随鼠标做极轻微的 3D 倾斜，像一张被灯光照到的相纸。")
bullet(doc, "返回　", "ESC 或「返回胶片」退回胶片带。")
# ---------- 03 skills ----------
heading(doc, "SKILLS　能力矩阵", "03")
para(doc, "按「能力 / 工具 / 协作」三段排的能力清单，左边是栏目编号，右边是名称与一句话说明。"
          "默认只显示名称，悬停或点「展开全部」才展开说明——像一份片尾字幕。")
figure(doc, "03-skills.png", "图 3　能力矩阵：AI 工具应用 / 前端基础开发 / 视觉与排版设计")

# ---------- 04 about ----------
heading(doc, "ABOUT　关于", "04")
para(doc, "巨型名字加一行身份，下面是导演手记、履历与联系方式——像一份片尾字幕。", after=6)
bullet(doc, "名字与身份　", "WANG QI · STUDENT / AI LEARNER，字号压到最大，占到页面上半屏。")
bullet(doc, "导演手记　", "一段自述，说明为什么把作品集做成剪辑台。")
bullet(doc, "履历　", "地点、学校、方向、兴趣四行，等宽小字排列，右侧对齐。")
bullet(doc, "联系　", "邮箱、GitHub、X，以及一枚 Get in touch 按钮。")
figure(doc, "04-about.png", "图 4　关于页：姓名、身份、手记与履历")

# ---------- whole site ----------
heading(doc, "全站", "05")
bullet(doc, "", "顶部三个视图（Projects / Skills / About）切换，每个视图有自己的主题底色，"
                "切换时整页色调会一起过渡。")
bullet(doc, "", "素材全部是自绘 SVG（每张 1600×900 的“剧照”），没有一张位图。")
bullet(doc, "", "布局与动效都做了降级：窄屏退化成可横滑的平面胶片带，prefers-reduced-motion 下关掉位移与倾斜。")

para(doc, "")
p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(10)
r = p.add_run("设计与代码：")
set_run_font(r, 9, False, MUTED)
r = p.add_run("github.com/atop49")
set_run_font(r, 9, True, ACCENT)

doc.save(OUT)
print("saved", OUT)