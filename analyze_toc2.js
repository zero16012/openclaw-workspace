const fs = require('fs');
const AdmZip = require('adm-zip');

const docxPath = 'C:\\Users\\zero\\.openclaw\\media\\inbound\\06_-2_实训作品--李泽锐_双面打印_课程_非卷面_考核评分细则_双面打印---a8e20c60-ff12-488f-9be1-6098f6d74f86.docx';

const zip = new AdmZip(docxPath);
const docEntry = zip.getEntry('word/document.xml');
const xmlStr = docEntry.getData().toString('utf8');

// Extract ALL text to find where things are
const paraRegex = /<w:p[\s\S]*?<\/w:p>/g;
let match;
let allParas = [];
while ((match = paraRegex.exec(xmlStr)) !== null) {
  const texts = match[0].match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  if (texts) {
    const text = texts.map(t => t.replace(/<[^>]+>/g, '')).join('');
    if (text.trim()) {
      allParas.push({ index: match.index, text: text.trim(), textRaw: text });
    }
  }
}

// Find the 目录 and Chapter headings
let foundToc = false;
let tocStart = 0;
let chapter1Start = 0;

for (let i = 0; i < allParas.length; i++) {
  const p = allParas[i];
  
  if (p.text.includes('目') && p.text.includes('录')) {
    console.log(`Found "目录" at para ${i}: "${p.text}"`);
    foundToc = true;
    tocStart = i;
  }
  
  if (p.text.includes('需求分析') && p.text.includes('方案选型')) {
    console.log(`Found Chapter 1 at para ${i}: "${p.text}"`);
    chapter1Start = i;
  }
}

if (foundToc && chapter1Start) {
  console.log(`\nTOC entries (paras ${tocStart + 1} to ${chapter1Start - 1}):`);
  for (let i = tocStart; i < chapter1Start; i++) {
    console.log(`  [${i}] "${allParas[i].text}"`);
  }
}

// Also look for all headings
console.log('\n=== All headings/chapters ===');
for (let i = 0; i < allParas.length; i++) {
  const t = allParas[i].text;
  if (/^\d+\./.test(t) || /^\d+\.\d+/.test(t) || t.includes('设计理由') || t.includes('功能需求') || t.includes('方案选型')) {
    console.log(`  [${i}] "${t}"`);
  }
}

// Find more patterns
console.log('\n=== All paras around TOC ===');
for (let i = Math.max(0, tocStart - 2); i < Math.min(allParas.length, tocStart + 40); i++) {
  if (allParas[i] && allParas[i].text.trim()) {
    console.log(`  [${i}] "${allParas[i].text.trim()}"`);
  }
}
