"""Sample the supplied artwork; never redraw its Georgian lettering.

Requires Pillow. Run from the repository root after updating source-logo.png.
The crop excludes the white frame and the entire lower Credo lockup.
"""
from pathlib import Path
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/assets/dayavi'
SOURCE = ASSETS / 'source-logo.png'
CROP = (9, 9, 439, 148)
GRID_WIDTH = 240
COLORS = ['#1f3d75', '#f0442f']
DOT = .83


def generate():
    source = Image.open(SOURCE).convert('RGBA')
    mark = source.crop(CROP)
    mark.save(ASSETS / 'dayavi-mark.png')
    height = round(GRID_WIDTH * mark.height / mark.width)
    sampled = mark.resize((GRID_WIDTH, height), Image.Resampling.LANCZOS)
    tones, eligible, roles = [], [], []
    for y in range(height):
        for x in range(GRID_WIDTH):
            r, g, b, a = sampled.getpixel((x, y))
            ink = (1 - (r + g + b) / 765) * a / 255
            valid = ink > .08
            # Compress the flat source's tones into an airy but readable field.
            # A small directional light variation avoids a uniform dot carpet.
            shade = .94 + .06 * (x / GRID_WIDTH * .4 + y / height * .6)
            tones.append((ink ** .22) * .92 * shade if valid else 0)
            eligible.append(valid)
            roles.append(1 if r > b * 1.2 and r > 135 else 0)

    errors = [0.0] * len(tones)
    grouped = [[], []]
    for y in range(height):
        direction = 1 if y % 2 == 0 else -1
        xs = range(GRID_WIDTH) if direction == 1 else range(GRID_WIDTH - 1, -1, -1)
        for x in xs:
            i = y * GRID_WIDTH + x
            if not eligible[i]:
                continue  # Keep the source's white letter counters completely open.
            value = max(0, min(1, tones[i] + errors[i]))
            on = value >= .5
            if on:
                grouped[roles[i]].extend([x, y])
            error = value - int(on)
            for dx, dy, weight in [(direction, 0, 7/16), (-direction, 1, 3/16), (0, 1, 5/16), (direction, 1, 1/16)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < GRID_WIDTH and ny < height:
                    j = ny * GRID_WIDTH + nx
                    if eligible[j]:
                        errors[j] += error * weight

    data = {
        'version': 2, 'width': GRID_WIDTH, 'height': height,
        'sourceCrop': list(CROP), 'sourceSize': list(source.size),
        'sourceSHA256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        'algorithm': 'serpentine-floyd-steinberg', 'dotScale': DOT,
        'colors': COLORS, 'groups': grouped,
    }
    (ASSETS / 'dayavi-dither-v2.json').write_text(json.dumps(data, separators=(',', ':')))
    paths = []
    for color, group in zip(COLORS, grouped):
        commands = []
        for x, y in zip(group[::2], group[1::2]):
            left, top = x + (1 - DOT) / 2, y + (1 - DOT) / 2
            commands.append(f'M{left:.3f} {top:.3f}h{DOT}v{DOT}h-{DOT}z')
        paths.append(f'<path fill="{color}" d="{"".join(commands)}"/>')
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {GRID_WIDTH} {height}"><g opacity=".95">{"".join(paths)}</g></svg>'
    (ASSETS / 'dayavi-dither-v2.svg').write_text(svg)
    counts = [len(group) // 2 for group in grouped]
    assert sum(counts) > 7000 and all(n > 1000 for n in counts)
    assert all(0 <= y < height for group in grouped for y in group[1::2])
    print(json.dumps({'grid': [GRID_WIDTH, height], 'count': sum(counts), 'groups': counts, 'crop': CROP}))


if __name__ == '__main__':
    generate()
