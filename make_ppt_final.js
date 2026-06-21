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

// Surgery approach: find full <a:r> runs containing specific text and replace them
function replaceRun(xml, oldText, replacementXml) {
  // Match a complete <a:r>...</a:r> that contains the text
  const runRegex = /<a:r>[\s\S]*?<a:t[^>]*>[^<]*<\/a:t>[\s\S]*?<\/a:r>/g;
  return xml.replace(runRegex, (match) => {
    if (match.includes(oldText)) {
      return replacementXml;
    }
    return match;
  });
}

// Generate a replacement run for a given text
function makeRun(text) {
  // Use a simple run template without complex rPr
  return '<a:r><a:rPr lang="zh-CN" altLang="en-US" sz="4400" b="0" dirty="0"><a:solidFill><a:schemeClr val="bg1"/></a:solidFill></a:rPr><a:t>' + text + '</a:t></a:r>';
}

// SLIDE 1: Fix "展" "示" problem - explode the a:r for the title
let s1 = slides['ppt/slides/slide1.xml'];
// Find and replace the entire a:r containing "学生成"
s1 = s1.replace(/<a:r>[\s\S]*?<a:t[^>]*>学生成<\/a:t>[\s\S]*?<\/a:r>/, 
  '<a:r><a:rPr lang="zh-CN" altLang="en-US" sz="4800" dirty="0"><a:solidFill><a:schemeClr val="accent1"/></a:solidFill></a:rPr><a:t>校园导航系统</a:t></a:r>');
// Remove the next a:r containing "绩管理系统"
s1 = s1.replace(/<a:r>[\s\S]*?<a:t[^>]*>绩管理系统<\/a:t>[\s\S]*?<\/a:r>/, '');
// Fix the title "展" "示" - find the a:r containing "展" and merge with next containing "示"
s1 = s1.replace(/<a:r>[\s\S]*?<a:t[^>]*>《基础程序设计实训》作品展<\/a:t>[\s\S]*?<\/a:r>[\s\S]*?<a:r>[\s\S]*?<a:t[^>]*>示<\/a:t>[\s\S]*?<\/a:r>/,
  '<a:r><a:rPr lang="zh-CN" altLang="en-US" sz="4400" dirty="0"><a:solidFill><a:schemeClr val="bg1"/></a:solidFill></a:rPr><a:t>《基础程序设计实训》作品展示</a:t></a:r>');
s1 = replaceTextSimple(s1, '2501123121', '202501150111');
s1 = replaceTextSimple(s1, '张三', '李泽锐');
s1 = replaceTextSimple(s1, '2026-5-27', '2026-6-9');
slides['ppt/slides/slide1.xml'] = s1;

function replaceTextSimple(xml, oldText, newText) {
  return xml.replace(new RegExp(oldText, 'g'), newText);
}

// SLIDE 2: Fix split text
let s2 = slides['ppt/slides/slide2.xml'];
s2 = s2.replace(/<a:r>[\s\S]*?<a:t[^>]*>子模的详细设计与实现解<\/a:t>[\s\S]*?<\/a:r>[\s\S]*?<a:r>[\s\S]*?<a:t[^>]*>说<\/a:t>[\s\S]*?<\/a:r>/,
  '<a:r><a:rPr lang="zh-CN" altLang="en-US" sz="2400" dirty="0"></a:rPr><a:t>子模块详细设计与实现解说</a:t></a:r>');
s2 = s2.replace(/<a:r>[\s\S]*?<a:t[^>]*>作品简要介<\/a:t>[\s\S]*?<\/a:r>[\s\S]*?<a:r>[\s\S]*?<a:t[^>]*>绍<\/a:t>[\s\S]*?<\/a:r>/,
  '<a:r><a:rPr lang="zh-CN" altLang="en-US" sz="2400" dirty="0"></a:rPr><a:t>作品简介</a:t></a:r>');
s2 = replaceTextSimple(s2, '作品运行效果展示', '运行效果展示');
slides['ppt/slides/slide2.xml'] = s2;

// SLIDE 3
let s3 = slides['ppt/slides/slide3.xml'];
s3 = s3.replace(/<a:r>[\s\S]*?<a:t[^>]*>作品简要介<\/a:t>[\s\S]*?<\/a:r>[\s\S]*?<a:r>[\s\S]*?<a:t[^>]*>绍<\/a:t>[\s\S]*?<\/a:r>/,
  '<a:r><a:rPr lang="zh-CN" altLang="en-US" sz="2400" dirty="0"></a:rPr><a:t>作品简介</a:t></a:r>');
slides['ppt/slides/slide3.xml'] = s3;

