const fs = require('fs');
const AdmZip = require('adm-zip');

const docxPath = 'C:\\Users\\zero\\.openclaw\\media\\inbound\\06_-2_实训作品--李泽锐_双面打印_课程_非卷面_考核评分细则_双面打印---a8e20c60-ff12-488f-9be1-6098f6d74f86.docx';

const zip = new AdmZip(docxPath);
const docEntry = zip.getEntry('word/document.xml');
const xmlStr = docEntry.getData().toString('utf8');

// Extract all paragraphs with their XML
const paraRegex = /<w:p[\s\S]*?<\/w:p>/g;
let match;
let allParas = [];

while ((match = paraRegex.exec(xmlStr)) !== null) {
  const texts = match[0].match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  if (texts) {
    const text = texts.map(t => t.replace(/<[^>]+>/g, '')).join('');
    if (text.trim()) {
      allParas.push({ text: text.trim(), xml: match[0], index: match.index });
    }
  }
}

// Find the TOC title and entries
let tocStart = -1;
let tocEntries = [];
for (let i = 0; i < allParas.length; i++) {
  if (allParas[i].text.replace(/\s/g, '') === '目录') {
    tocStart = i;
    continue;
  }
  if (tocStart >= 0) {
    // Check if this is a TOC entry (starts with number or sub-number)
    if (/^\d/.test(allParas[i].text) && !allParas[i].text.includes('评分细则')) {
      tocEntries.push(allParas[i]);
    } else if (tocEntries.length > 0) {
      // Stop when we hit non-TOC content
      break;
    }
  }
}

console.log(`Found ${tocEntries.length} TOC entries`);

// Show XML for different entry types
console.log('\n=== Style info for TOC entries ===');
for (let i = 0; i < Math.min(10, tocEntries.length); i++) {
  const e = tocEntries[i];
  
  // Extract style ID
  const styleMatch = e.xml.match(/<w:pStyle w:val="([^"]+)"/);
  const styleId = styleMatch ? styleMatch[1] : 'N/A';
  
  // Extract tab info
  const tabMatch = e.xml.match(/<w:tab[^>]*\/>/g);
  const tabs = tabMatch ? tabMatch.join('; ') : 'no tabs';
  
  // Extract indent
  const leftMatch = e.xml.match(/<w:ind w:left="(\d+)"/);
  const leftIndent = leftMatch ? leftMatch[1] : '0';
  
  // Extract fonts
  const rFontsMatch = e.xml.match(/<w:rFonts[^>]*\/>/);
  
  console.log(`[${i}] "${e.text}"`);
  console.log(`  Style: ${styleId}, LeftIndent: ${leftIndent}, Tabs: ${tabs}`);
  console.log(`  Fonts: ${rFontsMatch ? rFontsMatch[0] : 'none'}`);
  
  // Show full XML for first few
  if (i < 3 || i === tocEntries.length - 1) {
    console.log(`  XML snippet: ${e.xml.substring(0, 600)}...`);
  }
  console.log('');
}

// Also look at the styles.xml to understand style definitions
try {
  const stylesEntry = zip.getEntry('word/styles.xml');
  if (stylesEntry) {
    const stylesXml = stylesEntry.getData().toString('utf8');
    
    // Find TOC-related styles
    const styleRegex = /<w:style w:type="paragraph" w:styleId="([^"]+)"[\s\S]*?<\/w:style>/g;
    let sMatch;
    while ((sMatch = styleRegex.exec(stylesXml)) !== null) {
      const styleId = sMatch[1];
      if (styleId.startsWith('1') || styleId.startsWith('TOC') || styleId === '16' || styleId === '17') {
        // Extract name
        const nameMatch = sMatch[0].match(/<w:name w:val="([^"]+)"/);
        const name = nameMatch ? nameMatch[1] : 'unknown';
        console.log(`Style: ${styleId} -> ${name}`);
        
        // Extract paragraph properties
        const pprMatch = sMatch[0].match(/<w:pPr[\s\S]*?<\/w:pPr>/);
        if (pprMatch) {
          const indent = pprMatch[0].match(/<w:ind[^>]*\/>/);
          const tabs = pprMatch[0].match(/<w:tab[^>]*\/>/g);
          if (indent || tabs) {
            console.log(`  pPr: ${indent ? indent[0] : ''} ${tabs ? tabs.join('; ') : ''}`);
          }
        }
      }
    }
  }
} catch(e) {
  console.log('Could not read styles.xml:', e.message);
}
