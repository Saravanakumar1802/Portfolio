"""Recolour and compress the Rocketbox Male_Adult_04 textures for the site.

    python scripts/avatar/textures.py <Textures dir> <out dir>

Restyles the outfit to match the profile photo (red shirt, cream trousers,
white sneakers) while keeping the fabric folds from the original maps, and
writes web-sized WebP files for build-avatar.mjs.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

SHIRT = np.array([0x9a, 0x22, 0x2b]) / 255  # red denim, from the photo
SHIRT_INNER = np.array([0x5c, 0x12, 0x18]) / 255
TROUSERS = np.array([0xe6, 0xdf, 0xd3]) / 255


def load(path):
    return np.asarray(Image.open(path).convert('RGB'), dtype=np.float32) / 255


def dilate(rgb, mask, passes=6):
    """Bleed island colours into the empty padding so seams and mipmaps
    never sample the black background."""
    from PIL import ImageFilter

    out = rgb.copy()
    filled = mask.astype(np.float32)
    for radius in (2, 4, 8, 16, 32, 64)[:passes]:
        weight = np.asarray(Image.fromarray((filled * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius)), np.float32) / 255
        colour = np.stack(
            [
                np.asarray(Image.fromarray((out[..., c] * filled * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius)), np.float32) / 255
                for c in range(3)
            ],
            -1,
        )
        grow = (filled < 0.5) & (weight > 0.02)
        out[grow] = colour[grow] / weight[grow][:, None]
        filled = np.maximum(filled, grow.astype(np.float32))
    return out


def save(array, path, size, quality=86, mode='RGB'):
    image = Image.fromarray((np.clip(array, 0, 1) * 255).astype(np.uint8), mode)
    image.resize((size, size), Image.LANCZOS).save(path, 'WEBP', quality=quality, method=6)
    print('wrote', path, f'{path.stat().st_size // 1024} KB')


def luminance(rgb):
    return rgb @ np.array([0.2126, 0.7152, 0.0722])


def colorize(rgb, mask, target, contrast):
    """Paint `target` into `mask`, keeping the original shading as detail."""
    lum = luminance(rgb)
    values = lum[mask]
    centre, spread = np.median(values), values.std() + 1e-4
    detail = np.clip((lum - centre) / spread, -2.5, 2.5)
    shaded = target[None, None, :] * (1 + contrast * detail)[..., None]
    out = rgb.copy()
    out[mask] = shaded[mask]
    return out


def hue_sat(rgb):
    mx, mn = rgb.max(-1), rgb.min(-1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    delta = np.maximum(mx - mn, 1e-6)
    hue = np.where(mx == r, (g - b) / delta % 6, np.where(mx == g, (b - r) / delta + 2, (r - g) / delta + 4)) * 60
    return hue, sat


def body(src, out):
    rgb = load(src / 'm006_body_color.tga')
    h, w, _ = rgb.shape
    v, u = np.mgrid[0:h, 0:w]
    u, v = u / w, v / h
    hue, sat = hue_sat(rgb)
    background = luminance(rgb) < 0.012

    trousers = ((u < 0.31) | (u > 0.69)) & (v < 0.43)
    hands = ((u < 0.25) | (u > 0.75)) & (v > 0.82)
    shoes = (v > 0.68) & (((u > 0.2) & (u < 0.355)) | ((u > 0.645) & (u < 0.8)))
    garment = ~(background | trousers | hands | shoes)
    tee = garment & (hue > 160) & (hue < 215) & (sat > 0.35)
    tee |= garment & (hue > 280) & (sat > 0.3)  # the tee's pink print
    # The light-grey hood (collar 'horns' and the unwrapped panel bottom-centre).
    hood = garment & ~tee & (sat < 0.18) & (luminance(rgb) > 0.22)
    shirt = garment & ~tee & ~hood

    rgb = colorize(rgb, shirt, SHIRT, 0.4)
    rgb = colorize(rgb, hood, SHIRT * 0.82, 0.3)
    rgb = colorize(rgb, tee, SHIRT_INNER, 0.25)
    # Diagonal twill + slub noise so the red reads as denim, not leather.
    rng = np.random.default_rng(7)
    twill = np.sin((u + v) * w * np.pi / 3.0) * 0.035 + rng.normal(0, 0.03, (h, w))
    cloth = shirt | hood
    rgb[cloth] *= (1 + twill[cloth])[:, None]
    rgb = colorize(rgb, trousers & ~background, TROUSERS, 0.12)
    # Sneakers: drop the magenta/cyan accents, keep them clean white.
    accent = shoes & (sat > 0.3)
    grey = luminance(rgb)[..., None].repeat(3, -1)
    rgb[accent] = np.clip(grey[accent] * 1.15 + 0.1, 0, 1)
    save(dilate(rgb, ~background), out / 'body_color.webp', 1024)

    save(load(src / 'm006_body_normal.tga'), out / 'body_normal.webp', 1024, quality=90)


def darken_hair(rgb, threshold=0.22, strength=0.55):
    """Pull dark, hair-like texels (hair, beard, brows) toward near-black."""
    lum = luminance(rgb)
    weight = np.clip((threshold - lum) / threshold * 3, 0, 1)[..., None]
    grey = lum[..., None].repeat(3, -1)
    target = (rgb * 0.45 + grey * 0.55) * strength
    return rgb * (1 - weight) + target * weight


def head(src, out):
    rgb = load(src / 'm006_head_color.tga')
    islands = luminance(rgb) > 0.01
    rgb = dilate(darken_hair(rgb), islands)
    save(rgb, out / 'head_color.webp', 2048, quality=88)
    hairiness = np.clip((0.22 - luminance(rgb)) / 0.22 * 3, 0, 1)
    save(load(src / 'm006_head_normal.tga'), out / 'head_normal.webp', 1024, quality=90)
    # glTF reads roughness from G (metalness from B): derive it from specular.
    spec = luminance(load(src / 'm006_head_specular.tga'))
    rough = np.clip(0.85 - spec * 0.7, 0.25, 0.9)
    rough = rough * (1 - hairiness) + 0.95 * hairiness  # hair and beard stay matte
    packed = np.stack([np.ones_like(rough), rough, np.zeros_like(rough)], -1)
    save(packed, out / 'head_rough.webp', 512)


def hair(src, out):
    rgba = np.asarray(Image.open(src / 'm006_opacity_color.tga').convert('RGBA'), dtype=np.float32) / 255
    alpha = rgba[..., 3]
    # Transparent texels are black; filtering would bleed that into strand
    # edges as a dark fringe. Fill them with the average strand colour.
    strands = alpha > 0.3
    rgba[..., :3] = darken_hair(rgba[..., :3], threshold=0.6, strength=0.6)
    rgba[~strands, :3] = rgba[strands, :3].mean(0)
    save(rgba, out / 'hair_color.webp', 1024, quality=88, mode='RGBA')


if __name__ == '__main__':
    src, out = Path(sys.argv[1]), Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    body(src, out)
    head(src, out)
    hair(src, out)
