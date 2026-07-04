#!/usr/bin/env python3
"""
Generate a clean DXF for the refrigerator electrical circuit diagram.
Manually written DXF format for full control.
"""
import os

# Helper to build DXF manually
def header_block():
    return """  0
SECTION
  2
HEADER
  9
$ACADVER
  1
AC1015
  9
$DWGCODEPAGE
  3
UTF-8
  9
$EXTMIN
 10
0.0
 20
0.0
 30
0.0
  9
$EXTMAX
 10
450.0
 20
280.0
 30
0.0
  9
$LIMMIN
 10
0.0
 20
0.0
  9
$LIMMAX
 10
450.0
 20
280.0
  0
ENDSEC
"""

def tables_block():
    return """  0
SECTION
  2
TABLES
  0
TABLE
  2
LTYPE
 70
4
  0
LTYPE
  2
CONTINUOUS
 70
0
  3
Solid line
 72
65
 73
0
 40
0.0
  0
LTYPE
  2
DASHED
 70
0
  3
Dashed __ __ __
 72
65
 73
2
 40
12.0
 49
6.0
 49
-6.0
  0
ENDTAB
  0
TABLE
  2
LAYER
 70
6
  0
LAYER
  2
0
 70
0
 62
7
  6
CONTINUOUS
  0
LAYER
  2
WIRES
 70
0
 62
7
  6
CONTINUOUS
  0
LAYER
  2
TEXT
 70
0
 62
3
  6
CONTINUOUS
  0
LAYER
  2
DASHBOX
 70
0
 62
5
  6
DASHED
  0
LAYER
  2
SYMBOL
 70
0
 62
1
  6
CONTINUOUS
  0
LAYER
  2
GROUND
 70
0
 62
2
  6
CONTINUOUS
  0
ENDTAB
  0
TABLE
  2
STYLE
 70
1
  0
STYLE
  2
Standard
 70
0
 40
0.0
 41
1.0
 50
0.0
 71
0
 42
3.0
  3
TXT
  4

  0
ENDTAB
  0
ENDSEC
"""

def line(x1, y1, x2, y2, layer):
    return f"""  0
LINE
  8
{layer}
100
AcDbEntity
100
AcDbLine
 10
{x1}
 20
{y1}
 30
0.0
 11
{x2}
 21
{y2}
 31
0.0
"""

def circle(cx, cy, r, layer):
    return f"""  0
CIRCLE
  8
{layer}
100
AcDbEntity
100
AcDbCircle
 10
{cx}
 20
{cy}
 30
0.0
 40
{r}
"""

def text(x, y, txt, h, layer):
    return f"""  0
TEXT
  8
{layer}
100
AcDbEntity
100
AcDbText
 10
{x}
 20
{y}
 30
0.0
 40
{h}
  1
{txt}
"""

def lwpline(pts, layer, closed=1):
    """pts: list of (x,y) tuples"""
    n = len(pts)
    ret = f"""  0
LWPOLYLINE
  8
{layer}
100
AcDbEntity
100
AcDbPolyline
 90
{n}
 70
{closed}
"""
    for x, y in pts:
        ret += f""" 10
{x}
 20
{y}
"""
    return ret


