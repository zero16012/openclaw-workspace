const fs = require('fs');
const AdmZip = require('adm-zip');

const docxPath = 'C:\\Users\\zero\\.openclaw\\media\\inbound\\06_-2_实训作品--李泽锐_双面打印_课程_非卷面_考核评分细则_双面打印---a8e20c60-ff12-488f-9be1-6098f6d74f86.docx';

const zip = new AdmZip(docxPath);
const docEntry = zip.getEntry('word/document.xml');
const xmlStr = docEntry.getData().toString('utf8');

// Find the old TOC text entries
const oldTocEntries = [
  "目    录",
  "1. 需求分析与方案选型1",
  "1.1 设计理由与意义1",
  "1.2 功能需求分析1",
  "1.3 方案选型2",
  "2. 系统设计4",
  "2.1 数据结构类型设计4",
  "2.2 整体功能结构设计4",
  "2.3 子模块详细设计6",
  "2.3.1 void Inputfun()6",
  "2.3.2 void Getinformation()6",
  "2.3.3 int Searchbynum (int no)\\int Searchbyname (char na[50])6",
  "2.3.4 void Seekinformation()\\void Printinformation(int x)6",
  "2.3.5 void Modifyinformation()6",
  "2.3.6 void Deleteinformation()7",
  "2.3.7 void Insertinformaton()7",
  "2.3.8 void Showthefail()7",
  "2.3.9 void Stu_p()7",
  "2.3.10 void Chengjitongji()7",
  "2.3.11 主函数void main()7",
  "2.4 程序流程图设计8",
  "2.4.1 系统界面流程图8",
  "2.4.2 录入学生成绩10",
  "2.4.3 查找学生信息10",
  "2.4.4 修改学生信息10",
  "2.4.5 删除学生信息11",
  "2.4.6 插入学生信息12",
  "2.4.7 优秀学生信息12",
  "2.4.8 不及格学生信息12",
  "2.4.9 成绩统计模块13",
  "3.系统实现14",
  "3.1 系统源代码14",
  "3.2 系统运行结果30",
  "3.2.1 系统首界面30",
  "3.2.2 首次输入学生信息31",
  "3.2.3 查找学生信息32",
  "3.2.4 修改学生信息34",
  "3.2.5 删除学生信息36",
  "3.2.6 插入学生信息37",
  "3.2.7 优秀学生信息37",
  "3.2.8 不及格学生信息38",
  "3.2.9 课程成绩统计38",
  "3.3 用户使用手册40"
];

// New TOC entries (matching actual document content)
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

// First, let's find the first old TOC entry in the XML to get the exact paragraph XML
function findParaWithText(xml, text) {
  const paraRegex = /<w:p[\s\S]*?<\/w:p>/g;
  let match;
  while ((match = paraRegex.exec(xml)) !== null) {
    const texts = match[0].match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (texts) {
      const fullText = texts.map(t => t.replace(/<[^>]+>/g, '')).join('');
      if (fullText.trim() === text) {
        return { xml: match[0], index: match.index, length: match[0].length };
      }
    }
  }
  return null;
}

// Find the first TOC entry
const firstEntry = findParaWithText(xmlStr, oldTocEntries[0]);
if (!firstEntry) {
  console.error('Could not find TOC title "目    录"');
  process.exit(1);
}

// Find the last TOC entry
const lastEntry = findParaWithText(xmlStr, oldTocEntries[oldTocEntries.length - 1]);
if (!lastEntry) {
  console.error('Could not find last TOC entry');
  process.exit(1);
}

console.log(`First TOC entry at position ${firstEntry.index}`);
console.log(`Last TOC entry at position ${lastEntry.index}, length ${lastEntry.length}`);
console.log(`Last TOC entry ends at position ${lastEntry.index + lastEntry.length}`);

// Extract a template paragraph XML from the first content entry (e.g., index 1, first TOC item after title)
const templateEntry = findParaWithText(xmlStr, oldTocEntries[1]);
if (!templateEntry) {
  console.error('Could not find template entry');
  process.exit(1);
}

console.log(`\nTemplate paragraph XML:\n${templateEntry.xml.substring(0, 500)}`);

// Now get the full TOC section to replace
const tocStart = firstEntry.index;
const tocEnd = lastEntry.index + lastEntry.length;

// Get the template XML for a TOC entry (use the first content entry)
const templateXml = templateEntry.xml;

// Extract the template structure - replace the text content
// Find the <w:t> tag in the template
const tRegex = /<w:t[^>]*>([^<]*)<\/w:t>/;
const tMatch = templateXml.match(tRegex);
if (!tMatch) {
  console.error('Could not find text tag in template');
  process.exit(1);
}

console.log(`\nText tag template: "${tMatch[0]}"`);

// Build the new TOC section XML by generating each paragraph
function generateTocPara(text, templateXml, oldText) {
  // Replace the text content in the template
  let result = templateXml;
  
  // Find all w:t tags and replace their content
  // The template has one w:t tag with the old text
  const tRegexGlobal = /(<w:t[^>]*>)[^<]*(<\/w:t>)/g;
  let count = 0;
  result = result.replace(tRegexGlobal, (match, open, close) => {
    count++;
    // For the first w:t (or matching one), replace text
    if (count === 1) {
      return open + text + close;
    }
    return match;
  });
  
  return result;
}

// Build new TOC
let newTocXml = '';
for (let i = 0; i < newTocEntries.length; i++) {
  if (i === 0) {
    // Use the original title paragraph template (might be different styling)
    const titleTemplate = firstEntry.xml;
    const titleRegex = /(<w:t[^>]*>)[^<]*(<\/w:t>)/g;
    let newTitleXml = titleTemplate.replace(titleRegex, (match, open, close) => {
      return open + newTocEntries[i] + close;
    });
    newTocXml += newTitleXml;
  } else {
    newTocXml += generateTocPara(newTocEntries[i], templateXml);
  }
}

// Replace the old TOC section with the new one
const newXml = xmlStr.substring(0, tocStart) + newTocXml + xmlStr.substring(tocEnd);

console.log(`\nOld TOC length: ${tocEnd - tocStart} bytes`);
console.log(`New TOC length: ${newTocXml.length} bytes`);
console.log(`Original XML length: ${xmlStr.length}`);
console.log(`New XML length: ${newXml.length}`);

// Write the modified document
const newZip = new AdmZip();
// Copy all entries from original zip
const originalEntries = zip.getEntries();
for (const entry of originalEntries) {
  if (entry.entryName === 'word/document.xml') {
    // Add modified document.xml
    newZip.addFile('word/document.xml', Buffer.from(newXml, 'utf8'));
  } else {
    // Copy original entry
    if (!entry.isDirectory) {
      newZip.addFile(entry.entryName, entry.getData());
    }
  }
}

// Also copy [Content_Types].xml and other required files
// Copy all directory entries
for (const entry of originalEntries) {
  if (entry.isDirectory) {
    newZip.addFile(entry.entryName, Buffer.alloc(0));
  }
}

const outPath = 'C:\\Users\\zero\\.openclaw\\workspace\\06_-2_实训作品--李泽锐_双面打印_课程_非卷面_考核评分细则_双面打印---已修改目录.docx';
newZip.writeZip(outPath);

console.log(`\nModified DOCX written to: ${outPath}`);
console.log('Done!');
