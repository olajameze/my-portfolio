from pathlib import Path
from PIL import Image

imgs = [
    Path("img/weathers'.png"),
    Path('img/breazy.png'),
    Path('img/pestt.png')
]

out = Path('img')
# safe name function
def safe_name(p):
    s = p.stem
    s = ''.join(ch for ch in s if ch.isalnum() or ch in ('-','_'))
    return s

sizes = [(80,80,'1x'), (160,160,'2x')]
for p in imgs:
    if not p.exists():
        print('missing', p)
        continue
    base = safe_name(p)
    im = Image.open(p).convert('RGBA')
    for w,h,tag in sizes:
        outp = out / f"{base}-{tag}.png"
        im.resize((w,h), Image.LANCZOS).save(outp)
        print('wrote', outp)
print('done')
