from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path.cwd()
OUT = ROOT / "marketing/ready-to-post/premium-final"
PNG = OUT / "png"
MP4 = OUT / "mp4"
SRC = ROOT / "output/marketing-kit/source-screenshots"
BG = ROOT / "marketing/ready-to-post/premium-background-concept.png"

for folder in (PNG, MP4):
    folder.mkdir(parents=True, exist_ok=True)

W, H = 1080, 1920
FONT = "/System/Library/Fonts/SFNS.ttf"
FONT_BOLD = "/System/Library/Fonts/SFNS.ttf"

def font(size):
    return ImageFont.truetype(FONT, size=size)

def cover(img, size):
    img = img.convert("RGB")
    iw, ih = img.size
    tw, th = size
    scale = max(tw / iw, th / ih)
    nw, nh = int(iw * scale), int(ih * scale)
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    return img.crop(((nw - tw) // 2, (nh - th) // 2, (nw + tw) // 2, (nh + th) // 2))

def rounded_mask(size, radius):
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    return mask

def paste_phone(canvas, shot_path, x, y, w, h):
    shot = cover(Image.open(shot_path), (w - 34, h - 34))
    shadow = Image.new("RGBA", (w + 80, h + 90), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((40, 30, 40 + w, 30 + h), radius=64, fill=(0, 0, 0, 190))
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    canvas.alpha_composite(shadow, (x - 40, y - 30))

    body = Image.new("RGBA", (w, h), (4, 7, 13, 255))
    bd = ImageDraw.Draw(body)
    bd.rounded_rectangle((0, 0, w - 1, h - 1), radius=64, fill=(4, 7, 13, 255), outline=(120, 135, 150, 130), width=4)
    mask = rounded_mask((w - 34, h - 34), 48)
    body.paste(shot.convert("RGBA"), (17, 17), mask)
    bd.rounded_rectangle((w // 2 - 70, 24, w // 2 + 70, 56), radius=16, fill=(0, 0, 0, 230))
    canvas.alpha_composite(body, (x, y))

def draw_wrapped(draw, text, xy, max_width, fnt, fill, spacing=8):
    x, y = xy
    words = text.split()
    line = ""
    for word in words:
        test = f"{line} {word}".strip()
        if draw.textbbox((0, 0), test, font=fnt)[2] > max_width and line:
            draw.text((x, y), line, font=fnt, fill=fill)
            y += fnt.size + spacing
            line = word
        else:
            line = test
    if line:
        draw.text((x, y), line, font=fnt, fill=fill)
    return y + fnt.size

def chip(draw, text, x, y, color):
    f = font(32)
    tw = draw.textbbox((0, 0), text, font=f)[2]
    draw.rounded_rectangle((x, y, x + tw + 58, y + 66), radius=33, fill=(2, 7, 17, 245), outline=color, width=3)
    draw.text((x + 29, y + 14), text, font=f, fill=(255, 255, 255, 255))
    return x + tw + 78

def make_card(name, title, subtitle, screen, chips, badge):
    bg = Image.new("RGBA", (W, H), (4, 8, 20, 255))
    base = ImageDraw.Draw(bg)
    for y in range(H):
        t = y / H
        r = int(5 + 4 * t)
        g = int(9 + 10 * t)
        b = int(22 + 18 * t)
        base.line((0, y, W, y), fill=(r, g, b, 255))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((-220, 80, 520, 820), fill=(255, 122, 0, 58))
    gd.ellipse((680, -120, 1320, 680), fill=(18, 216, 255, 42))
    gd.ellipse((620, 910, 1260, 1690), fill=(139, 92, 246, 38))
    glow = glow.filter(ImageFilter.GaussianBlur(70))
    bg.alpha_composite(glow)
    panel = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(panel)
    od.rounded_rectangle((42, 72, 1038, 590), radius=34, fill=(4, 10, 25, 238), outline=(255, 255, 255, 36), width=2)
    od.rounded_rectangle((500, 560, 1024, 1668), radius=52, fill=(255, 255, 255, 18), outline=(255, 255, 255, 28), width=2)
    bg.alpha_composite(panel)
    draw = ImageDraw.Draw(bg)

    draw.text((72, 116), "FULL", font=font(46), fill=(255, 122, 0, 255))
    draw.text((204, 116), "BALANCE", font=font(46), fill=(192, 224, 240, 255))
    draw.rounded_rectangle((750, 84, 1008, 148), radius=32, fill=(255, 122, 0, 255))
    draw.text((879 - draw.textbbox((0,0), badge, font=font(25))[2] // 2, 103), badge, font=font(25), fill=(255, 255, 255, 255))

    draw_wrapped(draw, title, (72, 220), 900, font(88), (255, 255, 255, 255), 4)
    draw_wrapped(draw, subtitle, (76, 425), 870, font(38), (225, 234, 246, 255), 10)

    paste_phone(bg, SRC / screen, 520, 615, 470, 1018)

    x = 64
    for text, color in chips:
        x = chip(draw, text, x, 1582, color)

    draw.rounded_rectangle((64, 1742, 1016, 1856), radius=32, fill=(255, 86, 0, 255))
    cta = "Ücretsiz başla · fullbalance.app"
    draw.text((540 - draw.textbbox((0,0), cta, font=font(40))[2] // 2, 1777), cta, font=font(40), fill=(255,255,255,255))

    path = PNG / name
    bg.convert("RGB").save(path, quality=95)
    return path

cards = [
    make_card(
        "premium-01-6-modul-tr.png",
        "Sadece fitness değil",
        "Kas gelişimi, yağ yakımı, yoga, meditasyon, reformer ve pilates tek uygulamada.",
        "dashboard-nutrition-mobile.png",
        [("6 modül", (255,122,0,210)), ("ücretsiz", (18,216,255,210)), ("kredi kartı yok", (24,224,163,210))],
        "ÜCRETSİZ",
    ),
    make_card(
        "premium-02-antrenman-tr.png",
        "Planı aç, bugünü tamamla",
        "Günün egzersizleri, set, tekrar ve dinlenme süreleri tek ekranda.",
        "dashboard-workout-mobile.png",
        [("antrenman", (255,122,0,210)), ("set", (18,216,255,210)), ("dinlenme", (24,224,163,210))],
        "ANTRENMAN",
    ),
    make_card(
        "premium-03-beslenme-tr.png",
        "Beslenme takibi sade olsun",
        "Kalori, makro, su ve uyku hedeflerini aynı akışta gör.",
        "dashboard-nutrition-mobile.png",
        [("kalori", (255,122,0,210)), ("makro", (18,216,255,210)), ("su", (24,224,163,210))],
        "BESLENME",
    ),
]

swift = ROOT / "marketing/scripts/make-mp4.swift"
video_specs = [
    ("premium-video-01-6-modul-tr.mp4", [cards[0], cards[1], cards[2]]),
    ("premium-video-02-antrenman-tr.mp4", [cards[1], cards[1], cards[0]]),
    ("premium-video-03-beslenme-tr.mp4", [cards[2], cards[2], cards[0]]),
]

for output, frames in video_specs:
    subprocess.run(["swift", str(swift), str(MP4 / output), *map(str, frames)], check=True)

print(f"Generated premium assets in {OUT}")
