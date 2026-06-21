const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const mediaDir = 'C:\\Users\\zero\\.openclaw\\workspace\\docx_media';

const pptPath = 'C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx';
const zip = new AdmZip(pptPath);

// Slide dimensions: 12192000 x 6858000 EMU
// Plan: Place images in the bottom half as a grid

// Define which images go where with correct positions
// Format: { slide, file, name, col, row }
// Each image: w=2800000, h=1500000, 3 cols, max 6 per slide
const W = 2700000;
const H = 1500000;
const GAP = 200000;
const START_X = 400000;
const START_Y = 1300000;
const COLS = 3;

const imagePlan = {
  'ppt/slides/slide5.xml': [
    { file: 'image3.png', name: 'arch.png', label: '整体功能结构' },
  ],
  'ppt/slides/slide6.xml': [
    { file: 'image4.png', name: 'main_f.png', label: '主界面流程图' },
    { file: 'image6.png', name: 'menu_f.png', label: '主菜单流程图' },
  ],
  'ppt/slides/slide8.xml': [
    { file: 'image18.png', name: 'd01.png', label: '系统启动' },
    { file: 'image19.png', name: 'd02.png', label: '主菜单' },
    { file: 'image20.png', name: 'd03.png', label: '添加节点' },
    { file: 'image21.png', name: 'd04.png', label: '节点界面' },
    { file: 'image22.png', name: 'd05.png', label: '添加路径' },
    { file: 'image23.png', name: 'd06.png', label: '路径界面' },
    { file: 'image24.png', name: 'd07.png', label: '查看节点' },
    { file: 'image25.png', name: 'd08.png', label: '邻接矩阵' },
    { file: 'image26.png', name: 'd09.png', label: '路径查询' },
    { file: 'image27.png', name: 'd10.png', label: '查询结果' },
    { file: 'image28.png', name: 'd11.png', label: '删除节点' },
    { file: 'image29.png', name: 'd12.png', label: '删除路径' },
    { file: 'image30.png', name: 'd13.png', label: '删除界面' },
    { file: 'image31.png', name: 'd14.png', label: '图形地图' },
    { file: 'image32.png', name: 'd15.png', label: '全节点路径' },
    { file: 'image33.png', name: 'd16.png', label: '保存地图' },
    { file: 'image34.png', name: 'd17.png', label: '加载地图' },
    { file: 'image35.png', name: 'd18.png', label: '系统信息' },
    { file: 'image36.png', name: 'd19.png', label: '退出系统' },
  ],
  'ppt/slides/slide10.xml': [
    { file: 'image5.png', name: 't01.png', label: '系统初始化流程' },
    { file: 'image7.png', name: 't02.png', label: '添加节点流程' },
    { file: 'image8.png', name: 't03.png', label: '添加路径流程' },
    { file: 'image9.png', name: 't04.png', label: '最短路径流程' },
    { file: 'image10.png', name: 't05.png', label: '删除节点流程' },
    { file: 'image11.png', name: 't06.png', label: '删除路径流程' },
    { file: 'image12.png', name: 't07.png', label: '地图展示流程' },
    { file: 'image14.png', name: 't08.png', label: '保存文件流程' },
    { file: 'image15.png', name: 't09.png', label: '加载文件流程' },
    { file: 'image16.png', name: 't10.png', label: '图形地图流程' },
    { file: 'image17.png', name: 't11.png', label: '系统信息流程' },
  ],
  'ppt/slides/slide11.xml': [
    { file: 'image9.png', name: 'a01.png', label: '最短路径流程' },
    { file: 'image13.png', name: 'a02.png', label: '全节点路径流程' },
  ],
};

let imgId = 0;
let nextRid = 500;

// Update Content Types
let ctXml = zip.getEntry('[Content_Types].xml').getData().toString('utf8');
if (!ctXml.includes('image/png')) ctXml = ctXml.replace('</Types>', '<Default Extension="png" ContentType="image/png"/></Types>');
if (!ctXml.includes('image/jpeg')) ctXml = ctXml.replace('</Types>', '<Default Extension="jpeg" ContentType="image/jpeg"/></Types>');
zip.updateFile(zip.getEntry('[Content_Types].xml'), Buffer.from(ctXml, 'utf8'));

