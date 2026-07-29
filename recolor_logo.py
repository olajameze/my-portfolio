from pathlib import Path
from PIL import Image

path = Path('img/logo.png')
img = Image.open(path).convert('RGBA')
data = img.load()
button_blue = (37, 99, 235, 255)
changed = 0
for y in range(img.height):
    for x in range(img.width):
        r, g, b, a = data[x, y]
        if a > 0 and r >= 240 and g >= 240 and b >= 240:
            data[x, y] = button_blue
            changed += 1
img.save(path)
print(changed)
