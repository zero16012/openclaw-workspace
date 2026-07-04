import ezdxf
doc = ezdxf.readfile(r"C:\Users\zero\.openclaw\workspace\fridge_circuit\fridge_circuit_v3.dxf")
try:
    em = doc.header["$EXTMIN"]
    print("EXTMIN:", em)
except Exception as e:
    print("EXTMIN error:", e)
try:
    em = doc.header["$EXTMAX"]
    print("EXTMAX:", em)
except Exception as e:
    print("EXTMAX error:", e)

msp = doc.modelspace()
from collections import Counter
lc = Counter(e.dxf.layer for e in msp)
for l, c in lc.most_common():
    print(f"  {l}: {c}")
print(f"Total: {sum(lc.values())}")
