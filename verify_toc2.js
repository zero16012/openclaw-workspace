const fs = require('fs');
const AdmZip = require('adm-zip');

const outPath = 'C:\\Users\\zero\\.openclaw\\workspace\\06_-2_实训作品--李泽锐_双面打印_课程_非卷面_考核评分细则_双面打印---已修改目录.docx';

const zip = new AdmZip(outPath);
const docEntry = zip.getEntry('word/document.xml');
const xmlStr = docEntry.getData().toString('utf8');

// Find the area around where the TOC should be
// Search for "需求分析" to find the TOC/Chapter 1 area
const ch1Pos = xmlStr.indexOf('需求分析');
console.log('First "需求分析" at position:', ch1Pos);

if (ch1Pos >= 0) {
  // Show surrounding text (2000 chars before and after)
  const start = Math.max(0, ch1Pos - 3000);
  const end = Math.min(xmlStr.length, ch1Pos + 1000);
  const excerpt = xmlStr.substring(start, end);
  
  // Extract individual text tags from this region
  const tRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  let tMatch;
  let textPieces = [];
  let lastPos = -100;
  
  while ((tMatch = tRegex.exec(excerpt)) !== null) {
    const pos = tMatch.index;
    if (pos - lastPos > 2000) {
      // New paragraph or significant gap
      if (textPieces.length > 0) {
        console.log('  LINE:', textPieces.join('').trim());
      }
      textPieces = [tMatch[1]];
    } else {
      textPieces.push(tMatch[1]);
    }
    lastPos = pos + tMatch[0].length;
  }
  if (textPieces.length > 0) {
    console.log('  LINE:', textPieces.join('').trim());
  }
}

// Also search for "目" around the TOC area
const muPos = xmlStr.indexOf('目');
console.log('\nFirst "目" at position:', muPos);
if (muPos >= 0 && muPos > ch1Pos - 10000) {
  const surroundingStart = Math.max(0, muPos - 500);
  const surroundingEnd = Math.min(xmlStr.length, muPos + 500);
  console.log('Context around 目:');
  console.log(xmlStr.substring(surroundingStart, surroundingEnd));
}
