#!/usr/bin/env python3
"""Generate clean DXF for fridge electrical circuit diagram."""
import os

ch = {
    '灯':'\\U+706F','开':'\\U+5F00','关':'\\U+5173',
    '加':'\\U+52A0','热':'\\U+70ED','器':'\\U+5668',
    '化':'\\U+5316','霜':'\\U+971C','板':'\\U+677F',
    '防':'\\U+9632','温':'\\U+6E29','控':'\\U+63A7',
    '启':'\\U+542F','动':'\\U+52A8','过':'\\U+8FC7',
    '载':'\\U+8F7D','保':'\\U+4FDD','护':'\\U+62A4',
    '继':'\\U+7EE7','电':'\\U+7535',
    '图':'\\U+56FE','冰':'\\U+51B0','箱':'\\U+7BB1',
    '气':'\\U+6C14','线':'\\U+7EBF','路':'\\U+8DEF',
}
def e(s):
    return ''.join(ch.get(c,c) for c in s)

def W(x1,y1,x2,y2):
    lines.append(f"  0\nLINE\n  8\nWIRES\n 10\n{x1}\n 20\n{y1}\n 30\n0.0\n 11\n{x2}\n 21\n{y2}\n 31\n0.0\n")
def S(x1,y1,x2,y2):
    lines.append(f"  0\nLINE\n  8\nSYMBOL\n 10\n{x1}\n 20\n{y1}\n 30\n0.0\n 11\n{x2}\n 21\n{y2}\n 31\n0.0\n")
def G(x1,y1,x2,y2):
    lines.append(f"  0\nLINE\n  8\nGROUND\n 10\n{x1}\n 20\n{y1}\n 30\n0.0\n 11\n{x2}\n 21\n{y2}\n 31\n0.0\n")
def D(x1,y1,x2,y2):
    lines.append(f"  0\nLINE\n  8\nDASHB\n 10\n{x1}\n 20\n{y1}\n 30\n0.0\n 11\n{x2}\n 21\n{y2}\n 31\n0.0\n")
def C(x,y,r):
    lines.append(f"  0\nCIRCLE\n  8\nSYMBOL\n 10\n{x}\n 20\n{y}\n 30\n0.0\n 40\n{r}\n")
def T(x,y,t,h,layer="TEXT"):
    lines.append(f"  0\nTEXT\n  8\n{layer}\n 10\n{x}\n 20\n{y}\n 30\n0.0\n 40\n{h}\n  1\n{e(t)}\n")

TS=3.5
TS2=2.8
TS3=5.0

# helpers
def plug(x,y):
    S(x,y-6,x,y+6); S(x,y-6,x-10,y-6); S(x,y+6,x-10,y+6)
def gnd(x,y):
    G(x,y,x,y-8); G(x-6,y-8,x+6,y-8); G(x-4,y-11,x+4,y-11); G(x-2,y-14,x+2,y-14)
def tsw(x,y):
    S(x,y-6,x,y+6); S(x,y+6,x+8,y-2)
def bulb(x,y,r=8):
    C(x,y,r); d=r*0.7; S(x-d,y-d,x+d,y+d); S(x-d,y+d,x+d,y-d)
def cap(x,y):
    S(x-5,y+3,x+5,y+3); S(x-5,y-3,x+5,y-3)
def res(x,y,w=12):
    h=w/2; sw=w/4
    for i in range(4):
        x1=x-h+i*sw; y1=y+(h if i%2==0 else -h)
        x2=x-h+(i+1)*sw; y2=y+(-h if i%2==0 else h)
        S(x1,y1,x2,y2)
def drect(x1,y1,x2,y2):
    D(x1,y1,x2,y1); D(x2,y1,x2,y2); D(x2,y2,x1,y2); D(x1,y2,x1,y1)

# ============ HEADER ============
lines = []
lines.append("  0")
lines.append("SECTION")
lines.append("  2")
lines.append("HEADER")
lines.append("  9")
lines.append("$ACADVER")
lines.append("  1")
lines.append("AC1015")
lines.append("  9")
lines.append("$EXTMIN")
lines.append(" 10")
lines.append("0.0")
lines.append(" 20")
lines.append("0.0")
lines.append(" 30")
lines.append("0.0")
lines.append("  9")
lines.append("$EXTMAX")
lines.append(" 10")
lines.append("450.0")
lines.append(" 20")
lines.append("280.0")
lines.append(" 30")
lines.append("0.0")
lines.append("  0")
lines.append("ENDSEC")

# ============ TABLES ============
lines.append("  0")
lines.append("SECTION")
lines.append("  2")
lines.append("TABLES")

