const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const docxPath = 'C:\\Users\\zero\\.openclaw\\media\\inbound\\06_-2_实训作品--李泽锐_双面打印_课程_非卷面_考核评分细则_双面打印---a8e20c60-ff12-488f-9be1-6098f6d74f86.docx';

const zip = new AdmZip(docxPath);
const docEntry = zip.getEntry('word/document.xml');
const xmlStr = docEntry.getData().toString('utf8');

// Find the TOC section boundaries
const tocTitlePos = xmlStr.indexOf('目    录');
const ch1Pos = xmlStr.indexOf('1. 需求分析与方案选型');

console.log('TOC title position:', tocTitlePos);
console.log('Chapter 1 position:', ch1Pos);

// Extract all paragraphs between 目录 and Chapter 1
const startMarker = xmlStr.lastIndexOf('<w:p ', tocTitlePos);
// Find the chapter 1 paragraph start (which is after the TOC entries)
// Actually, we need to find where the TOC ends and Chapter 1 begins
// Let me find the paragraph that contains "1. 需求分析与方案选型"

const ch1ParaStart = xmlStr.lastIndexOf('<w:p', ch1Pos);

console.log('TOC paragraph starts at:', startMarker);
console.log('Chapter 1 paragraph starts at:', ch1ParaStart);

// Show the TOC section (between these markers)
console.log('\n=== TOC SECTION XML (truncated) ===');
const tocXml = xmlStr.substring(startMarker, ch1ParaStart);
console.log(tocXml.substring(0, 3000));
console.log('...(truncated)...');
console.log(tocXml.substring(tocXml.length - 500));

// Now extract just the text lines of the TOC
const paraRegex = /<w:p[\s\S]*?<\/w:p>/g;
let match;
let tocLines = [];
while ((match = paraRegex.exec(tocXml)) !== null) {
  const texts = match[0].match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  if (texts) {
    const text = texts.map(t => t.replace(/<[^>]+>/g, '')).join('');
    tocLines.push(text);
  }
}

console.log('\n=== TOC Text Lines ===');
tocLines.forEach((line, i) => console.log(`${i}: "${line}"`));
