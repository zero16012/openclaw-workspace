const AdmZip = require('adm-zip');
const zip = new AdmZip('C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx');

// Check slide 8 XML structure to see where images went
const s8 = zip.getEntry('ppt/slides/slide8.xml').getData().toString('utf8');

// Look for spTree closing
const spTreeEnd = s8.lastIndexOf('</p:spTree>');
const spTreeStart = s8.lastIndexOf('<p:spTree', spTreeEnd);

console.log('=== Slide 8 spTree structure ===');
const spTreeContent = s8.substring(spTreeStart, spTreeEnd + '</p:spTree>'.length);
console.log(spTreeContent.substring(0, 800));
console.log('\n... (middle) ...\n');
console.log(spTreeContent.substring(spTreeContent.length - 800));

// Check how many blip fills we have
const blips = s8.match(/a:blip r:embed/g) || [];
console.log('\nTotal blip fills:', blips.length);

// Check if any of our images are referenced
const imgRefs = s8.match(/r:embed="rIdImg\d+"/g) || [];
console.log('Custom image references:', imgRefs.map(r => r.replace(/"/g,'')).join(', '));

// Now check what text is in slide 8 to make sure it's correct
const texts = s8.match(/<a:t[^>]*>[^<]*<\/a:t>/g);
if (texts) console.log('\nSlide 8 text:', texts.map(t=>t.replace(/<[^>]+>/g,'')).filter(t=>t.trim()).join(' | '));