# LTYPE table
lines.append("  0")
lines.append("TABLE")
lines.append("  2")
lines.append("LTYPE")
lines.append(" 70")
lines.append("3")
# CONTINUOUS
lines.append("  0")
lines.append("LTYPE")
lines.append("  2")
lines.append("CONTINUOUS")
lines.append(" 70")
lines.append("0")
lines.append("  3")
lines.append("Solid line")
lines.append(" 72")
lines.append("65")
lines.append(" 73")
lines.append("0")
lines.append(" 40")
lines.append("0.0")
# DASHED
lines.append("  0")
lines.append("LTYPE")
lines.append("  2")
lines.append("DASHED")
lines.append(" 70")
lines.append("0")
lines.append("  3")
lines.append("Dashed")
lines.append(" 72")
lines.append("65")
lines.append(" 73")
lines.append("2")
lines.append(" 40")
lines.append("12.0")
lines.append(" 49")
lines.append("6.0")
lines.append(" 49")
lines.append("-6.0")
lines.append("  0")
lines.append("ENDTAB")

# LAYER table
lines.append("  0")
lines.append("TABLE")
lines.append("  2")
lines.append("LAYER")
lines.append(" 70")
lines.append("6")
layers = [
    ("0", "7", "CONTINUOUS"),
    ("WIRES", "7", "CONTINUOUS"),
    ("TEXT", "3", "CONTINUOUS"),
    ("DASHB", "5", "DASHED"),
    ("SYMBOL", "1", "CONTINUOUS"),
    ("GROUND", "2", "CONTINUOUS"),
]
for ln, col, lt in layers:
    lines.append("  0")
    lines.append("LAYER")
    lines.append("  2")
    lines.append(ln)
    lines.append(" 70")
    lines.append("0")
    lines.append(" 62")
    lines.append(col)
    lines.append("  6")
    lines.append(lt)
lines.append("  0")
lines.append("ENDTAB")

# STYLE table
lines.append("  0")
lines.append("TABLE")
lines.append("  2")
lines.append("STYLE")
lines.append(" 70")
lines.append("1")
lines.append("  0")
lines.append("STYLE")
lines.append("  2")
lines.append("Standard")
lines.append(" 70")
lines.append("0")
lines.append(" 40")
lines.append("0.0")
lines.append(" 41")
lines.append("1.0")
lines.append(" 50")
lines.append("0.0")
lines.append(" 71")
lines.append("0")
lines.append(" 42")
lines.append("2.5")
lines.append("  3")
lines.append("txt")
lines.append("  4")
lines.append("")
lines.append("  0")
lines.append("ENDTAB")

lines.append("  0")
lines.append("ENDSEC")

# ============ ENTITIES ============
lines.append("  0")
lines.append("SECTION")
lines.append("  2")
lines.append("ENTITIES")

# Main rails
W(0,240,420,240)
W(0,30,420,30)

# Plug
plug(30,140)
T(15,155,"~220V",TS)
W(30,134,30,240)
W(30,146,30,30)
gnd(30,22)
W(30,22,30,30)

# Light
W(85,240,85,210)
tsw(85,205)
T(65,198,"灯开关",TS)
W(85,199,85,150)
bulb(85,135,9)
T(95,125,"EL",TS)
W(85,126,85,30)

# DS + SB2 + D
W(130,240,130,210)
res(130,195,14)
T(146,190,"DS加热器",TS2)
W(130,186,130,180)
tsw(130,175)
T(146,172,"SB2",TS)
W(130,169,130,120)
res(130,105,14)
T(146,100,"D加热器",TS2)
W(130,96,130,30)

# Defrost
drect(185,160,260,230)
T(190,232,"化霜开关板",TS)
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
T(183,132,"防霜加热器开关",TS2)
T(188,126,"SB1",TS)
W(210,132,210,105)
res(210,90,14)
T(226,85,"防霜加热器",TS2)
W(210,81,210,30)

W(250,240,250,230)
res(250,215,14)
T(266,210,"IL加热器",TS2)
W(250,206,250,30)

W(285,240,285,215)
res(285,200,14)
T(301,195,"RP加热器",TS2)
W(285,191,285,30)

drect(310,170,370,230)
T(315,232,"温控器",TS)
W(315,240,315,230)
W(315,220,325,220)
S(325,220,333,212)
W(333,212,345,212)
W(345,212,345,220)
W(345,220,360,220)
W(340,170,340,155)
T(295,147,"启动过载保护继电器",TS2)
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
T(365,74,"M",TS3)
T(367,58,"1~",TS)
W(375,110,375,90)
W(340,87,375,87)
W(375,87,375,90)
W(375,50,375,30)
gnd(375,44)
W(375,44,375,50)

T(155,8,"图14-53  电冰箱电气线路图",TS3)

lines.append("  0")
lines.append("ENDSEC")
lines.append("  0")
lines.append("EOF")

# Write
outpath = r"C:\Users\zero\.openclaw\workspace\fridge_circuit\fridge.dxf"
with open(outpath, "w", encoding="ascii") as f:
    f.write("\n".join(lines))
print(f"Written: {outpath} ({os.path.getsize(outpath)} bytes)")

# Verify with ezdxf
import ezdxf
d = ezdxf.readfile(outpath)
msp = list(d.modelspace())
print(f"Entities: {len(msp)}")
em = d.header.get("$EXTMIN")
print(f"ExtMin: {em}")
em = d.header.get("$EXTMAX")
print(f"ExtMax: {em}")
from collections import Counter
lc = Counter(e.dxf.layer for e in msp)
for l, c in lc.most_common():
    print(f"  {l}: {c}")
