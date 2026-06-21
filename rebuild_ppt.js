const AdmZip = require('adm-zip');

const cur = new AdmZip('C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx');
const ori = new AdmZip('C:\\Users\\zero\\.openclaw\\media\\inbound\\作品演示模板PPT---6e039813-9cec-473e-9475-d252b4969ac3.pptx');

// Fix each slide by restoring from original + updating content
const slideFixes = {
  'ppt/slides/slide1.xml': (xml) => {
    // Safe replacements only
    xml = xml.split('2501123121').join('202501150111');
    xml = xml.split('张三').join('李泽锐');
    xml = xml.split('2026-5-27').join('2026-6-9');
    return xml;
  },
  'ppt/slides/slide2.xml': (xml) => {
    // Restore from original, then update text
    let orig = ori.getEntry('ppt/slides/slide2.xml').getData().toString('utf8');
    orig = orig.split('子模的详细设计与实现解说').join('子模块详细设计与实现解说');
    orig = orig.split('作品简要介绍').join('作品简介');
    orig = orig.split('作品运行效果展示').join('运行效果展示');
    return orig;
  },
  'ppt/slides/slide3.xml': (xml) => {
    let orig = ori.getEntry('ppt/slides/slide3.xml').getData().toString('utf8');
    orig = orig.split('作品简要介绍').join('作品简介');
    return orig;
  },
  'ppt/slides/slide4.xml': (xml) => {
    let orig = ori.getEntry('ppt/slides/slide4.xml').getData().toString('utf8');
    orig = orig.split('作品简要介绍').join('校园导航系统简介');
    orig = orig.replace(/(<a:t[^>]*>)[^<]*。。。[^<]*(<\/a:t>)/g, '$1基于C语言+Dijkstra算法+邻接矩阵的校园导航系统$2');
    orig = orig.replace(/(<a:t[^>]*>)1(<\/a:t>)/g, '$1代码量：约350行$2');
    orig = orig.replace(/(<a:t[^>]*>)2(<\/a:t>)/g, '$1数据结构：邻接矩阵$2');
    orig = orig.replace(/(<a:t[^>]*>)3(<\/a:t>)/g, '$1模块数量：16个函数$2');
    orig = orig.split('展示关键结构体定义').join('CampusMap结构体封装核心数据');
    return orig;
  },
  'ppt/slides/slide5.xml': (xml) => {
    let orig = ori.getEntry('ppt/slides/slide5.xml').getData().toString('utf8');
    orig = orig.split('学生信息管理系统').join('校园导航系统');
    orig = orig.split('录入模块→存储模块→统计模块').join('主菜单→子模块→循环返回');
    orig = orig.split('录入模块调用存储模块的结构体数组，统计模块读取数据后排序').join('while(1)+switch循环调用16个函数模块');
    return orig;
  },
  'ppt/slides/slide6.xml': (xml) => {
    // Already has our custom text. Keep it.
    return xml;
  },
  'ppt/slides/slide7.xml': (xml) => {
    let orig = ori.getEntry('ppt/slides/slide7.xml').getData().toString('utf8');
    orig = orig.split('作品运行效果展示').join('运行效果展示');
    return orig;
  },
  'ppt/slides/slide8.xml': (xml) => {
    let orig = ori.getEntry('ppt/slides/slide8.xml').getData().toString('utf8');
    orig = orig.split('作品简要介绍').join('校园导航系统');
    orig = orig.split('系统功能演示与测试用例').join('系统功能演示与运行效果');
    return orig;
  },
  'ppt/slides/slide9.xml': (xml) => {
    let orig = ori.getEntry('ppt/slides/slide9.xml').getData().toString('utf8');
    orig = orig.split('子模的详细设计与实现解说').join('子模块设计与实现解说');
    return orig;
  },
  'ppt/slides/slide10.xml': (xml) => {
    let orig = ori.getEntry('ppt/slides/slide10.xml').getData().toString('utf8');
    orig = orig.split('模块技术解说').join('核心模块技术解说');
    orig = orig.replace(/(<a:t[^>]*>)一(<\/a:t>)/g, '$1一：initSystem()$2');
    orig = orig.replace(/(<a:t[^>]*>)二(<\/a:t>)/g, '$1二：addNode()$2');
    orig = orig.replace(/(<a:t[^>]*>)三(<\/a:t>)/g, '$1三：addEdge()$2');
    orig = orig.replace(/(<a:t[^>]*>)四(<\/a:t>)/g, '$1四：dijkstra()$2');
    orig = orig.replace(/(<a:t[^>]*>)1(<\/a:t>)/g, '$1O(n²)$2');
    orig = orig.replace(/(<a:t[^>]*>)2(<\/a:t>)/g, '$1O(1)$2');
    orig = orig.replace(/(<a:t[^>]*>)3(<\/a:t>)/g, '$1O(1)$2');
    orig = orig.replace(/(<a:t[^>]*>)4(<\/a:t>)/g, '$1O(n²)$2');
    orig = orig.split('显示记录').join('双层for循环赋值0/INF');
    orig = orig.split('修改记录').join('scanf存入nodes数组');
    orig = orig.split('插入新记录').join('校验+双向graph赋值');
    orig = orig.split('删除记录').join('dist/pre/visit三数组+松弛');
    return orig;
  },
  'ppt/slides/slide11.xml': (xml) => {
    let orig = ori.getEntry('ppt/slides/slide11.xml').getData().toString('utf8');
    orig = orig.split('一。。。。').join('Dijkstra最短路径算法');
    orig = orig.split('算法逻辑与复杂度分析（以排序/搜索算法为例）').join('①初始化dist/pre/visit ②找未访问的最小dist ③松弛更新 ④pre递归回溯');
    return orig;
  },
  'ppt/slides/slide12.xml': (xml) => {
    let orig = ori.getEntry('ppt/slides/slide12.xml').getData().toString('utf8');
    orig = orig.split('作品简要介绍').join('关键代码解析');
    orig = orig.split('关键代码细节解析（指针/内存/函数调用）').join('①启动口令校验 ②initSystem双层for ③dijkstra三数组 ④saveMap/loadMap文件读写');
    return orig;
  },
};

