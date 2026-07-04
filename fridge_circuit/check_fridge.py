import ezdxf
d = ezdxf.readfile(r"C:\Users\zero\.openclaw\workspace\fridge_circuit\fridge.dxf")
print("OK - entities:", len(list(d.modelspace())))
em = d.header.get("$EXTMIN")
print("ExtMin:", em)
em = d.header.get("$EXTMAX")
print("ExtMax:", em)

# Count per layer
from collections import Counter
lc = Counter(e.dxf.layer for e in d.modelspace())
for l, c in lc.most_common():
    print(f"  {l}: {c}")
