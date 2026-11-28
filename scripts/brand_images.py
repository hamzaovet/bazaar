import os
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import arabic_reshaper
from bidi.algorithm import get_display

def reshape_ar(text):
    return get_display(arabic_reshaper.reshape(text))

def apply_bazaar_watermark(img_path, output_path):
    try:
        img = Image.open(img_path).convert("RGBA")
        w, h = img.size

        overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)

        # Scale elements relative to image resolution
        scale = w / 1000.0
        badge_w = int(360 * scale)
        badge_h = int(68 * scale)
        margin_right = int(30 * scale)
        margin_bottom = int(35 * scale)

        x1 = w - badge_w - margin_right
        y1 = h - badge_h - margin_bottom
        x2 = x1 + badge_w
        y2 = y1 + badge_h
        radius = int(16 * scale)

        # 1. Drop shadow behind badge
        shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        s_draw = ImageDraw.Draw(shadow)
        s_draw.rounded_rectangle([x1 - 3, y1 - 3, x2 + 3, y2 + 5], radius=radius + 2, fill=(0, 0, 0, 190))
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=int(6 * scale)))
        overlay = Image.alpha_composite(overlay, shadow)
        draw = ImageDraw.Draw(overlay)

        # 2. Luxury Dark Glass background
        draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, fill=(10, 10, 16, 230))

        # 3. Metallic Gold border
        draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, outline=(235, 185, 55, 255), width=max(2, int(2.2 * scale)))

        # 4. Fonts
        font_paths = [
            r"C:\Windows\Fonts\segoeui.ttf",
            r"C:\Windows\Fonts\tahoma.ttf",
            r"C:\Windows\Fonts\arial.ttf"
        ]
        font_large = None
        font_small = None
        for fp in font_paths:
            if os.path.exists(fp):
                try:
                    font_large = ImageFont.truetype(fp, int(20 * scale))
                    font_small = ImageFont.truetype(fp, int(11 * scale))
                    break
                except Exception:
                    pass
        if not font_large:
            font_large = ImageFont.load_default()
            font_small = ImageFont.load_default()

        # Shaped Arabic text
        ar_brand = reshape_ar("بازار كاجوال وير")
        text_main = f"BAZAAR  •  {ar_brand}"
        text_sub = "THE ROYAL STREETWEAR • VIP ORIGINAL"

        t1_bbox = draw.textbbox((0, 0), text_main, font=font_large)
        t1_w = t1_bbox[2] - t1_bbox[0]
        t1_x = x1 + (badge_w - t1_w) // 2
        t1_y = y1 + int(11 * scale)

        draw.text((t1_x, t1_y), text_main, fill=(255, 215, 0, 255), font=font_large)

        t2_bbox = draw.textbbox((0, 0), text_sub, font=font_small)
        t2_w = t2_bbox[2] - t2_bbox[0]
        t2_x = x1 + (badge_w - t2_w) // 2
        t2_y = y1 + int(38 * scale)

        draw.text((t2_x, t2_y), text_sub, fill=(225, 225, 235, 220), font=font_small)

        final_img = Image.alpha_composite(img, overlay).convert("RGB")
        final_img.save(output_path, "JPEG", quality=95)
        print(f"✓ Branded: {output_path}")
        return True
    except Exception as e:
        print(f"Error processing {img_path}: {e}")
        return False

def main():
    flow_dir = r"D:\Work\bazaar\LP\flow_outputs"
    branded_dir = r"D:\Work\bazaar\LP\branded"
    os.makedirs(flow_dir, exist_ok=True)
    os.makedirs(branded_dir, exist_ok=True)

    if len(sys.argv) > 1:
        target = sys.argv[1]
        if os.path.isfile(target):
            fname = os.path.basename(target)
            out = os.path.join(branded_dir, fname)
            apply_bazaar_watermark(target, out)
            return

    files = [f for f in os.listdir(flow_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    if not files:
        print(f"No files found in {flow_dir}. Drop your Google Flow images there!")
        return

    for f in files:
        src = os.path.join(flow_dir, f)
        base_name = os.path.splitext(f)[0]
        out = os.path.join(branded_dir, f"{base_name}.jpg")
        apply_bazaar_watermark(src, out)
    print(f"\n🎉 Done branding {len(files)} images into {branded_dir}")

if __name__ == "__main__":
    main()