// Apply fixes
for (const [slideName, fixFn] of Object.entries(slideFixes)) {
  const curEntry = cur.getEntry(slideName);
  if (!curEntry) { console.log('Missing:', slideName); continue; }
  const curXml = curEntry.getData().toString('utf8');
  const fixedXml = fixFn(curXml);
  cur.updateFile(curEntry, Buffer.from(fixedXml, 'utf8'));
}

// Re-add embedded images (since we're using original slide XML, images need re-adding)
const mediaDir = 'C:\\Users\\zero\\.openclaw\\workspace\\docx_media';
const fs = require('fs');
const path = require('path');

// Add images to ppt/media and update slide rels
const imgMap = {
  'ppt/slides/slide5.xml': [{file:'image3.png', name:'arch.png'}],
  'ppt/slides/slide6.xml': [{file:'image4.png', name:'main_f.png'}, {file:'image6.png', name:'menu_f.png'}],
  'ppt/slides/slide8.xml': [{file:'image18.png', name:'demo1.png'}, {file:'image19.png', name:'demo2.png'}, {file:'image21.png', name:'demo3.png'}, {file:'image27.png', name:'demo4.png'}],
  'ppt/slides/slide10.xml': [{file:'image5.png', name:'init_f.png'}, {file:'image7.png', name:'addn_f.png'}, {file:'image8.png', name:'adde_f.png'}, {file:'image10.png', name:'deln_f.png'}, {file:'image11.png', name:'dele_f.png'}],
  'ppt/slides/slide11.xml': [{file:'image9.png', name:'dij_f.png'}, {file:'image13.png', name:'allp_f.png'}],
};

