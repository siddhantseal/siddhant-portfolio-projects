from io import BytesIO
from pathlib import Path
from urllib.request import urlopen

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "media"
OUT.mkdir(parents=True, exist_ok=True)

ASSETS = [
    (
        "phone-demo.gif",
        "Nova X1 5G",
        "AMOLED display | Fast charging",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80",
    ),
    (
        "audio-demo.gif",
        "AirBeat Pro",
        "Noise control | 38-hour case",
        "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80",
    ),
    (
        "fashion-demo.gif",
        "Urban Fashion",
        "Jackets | Shirts | Bags",
        "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80",
    ),
    (
        "tablet-demo.gif",
        "TabPro 11",
        "Notes | Streaming | Study",
        "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=900&q=80",
    ),
]


def font(size: int, bold: bool = False):
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def load_image(url: str) -> Image.Image:
    with urlopen(url, timeout=20) as response:
        return Image.open(BytesIO(response.read())).convert("RGB")


def make_gif(filename: str, title: str, subtitle: str, url: str):
    base = load_image(url)
    frames = []
    width, height = 760, 430

    for index in range(18):
        scale = 1.0 + (index % 9) * 0.012
        frame = ImageOps.fit(base, (int(width * scale), int(height * scale)), method=Image.Resampling.LANCZOS)
        left = max(0, (frame.width - width) // 2)
        top = max(0, (frame.height - height) // 2)
        frame = frame.crop((left, top, left + width, top + height)).convert("RGBA")

        overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        draw.rectangle((0, height - 138, width, height), fill=(8, 17, 21, 185))
        progress = int((index + 1) / 18 * (width - 48))
        draw.rounded_rectangle((24, height - 32, 24 + progress, height - 22), radius=4, fill=(45, 212, 191, 240))
        draw.text((24, height - 112), title, font=font(34, True), fill=(255, 255, 255, 255))
        draw.text((24, height - 70), subtitle, font=font(19), fill=(222, 242, 241, 255))
        draw.ellipse((width - 84, 24, width - 28, 80), fill=(255, 255, 255, 230))
        draw.polygon([(width - 62, 42), (width - 62, 62), (width - 45, 52)], fill=(15, 32, 38, 255))

        frames.append(Image.alpha_composite(frame, overlay).convert("P", palette=Image.Palette.ADAPTIVE))

    frames[0].save(
        OUT / filename,
        save_all=True,
        append_images=frames[1:],
        duration=95,
        loop=0,
        optimize=True,
    )


def main():
    for item in ASSETS:
        make_gif(*item)


if __name__ == "__main__":
    main()
