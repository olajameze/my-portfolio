from pathlib import Path
from PIL import Image

src = Path('img/logo.png')
if not src.exists():
    raise SystemExit('img/logo.png not found')

img = Image.open(src).convert('RGBA')
# Make a 32x32 PNG
png32 = img.copy()
png32 = png32.resize((32,32), Image.LANCZOS)
png32.save('img/favicon-32.png')
# Create ICO with multiple sizes
sizes = [(16,16),(32,32),(48,48)]
icons = [img.copy().resize(s, Image.LANCZOS) for s in sizes]
icons[0].save('img/favicon.ico', format='ICO', sizes=sizes)
print('Created img/favicon-32.png and img/favicon.ico')
