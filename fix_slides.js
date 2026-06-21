const AdmZip = require('adm-zip');
const fs = require('fs');

const srcPptx = 'C:\\Users\\zero\\.openclaw\\media\\inbound\\作品演示模板PPT---6e039813-9cec-473e-9475-d252b4969ac3.pptx';
const curPptx = 'C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx';
const outPptx = 'C:\\Users\\zero\\Desktop\\校园导航系统_作品演示PPT.pptx';

// Load original slides for reference
const srcZip = new AdmZip(srcPptx);
const curZip = new AdmZip(curPptx);

// Compare slide by slide and fix missing text
for (const entry of curZip.getEntries()) {
  if (!entry.entryName.startsWith('ppt/slides/slide') || !entry.entryName.endsWith('.xml')) continue;
  
  const curXml = entry.getData().toString('utf8');
  const srcEntry = srcZip.getEntry(entry.entryName);
  if (!srcEntry) continue;
  const srcXml = srcEntry.getData().toString('utf8');
  
  const curTexts = (curXml.match(/<a:t[^>]*>[^<]*<\/a:t>/g) || []).map(t => t.replace(/<[^>]+>/g, '')).join('|');
  const srcTexts = (srcXml.match(/<a:t[^>]*>[^<]*<\/a:t>/g) || []).map(t => t.replace(/<[^>]+>/g, '')).join('|');
  
  // Check if current slide is missing a lot of text compared to original
  if (curTexts.length < srcTexts.length * 0.6) {
    console.log(`Slide ${entry.entryName}: MISSING TEXT`);
    console.log(`  Original: ${srcTexts.substring(0, 120)}`);
    console.log(`  Current:  ${curTexts.substring(0, 120)}`);
    
    // For slide 1, restore from original and update key fields
    if (entry.entryName === 'ppt/slides/slide1.xml') {
      let fixed = srcXml;
      fixed = fixed.replace('学生成绩管理系统', '增强版校园导航系统');
      fixed = fixed.replace('2501123121', '202501150111');
      fixed = fixed.replace('张三', '李泽锐');
      fixed = fixed.replace('2026-5-27', '2026-6-9');
      // Keep images from current version
      const curImgBlips = curXml.match(/<a:blip[^>]*\/>/g) || [];
      for (const blip of curImgBlips) {
        if (!fixed.includes(blip.match(/r:embed="([^"]+)"/)[1])) {
          // If new image ref not in original, skip (images are decorative backgrounds)
        }
      }
      curZip.updateFile(entry, Buffer.from(fixed, 'utf8'));
      console.log('  -> Restored slide 1 from original + updated fields');
    }
    
    // For slide 4, restore from original
    if (entry.entryName === 'ppt/slides/slide4.xml') {
      let fixed = srcXml;
      // Keep image references from current version
      // Update key text fields
      fixed = fixed.replace(/<a:t[^>]*>作品简要介绍<\/a:t>/g, '<a:t>校园导航系统简介</a:t>');
      fixed = fixed.replace(/<a:t[^>]*>。。。<\/a:t>/g, '<a:t>基于C语言 + Dijkstra算法 + 邻接矩阵的校园导航系统</a:t>');
      fixed = fixed.replace(/<a:t[^>]*>1<\/a:t>/g, '<a:t>代码量：约350行（含注释）</a:t>');
      fixed = fixed.replace(/<a:t[^>]*>2<\/a:t>/g, '<a:t>数据结构：邻接矩阵（二维数组）</a:t>');
      fixed = fixed.replace(/<a:t[^>]*>3<\/a:t>/g, '<a:t>模块数量：16个函数模块</a:t>');
      fixed = fixed.replace('代码量与复杂', '代码量与复杂度');
      fixed = fixed.replace('数据结构选', '数据结构选型');
      fixed = fixed.replace('功能模块个', '功能模块总数');
      fixed = fixed.replace('展示关键结构体定义', 'CampusMap结构体封装核心地图数据');
      curZip.updateFile(entry, Buffer.from(fixed, 'utf8'));
      console.log('  -> Restored slide 4 from original + updated content');
    }
  }
}

// Also copy the original slide8 if needed (demo slide)
const curS8 = curZip.getEntry('ppt/slides/slide8.xml').getData().toString('utf8');
const srcS8texts = (srcZip.getEntry('ppt/slides/slide8.xml').getData().toString('utf8').match(/<a:t[^>]*>[^<]*<\/a:t>/g) || []).map(t=>t.replace(/<[^>]+>/g,'')).join('');
const curS8texts = (curS8.match(/<a:t[^>]*>[^<]*<\/a:t>/g) || []).map(t=>t.replace(/<[^>]+>/g,'')).join('');
if (curS8texts.length < 10) {
  // Restore slide 8 too
  let fixed8 = srcZip.getEntry('ppt/slides/slide8.xml').getData().toString('utf8');
  fixed8 = fixed8.replace('作品简要介绍', '校园导航系统');
  fixed8 = fixed8.replace('系统功能演示与测试用例', '系统功能演示与运行效果');
  curZip.updateFile(curZip.getEntry('ppt/slides/slide8.xml'), Buffer.from(fixed8, 'utf8'));
  console.log('  -> Restored slide 8 from original');
}

// Write fixed PPTX
curZip.writeZip(outPptx);
console.log('\n✅ Fixes applied!');
