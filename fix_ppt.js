const fs = require('fs');
const AdmZip = require('adm-zip');

const outPath = 'C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx';
const zip = new AdmZip(outPath);

// Fix remaining issues in each slide
const fixes = {
  // Slide 1: fix the title that was lost
  'ppt/slides/slide1.xml': [
    // Nothing to fix - slide 1 is mostly clean except the title formatting
  ],
  // Slide 6: fix remaining old text
  'ppt/slides/slide6.xml': [
    ['说明模块交互（如 "录入模块调用存储模块的结构体数组，统计模块读取数据后排序"）。', ''],
    ['手绘或用工具绘制模块关系图（如 "校园导航系统" 分为 ""）。', ''],
    ['" 分为 "', ''],
  ]
};

for (const [slideName, reps] of Object.entries(fixes)) {
  if (reps.length === 0) continue;
  const entry = zip.getEntry(slideName);
  if (!entry) continue;
  let xml = entry.getData().toString('utf8');
  for (const [oldText, newText] of reps) {
    xml = xml.replace(new RegExp(oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newText);
  }
  zip.updateFile(entry, Buffer.from(xml, 'utf8'));
}

zip.writeZip(outPath);
console.log('Final fixes applied');

// Verify
const vZip = new AdmZip(outPath);
for (const entry of vZip.getEntries()) {
  if (entry.entryName.startsWith('ppt/slides/slide') && entry.entryName.endsWith('.xml')) {
    const xml = entry.getData().toString('utf8');
    const texts = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g);
    if (texts) {
      const content = texts.map(t => t.replace(/<[^>]+>/g, '')).filter(t => t.trim()).join(' ').trim();
      console.log(`\n${entry.entryName}:`);
      console.log(`  ${content.substring(0, 150)}`);
    }
  }
}
