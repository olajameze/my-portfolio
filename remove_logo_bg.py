from PIL import Image
from pathlib import Path

img_path = Path('img') / 'logo.png'
backup_path = Path('img') / 'logo.backup.png'
transparent_path = Path('img') / 'logo-transparent.png'

if not img_path.exists():
    print('logo not found at', img_path)
    raise SystemExit(1)

im = Image.open(img_path).convert('RGBA')
# backup original once
if not backup_path.exists():
    im.save(backup_path)
    print('backup saved to', backup_path)

pixels = im.getdata()
new_data = []
fade_start = 250.0
fade_end = 255.0
for r,g,b,a in pixels:
    # work with premultiplied alpha not needed; assume existing alpha is 255
    avg = (r+g+b)/3.0
    if avg >= fade_end:
        new_alpha = 0
    elif avg <= fade_start:
        new_alpha = a
    else:
        # linear fade between fade_start..fade_end
        new_alpha = int(a * (fade_end - avg) / (fade_end - fade_start))
    new_data.append((r,g,b,new_alpha))

im.putdata(new_data)
# save transparent copy and overwrite original
im.save(transparent_path)
im.save(img_path)
print('Saved transparent logo to', transparent_path, 'and updated', img_path)
