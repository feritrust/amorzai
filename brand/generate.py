#!/usr/bin/env python3
"""
سازنده فایل‌های هویت بصری آمرز.

    python3 brand/generate.py

خروجی: لوگو، برچسب بسته‌بندی و روبان تاج گل به‌صورت SVG، PDF و PNG.

نکته مهم: همه متن‌های فارسی به «مسیر برداری» تبدیل می‌شوند، نه متن زنده.
یعنی چاپخانه به فونت وزیرمتن نیازی ندارد و هیچ‌وقت حروف به‌هم نمی‌ریزد.

پیش‌نیازها (یک‌بار):
    pip install fonttools brotli uharfbuzz cairosvg
    فونت وزیرمتن:  npm i @fontsource/vazirmatn  (سپس مسیر فایل ttf را در FONT_* بگذارید)
"""
import os
import math

import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform

# ─────────────────────────────── تنظیمات ───────────────────────────────
# این دو مقدار را با اطلاعات واقعی خودتان عوض کنید و اسکریپت را دوباره اجرا کنید
PHONE = '۰۲۱-۵۵۰۰۵۰۰۰'
SITE = 'amorz.ir'
BRAND = 'آمرز'
TAGLINE = 'خدمات مراسم ترحیم'

OUT = os.path.dirname(os.path.abspath(__file__))

FONT_BOLD = os.path.expanduser('~/.fonts/vazirmatn-arabic-800-normal.ttf')
FONT_REG = os.path.expanduser('~/.fonts/vazirmatn-arabic-400-normal.ttf')
# زیرمجموعه عربی وزیرمتن حرف لاتین ندارد، پس برای amorz.ir از نسخه لاتین استفاده می‌شود
FONT_LATIN = os.path.expanduser('~/.fonts/vazirmatn-latin-400-normal.ttf')
FONT_LATIN_BOLD = os.path.expanduser('~/.fonts/vazirmatn-latin-700-normal.ttf')

SAGE = '#4A6152'
SAGE_DARK = '#212C25'
SAGE_LIGHT = '#E1E9E3'
GOLD = '#C9A96A'
GOLD_DARK = '#A8863F'
INK = '#161A18'
PAPER = '#FAF8F5'
WHITE = '#FFFFFF'

_cache = {}


def _font(path):
    if path not in _cache:
        tt = TTFont(path)
        blob = hb.Blob.from_file_path(path)
        face = hb.Face(blob)
        _cache[path] = (tt, tt.getGlyphSet(), tt.getGlyphOrder(), hb.Font(face), face.upem)
    return _cache[path]


def text_path(text, size, font_path=FONT_BOLD, direction=None):
    """متن فارسی → (مسیر SVG، عرض). مبدأ در گوشه چپِ خط پایه است.

    direction='ltr' را برای اعداد و آدرس سایت بدهید؛ در متن راست‌به‌چپ،
    رشته عددی باید چپ‌به‌راست چیده شود وگرنه ارقام برعکس می‌شوند.
    """
    tt, gs, order, hbfont, upem = _font(font_path)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    if direction:
        buf.direction = direction
    hb.shape(hbfont, buf)

    scale = size / upem
    parts, cursor = [], 0.0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        pen = SVGPathPen(gs)
        tp = TransformPen(
            pen,
            Transform(scale, 0, 0, -scale, cursor + pos.x_offset * scale, pos.y_offset * scale),
        )
        gs[order[info.codepoint]].draw(tp)
        cmds = pen.getCommands()
        if cmds:
            parts.append(cmds)
        cursor += pos.x_advance * scale
    return ' '.join(parts), cursor


def txt(text, size, x, y, fill, font=FONT_BOLD, anchor='start', direction=None):
    """تگ path آماده. anchor: start | middle | end"""
    d, w = text_path(text, size, font, direction)
    if anchor == 'middle':
        x -= w / 2
    elif anchor == 'end':
        x -= w
    return f'<g transform="translate({x:.3f} {y:.3f})"><path d="{d}" fill="{fill}"/></g>', w


def mark(cx, cy, size, petal=SAGE, center=GOLD):
    """نشان گل پنج‌پر. size = قطر کل."""
    s = size / 100.0
    R, pr, cr = 30 * s, 16 * s, 11.5 * s
    out = []
    for i in range(5):
        a = math.radians(-90 + i * 72)
        out.append(f'<circle cx="{cx + R*math.cos(a):.3f}" cy="{cy + R*math.sin(a):.3f}" r="{pr:.3f}" fill="{petal}"/>')
    out.append(f'<circle cx="{cx:.3f}" cy="{cy:.3f}" r="{cr:.3f}" fill="{center}"/>')
    return ''.join(out)


