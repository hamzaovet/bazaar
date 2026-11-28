import os
import shutil
import glob
from PIL import Image

src_dir = r"D:\Work\bazaar\LP\branded"
dest_dir = r"D:\Work\bazaar\public\products"
os.makedirs(dest_dir, exist_ok=True)

# Find all ghost mannequin / flow generated branded images
all_files = [f for f in os.listdir(src_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
ghost_files = [f for f in all_files if any(k in f.lower() for k in ['ghost', 'mannequin', 'jacket', 'luxury', 'leather'])]

print(f"Total files in branded: {len(all_files)}")
print(f"Flow Ghost Mannequin files: {len(ghost_files)}")

# Copy files with clean standardized names into public/products
copied = []
for i, f in enumerate(ghost_files, 1):
    src_path = os.path.join(src_dir, f)
    # create clean name
    clean_name = f"bazaar_jacket_{i:02d}.jpg"
    dest_path = os.path.join(dest_dir, clean_name)
    shutil.copy2(src_path, dest_path)
    copied.append(f"/products/{clean_name}")

print(f"✓ Copied {len(copied)} images to {dest_dir}")
