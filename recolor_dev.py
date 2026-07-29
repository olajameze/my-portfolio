from pathlib import Path
from PIL import Image

path = Path('img/logo.png')
img = Image.open(path).convert('RGBA')
px = img.load()
width, height = img.size
button_blue = (37, 99, 235, 255)  # Tailwind blue-600 #2563eb
changed = 0

for y in range(height):
    for x in range(width):
        r,g,b,a = px[x,y]
        if a == 0:
            continue
        # perceived brightness
        brightness = 0.299*r + 0.587*g + 0.114*b
        # target very light pixels (likely white/near-white text)
        if brightness >= 200:
            px[x,y] = button_blue
            changed += 1

img.save(path)
print('changed_pixels:', changed)
