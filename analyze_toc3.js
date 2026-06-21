const fs = require('fs');
const AdmZip = require('adm-zip');

const docxPath = 'C:\\Users\\zero\\.openclaw\\media\\inbound\\06_-2_实训作品--李泽锐_双面打印_课程_非卷面_考核评分细则_双面打印---a8e20c60-ff12-488f-9be1-6098f6d74f86.docx';

const zip = new AdmZip(docxPath);
const docEntry = zip.getEntry('word/document.xml');
const xmlStr = docEntry.getData().toString('utf8');

// Find a simple paragraph in the document to use as a template
// Look for a paragraph with just a simple w:t tag (no field codes)
const paraRegex = /<w:p[\s\S]*?<\/w:p>/g;
let match;

// Find paragraphs around the old TOC area (paras 61-102)
// First find 目    录
const tocTitleIdx = xmlStr.indexOf('目    录');
console.log('TOC title at:', tocTitleIdx);

// Get the paragraph containing "目    录"
const titleParaStart = xmlStr.lastIndexOf('<w:p', tocTitleIdx);
const titleParaEnd = xmlStr.indexOf('</w:p>', tocTitleIdx) + '</w:p>'.length;
const titleParaXml = xmlStr.substring(titleParaStart, titleParaEnd);

console.log('\n=== TOC Title Paragraph XML ===');
console.log(titleParaXml);

// Now find a simple TOC entry paragraph (e.g., "1. 需求分析与方案选型1")
const ch1Idx = xmlStr.indexOf('1. 需求分析与方案选型1');
const ch1ParaStart = xmlStr.lastIndexOf('<w:p', ch1Idx);
const ch1ParaEnd = xmlStr.indexOf('</w:p>', ch1Idx) + '</w:p>'.length;
const ch1ParaXml = xmlStr.substring(ch1ParaStart, ch1ParaEnd);

console.log('\n=== Chapter 1 TOC entry Paragraph XML ===');
console.log(ch1ParaXml);

// Also find a very simple paragraph to use as a clean template
// Look for a paragraph that has a single w:t with no special formatting
// Search in the content after the TOC
const bodyEnd = xmlStr.lastIndexOf('</w:body>');
const contentArea = xmlStr.substring(ch1ParaEnd, bodyEnd);
const simpleParaMatch = contentArea.match(/<w:p[^>]*>[\s\S]*?<w:t[^>]*>[^<]+<\/w:t>[\s\S]*?<\/w:p>/);
if (simpleParaMatch) {
  console.log('\n=== Simple content paragraph (template candidate) ===');
  console.log(simpleParaMatch[0].substring(0, 500));
}
