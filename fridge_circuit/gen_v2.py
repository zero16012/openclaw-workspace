#!/usr/bin/env python3
"""
Generate refrigerator electrical circuit diagram as DXF - Fixed version.
Ensures: UTF-8 encoding, proper header extents, explicit entity colors.
"""
import ezdxf
from ezdxf import units
from ezdxf.enums import TextEntityAlignment
import os

doc = ezdxf.new("AC1015", units=units.MM)
doc.encoding = "utf-8"

msp = doc.modelspace()

# Set drawing extents
doc.header["$EXTMIN"] = (0, 0, 0)
doc.header["$EXTMAX"] = (450, 280, 0)
doc.header["$LIMMIN"] = (0, 0)
doc.header["$LIMMAX"] = (450, 280)

# --- Layers with explicit colors ---
doc.layers.add("WIRES", color=7)       # White
doc.layers.add("TEXT", color=3)         # Green
doc.layers.add("DASHBOX", color=5, linetype="DASHED")  # Blue, dashed
doc.layers.add("SYMBOL", color=1)       # Red
doc.layers.add("GROUND", color=2)       # Yellow

TS = 3.5
TS_S = 2.8
TS_L = 5.0

def wire(x1, y1, x2, y2):
    msp.add_line((x1, y1), (x2, y2), dxfattribs={"layer": "WIRES"})

def sym(x1, y1, x2, y2):
    msp.add_line((x1, y1), (x2, y2), dxfattribs={"layer": "SYMBOL"})

def txt(x, y, s, h=TS, layer="TEXT"):
    msp.add_text(s, dxfattribs={"layer": layer, "height": h}).set_placement(
        (x, y), align=TextEntityAlignment.LEFT
    )

def ctxt(x, y, s, h=TS, layer="TEXT"):
    msp.add_text(s, dxfattribs={"layer": layer, "height": h}).set_placement(
        (x, y), align=TextEntityAlignment.CENTER
    )

def crcl(cx, cy, r, layer="SYMBOL"):
    msp.add_circle((cx, cy), r, dxfattribs={"layer": layer})

def res(cx, cy, w=12, layer="SYMBOL"):
    """Zigzag resistor centered at (cx, cy)."""
    half = w / 2
    seg_w = w / 4
    pts = [(cx - half + i * seg_w, cy + (half if i % 2 == 0 else -half)) for i in range(5)]
    msp.add_lwpolyline(pts, dxfattribs={"layer": layer})

def drect(x1, y1, x2, y2):
    msp.add_lwpolyline([(x1, y1), (x2, y1), (x2, y2), (x1, y2), (x1, y1)],
                       dxfattribs={"layer": "DASHBOX"})

def tswitch(x, y, up=True):
    """Toggle switch, up=pointing up."""
    h = 6
    arm = 8
    sym(x, y - h, x, y + h)
    if up:
        sym(x, y + h, x + arm, y + h - arm)
    else:
        sym(x, y - h, x + arm, y - h + arm)

def gnd(x, y):
    sym(x, y, x, y - 8)
    sym(x - 6, y - 8, x + 6, y - 8)
    sym(x - 4, y - 11, x + 4, y - 11)
    sym(x - 2, y - 14, x + 2, y - 14)

def plug(x, y):
    sym(x, y - 6, x, y + 6)
    sym(x, y - 6, x - 10, y - 6)
    sym(x, y + 6, x - 10, y + 6)

def bulb(cx, cy, r=8):
    crcl(cx, cy, r)
    d = r * 0.7
    sym(cx - d, cy - d, cx + d, cy + d)
    sym(cx - d, cy + d, cx + d, cy - d)

def cap(x, y, w=10, h=6):
    sym(x - w/2, y - h/2, x + w/2, y - h/2)
    sym(x - w/2, y + h/2, x + w/2, y + h/2)

# =============================================================
# LAYOUT
# Drawing area: X: 0~420, Y: 0~280
# Live rail: y = 240
# Neutral rail: y = 30
# =============================================================

# ---- MAIN RAILS ----
wire(0, 240, 420, 240)   # live
wire(0, 30, 420, 30)     # neutral

