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

// Define replacements for each slide
const replacements = {
  // Slide 1 - Cover page
  'ppt/slides/slide1.xml': [
    ['学生成绩管理系统', '增强版校园导航系统'],
    ['2501123121', '202501150111'],
    ['张三', '李泽锐'],
    ['2026-5-27', '2026-6-9'],
    ['2025', '2025'],
    ['级软件工程', '级软件工程'],
    ['1', '1'],
    ['班', '班'],
    // Update subtitle text
    ['《基础程序设计实训》作品展', '《基础程序设计实训》作品展示'],
  ],

  // Slide 2 - Table of Contents
  'ppt/slides/slide2.xml': [
    ['作品简要介', '作品简介'],
    ['绍', ''],
    ['子模的详细设计与实现解', '子模块详细设计'],
    ['说', '与实现解说'],
    ['作品运行效果展示', '运行效果展示'],
  ],

  // Slide 3 - Part 1 heading
  'ppt/slides/slide3.xml': [
    ['作品简要介', '作品简介'],
    ['绍', ''],
  ],

  // Slide 4 - Introduction content
  'ppt/slides/slide4.xml': [
    ['作品简要介绍', '校园导航系统简介'],
    ['系统简', '系统概述'],
    ['介', ''],
    ['。。。', '基于C语言 + Dijkstra算法 + 邻接矩阵的校园导航系统，支持节点/路径管理、最短路径查询、地图可视化、数据持久化等功能。'],
    ['代码量与复杂', '代码量与复杂度'],
    ['度', ''],
    ['展示关键结构体定义', 'CampusMap结构体封装节点、邻接矩阵、计数等核心数据'],
    ['数据结构选', '数据结构选型'],
    ['型', ''],
    ['功能模块个', '功能模块总数'],
    ['数', ''],
    ['1', '约2000行'],
    ['2', '邻接矩阵(二维数组)'],
    ['3', '13个功能模块 + 主控菜单'],
  ],

  // Slide 5 - System architecture
  'ppt/slides/slide5.xml': [
    ['作品简要介绍', '系统功能架构图'],
    ['学生信息管理系统', '增强版校园导航系统'],
    ['录入模块→存储模块→统计模块', '主菜单→功能选择→模块执行→返回菜单'],
    ['录入模块调用存储模块的结构体数组，统计模块读取数据后排序', '主菜单控制各模块循环调用，Dijkstra算法计算最短路径，邻接矩阵存储地图数据'],
  ],

  // Slide 6 - Module details
  'ppt/slides/slide6.xml': [
    ['作品简要介绍', '系统功能架构图'],
    ['主菜单控制模块', '主菜单控制模块'],
    ['学生信息录入模块', '节点录入模块(addNode)'],
    ['学生信息查询模块', '路径录入模块(addEdge)'],
    ['学生信息修改模块', '最短路径查询模块(queryPath)'],
    ['学生信息删除模块', '全节点路径查询模块(findAllPaths)'],
    ['学生信息插入模块', '节点删除模块(deleteNode)'],
    ['学生信息输出模块', '路径删除模块(deleteEdge)'],
    ['按学号查询学生信息', '地图文件保存模块(saveMap)'],
    ['按姓名查询学生信息', '地图文件加载模块(loadMap)'],
    ['输出优秀学生相关信息', '图形化地图模块(drawConsoleMap)'],
    ['输出不及格学生信息', '系统信息模块(systemInfo)'],
    ['手绘或用工具绘制模块关系图（如 "学生信息管理系统" 分为 "录入模块→存储模块→统计模块"）。', ''],
    ['说明模块交互（如 "录入模块调用存储模块的结构体数组，统计模块读取数据后排序"）。', ''],
  ],

  // Slide 7 - Part 2 heading
  'ppt/slides/slide7.xml': [
    ['作品运行效果展示', '运行效果展示'],
  ],

  // Slide 8 - Demo
  'ppt/slides/slide8.xml': [
    ['作品简要介绍', '系统功能演示'],
    ['系统功能演示与测试用例', '系统功能演示与运行效果'],
  ],

  // Slide 9 - Part 3 heading
  'ppt/slides/slide9.xml': [
    ['子模的详细设计与实现解说', '子模块设计与实现解说'],
  ],

  // Slide 10 - Module technical explanation
  'ppt/slides/slide10.xml': [
    ['模块技术解', '核心模块技术解说'],
    ['说', ''],
    ['模块', '模块'],
    ['一', '一：邻接矩阵初始化'],
    ['二', '二：添加校园节点'],
    ['三', '三：添加校园路径'],
    ['四', '四：Dijkstra最短路径算法'],
    ['显示记', '初始化双层循环遍历'],
    ['录', '赋值0/INF'],
    ['修改记', '循环输入节点名称'],
    ['录', '存入nodes数组'],
    ['插入新记', '校验编号合法性'],
    ['录', '双向赋值邻接矩阵'],
    ['删除记', 'dist/pre/visit数组初始化'],
    ['录', '松弛操作更新最短路径'],
    ['1', 'O(n²)'],
    ['2', 'O(1)'],
    ['3', 'O(1)'],
    ['4', 'O(n²)'],
  ],

  // Slide 11 - Algorithm
  'ppt/slides/slide11.xml': [
    ['模块', 'Dijkstra最短路径算法'],
    ['一。。。。', ''],
    ['算法逻辑与复杂度分析（以排序/搜索算法为例）', '算法逻辑与复杂度分析'],
  ],

  // Slide 12 - Code details
  'ppt/slides/slide12.xml': [
    ['作品简要介绍', '关键代码解析'],
    ['关键代码细节解析（指针/内存/函数调用）', '邻接矩阵初始化 / Dijkstra核心实现 / 文件读写'],
  ],
};

// Apply replacements to each slide
for (const [slideName, reps] of Object.entries(replacements)) {
  if (!slides[slideName]) {
    console.log(`Slide not found: ${slideName}`);
    continue;
  }
  
  let xml = slides[slideName];
  
  // Apply each replacement pair
  for (const [oldText, newText] of reps) {
    // Replace in a:t text content (both regular text and with xml:space)
    // We need to be careful to only replace text content, not XML tags
    const regex = new RegExp(escapeRegex(oldText).replace(/\s+/g, '\\s*'), 'g');
    
    // Check how many replacements and apply
    const before = xml;
    xml = xml.replace(regex, newText);
    
    if (before !== xml) {
      const diffCount = (before.match(regex) || []).length;
      // Don't log every single replacement
    }
  }
  
  slides[slideName] = xml;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

console.log('PPT generated:', outPath);
console.log('Slides modified:', Object.keys(replacements).length);

// Verify output
const verifyZip = new AdmZip(outPath);
for (const entry of verifyZip.getEntries()) {
  if (entry.entryName.startsWith('ppt/slides/slide') && entry.entryName.endsWith('.xml')) {
    const xml = entry.getData().toString('utf8');
    const texts = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g);
    if (texts) {
      const content = texts.map(t => t.replace(/<[^>]+>/g, '')).filter(t => t.trim()).join(' | ');
      console.log(`  ${entry.entryName}: ${content.substring(0, 100)}`);
    }
  }
}
