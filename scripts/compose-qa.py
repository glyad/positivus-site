from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / "design-qa"

reference = Image.open(QA / "reference-mockup.webp").convert("RGB")
implementation = Image.open(QA / "desktop-1440.png").convert("RGB")

# The reference is a presentation collage. Its left panel is the 1440px source
# landing page scaled to roughly half size. Crop the matching first viewport.
reference_view = reference.crop((170, 159, 875, 600)).resize((720, 450), Image.Resampling.LANCZOS)
implementation_view = implementation.crop((0, 0, 1440, 900)).resize(
    (720, 450), Image.Resampling.LANCZOS
)

canvas = Image.new("RGB", (1464, 516), "#191A23")
canvas.paste(reference_view, (0, 66))
canvas.paste(implementation_view, (744, 66))

draw = ImageDraw.Draw(canvas)
try:
    font = ImageFont.truetype(str(ROOT / "assets/fonts/SpaceGrotesk-VariableFont_wght.ttf"), 25)
except OSError:
    font = ImageFont.load_default()

draw.text((24, 20), "REFERENCE", fill="#B9FF66", font=font)
draw.text((768, 20), "IMPLEMENTATION", fill="#B9FF66", font=font)

canvas.save(QA / "hero-comparison.jpg", quality=92, optimize=True)
