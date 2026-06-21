const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

// Extract images from DOCX
const docxPath = 'C:\\Users\\zero\\.openclaw\\media\\inbound\\06_-2_实训作品--李泽锐_双面打印_课程_非卷面_考核评分细则_双面打印---已修改目录---bcfa170a-3f94-4fd0-ac4a-7c05fe6d073a.docx';
const docx = new AdmZip(docxPath);

// Extract media to workspace
const mediaDir = 'C:\\Users\\zero\\.openclaw\\workspace\\docx_media';
if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir);

for (const entry of docx.getEntries()) {
  if (entry.entryName.startsWith('word/media/')) {
    const name = path.basename(entry.entryName);
    const data = entry.getData();
    fs.writeFileSync(path.join(mediaDir, name), data);
    console.log(name, data.length, 'bytes');
  }
}

// Now let's look at the PPT structure
const pptPath = 'C:\\Users\\zero\\.openclaw\\workspace\\temp_ppt.pptx';
const ppt = new AdmZip(pptPath);

console.log('\n=== PPT slides structure ===');
for (const e of ppt.getEntries()) {
  if (e.entryName.startsWith('ppt/slides/slide') && e.entryName.endsWith('.xml')) {
    console.log(e.entryName, e.header.size, 'bytes');
  }
}

// Check presentation.xml.rels for existing relationships
const rels = ppt.getEntry('ppt/_rels/presentation.xml.rels').getData().toString('utf8');
console.log('\n=== PPT relationships ===');
const rRegex = /<Relationship[^>]*\/>/g;
let rm;
while ((rm = rRegex.exec(rels)) !== null) {
  console.log(rm[0]);
}
