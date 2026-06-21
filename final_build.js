const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const zip = new AdmZip('C:\\Users\\zero\\.openclaw\\workspace\\final_ppt.pptx');
const mediaDir = 'C:\\Users\\zero\\.openclaw\\workspace\\docx_media';

// Apply text fixes to each slide
const textFixes = {
  'ppt/slides/slide1.xml': [
    ['2501123121', '202501150111'],
    ['张三', '李泽锐'],
    ['2026-5-27', '2026-6-9'],
  ],
  'ppt/slides/slide2.xml': [
    ['子模的详细设计与实现解说', '子模块详细设计与实现解说'],
    ['作品简要介绍', '作品简介'],
    ['作品运行效果展示', '运行效果展示'],
  ],
  'ppt/slides/slide3.xml': [
    ['作品简要介绍', '作品简介'],
  ],
  'ppt/slides/slide4.xml': [
    ['作品简要介绍', '校园导航系统简介'],
    ['代码量与复杂度', '代码量与复杂度'],
    ['数据结构选型', '数据结构选型'],
    ['功能模块个数', '功能模块总数'],
    ['展示关键结构体定义', 'CampusMap结构体封装核心数据'],
  ],
  'ppt/slides/slide5.xml': [
    ['学生信息管理系统', '校园导航系统'],
    ['录入模块→存储模块→统计模块', '主菜单→子模块→循环返回'],
    ['录入模块调用存储模块的结构体数组，统计模块读取数据后排序', 'while(1)+switch循环调用16个函数模块'],
    ['作品简要介绍', '校园导航系统架构'],
  ],
  'ppt/slides/slide6.xml': [
    ['学生信息管理系统', '校园导航系统'],
    ['录入模块→存储模块→统计模块', '主菜单控制→13个模块→循环返回'],
    ['录入模块调用存储模块的结构体数组，统计模块读取数据后排序', '选择数字进入对应模块，执行后返回主菜单'],
    ['作品简要介绍', '校园导航系统模块架构'],
    ['学生信息录入模块', '校园节点录入模块(addNode)'],
    ['学生信息查询模块', '校园路径录入模块(addEdge)'],
    ['学生信息修改模块', '两点最短路径查询(queryPath)'],
    ['学生信息删除模块', '全节点路径查询(findAllPaths)'],
    ['学生信息插入模块', '节点删除模块(deleteNode)'],
    ['学生信息输出模块', '路径删除模块(deleteEdge)'],
    ['按学号查询学生信息', '地图文件保存模块(saveMap)'],
    ['按姓名查询学生信息', '地图文件加载模块(loadMap)'],
    ['输出优秀学生相关信息', '控制台图形化地图(drawConsoleMap)'],
    ['输出不及格学生信息', '系统信息模块(systemInfo)'],
    ['主菜单控制模块', '主循环控制模块(main)'],
  ],
  'ppt/slides/slide7.xml': [
    ['作品运行效果展示', '运行效果展示'],
  ],
  'ppt/slides/slide8.xml': [
    ['作品简要介绍', '校园导航系统'],
    ['系统功能演示与测试用例', '系统功能演示与运行效果'],
  ],
  'ppt/slides/slide9.xml': [
    ['子模的详细设计与实现解说', '子模块设计与实现解说'],
  ],
  'ppt/slides/slide10.xml': [
    ['模块技术解说', '核心模块技术解说'],
    ['一', '一：initSystem()'],
    ['二', '二：addNode()'],
    ['三', '三：addEdge()'],
    ['四', '四：dijkstra()'],
    ['1', 'O(n²)'],
    ['2', 'O(1)'],
    ['3', 'O(1)'],
    ['4', 'O(n²)'],
    ['显示记录', '双层for循环赋值0/INF'],
    ['修改记录', 'scanf存入nodes数组'],
    ['插入新记录', '校验+双向graph赋值'],
    ['删除记录', 'dist/pre/visit三数组+松弛'],
  ],
  'ppt/slides/slide11.xml': [
    ['一。。。。', 'Dijkstra最短路径算法'],
    ['算法逻辑与复杂度分析（以排序/搜索算法为例）', '①初始化dist/pre/visit  ②选未访问最小dist  ③松弛更新  ④递归回溯路径'],
  ],
  'ppt/slides/slide12.xml': [
    ['作品简要介绍', '关键代码解析'],
    ['关键代码细节解析（指针/内存/函数调用）', '①启动口令校验 ②initSystem双层for ③dijkstra三数组+松弛 ④saveMap/loadMap文件读写'],
  ],
};

