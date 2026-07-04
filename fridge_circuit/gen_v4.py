#!/usr/bin/env python3
# Generate DXF for refrigerator electrical circuit diagram.
# All Chinese chars encoded as U+XXXX Unicode sequences.

import os

# Chinese -> U+XXXX mapping (no backslash to avoid Python escape issues)
CHMAP = {
    "灯":"U+706F", "开":"U+5F00", "关":"U+5173",
    "加":"U+52A0", "热":"U+70ED", "器":"U+5668",
    "化":"U+5316", "霜":"U+971C", "板":"U+677F",
    "防":"U+9632", "接":"U+63A5", "地":"U+5730",
    "温":"U+6E29", "控":"U+63A7",
    "启":"U+542F", "动":"U+52A8", "过":"U+8FC7",
    "载":"U+8F7D", "保":"U+4FDD", "护":"U+62A4",
    "继":"U+7EE7", "电":"U+7535",
    "图":"U+56FE", "冰":"U+51B0", "箱":"U+7BB1",
    "气":"U+6C14", "线":"U+7EBF", "路":"U+8DEF",
}

def enc(s):
    """Replace Chinese chars with \\U+XXXX."""
    r = []
    for ch in s:
        if ch in C:
            r.append("\\" + C[ch])
        else:
            r.append(ch)
    return "".join(r)


def hdr():
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
ANSI_1252
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

