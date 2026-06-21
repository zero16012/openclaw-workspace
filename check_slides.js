const AdmZip = require('adm-zip');
const zip = new AdmZip('C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx');

// Check all slides for their current content
for (const e of zip.getEntries()) {
  if (e.entryName.startsWith('ppt/slides/slide') && e.entryName.endsWith('.xml')) {
    const xml = e.getData().toString('utf8');
    
    // Check title text content
    const texts = xml.match(/<a:t[^>]*>[^<]*<\/a:t>/g);
    const textContent = texts ? texts.map(t=>t.replace(/<[^>]+>/g,'')).filter(t=>t.trim()).join(' | ') : '';
    
    // Check image references  
    const blips = xml.match(/r:embed="[^"]+"/g);
    const imgRefs = blips ? blips.map(b=>b.replace(/r:embed="/,'').replace(/"/,'')).join(', ') : 'none';
    
    const slideNum = e.entryName.replace('ppt/slides/slide','').replace('.xml','');
    console.log(`Slide ${slideNum}:`);
    console.log(`  Text: ${textContent.substring(0, 150)}`);
    console.log(`  Images: ${imgRefs.substring(0, 100)}`);
    console.log('');
  }
}
