from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / "docs" / "design-qa"

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
    font = ImageFont.truetype(
        str(ROOT / "sources/assets/fonts/SpaceGrotesk-VariableFont_wght.ttf"), 25
    )
except OSError:
    font = ImageFont.load_default()

draw.text((24, 20), "REFERENCE", fill="#B9FF66", font=font)
draw.text((768, 20), "IMPLEMENTATION", fill="#B9FF66", font=font)

canvas.save(QA / "hero-comparison.jpg", quality=92, optimize=True)

hebrew_implementation = Image.open(QA / "hebrew-desktop-1440.png").convert("RGB")
hebrew_view = hebrew_implementation.crop((0, 0, 1440, 900)).resize(
    (480, 300), Image.Resampling.LANCZOS
)

rtl_canvas = Image.new("RGB", (1488, 364), "#191A23")
rtl_canvas.paste(reference_view.resize((480, 300), Image.Resampling.LANCZOS), (0, 64))
rtl_canvas.paste(implementation_view.resize((480, 300), Image.Resampling.LANCZOS), (504, 64))
rtl_canvas.paste(hebrew_view, (1008, 64))

rtl_draw = ImageDraw.Draw(rtl_canvas)
rtl_draw.text((18, 18), "REFERENCE", fill="#B9FF66", font=font)
rtl_draw.text((522, 18), "ENGLISH", fill="#B9FF66", font=font)
rtl_draw.text((1026, 18), "HEBREW RTL", fill="#B9FF66", font=font)
rtl_canvas.save(QA / "rtl-comparison.jpg", quality=92, optimize=True)

contact_before = Image.open(QA / "hebrew-contact-1440.png").convert("RGB")
contact_after = Image.open(QA / "hebrew-contact-rtl-fixed.png").convert("RGB")
contact_before_view = contact_before.resize((720, 450), Image.Resampling.LANCZOS)
contact_after_view = contact_after.crop((80, 0, 1520, 900)).resize(
    (720, 450), Image.Resampling.LANCZOS
)

contact_canvas = Image.new("RGB", (1464, 516), "#191A23")
contact_canvas.paste(contact_before_view, (0, 66))
contact_canvas.paste(contact_after_view, (744, 66))

contact_draw = ImageDraw.Draw(contact_canvas)
contact_draw.text((24, 20), "BEFORE: CLIPPED", fill="#B9FF66", font=font)
contact_draw.text((768, 20), "AFTER: MIRRORED", fill="#B9FF66", font=font)
contact_canvas.save(QA / "contact-rtl-fix-comparison.jpg", quality=92, optimize=True)
