const fs = require('fs');
const AdmZip = require('adm-zip');

const outPath = 'C:\\Users\\zero\\.openclaw\\workspace\\06_-2_实训作品--李泽锐_双面打印_课程_非卷面_考核评分细则_双面打印---已修改目录.docx';

const zip = new AdmZip(outPath);
const docEntry = zip.getEntry('word/document.xml');
const xmlStr = docEntry.getData().toString('utf8');

// Search for various TOC marker texts
const markers = ['目    录', '目录', '需求分析', '设计理由', '方案选型'];
for (const m of markers) {
  let pos = 0;
  let count = 0;
  while ((pos = xmlStr.indexOf(m, pos)) >= 0 && count < 5) {
    console.log(`"${m}" at pos: ${pos}`);
    pos += m.length;
    count++;
  }
}

// Extract all text lines to see the full document flow
const paraRegex = /<w:p[\s\S]*?<\/w:p>/g;
let match;
let allLines = [];
while ((match = paraRegex.exec(xmlStr)) !== null) {
  const texts = match[0].match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  if (texts) {
    const text = texts.map(t => t.replace(/<[^>]+>/g, '')).join('');
    if (text.trim()) {
      allLines.push(text.trim());
    }
  }
}

// Show lines 55-75 (where the TOC should be)
console.log('\n=== Lines 55-80 ===');
for (let i = Math.max(0, 55); i < Math.min(allLines.length, 80); i++) {
  console.log(`[${i}] ${allLines[i]}`);
}

// Search for initSystem or addNode in the output
console.log('\n=== Search for function names in output ===');
for (let i = 0; i < allLines.length; i++) {
  if (allLines[i].includes('initSystem') || allLines[i].includes('addNode') || allLines[i].includes('dijkstra')) {
    console.log(`[${i}] ${allLines[i]}`);
  }
}
