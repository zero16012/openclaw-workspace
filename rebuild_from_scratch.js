const AdmZip = require('adm-zip');
const fs = require('fs');

// Start fresh: use the TEMPLATE and add content to it properly
const ori = new AdmZip('C:\\Users\\zero\\.openclaw\\media\\inbound\\作品演示模板PPT---6e039813-9cec-473e-9475-d252b4969ac3.pptx');
const cur = new AdmZip('C:\\Users\\zero\\.openclaw\\workspace\\temp_output.pptx'); // has all the text fixes
const mediaDir = 'C:\\Users\\zero\\.openclaw\\workspace\\docx_media';
const path = require('path');

// Compare slides between original and current to find which were modified
// We'll copy text-fixed slides from cur but strip out any broken images
// Then re-add images properly

const imagePlan = {
  'ppt/slides/slide5.xml': {
    images: [
      { file: 'image3.png', name: 'arch.png' },
    ],
    startId: 100,
  },
  'ppt/slides/slide8.xml': {
    images: [
      { file: 'image18.png', name: 'pic01.png' },
      { file: 'image19.png', name: 'pic02.png' },
      { file: 'image20.png', name: 'pic03.png' },
      { file: 'image21.png', name: 'pic04.png' },
      { file: 'image22.png', name: 'pic05.png' },
      { file: 'image23.png', name: 'pic06.png' },
      { file: 'image24.png', name: 'pic07.png' },
      { file: 'image25.png', name: 'pic08.png' },
      { file: 'image26.png', name: 'pic09.png' },
      { file: 'image27.png', name: 'pic10.png' },
      { file: 'image31.png', name: 'pic11.png' }, // graphical map
    ],
    startId: 200,
  },
  'ppt/slides/slide10.xml': {
    images: [
      { file: 'image5.png', name: 'mod01.png' },
      { file: 'image7.png', name: 'mod02.png' },
      { file: 'image8.png', name: 'mod03.png' },
      { file: 'image9.png', name: 'mod04.png' },
      { file: 'image10.png', name: 'mod05.png' },
      { file: 'image11.png', name: 'mod06.png' },
    ],
    startId: 300,
  },
  'ppt/slides/slide11.xml': {
    images: [
      { file: 'image9.png', name: 'alg01.png' },
      { file: 'image13.png', name: 'alg02.png' },
    ],
    startId: 400,
  },
};

// Image dimensions and layout
const IMG_W = 2800000;
const IMG_H = 1600000;
const GAP = 150000;
const START_X = 300000;
const START_Y = 1200000;
const COLS = 3;

let nextRid = 1000;

// Ensure Content Types
let ctXml = ori.getEntry('[Content_Types].xml').getData().toString('utf8');
if (!ctXml.includes('image/png')) ctXml = ctXml.replace('</Types>', '<Default Extension="png" ContentType="image/png"/></Types>');
if (!ctXml.includes('image/jpeg')) ctXml = ctXml.replace('</Types>', '<Default Extension="jpeg" ContentType="image/jpeg"/></Types>');
ori.updateFile(ori.getEntry('[Content_Types].xml'), Buffer.from(ctXml, 'utf8'));

for (const [slideName, plan] of Object.entries(imagePlan)) {
  // Start from THE ORIGINAL template (clean slate)
  let slideXml = ori.getEntry(slideName).getData().toString('utf8');
  
  // Apply text fixes from the current version
  const curEntry = cur.getEntry(slideName);
  if (curEntry) {
    const curXml = curEntry.getData().toString('utf8');
    // Only update the a:t text content, keep the original structure
    // We do this by comparing and transferring just the text changes
    const curTexts = curXml.match(/<a:t[^>]*>[^<]*<\/a:t>/g);
    const oriTexts = slideXml.match(/<a:t[^>]*>[^<]*<\/a:t>/g);
    if (curTexts && oriTexts && curTexts.length === oriTexts.length) {
      for (let i = 0; i < oriTexts.length; i++) {
        if (curTexts[i] !== oriTexts[i]) {
          // Update the text in the original slide XML
          // Use the EXACT string from the cur version (it has our fixes)
          slideXml = slideXml.replace(oriTexts[i], curTexts[i]);
        }
      }
    }
  }
  
  // Now add images
  const relsName = slideName.replace('.xml', '.xml.rels').replace('slides/', 'slides/_rels/');
  let relsXml = '';
  try {
    const re = ori.getEntry(relsName);
    if (re) relsXml = re.getData().toString('utf8');
  } catch(e) {}
  if (!relsXml) relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';
  
  plan.images.forEach((img, idx) => {
    const srcPath = path.join(mediaDir, img.file);
    if (!fs.existsSync(srcPath)) { console.log('  Missing:', img.file); return; }
    const data = fs.readFileSync(srcPath);
    const mediaName = 'ppt/media/' + img.name;
    
    // Add media
    if (!ori.getEntry(mediaName)) {
      ori.addFile(mediaName, data);
    }
    
    const col = idx % COLS;
    const row = Math.floor(idx / COLS);
    const xOff = START_X + col * (IMG_W + GAP);
    const yOff = START_Y + row * (IMG_H + GAP);
    
    const rid = 'rIdImg' + (nextRid++);
    
    // Add relationship
    const relEntry = '<Relationship Id="' + rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/' + img.name + '"/>';
    if (!relsXml.includes(rid)) {
      relsXml = relsXml.replace('</Relationships>', relEntry + '</Relationships>');
    }
    
    // Add image shape as <p:pic> (proper image element, not generic sp)
    const shapeId = plan.startId + idx;
    const imgShape = '<p:pic><p:nvPicPr><p:cNvPr id="' + shapeId + '" name="' + img.name + '"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="' + rid + '"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="' + xOff + '" y="' + yOff + '"/><a:ext cx="' + IMG_W + '" cy="' + IMG_H + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>';
    
    slideXml = slideXml.replace('</p:spTree>', imgShape + '</p:spTree>');
  });
  
  ori.updateFile(ori.getEntry(slideName), Buffer.from(slideXml, 'utf8'));
  if (ori.getEntry(relsName)) ori.updateFile(ori.getEntry(relsName), Buffer.from(relsXml, 'utf8'));
  else ori.addFile(relsName, Buffer.from(relsXml, 'utf8'));
  
  const totalImg = (slideXml.match(/p:pic/g) || []).length;
  console.log(slideName, '-', plan.images.length, 'images added, total:', totalImg);
}

// Save to temp first
ori.writeZip('C:\\Users\\zero\\.openclaw\\workspace\\final_ppt.pptx');
console.log('\n✅ Saved to workspace/final_ppt.pptx');

// Verify positions
const v = new AdmZip('C:\\Users\\zero\\.openclaw\\workspace\\final_ppt.pptx');
for (const e of v.getEntries()) {
  if (e.entryName.startsWith('ppt/slides/slide') && e.entryName.endsWith('.xml')) {
    const x = e.getData().toString('utf8');
    const pics = (x.match(/p:pic/g) || []).length;
    const blips = (x.match(/a:blip r:embed/g) || []).length;
    const yOffs = x.match(/y="(\d+)"/g);
    let maxY = 0;
    if (yOffs) maxY = Math.max(...yOffs.map(o => parseInt(o.match(/"(\d+)"/)[1])));
    const slideH = 6858000;
    console.log(e.entryName, pics + ' pics,', blips + ' blips,', 'maxY:', maxY, (maxY < slideH + 500000 ? '✅' : '⚠️ may overflow'));
  }
}
