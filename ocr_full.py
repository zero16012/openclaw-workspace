import numpy as np
from PIL import Image
import easyocr

reader = easyocr.Reader(['ch_sim', 'en'], gpu=False)

# Get full OCR with all text
result = reader.readtext(r'C:\Users\zero\.openclaw\media\inbound\image---b0a18908-b890-41bc-b8c0-4ca0f29c278b.png', detail=1, paragraph=False)

print('=== FULL OCR RESULTS sorted by position ===')
for bbox, text, conf in sorted(result, key=lambda x: (x[0][0][1], x[0][0][0])):
    x1, y1 = bbox[0]
    x2, y2 = bbox[2]
    cx = (x1 + x2) / 2
    cy = (y1 + y2) / 2
    w = x2 - x1
    h = y2 - y1
    print(f'  [({x1:.0f},{y1:.0f})-({x2:.0f},{y2:.0f}) w={w}h={h}] Center:({cx:.0f},{cy:.0f}) Conf:{conf:.2f}  {text}')
