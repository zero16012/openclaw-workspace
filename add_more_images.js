const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const ori = new AdmZip('C:\\Users\\zero\\.openclaw\\media\\inbound\\作品演示模板PPT---6e039813-9cec-473e-9475-d252b4969ac3.pptx');
const cur = new AdmZip('C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx');
const mediaDir = 'C:\\Users\\zero\\.openclaw\\workspace\\docx_media';

// Add ALL remaining flowchart images to existing slides - bigger placement
const extraImages = [
  // Add big flowchart images to slide 10 (module tech) - 5 more
  { slide: 'ppt/slides/slide10.xml', file: 'image12.png', name: 'map_f.png', desc: '地图展示流程图' },
  { slide: 'ppt/slides/slide10.xml', file: 'image14.png', name: 'save_f.png', desc: '保存文件流程图' },
  { slide: 'ppt/slides/slide10.xml', file: 'image15.png', name: 'load_f.png', desc: '加载文件流程图' },
  { slide: 'ppt/slides/slide10.xml', file: 'image16.png', name: 'draw_f.png', desc: '图形化地图流程图' },
  { slide: 'ppt/slides/slide10.xml', file: 'image17.png', name: 'info_f.png', desc: '系统信息流程图' },
  // Add more demo screenshots to slide 8
  { slide: 'ppt/slides/slide8.xml', file: 'image20.png', name: 'demo5.png', desc: '添加节点截图' },
  { slide: 'ppt/slides/slide8.xml', file: 'image22.png', name: 'demo6.png', desc: '添加路径截图' },
  { slide: 'ppt/slides/slide8.xml', file: 'image23.png', name: 'demo7.png', desc: '路径界面' },
  { slide: 'ppt/slides/slide8.xml', file: 'image24.png', name: 'demo8.png', desc: '查看节点' },
  { slide: 'ppt/slides/slide8.xml', file: 'image25.png', name: 'demo9.png', desc: '邻接矩阵' },
  { slide: 'ppt/slides/slide8.xml', file: 'image26.png', name: 'demo10.png', desc: '路径查询' },
  { slide: 'ppt/slides/slide8.xml', file: 'image28.png', name: 'demo11.png', desc: '删除节点' },
  { slide: 'ppt/slides/slide8.xml', file: 'image29.png', name: 'demo12.png', desc: '删除路径' },
  { slide: 'ppt/slides/slide8.xml', file: 'image30.png', name: 'demo13.png', desc: '路径删除界面' },
  { slide: 'ppt/slides/slide8.xml', file: 'image31.png', name: 'demo14.png', desc: '图形地图' },
  { slide: 'ppt/slides/slide8.xml', file: 'image32.png', name: 'demo15.png', desc: '全节点路径' },
  { slide: 'ppt/slides/slide8.xml', file: 'image33.png', name: 'demo16.png', desc: '保存地图' },
  { slide: 'ppt/slides/slide8.xml', file: 'image34.png', name: 'demo17.png', desc: '加载地图' },
  { slide: 'ppt/slides/slide8.xml', file: 'image35.png', name: 'demo18.png', desc: '系统信息' },
  { slide: 'ppt/slides/slide8.xml', file: 'image36.png', name: 'demo19.png', desc: '退出系统' },
  // Add more flowcharts to slide 11
  { slide: 'ppt/slides/slide11.xml', file: 'image9.png', name: 'dij_f2.png', desc: 'Dijkstra流程图' },
];

// Clone slide 3 structure to create a new "方案选型" slide (between current slides 3 and 4)
// Actually, creating new slides is complex. Let me just add content to existing slides.

// Get [Content_Types].xml
let ctXml = cur.getEntry('[Content_Types].xml').getData().toString('utf8');

let nextRid = 200; // higher range to avoid conflicts

for (const img of extraImages) {
  const srcPath = path.join(mediaDir, img.file);
  if (!fs.existsSync(srcPath)) { console.log('Missing:', img.file); continue; }
  const data = fs.readFileSync(srcPath);
  const mediaName = 'ppt/media/' + img.name;
  
  // Add media
  if (!cur.getEntry(mediaName)) {
    cur.addFile(mediaName, data);
  }
  
  // Get slide XML
  let slideXml = cur.getEntry(img.slide).getData().toString('utf8');
  const relsName = img.slide.replace('.xml', '.xml.rels').replace('slides/', 'slides/_rels/');
  let relsXml = '';
  try { const re = cur.getEntry(relsName); if (re) relsXml = re.getData().toString('utf8'); } catch(e) {}
  if (!relsXml) relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';
  
  const rid = 'rIdImg' + (nextRid++);
  const relEntry = '<Relationship Id="' + rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/' + img.name + '"/>';
  if (!relsXml.includes(rid)) {
    relsXml = relsXml.replace('</Relationships>', relEntry + '</Relationships>');
  }
  
  // Add image - stack them in a grid pattern
  // Count existing images in slide to determine position
  const existingBlips = slideXml.match(/a:blip/g) || [];
  const imgCount = existingBlips.length;
  const col = imgCount % 2; // 0 or 1
  const row = Math.floor(imgCount / 2); // 0, 1, 2...
  const xOff = 400000 + col * 3700000;
  const yOff = 1100000 + row * 2100000;
  const w = 3400000;
  const h = 1900000;
  
  const imgShape = '<p:sp><p:nvSpPr><p:cNvPr id="' + (300+imgCount) + '" name="' + img.name + '"/><p:cNvSpPr txBox="0"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="' + xOff + '" y="' + yOff + '"/><a:ext cx="' + w + '" cy="' + h + '"/></a:xfrm><a:prstGeom prst="rect"/></p:spPr><p:blipFill><a:blip r:embed="' + rid + '"/><a:stretch><a:fillRect/></a:stretch></p:blipFill></p:sp>';
  slideXml = slideXml.replace('</p:spTree>', imgShape + '</p:spTree>');
  
  cur.updateFile(cur.getEntry(img.slide), Buffer.from(slideXml, 'utf8'));
  
  const relsEntry = cur.getEntry(relsName);
  if (relsEntry) cur.updateFile(relsEntry, Buffer.from(relsXml, 'utf8'));
  else cur.addFile(relsName, Buffer.from(relsXml, 'utf8'));
  
  console.log('Added:', img.name, 'to', img.slide.replace('ppt/slides/',''), '('+img.desc+')');
}

// Update Content Types
if (!ctXml.includes('image/png')) ctXml = ctXml.replace('</Types>', '<Default Extension="png" ContentType="image/png"/></Types>');
if (!ctXml.includes('image/jpeg')) ctXml = ctXml.replace('</Types>', '<Default Extension="jpeg" ContentType="image/jpeg"/></Types>');
cur.updateFile(cur.getEntry('[Content_Types].xml'), Buffer.from(ctXml, 'utf8'));

cur.writeZip('C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx');
console.log('\n✅ All extra images added! PPT is now richer with content.');
