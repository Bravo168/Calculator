from PIL import Image, ImageDraw

BG = (17, 24, 39, 255)      # #111827
FG = (245, 158, 11, 255)    # #f59e0b


def draw_equals(draw, size, scale=1.0):
    bar_w = size * 0.46 * scale
    bar_h = size * 0.08 * scale
    x = (size - bar_w) / 2
    gap = size * 0.10 * scale
    cy = size / 2
    r = bar_h / 2
    for cy_off in (-gap / 2 - bar_h / 2, gap / 2 + bar_h / 2):
        y = cy + cy_off
        draw.rounded_rectangle(
            [x, y - bar_h / 2, x + bar_w, y + bar_h / 2], radius=r, fill=FG
        )


def make_icon(path, size, maskable=False):
    img = Image.new("RGBA", (size, size), BG)
    draw = ImageDraw.Draw(img)
    scale = 0.6 if maskable else 1.0
    draw_equals(draw, size, scale)
    img.save(path)


make_icon("icon-192.png", 192)
make_icon("icon-512.png", 512)
make_icon("icon-maskable-192.png", 192, maskable=True)
make_icon("icon-maskable-512.png", 512, maskable=True)
print("done")
