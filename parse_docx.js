const fs = require('fs');
const zlib = require('zlib');

const path = 'C:\\Users\\zero\\.openclaw\\media\\inbound\\06_-2_实训作品--李泽锐_双面打印_课程_非卷面_考核评分细则_双面打印---a8e20c60-ff12-488f-9be1-6098f6d74f86.docx';

const data = fs.readFileSync(path);

let i = 0;
while (i < data.length - 30) {
  if (data.readUInt32LE(i) === 0x04034b50) {
    const fileNameLen = data.readUInt16LE(i + 26);
    const extraLen = data.readUInt16LE(i + 28);
    const compressedSize = data.readUInt32LE(i + 18);
    const uncompressedSize = data.readUInt32LE(i + 22);
    const compression = data.readUInt16LE(i + 8);
    const fileName = data.toString('utf8', i + 30, i + 30 + fileNameLen);
    
    if (fileName === 'word/document.xml') {
      const dataStart = i + 30 + fileNameLen + extraLen;
      let xmlContent;
      if (compression === 0) {
        xmlContent = data.toString('utf8', dataStart, dataStart + uncompressedSize);
      } else if (compression === 8) {
        const deflated = zlib.inflateRawSync(data.subarray(dataStart, dataStart + compressedSize));
        xmlContent = deflated.toString('utf8');
      }
      
      // Extract text from XML with paragraph breaks
      const paragraphs = xmlContent.split(/<\/w:p>/g);
      for (const para of paragraphs) {
        const texts = para.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
        const line = texts.map(l => l.replace(/<[^>]+>/g, '')).join('');
        if (line.trim()) {
          console.log(line);
        }
      }
      process.exit(0);
    }
    i += 30 + fileNameLen + extraLen;
    if (compression === 0) i += uncompressedSize;
    else i += compressedSize;
  } else {
    i++;
  }
}
console.log('word/document.xml not found');
