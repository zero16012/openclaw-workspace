import numpy as np
from PIL import Image, ImageDraw

img = Image.open(r'C:\Users\zero\.openclaw\media\inbound\image---8f88aa1e-d44e-4528-9cbf-a7baaf2710b3.png')
arr = np.array(img)
visual = np.ones((arr.shape[0], arr.shape[1], 3), dtype=np.uint8) * 255
if arr.shape[2] == 4:
    alpha = arr[:,:,3] > 0
    visual[alpha] = arr[:,:,:3][alpha]
else:
    visual = arr[:,:,:3]

gray = np.mean(visual, axis=2)
h, w = gray.shape
print(f'Image: {w}x{h}')

# Find the MAIN TRUNK LINE at col 126
# Check what's along this column
print('\n=== Main trunk line col 126-127 ===')
for y in range(h):
    if gray[y, 126] < 100 or gray[y, 127] < 100:
        # Find nearest horizontal lines around this y
        pass

# Find ALL horizontal connector stubs
print('\n=== Connector stubs (horizontal lines <=40px) ===')
for y in range(h):
    dark_cols = np.where(gray[y,:] < 100)[0]
    if len(dark_cols) > 0:
        stretches = []
        s = dark_cols[0]
        for i in range(1, len(dark_cols)):
            if dark_cols[i] - dark_cols[i-1] > 3:
                stretches.append((s, dark_cols[i-1]))
                s = dark_cols[i]
        stretches.append((s, dark_cols[-1]))
        for s, e in stretches:
            w_stretch = e - s + 1
            if 4 < w_stretch <= 80:
                print(f'  Row {y}: cols {s}-{e} (w={w_stretch})')

# Detailed analysis of connector structure
print('\n=== Gap area (cols 395-506) detail ===')
for y in [112, 140, 168, 182, 448, 476, 504, 518]:
    row = gray[y, 390:510]
    dark = np.where(row < 100)[0]
    if len(dark) > 0:
        s, e = 390+dark[0], 390+dark[-1]
        print(f'  Row {y}: dark cols {s}-{e}')

# Identify the gap vertical line
print('\n=== Gap vertical analysis (around col 443) ===')
for x in range(440, 450):
    col = gray[100:520, x]
    dark_count = (col < 100).sum()
    if dark_count > 0:
        dark_y = np.where(col < 100)[0] + 100
        print(f'  Col {x}: {dark_count} dark px, rows {dark_y[0]}-{dark_y[-1]}')

# Analyze left-of-box structure (col 126 left of boxes)
print('\n=== Left-of-box vertical line col 126 ===')
col = gray[40:510, 126]
dark_y = np.where(col < 100)[0] + 40
stretches = []
if len(dark_y) > 0:
    s = dark_y[0]
    for i in range(1, len(dark_y)):
        if dark_y[i] - dark_y[i-1] > 3:
            stretches.append((s, dark_y[i-1]))
            s = dark_y[i]
    stretches.append((s, dark_y[-1]))
    for s, e in stretches:
        print(f'  Stretch: rows {s}-{e} (h={e-s+1})')

# Print full cross-section at key rows
print('\n=== Key cross-sections ===')
for y in [42, 69, 83, 98, 112, 126, 140, 168, 182, 210, 224, 252, 294, 322, 336, 378, 406, 420, 448, 462, 476, 504, 518, 546]:
    row = gray[y, 120:760]
    dark = np.where(row < 100)[0]
    if len(dark) > 0:
        all_dark = sorted(120 + dark)
        print(f'  Row {y}: {all_dark}')
