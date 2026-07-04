with open(r"C:\Users\zero\.openclaw\workspace\fridge_circuit\fridge.dxf", "r") as f:
    d = f.read()
idx = d.find("$EXTMAX")
print("Around EXTMAX:")
print(repr(d[max(0,idx-40):idx+100]))
print()
print("Header area (first 500 chars):")
print(d[:500])