def tbls():
    return """  0
SECTION
  2
TABLES
  0
TABLE
  2
LTYPE
  5
0
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
Dashed
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
  5
0
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
  5
0
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

TS = 3.5
TS_S = 2.8
TS_L = 5.0
e = ""

def L(x1,y1,x2,y2,lyr):
    global e
    sn = "AcDbLine" if lyr != "SYMBOL" else "AcDbLine"
    e += f"  0\nLINE\n  8\n{lyr}\n100\nAcDbEntity\n100\n{sn}\n 10\n{x1}\n 20\n{y1}\n 30\n0.0\n 11\n{x2}\n 21\n{y2}\n 31\n0.0\n"

def W(x1,y1,x2,y2): L(x1,y1,x2,y2,"WIRES")
def S(x1,y1,x2,y2): L(x1,y1,x2,y2,"SYMBOL")
def G(x1,y1,x2,y2): L(x1,y1,x2,y2,"GROUND")

def T(x,y,t,h=TS):
    global e
    t = enc(t)
    e += f"  0\nTEXT\n  8\nTEXT\n100\nAcDbEntity\n100\nAcDbText\n 10\n{x}\n 20\n{y}\n 30\n0.0\n 40\n{h}\n  1\n{t}\n"

def C(cx,cy,r):
    global e
    e += f"  0\nCIRCLE\n  8\nSYMBOL\n100\nAcDbEntity\n100\nAcDbCircle\n 10\n{cx}\n 20\n{cy}\n 30\n0.0\n 40\n{r}\n"

def DR(x1,y1,x2,y2):
    global e
    e += f"  0\nLWPOLYLINE\n  8\nDASHBOX\n100\nAcDbEntity\n100\nAcDbPolyline\n 90\n5\n 70\n0\n 10\n{x1}\n 20\n{y1}\n 10\n{x2}\n 20\n{y1}\n 10\n{x2}\n 20\n{y2}\n 10\n{x1}\n 20\n{y2}\n 10\n{x1}\n 20\n{y1}\n"

def RES(cx,cy,w=12):
    global e
    half = w/2
    sw = w/4
    pts = [(cx - half + i*sw, cy + (half if i%2==0 else -half)) for i in range(5)]
    pl = f"  0\nLWPOLYLINE\n  8\nSYMBOL\n100\nAcDbEntity\n100\nAcDbPolyline\n 90\n5\n 70\n0\n"
    for x,y in pts:
        pl += f" 10\n{x}\n 20\n{y}\n"
    e += pl

def tsw(x,y):
    S(x,y-6,x,y+6)
    S(x,y+6,x+8,y-2)

def gnd(x,y):
    G(x,y,x,y-8)
    G(x-6,y-8,x+6,y-8)
    G(x-4,y-11,x+4,y-11)
    G(x-2,y-14,x+2,y-14)

def plug(x,y):
    S(x,y-6,x,y+6)
    S(x,y-6,x-10,y-6)
    S(x,y+6,x-10,y+6)

def bulb(cx,cy,r=8):
    C(cx,cy,r)
    d=r*0.7
    S(cx-d,cy-d,cx+d,cy+d)
    S(cx-d,cy+d,cx+d,cy-d)

def cap(x,y):
    S(x-5,y+3,x+5,y+3)
    S(x-5,y-3,x+5,y-3)

# ===== DRAWING =====
W(0,240,420,240)
W(0,30,420,30)

plug(30,140)
T(15,155,"~220V",TS)
W(30,134,30,240)
W(30,146,30,30)
gnd(30,22)
W(30,22,30,30)

W(85,240,85,210)
tsw(85,205)
T(65,198,enc("灯开关"),TS)
W(85,199,85,150)
bulb(85,135,9)
T(95,125,"EL",TS)
W(85,126,85,30)

W(130,240,130,210)
RES(130,195,14)
T(146,190,enc("DS加热器"),TS_S)
W(130,186,130,180)
tsw(130,175)
T(146,172,"SB2",TS)
W(130,169,130,120)
RES(130,105,14)
T(146,100,enc("D加热器"),TS_S)
W(130,96,130,30)

DR(185,160,260,230)
T(190,232,enc("化霜开关板"),TS)
W(195,240,195,230)

W(195,225,205,225)
S(205,225,213,217)
W(213,217,225,217)
W(225,217,225,225)
W(225,225,235,225)

W(195,195,205,195)
S(205,195,213,187)
W(213,187,225,187)
W(225,187,225,195)
W(225,195,235,195)

W(195,175,205,175)
S(205,175,213,167)
W(213,167,225,167)
W(225,167,225,175)

W(210,160,210,145)

tsw(210,138)
T(183,132,enc("防霜加热器开关"),TS_S)
T(188,126,"SB1",TS)
W(210,132,210,105)

RES(210,90,14)
T(226,85,enc("防霜加热器"),TS_S)
W(210,81,210,30)

W(250,240,250,230)
RES(250,215,14)
T(266,210,enc("IL加热器"),TS_S)
W(250,206,250,30)

W(285,240,285,215)
RES(285,200,14)
T(301,195,enc("RP加热器"),TS_S)
W(285,191,285,30)

DR(310,170,370,230)
T(315,232,enc("温控器"),TS)

W(315,240,315,230)
W(315,220,325,220)
S(325,220,333,212)
W(333,212,345,212)
W(345,212,345,220)
W(345,220,360,220)
W(340,170,340,155)

T(295,147,enc("启动过载保护继电器"),TS_S)

W(340,145,348,145)
S(348,145,354,139)
W(354,139,365,139)
W(365,139,365,145)
W(365,145,375,145)
W(375,145,375,110)
W(340,145,340,110)

cap(340,97)
T(350,92,"C",TS)
W(340,100,340,110)
W(340,94,340,84)

W(375,240,375,110)
C(375,70,20)
T(365,74,"M",TS_L)
T(367,58,"1~",TS)
W(375,110,375,90)
W(340,87,375,87)
W(375,87,375,90)
W(375,50,375,30)
gnd(375,44)
W(375,44,375,50)

T(155,8,enc("图14-53  电冰箱电气线路图"),TS_L)

# Assemble
dxf = hdr() + tbls()
dxf += "  0\nSECTION\n  2\nENTITIES\n" + e + "  0\nENDSEC\n  0\nEOF\n"

outpath = r"C:\Users\zero\.openclaw\workspace\fridge_circuit\fridge_circuit_v3.dxf"
with open(outpath, "w", encoding="ascii") as f:
    f.write(dxf)
print(f"Written: {outpath} ({os.path.getsize(outpath)} bytes)")