def write(name, svg):
    p = os.path.join(OUT, name)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(svg)
    print('  ✔', name)
    return p


def svg_open(w, h, unit='', vb=None, bg=None):
    viewbox = vb or f'0 0 {w} {h}'
    head = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}{unit}" height="{h}{unit}" '
        f'viewBox="{viewbox}">'
    )
    if bg:
        x0, y0, ww, hh = [float(v) for v in viewbox.split()]
        head += f'<rect x="{x0}" y="{y0}" width="{ww}" height="{hh}" fill="{bg}"/>'
    return head


# ─────────────────────────────── لوگوها ───────────────────────────────
def logo_mark():
    svg = svg_open(200, 200) + mark(100, 100, 200) + '</svg>'
    write('logo-mark.svg', svg)

    svg_mono = svg_open(200, 200) + mark(100, 100, 200, petal=SAGE, center=SAGE) + '</svg>'
    write('logo-mark-mono.svg', svg_mono)


def logo_horizontal(filename, fg_text, fg_tag, petal, center, bg=None):
    MARK = 96
    GAP = 26
    name_g, name_w = txt(BRAND, 62, 0, 0, fg_text)
    tag_g, tag_w = txt(TAGLINE, 21, 0, 0, fg_tag, font=FONT_REG)

    text_w = max(name_w, tag_w)
    PAD = 18
    W = MARK + GAP + text_w + PAD * 2
    H = 130

    mark_x = W - MARK / 2 - PAD          # نشان در سمت راست (چیدمان راست‌به‌چپ)
    text_right = W - MARK - GAP - PAD

    body = mark(mark_x, H / 2, MARK)
    body += f'<g transform="translate({text_right - name_w:.3f} {H/2 + 1:.3f})">{name_g[name_g.index(">")+1:-4]}</g>'
    body += f'<g transform="translate({text_right - tag_w:.3f} {H/2 + 30:.3f})">{tag_g[tag_g.index(">")+1:-4]}</g>'

    svg = svg_open(round(W), H, bg=bg) + body + '</svg>'
    write(filename, svg)


# ─────────────────────────────── برچسب‌ها ───────────────────────────────
def label_round(filename, bg, fg, tag_fg, petal, center, ring):
    """برچسب دایره‌ای ۵۰ میلی‌متری (با ۲ میلی‌متر نشت رنگ)."""
    D = 54          # ۵۰ + ۲ نشت از هر طرف
    C = D / 2
    body = f'<circle cx="{C}" cy="{C}" r="{C}" fill="{bg}"/>'
    body += f'<circle cx="{C}" cy="{C}" r="{C-3.2:.2f}" fill="none" stroke="{ring}" stroke-width="0.35"/>'
    body += mark(C, 16.5, 15, petal=petal, center=center)
    g, _ = txt(BRAND, 9.5, C, 31.5, fg, anchor='middle')
    body += g
    g, _ = txt(TAGLINE, 3.1, C, 36.4, tag_fg, font=FONT_REG, anchor='middle')
    body += g
    body += f'<line x1="{C-9}" y1="39.2" x2="{C+9}" y2="39.2" stroke="{ring}" stroke-width="0.4"/>'
    g, _ = txt(PHONE, 4.4, C, 44.4, fg, anchor='middle', direction='ltr')
    body += g
    g, _ = txt(SITE, 3.2, C, 48.6, tag_fg, font=FONT_LATIN, anchor='middle', direction='ltr')
    body += g
    write(filename, svg_open(D, D, unit='mm') + body + '</svg>')


def label_rect(filename, bg, fg, tag_fg, petal, center, ring):
    """برچسب مستطیلی ۶۰ × ۳۰ میلی‌متر (با نشت رنگ)."""
    W, H = 64, 34
    body = f'<rect width="{W}" height="{H}" rx="2.5" fill="{bg}"/>'
    body += f'<rect x="2" y="2" width="{W-4}" height="{H-4}" rx="1.8" fill="none" stroke="{ring}" stroke-width="0.3"/>'
    body += mark(W - 13, H / 2, 15, petal=petal, center=center)
    tx = W - 24
    g, _ = txt(BRAND, 8.5, tx, 14.5, fg, anchor='end')
    body += g
    g, _ = txt(TAGLINE, 3.2, tx, 19.5, tag_fg, font=FONT_REG, anchor='end')
    body += g
    g, _ = txt(PHONE, 4.4, tx, 26.5, fg, anchor='end', direction='ltr')
    body += g
    g, _ = txt(SITE, 3.2, tx, 30.5, tag_fg, font=FONT_LATIN, anchor='end', direction='ltr')
    body += g
    write(filename, svg_open(W, H, unit='mm') + body + '</svg>')


