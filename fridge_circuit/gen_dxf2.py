#!/usr/bin/env python3
"""
Generate refrigerator electrical circuit diagram (图14-53) as DXF using ezdxf.
"""
import ezdxf
from ezdxf import units
from ezdxf.enums import TextEntityAlignment
from ezdxf.math import Vec2

doc = ezdxf.new("AC1015", units=units.MM)
msp = doc.modelspace()

# --- Layers ---
doc.layers.add("WIRES", color=7)
doc.layers.add("TEXT", color=3)
doc.layers.add("DASHBOX", color=5, linetype="DASHED")
doc.layers.add("SYMBOL", color=1)
doc.layers.add("GROUND", color=2)

TS = 3.5  # text size
TS_S = 2.8  # small text size
TS_L = 5.0  # large text

def wire(x1, y1, x2, y2):
    msp.add_line((x1, y1), (x2, y2), dxfattribs={"layer": "WIRES"})

def sym(x1, y1, x2, y2):
    msp.add_line((x1, y1), (x2, y2), dxfattribs={"layer": "SYMBOL"})

def text(x, y, txt, h=TS, layer="TEXT"):
    msp.add_text(txt, dxfattribs={"layer": layer, "height": h}).set_placement(
        (x, y), (x, y), TextEntityAlignment.LEFT
    )

def center_text(x, y, txt, h=TS, layer="TEXT"):
    msp.add_text(txt, dxfattribs={"layer": layer, "height": h}).set_placement(
        (x, y), (x, y), TextEntityAlignment.CENTER
    )

def circle(cx, cy, r, layer="SYMBOL"):
    msp.add_circle((cx, cy), r, dxfattribs={"layer": layer})

def resistor(cx, cy, w=12, layer="SYMBOL"):
    """Draw zigzag resistor symbol centered at (cx, cy)."""
    half = w / 2
    segs = 4
    seg_w = w / segs
    pts = []
    for i in range(segs + 1):
        x = cx - half + i * seg_w
        y = cy + (half if i % 2 == 0 else -half)
        pts.append((x, y))
    msp.add_lwpolyline(pts, dxfattribs={"layer": layer})

def dashed_rect(x1, y1, x2, y2):
    msp.add_lwpolyline(
        [(x1, y1), (x2, y1), (x2, y2), (x1, y2), (x1, y1)],
        dxfattribs={"layer": "DASHBOX"},
    )

def toggle_switch(x, y, up=True):
    """Draw a toggle switch centered at (x,y), pointing up or down."""
    h = 6
    arm = 8
    if up:
        sym(x, y - h, x, y + h)
        sym(x, y + h, x + arm, y + h - arm)
    else:
        sym(x, y - h, x, y + h)
        sym(x, y - h, x + arm, y - h + arm)

def ground(x, y):
    """Draw ground symbol."""
    sym(x, y, x, y - 8)
    sym(x - 6, y - 8, x + 6, y - 8)
    sym(x - 4, y - 11, x + 4, y - 11)
    sym(x - 2, y - 14, x + 2, y - 14)

def plug(x, y):
    """Draw 2-pin plug centered at (x,y), pins pointing left."""
    sym(x, y - 6, x, y + 6)
    sym(x, y - 6, x - 10, y - 6)
    sym(x, y + 6, x - 10, y + 6)

def light_bulb(cx, cy, r=8):
    """Draw light bulb symbol (circle with X)."""
    circle(cx, cy, r, "SYMBOL")
    d = r * 0.7
    sym(cx - d, cy - d, cx + d, cy + d)
    sym(cx - d, cy + d, cx + d, cy - d)

# =============================================================
# LAYOUT
# Drawing area: X: 0~420, Y: 0~300
# Live rail: y = 240
# Neutral rail: y = 30
# =============================================================

# ---- MAIN RAILS ----
wire(0, 240, 420, 240)   # live rail (top)
wire(0, 30, 420, 30)     # neutral rail (bottom)

# ---- POWER PLUG (far left) ----
plug(30, 140)
text(15, 155, "~220V", TS)

# Connect plug to rails
wire(30, 134, 30, 240)   # live side up
wire(30, 146, 30, 30)    # neutral side down

# Ground below plug
ground(30, 24)
wire(30, 24, 30, 30)

# ---- LIGHT CIRCUIT (left section) ----
# Branch from live rail
wire(85, 240, 85, 210)
# Toggle switch
toggle_switch(85, 205, True)
text(70, 199, "灯开关", TS)
wire(85, 199, 85, 150)

# EL (light bulb)
light_bulb(85, 135, 9)
text(95, 125, "EL", TS)
wire(85, 126, 85, 30)  # to neutral

