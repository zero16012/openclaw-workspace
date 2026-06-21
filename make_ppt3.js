const fs = require('fs');
const AdmZip = require('adm-zip');

const pptxPath = 'C:\\Users\\zero\\.openclaw\\media\\inbound\\作品演示模板PPT---6e039813-9cec-473e-9475-d252b4969ac3.pptx';
const outPath = 'C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx';

const zip = new AdmZip(pptxPath);
const slides = {};
for (const entry of zip.getEntries()) {
  if (entry.entryName.startsWith('ppt/slides/slide') && entry.entryName.endsWith('.xml')) {
    slides[entry.entryName] = entry.getData().toString('utf8');
  }
}

// Helper: replace text content in a:t tags
function replaceText(xml, oldText, newText) {
  // The text might be in a single a:t tag or split
  const escaped = oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'g');
  return xml.replace(regex, newText);
}

// === SLIDE 1: Cover ===
let s1 = slides['ppt/slides/slide1.xml'];
s1 = s1.replace(/示<\/a:t><\/a:r><a:r><a:rPr><\/a:rPr><a:t>/g, ''); // merge split chars
s1 = replaceText(s1, '学生成', '');
s1 = replaceText(s1, '绩管理系统', '校园导航系统');
s1 = replaceText(s1, '2501123121', '202501150111');
s1 = replaceText(s1, '张三', '李泽锐');
s1 = replaceText(s1, '2026-5-27', '2026-6-9');
s1 = replaceText(s1, '学生成', '');
slides['ppt/slides/slide1.xml'] = s1;

// === SLIDE 2: TOC ===
let s2 = slides['ppt/slides/slide2.xml'];
s2 = replaceText(s2, '子模的详细设计与实现解', '子模块详细设计');
s2 = replaceText(s2, '说', '与实现解说');
s2 = replaceText(s2, '绍', '');
s2 = replaceText(s2, '作品运行效果展示', '运行效果展示');
slides['ppt/slides/slide2.xml'] = s2;

// === SLIDE 3 + 4: Introduction ===
let s3 = slides['ppt/slides/slide3.xml'];
s3 = replaceText(s3, '绍', '');
slides['ppt/slides/slide3.xml'] = s3;

let s4 = slides['ppt/slides/slide4.xml'];
s4 = replaceText(s4, '作品简要介绍', '校园导航系统简介');
s4 = replaceText(s4, '系统简', '系统概述');
s4 = replaceText(s4, '介', '');
s4 = s4.replace(/<a:t[^>]*>。。。<\/a:t>/g, '<a:t>基于 C 语言 + Dijkstra 算法 + 邻接矩阵</a:t>');
s4 = s4.replace(/<a:t[^>]*>1<\/a:t>/g, '<a:t>约2000行代码</a:t>');
s4 = s4.replace(/<a:t[^>]*>2<\/a:t>/g, '<a:t>邻接矩阵（二维数组）</a:t>');
s4 = s4.replace(/<a:t[^>]*>3<\/a:t>/g, '<a:t>13个核心功能模块</a:t>');
s4 = replaceText(s4, '代码量与复杂', '代码量与复杂度');
s4 = replaceText(s4, '数据结构选', '数据结构选型');
s4 = replaceText(s4, '功能模块个', '功能模块总数');
s4 = replaceText(s4, '展示关键结构体定义', 'CampusMap 结构体封装核心数据');
slides['ppt/slides/slide4.xml'] = s4;

// === SLIDE 5: Architecture diagram ===
let s5 = slides['ppt/slides/slide5.xml'];
s5 = replaceText(s5, '学生信息管理系统', '校园导航系统');
s5 = replaceText(s5, '录入模块→存储模块→统计模块', '主菜单→子模块→返回菜单');
s5 = replaceText(s5, '录入模块调用存储模块的结构体数组，统计模块读取数据后排序', '主菜单控制各模块循环调用，Dijkstra 算法计算最短路径');
slides['ppt/slides/slide5.xml'] = s5;

