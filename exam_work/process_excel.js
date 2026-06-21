const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const WORK_DIR = path.resolve(__dirname, 'EXCEL素材');
const SRC_FILE = path.join(WORK_DIR, 'ET.xlsx');
const DATA_FILE = path.join(WORK_DIR, '绩效后台数据.txt');
const OUT_DIR = path.resolve(__dirname, 'output');
const OUT_FILE = path.join(OUT_DIR, '学号+姓名+ET.xlsx');

async function main() {
    fs.mkdirSync(OUT_DIR, { recursive: true });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(SRC_FILE);

    const ws1 = workbook.getWorksheet('员工绩效汇总') || workbook.getWorksheet(1);
    const ws2 = workbook.getWorksheet('统计') || workbook.getWorksheet(2);
    const ws3 = workbook.getWorksheet('Sheet3') || workbook.getWorksheet(3);

    if (!ws1 || !ws2 || !ws3) {
        console.error('Worksheets not found!');
        console.log('Available sheets:', workbook.worksheets.map(w => w.name));
        return;
    }

    console.log('=== Sheet names ===');
    workbook.worksheets.forEach(w => console.log(w.name));

    // ===== Requirement 1: Column widths (in Chinese character units) =====
    const colWidths = { A: 10, B: 12.5, C: 7.5, D: 10, E: 20, F: 15, G: 10, H: 10, I: 40, J: 10 };
    for (const [col, width] of Object.entries(colWidths)) {
        ws1.getColumn(col).width = width;
    }
    console.log('R1: Column widths set');

    // ===== Requirement 2: Date format yyyy-mm-dd on column F =====
    for (let r = 2; r <= 201; r++) {
        const cell = ws1.getCell(`F${r}`);
        if (cell.value && typeof cell.value === 'object' && cell.value instanceof Date) {
            cell.numFmt = 'yyyy-mm-dd';
        } else if (typeof cell.value === 'number') {
            cell.numFmt = 'yyyy-mm-dd';
        }
    }
    console.log('R2: Date format set');

    // ===== Requirement 3: Conditional formatting - duplicate names =====
    ws1.addConditionalFormatting({
        ref: 'B2:B201',
        rules: [{
            type: 'duplicateValues',
            priority: 1,
            font: { color: { argb: 'FF9C0006' } },
            fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFC7CE' }, fgColor: { argb: 'FFFFC7CE' } }
        }]
    });
    console.log('R3: Conditional formatting set');

    // ===== Requirement 4: Data validation on column J =====
    for (let r = 2; r <= 201; r++) {
        ws1.getCell(`J${r}`).dataValidation = {
            type: 'list',
            formulae: ['"确认,待确认"'],
            allowBlank: true,
            showErrorMessage: true,
            errorTitle: '输入错误',
            error: '输入内容不规范，请通过下拉列表选择'
        };
    }
    console.log('R4: Data validation set');

    // ===== Requirement 5: Comment on G1 =====
    ws1.getCell('G1').note = '工龄计算，满一年才加1。例如：2018-11-22入职，到2020-10-01，工龄为1年。';
    console.log('R5: Comment added');

    // ===== Requirement 6: DATEDIF formula in G column =====
    for (let r = 2; r <= 201; r++) {
        ws1.getCell(`G${r}`).value = { formula: `DATEDIF(F${r},TODAY(),"y")` };
    }
    console.log('R6: DATEDIF formulas set');

    // ===== Requirement 7: Process performance data =====
    const rawText = fs.readFileSync(DATA_FILE, 'utf-8');
    const lines = rawText.trim().split('\n').filter(l => l.trim());

    // Write to Sheet3
    // Clear existing data
    for (let r = 1; r <= lines.length; r++) {
        ws3.getCell(`A${r}`).value = null;
        ws3.getCell(`B${r}`).value = null;
        ws3.getCell(`C${r}`).value = null;
        ws3.getCell(`D${r}`).value = null;
        ws3.getCell(`E${r}`).value = null;
    }

    // Headers
    ws3.getCell('A1').value = '工号';
    ws3.getCell('B1').value = '姓名';
    ws3.getCell('C1').value = '级别';
    ws3.getCell('D1').value = '本期绩效';
    ws3.getCell('E1').value = '本期绩效评价';

    // Style header
    const headerStyle = { font: { bold: true } };
    ['A1','B1','C1','D1','E1'].forEach(c => ws3.getCell(c).font = { bold: true });

    // Parse and lookup data
    const perfData = {};
    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 5) {
            const row = i + 1;
            ws3.getCell(`A${row}`).value = parts[0].trim();
            ws3.getCell(`B${row}`).value = parts[1].trim();
            
            // C column as text
            const cCell = ws3.getCell(`C${row}`);
            cCell.value = parts[2].trim();
            cCell.numFmt = '@';
            
            ws3.getCell(`D${row}`).value = parts[3].trim();
            ws3.getCell(`E${row}`).value = parts[4].trim();
            
            perfData[parts[0].trim()] = {
                level: parts[2].trim(),
                perfScore: parts[3].trim(),
                perfComment: parts[4].trim()
            };
        }
    }
    console.log('R7a: Sheet3 loaded with performance data');

    // VLOOKUP for performance and evaluation
    for (let r = 2; r <= 201; r++) {
        const empId = ws1.getCell(`A${r}`).value ? ws1.getCell(`A${r}`).value.toString() : '';
        if (empId && perfData[empId]) {
            ws1.getCell(`H${r}`).value = perfData[empId].perfScore;
            ws1.getCell(`I${r}`).value = perfData[empId].perfComment;
        }
    }
    console.log('R7b: Performance data matched to employees');

    // ===== Requirement 8: Freeze panes =====
    ws1.views = [{ state: 'frozen', xSplit: 0, ySplit: 1, topLeftCell: 'A2', activeCell: 'A2' }];
    console.log('R8: Freeze panes set');

    // ===== Requirement 9: Print settings =====
    ws1.pageSetup.orientation = 'portrait';
    ws1.pageSetup.fitToPage = true;
    ws1.pageSetup.fitToWidth = 1;
    ws1.pageSetup.fitToHeight = 0;
    ws1.pageSetup.paperSize = 9; // A4
    ws1.pageSetup.margins = {
        left: 0.75, right: 0.75, top: 1, bottom: 1, header: 0.5, footer: 0.5
    };
    console.log('R9: Print settings set');

    // ===== Requirement 10: Statistics formulas =====
    // Read the existing row 1 headers from sheet2
    const deptRows = [
        { row: 2, dept: '' },
        { row: 3, dept: '' },
        { row: 4, dept: '' }
    ];
    
    // Read existing A2:A4 values
    for (let r = 2; r <= 4; r++) {
        const val = ws2.getCell(`A${r}`).value;
        deptRows[r-2].dept = val ? val.toString() : '';
        console.log(`  Sheet2 A${r}: ${val}`);
    }

    // Build COUNTIFS formulas for each department × education level
    const eduCols = ['B', 'C', 'D', 'E', 'F', 'G']; // 博士后, 博士, 硕士, 本科, 专科, 其他
    const eduHeaders = {};
    for (let i = 0; i < eduCols.length; i++) {
        const val = ws2.getCell(`${eduCols[i]}1`).value;
        eduHeaders[eduCols[i]] = val ? val.toString() : `Col${i}`;
    }
    console.log('Education headers:', JSON.stringify(eduHeaders));

    // Clear old formulas
    for (let r = 2; r <= 4; r++) {
        for (const col of eduCols) {
            ws2.getCell(`${col}${r}`).value = null;
        }
        // Clear H column too
        ws2.getCell(`H${r}`).value = null;
    }

    // Set COUNTIFS formulas
    for (let di = 0; di < deptRows.length; di++) {
        const row = deptRows[di].row;
        const dept = deptRows[di].dept;
        
        for (const col of eduCols) {
            ws2.getCell(`${col}${row}`).value = {
                formula: `COUNTIFS('员工绩效汇总'!E:E,A${row},'员工绩效汇总'!D:D,${col}$1)`
            };
        }
        // H column = SUM
        ws2.getCell(`H${row}`).value = { formula: `SUM(B${row}:G${row})` };
    }
    
    // Also set H1 header if needed
    ws2.getCell('H1').value = '合计';
    ws2.getCell('H1').font = { bold: true };
    
    console.log('R10: Statistics formulas set');

    // ===== Requirement 11: Pie chart =====
    // ExcelJS doesn't support chart creation directly.
    // We'll add a helper data table on Sheet3 for chart source
    const chartDataSheet = workbook.addWorksheet('图表数据', { properties: { sheetState: 'veryHidden' } });
    chartDataSheet.getCell('A1').value = '部门';
    chartDataSheet.getCell('B1').value = '总人数';
    for (let i = 0; i < deptRows.length; i++) {
        chartDataSheet.getCell(`A${i+2}`).value = deptRows[i].dept;
        chartDataSheet.getCell(`B${i+2}`).value = {
            formula: `统计!H${deptRows[i].row}`
        };
    }
    // Add a note on 统计 sheet about chart
    ws2.getCell('A6').value = '提示：请在Excel中选中图表数据(图表数据!A1:B4)，插入饼图，显示百分比数据标签';
    console.log('R11: Chart helper data prepared - please insert pie chart manually');

    // ===== Requirement 12: AutoFilter =====
    ws1.autoFilter = {
        from: { row: 1, col: 1 },
        to: { row: 201, col: 10 }
    };
    
    // Also add filter hint - filtering by 陈/张 requires user action
    ws1.getCell('B1').note = '提示：请使用自动筛选，在"姓名"列筛选"陈*"和"张*"';
    console.log('R12: AutoFilter set');

    // Save
    await workbook.xlsx.writeFile(OUT_FILE);
    console.log(`\n✅ Excel saved to: ${OUT_FILE}`);

    // Also copy to desktop exam folder
    // Find the desktop folder properly
    const desktopPath = path.join(require('os').homedir(), 'Desktop');
    const desktopDirs = fs.readdirSync(desktopPath);
    const examFolder = desktopDirs.find(d => d.includes('2025') && d.includes('期末'));
    if (examFolder) {
        const dest = path.join(desktopPath, examFolder, '学号+姓名+ET.xlsx');
        fs.copyFileSync(OUT_FILE, dest);
        console.log(`✅ Also copied to desktop folder: ${dest}`);
    }
}

main().catch(err => {
    console.error('ERROR:', err.message);
    console.error(err.stack);
});
