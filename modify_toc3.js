const fs = require('fs');
const AdmZip = require('adm-zip');

const docxPath = 'C:\\Users\\zero\\.openclaw\\media\\inbound\\06_-2_实训作品--李泽锐_双面打印_课程_非卷面_考核评分细则_双面打印---a8e20c60-ff12-488f-9be1-6098f6d74f86.docx';
const outPath = 'C:\\Users\\zero\\.openclaw\\workspace\\06_-2_实训作品--李泽锐_双面打印_课程_非卷面_考核评分细则_双面打印---已修改目录.docx';

const zip = new AdmZip(docxPath);
const docEntry = zip.getEntry('word/document.xml');
const xmlStr = docEntry.getData().toString('utf8');

// TOC entries
const tocEntries = [
  { text: "目    录", page: "", level: 0 },
  { text: "1. 需求分析与方案选型", page: "1", level: 1 },
  { text: "1.1 设计理由与意义", page: "1", level: 2 },
  { text: "1.2 功能需求分析", page: "1", level: 2 },
  { text: "1.3 方案选型", page: "2", level: 2 },
  { text: "2. 系统设计", page: "4", level: 1 },
  { text: "2.1 数据结构类型设计", page: "4", level: 2 },
  { text: "2.2 整体功能结构设计", page: "4", level: 2 },
  { text: "2.3 子模块详细设计", page: "6", level: 2 },
  { text: "2.3.1 void initSystem()", page: "6", level: 3 },
  { text: "2.3.2 void showMenu()", page: "6", level: 3 },
  { text: "2.3.3 void addNode()", page: "6", level: 3 },
  { text: "2.3.4 void addEdge()", page: "6", level: 3 },
  { text: "2.3.5 void showAllNodes()", page: "6", level: 3 },
  { text: "2.3.6 void showMatrix()", page: "6", level: 3 },
  { text: "2.3.7 void dijkstra(int start, int end)", page: "6", level: 3 },
  { text: "2.3.8 void showPath(int end, int pre[])", page: "6", level: 3 },
  { text: "2.3.9 void queryPath()", page: "6", level: 3 },
  { text: "2.3.10 void deleteNode()", page: "6", level: 3 },
  { text: "2.3.11 void deleteEdge()", page: "6", level: 3 },
  { text: "2.3.12 void saveMap()", page: "6", level: 3 },
  { text: "2.3.13 void loadMap()", page: "6", level: 3 },
  { text: "2.3.14 void drawConsoleMap()", page: "6", level: 3 },
  { text: "2.3.15 void findAllPaths()", page: "6", level: 3 },
  { text: "2.3.16 void systemInfo()", page: "6", level: 3 },
  { text: "2.3.17 主函数 int main()", page: "6", level: 3 },
  { text: "2.4 程序流程图设计", page: "8", level: 2 },
  { text: "2.4.1 系统界面流程图", page: "8", level: 3 },
  { text: "2.4.2 系统初始化模块", page: "8", level: 3 },
  { text: "2.4.3 主菜单模块", page: "8", level: 3 },
  { text: "2.4.4 添加校园节点", page: "8", level: 3 },
  { text: "2.4.5 添加校园路径模块", page: "8", level: 3 },
  { text: "2.4.6 查询两点最短路径流程图", page: "9", level: 3 },
  { text: "2.4.7 删除节点流程图", page: "9", level: 3 },
  { text: "2.4.8 删除路径流程图", page: "9", level: 3 },
  { text: "2.4.9 地图数据展示模块流程图", page: "9", level: 3 },
  { text: "2.4.10 查询起点到全部节点最短路径流程图", page: "9", level: 3 },
  { text: "2.4.11 保存地图至文件流程图", page: "9", level: 3 },
  { text: "2.4.12 从文件加载地图流程图", page: "10", level: 3 },
  { text: "2.4.13 控制台图形化地图流程图", page: "10", level: 3 },
  { text: "2.4.14 系统信息查看流程图", page: "10", level: 3 },
  { text: "3. 系统实现", page: "11", level: 1 },
  { text: "3.1 系统源代码", page: "11", level: 2 },
  { text: "3.2 系统运行结果", page: "11", level: 2 },
  { text: "3.2.1 系统首界面", page: "11", level: 3 },
  { text: "3.2.2 添加校园节点", page: "11", level: 3 },
  { text: "3.2.3 添加校园路径", page: "12", level: 3 },
  { text: "3.2.4 查看所有节点信息", page: "12", level: 3 },
  { text: "3.2.5 查看邻接矩阵", page: "12", level: 3 },
  { text: "3.2.6 查询两点最短路径", page: "12", level: 3 },
  { text: "3.2.7 删除节点", page: "12", level: 3 },
  { text: "3.2.8 删除路径", page: "12", level: 3 },
  { text: "3.2.9 控制台图形化地图", page: "12", level: 3 },
  { text: "3.2.10 查询起点到全部节点最短路径", page: "12", level: 3 },
  { text: "3.2.11 保存地图至文件", page: "12", level: 3 },
  { text: "3.2.12 从文件加载地图", page: "13", level: 3 },
  { text: "3.2.13 查看系统信息", page: "13", level: 3 },
  { text: "3.2.14 退出系统", page: "13", level: 3 },
  { text: "3.3 用户使用手册", page: "13", level: 2 }
];

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getStyleId(level) {
  if (level === 0 || level === 1) return '16';
  if (level === 2) return '17';
  if (level === 3) return '9';
  return '16';
}

