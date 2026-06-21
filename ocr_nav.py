import numpy as np
from PIL import Image
import easyocr

img_path = r'C:\Users\zero\.openclaw\media\inbound\image---61661bbe-d8cc-416f-a3fe-0f71922b64b2.png'
img = Image.open(img_path)
arr = np.array(img)
print(f'Image size: {arr.shape}')

# Check if has alpha
if arr.shape[2] == 4:
    alpha = arr[:,:,3] > 0
    print(f'Non-transparent: {alpha.sum()} / {arr.shape[0]*arr.shape[1]}')
    visual = np.ones((arr.shape[0], arr.shape[1], 3), dtype=np.uint8) * 255
    visual[alpha] = arr[:,:,:3][alpha]
else:
    visual = arr[:,:,:3]

Image.fromarray(visual).save(r'C:\Users\zero\.openclaw\workspace\nav_ref.png')
print('Saved nav_ref.png')
print()

reader = easyocr.Reader(['ch_sim', 'en'], gpu=False)
result = reader.readtext(img_path, detail=1, paragraph=False)

print('=== ALL OCR TEXT ===')
for bbox, text, conf in sorted(result, key=lambda x: (x[0][0][1], x[0][0][0])):
    x1, y1 = bbox[0]
    x2, y2 = bbox[2]
    cx = (x1 + x2) / 2
    cy = (y1 + y2) / 2
    print(f'  ({x1:.0f},{y1:.0f})-({x2:.0f},{y2:.0f}) Center:({cx:.0f},{cy:.0f}) Conf:{conf:.2f}  {text}')

print()
print('=== Structure analysis ===')
gray = np.mean(visual, axis=2)

# Find box borders
# Horizontal lines (many consecutive dark pixels)
print('Rows with significant horizontal lines:')
for y in range(arr.shape[0]):
    row = gray[y, :]
    dark = (row < 100).sum()
    if dark > 50:
        print(f'  Row {y}: {dark} dark px')

print()
print('Cols with significant vertical lines:')
for x in range(arr.shape[1]):
    col = gray[:, x]
    dark = (col < 100).sum()
    if dark > 50:
        print(f'  Col {x}: {dark} dark px')
