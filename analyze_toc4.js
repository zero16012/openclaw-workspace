const fs = require('fs');
const AdmZip = require('adm-zip');

const docxPath = 'C:\\Users\\zero\\.openclaw\\media\\inbound\\06_-2_实训作品--李泽锐_双面打印_课程_非卷面_考核评分细则_双面打印---a8e20c60-ff12-488f-9be1-6098f6d74f86.docx';

const zip = new AdmZip(docxPath);
const docEntry = zip.getEntry('word/document.xml');
const xmlStr = docEntry.getData().toString('utf8');

// Find all paragraphs in order with their text content
const paraRegex = /<w:p[\s\S]*?<\/w:p>/g;
let match;
let paras = [];
let posMap = [];

while ((match = paraRegex.exec(xmlStr)) !== null) {
  const xml = match[0];
  const texts = xml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  if (texts) {
    const text = texts.map(t => t.replace(/<[^>]+>/g, '')).join('');
    paras.push({ text: text.trim(), xml, index: match.index, length: xml.length });
  } else {
    paras.push({ text: '', xml, index: match.index, length: xml.length });
  }
}

// Find the last occurrence of "目    录" before "1. 需求分析"
let tocTitleIdx = -1;
let ch1Idx = -1;

for (let i = paras.length - 1; i >= 0; i--) {
  if (paras[i].text.includes('目') && paras[i].text.includes('录') && paras[i].text.match(/目\s*录/)) {
    // Check if this is followed by TOC entries (before chapter 1)
    for (let j = i + 1; j < Math.min(i + 60, paras.length); j++) {
      if (paras[j].text.match(/^\d+\.\s/) || paras[j].text.match(/^\d+\.\d+/)) {
        tocTitleIdx = i;
        break;
      }
    }
    if (tocTitleIdx >= 0) break;
  }
}

for (let i = 0; i < paras.length; i++) {
  if (paras[i].text.startsWith('1. 需求分析') || paras[i].text.startsWith('1.需求分析')) {
    ch1Idx = i;
    break;
  }
}

console.log(`TOC title at para index: ${tocTitleIdx}`);
console.log(`Chapter 1 at para index: ${ch1Idx}`);

if (tocTitleIdx >= 0 && ch1Idx > tocTitleIdx) {
  console.log(`\nTOC section: paras ${tocTitleIdx} to ${ch1Idx - 1}`);
  console.log(`TOC start position: ${paras[tocTitleIdx].index}`);
  console.log(`TOC end position: ${paras[ch1Idx - 1].index + paras[ch1Idx - 1].length}`);
  
  // Show TOC entries
  for (let i = tocTitleIdx; i < ch1Idx; i++) {
    console.log(`  [${i}] "${paras[i].text}"`);
  }
  
  // Find a plain text paragraph (no field codes, no images) to use as template
  // Look for a paragraph that has exactly one w:t tag with simple text
  for (let i = ch1Idx + 5; i < Math.min(ch1Idx + 30, paras.length); i++) {
    const xml = paras[i].xml;
    // Count w:t tags
    const tCount = (xml.match(/<w:t[^>]*>/g) || []).length;
    // Check it has only text runs (no special elements)
    const hasField = xml.includes('w:fldChar');
    const hasDrawing = xml.includes('w:drawing');
    const hasTab = xml.includes('w:tab');
    
    if (tCount === 1 && !hasField && !hasDrawing && !hasTab && paras[i].text.length > 2) {
      console.log(`\n=== Suitable template at para ${i} ===`);
      console.log(`Text: "${paras[i].text}"`);
      console.log(`XML:\n${xml}`);
      break;
    }
  }
}
