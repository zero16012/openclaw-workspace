const fs = require('fs');
const AdmZip = require('adm-zip');

const outPath = 'C:\\Users\\zero\\.openclaw\\workspace\\temp_ppt.pptx';

const zip = new AdmZip(outPath);

// Slide 4 - update metrics
let s4 = zip.getEntry('ppt/slides/slide4.xml').getData().toString('utf8');
s4 = s4.replace('代码量：约2000行', '代码量：约350行（含注释）');
s4 = s4.replace('13个核心功能模块', '16个函数模块（含主函数）');
zip.updateFile(zip.getEntry('ppt/slides/slide4.xml'), Buffer.from(s4, 'utf8'));

// Slide 10 - actual function names
let s10 = zip.getEntry('ppt/slides/slide10.xml').getData().toString('utf8');
s10 = s10.replace(/<a:t[^>]*>一<\/a:t>/g, '<a:t>一：initSystem()</a:t>');
s10 = s10.replace(/<a:t[^>]*>二<\/a:t>/g, '<a:t>二：addNode()</a:t>');
s10 = s10.replace(/<a:t[^>]*>三<\/a:t>/g, '<a:t>三：addEdge()</a:t>');
s10 = s10.replace(/<a:t[^>]*>四<\/a:t>/g, '<a:t>四：dijkstra()</a:t>');
s10 = s10.replace(/<a:t[^>]*>1<\/a:t>/g, '<a:t>O(n²)</a:t>');
s10 = s10.replace(/<a:t[^>]*>2<\/a:t>/g, '<a:t>O(1)</a:t>');
s10 = s10.replace(/<a:t[^>]*>3<\/a:t>/g, '<a:t>O(1)</a:t>');
s10 = s10.replace(/<a:t[^>]*>4<\/a:t>/g, '<a:t>O(n²)</a:t>');
s10 = s10.replace('双重循环初始化矩阵', '双重for循环赋值0/INF');
s10 = s10.replace('循环输入节点名称', 'scanf存入nodes数组');
s10 = s10.replace('校验编号 + 双向赋值', '校验范围+双向graph赋值');
s10 = s10.replace('dist+pre+visit初始化', 'dist/pre/visit三数组+松弛');
zip.updateFile(zip.getEntry('ppt/slides/slide10.xml'), Buffer.from(s10, 'utf8'));

// Slide 11 - algorithm details
let s11 = zip.getEntry('ppt/slides/slide11.xml').getData().toString('utf8');
s11 = s11.replace('Dijkstra最短路径算法', 'Dijkstra算法核心实现');
s11 = s11.replace('Dijkstra算法逻辑与 O(n²) 复杂度分析', '①初始化dist/pre/visit   ②循环n次找最小dist\n③松弛更新相邻节点   ④pre递归回溯路径');
zip.updateFile(zip.getEntry('ppt/slides/slide11.xml'), Buffer.from(s11, 'utf8'));

// Slide 12 - key code details
let s12 = zip.getEntry('ppt/slides/slide12.xml').getData().toString('utf8');
s12 = s12.replace('邻接矩阵初始化 / Dijkstra核心实现 / 文件读写', '①启动口令校验(默认1)  ②initSystem双层for\n③dijkstra三数组+松弛  ④saveMap/loadMap文件读写');
zip.updateFile(zip.getEntry('ppt/slides/slide12.xml'), Buffer.from(s12, 'utf8'));

// Slide 6 - accurate function list
let s6 = zip.getEntry('ppt/slides/slide6.xml').getData().toString('utf8');
s6 = s6.replace('主菜单控制模块', 'main() 主循环控制');
s6 = s6.replace('校园节点录入模块', 'addNode() 节点录入');
s6 = s6.replace('校园路径录入模块', 'addEdge() 路径录入');
s6 = s6.replace('两点最短路径查询', 'queryPath() 单点查询');
s6 = s6.replace('全节点路径查询', 'findAllPaths() 全节点');
s6 = s6.replace('删除节点', 'deleteNode() 删节点');
s6 = s6.replace('删除路径', 'deleteEdge() 删路径');
s6 = s6.replace('保存地图到文件', 'saveMap() 文件保存');
s6 = s6.replace('从文件加载地图', 'loadMap() 文件加载');
s6 = s6.replace('控制台图形化地图', 'drawConsoleMap() 可视化');
s6 = s6.replace('系统信息', 'systemInfo() 系统信息');
s6 = s6.replace('说明模块交互（如 "录入模块调用存储模块的结构体数组，统计模块读取数据后排序"）。', '');
s6 = s6.replace('主菜单控制13个子模块，循环调用执行', 'while(1) + switch(choice) 循环调用16个函数');
zip.updateFile(zip.getEntry('ppt/slides/slide6.xml'), Buffer.from(s6, 'utf8'));

// Write
fs.writeFileSync(outPath, zip.toBuffer());
console.log('PPT enhanced with actual code data!');

// Verify
const vZip = new AdmZip(outPath);
for (const entry of vZip.getEntries()) {
  if (entry.entryName.startsWith('ppt/slides/slide') && entry.entryName.endsWith('.xml')) {
    const xml = entry.getData().toString('utf8');
    const texts = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g);
    if (texts) {
      const content = texts.map(t => t.replace(/<[^>]+>/g, '')).filter(t => t.trim()).join(' | ').trim();
      const kws = ['学生成绩', '张三', '2501', '不及格', '录入模块→'];
      let clean = true;
      for (const k of kws) { if (content.includes(k)) { clean = false; break; } }
      console.log(`  ${entry.entryName}: ${clean ? '✅' : '⚠️'} ${content.substring(0, 130)}`);
    }
  }
}