let nextRid = 100;
const added = {};

for (const [slideName, images] of Object.entries(imgMap)) {
  const relsName = slideName.replace('.xml', '.xml.rels').replace('slides/', 'slides/_rels/');
  let relsXml = '';
  let hasRels = false;
  try {
    const re = cur.getEntry(relsName);
    if (re) { relsXml = re.getData().toString('utf8'); hasRels = true; }
  } catch(e) {}
  if (!hasRels) {
    relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';
  }
  
  let slideXml = cur.getEntry(slideName).getData().toString('utf8');
  let imgIdx = 0;
  let relsChanged = false;
  
  for (const img of images) {
    const srcPath = path.join(mediaDir, img.file);
    if (!fs.existsSync(srcPath)) continue;
    const data = fs.readFileSync(srcPath);
    const mediaName = 'ppt/media/' + img.name;
    
    // Add media file if not already added
    const existingMedia = cur.getEntry(mediaName);
    if (!existingMedia) {
      cur.addFile(mediaName, data);
    }
    
    const rid = 'rIdImg' + (nextRid++);
    
    // Add relationship
    const relEntry = '<Relationship Id="' + rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/' + img.name + '"/>';
    if (!relsXml.includes(rid)) {
      relsXml = relsXml.replace('</Relationships>', relEntry + '</Relationships>');
      relsChanged = true;
    }
    
    // Add image shape - position in lower-right area
    const yOff = 1371600 + (imgIdx % 2) * 2500000;
    const xOff = 3500000 + Math.floor(imgIdx / 2) * 3000000;
    const w = 2400000;
    const h = 1800000;
    
    const imgShape = '<p:sp><p:nvSpPr><p:cNvPr id="' + (200+imgIdx) + '" name="' + img.name + '"/><p:cNvSpPr txBox="0"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="' + xOff + '" y="' + yOff + '"/><a:ext cx="' + w + '" cy="' + h + '"/></a:xfrm><a:prstGeom prst="rect"/></p:spPr><p:blipFill><a:blip r:embed="' + rid + '"/><a:stretch><a:fillRect/></a:stretch></p:blipFill></p:sp>';
    slideXml = slideXml.replace('</p:spTree>', imgShape + '</p:spTree>');
    imgIdx++;
  }
  
  cur.updateFile(cur.getEntry(slideName), Buffer.from(slideXml, 'utf8'));
  if (relsChanged) {
    if (cur.getEntry(relsName)) cur.updateFile(cur.getEntry(relsName), Buffer.from(relsXml, 'utf8'));
    else cur.addFile(relsName, Buffer.from(relsXml, 'utf8'));
  }
}

// Ensure Content Types
let ctXml = cur.getEntry('[Content_Types].xml').getData().toString('utf8');
if (!ctXml.includes('image/png')) ctXml = ctXml.replace('</Types>', '<Default Extension="png" ContentType="image/png"/></Types>');
if (!ctXml.includes('image/jpeg')) ctXml = ctXml.replace('</Types>', '<Default Extension="jpeg" ContentType="image/jpeg"/></Types>');
cur.updateFile(cur.getEntry('[Content_Types].xml'), Buffer.from(ctXml, 'utf8'));

cur.writeZip('C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx');

// Final verification
const v = new AdmZip('C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx');
for (const e of v.getEntries()) {
  if (e.entryName.startsWith('ppt/slides/slide') && e.entryName.endsWith('.xml')) {
    const x = e.getData().toString('utf8');
    const t = (x.match(/<a:t[^>]*>[^<]*<\/a:t>/g)||[]).map(t=>t.replace(/<[^>]+>/g,'')).filter(x=>x.trim()).join(' ').substring(0,120);
    const imgC = (x.match(/a:blip/g)||[]).length;
    const sn = e.entryName.replace('ppt/slides/slide','').replace('.xml','');
    console.log('Slide', sn+':', 'img:', imgC, '|', t);
  }
}