// === SLIDE 6: Module details ===
let s6 = slides['ppt/slides/slide6.xml'];
s6 = replaceText(s6, '作品简要介绍', '校园导航系统模块架构');
const modMap = [
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
for (const [o, n] of modMap) s6 = replaceText(s6, o, n);
s6 = replaceText(s6, '手绘或用工具绘制模块关系图（如 "学生信息管理系统" 分为 "录入模块→存储模块→统计模块"）。', '主菜单控制 13 个核心功能模块，循环调用');
s6 = replaceText(s6, '说明模块交互（如 "录入模块调用存储模块的结构体数组，统计模块读取数据后排序"）。', '输入数字 1-12 选择功能，0 退出系统');
slides['ppt/slides/slide6.xml'] = s6;

// === SLIDE 7 + 8: Demo ===
let s7 = slides['ppt/slides/slide7.xml'];
s7 = replaceText(s7, '作品运行效果展示', '运行效果展示');
slides['ppt/slides/slide7.xml'] = s7;

let s8 = slides['ppt/slides/slide8.xml'];
s8 = replaceText(s8, '作品简要介绍', '校园导航系统');
s8 = replaceText(s8, '系统功能演示与测试用例', '系统功能演示与运行效果');
slides['ppt/slides/slide8.xml'] = s8;

// === SLIDE 9 + 10 + 11 + 12: Technical ===
let s9 = slides['ppt/slides/slide9.xml'];
s9 = replaceText(s9, '子模的详细设计与实现解说', '子模块设计');
s9 = replaceText(s9, '说', '与实现解说');
slides['ppt/slides/slide9.xml'] = s9;

let s10 = slides['ppt/slides/slide10.xml'];
s10 = replaceText(s10, '模块技术解', '核心模块');
s10 = replaceText(s10, '说', '技术解说');
s10 = s10.replace(/<a:t[^>]*>一<\/a:t>/g, '<a:t>一：系统初始化</a:t>');
s10 = s10.replace(/<a:t[^>]*>二<\/a:t>/g, '<a:t>二：添加节点</a:t>');
s10 = s10.replace(/<a:t[^>]*>三<\/a:t>/g, '<a:t>三：添加路径</a:t>');
s10 = s10.replace(/<a:t[^>]*>四<\/a:t>/g, '<a:t>四：最短路径查询</a:t>');
s10 = replaceText(s10, '显示记', '双层循环遍历邻接矩阵');
s10 = replaceText(s10, '修改记', '循环输入节点名称');
s10 = replaceText(s10, '插入新记', '校验编号合法性双向赋值');
s10 = replaceText(s10, '删除记', 'dist/pre/visit 初始化');
s10 = replaceText(s10, '录', '');  // clean up remaining "录" characters from old split text
slides['ppt/slides/slide10.xml'] = s10;

let s11 = slides['ppt/slides/slide11.xml'];
s11 = replaceText(s11, '一。。。。', 'Dijkstra 算法');
s11 = replaceText(s11, '算法逻辑与复杂度分析（以排序/搜索算法为例）', 'Dijkstra 算法逻辑与 O(n²) 复杂度分析');
slides['ppt/slides/slide11.xml'] = s11;

let s12 = slides['ppt/slides/slide12.xml'];
s12 = replaceText(s12, '作品简要介绍', '关键代码解析');
s12 = replaceText(s12, '关键代码细节解析（指针/内存/函数调用）', '系统初始化 / Dijkstra 核心实现 / 文件读写');
slides['ppt/slides/slide12.xml'] = s12;

// === WRITE ===
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

// === VERIFY ===
console.log('=== VERIFICATION ===');
const vZip = new AdmZip(outPath);
for (const entry of vZip.getEntries()) {
  if (entry.entryName.startsWith('ppt/slides/slide') && entry.entryName.endsWith('.xml')) {
    const xml = entry.getData().toString('utf8');
    const texts = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g);
    if (texts) {
      const content = texts.map(t => t.replace(/<[^>]+>/g, '')).filter(t => t.trim()).join(' ');
      console.log(`\n${entry.entryName}:`);
      console.log(`  ${content.substring(0, 200)}`);
    }
  }
}
