from pathlib import Path
from PIL import Image
import os

img_dir = Path('img')
patterns = ['*_1x.png', '*-1x.png', '*-2x.png', 'logo.png', 'favicon-32.png']
# collect files
files = set()
for p in patterns:
    files.update(img_dir.glob(p))
files = sorted([f for f in files if f.is_file()])

def human(n):
    for unit in ['B','KB','MB','GB']:
        if n < 1024:
            return f"{n:.0f}{unit}"
        n /= 1024
    return f"{n:.1f}TB"

print('Found', len(files), 'PNG files to optimize')
summary = []
for f in files:
    orig = f.stat().st_size
    try:
        im = Image.open(f)
        # If image has alpha, composite on white to preserve look when reducing colors
        if im.mode == 'RGBA':
            bg = Image.new('RGBA', im.size, (255,255,255,255))
            im = Image.alpha_composite(bg, im).convert('RGB')
        elif im.mode not in ('RGB','P'):
            im = im.convert('RGB')

        # Try adaptive palette conversion which is broadly supported
        pal = im.convert('P', palette=Image.ADAPTIVE, colors=256)
        pal.save(f, optimize=True)
        new = f.stat().st_size
        summary.append((f.name, orig, new))
        print(f"Optimized {f.name}: {human(orig)} -> {human(new)}")
    except Exception as e:
        print('Failed', f.name, str(e))

# totals
orig_total = sum(o for _,o,_ in summary)
new_total = sum(n for _,_,n in summary)
print('\nTotal: {} -> {} (saved {} bytes)'.format(human(orig_total), human(new_total), human(orig_total-new_total)))
