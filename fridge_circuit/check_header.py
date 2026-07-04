import ezdxf
doc = ezdxf.new("AC1015")
doc.encoding = "utf-8"
doc.header["$EXTMIN"] = (0, 0, 0)
doc.header["$EXTMAX"] = (450, 280, 0)
doc.saveas(r"C:\Users\zero\.openclaw\workspace\fridge_circuit\test_header.dxf")

doc2 = ezdxf.readfile(r"C:\Users\zero\.openclaw\workspace\fridge_circuit\test_header.dxf")
print("Encoding after save:", doc2.encoding)
em = doc2.header.get("$EXTMIN")
print("EXTMIN:", em)
em2 = doc2.header.get("$EXTMAX")
print("EXTMAX:", em2)

# Look at raw DXF header
print("\nRaw DXF start:")
with open(r"C:\Users\zero\.openclaw\workspace\fridge_circuit\test_header.dxf", "rb") as f:
    data = f.read(2000)
print(data.decode("utf-8", errors="replace"))
