const fs = require('fs');
const AdmZip = require('adm-zip');

const pptxPath = 'C:\\Users\\zero\\.openclaw\\media\\inbound\\作品演示模板PPT---6e039813-9cec-473e-9475-d252b4969ac3.pptx';
const outPath = 'C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx';

const zip = new AdmZip(pptxPath);

// Read all slide XMLs
const slides = {};
for (const entry of zip.getEntries()) {
  if (entry.entryName.startsWith('ppt/slides/slide') && entry.entryName.endsWith('.xml')) {
    slides[entry.entryName] = entry.getData().toString('utf8');
  }
}

// Fix slide 1 - handle split text
let s1 = slides['ppt/slides/slide1.xml'];
// Fix "学生成" + "绩管理系统" → "校园导航系统"
s1 = s1.replace(/学生成<\/a:t><\/a:r><a:r[^>]*><a:rPr[^>]*><\/a:rPr><a:t[^>]*>绩管理系统/g, '校园导航系统');
// Also handle the complete form in case
s1 = s1.replace(/学生成/g, '');
s1 = s1.replace(/绩管理系统/g, '校园导航系统');
slides['ppt/slides/slide1.xml'] = s1;

// Fix slide 4 - content needs clean replacement
let s4 = slides['ppt/slides/slide4.xml'];
// Replace numeric/bullet content
s4 = s4.replace(/<a:t[^>]*>1<\/a:t>/g, '<a:t>约2000行代码</a:t>');
s4 = s4.replace(/<a:t[^>]*>2<\/a:t>/g, '<a:t>邻接矩阵(二维数组)</a:t>');
s4 = s4.replace(/<a:t[^>]*>3<\/a:t>/g, '<a:t>13大核心功能模块</a:t>');
// Replace description texts
s4 = s4.replace(/代码量与复杂/g, '代码量与复杂度');
s4 = s4.replace(/数据结构选/g, '数据结构选型');
s4 = s4.replace(/功能模块个/g, '功能模块总数');
s4 = s4.replace(/展示关键结构体定义/g, 'CampusMap结构体封装核心数据');
slides['ppt/slides/slide4.xml'] = s4;

// Fix slide 6 - handle old module names
let s6 = slides['ppt/slides/slide6.xml'];
// Map of old module names to new ones (these are individual text runs in the XML)
const moduleMap6 = [
  ['主菜单控制模块', '主菜单控制模块'],
  ['学生信息录入模块', '校园节点录入模块'],
  ['学生信息查询模块', '校园路径录入模块'],
  ['学生信息修改模块', '最短路径查询模块'],
  ['学生信息删除模块', '全节点路径查询模块'],
  ['学生信息插入模块', '节点删除模块'],
  ['学生信息输出模块', '路径删除模块'],
  ['按学号查询学生信息', '地图文件保存模块'],
  ['按姓名查询学生信息', '地图文件加载模块'],
  ['输出优秀学生相关信息', '控制台图形化地图'],
  ['输出不及格学生信息', '系统信息查看模块'],
];
for (const [oldT, newT] of moduleMap6) {
  s6 = s6.replace(oldT, newT);
}
// Clear placeholder text
s6 = s6.replace(/手绘或用工具绘制模块关系图（如 "学生信息管理系统" 分为 "录入模块→存储模块→统计模块"）。/, '主菜单→子模块→循环调用');
s6 = s6.replace(/说明模块交互（如 "录入模块调用存储模块的结构体数组，统计模块读取数据后排序"）。/, '主菜单选择数字进入对应功能模块，执行后返回菜单');
slides['ppt/slides/slide6.xml'] = s6;

// Fix slide 10 - module descriptions
let s10 = slides['ppt/slides/slide10.xml'];
// Replace module labels
s10 = s10.replace(/<a:t[^>]*>模块<\/a:t>/g, '<a:t>模块</a:t>');  // keep as-is
s10 = s10.replace(/显示记/g, '邻接矩阵初始化');
s10 = s10.replace(/修改记/g, '添加校园节点');
s10 = s10.replace(/插入新记/g, '添加校园路径');
s10 = s10.replace(/删除记/g, 'Dijkstra算法');

// Function descriptions per module
s10 = s10.replace(/<a:t[^>]*>一<\/a:t>/g, '<a:t>一：初始化系统</a:t>');
s10 = s10.replace(/<a:t[^>]*>二<\/a:t>/g, '<a:t>二：添加节点</a:t>');
s10 = s10.replace(/<a:t[^>]*>三<\/a:t>/g, '<a:t>三：添加路径</a:t>');
s10 = s10.replace(/<a:t[^>]*>四<\/a:t>/g, '<a:t>四：查询最短路径</a:t>');
slides['ppt/slides/slide10.xml'] = s10;

// Write the modified PPTX
const newZip = new AdmZip();
for (const entry of zip.getEntries()) {
  if (entry.entryName.startsWith('ppt/slides/slide') && entry.entryName.endsWith('.xml')) {
    if (slides[entry.entryName]) {
      newZip.addFile(entry.entryName, Buffer.from(slides[entry.entryName], 'utf8'));
    } else {
      newZip.addFile(entry.entryName, entry.getData());
    }
  } else if (!entry.isDirectory) {
    newZip.addFile(entry.entryName, entry.getData());
  }
}
newZip.writeZip(outPath);

console.log('PPT written to desktop:', outPath);

// Quick verification
const vZip = new AdmZip(outPath);
for (const entry of vZip.getEntries()) {
  if (entry.entryName.startsWith('ppt/slides/slide') && entry.entryName.endsWith('.xml')) {
    const xml = entry.getData().toString('utf8');
    const texts = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g);
    if (texts) {
      const content = texts.map(t => t.replace(/<[^>]+>/g, '')).filter(t => t.trim()).join(' | ');
      console.log(`  OK ${entry.entryName}: ${content.substring(0, 120)}`);
    }
  }
}
