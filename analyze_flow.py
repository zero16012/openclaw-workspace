from PIL import Image
import numpy as np

img = Image.open(r'C:\Users\zero\.openclaw\workspace\flowchart_visual.png')
arr = np.array(img)
gray = np.mean(arr, axis=2)

# Right column vertical edges
for x_check in [511, 744]:
    segs = []
    in_seg = False
    start = 0
    for y in range(gray.shape[0]):
        dark = gray[y, x_check] < 100
        if dark and not in_seg:
            start = y
            in_seg = True
        elif not dark and in_seg:
            segs.append((start, y-1))
            in_seg = False
    if in_seg:
        segs.append((start, gray.shape[0]-1))
    print(f'Col {x_check}: vertical segments: {segs}')

# Detailed pixel rows at connecting areas
print()
print('=== Detailed pixel rows at connecting areas ===')
for y in [112, 140, 182, 448, 476, 518]:
    row = gray[y, 350:520]
    dark_indices = np.where(row < 100)[0]
    if len(dark_indices) > 0:
        s = 350 + dark_indices[0]
        e = 350 + dark_indices[-1]
        print(f'Row {y}: dark at cols {s}-{e}')
        left_vals = [f"{gray[y,x]:.0f}" for x in range(s, min(s+8, e+1))]
        right_vals = [f"{gray[y,x]:.0f}" for x in range(max(s, e-7), e+1)]
        print(f'  Left: {left_vals}')
        print(f'  Right: {right_vals}')
    else:
        print(f'Row {y}: no dark pixels')

# Also check typical row content for arrow detection
# Arrow pattern: wide -> narrow indicates arrow direction
print()
print("=== Looking for arrow patterns in gap ===")
# The gap between left boxes (row 376) and right boxes (row 511) = 135px
# Arrow from left to right would go wide->narrow toward right side
# Check rows 112, 140, 182 in more detail
for y in [112, 140, 182, 448, 476, 518]:
    row = gray[y, 376:511]
    # Find all dark stretches
    dark = row < 100
    stretches = []
    start = None
    for x in range(len(dark)):
        if dark[x] and start is None:
            start = x
        elif not dark[x] and start is not None:
            stretches.append((start + 376, x - 1 + 376))
            start = None
    if start is not None:
        stretches.append((start + 376, len(dark) - 1 + 376))
    
    if stretches:
        for s, e in stretches:
            w = e - s + 1
            # Check gradient: if brighter on right = arrow pointing left
            # if brighter on left = arrow pointing right
            left_bright = np.mean(gray[y, s:min(s+5, e+1)])
            right_bright = np.mean(gray[y, max(s, e-4):e+1])
            print(f'Row {y}: stretch cols {s}-{e} (w={w}), L_bright={left_bright:.0f}, R_bright={right_bright:.0f}')
