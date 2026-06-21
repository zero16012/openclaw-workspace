from PIL import Image, ImageDraw, ImageFont

W, H = 1000, 580
img = Image.new('RGB', (W, H), 'white')
draw = ImageDraw.Draw(img)

fp = "C:/Windows/Fonts/msyh.ttc"
font = ImageFont.truetype(fp, 20)
fsm = ImageFont.truetype(fp, 16)
flg = ImageFont.truetype(fp, 22)

def b(x, y, w, h, t, f=font):
    draw.rectangle([x, y, x+w, y+h], outline='black', width=2, fill='white')
    draw.text((x+w/2, y+h/2), t, fill='black', font=f, anchor='mm')
def h(x, x2, y): draw.line([x, y, x2, y], fill='black', width=2)
def v(x, y1, y2): draw.line([x, y1, x, y2], fill='black', width=2)

# 开始
b(80, 265, 80, 40, "开始", fsm)

# 主菜单控制模块
b(200, 240, 200, 90, "主菜单\n控制模块", flg)

# 开始 → 主菜单
h(160, 200, 285)

# 主菜单 → 向右连接线
h(400, 450, 285)

# 竖向主干
v(450, 32, 470)

# 7个子模块
BX = 530
BW = 210
BH = 46
modules = ["校园节点录入模块","校园路径录入模块","地图信息查询模块",
           "最短路径查询模块","地图数据维护模块","控制台图形化展示模块","地图持久化模块"]
gap = 64
base = 32

for i, m in enumerate(modules):
    y = base + i*gap
    b(BX, y, BW, BH, m)
    h(450, BX, y+BH/2)

out = r"C:\Users\zero\.openclaw\workspace\nav_flowchart.png"
img.save(out)
print("OK")
import os; os.startfile(out)
