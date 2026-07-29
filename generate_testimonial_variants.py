from pathlib import Path
from PIL import Image

src_dir = Path('img')
pairs = [
    ('weathers-logo.png','weathers-logo'),
    ('breazy-logo.png','breazy-logo'),
    ('pestt.png','pestt')
]

sizes = [(80,80,'1x'), (160,160,'2x')]
for src_name, base in pairs:
    src = src_dir / src_name
    if not src.exists():
        print('missing', src)
        continue
    im = Image.open(src).convert('RGBA')
    for w,h,tag in sizes:
        out = src_dir / f"{base}-{tag}.png"
        im.resize((w,h), Image.LANCZOS).save(out)
        print('wrote', out)
print('done')
