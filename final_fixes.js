const AdmZip = require('adm-zip');
const ppt = new AdmZip('C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx');

// Fix remaining split-text issues by handling the runs directly
const fixes = {
  'ppt/slides/slide10.xml': [
    // Fix "显示记"+"录" -> merge and replace
    { old: '显示记', newText: '双层for赋值0/INF' },
    { old: '修改记', newText: 'scanf存入nodes数组' },
    { old: '插入新记', newText: '校验编号+双向赋值' },
    { old: '删除记', newText: 'dist/pre/visit初始化' },
    // Clean up orphan "录" characters after replacements
    { old: '"录"', newText: '' },
  ],
  'ppt/slides/slide2.xml': [
    // Fix "子模的详细设计与实现解"+"说"
    { old: '子模的详细设计与实现解说', newText: '子模块详细设计与实现解说' },
    // Fix "作品简要介"+"绍"  
    { old: '作品简要介绍', newText: '作品简介' },
  ],
  'ppt/slides/slide5.xml': [
    { old: '作品简要介绍', newText: '校园导航系统架构' },
  ],
};

for (const [slideName, reps] of Object.entries(fixes)) {
  let xml = ppt.getEntry(slideName).getData().toString('utf8');
  for (const rep of reps) {
    xml = xml.split(rep.old).join(rep.newText);
  }
  ppt.updateFile(ppt.getEntry(slideName), Buffer.from(xml, 'utf8'));
}

// Also fix slide4 and slide10 orphan characters
const s4 = ppt.getEntry('ppt/slides/slide4.xml').getData().toString('utf8');
// Clean up "度" "型" "数" remnants from split text
const cleaned4 = s4.replace(/度<\/a:t>/g, '</a:t>').replace(/型<\/a:t>/g, '</a:t>').replace(/数<\/a:t>/g, '</a:t>');
ppt.updateFile(ppt.getEntry('ppt/slides/slide4.xml'), Buffer.from(cleaned4, 'utf8'));

// Fix slide 10 orphan "录" remnants
const s10 = ppt.getEntry('ppt/slides/slide10.xml').getData().toString('utf8');
const cleaned10 = s10.replace(/录<\/a:t>/g, '</a:t>');
ppt.updateFile(ppt.getEntry('ppt/slides/slide10.xml'), Buffer.from(cleaned10, 'utf8'));

ppt.writeZip('C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx');
console.log('Remaining split-text issues fixed!');

// Verify
const v = new AdmZip('C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx');
for (const e of v.getEntries()) {
  if (e.entryName.startsWith('ppt/slides/slide') && e.entryName.endsWith('.xml')) {
    const x = e.getData().toString('utf8');
    const t = (x.match(/<a:t[^>]*>[^<]*<\/a:t>/g)||[]).map(t=>t.replace(/<[^>]+>/g,'')).filter(x=>x.trim()).join(' ').substring(0,130);
    const sn = e.entryName.replace('ppt/slides/slide','').replace('.xml','');
    // Check for remaining issues
    const bad = ['学生成绩', '显示记', '修改记', '插入新记', '删除记', '录入模块'];
    let issue = false;
    for (const b of bad) { if (t.includes(b)) { issue = true; break; } }
    console.log('S'+sn+':', issue?'⚠️':'✅', t);
  }
}
