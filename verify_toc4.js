const fs = require('fs');
const AdmZip = require('adm-zip');

const outPath = 'C:\\Users\\zero\\.openclaw\\workspace\\06_-2_实训作品--李泽锐_双面打印_课程_非卷面_考核评分细则_双面打印---已修改目录.docx';

const zip = new AdmZip(outPath);
const docEntry = zip.getEntry('word/document.xml');
const xmlStr = docEntry.getData().toString('utf8');

// Find and show all paragraphs between "目录" text and "1. 需求分析"
const paraRegex = /<w:p[\s\S]*?<\/w:p>/g;
let match;
let inToc = false;

while ((match = paraRegex.exec(xmlStr)) !== null) {
  const texts = match[0].match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  if (texts) {
    const text = texts.map(t => t.replace(/<[^>]+>/g, '')).join('');
    const trimmed = text.trim();
    
    if (trimmed.includes('目') && trimmed.includes('录') && trimmed.replace(/\s/g, '') === '目录') {
      inToc = true;
      console.log('=== TOC START ===');
    }
    
    if (inToc) {
      if (trimmed.match(/^1\s*\.?\s*需求分析/) && !trimmed.match(/^\d+\.\d/)) {
        console.log('---');
        console.log('After TOC:', trimmed);
        break;
      }
      if (trimmed) {
        console.log(trimmed);
      }
    }
  }
}

// Count total paragraphs
console.log('\n=== Paragraph count check ===');
let totalPars = 0;
paraRegex.lastIndex = 0;
while ((match = paraRegex.exec(xmlStr)) !== null) {
  totalPars++;
}
console.log('Total paragraphs:', totalPars);

// Verify the file opens correctly by checking structure
console.log('\n=== Document structure ===');
const hasBody = xmlStr.includes('<w:body>') && xmlStr.includes('</w:body>');
const hasDocument = xmlStr.includes('<w:document') && xmlStr.includes('</w:document>');
console.log('Has valid body:', hasBody);
console.log('Has valid document:', hasDocument);
