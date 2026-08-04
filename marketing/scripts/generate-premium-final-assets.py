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
    f = font(28)
    tw = draw.textbbox((0, 0), text, font=f)[2]
    draw.rounded_rectangle((x, y, x + tw + 48, y + 58), radius=29, fill=(13, 22, 39, 215), outline=color, width=2)
    draw.text((x + 24, y + 13), text, font=f, fill=(238, 246, 255, 255))
    return x + tw + 66

def make_card(name, title, subtitle, screen, chips, badge):
    bg = cover(Image.open(BG), (W, H)).convert("RGBA")
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rectangle((0, 0, W, H), fill=(0, 0, 0, 38))
    od.rectangle((0, 0, W, 620), fill=(0, 0, 0, 52))
    bg.alpha_composite(overlay)
    draw = ImageDraw.Draw(bg)

    draw.text((64, 98), "FULL", font=font(42), fill=(255, 122, 0, 255))
    draw.text((183, 98), "BALANCE", font=font(42), fill=(170, 205, 222, 255))
    draw.rounded_rectangle((780, 74, 1018, 132), radius=29, fill=(35, 35, 30, 160), outline=(255, 122, 0, 180), width=2)
    draw.text((900 - draw.textbbox((0,0), badge, font=font(23))[2] // 2, 92), badge, font=font(23), fill=(255, 220, 180, 255))

    draw_wrapped(draw, title, (64, 210), 850, font(76), (250, 252, 255, 255), 4)
    draw_wrapped(draw, subtitle, (64, 405), 780, font(35), (194, 204, 222, 255), 8)

    paste_phone(bg, SRC / screen, 570, 560, 405, 878)

    x = 64
    for text, color in chips:
        x = chip(draw, text, x, 1500, color)

    draw.rounded_rectangle((64, 1738, 1016, 1846), radius=30, fill=(255, 86, 0, 255))
    cta = "Ücretsiz başla · fullbalance.app"
    draw.text((540 - draw.textbbox((0,0), cta, font=font(38))[2] // 2, 1773), cta, font=font(38), fill=(255,255,255,255))

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