# ---- DS HEATER + SB₂ + D HEATER (middle-left) ----
wire(130, 240, 130, 210)

# DS heater
resistor(130, 195, 14)
text(145, 190, "DS加热器", TS_S)
wire(130, 186, 130, 180)

# SB₂
toggle_switch(130, 175, True)
text(145, 172, "SB₂", TS)
wire(130, 169, 130, 120)

# D heater
resistor(130, 105, 14)
text(145, 100, "D加热器", TS_S)
wire(130, 96, 130, 30)  # to neutral

# ---- DEFROST SYSTEM (center) ----
# Dashed box for 化霜开关板
dashed_rect(185, 160, 260, 230)
text(190, 232, "化霜开关板", TS)

wire(195, 240, 195, 230)  # from live rail into box

# Internal switch contacts in defrost box
# First contact
wire(195, 225, 205, 225)
sym(205, 225, 213, 217)
wire(213, 217, 225, 217)
wire(225, 217, 225, 225)
wire(225, 225, 235, 225)

# Second contact
wire(195, 195, 205, 195)
sym(205, 195, 213, 187)
wire(213, 187, 225, 187)
wire(225, 187, 225, 195)
wire(225, 195, 235, 195)

# Third contact
wire(195, 175, 205, 175)
sym(205, 175, 213, 167)
wire(213, 167, 225, 167)
wire(225, 167, 225, 175)

# Output from defrost box
wire(210, 160, 210, 145)

# SB₁ - defrost heater switch (outside box)
toggle_switch(210, 138, True)
text(185, 132, "防霜加热器开关", TS_S)
text(190, 126, "SB₁", TS)
wire(210, 132, 210, 105)

# Defrost heater
resistor(210, 90, 14)
text(225, 85, "防霜加热器", TS_S)
wire(210, 81, 210, 30)  # to neutral

# IL heater (from right side of defrost box)
wire(250, 240, 250, 230)
resistor(250, 215, 14)
text(265, 210, "IL加热器", TS_S)
wire(250, 206, 250, 30)  # to neutral

# RP heater
wire(285, 240, 285, 215)
resistor(285, 200, 14)
text(300, 195, "RP加热器", TS_S)
wire(285, 191, 285, 30)  # to neutral

# ---- TEMPERATURE CONTROL + COMPRESSOR (right section) ----
# Dashed box for 温控器
dashed_rect(310, 170, 370, 230)
text(315, 232, "温控器", TS)

wire(315, 240, 315, 230)

# Temp controller switch contact
wire(315, 220, 325, 220)
sym(325, 220, 333, 212)
wire(333, 212, 345, 212)
wire(345, 212, 345, 220)
wire(345, 220, 360, 220)

# Wire out of temp controller
wire(340, 170, 340, 155)

# Start overload protection relay area
text(300, 147, "启动过载保护继电器", TS_S)

# Relay contacts
wire(340, 145, 348, 145)
sym(348, 145, 354, 139)
wire(354, 139, 365, 139)
wire(365, 139, 365, 145)
wire(365, 145, 375, 145)
wire(375, 145, 375, 110)

# Wire down from relay
wire(340, 145, 340, 110)

# Capacitor
cap_x, cap_y = 340, 97
sym(cap_x - 5, cap_y + 3, cap_x + 5, cap_y + 3)
sym(cap_x - 5, cap_y - 3, cap_x + 5, cap_y - 3)
text(350, 92, "C", TS)

wire(cap_x, cap_y + 3, cap_x, cap_y + 13)
wire(cap_x, cap_y - 3, cap_x, cap_y - 13)

# Wire from live rail to motor right side
wire(375, 240, 375, 110)

# Compressor motor
mot_x, mot_y = 375, 70
circle(mot_x, mot_y, 20, "SYMBOL")
center_text(mot_x, mot_y + 5, "M", TS_L, "TEXT")
center_text(mot_x, mot_y - 10, "1~", TS, "TEXT")

# Wire from live rail side to motor
wire(375, 110, 375, 90)

# Connect capacitor to motor
wire(cap_x, cap_y + 13, 375, cap_y + 13)
wire(375, cap_y + 13, 375, 90)

# Motor to neutral
wire(375, 50, 375, 30)

# Motor ground
ground(375, 44)
wire(375, 44, 375, 50)

# ---- TITLE ----
center_text(200, 8, "图14-53  电冰箱电气线路图", TS_L, "TEXT")

# ---- SAVE ----
outpath = r"C:\Users\zero\.openclaw\workspace\fridge_circuit\fridge_circuit.dxf"
doc.saveas(outpath)
print(f"Saved: {outpath}")
