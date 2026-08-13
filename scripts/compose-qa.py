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

header_reference = Image.open(QA / "header-actions-reference.png").convert("RGB")
header_desktop_en = Image.open(QA / "header-actions-desktop-en.jpg").convert("RGB")
header_desktop_he = Image.open(QA / "header-actions-desktop-he.jpg").convert("RGB")

header_reference_view = header_reference.resize((720, 204), Image.Resampling.LANCZOS)
header_desktop_en_view = header_desktop_en.crop((994, 43, 1431, 145)).resize(
    (720, 168), Image.Resampling.LANCZOS
)
header_desktop_he_view = header_desktop_he.crop((150, 43, 592, 145)).resize(
    (720, 166), Image.Resampling.LANCZOS
)

header_canvas = Image.new("RGB", (2240, 306), "#191A23")
header_canvas.paste(header_reference_view, (20, 82))
header_canvas.paste(header_desktop_en_view, (760, 100))
header_canvas.paste(header_desktop_he_view, (1500, 101))
header_draw = ImageDraw.Draw(header_canvas)
header_draw.text((20, 22), "BEFORE: MIXED CONTROL STYLES", fill="#B9FF66", font=font)
header_draw.text((760, 22), "AFTER: ENGLISH LTR", fill="#B9FF66", font=font)
header_draw.text((1500, 22), "AFTER: HEBREW RTL", fill="#B9FF66", font=font)
header_canvas.save(QA / "header-actions-comparison.jpg", quality=92, optimize=True)

header_mobile_en = Image.open(QA / "header-actions-mobile-en.jpg").convert("RGB")
header_mobile_he = Image.open(QA / "header-actions-mobile-he.jpg").convert("RGB")
header_mobile_en_view = header_mobile_en.resize((292, 633), Image.Resampling.LANCZOS)
header_mobile_he_view = header_mobile_he.resize((292, 633), Image.Resampling.LANCZOS)

header_mobile_canvas = Image.new("RGB", (624, 703), "#191A23")
header_mobile_canvas.paste(header_mobile_en_view, (20, 54))
header_mobile_canvas.paste(header_mobile_he_view, (312, 54))
header_mobile_draw = ImageDraw.Draw(header_mobile_canvas)
header_mobile_draw.text((20, 14), "ENGLISH MOBILE", fill="#B9FF66", font=font)
header_mobile_draw.text((312, 14), "HEBREW MOBILE", fill="#B9FF66", font=font)
header_mobile_canvas.save(
    QA / "header-actions-mobile-comparison.jpg", quality=92, optimize=True
)
