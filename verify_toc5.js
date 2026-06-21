const fs = require('fs');
const AdmZip = require('adm-zip');

const outPath = 'C:\\Users\\zero\\.openclaw\\workspace\\06_-2_实训作品--李泽锐_双面打印_课程_非卷面_考核评分细则_双面打印---已修改目录.docx';

const zip = new AdmZip(outPath);
const docEntry = zip.getEntry('word/document.xml');
const xmlStr = docEntry.getData().toString('utf8');

// Find the TOC in the XML using byte positions
const tocPos = xmlStr.indexOf('目    录');

// Extract text from paragraphs around the TOC
const paraRegex = /<w:p[\s\S]*?<\/w:p>/g;
let match;
let inToc = false;
let count = 0;

console.log('=== FULL TOC ===');
while ((match = paraRegex.exec(xmlStr)) !== null) {
  const texts = match[0].match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  if (texts) {
    const text = texts.map(t => t.replace(/<[^>]+>/g, '')).join('');
    const trimmed = text.trim();
    
    if (trimmed === '目    录') {
      inToc = true;
    }
    
    if (inToc) {
      // Stop when we hit the actual chapter content (without page number suffix)
      if (trimmed.match(/^1\.?\s*需求分析/) && !trimmed.endsWith('1') && !trimmed.endsWith('2') && trimmed.length < 20) {
        console.log('--- END OF TOC ---');
        console.log('Next content:', trimmed);
        break;
      }
      if (trimmed) {
        count++;
        console.log(`[${count}] ${trimmed}`);
      }
      // Safety: stop after 70 entries
      if (count > 65) {
        console.log('...(stopped after 65 entries)...');
        break;
      }
    }
  }
}
