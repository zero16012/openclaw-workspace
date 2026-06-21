const fs = require('fs');
const AdmZip = require('adm-zip');

const outPath = 'C:\\Users\\zero\\.openclaw\\workspace\\06_-2_实训作品--李泽锐_双面打印_课程_非卷面_考核评分细则_双面打印---已修改目录.docx';

const zip = new AdmZip(outPath);
const docEntry = zip.getEntry('word/document.xml');
const xmlStr = docEntry.getData().toString('utf8');

// Extract all paragraph texts
const paraRegex = /<w:p[\s\S]*?<\/w:p>/g;
let match;
let foundToc = false;
let foundCh1 = false;

while ((match = paraRegex.exec(xmlStr)) !== null) {
  const texts = match[0].match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  if (texts) {
    const text = texts.map(t => t.replace(/<[^>]+>/g, '')).join('');
    if (text.trim()) {
      if (text.trim() === '目    录') {
        foundToc = true;
        console.log('=== NEW TOC ===');
      }
      if (text.trim() === '1. 需求分析与方案选型' || text.trim().startsWith('1. 需求分析与方案选型')) {
        foundCh1 = true;
      }
      if (foundToc && !text.trim().startsWith('1. 需求分析与方案选型')) {
        console.log(text.trim());
      }
      if (text.trim().startsWith('1. 需求分析与方案选型')) {
        console.log('--- End of TOC ---');
        console.log('First chapter heading:', text.trim());
        break;
      }
    }
  }
}

if (!foundToc) console.log('TOC title not found in output!');