# ---- POWER PLUG ----
plug(30, 140)
txt(15, 155, "~220V", TS)
wire(30, 134, 30, 240)   # live up
wire(30, 146, 30, 30)    # neutral down
gnd(30, 22)              # ground
wire(30, 22, 30, 30)

# ---- LIGHT CIRCUIT ----
wire(85, 240, 85, 210)
tswitch(85, 205, True)
txt(65, 198, "灯开关", TS)
wire(85, 199, 85, 150)
bulb(85, 135, 9)
txt(95, 125, "EL", TS)
wire(85, 126, 85, 30)

# ---- DS HEATER + SB2 + D HEATER ----
wire(130, 240, 130, 210)
res(130, 195, 14)
txt(146, 190, "DS加热器", TS_S)
wire(130, 186, 130, 180)
tswitch(130, 175, True)
txt(146, 172, "SB2", TS)
wire(130, 169, 130, 120)
res(130, 105, 14)
txt(146, 100, "D加热器", TS_S)
wire(130, 96, 130, 30)

# ---- DEFROST SYSTEM ----
drect(185, 160, 260, 230)
txt(190, 232, "化霜开关板", TS)

wire(195, 240, 195, 230)

# Contacts inside
wire(195, 225, 205, 225)
sym(205, 225, 213, 217)
wire(213, 217, 225, 217)
wire(225, 217, 225, 225)
wire(225, 225, 235, 225)

wire(195, 195, 205, 195)
sym(205, 195, 213, 187)
wire(213, 187, 225, 187)
wire(225, 187, 225, 195)
wire(225, 195, 235, 195)

wire(195, 175, 205, 175)
sym(205, 175, 213, 167)
wire(213, 167, 225, 167)
wire(225, 167, 225, 175)

wire(210, 160, 210, 145)  # out

# SB1
tswitch(210, 138, True)
txt(183, 132, "防霜加热器开关", TS_S)
txt(188, 126, "SB1", TS)
wire(210, 132, 210, 105)

# Defrost heater
res(210, 90, 14)
txt(226, 85, "防霜加热器", TS_S)
wire(210, 81, 210, 30)

# IL heater
wire(250, 240, 250, 230)
res(250, 215, 14)
txt(266, 210, "IL加热器", TS_S)
wire(250, 206, 250, 30)

# RP heater
wire(285, 240, 285, 215)
res(285, 200, 14)
txt(301, 195, "RP加热器", TS_S)
wire(285, 191, 285, 30)

# ---- TEMP CONTROL + COMPRESSOR ----
drect(310, 170, 370, 230)
txt(315, 232, "温控器", TS)

# Temp contact
wire(315, 220, 325, 220)
sym(325, 220, 333, 212)
wire(333, 212, 345, 212)
wire(345, 212, 345, 220)
wire(345, 220, 360, 220)

wire(340, 170, 340, 155)

# Relay
txt(295, 147, "启动过载保护继电器", TS_S)

wire(340, 145, 348, 145)
sym(348, 145, 354, 139)
wire(354, 139, 365, 139)
wire(365, 139, 365, 145)
wire(365, 145, 375, 145)
wire(375, 145, 375, 110)

wire(340, 145, 340, 110)

# Capacitor
cap(340, 97)
txt(350, 92, "C", TS)
wire(340, 100, 340, 110)
wire(340, 94, 340, 84)

# Live to motor
wire(375, 240, 375, 110)

# Motor
mot_x, mot_y = 375, 70
crcl(mot_x, mot_y, 20)
ctxt(mot_x, mot_y + 5, "M", TS_L)
ctxt(mot_x, mot_y - 10, "1~", TS)

wire(375, 110, 375, 90)
wire(340, 87, 375, 87)
wire(375, 87, 375, 90)

# Motor to neutral
wire(375, 50, 375, 30)

# Motor ground
gnd(375, 44)
wire(375, 44, 375, 50)

# ---- TITLE ----
ctxt(200, 8, "图14-53  电冰箱电气线路图", TS_L)

# ---- SAVE ----
out = r"C:\Users\zero\.openclaw\workspace\fridge_circuit\fridge_circuit_v2.dxf"
doc.saveas(out)
print(f"Saved: {out} - {os.path.getsize(out)} bytes")
