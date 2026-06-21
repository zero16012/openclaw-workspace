const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const pptPath = 'C:\\Users\\zero\\.openclaw\\workspace\\temp_ppt.pptx';
const mediaDir = 'C:\\Users\\zero\\.openclaw\\workspace\\docx_media';
const outPath = 'C:\\Users\\zero\\.openclaw\\workspace\\temp_ppt.pptx';

// Map: which images go to which slides
// slide -> [{docxImageFile, newName, caption}]
const slideImages = {
  'ppt/slides/slide5.xml': [  // System architecture
    { file: 'image3.png', name: 'arch_diagram.png', caption: '2.2 整体功能结构设计' },
  ],
  'ppt/slides/slide6.xml': [  // Module architecture
    { file: 'image4.png', name: 'main_flowchart.png', caption: '2.4.1 系统界面流程图' },
    { file: 'image6.png', name: 'menu_flowchart.png', caption: '2.4.3 主菜单模块' },
  ],
  'ppt/slides/slide8.xml': [  // Demo screenshots
    { file: 'image18.png', name: 'demo_startup.png', caption: '系统启动界面' },
    { file: 'image19.png', name: 'demo_menu.png', caption: '主菜单界面' },
    { file: 'image21.png', name: 'demo_addnode.png', caption: '添加节点' },
    { file: 'image27.png', name: 'demo_path.png', caption: '最短路径查询' },
  ],
  'ppt/slides/slide10.xml': [ // Module tech
    { file: 'image5.png', name: 'init_flowchart.png', caption: '系统初始化' },
    { file: 'image7.png', name: 'addnode_flowchart.png', caption: '添加节点流程' },
    { file: 'image8.png', name: 'addedge_flowchart.png', caption: '添加路径流程' },
    { file: 'image10.png', name: 'delnode_flowchart.png', caption: '删除节点流程' },
    { file: 'image11.png', name: 'deledge_flowchart.png', caption: '删除路径流程' },
  ],
  'ppt/slides/slide11.xml': [ // Algorithm
    { file: 'image9.png', name: 'dijkstra_flowchart.png', caption: '最短路径流程图' },
    { file: 'image13.png', name: 'allpaths_flowchart.png', caption: '全节点路径流程图' },
  ],
};

const zip = new AdmZip(pptPath);

// 1. Read all current entry data
const entryNames = {};
for (const entry of zip.getEntries()) {
  entryNames[entry.entryName] = true;
}

// 2. Add images to ppt/media/
const addedImages = {}; // fileName -> rId
let nextRid = 100;

for (const [slideName, images] of Object.entries(slideImages)) {
  for (const img of images) {
    const srcPath = path.join(mediaDir, img.file);
    if (!fs.existsSync(srcPath)) {
      console.log('Missing:', img.file);
      continue;
    }
    const data = fs.readFileSync(srcPath);
    const mediaName = 'ppt/media/' + img.name;
    if (!entryNames[mediaName]) {
      zip.addFile(mediaName, data);
      entryNames[mediaName] = true;
      console.log('Added:', mediaName, data.length, 'bytes');
    }
    if (!addedImages[img.name]) {
      addedImages[img.name] = 'rIdImg' + (nextRid++);
    }
  }
}

// 3. Update [Content_Types].xml
let ctXml = zip.getEntry('[Content_Types].xml').getData().toString('utf8');
if (!ctXml.includes('image/png')) {
  ctXml = ctXml.replace('</Types>', '<Default Extension="png" ContentType="image/png"/></Types>');
}
if (!ctXml.includes('image/jpeg')) {
  ctXml = ctXml.replace('</Types>', '<Default Extension="jpeg" ContentType="image/jpeg"/></Types>');
}
zip.updateFile(zip.getEntry('[Content_Types].xml'), Buffer.from(ctXml, 'utf8'));

// 4. Add images to slides
for (const [slideName, images] of Object.entries(slideImages)) {
  let slideXml = zip.getEntry(slideName).getData().toString('utf8');
  
  // Read the slide's _rels file
  const relsName = slideName.replace('.xml', '.xml.rels').replace('slides/', 'slides/_rels/');
  let relsXml = '';
  try {
    const relsEntry = zip.getEntry(relsName);
    if (relsEntry) relsXml = relsEntry.getData().toString('utf8');
  } catch(e) {
    relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';
  }
  
  let relsChanged = false;
  let imgIdx = 0;
  
  for (const img of images) {
    const rid = addedImages[img.name];
    if (!rid) continue;
    
    // Add relationship
    const relEntry = '<Relationship Id="' + rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/' + img.name + '"/>';
    if (!relsXml.includes(rid)) {
      relsXml = relsXml.replace('</Relationships>', relEntry + '</Relationships>');
      relsChanged = true;
    }
    
    // Calculate position (stack images vertically on the slide)
    const yOff = 914400 + (imgIdx * 2000000); // EMU units (1 inch = 914400 EMU)
    const xOff = 1371600; // ~1.5 inches from left
    const imgWidth = 3657600; // ~4 inches
    const imgHeight = 2743200; // ~3 inches
    
    // Add image shape to slide XML (before </p:spTree>)
    const imgShape = `
    <p:sp>
      <p:nvSpPr>
        <p:cNvPr id="${200 + imgIdx}" name="${img.name}"/>
        <p:cNvSpPr txBox="0"/>
        <p:nvPr/>
      </p:nvSpPr>
      <p:spPr>
        <a:xfrm>
          <a:off x="${xOff}" y="${yOff}"/>
          <a:ext cx="${imgWidth}" cy="${imgHeight}"/>
        </a:xfrm>
        <a:prstGeom prst="rect"/>
      </p:spPr>
      <p:blipFill>
        <a:blip r:embed="${rid}"/>
        <a:stretch><a:fillRect/></a:stretch>
      </p:blipFill>
    </p:sp>`;
    
    slideXml = slideXml.replace('</p:spTree>', imgShape + '\n    </p:spTree>');
    imgIdx++;
  }
  
  zip.updateFile(zip.getEntry(slideName), Buffer.from(slideXml, 'utf8'));
  
  if (relsChanged) {
    if (zip.getEntry(relsName)) {
      zip.updateFile(zip.getEntry(relsName), Buffer.from(relsXml, 'utf8'));
    } else {
      zip.addFile(relsName, Buffer.from(relsXml, 'utf8'));
    }
    console.log('Updated:', relsName);
  }
}

// Write output
zip.writeZip(outPath);
console.log('\n✅ Images embedded into PPT!');

// Copy to desktop
fs.writeFileSync('C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx', zip.toBuffer());
console.log('✅ Copy to desktop done!');