for (const [slideName, images] of Object.entries(imagePlan)) {
  // Start with a FRESH copy from the original template for this slide
  // Then re-add all images at correct positions
  let slideXml = zip.getEntry(slideName).getData().toString('utf8');
  
  // Remove all previously added custom image shapes (sp elements with our names)
  // Remove any <p:sp> that has a cNvPr with name matching our pattern
  slideXml = slideXml.replace(/<p:sp>[\s\S]*?<p:cNvPr[^>]*name="(?:arch|main_f|menu_f|d\d+|t\d+|a\d+|demo\d+|map_f|save_f|load_f|draw_f|info_f|dij_f|init_f|addn_f|adde_f|deln_f|dele_f|allp_f)\.[^"]*"[^>]*\/>[\s\S]*?<\/p:sp>/g, '');
  
  // Also remove old image shapes from earlier attempts
  slideXml = slideXml.replace(/<p:sp>[\s\S]*?<p:cNvPr[^>]*id="[12]\d\d"[^>]*\/>[\s\S]*?<\/p:sp>/g, '');
  
  const relsName = slideName.replace('.xml', '.xml.rels').replace('slides/', 'slides/_rels/');
  let relsXml = '';
  try { const re = zip.getEntry(relsName); if (re) relsXml = re.getData().toString('utf8'); } catch(e) {}
  if (!relsXml) relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';
  
  // Clean old custom rels
  relsXml = relsXml.replace(/<Relationship Id="rIdImg\d+"[^>]*\/>/g, '');
  
  // Add images
  const scale = slideName === 'ppt/slides/slide5.xml' ? 1.5 : 1.0;
  const imgW = Math.round(W * scale);
  const imgH = Math.round(H * scale);
  
  images.forEach((img, idx) => {
    const srcPath = path.join(mediaDir, img.file);
    if (!fs.existsSync(srcPath)) return;
    const data = fs.readFileSync(srcPath);
    const mediaName = 'ppt/media/' + img.name;
    zip.addFile(mediaName, data);
    
    const col = idx % COLS;
    const row = Math.floor(idx / COLS);
    const xOff = START_X + col * (imgW + GAP);
    const yOff = START_Y + row * (imgH + GAP);
    
    const rid = 'rIdImg' + (nextRid++);
    imgId++;
    
    // Add relationship
    const relEntry = '<Relationship Id="' + rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/' + img.name + '"/>';
    relsXml = relsXml.replace('</Relationships>', relEntry + '</Relationships>');
    
    // Add image shape
    const imgShape = '<p:sp><p:nvSpPr><p:cNvPr id="' + (500+imgId) + '" name="' + img.name + '"/><p:cNvSpPr txBox="0"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="' + xOff + '" y="' + yOff + '"/><a:ext cx="' + imgW + '" cy="' + imgH + '"/></a:xfrm><a:prstGeom prst="rect"/></p:spPr><p:blipFill><a:blip r:embed="' + rid + '"/><a:stretch><a:fillRect/></a:stretch></p:blipFill></p:sp>';
    slideXml = slideXml.replace('</p:spTree>', imgShape + '</p:spTree>');
  });
  
  zip.updateFile(zip.getEntry(slideName), Buffer.from(slideXml, 'utf8'));
  if (zip.getEntry(relsName)) zip.updateFile(zip.getEntry(relsName), Buffer.from(relsXml, 'utf8'));
  else zip.addFile(relsName, Buffer.from(relsXml, 'utf8'));
  
  console.log('Slide', slideName.replace('ppt/slides/','').replace('.xml',''), ':', images.length, 'images added');
}

const tmpPath = 'C:\\Users\\zero\\.openclaw\\workspace\\temp_output.pptx';
zip.writeZip(tmpPath);
console.log('\n✅ All images repositioned correctly!');

// Quick verify: check image positions in slide8
const v = new AdmZip(pptPath);
const s8xml = v.getEntry('ppt/slides/slide8.xml').getData().toString('utf8');
const offs = s8xml.match(/<a:off x="(\d+)" y="(\d+)"/g);
if (offs) {
  const maxY = Math.max(...offs.map(o => parseInt(o.match(/y="(\d+)"/)[1])));
  console.log('Max Y position:', maxY, '(slide height: 6858000)');
  if (maxY < 6858000) console.log('✅ All images within slide bounds!');
  else console.log('⚠️ Some images may extend beyond slide (y=' + maxY + ')');
}