def build():
    e = ""
    TS = 3.5
    TS_S = 2.8
    TS_L = 5.0

    # Helper decorators
    def W(x1, y1, x2, y2):
        nonlocal e; e += line(x1, y1, x2, y2, "WIRES")
    def S(x1, y1, x2, y2):
        nonlocal e; e += line(x1, y1, x2, y2, "SYMBOL")
    def T(x, y, t, h=TS):
        nonlocal e; e += text(x, y, t, h, "TEXT")
    def C(cx, cy, r):
        nonlocal e; e += circle(cx, cy, r, "SYMBOL")
    def DR(x1, y1, x2, y2):
        nonlocal e; e += lwpline([(x1,y1),(x2,y1),(x2,y2),(x1,y2),(x1,y1)], "DASHBOX", 0)
    def res(cx, cy, w=12):
        """Zigzag resistor"""
        pts = []
        half = w/2
        sw = w/4
        for i in range(5):
            pts.append((cx - half + i*sw, cy + (half if i%2==0 else -half)))
        nonlocal e; e += lwpline(pts, "SYMBOL", 0)
    def bulb(cx, cy, r=8):
        C(cx, cy, r)
        d = r * 0.7
        S(cx-d, cy-d, cx+d, cy+d)
        S(cx-d, cy+d, cx+d, cy-d)
    def tsw(x, y, up=True):
        S(x, y-6, x, y+6)
        if up:
            S(x, y+6, x+8, y+6-8)
        else:
            S(x, y-6, x+8, y-6+8)
    def gnd(x, y):
        S(x, y, x, y-8)
        S(x-6, y-8, x+6, y-8)
        S(x-4, y-11, x+4, y-11)
        S(x-2, y-14, x+2, y-14)
    def plug(x, y):
        S(x, y-6, x, y+6)
        S(x, y-6, x-10, y-6)
        S(x, y+6, x-10, y+6)
    def cap(x, y):
        S(x-5, y+3, x+5, y+3)
        S(x-5, y-3, x+5, y-3)

    # ===== DRAWING =====
    # Rails
    W(0, 240, 420, 240)
    W(0, 30, 420, 30)

    # Plug
    plug(30, 140)
    T(15, 155, "~220V", TS)
    W(30, 134, 30, 240)
    W(30, 146, 30, 30)
    gnd(30, 22)
    W(30, 22, 30, 30)

    # Light
    W(85, 240, 85, 210)
    tsw(85, 205, True)
    T(65, 198, "灯开关", TS)
    W(85, 199, 85, 150)
    bulb(85, 135, 9)
    T(95, 125, "EL", TS)
    W(85, 126, 85, 30)

    # DS + SB2 + D
    W(130, 240, 130, 210)
    res(130, 195, 14)
    T(146, 190, "DS加热器", TS_S)
    W(130, 186, 130, 180)
    tsw(130, 175, True)
    T(146, 172, "SB2", TS)
    W(130, 169, 130, 120)
    res(130, 105, 14)
    T(146, 100, "D加热器", TS_S)
    W(130, 96, 130, 30)

    # Defrost
    DR(185, 160, 260, 230)
    T(190, 232, "化霜开关板", TS)
    W(195, 240, 195, 230)

    # Contacts inside defrost box
    W(195, 225, 205, 225)
    S(205, 225, 213, 217)
    W(213, 217, 225, 217)
    W(225, 217, 225, 225)
    W(225, 225, 235, 225)

    W(195, 195, 205, 195)
    S(205, 195, 213, 187)
    W(213, 187, 225, 187)
    W(225, 187, 225, 195)
    W(225, 195, 235, 195)

    W(195, 175, 205, 175)
    S(205, 175, 213, 167)
    W(213, 167, 225, 167)
    W(225, 167, 225, 175)

    W(210, 160, 210, 145)

    # SB1
    tsw(210, 138, True)
    T(183, 132, "防霜加热器开关", TS_S)
    T(188, 126, "SB1", TS)
    W(210, 132, 210, 105)

    # Defrost heater
    res(210, 90, 14)
    T(226, 85, "防霜加热器", TS_S)
    W(210, 81, 210, 30)

    # IL
    W(250, 240, 250, 230)
    res(250, 215, 14)
    T(266, 210, "IL加热器", TS_S)
    W(250, 206, 250, 30)

    # RP
    W(285, 240, 285, 215)
    res(285, 200, 14)
    T(301, 195, "RP加热器", TS_S)
    W(285, 191, 285, 30)

    # Temp control
    DR(310, 170, 370, 230)
    T(315, 232, "温控器", TS)
    W(315, 240, 315, 230)

    W(315, 220, 325, 220)
    S(325, 220, 333, 212)
    W(333, 212, 345, 212)
    W(345, 212, 345, 220)
    W(345, 220, 360, 220)

    W(340, 170, 340, 155)

    T(295, 147, "启动过载保护继电器", TS_S)

    W(340, 145, 348, 145)
    S(348, 145, 354, 139)
    W(354, 139, 365, 139)
    W(365, 139, 365, 145)
    W(365, 145, 375, 145)
    W(375, 145, 375, 110)

    W(340, 145, 340, 110)

    cap(340, 97)
    T(350, 92, "C", TS)
    W(340, 100, 340, 110)
    W(340, 94, 340, 84)

    W(375, 240, 375, 110)

    C(375, 70, 20)
    T(365, 74, "M", TS_L)
    T(367, 58, "1~", TS)

    W(375, 110, 375, 90)
    W(340, 87, 375, 87)
    W(375, 87, 375, 90)
    W(375, 50, 375, 30)

    gnd(375, 44)
    W(375, 44, 375, 50)

    # Title
    T(155, 8, "图14-53  电冰箱电气线路图", TS_L)

    # Assemble DXF
    dxf = header_block()
    dxf += tables_block()
    dxf += "  0\nSECTION\n  2\nENTITIES\n"
    dxf += e
    dxf += "  0\nENDSEC\n  0\nEOF\n"
    return dxf


outpath = r"C:\Users\zero\.openclaw\workspace\fridge_circuit\fridge_circuit_v3.dxf"
content = build()
with open(outpath, "w", encoding="utf-8") as f:
    f.write(content)
print(f"Written: {outpath}")
print(f"Size: {os.path.getsize(outpath)} bytes")
print(f"Entities (text search): {content.count('LINE')} lines, {content.count('CIRCLE')} circles, {content.count('TEXT')} texts, {content.count('LWPOLYLINE')} polylines")
