from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / "docs" / "design-qa"


def fit(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    copy = image.copy()
    copy.thumbnail(size, Image.Resampling.LANCZOS)
    return copy


def label(draw: ImageDraw.ImageDraw, point: tuple[int, int], value: str) -> None:
    draw.text(point, value, fill="#B9FF66", font=FONT)


try:
    FONT = ImageFont.truetype(
        str(ROOT / "sources/assets/fonts/SpaceGrotesk-VariableFont_wght.ttf"), 24
    )
except OSError:
    FONT = ImageFont.load_default()

reference = Image.open(QA / "auth-green-gateway-v2-reference.png").convert("RGB")
desktop = Image.open(QA / "auth-sign-up-desktop-en.jpg").convert("RGB")
desktop_rtl = Image.open(QA / "auth-sign-up-desktop-he.jpg").convert("RGB")
mobile = Image.open(QA / "auth-sign-in-mobile-en.jpg").convert("RGB")
mobile_rtl = Image.open(QA / "auth-sign-up-mobile-he.jpg").convert("RGB")

reference_view = fit(reference, (900, 590))
desktop_view = fit(desktop, (900, 590))
canvas = Image.new("RGB", (1840, 660), "#191A23")
canvas.paste(reference_view, (20, 54))
canvas.paste(desktop_view, (920, 54))
draw = ImageDraw.Draw(canvas)
label(draw, (20, 14), "APPROVED GREEN GATEWAY V2 BOARD")
label(draw, (920, 14), "BROWSER IMPLEMENTATION — ENGLISH")
canvas.save(QA / "auth-desktop-comparison.jpg", quality=92, optimize=True)

desktop_ltr_view = fit(desktop, (580, 414))
desktop_rtl_view = fit(desktop_rtl, (580, 414))
rtl_canvas = Image.new("RGB", (1200, 484), "#191A23")
rtl_canvas.paste(desktop_ltr_view, (20, 54))
rtl_canvas.paste(desktop_rtl_view, (600, 54))
rtl_draw = ImageDraw.Draw(rtl_canvas)
label(rtl_draw, (20, 14), "ENGLISH LTR")
label(rtl_draw, (600, 14), "HEBREW RTL")
rtl_canvas.save(QA / "auth-rtl-comparison.jpg", quality=92, optimize=True)

reference_mobile = reference.crop((10, 485, 370, 930)).resize(
    (420, 519), Image.Resampling.LANCZOS
)
mobile_view = fit(mobile, (375, 812))
mobile_rtl_view = fit(mobile_rtl, (375, 812))
mobile_canvas = Image.new("RGB", (1210, 882), "#191A23")
mobile_canvas.paste(reference_mobile, (20, 54))
mobile_canvas.paste(mobile_view, (440, 54))
mobile_canvas.paste(mobile_rtl_view, (815, 54))
mobile_draw = ImageDraw.Draw(mobile_canvas)
label(mobile_draw, (20, 14), "APPROVED MOBILE REFERENCES")
label(mobile_draw, (440, 14), "ENGLISH LTR")
label(mobile_draw, (815, 14), "HEBREW RTL")
mobile_canvas.save(QA / "auth-mobile-comparison.jpg", quality=92, optimize=True)

success_desktop = fit(
    Image.open(QA / "auth-success-desktop-en.jpg").convert("RGB"), (580, 414)
)
error_desktop = fit(
    Image.open(QA / "auth-error-desktop-en.jpg").convert("RGB"), (580, 414)
)
success_mobile_rtl = fit(
    Image.open(QA / "auth-success-mobile-he.jpg").convert("RGB"), (375, 812)
)
error_mobile_rtl = fit(
    Image.open(QA / "auth-error-mobile-he.jpg").convert("RGB"), (375, 812)
)
state_canvas = Image.new("RGB", (1950, 882), "#191A23")
state_canvas.paste(success_desktop, (20, 54))
state_canvas.paste(error_desktop, (600, 54))
state_canvas.paste(success_mobile_rtl, (1180, 54))
state_canvas.paste(error_mobile_rtl, (1555, 54))
state_draw = ImageDraw.Draw(state_canvas)
label(state_draw, (20, 14), "SUCCESS — ENGLISH DESKTOP")
label(state_draw, (600, 14), "ERROR — ENGLISH DESKTOP")
label(state_draw, (1180, 14), "SUCCESS — HEBREW MOBILE")
label(state_draw, (1555, 14), "ERROR — HEBREW MOBILE")
state_canvas.save(QA / "auth-state-comparison.jpg", quality=92, optimize=True)
