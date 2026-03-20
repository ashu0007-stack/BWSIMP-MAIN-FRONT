// report/spurReportGenerator.tsx
import ExcelJS from 'exceljs';

interface SpurData {
  id: number;
  spur_id: number;
  spur_name: string;
  location_km: number;
  spur_length: number;
  is_new: string;
  status: string;
  progress_date: string | null;
  remarks: string | null;
  last_updated_by: string | null;
}

interface SpurHistory {
  id: number;
  spur_name: string;
  location_km: number;
  spur_length_km: number;
  progress_date: string;
  formatted_date: string;
  status: string;
  remarks: string;
  created_by: string;
}

interface Work {
  id: number;
  package_number: string;
  work_name: string;
  contractor_name: string;
  agreement_no?: string;
  contract_awarded_amount?: number;
  division_name?: string;
}

interface SpurReportGeneratorProps {
  selectedPackage: string;
  selectedWork: Work;
  spurs: SpurData[];           // All spurs with current status
  cumulativeSpurData?: any[];   // ✅ यह line add करो (optional)
  spursWithProgress?: any[];    // ✅ यह भी add करो अगर चाहिए
  history?: SpurHistory[];      // All progress history
  targetKm: number;
  workStartRange: number;
  workEndRange: number;
  spurStats?: any;               // ✅ यह भी add करो
}

