#!/usr/bin/env python3
"""
生成电冰箱电气线路图 DXF 文件
对应教材图14-53
"""
import math

def dxf_header():
    return """0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
9
$INSUNITS
70
4
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LTYPE
70
3
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
LTYPE
2
DASHDOT
70
0
3
Dash dot __ . __ .
72
65
73
4
40
14.0
49
6.0
49
-2.0
49
0.5
49
-2.0
0
ENDTAB
0
TABLE
2
LAYER
70
5
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
DASHED
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
STANDARD
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
txt
4

0
ENDTAB
0
ENDSEC
"""

def dxf_entity(entity_type, layer, **kwargs):
    """Generate DXF entity text."""
    text = f"0\n{entity_type}\n8\n{layer}\n"
    if entity_type == "LINE":
        text += f"10\n{kwargs['x1']}\n20\n{kwargs['y1']}\n30\n0.0\n11\n{kwargs['x2']}\n21\n{kwargs['y2']}\n31\n0.0\n"
    elif entity_type == "CIRCLE":
        text += f"10\n{kwargs['cx']}\n20\n{kwargs['cy']}\n30\n0.0\n40\n{kwargs['r']}\n"
    elif entity_type == "TEXT":
        text += f"10\n{kwargs['x']}\n20\n{kwargs['y']}\n30\n0.0\n40\n{kwargs['h']}\n1\n{kwargs['txt']}\n"
    elif entity_type == "LWPOLYLINE":
        text += f"90\n{len(kwargs['points'])}\n70\n{kwargs.get('closed', 0)}\n"
        for p in kwargs['points']:
            text += f"10\n{p[0]}\n20\n{p[1]}\n"
    elif entity_type == "SOLID":
        text += f"10\n{kwargs['x1']}\n20\n{kwargs['y1']}\n30\n0.0\n"
        text += f"11\n{kwargs['x2']}\n21\n{kwargs['y2']}\n31\n0.0\n"
        text += f"12\n{kwargs['x3']}\n21\n{kwargs['y3']}\n31\n0.0\n"
        text += f"13\n{kwargs['x4']}\n21\n{kwargs['y4']}\n31\n0.0\n"
    return text

def add_line(x1, y1, x2, y2, layer="WIRES"):
    return dxf_entity("LINE", layer, x1=x1, y1=y1, x2=x2, y2=y2)

def add_circle(cx, cy, r, layer="SYMBOL"):
    return dxf_entity("CIRCLE", layer, cx=cx, cy=cy, r=r)

def add_text(x, y, txt, h=3.5, layer="TEXT"):
    return dxf_entity("TEXT", layer, x=x, y=y, h=h, txt=txt)

def add_polyline(points, layer="WIRES", closed=0):
    return dxf_entity("LWPOLYLINE", layer, points=points, closed=closed)

