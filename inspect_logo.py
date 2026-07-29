from pathlib import Path
from PIL import Image
from collections import Counter

path = Path('img/logo.png')
img = Image.open(path).convert('RGBA')
px = img.load()
counts = Counter()
for y in range(img.height):
    for x in range(img.width):
        counts[px[x, y]] += 1

print('size', img.size)
for color, count in counts.most_common(40):
    if color[3] != 0:
        print(color, count)
