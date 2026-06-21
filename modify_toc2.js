const fs = require('fs');
const AdmZip = require('adm-zip');

const docxPath = 'C:\\Users\\zero\\.openclaw\\media\\inbound\\06_-2_实训作品--李泽锐_双面打印_课程_非卷面_考核评分细则_双面打印---a8e20c60-ff12-488f-9be1-6098f6d74f86.docx';

const zip = new AdmZip(docxPath);
const docEntry = zip.getEntry('word/document.xml');
const xmlStr = docEntry.getData().toString('utf8');

// Find TOC title by searching for exactly "目    录" using the XML text content
const paraRegex = /<w:p[\s\S]*?<\/w:p>/g;
let match;
let tocTitleStart = -1;
let tocTitleEnd = -1;
let ch1Start = -1;
let foundToc = false;

while ((match = paraRegex.exec(xmlStr)) !== null) {
  const texts = match[0].match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  if (texts) {
    const text = texts.map(t => t.replace(/<[^>]+>/g, '')).join('');
    const trimmed = text.trim();
    
    // Check for the TOC title: contains both 目 and 录 with spaces
    if (!foundToc && trimmed.includes('目') && trimmed.includes('录') && trimmed.replace(/\s/g, '') === '目录') {
      tocTitleStart = match.index;
      tocTitleEnd = match.index + match[0].length;
      foundToc = true;
      console.log('Found TOC title at byte:', tocTitleStart);
    }
    
    // After TOC title, find the first chapter heading (paragraph START)
    if (foundToc && trimmed.match(/^1\s*\.?\s*需求分析/) && match.index > tocTitleEnd) {
      ch1Start = match.index;
      console.log('Found Chapter 1 text at byte:', ch1Start);
      console.log('Chapter 1 paragraph text:', trimmed);
      // Now find where this paragraph actually STARTS (the <w:p tag)
      // match.index is the start of the regex match, but we need the paragraph start
      // Actually we already have it - match.index is the para regex match start
      break;
    }
  }
}

if (tocTitleStart >= 0 && ch1Start > tocTitleStart) {
  // Get a sample simple paragraph from the document to use as template
  // Find a paragraph with a single w:t tag
  let templateXml = null;
  
  // Reset regex
  paraRegex.lastIndex = 0;
  while ((match = paraRegex.exec(xmlStr)) !== null) {
    if (match.index > ch1Start && match.index < ch1Start + 50000) {
      const tCount = (match[0].match(/<w:t[^>]*>/g) || []).length;
      const hasField = match[0].includes('w:fldChar');
      const hasDrawing = match[0].includes('w:drawing');
      const hasTab = match[0].includes('w:tab');
      
      if (tCount === 1 && !hasField && !hasDrawing && !hasTab) {
        templateXml = match[0];
        console.log('Found template paragraph');
        break;
      }
    }
  }

  if (!templateXml) {
    console.error('Could not find suitable template');
    process.exit(1);
  }

  // Clean the template - remove any text content
  // Template format: <w:p ...><w:pPr>...</w:pPr><w:r><w:rPr>...</w:rPr><w:t>text</w:t></w:r></w:p>
  const textRegex = /(<w:t[^>]*>)[^<]*(<\/w:t>)/;
  const templateClean = templateXml.replace(textRegex, '$1$2');
  
  console.log('Template (clean):', templateClean.substring(0, 200));

  // New TOC entries
  const newTocEntries = [
    "目    录",
    "1. 需求分析与方案选型1",
    "1.1 设计理由与意义1",
    "1.2 功能需求分析1",
    "1.3 方案选型2",
    "2. 系统设计4",
    "2.1 数据结构类型设计4",
    "2.2 整体功能结构设计4",
    "2.3 子模块详细设计6",
    "2.3.1 void initSystem()6",
    "2.3.2 void showMenu()6",
    "2.3.3 void addNode()6",
    "2.3.4 void addEdge()6",
    "2.3.5 void showAllNodes()6",
    "2.3.6 void showMatrix()6",
    "2.3.7 void dijkstra(int start, int end)6",
    "2.3.8 void showPath(int end, int pre[])6",
    "2.3.9 void queryPath()6",
    "2.3.10 void deleteNode()6",
    "2.3.11 void deleteEdge()6",
    "2.3.12 void saveMap()6",
    "2.3.13 void loadMap()6",
    "2.3.14 void drawConsoleMap()6",
    "2.3.15 void findAllPaths()6",
    "2.3.16 void systemInfo()6",
    "2.3.17 主函数 int main()6",
    "2.4 程序流程图设计8",
    "2.4.1 系统界面流程图8",
    "2.4.2 系统初始化模块8",
    "2.4.3 主菜单模块8",
    "2.4.4 添加校园节点8",
    "2.4.5 添加校园路径模块8",
    "2.4.6 查询两点最短路径流程图9",
    "2.4.7 删除节点流程图9",
    "2.4.8 删除路径流程图9",
    "2.4.9 地图数据展示模块流程图9",
    "2.4.10 查询起点到全部节点最短路径流程图9",
    "2.4.11 保存地图至文件流程图9",
    "2.4.12 从文件加载地图流程图10",
    "2.4.13 控制台图形化地图流程图10",
    "2.4.14 系统信息查看流程图10",
    "3. 系统实现11",
    "3.1 系统源代码11",
    "3.2 系统运行结果11",
    "3.2.1 系统首界面11",
    "3.2.2 添加校园节点11",
    "3.2.3 添加校园路径12",
    "3.2.4 查看所有节点信息12",
    "3.2.5 查看邻接矩阵12",
    "3.2.6 查询两点最短路径12",
    "3.2.7 删除节点12",
    "3.2.8 删除路径12",
    "3.2.9 控制台图形化地图12",
    "3.2.10 查询起点到全部节点最短路径12",
    "3.2.11 保存地图至文件12",
    "3.2.12 从文件加载地图13",
    "3.2.13 查看系统信息13",
    "3.2.14 退出系统13",
    "3.3 用户使用手册13"
  ];

  // Generate new TOC paragraphs by filling in the template
  let newTocXml = '';
  for (const entryText of newTocEntries) {
    const paraXml = templateClean.replace(/(<w:t[^>]*>)(<\/w:t>)/, '$1' + entryText + '$2');
    // Also add an ID attribute if needed
    newTocXml += paraXml;
  }

  // Replace the old TOC in the XML
  const newXml = xmlStr.substring(0, tocTitleStart) + newTocXml + xmlStr.substring(ch1Start);

  console.log(`\nOriginal XML size: ${xmlStr.length}`);
  console.log(`New XML size: ${newXml.length}`);
  console.log(`TOC replaced: ${tocTitleStart} to ${ch1Start}`);

  // Write modified DOCX
  const outPath = 'C:\\Users\\zero\\.openclaw\\workspace\\06_-2_实训作品--李泽锐_双面打印_课程_非卷面_考核评分细则_双面打印---已修改目录.docx';
  
  const newZip = new AdmZip();
  for (const entry of zip.getEntries()) {
    if (entry.entryName === 'word/document.xml') {
      newZip.addFile('word/document.xml', Buffer.from(newXml, 'utf8'));
    } else if (!entry.isDirectory) {
      newZip.addFile(entry.entryName, entry.getData());
    }
  }
  newZip.writeZip(outPath);
  console.log('Written to:', outPath);
} else {
  console.error('Could not find TOC boundaries');
  if (tocTitleStart < 0) console.error('TOC title not found');
  if (ch1Start < 0) console.error('Chapter 1 not found');
}