function makeTocPara(text, page, level) {
  const styleId = getStyleId(level);
  if (level === 0) {
    return '<w:p><w:pPr><w:pStyle w:val="' + styleId + '"/><w:jc w:val="center"/><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8732"/></w:tabs><w:rPr><w:highlight w:val="none"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:hint="eastAsia"/><w:b/><w:sz w:val="24"/><w:szCs w:val="24"/><w:highlight w:val="none"/></w:rPr><w:t xml:space="preserve">' + esc(text) + '</w:t></w:r></w:p>';
  }
  return '<w:p><w:pPr><w:pStyle w:val="' + styleId + '"/><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8732"/></w:tabs><w:rPr><w:highlight w:val="none"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:hint="eastAsia"/><w:highlight w:val="none"/></w:rPr><w:t xml:space="preserve">' + esc(text) + '</w:t></w:r><w:r><w:rPr><w:highlight w:val="none"/></w:rPr><w:tab/></w:r><w:r><w:rPr><w:rFonts w:hint="eastAsia"/><w:highlight w:val="none"/></w:rPr><w:t>' + esc(page) + '</w:t></w:r></w:p>';
}

// Build TOC XML
let newTocXml = '';
for (const entry of tocEntries) {
  newTocXml += makeTocPara(entry.text, entry.page, entry.level);
}

// Find TOC boundaries
const paraRegex = /<w:p[\s\S]*?<\/w:p>/g;
let match;
let tocTitleStart = -1;
let ch1Start = -1;
let foundToc = false;

while ((match = paraRegex.exec(xmlStr)) !== null) {
  const texts = match[0].match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  if (texts) {
    const text = texts.map(t => t.replace(/<[^>]+>/g, '')).join('');
    const trimmed = text.trim();
    
    if (!foundToc && trimmed.includes('目') && trimmed.includes('录') && trimmed.replace(/\s/g, '') === '目录') {
      tocTitleStart = match.index;
      foundToc = true;
    }
    
    if (foundToc && match.index > tocTitleStart + 100) {
      if (/^1\s*\.\s*需求分析/.test(trimmed) && !/\d$/.test(trimmed)) {
        ch1Start = match.index;
        break;
      }
    }
  }
}

console.log('TOC title at byte:', tocTitleStart);
console.log('Chapter 1 at byte:', ch1Start);

if (tocTitleStart < 0 || ch1Start < 0) {
  console.error('TOC boundaries not found');
  process.exit(1);
}

// Replace and write
const newXml = xmlStr.substring(0, tocTitleStart) + newTocXml + xmlStr.substring(ch1Start);

const newZip = new AdmZip();
for (const entry of zip.getEntries()) {
  if (entry.entryName === 'word/document.xml') {
    newZip.addFile('word/document.xml', Buffer.from(newXml, 'utf8'));
  } else if (!entry.isDirectory) {
    newZip.addFile(entry.entryName, entry.getData());
  }
}
newZip.writeZip(outPath);

console.log('Written to desktop:', outPath);
console.log('TOC entries:', tocEntries.length);
