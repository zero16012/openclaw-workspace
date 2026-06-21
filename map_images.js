const AdmZip = require('adm-zip');
const fs = require('fs');

const docxPath = 'C:\\Users\\zero\\.openclaw\\media\\inbound\\06_-2_实训作品--李泽锐_双面打印_课程_非卷面_考核评分细则_双面打印---已修改目录---bcfa170a-3f94-4fd0-ac4a-7c05fe6d073a.docx';
const docx = new AdmZip(docxPath);
const xml = docx.getEntry('word/document.xml').getData().toString('utf8');

// Find each image in document with full context
// Pattern: graphic frame with image reference
const imgEntryPattern = /<wp:docPr[^>]*\/>[\s\S]{0,500}?(<a:blip[^>]*r:embed="([^"]*)"[^>]*\/>)/g;

// We'll find images by looking at illustrations
const pattern = /<w:drawing>[\s\S]{0,2000}?<\/w:drawing>/g;
let m;
let idx = 0;

while ((m = pattern.exec(xml)) !== null) {
  const drawing = m[0];
  const ridMatch = drawing.match(/r:embed="([^"]+)"/);
  if (!ridMatch) continue;
  const rid = ridMatch[1];
  
  // Find paragraph before this drawing
  const beforeXml = xml.substring(Math.max(0, m.index - 1500), m.index);
  const paras = beforeXml.split('</w:p>');
  let caption = '';
  for (let i = paras.length - 1; i >= 0; i--) {
    const tTags = paras[i].match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (tTags) {
      const text = tTags.map(t => t.replace(/<[^>]+>/g, '')).join('').trim();
      if (text && text.length > 3 && !text.match(/^\d+$/)) {
        caption = text;
        break;
      }
    }
  }
  
  // Find paragraph after this drawing
  const afterXml = xml.substring(m.index + m[0].length, Math.min(xml.length, m.index + m[0].length + 1500));
  const afterParas = afterXml.split('</w:p>');
  let afterCaption = '';
  for (let i = 0; i < Math.min(3, afterParas.length); i++) {
    const tTags = afterParas[i].match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (tTags) {
      const text = tTags.map(t => t.replace(/<[^>]+>/g, '')).join('').trim();
      if (text && text.length > 3 && !text.match(/^\d+$/) && !text.includes('图')) {
        afterCaption = text;
        break;
      }
    }
  }
  
  idx++;
  console.log(`[${idx}] ${rid}: ${caption.substring(0, 80)} | ${afterCaption.substring(0, 60)}`);
}