// SLIDE 4
let s4 = slides['ppt/slides/slide4.xml'];
s4 = s4.replace(/<a:r>[\s\S]*?<a:t[^>]*>作品简要介绍<\/a:t>[\s\S]*?<\/a:r>/,
  '<a:r><a:rPr lang="zh-CN" altLang="en-US" sz="2400" dirty="0"></a:rPr><a:t>校园导航系统简介</a:t></a:r>');
s4 = s4.replace(/<a:r>[\s\S]*?<a:t[^>]*>系统简<\/a:t>[\s\S]*?<\/a:r>[\s\S]*?<a:r>[\s\S]*?<a:t[^>]*>介<\/a:t>[\s\S]*?<\/a:r>/,
  '<a:r><a:rPr lang="zh-CN" altLang="en-US" sz="2400" dirty="0"></a:rPr><a:t>系统概述</a:t></a:r>');
s4 = s4.replace(/<a:r>[\s\S]*?<a:t[^>]*>代码量与复杂<\/a:t>[\s\S]*?<\/a:r>[\s\S]*?<a:r>[\s\S]*?<a:t[^>]*>度<\/a:t>[\s\S]*?<\/a:r>/,
  '<a:r><a:rPr lang="zh-CN" altLang="en-US" sz="2400" dirty="0"></a:rPr><a:t>代码量与复杂度</a:t></a:r>');
s4 = s4.replace(/<a:r>[\s\S]*?<a:t[^>]*>数据结构选<\/a:t>[\s\S]*?<\/a:r>[\s\S]*?<a:r>[\s\S]*?<a:t[^>]*>型<\/a:t>[\s\S]*?<\/a:r>/,
  '<a:r><a:rPr lang="zh-CN" altLang="en-US" sz="2400" dirty="0"></a:rPr><a:t>数据结构选型</a:t></a:r>');
s4 = s4.replace(/<a:r>[\s\S]*?<a:t[^>]*>功能模块个<\/a:t>[\s\S]*?<\/a:r>[\s\S]*?<a:r>[\s\S]*?<a:t[^>]*>数<\/a:t>[\s\S]*?<\/a:r>/,
  '<a:r><a:rPr lang="zh-CN" altLang="en-US" sz="2400" dirty="0"></a:rPr><a:t>功能模块总数</a:t></a:r>');
s4 = s4.replace(/<a:t[^>]*>。。。<\/a:t>/g, '<a:t>基于C语言 + Dijkstra算法 + 邻接矩阵的校园导航系统</a:t>');
s4 = s4.replace(/<a:t[^>]*>1<\/a:t>/g, '<a:t>代码量：约2000行</a:t>');
s4 = s4.replace(/<a:t[^>]*>2<\/a:t>/g, '<a:t>数据结构：邻接矩阵（二维数组）</a:t>');
s4 = s4.replace(/<a:t[^>]*>3<\/a:t>/g, '<a:t>模块数量：13个核心功能模块</a:t>');
s4 = replaceTextSimple(s4, '展示关键结构体定义', 'CampusMap结构体封装核心地图数据');
slides['ppt/slides/slide4.xml'] = s4;

// SLIDE 5
let s5 = slides['ppt/slides/slide5.xml'];
s5 = replaceTextSimple(s5, '学生信息管理系统', '校园导航系统');
s5 = replaceTextSimple(s5, '录入模块→存储模块→统计模块', '主菜单→子模块→返回菜单循环');
s5 = replaceTextSimple(s5, '录入模块调用存储模块的结构体数组，统计模块读取数据后排序', '主菜单控制模块循环调用，Dijkstra算法计算最短路径');
// Also fix "作品简要介绍" in slide 5
s5 = s5.replace(/<a:r>[\s\S]*?<a:t[^>]*>作品简要介绍<\/a:t>[\s\S]*?<\/a:r>/,
  '<a:r><a:rPr lang="zh-CN" altLang="en-US" sz="2400" dirty="0"></a:rPr><a:t>校园导航系统架构</a:t></a:r>');
slides['ppt/slides/slide5.xml'] = s5;

