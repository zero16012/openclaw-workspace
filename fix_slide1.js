const AdmZip = require('adm-zip');
const cur = new AdmZip('C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx');
let s1 = cur.getEntry('ppt/slides/slide1.xml').getData().toString('utf8');

// Fix: merge "学生成" + "绩管理系统" into single "校园导航系统"
const s1Fixed = s1.replace(
  /<a:r>[\s\S]*?<a:t[^>]*>学生成<\/a:t>[\s\S]*?<\/a:r>[\s\S]*?<a:r>[\s\S]*?<a:t[^>]*>绩管理系统<\/a:t>[\s\S]*?<\/a:r>/,
  '<a:r><a:rPr lang="zh-CN" altLang="en-US" sz="4800" dirty="0"><a:solidFill><a:schemeClr val="accent1"/></a:solidFill></a:rPr><a:t>校园导航系统</a:t></a:r>'
);
s1 = s1Fixed;

// Fix: merge "展" + "示" in title
s1 = s1.replace(/<a:t>展<\/a:t><\/a:r><a:r[^>]*><a:rPr[^>]*><\/a:rPr><a:t>示<\/a:t>/, '<a:t>展示</a:t>');

cur.updateFile(cur.getEntry('ppt/slides/slide1.xml'), Buffer.from(s1, 'utf8'));
cur.writeZip('C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx');

const v = new AdmZip('C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx');
const texts = v.getEntry('ppt/slides/slide1.xml').getData().toString('utf8').match(/<a:t[^>]*>[^<]*<\/a:t>/g);
console.log('Slide 1:');
const cleaned = texts.map(t => t.replace(/<[^>]+>/g, '')).filter(x => x.trim());
console.log(cleaned.join(' '));

// Also check slide 4 now
const s4 = v.getEntry('ppt/slides/slide4.xml').getData().toString('utf8');
const s4t = s4.match(/<a:t[^>]*>[^<]*<\/a:t>/g);
const s4c = s4t.map(t => t.replace(/<[^>]+>/g, '')).filter(x => x.trim());
console.log('\nSlide 4:');
console.log(s4c.join(' '));
