#!/usr/bin/env python3
"""
Generates the placeholder imagery in public/images (original, procedural artwork).
Replace these files with your own studio photography for production.

Requires: pip install pillow numpy
Usage:    python3 scripts/generate_placeholders.py
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'images')
os.makedirs(OUT, exist_ok=True)
EMBER = (255, 90, 31)


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def blur(arr, r):
    """Gaussian-blur a float array in [0,1] (HxW or HxWx3)."""
    a8 = (np.clip(arr, 0, 1) * 255).astype(np.uint8)
    im = Image.fromarray(a8)
    im = im.filter(ImageFilter.GaussianBlur(r))
    return np.asarray(im).astype(np.float32) / 255.0


def save(arr, name, quality=80):
    arr = np.clip(arr, 0, 1)
    im = Image.fromarray((arr * 255).astype(np.uint8))
    path = os.path.join(OUT, name)
    if name.endswith('.jpg'):
        im.save(path, 'JPEG', quality=86, optimize=True)
    else:
        im.save(path, 'WEBP', quality=quality, method=6)
    print('wrote', name, im.size, os.path.getsize(path) // 1024, 'KB')


def grid(w, h):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    return x / (w - 1), y / (h - 1)


def environment(X, Y, boxes):
    base = 0.04 + 0.22 * smooth(0.0, 1.0, 1 - Y)
    horizon = np.exp(-((Y - 0.56) / 0.025) ** 2) * 0.55
    val = base + horizon
    for cx, cy, bw, bh, inten in boxes:
        mx = 1 - smooth(bw * 0.8, bw, np.abs(X - cx))
        my = 1 - smooth(bh * 0.8, bh, np.abs(Y - cy))
        val = val + inten * mx * my
    return val


DEFAULT_BOXES = [(0.28, 0.22, 0.16, 0.06, 1.1), (0.72, 0.30, 0.10, 0.05, 0.9), (0.5, 0.78, 0.30, 0.03, 0.7)]


def paint(w, h, rgb, seed=1, boxes=None, phase=0.0, swirl=0.0, haze=0.0, accent=0.0):
    rng = np.random.default_rng(seed)
    X, Y = grid(w, h)
    Xw = X + 0.18 * np.sin(2.2 * Y + phase) + 0.35 * (Y - 0.5) ** 2
    Yw = Y + 0.10 * np.cos(2.0 * X + phase * 1.7) + 0.22 * (X - 0.5) ** 2
    val = environment(Xw, Yw, boxes or DEFAULT_BOXES)
    col = np.array(rgb, dtype=np.float32) / 255.0
    out = col[None, None, :] * (0.10 + 1.05 * val[..., None])
    spec = np.clip(val - 0.75, 0, 1.2)
    out = out + spec[..., None] * 0.9
    bloom = blur(np.repeat(np.clip(val - 0.7, 0, 1)[..., None], 3, axis=2), max(w, h) / 70)
    out = out + bloom * 0.5

    if swirl > 0:
        layer = Image.new('L', (w, h), 0)
        d = ImageDraw.Draw(layer)
        for _ in range(int(900 * (w * h) / (1600 * 1000))):
            cx, cy = rng.uniform(0, w), rng.uniform(0, h)
            r = rng.uniform(w * 0.01, w * 0.09)
            a0 = rng.uniform(0, 360)
            d.arc([cx - r, cy - r, cx + r, cy + r], a0, a0 + rng.uniform(60, 250), fill=int(rng.uniform(80, 255)), width=1)
        sw = np.asarray(layer.filter(ImageFilter.GaussianBlur(0.7))).astype(np.float32) / 255.0
        out = out + (sw * swirl * (0.25 + np.clip(val, 0, 1.2)))[..., None] * 0.55
    if haze > 0:
        out = out * (1 - haze) + 0.33 * haze

    if accent > 0:
        out[..., 0] += accent * 0.12 * smooth(0.6, 1.0, X) * smooth(0.4, 1.0, Y)
        out[..., 1] += accent * 0.03 * smooth(0.6, 1.0, X) * smooth(0.4, 1.0, Y)

    out = out + rng.normal(0, 0.010, size=out.shape).astype(np.float32)
    r2 = (X - 0.5) ** 2 + (Y - 0.5) ** 2
    out = out * (1 - 0.55 * smooth(0.05, 0.6, r2))[..., None]
    return np.clip(out, 0, 1)


def beads(arr, rng, count, rmin, rmax, region=(0, 1), tint=(1, 1, 1), strength=1.0):
    h, w, _ = arr.shape
    out = arr.copy()
    for _ in range(count):
        r = int(rng.uniform(rmin, rmax))
        cx = int(rng.uniform(r, w - r))
        cy = int(rng.uniform(region[0] * h + r, max(region[0] * h + r + 1, region[1] * h - r)))
        y0, y1, x0, x1 = max(cy - r, 0), min(cy + r, h), max(cx - r, 0), min(cx + r, w)
        yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
        dx, dy = (xx - cx) / r, (yy - cy) / r
        d = np.sqrt(dx * dx + dy * dy)
        inside = d < 1.0
        rim = smooth(0.55, 1.0, d) * inside
        light = np.clip(-(dx * 0.6 + dy * 0.8), 0, 1)
        hl = np.exp(-(((dx + 0.35) ** 2 + (dy + 0.4) ** 2) / 0.02)) * inside
        shade = (0.55 * rim * (0.4 + light) + 1.1 * hl) * strength
        patch = out[y0:y1, x0:x1]
        patch[inside] = patch[inside] * (1 - 0.35 * rim[inside][:, None]) + (shade[inside][:, None] * np.array(tint, dtype=np.float32))
        out[y0:y1, x0:x1] = patch
    return out


def leather(w, h, seed=4):
    rng = np.random.default_rng(seed)
    X, Y = grid(w, h)
    k = w / 10
    u, v = (X * w + Y * h) / k, (X * w - Y * h) / k
    quilt = (np.abs(np.sin(np.pi * u)) * np.abs(np.sin(np.pi * v))) ** 0.5
    pebble = blur(rng.random((h, w)).astype(np.float32), 1.4) * 1.0
    pebble = (pebble - pebble.mean()) * 6.0
    light = 0.25 + 0.55 * smooth(0, 1, 1 - X * 0.6 - Y * 0.3)
    base = np.array([0.075, 0.07, 0.075], dtype=np.float32)
    v_ = (0.35 + 0.8 * quilt) * light + pebble * 0.04
    out = base[None, None, :] * 1.0 + (np.clip(v_, 0, 2)[..., None] * 0.22)
    img = Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8))
    d = ImageDraw.Draw(img)
    # orange stitching along two seam lines
    for off in (0.18, 0.62):
        x_start, y_start = int(off * w), 0
        pts = []
        for t in np.linspace(0, 1, 60):
            pts.append((x_start + t * w * 0.5 + 12 * np.sin(t * 6), y_start + t * h))
        for i in range(0, len(pts) - 1, 2):
            d.line([pts[i], pts[i + 1]], fill=EMBER, width=max(3, w // 260))
    out = np.asarray(img).astype(np.float32) / 255.0
    X, Y = grid(w, h)
    r2 = (X - 0.5) ** 2 + (Y - 0.5) ** 2
    return np.clip(out * (1 - 0.5 * smooth(0.05, 0.55, r2))[..., None], 0, 1)


def foam(arr, seed=3, density=260):
    rng = np.random.default_rng(seed)
    return beads(arr, rng, density, arr.shape[1] * 0.012, arr.shape[1] * 0.07, region=(0.35, 1.0), tint=(0.9, 0.95, 1.0), strength=0.9)


def hexgrid(w, h, size, alpha=0.28):
    layer = Image.new('RGB', (w, h), (0, 0, 0))
    d = ImageDraw.Draw(layer)
    hh = size * np.sqrt(3) / 2
    row = 0
    y = -hh
    while y < h + hh:
        x = -size + (size * 1.5 if row % 2 else 0)
        while x < w + size:
            pts = [(x + size * np.cos(np.radians(a)), y + size * np.sin(np.radians(a))) for a in range(0, 360, 60)]
            t = (x / w + y / h) / 2
            c = tuple(int(a * (1 - t) + b * t) for a, b in zip((199, 203, 209), EMBER))
            d.polygon(pts, outline=c)
            x += size * 3
        y += hh
        row += 1
    return np.asarray(layer).astype(np.float32) / 255.0 * alpha


def film_peel(arr, seed=2):
    h, w, _ = arr.shape
    layer = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    poly = [(w * 0.32, 0), (w, 0), (w, h * 0.62), (w * 0.72, h * 0.46), (w * 0.5, h * 0.2)]
    d.polygon(poly, fill=(210, 225, 240, 46))
    d.line([(w * 0.32, 0), (w * 0.5, h * 0.2), (w * 0.72, h * 0.46), (w, h * 0.62)], fill=(255, 255, 255, 210), width=max(2, w // 300))
    shadow = Image.new('L', (w, h), 0)
    ImageDraw.Draw(shadow).polygon([(x + w * 0.02, y + h * 0.02) for x, y in poly[1:4]] + [(w, h * 0.66), (w * 0.72, h * 0.52)], fill=90)
    sh = np.asarray(shadow.filter(ImageFilter.GaussianBlur(w / 60))).astype(np.float32) / 255.0
    out = arr * (1 - sh[..., None] * 0.5)
    base = Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).convert('RGBA')
    base.alpha_composite(layer)
    return np.asarray(base.convert('RGB')).astype(np.float32) / 255.0


def target_marks(arr):
    h, w, _ = arr.shape
    im = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    cx, cy, r = w * 0.58, h * 0.45, w * 0.13
    lw = max(2, w // 320)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=EMBER, width=lw)
    d.line([cx - r * 1.5, cy, cx - r * 0.5, cy], fill=EMBER, width=lw)
    d.line([cx + r * 0.5, cy, cx + r * 1.5, cy], fill=EMBER, width=lw)
    d.line([cx, cy - r * 1.5, cx, cy - r * 0.5], fill=EMBER, width=lw)
    d.line([cx, cy + r * 0.5, cx, cy + r * 1.5], fill=EMBER, width=lw)
    return np.asarray(im).astype(np.float32) / 255.0


# ---------------------------------------------------------------- car silhouette


def bezier(p0, p1, p2, p3, n=40):
    t = np.linspace(0, 1, n)[:, None]
    p0, p1, p2, p3 = map(np.array, (p0, p1, p2, p3))
    return ((1 - t) ** 3) * p0 + 3 * ((1 - t) ** 2) * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3


def car_points():
    """Side-profile of a low sports coupe in unit space (x 0..1, y 0..1, y down)."""
    seg = [
        bezier((0.04, 0.70), (0.03, 0.62), (0.05, 0.55), (0.12, 0.52)),
        bezier((0.12, 0.52), (0.22, 0.49), (0.30, 0.47), (0.40, 0.38)),
        bezier((0.40, 0.38), (0.46, 0.32), (0.56, 0.31), (0.64, 0.36)),
        bezier((0.64, 0.36), (0.72, 0.44), (0.82, 0.50), (0.92, 0.56)),
        bezier((0.92, 0.56), (0.97, 0.60), (0.98, 0.66), (0.97, 0.70)),
    ]
    return np.vstack(seg)


def draw_car(w, h, scale=1.0, cx=0.5, base_y=0.78, fill=(22, 25, 31), rim=EMBER, ss=2):
    W, H = w * ss, h * ss
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cw = W * 0.82 * scale
    ch = cw * 0.40
    ox, oy = W * cx - cw / 2, H * base_y - ch * 0.72
    pts = [(ox + x * cw, oy + (y - 0.30) * ch / 0.45) for x, y in car_points()]
    floor_y = oy + (0.70 - 0.30) * ch / 0.45
    poly = pts + [(pts[-1][0], floor_y), (pts[0][0], floor_y)]
    d.polygon(poly, fill=fill + (255,))
    # roofline highlight
    hl = [(x, y) for (x, y) in pts[40:130]]
    d.line(hl, fill=(199, 203, 209, 170), width=max(2, int(W / 700)))
    d.line(pts[5:40], fill=(199, 203, 209, 90), width=max(2, int(W / 900)))
    # orange rim light along the shoulder
    d.line(pts[130:], fill=rim + (230,), width=max(2, int(W / 500)))
    # wheels
    wr = cw * 0.075
    for wx in (0.22, 0.80):
        x, y = ox + wx * cw, floor_y - wr * 0.1
        d.ellipse([x - wr * 1.18, y - wr * 1.18, x + wr * 1.18, y + wr * 1.18], fill=(4, 5, 6, 255))
        d.ellipse([x - wr, y - wr, x + wr, y + wr], fill=(14, 15, 18, 255), outline=(60, 64, 72, 255), width=max(2, int(W / 700)))
        d.ellipse([x - wr * 0.55, y - wr * 0.55, x + wr * 0.55, y + wr * 0.55], outline=(120, 126, 134, 255), width=max(2, int(W / 800)))
    # window
    win = [(ox + 0.41 * cw, oy + 0.075 * ch / 0.45 * 1.0 + (0.38 - 0.30) * ch / 0.45), ]
    d.polygon([(ox + 0.415 * cw, oy + (0.375 - 0.30) * ch / 0.45), (ox + 0.47 * cw, oy + (0.335 - 0.30) * ch / 0.45),
               (ox + 0.57 * cw, oy + (0.335 - 0.30) * ch / 0.45), (ox + 0.64 * cw, oy + (0.37 - 0.30) * ch / 0.45),
               (ox + 0.58 * cw, oy + (0.43 - 0.30) * ch / 0.45), (ox + 0.43 * cw, oy + (0.43 - 0.30) * ch / 0.45)], fill=(8, 10, 13, 255))
    im = im.resize((w, h), Image.LANCZOS)
    return im, (ox / ss, floor_y / ss, cw / ss)


def stage(w, h, with_car=True, seed=1):
    rng = np.random.default_rng(seed)
    X, Y = grid(w, h)
    bg = 0.03 + 0.11 * np.exp(-(((X - 0.55) / 0.5) ** 2 + ((Y - 0.55) / 0.35) ** 2))
    floor = smooth(0.74, 0.78, Y)
    bg = bg * (1 - 0.4 * floor) + 0.02 * floor
    rgb = np.stack([bg * 0.95, bg * 1.0, bg * 1.12], axis=-1)
    # back light strips
    for cx, wd, it in ((0.2, 0.012, 0.16), (0.82, 0.01, 0.12)):
        m = (1 - smooth(wd * 0.5, wd, np.abs(X - cx))) * smooth(0.0, 0.2, Y) * (1 - smooth(0.55, 0.75, Y))
        rgb += (blur(m, w / 120)[..., None] * it) * np.array([1.0, 1.0, 1.05])
    # warm accent glow behind the car
    glow = np.exp(-(((X - 0.52) / 0.28) ** 2 + ((Y - 0.7) / 0.06) ** 2))
    rgb += glow[..., None] * np.array([0.30, 0.10, 0.03]) * 0.8
    rgb += rng.normal(0, 0.006, rgb.shape).astype(np.float32)
    im = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8)).convert('RGBA')
    if with_car:
        car, (ox, fy, cw) = draw_car(w, h, scale=0.95)
        # reflection
        refl = car.transpose(Image.FLIP_TOP_BOTTOM)
        shift = int(fy * 2 - h)
        ref_layer = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        ref_layer.paste(refl, (0, int(fy * 2 - h + 6)))
        ra = np.asarray(ref_layer).astype(np.float32)
        yy = np.arange(h)[:, None]
        fade = np.clip(1 - (yy - fy) / (h * 0.16), 0, 1) * 0.22
        ra[..., 3] *= fade
        ref_layer = Image.fromarray(ra.astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
        im.alpha_composite(ref_layer)
        im.alpha_composite(car)
    return np.asarray(im.convert('RGB')).astype(np.float32) / 255.0


# ---------------------------------------------------------------- build everything


def main():
    # Hero fallback poster / OG
    save(stage(1600, 900, with_car=False), 'hero-poster.webp', 78)
    save(stage(1600, 900), 'hero-fallback.webp', 78)
    og = stage(1200, 630)
    im = Image.fromarray((np.clip(og, 0, 1) * 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    try:
        f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 58)
        f2 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 26)
        d.text((64, 64), 'VELOCITY', font=f, fill=(245, 245, 245))
        d.text((64, 132), 'AUTO DETAILING', font=f2, fill=(199, 203, 209))
        d.rectangle([64, 176, 144, 180], fill=EMBER)
    except OSError:
        pass
    im.save(os.path.join(OUT, '..', 'og-image.jpg'), 'JPEG', quality=86, optimize=True)
    print('wrote og-image.jpg')

    W, H = 800, 1000
    # Services
    ceramic = paint(W, H, (22, 52, 96), seed=11, phase=0.4)
    ceramic = beads(ceramic, np.random.default_rng(5), 170, 7, 34, strength=1.0)
    save(ceramic, 'service-ceramic.webp')
    ppf = film_peel(paint(W, H, (26, 28, 34), seed=12, phase=1.1, accent=0.4))
    save(ppf, 'service-ppf.webp')
    X, Y = grid(W, H)
    clean = paint(W, H, (120, 18, 24), seed=13, phase=0.8)
    dirty = paint(W, H, (120, 18, 24), seed=13, phase=0.8, swirl=1.0, haze=0.2)
    m = smooth(-0.03, 0.03, X + 0.28 * Y - 0.62)[..., None]
    save(dirty * (1 - m) + clean * m, 'service-correction.webp')
    save(leather(W, H), 'service-interior.webp')
    ext = foam(paint(W, H, (70, 78, 90), seed=15, phase=2.0), seed=7)
    save(ext, 'service-exterior.webp')
    gr = paint(W, H, (28, 30, 36), seed=16, phase=0.2, accent=0.8)
    gr = gr + hexgrid(W, H, 34)
    save(gr, 'service-graphene.webp')

    # Process
    PW, PH = 1000, 1250
    ins = target_marks(paint(PW, PH, (150, 154, 162), seed=21, phase=0.3, swirl=0.7, haze=0.1,
                             boxes=[(0.25, 0.3, 0.06, 0.5, 1.2), (0.75, 0.3, 0.06, 0.5, 1.2)]))
    save(ins, 'process-inspect.webp')
    save(foam(paint(PW, PH, (18, 20, 26), seed=22, phase=0.9), seed=8, density=420), 'process-clean.webp')
    X, Y = grid(PW, PH)
    c2 = paint(PW, PH, (18, 60, 120), seed=23, phase=0.5)
    d2 = paint(PW, PH, (18, 60, 120), seed=23, phase=0.5, swirl=1.0, haze=0.18)
    mm = smooth(-0.04, 0.04, X - 0.15 - 0.55 * Y * 0.0 - 0.35 * (1 - Y) * 0.0 - 0.0)[..., None]
    mm = smooth(-0.04, 0.04, Y - 0.5 + 0.3 * (X - 0.5))[..., None]
    save(d2 * (1 - mm) + c2 * mm, 'process-correct.webp')
    prot = beads(paint(PW, PH, (150, 18, 24), seed=24, phase=1.3), np.random.default_rng(9), 230, 8, 40)
    save(prot, 'process-protect.webp')
    save(paint(PW, PH, (255, 90, 31), seed=25, phase=0.2, accent=0.5,
               boxes=[(0.3, 0.2, 0.2, 0.05, 1.3), (0.7, 0.35, 0.12, 0.06, 1.0), (0.5, 0.8, 0.35, 0.03, 0.8)]), 'process-final.webp')

    # Before / after (same geometry, one treated)
    BW, BH = 1600, 1000
    boxes = [(0.22, 0.24, 0.18, 0.07, 1.2), (0.62, 0.20, 0.12, 0.06, 1.0), (0.84, 0.36, 0.07, 0.10, 0.9), (0.45, 0.78, 0.32, 0.03, 0.75)]
    save(paint(BW, BH, (16, 44, 98), seed=31, phase=0.6, boxes=boxes, swirl=1.25, haze=0.25), 'before.webp', 82)
    save(paint(BW, BH, (16, 44, 98), seed=31, phase=0.6, boxes=boxes), 'after.webp', 82)

    # Gallery
    palette = [(150, 14, 20), (170, 176, 188), (14, 14, 18), (18, 56, 150), (66, 70, 80), (255, 100, 40)]
    for i, col in enumerate(palette, start=1):
        g = paint(900, 1200, col, seed=40 + i, phase=i * 0.7,
                  boxes=[(0.2 + 0.1 * (i % 3), 0.22 + 0.04 * i % 5 * 0.1, 0.16, 0.06, 1.1), (0.7, 0.34, 0.10, 0.05, 0.9), (0.5, 0.8, 0.3, 0.03, 0.7)])
        save(g, f'gallery-{i}.webp', 78)

    # Final CTA backdrop
    CW, CH = 1800, 1100
    X, Y = grid(CW, CH)
    rng = np.random.default_rng(77)
    base = 0.035 + 0.05 * np.exp(-(((X - 0.5) / 0.6) ** 2 + ((Y - 0.55) / 0.35) ** 2))
    rgb = np.stack([base, base, base * 1.1], axis=-1)
    for k in range(9):
        y = 0.18 + k * 0.085 + rng.uniform(-0.01, 0.01)
        x0, x1 = rng.uniform(0.0, 0.4), rng.uniform(0.6, 1.0)
        streak = (1 - smooth(0.002, 0.006, np.abs(Y - y))) * smooth(x0, x0 + 0.15, X) * (1 - smooth(x1 - 0.15, x1, X))
        tint = np.array([1.0, 0.36, 0.12]) if k == 4 else np.array([0.78, 0.8, 0.84])
        rgb += blur(streak, 2)[..., None] * tint * (0.5 if k == 4 else 0.12)
    rgb += rng.normal(0, 0.006, rgb.shape).astype(np.float32)
    r2 = (X - 0.5) ** 2 + (Y - 0.5) ** 2
    rgb *= (1 - 0.6 * smooth(0.05, 0.5, r2))[..., None]
    save(rgb, 'cta-bg.webp', 76)


if __name__ == '__main__':
    main()