def generate_entities():
    e = []
    ts = 3.5  # text size
    hs = 5    # half spacing for components
    
    # =========================================================
    # COORDINATE SYSTEM
    # x: 0~400, y: 0~280
    # Power on left, compressor on right
    #
    # Top power rail: y = 240
    # Bottom neutral rail: y = 40
    # =========================================================
    
    # ---- POWER PLUG (x=30~50, y=center around 140) ----
    px, py = 35, 140  # plug center
    
    # Plug prongs (vertical lines from y=120 to y=160)
    e.append(add_line(px-6, py-20, px-6, py+10, "SYMBOL"))
    e.append(add_line(px+6, py-20, px+6, py+10, "SYMBOL"))
    # Plug body (top horizontal line)
    e.append(add_line(px-12, py+10, px+12, py+10, "SYMBOL"))
    # Power cord going right from plug
    e.append(add_line(px+12, py+10, px+12, py+30, "WIRES"))
    e.append(add_line(px+12, py+30, 150, py+30, "WIRES"))
    # Neutral side from plug
    e.append(add_line(px-6, py-20, px-6, py-50, "WIRES"))
    e.append(add_line(px-6, py-50, 150, py-50, "WIRES"))
    e.append(add_line(px+6, py-20, px+6, py-50, "WIRES"))
    
    # Neutral rail (bottom)
    e.append(add_line(150, 30, 400, 30, "WIRES"))
    e.append(add_line(150, py-50, 150, 30, "WIRES"))
    
    # 220V text
    e.append(add_text(px-25, py+25, "~220V", ts))
    
    # Ground symbol below plug (under neutral pin)
    gx, gy = px-6, py-50
    e.append(add_line(gx, gy, gx, gy-10, "GROUND"))
    e.append(add_line(gx-8, gy-10, gx+8, gy-10, "GROUND"))
    e.append(add_line(gx-5, gy-14, gx+5, gy-14, "GROUND"))
    e.append(add_line(gx-3, gy-18, gx+3, gy-18, "GROUND"))
    
    # ---- MAIN POWER RAILS ----
    # Top rail (live): runs from x=150 to right
    e.append(add_line(150, 210, 400, 210, "WIRES"))
    # Vertical connection from plug top to top rail
    e.append(add_line(px+12, py+30, 80, py+30, "WIRES"))
    e.append(add_line(80, py+30, 80, 210, "WIRES"))
    e.append(add_line(80, 210, 150, 210, "WIRES"))
    
    # ---- SECTION 1: LIGHT CIRCUIT (x=80~130, top) ----
    # Branch from top rail down
    e.append(add_line(95, 210, 95, 190, "WIRES"))
    
    # Light switch (toggle switch symbol)
    sw1_x, sw1_y = 95, 185
    e.append(add_line(sw1_x, sw1_y+5, sw1_x, sw1_y+5+hs, "WIRES"))
    e.append(add_line(sw1_x, sw1_y+5, sw1_x+8, sw1_y+5-hs, "WIRES"))
    e.append(add_text(sw1_x-15, sw1_y-5, "灯开关", ts))
    e.append(add_line(sw1_x, sw1_y-5-hs, sw1_x, sw1_y-5, "WIRES"))
    e.append(add_line(sw1_x, sw1_y-5-hs, sw1_x, 120, "WIRES"))
    
    # EL (light bulb - circle with X)
    el_x, el_y = 95, 105
    e.append(add_circle(el_x, el_y, 10, "SYMBOL"))
    # X inside
    e.append(add_line(el_x-7, el_y-7, el_x+7, el_y+7, "SYMBOL"))
    e.append(add_line(el_x-7, el_y+7, el_x+7, el_y-7, "SYMBOL"))
    e.append(add_text(el_x+5, el_y-16, "EL", ts))
    e.append(add_line(el_x, el_y-10, el_x, 30, "WIRES"))
    
    # ---- SECTION 2: DS HEATER + SB2 + D HEATER (x=110~150, middle) ----
    # Branch from top rail
    e.append(add_line(130, 210, 130, 190, "WIRES"))
    
    # Connection line going down
    e.append(add_line(130, 190, 130, 170, "WIRES"))
    
    # DS heater (resistor symbol - zigzag)
    ds_x, ds_y = 130, 155
    ds_w = 16
    for i in range(4):
        x1 = ds_x - ds_w//2 + i * (ds_w//3)
        y1 = ds_y + (ds_w//3) if i % 2 == 0 else ds_y - (ds_w//3)
        x2 = ds_x - ds_w//2 + (i+1) * (ds_w//3)
        y2 = ds_y - (ds_w//3) if i % 2 == 0 else ds_y + (ds_w//3)
        e.append(add_line(x1, y1, x2, y2, "SYMBOL"))
    e.append(add_text(ds_x+12, ds_y-3, "DS加热器", ts))
    
    # Wire down from DS heater
    e.append(add_line(ds_x, ds_y - ds_w//3, ds_x, 135, "WIRES"))
    
    # SB₂ switch
    sb2_x, sb2_y = 130, 120
    e.append(add_line(sb2_x, sb2_y+5, sb2_x, sb2_y+5+hs, "WIRES"))
    e.append(add_line(sb2_x, sb2_y+5, sb2_x+8, sb2_y+5-hs, "WIRES"))
    e.append(add_text(sb2_x+12, sb2_y-2, "SB₂", ts))
    e.append(add_line(sb2_x, sb2_y-5-hs, sb2_x, 90, "WIRES"))
    
    # D heater (resistor)
    dh_x, dh_y = 130, 75
    dh_w = 16
    for i in range(4):
        x1 = dh_x - dh_w//2 + i * (dh_w//3)
        y1 = dh_y + (dh_w//3) if i % 2 == 0 else dh_y - (dh_w//3)
        x2 = dh_x - dh_w//2 + (i+1) * (dh_w//3)
        y2 = dh_y - (dh_w//3) if i % 2 == 0 else dh_y + (dh_w//3)
        e.append(add_line(x1, y1, x2, y2, "SYMBOL"))
    e.append(add_text(dh_x+12, dh_y-3, "D加热器", ts))
    e.append(add_line(dh_x, dh_y - dh_w//3, dh_x, 30, "WIRES"))
    
    # ---- SECTION 3: DEFROST SYSTEM (x=180~250, middle) ----
    
    # Dashed box for defrost switch board
    df_bx1, df_by1 = 170, 140
    df_bx2, df_by2 = 250, 200
    
    # Dashed rectangle
    e.append(dxf_entity("LINE", "DASHED", x1=df_bx1, y1=df_by1, x2=df_bx2, y2=df_by1))
    e.append(dxf_entity("LINE", "DASHED", x1=df_bx2, y1=df_by1, x2=df_bx2, y2=df_by2))
    e.append(dxf_entity("LINE", "DASHED", x1=df_bx2, y1=df_by2, x2=df_bx1, y2=df_by2))
    e.append(dxf_entity("LINE", "DASHED", x1=df_bx1, y1=df_by2, x2=df_bx1, y2=df_by1))
    e.append(add_text(df_bx1+5, df_by2+3, "化霜开关板", ts-1))
    
    # Branch from top rail to defrost board
    e.append(add_line(195, 210, 195, 200, "WIRES"))
    
    # Internal defrost switch contacts
    e.append(add_line(185, 175, 195, 175, "WIRES"))
    e.append(add_line(195, 190, 195, 175, "WIRES"))
    e.append(add_line(195, 190, 200, 190, "WIRES"))
    # Switch contact
    e.append(add_line(200, 190, 200+8, 190-8, "WIRES"))
    e.append(add_line(200+8, 190-8, 210+8, 190-8, "WIRES"))
    
    e.append(add_line(210, 175, 220, 175, "WIRES"))
    e.append(add_line(220, 175, 220+8, 175-8, "WIRES"))
    e.append(add_line(220+8, 175-8, 230, 175-8, "WIRES"))
    e.append(add_line(230, 175-8, 230, 175, "WIRES"))
    
    e.append(add_line(230, 155, 240, 155, "WIRES"))
    
    # Wire out from defrost board (bottom)
    e.append(add_line(210, 140, 210, 100, "WIRES"))
    
    # SB₁ - defrost heater switch (outside dashed box)
    sb1_x, sb1_y = 210, 85
    e.append(add_line(sb1_x, sb1_y+5, sb1_x, sb1_y+5+hs, "WIRES"))
    e.append(add_line(sb1_x, sb1_y+5, sb1_x+8, sb1_y+5-hs, "WIRES"))
    e.append(add_text(sb1_x-25, sb1_y-10, "防霜加热器开关\nSB₁", ts-1))
    e.append(add_line(sb1_x, sb1_y-5-hs, sb1_x, 65, "WIRES"))
    
    # Defrost heater (resistor)
    dfh_x, dfh_y = 210, 50
    dfh_w = 16
    for i in range(4):
        x1 = dfh_x - dfh_w//2 + i * (dfh_w//3)
        y1 = dfh_y + (dfh_w//3) if i % 2 == 0 else dfh_y - (dfh_w//3)
        x2 = dfh_x - dfh_w//2 + (i+1) * (dfh_w//3)
        y2 = dfh_y - (dfh_w//3) if i % 2 == 0 else dfh_y + (dh_w//3)
        e.append(add_line(x1, y1, x2, y2, "SYMBOL"))
    e.append(add_text(dfh_x+12, dfh_y-3, "防霜加热器", ts-1))
    e.append(add_line(dfh_x, dfh_y - dfh_w//3, dfh_x, 30, "WIRES"))
    
    # IL heater and RP heater in top-right area
    # Branch from top rail
    e.append(add_line(240, 210, 240, 175, "WIRES"))
    
    # IL heater
    il_x, il_y = 240, 160
    il_w = 16
    for i in range(4):
        x1 = il_x - il_w//2 + i * (il_w//3)
        y1 = il_y + (il_w//3) if i % 2 == 0 else il_y - (il_w//3)
        x2 = il_x - il_w//2 + (i+1) * (il_w//3)
        y2 = il_y - (il_w//3) if i % 2 == 0 else il_y + (il_w//3)
        e.append(add_line(x1, y1, x2, y2, "SYMBOL"))
    e.append(add_text(il_x+12, il_y-3, "IL加热器", ts-1))
    e.append(add_line(il_x, il_y - il_w//3, il_x, 145, "WIRES"))
    
    # Wire to RP heater
    # RP heater
    rp_x, rp_y = 240, 130
    rp_w = 16
    for i in range(4):
        x1 = rp_x - rp_w//2 + i * (rp_w//3)
        y1 = rp_y + (rp_w//3) if i % 2 == 0 else rp_y - (rp_w//3)
        x2 = rp_x - rp_w//2 + (i+1) * (rp_w//3)
        y2 = rp_y - (rp_w//3) if i % 2 == 0 else rp_y + (rp_w//3)
        e.append(add_line(x1, y1, x2, y2, "SYMBOL"))
    e.append(add_text(rp_x+12, rp_y-3, "RP加热器", ts-1))
    e.append(add_line(rp_x, rp_y - rp_w//3, rp_x, 115, "WIRES"))
    
    # Connection to neutral
    e.append(add_line(240, 115, 240, 30, "WIRES"))
    
    # ---- SECTION 4: TEMPERATURE CONTROL + COMPRESSOR (x=280~380, right side) ----
    
    # Dashed box for temperature controller
    tc_x1, tc_y1 = 275, 180
    tc_x2, tc_y2 = 340, 210
    e.append(dxf_entity("LINE", "DASHED", x1=tc_x1, y1=tc_y1, x2=tc_x2, y2=tc_y1))
    e.append(dxf_entity("LINE", "DASHED", x1=tc_x2, y1=tc_y1, x2=tc_x2, y2=tc_y2))
    e.append(dxf_entity("LINE", "DASHED", x1=tc_x2, y1=tc_y2, x2=tc_x1, y2=tc_y2))
    e.append(dxf_entity("LINE", "DASHED", x1=tc_x1, y1=tc_y2, x2=tc_x1, y2=tc_y1))
    e.append(add_text(tc_x1+3, tc_y2+2, "温控器", ts-1))
    
    # Branch from top rail to temperature controller
    e.append(add_line(300, 210, 300, 210, "WIRES"))
    
    # Temperature controller switch contacts inside
    e.append(add_line(290, 195, 298, 195, "WIRES"))
    e.append(add_line(298, 195, 298+8, 195-8, "WIRES"))
    e.append(add_line(298+8, 195-8, 310, 195-8, "WIRES"))
    e.append(add_line(310, 195-8, 310, 195, "WIRES"))
    e.append(add_line(310, 195, 320, 195, "WIRES"))
    
    # Wire from temp controller down
    e.append(add_line(300, 180, 300, 120, "WIRES"))
    
    # Start overload protection relay
    e.append(add_text(270, 115, "启动过载保护继电器", ts-1))
    
    # Relay contacts
    e.append(add_line(300, 105, 308, 105, "WIRES"))
    e.append(add_line(308, 105, 308+5, 105-5, "WIRES"))
    e.append(add_line(308+5, 105-5, 315, 105-5, "WIRES"))
    
    e.append(add_line(300, 95, 300, 105, "WIRES"))
    e.append(add_line(300, 95, 300, 85, "WIRES"))
    
    # Capacitor
    cap_x, cap_y = 300, 78
    e.append(add_line(cap_x-5, cap_y+3, cap_x+5, cap_y+3, "SYMBOL"))
    e.append(add_line(cap_x-5, cap_y-3, cap_x+5, cap_y-3, "SYMBOL"))
    e.append(add_text(cap_x+10, cap_y-3, "C", ts))
    e.append(add_line(cap_x, cap_y+3, cap_x, cap_y+20, "WIRES"))
    e.append(add_line(cap_x, cap_y-3, cap_x, cap_y-15, "WIRES"))
    
    # Wire to compressor
    e.append(add_line(300, cap_y-15, 300, 65, "WIRES"))
    e.append(add_line(300, cap_y+20, 300, 95, "WIRES"))
    e.append(add_line(300, 95, 300, 105, "WIRES"))
    
    # Compressor motor (big circle with M and 1~)
    mot_x, mot_y = 340, 60
    e.append(add_circle(mot_x, mot_y, 18, "SYMBOL"))
    e.append(add_text(mot_x-5, mot_y+5, "M", ts+1, "TEXT"))
    e.append(add_text(mot_x-7, mot_y-10, "1~", ts-1, "TEXT"))
    
    # Wire from top rail to motor
    e.append(add_line(tc_x2, tc_y1, tc_x2, tc_y1-30, "WIRES"))
    e.append(add_line(tc_x2, tc_y1-30, 340, tc_y1-30, "WIRES"))
    e.append(add_line(340, tc_y1-30, 340, 78, "WIRES"))
    
    # Wire from motor to capacitor
    e.append(add_line(340, 72, 300, 72, "WIRES"))
    
    # Motor ground
    e.append(add_line(mot_x, mot_y-18, mot_x, mot_y-30, "GROUND"))
    e.append(add_line(mot_x-8, mot_y-30, mot_x+8, mot_y-30, "GROUND"))
    e.append(add_line(mot_x-5, mot_y-34, mot_x+5, mot_y-34, "GROUND"))
    e.append(add_line(mot_x-3, mot_y-38, mot_x+3, mot_y-38, "GROUND"))
    
    # Neutral return from motor area
    e.append(add_line(mot_x, mot_y-30, mot_x, 30, "WIRES"))
    e.append(add_line(300, 30, 400, 30, "WIRES"))
    
    # Connection of neutral rail back to left
    # Wire from each right-side component to neutral rail (y=30)
    e.append(add_line(195, 140, 195, 30, "WIRES"))
    e.append(add_line(300, 180, 300, 120, "WIRES"))
    e.append(add_line(300, 120, 300, 30, "WIRES"))
    
    # ---- TITLE ----
    e.append(add_text(120, 10, "图14-53  电冰箱电气线路图", 5, "TEXT"))
    
    return "".join(e)

def main():
    dxf = dxf_header()
    dxf += "0\nSECTION\n2\nENTITIES\n"
    dxf += generate_entities()
    dxf += "0\nENDSEC\n0\nEOF\n"
    
    outpath = r"C:\Users\zero\.openclaw\workspace\fridge_circuit\fridge_circuit.dxf"
    with open(outpath, "w", encoding="utf-8") as f:
        f.write(dxf)
    print(f"DXF saved to: {outpath}")

if __name__ == "__main__":
    main()