for (const [slideName, reps] of Object.entries(textFixes)) {
  const entry = zip.getEntry(slideName);
  if (!entry) { console.log('Missing:', slideName); continue; }
  let xml = entry.getData().toString('utf8');
  let changed = 0;
  for (const [oldText, newText] of reps) {
    const count = (xml.match(new RegExp(oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    xml = xml.split(oldText).join(newText);
    if (count > 0) changed += count;
  }
  zip.updateFile(entry, Buffer.from(xml, 'utf8'));
  console.log(slideName, '-', changed, 'changes');
}

// Also update slide4's number placeholders
let s4 = zip.getEntry('ppt/slides/slide4.xml').getData().toString('utf8');
s4 = s4.replace(/<a:t[^>]*>。。。<\/a:t>/g, '<a:t>基于C语言+Dijkstra算法+邻接矩阵</a:t>');
s4 = s4.replace(/<a:t[^>]*>1<\/a:t>/g, '<a:t>代码量：约350行</a:t>');
s4 = s4.replace(/<a:t[^>]*>2<\/a:t>/g, '<a:t>数据结构：邻接矩阵</a:t>');
s4 = s4.replace(/<a:t[^>]*>3<\/a:t>/g, '<a:t>模块数量：16个函数</a:t>');
zip.updateFile(zip.getEntry('ppt/slides/slide4.xml'), Buffer.from(s4, 'utf8'));
console.log('slide4 - number placeholders updated');

// === Add images at correct positions ===
const IMG_W = 2800000;
const IMG_H = 1600000;
const GAP = 150000;
const START_X = 300000;
const START_Y = 1200000;
const COLS = 3;
let nextRid = 500;
let totalAdded = 0;

const imagePlan = {
  'ppt/slides/slide5.xml': {
    imgs: [{ file: 'image3.png', name: 'arch.png' }],
  },
  'ppt/slides/slide8.xml': {
    imgs: [
      'image18.png','image19.png','image20.png','image21.png',
      'image22.png','image23.png','image24.png','image25.png',
      'image26.png','image27.png','image31.png',
    ].map((f, i) => ({ file: f, name: 'pic' + String(i+1).padStart(2,'0') + '.png' })),
  },
  'ppt/slides/slide10.xml': {
    imgs: [
      'image5.png','image7.png','image8.png',
      'image9.png','image10.png','image11.png',
    ].map((f, i) => ({ file: f, name: 'mod' + String(i+1).padStart(2,'0') + '.png' })),
  },
  'ppt/slides/slide11.xml': {
    imgs: [
      'image9.png','image13.png',
    ].map((f, i) => ({ file: f, name: 'alg' + String(i+1).padStart(2,'0') + '.png' })),
  },
};

for (const [slideName, plan] of Object.entries(imagePlan)) {
  let slideXml = zip.getEntry(slideName).getData().toString('utf8');
  const relsName = slideName.replace('.xml', '.xml.rels').replace('slides/', 'slides/_rels/');
  let relsXml = '';
  try { const re = zip.getEntry(relsName); if (re) relsXml = re.getData().toString('utf8'); } catch(e) {}
  if (!relsXml) relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';
  
  plan.imgs.forEach((img, idx) => {
    const srcPath = path.join(mediaDir, img.file);
    if (!fs.existsSync(srcPath)) return;
    const data = fs.readFileSync(srcPath);
    const mediaName = 'ppt/media/' + img.name;
    if (!zip.getEntry(mediaName)) zip.addFile(mediaName, data);
    
    const col = idx % COLS;
    const row = Math.floor(idx / COLS);
    const xOff = START_X + col * (IMG_W + GAP);
    const yOff = START_Y + row * (IMG_H + GAP);
    const rid = 'rIdN' + (nextRid++);
    
    const relEntry = '<Relationship Id="' + rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/' + img.name + '"/>';
    if (!relsXml.includes(rid)) relsXml = relsXml.replace('</Relationships>', relEntry + '</Relationships>');
    
    const imgShape = '<p:pic><p:nvPicPr><p:cNvPr id="' + (800+idx) + '" name="' + img.name + '"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="' + rid + '"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="' + xOff + '" y="' + yOff + '"/><a:ext cx="' + IMG_W + '" cy="' + IMG_H + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>';
    slideXml = slideXml.replace('</p:spTree>', imgShape + '</p:spTree>');
    totalAdded++;
  });
  
  zip.updateFile(zip.getEntry(slideName), Buffer.from(slideXml, 'utf8'));
  if (zip.getEntry(relsName)) zip.updateFile(zip.getEntry(relsName), Buffer.from(relsXml, 'utf8'));
  else zip.addFile(relsName, Buffer.from(relsXml, 'utf8'));
}

console.log('\nTotal images added:', totalAdded);

// Verify text content
for (const [slideName] of Object.entries(textFixes)) {
  const x = zip.getEntry(slideName).getData().toString('utf8');
  const t = (x.match(/<a:t[^>]*>[^<]*<\/a:t>/g)||[]).map(t=>t.replace(/<[^>]+>/g,'')).filter(x=>x.trim()).join(' ').substring(0,100);
  const badPatterns = ['学生成绩管理系统', '录入模块→', '录入模块调用', '2501123121', '张三', '2026-5-27'];
  let clean = true;
  for (const b of badPatterns) { if (t.includes(b)) { clean = false; break; } }
  console.log(slideName.replace('ppt/slides/','').replace('.xml','') + ':', clean ? '✅' : '⚠️', t);
}

zip.writeZip('C:\\Users\\zero\\.openclaw\\workspace\\final_ppt.pptx');
console.log('\n✅ Final PPT saved!');
