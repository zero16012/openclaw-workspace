const fs = require('fs');
const AdmZip = require('adm-zip');

const pptxPath = 'C:\\Users\\zero\\.openclaw\\media\\inbound\\作品演示模板PPT---6e039813-9cec-473e-9475-d252b4969ac3.pptx';

const zip = new AdmZip(pptxPath);

// List all files in the PPTX
console.log('=== PPTX contents ===');
for (const entry of zip.getEntries()) {
  if (!entry.isDirectory) {
    console.log(entry.entryName, `(${entry.header.size} bytes)`);
  }
}

// Extract slide XMLs to understand layout
const slideRegex = /^ppt\/slides\/slide\d+\.xml$/;
for (const entry of zip.getEntries()) {
  if (slideRegex.test(entry.entryName)) {
    const xmlStr = entry.getData().toString('utf8');
    console.log(`\n=== ${entry.entryName} ===`);
    
    // Extract text content
    const tRegex = /<a:t[^>]*>([^<]*)<\/a:t>/g;
    let match;
    let texts = [];
    while ((match = tRegex.exec(xmlStr)) !== null) {
      if (match[1].trim()) {
        texts.push(match[1].trim());
      }
    }
    
    // Extract shape names
    const spRegex = /<p:sp>[\s\S]*?<\/p:sp>/g;
    let spMatch;
    let shapeCount = 0;
    while ((spMatch = spRegex.exec(xmlStr)) !== null) {
      const nvSpPr = spMatch[0].match(/<p:nvSpPr[\s\S]*?<p:cNvPr[^>]*\/>/);
      shapeCount++;
    }
    
    console.log(`Shapes: ${shapeCount}, Text: ${texts.join(' | ')}`);
  }
}

// Also check slide layouts
console.log('\n=== Slide Layouts ===');
for (const entry of zip.getEntries()) {
  if (entry.entryName.includes('slideLayout') && entry.entryName.endsWith('.xml')) {
    const xmlStr = entry.getData().toString('utf8');
    const nameMatch = xmlStr.match(/<p:cSld>[\s\S]*?<p:spTree[\s\S]*?<p:sp>[\s\S]*?<a:t[^>]*>([^<]*)<\/a:t>/);
    if (nameMatch) {
      console.log(entry.entryName, '-', nameMatch[1]);
    }
  }
}