// SLIDE 6
let s6 = slides['ppt/slides/slide6.xml'];
s6 = replaceTextSimple(s6, '作品简要介绍', '校园导航系统模块架构');
s6 = replaceTextSimple(s6, '学生信息管理系统', '校园导航系统');
s6 = replaceTextSimple(s6, '手绘或用工具绘制模块关系图（如 "', '');
s6 = replaceTextSimple(s6, '" 分为 "录入模块→存储模块→统计模块"）。', '');
s6 = replaceTextSimple(s6, '说明模块交互（如 "录入模块调用存储模块的结构体数组，统计模块读取数据后排序"）。', '主菜单控制13个模块，循环调用执行');
s6 = replaceTextSimple(s6, '录入模块→存储模块→统计模块', '');
s6 = replaceTextSimple(s6, '学生信息录入模块', '校园节点录入模块');
s6 = replaceTextSimple(s6, '学生信息查询模块', '校园路径录入模块');
s6 = replaceTextSimple(s6, '学生信息修改模块', '两点最短路径查询');
s6 = replaceTextSimple(s6, '学生信息删除模块', '全节点路径查询');
s6 = replaceTextSimple(s6, '学生信息插入模块', '删除节点');
s6 = replaceTextSimple(s6, '学生信息输出模块', '删除路径');
s6 = replaceTextSimple(s6, '按学号查询学生信息', '保存地图到文件');
s6 = replaceTextSimple(s6, '按姓名查询学生信息', '从文件加载地图');
s6 = replaceTextSimple(s6, '输出优秀学生相关信息', '控制台图形化地图');
s6 = replaceTextSimple(s6, '输出不及格学生信息', '系统信息');
slides['ppt/slides/slide6.xml'] = s6;

// SLIDE 7-8
let s7 = slides['ppt/slides/slide7.xml'];
s7 = replaceTextSimple(s7, '作品运行效果展示', '运行效果展示');
slides['ppt/slides/slide7.xml'] = s7;

let s8 = slides['ppt/slides/slide8.xml'];
s8 = replaceTextSimple(s8, '作品简要介绍', '校园导航系统');
s8 = replaceTextSimple(s8, '系统功能演示与测试用例', '系统功能演示与运行效果');
slides['ppt/slides/slide8.xml'] = s8;

// SLIDE 9-12
let s9 = slides['ppt/slides/slide9.xml'];
s9 = replaceTextSimple(s9, '子模的详细设计与实现解说', '子模块设计与实现解说');
slides['ppt/slides/slide9.xml'] = s9;

let s10 = slides['ppt/slides/slide10.xml'];
s10 = replaceTextSimple(s10, '模块技术解说', '核心模块技术解说');
s10 = s10.replace(/<a:t[^>]*>一<\/a:t>/g, '<a:t>模块一：邻接矩阵初始化</a:t>');
s10 = s10.replace(/<a:t[^>]*>二<\/a:t>/g, '<a:t>模块二：添加校园节点</a:t>');
s10 = s10.replace(/<a:t[^>]*>三<\/a:t>/g, '<a:t>模块三：添加校园路径</a:t>');
s10 = s10.replace(/<a:t[^>]*>四<\/a:t>/g, '<a:t>模块四：Dijkstra最短路径</a:t>');
s10 = replaceTextSimple(s10, '显示记录', '双重循环初始化矩阵');
s10 = replaceTextSimple(s10, '修改记录', '循环输入节点名称');
s10 = replaceTextSimple(s10, '插入新记录', '校验编号 + 双向赋值');
s10 = replaceTextSimple(s10, '删除记录', 'dist+pre+visit初始化');
slides['ppt/slides/slide10.xml'] = s10;

let s11 = slides['ppt/slides/slide11.xml'];
s11 = replaceTextSimple(s11, '一。。。。', 'Dijkstra最短路径算法');
s11 = replaceTextSimple(s11, '算法逻辑与复杂度分析（以排序/搜索算法为例）', 'Dijkstra算法逻辑与 O(n²) 复杂度分析');
slides['ppt/slides/slide11.xml'] = s11;

let s12 = slides['ppt/slides/slide12.xml'];
s12 = replaceTextSimple(s12, '作品简要介绍', '关键代码解析');
s12 = replaceTextSimple(s12, '关键代码细节解析（指针/内存/函数调用）', '邻接矩阵初始化 / Dijkstra核心实现 / 文件读写');
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
console.log('=== FINAL ===');
const vZip = new AdmZip(outPath);
const badWords = ['学生成绩管理', '张三', '2501123121', '不及格', '学生信息管理', '录入模块→存储', '录入模块调用'];
let hasIssues = false;
for (const entry of vZip.getEntries()) {
  if (entry.entryName.startsWith('ppt/slides/slide') && entry.entryName.endsWith('.xml')) {
    const xml = entry.getData().toString('utf8');
    const texts = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g);
    if (texts) {
      const content = texts.map(t => t.replace(/<[^>]+>/g, '')).filter(t => t.trim()).join(' ');
      console.log(`\n${entry.entryName}:`);
      console.log(`  ${content.substring(0, 160)}`);
      for (const bad of badWords) {
        if (content.includes(bad)) {
          console.log(`  ⚠️ "${bad}"`);
          hasIssues = true;
        }
      }
    }
  }
}
if (!hasIssues) console.log('\n✅ All clean!');
