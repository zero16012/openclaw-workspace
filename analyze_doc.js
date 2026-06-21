const fs = require('fs');
const AdmZip = require('adm-zip');

const docxPath = 'C:\\Users\\zero\\.openclaw\\media\\inbound\\06_-2_实训作品--李泽锐_双面打印_课程_非卷面_考核评分细则_双面打印---已修改目录---bcfa170a-3f94-4fd0-ac4a-7c05fe6d073a.docx';

const zip = new AdmZip(docxPath);
const docEntry = zip.getEntry('word/document.xml');
const xmlStr = docEntry.getData().toString('utf8');

// Extract all paragraphs
const paraRegex = /<w:p[\s\S]*?<\/w:p>/g;
let match;
let allParas = [];

while ((match = paraRegex.exec(xmlStr)) !== null) {
  const texts = match[0].match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  if (texts) {
    const text = texts.map(t => t.replace(/<[^>]+>/g, '')).join('');
    if (text.trim()) {
      allParas.push(text.trim());
    }
  }
}

// Filter to relevant content sections
console.log('=== DOCUMENT CONTENT OVERVIEW ===');
console.log(`Total paragraphs: ${allParas.length}`);

// Print key sections
let inSection = false;
for (let i = 0; i < allParas.length; i++) {
  const t = allParas[i];
  // Print headings
  if (/^\d+\.\s/.test(t) || /^\d+\.\d+\s/.test(t)) {
    if (t.includes('需求分析') || t.includes('方案选型') || t.includes('系统设计') || 
        t.includes('数据结构') || t.includes('子模块') || t.includes('流程图') ||
        t.includes('系统实现') || t.includes('源代码') || t.includes('运行结果') ||
        t.includes('使用手册')) {
      console.log(`\n[${i}] HEADING: ${t}`);
    }
  }
  // Print content paragraphs
  if (/^\d/.test(t) && !/^\d+\.\d/.test(t) && t.length > 40) {
    console.log(`[${i}] CONTENT: ${t.substring(0, 120)}...`);
  }
}