export const useSpurReportGenerator = ({
  selectedPackage = '',
  selectedWork,
  spurs = [],
  history = [],
  targetKm = 0,
  workStartRange = 0,
  workEndRange = 0,
}: SpurReportGeneratorProps) => {

  // Calculate statistics
  const stats = {
    total: spurs.length,
    completed: spurs.filter(s => s.status === 'completed').length,
    inProgress: spurs.filter(s => s.status === 'in-progress').length,
    notStarted: spurs.filter(s => s.status === 'not-started').length,
    
    totalLength: spurs.reduce((sum, s) => sum + (s.spur_length || 0), 0),
    completedLength: spurs
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + (s.spur_length || 0), 0),
    inProgressLength: spurs
      .filter(s => s.status === 'in-progress')
      .reduce((sum, s) => sum + (s.spur_length || 0), 0),
    notStartedLength: spurs
      .filter(s => s.status === 'not-started')
      .reduce((sum, s) => sum + (s.spur_length || 0), 0),
    
    completionByLength: spurs.reduce((sum, s) => sum + (s.spur_length || 0), 0) > 0 
      ? (spurs.filter(s => s.status === 'completed').reduce((sum, s) => sum + (s.spur_length || 0), 0) / 
         spurs.reduce((sum, s) => sum + (s.spur_length || 0), 0)) * 100 
      : 0
  };

  // Helper function for status badge in Excel
  const getStatusText = (status: string): string => {
    switch(status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      default: return 'Not Started';
    }
  };

  // PDF Report
  const downloadSpurPDFReport = async () => {
    if (!selectedPackage || spurs.length === 0) {
      alert("No spur data available for this package.");
      return;
    }

    try {
      const { default: jsPDF } = await import('jspdf');
      const autoTable = await import('jspdf-autotable');

      const doc = new jsPDF("p", "mm", "a4");
      const leftMargin = 10;
      const pageWidth = 210;
      const pageHeight = 297;
      const tableWidth = 190;
      let yPos = 10;

      // Header
      doc.setFillColor(22, 101, 52);
      doc.rect(0, 0, pageWidth, 20, "F");
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("SPUR WORK STATUS REPORT", pageWidth / 2, 15, { align: "center" });

      yPos = 25;

      // Project title
      doc.setFontSize(14);
      doc.setTextColor(22, 101, 52);
      doc.setFont("helvetica", "bold");
      doc.text("Bihar Water Security & Irrigation Modernization Project", pageWidth / 2, yPos, { align: "center" });
      yPos += 8;

      // Report metadata
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      const currentMonth = months[new Date().getMonth()];
      const currentYear = new Date().getFullYear();
      
      doc.text(`Package: ${selectedPackage}`, leftMargin, yPos);
      doc.text(`Report Date: ${currentMonth}/${currentYear}`, pageWidth - leftMargin, yPos, { align: "right" });
      yPos += 10;

      // Work Information
      doc.setFillColor(240, 255, 240);
      doc.rect(leftMargin, yPos, tableWidth, 45, "F");

      if (selectedWork) {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");

        const workNameText = `Work Name: ${selectedWork.work_name}`;
        const maxWidth = 170;
        const workNameLines = doc.splitTextToSize(workNameText, maxWidth);
        doc.text(workNameLines, leftMargin + 10, yPos + 8);
        
        doc.text(`Contractor: ${selectedWork.contractor_name}`, leftMargin + 10, yPos + 16);
        doc.text(`Division: ${selectedWork.division_name || 'N/A'}`, leftMargin + 10, yPos + 24);
        doc.text(`Work Range: ${workStartRange} Km to ${workEndRange} Km`, leftMargin + 10, yPos + 32);
        doc.text(`Total Spurs: ${stats.total} | Total Length: ${stats.totalLength.toFixed(2)} m`, leftMargin + 10, yPos + 40);
      }

      yPos += 55;

      // Statistics Summary
      doc.setFontSize(12);
      doc.setTextColor(22, 101, 52);
      doc.setFont("helvetica", "bold");
      doc.text("PROGRESS SUMMARY", leftMargin, yPos);
      yPos += 8;

      const summaryData = [
        ['Status', 'Count', 'Length (m)'],
        ['Completed', stats.completed.toString(), stats.completedLength.toFixed(2)],
        ['In Progress', stats.inProgress.toString(), stats.inProgressLength.toFixed(2)],
        ['Not Started', stats.notStarted.toString(), stats.notStartedLength.toFixed(2)],
        ['Total', stats.total.toString(), stats.totalLength.toFixed(2)]
      ];

      autoTable.default(doc, {
        startY: yPos,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        margin: { left: leftMargin, right: leftMargin },
        headStyles: {
          fillColor: [22, 101, 52],
          textColor: 255,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 50, halign: 'right' }
        }
      });

      yPos = (doc as any).lastAutoTable?.finalY + 15;

      // Spurs Details Table
      doc.setFontSize(12);
      doc.setTextColor(22, 101, 52);
      doc.setFont("helvetica", "bold");
      doc.text("SPUR DETAILS", leftMargin, yPos);
      yPos += 8;

      const spurTableData = spurs.map((spur, index) => [
        (index + 1).toString(),
        spur.spur_name,
        spur.location_km.toFixed(2),
        spur.spur_length.toFixed(2),
        spur.is_new === 'new' ? 'New' : 'Old',
        getStatusText(spur.status),
        spur.progress_date ? new Date(spur.progress_date).toLocaleDateString() : '-'
      ]);

      autoTable.default(doc, {
        startY: yPos,
        head: [['S.No.', 'Spur Name', 'Location (Km)', 'Length (m)', 'Type', 'Status', 'Last Updated']],
        body: spurTableData,
        margin: { left: leftMargin, right: leftMargin },
        headStyles: {
          fillColor: [0, 102, 204],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 248, 255]
        },
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 35 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20, halign: 'right' },
          4: { cellWidth: 15 },
          5: { cellWidth: 25 },
          6: { cellWidth: 25 }
        }
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "italic");
      doc.text("Bihar Water Security & Irrigation Modernization Project - Spur Status Report", 
        pageWidth / 2, pageHeight - 10, { align: "center" });
      
      // Page number
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - leftMargin, pageHeight - 10, { align: "right" });
      }

      doc.save(`${selectedPackage}_Spur_Status_Report_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF report. Please try again.");
    }
  };

  // Excel Report
  const downloadSpurExcelReport = async () => {
    if (!selectedPackage || spurs.length === 0) {
      alert("No spur data available for this package.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Bihar Water Security & Irrigation Modernization Project';
    workbook.created = new Date();

    // ========== SHEET 1: SUMMARY ==========
    const summarySheet = workbook.addWorksheet('Summary');

    summarySheet.columns = [
      { width: 25 }, { width: 40 }, { width: 20 }, { width: 20 }, { width: 20 }
    ];

    // Title
    const titleRow = summarySheet.addRow(['BIHAR WATER SECURITY & IRRIGATION MODERNIZATION PROJECT']);
    titleRow.height = 30;
    titleRow.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFF' } };
    titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '166534' } };
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.mergeCells('A1:E1');

    const subtitleRow = summarySheet.addRow(['SPUR WORK STATUS REPORT']);
    subtitleRow.height = 25;
    subtitleRow.font = { name: 'Arial', size: 14, bold: true, color: { argb: '166534' } };
    subtitleRow.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.mergeCells('A2:E2');

    summarySheet.addRow([]);

    // Work Information
    const months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const currentMonth = months[new Date().getMonth()];
    const currentYear = new Date().getFullYear();

    const workDetails = [
      ['Work Name:', selectedWork?.work_name || 'N/A'],
      ['Package No:', selectedPackage],
      ['Contractor:', selectedWork?.contractor_name || 'N/A'],
      ['Division:', selectedWork?.division_name || 'N/A'],
      ['Work Range:', `${workStartRange} Km to ${workEndRange} Km`],
      ['Total Spurs:', stats.total.toString()],
      ['Total Spur Length:', `${stats.totalLength.toFixed(2)} m`],
      ['Report Period:', `${currentMonth} ${currentYear}`],
    ];

    workDetails.forEach(([label, value]) => {
      const row = summarySheet.addRow([label, value]);
      row.height = 20;
      row.getCell(1).font = { bold: true, color: { argb: '166534' } };
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0FDF4' } };
    });

    summarySheet.addRow([]);
    summarySheet.addRow([]);

    // Statistics
    const statsHeader = summarySheet.addRow(['PROGRESS STATISTICS']);
    statsHeader.height = 25;
    statsHeader.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFF' } };
    statsHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '166534' } };
    statsHeader.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.mergeCells('A' + statsHeader.number + ':E' + statsHeader.number);

    const statsData = [
      ['Status', 'Count', 'Length (m)', 'Percentage'],
      ['Completed', stats.completed, stats.completedLength.toFixed(2), 
       stats.totalLength > 0 ? ((stats.completedLength / stats.totalLength) * 100).toFixed(1) + '%' : '0%'],
      ['In Progress', stats.inProgress, stats.inProgressLength.toFixed(2),
       stats.totalLength > 0 ? ((stats.inProgressLength / stats.totalLength) * 100).toFixed(1) + '%' : '0%'],
      ['Not Started', stats.notStarted, stats.notStartedLength.toFixed(2),
       stats.totalLength > 0 ? ((stats.notStartedLength / stats.totalLength) * 100).toFixed(1) + '%' : '0%'],
      ['TOTAL', stats.total, stats.totalLength.toFixed(2), '100%']
    ];

    statsData.forEach((row, idx) => {
      const dataRow = summarySheet.addRow(row);
      dataRow.height = 20;
      if (idx === 0) {
        dataRow.eachCell(cell => {
          cell.font = { bold: true, color: { argb: 'FFFFFF' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '166534' } };
          cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        });
      } else {
        dataRow.eachCell((cell, colNum) => {
          cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
          if (colNum === 4) {
            cell.numFmt = '0.00%';
          }
        });
      }
    });

    // ========== SHEET 2: SPUR DETAILS ==========
    const spurSheet = workbook.addWorksheet('Spur Details');

    spurSheet.columns = [
      { width: 10 }, { width: 30 }, { width: 15 }, { width: 15 }, 
      { width: 10 }, { width: 15 }, { width: 15 }, { width: 30 }
    ];

    const spurHeader = spurSheet.addRow(['S.No.', 'Spur Name', 'Location (Km)', 'Length (m)', 
                                         'Type', 'Status', 'Last Updated', 'Remarks']);
    spurHeader.height = 25;
    spurHeader.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0066CC' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    });

    spurs.forEach((spur, index) => {
      const row = spurSheet.addRow([
        index + 1,
        spur.spur_name,
        spur.location_km.toFixed(2),
        spur.spur_length.toFixed(2),
        spur.is_new === 'new' ? 'New' : 'Old',
        getStatusText(spur.status),
        spur.progress_date ? new Date(spur.progress_date).toLocaleDateString() : '-',
        spur.remarks || '-'
      ]);
      
      row.height = 20;
      row.eachCell((cell, colNum) => {
        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        cell.alignment = { vertical: 'middle', horizontal: colNum === 2 ? 'left' : 'center' };
        
        // Color based on status
        if (colNum === 6) { // Status column
          if (spur.status === 'completed') {
            cell.font = { color: { argb: '00B050' }, bold: true };
          } else if (spur.status === 'in-progress') {
            cell.font = { color: { argb: 'FF9900' }, bold: true };
          }
        }
      });

      // Alternating row colors
      if (index % 2 === 0) {
        row.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F9F9F9' } };
        });
      }
    });

    // Add summary at bottom
    spurSheet.addRow([]);
    const summaryRow = spurSheet.addRow(['', '', '', '', '', '', '', '']);
    summaryRow.getCell(1).value = 'SUMMARY:';
    summaryRow.getCell(1).font = { bold: true };
    
    const totalCompleted = spurs.filter(s => s.status === 'completed').length;
    const totalInProgress = spurs.filter(s => s.status === 'in-progress').length;
    const totalNotStarted = spurs.filter(s => s.status === 'not-started').length;
    
    spurSheet.addRow(['Completed Spurs:', totalCompleted, '', '', 'In Progress:', totalInProgress, 'Not Started:', totalNotStarted]);

    // ========== SHEET 3: HISTORY (Optional) ==========
    if (history.length > 0) {
      const historySheet = workbook.addWorksheet('Progress History');

      historySheet.columns = [
        { width: 15 }, { width: 25 }, { width: 15 }, { width: 15 }, 
        { width: 15 }, { width: 30 }, { width: 20 }
      ];

      const historyHeader = historySheet.addRow(['Date', 'Spur Name', 'Location (Km)', 'Length (m)', 
                                                  'Status', 'Remarks', 'Updated By']);
      historyHeader.height = 25;
      historyHeader.eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '800080' } }; // Purple
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      history.forEach((entry) => {
        const row = historySheet.addRow([
          entry.formatted_date,
          entry.spur_name,
          entry.location_km?.toFixed(2) || '-',
          entry.spur_length_km?.toFixed(2) || '-',
          getStatusText(entry.status),
          entry.remarks || '-',
          entry.created_by || 'System'
        ]);
        row.height = 18;
      });
    }

    // Save Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Spur_Status_Report_${selectedPackage}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    downloadSpurPDFReport,
    downloadSpurExcelReport
  };
};