# ─────────────────────────────── روبان تاج گل ───────────────────────────────
def ribbon():
    """قالب روبان ۱۵۰ × ۱۰ سانتی‌متر، به‌صورت خوابیده (همان‌طور که چاپ می‌شود)."""
    W, H = 1500, 100
    body = f'<rect width="{W}" height="{H}" fill="{PAPER}"/>'
    body += f'<rect x="0" y="0" width="{W}" height="3" fill="{GOLD}"/>'
    body += f'<rect x="0" y="{H-3}" width="{W}" height="3" fill="{GOLD}"/>'

    # بلوک برند در سمت راست (شروع خواندن)
    body += mark(W - 52, H / 2, 46)
    g, _ = txt(BRAND, 26, W - 86, H / 2 - 2, SAGE, anchor='end')
    body += g
    g, _ = txt(PHONE, 12, W - 86, H / 2 + 18, GOLD_DARK, anchor='end', direction='ltr')
    body += g
    body += f'<line x1="{W-190}" y1="18" x2="{W-190}" y2="{H-18}" stroke="{SAGE_LIGHT}" stroke-width="1.2"/>'

    # ناحیه متن تسلیت
    g, _ = txt('متن تسلیت اینجا نوشته می‌شود', 30, W - 230, H / 2 + 10, '#C9C4BA', font=FONT_REG, anchor='end')
    body += g
    write('ribbon-1500x100mm.svg', svg_open(W, H, unit='mm', vb=f'0 0 {W} {H}') + body + '</svg>')


# ─────────────────────────────── رندر PNG و PDF ───────────────────────────────
def render():
    try:
        import cairosvg
    except ImportError:
        print('  ! cairosvg نصب نیست — فقط SVG ساخته شد')
        return

    jobs = [
        ('logo-mark.svg', 'logo-mark.png', 1024, None),
        ('logo-horizontal.svg', 'logo-horizontal.png', 1600, None),
        ('logo-horizontal-white.svg', 'logo-horizontal-white.png', 1600, None),
        ('label-round-50mm.svg', 'label-round-50mm.png', 638, 'label-round-50mm.pdf'),
        ('label-round-50mm-dark.svg', 'label-round-50mm-dark.png', 638, 'label-round-50mm-dark.pdf'),
        ('label-rect-60x30mm.svg', 'label-rect-60x30mm.png', 756, 'label-rect-60x30mm.pdf'),
        ('label-rect-60x30mm-dark.svg', 'label-rect-60x30mm-dark.png', 756, 'label-rect-60x30mm-dark.pdf'),
        ('ribbon-1500x100mm.svg', None, None, 'ribbon-1500x100mm.pdf'),
    ]
    for src, png, width, pdf in jobs:
        p = os.path.join(OUT, src)
        if not os.path.exists(p):
            continue
        if png:
            cairosvg.svg2png(url=p, write_to=os.path.join(OUT, png), output_width=width)
            print('  ✔', png)
        if pdf:
            cairosvg.svg2pdf(url=p, write_to=os.path.join(OUT, pdf))
            print('  ✔', pdf)


def main():
    print('ساخت فایل‌های برند آمرز…\n')
    logo_mark()
    logo_horizontal('logo-horizontal.svg', INK, SAGE, SAGE, GOLD)
    logo_horizontal('logo-horizontal-white.svg', WHITE, SAGE_LIGHT, WHITE, GOLD, bg=SAGE_DARK)

    label_round('label-round-50mm.svg', WHITE, INK, SAGE, SAGE, GOLD, SAGE_LIGHT)
    label_round('label-round-50mm-dark.svg', SAGE, WHITE, SAGE_LIGHT, WHITE, GOLD, 'rgba(255,255,255,.45)')
    label_rect('label-rect-60x30mm.svg', WHITE, INK, SAGE, SAGE, GOLD, SAGE_LIGHT)
    label_rect('label-rect-60x30mm-dark.svg', SAGE, WHITE, SAGE_LIGHT, WHITE, GOLD, 'rgba(255,255,255,.45)')

    ribbon()
    print()
    render()
    print('\nتمام شد. فایل‌ها در پوشه brand/')


if __name__ == '__main__':
    main()
