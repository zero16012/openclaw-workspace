const fs = require('fs');
const AdmZip = require('adm-zip');

const pptxPath = 'C:\\Users\\zero\\.openclaw\\media\\inbound\\作品演示模板PPT---6e039813-9cec-473e-9475-d252b4969ac3.pptx';
const zip = new AdmZip(pptxPath);
const s1 = zip.getEntry('ppt/slides/slide1.xml').getData().toString('utf8');

// Find "作品展" and show surrounding XML
const idx = s1.indexOf('作品展');
if (idx >= 0) {
  const start = Math.max(0, idx - 200);
  const end = Math.min(s1.length, idx + 300);
  console.log('=== Context around "作品展" ===');
  console.log(s1.substring(start, end));
}

// Also find "学生成"
const idx2 = s1.indexOf('学生成');
if (idx2 >= 0) {
  const start = Math.max(0, idx2 - 200);
  const end = Math.min(s1.length, idx2 + 300);
  console.log('\n=== Context around "学生成" ===');
  console.log(s1.substring(start, end));
}

// Find "绍" in slide 2 or 3
const s2 = zip.getEntry('ppt/slides/slide2.xml').getData().toString('utf8');
const idx3 = s2.indexOf('绍');
if (idx3 >= 0) {
  const start = Math.max(0, idx3 - 300);
  const end = Math.min(s2.length, idx3 + 300);
  console.log('\n=== Context around "绍" (slide2) ===');
  console.log(s2.substring(start, end));
}

// Look at what the a:r structure looks like for "展" + "示"
console.log('\n=== a:t/r structure for split text ===');
// Find <a:t>展</a:t>
const zhanIdx = s1.indexOf('<a:t>展');
if (zhanIdx >= 0) {
  const start = Math.max(0, zhanIdx - 100);
  const end = Math.min(s1.length, zhanIdx + 300);
  console.log(s1.substring(start, end));
}
