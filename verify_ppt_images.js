const AdmZip = require('adm-zip');
const zip = new AdmZip('C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx');
for (const e of zip.getEntries()) {
  if (e.entryName.startsWith('ppt/slides/slide') && e.entryName.endsWith('.xml')) {
    const xml = e.getData().toString('utf8');
    const blips = xml.match(/a:blip[^>]*>/g);
    const imgCount = blips ? blips.length : 0;
    const texts = xml.match(/<a:t[^>]*>[^<]*<\/a:t>/g);
    const textContent = texts ? texts.map(t=>t.replace(/<[^>]+>/g,'')).filter(t=>t.trim()).join(' ').substring(0, 100) : '';
    console.log(e.entryName, 'images:', imgCount, '|', textContent);
  }
}
console.log('\n--- Media files ---');
for (const e of zip.getEntries()) {
  if (e.entryName.startsWith('ppt/media/')) {
    console.log(e.entryName, (e.header.size/1024).toFixed(1) + 'KB');
  }
}
