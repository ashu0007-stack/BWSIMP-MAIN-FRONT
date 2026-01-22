// report/spurReportGenerator.tsx
import { useMemo } from 'react';
import ExcelJS from 'exceljs';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import autoTable from 'jspdf-autotable';

// Apply plugin globally
// (jsPDF as any).autoTable = autoTable;


interface SpurData {
  id: number | null;
  spur_id: number;
  spur_name: string;
  location_km: number;
  progress_date: string | null;
  status: string | null;
  spur_length?: number;
  completed_km?: number;
  completion_percentage?: number;
}

interface CumulativeSpurData {
  spur_id: number;
  spur_name: string;
  location_km: number;
  spur_length: number;
  total_completed_km: number;
  latest_date: string | null;
  completionPercentage: number;
  entries: number;
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
  spurs: SpurData[];
  cumulativeSpurData: CumulativeSpurData[];
  spursWithProgress: SpurData[];
  targetKm: number;
  workStartRange: number;
  workEndRange: number;
  spurStats: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    totalSpurLength: number;
    completedSpurLength: number;
    completionByLength: number;
  } | null;
}

export const useSpurReportGenerator = ({
  selectedPackage = '',
  selectedWork,
  spurs = [],
  cumulativeSpurData = [],
  spursWithProgress = [],
  targetKm = 0,
  workStartRange = 0,
  workEndRange = 0,
  spurStats = null
}: SpurReportGeneratorProps) => {

  
  
 const downloadSpurPDFReport = async () => {
    if (!selectedPackage || spurs.length === 0) {
      alert("No spur data available for this package.");
      return;
    }

    try {
      // Dynamically import jsPDF and autoTable to avoid SSR issues
      const { default: jsPDF } = await import('jspdf');
      const autoTable = await import('jspdf-autotable');

      const doc = new jsPDF("p", "mm", "a4");
      const leftMargin = 10;
      const pageWidth = 210;
      const pageHeight = 297;
      const tableWidth = 190;
      let yPos = 10;

      // Header
      doc.setFillColor(22, 101, 52); // Green color
      doc.rect(0, 0, pageWidth, 20, "F");
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("SPUR WORK PROGRESS REPORT", pageWidth / 2, 15, { align: "center" });

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
      doc.text(`Monthly Progress: ${currentMonth}/${currentYear}`, pageWidth - leftMargin, yPos, { align: "right" });
      yPos += 10;

      // Work Information
      doc.setFillColor(240, 255, 240); // Light green
      doc.rect(leftMargin, yPos, tableWidth, 40, "F");

      if (selectedWork) {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");

        const workNameText = `Work Name: ${selectedWork.work_name}`;
        const maxWidth = 170;
        const lineHeight = 5;
        const workNameLines = doc.splitTextToSize(workNameText, maxWidth);
        doc.text(workNameLines, leftMargin + 10, yPos + 8);
        yPos += (workNameLines.length - 1) * lineHeight;
        
        doc.text(`Contractor: ${selectedWork.contractor_name}`, leftMargin + 10, yPos + 14);
        doc.text(`Division: ${selectedWork.division_name || 'N/A'}`, leftMargin + 10, yPos + 20);
        doc.text(`Work Range: ${workStartRange} Km to ${workEndRange} Km`, leftMargin + 10, yPos + 26);
        doc.text(`Target Length: ${targetKm.toFixed(2)} Km`, leftMargin + 10, yPos + 32);
      }

      yPos += 50;

      // Cumulative Progress Summary Table
      doc.setFontSize(13);
      doc.setTextColor(22, 101, 52);
      doc.setFont("helvetica", "bold");
      doc.text("CUMULATIVE PROGRESS SUMMARY (PER SPUR)", leftMargin, yPos);
      yPos += 8;

      // Prepare table data
      const cumulativeTableData = cumulativeSpurData.map((spur, index) => [
        (index + 1).toString(),
        spur.spur_name,
        spur.location_km.toFixed(2),
        spur.spur_length.toLocaleString(),
        spur.total_completed_km.toLocaleString(),
        spur.latest_date ? new Date(spur.latest_date).toLocaleDateString() : '-',
        `${((spur.total_completed_km / spur.spur_length) * 100).toFixed(1)}%`
      ]);

      // Add table using autoTable as a function (CORRECT WAY)
      autoTable.default(doc, {
        startY: yPos,
        head: [['S.No.', 'Spur Name', 'Location (Km)', 'Total Length (m)', 'Cumulative Completed (m)', 'Last Date', 'Cumulative %']],
        body: cumulativeTableData,
        margin: { left: leftMargin, right: leftMargin },
        headStyles: {
          fillColor: [22, 101, 52],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 255, 240]
        },
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 35 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 30 },
          5: { cellWidth: 25 },
          6: { cellWidth: 25 }
        }
      });

      // Get the final Y position
      const finalY = (doc as any).lastAutoTable?.finalY || yPos + 100;
      yPos = finalY + 10;

      // Spurs with Progress Table
      if (spursWithProgress.length > 0) {
        doc.setFontSize(13);
        doc.setTextColor(22, 101, 52);
        doc.setFont("helvetica", "bold");
        doc.text("SPURS WITH PROGRESS DETAILS", leftMargin, yPos);
        yPos += 8;

        // Prepare table data
        const progressTableData = spursWithProgress.map((spur, index) => [
          (index + 1).toString(),
          spur.spur_name,
          spur.location_km.toFixed(2),
          (spur.spur_length || 0).toLocaleString(),
          (spur.completed_km || 0).toLocaleString(),
          spur.progress_date ? new Date(spur.progress_date).toLocaleDateString() : '-'
        ]);

        // Add table using autoTable as a function
        autoTable.default(doc, {
          startY: yPos,
          head: [['S.No.', 'Spur Name', 'Location (Km)', 'Spur Length (m)', 'Completed (m)', 'Progress Date']],
          body: progressTableData,
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
            1: { cellWidth: 40 },
            2: { cellWidth: 25 },
            3: { cellWidth: 25 },
            4: { cellWidth: 25 },
            5: { cellWidth: 30 }
          }
        });

        yPos = (doc as any).lastAutoTable?.finalY || yPos + 100;
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "italic");
      doc.text("Bihar Water Security & Irrigation Modernization Project - Spur Progress Report", 
        pageWidth / 2, pageHeight - 10, { align: "center" });
      
      // Page number
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - leftMargin, pageHeight - 10, { align: "right" });
      }

      // Save PDF
      doc.save(`${selectedPackage}_Spur_Work_Progress_Report_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF report. Please try again.");
    }
  };

  const downloadSpurExcelReport = async () => {
    if (!selectedPackage || spurs.length === 0) {
      alert("No spur data available for this package.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Bihar Water Security & Irrigation Modernization Project';
    workbook.created = new Date();

    // ========== SHEET 1: SPUR PROGRESS SUMMARY ==========
    const summarySheet = workbook.addWorksheet('Spur Progress Summary');

    // Set column widths
    summarySheet.columns = [
      { width: 25 },   // A
      { width: 40 },   // B
      { width: 20 },   // C
      { width: 20 },   // D
      { width: 20 },   // E
      { width: 20 },   // F
      { width: 20 },   // G
    ];

    // Header
    const titleRow = summarySheet.addRow(['BIHAR WATER SECURITY & IRRIGATION MODERNIZATION PROJECT']);
    titleRow.height = 30;
    titleRow.font = {
      name: 'Arial',
      size: 16,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    titleRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '166534' } // Green
    };
    titleRow.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    summarySheet.mergeCells('A1:G1');

    // Subtitle
    const subtitleRow = summarySheet.addRow(['SPUR WORK PROGRESS REPORT']);
    subtitleRow.height = 25;
    subtitleRow.font = {
      name: 'Arial',
      size: 14,
      bold: true,
      color: { argb: '166534' }
    };
    subtitleRow.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    summarySheet.mergeCells('A2:G2');

    summarySheet.addRow([]);

    // Work Information
    const infoHeaderRow = summarySheet.addRow(['WORK INFORMATION']);
    infoHeaderRow.height = 25;
    infoHeaderRow.font = {
      name: 'Arial',
      size: 12,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    infoHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '166534' }
    };
    infoHeaderRow.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    summarySheet.mergeCells('A4:G4');

    // Report metadata
    const months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const currentMonth = months[new Date().getMonth()];
    const currentYear = new Date().getFullYear();

    // Work details
    const workDetails = [
      { label: 'Work Name:', value: selectedWork?.work_name || 'N/A' },
      { label: 'Package No:', value: selectedPackage },
      { label: 'Contractor:', value: selectedWork?.contractor_name || 'N/A' },
      { label: 'Division:', value: selectedWork?.division_name || 'N/A' },
      { label: 'Work Range:', value: `${workStartRange} Km to ${workEndRange} Km` },
      { label: 'Target Length:', value: `${targetKm.toFixed(2)} Km` },
      { label: 'Report Period:', value: `${currentMonth} ${currentYear}` },
    ];

    workDetails.forEach((detail, index) => {
      const rowNumber = 5 + index;
      const row = summarySheet.addRow([detail.label, detail.value]);
      row.height = 25;

      row.eachCell((cell, colNumber) => {
        if (colNumber === 1) {
          cell.font = {
            bold: true,
            color: { argb: '166534' },
            name: 'Arial',
            size: 10
          };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F0FDF4' }
          };
        } else {
          cell.font = {
            color: { argb: '000000' },
            name: 'Arial',
            size: 10
          };
        }
        cell.alignment = {
          vertical: 'middle',
          wrapText: true
        };
      });
    });

    summarySheet.addRow([]);
    summarySheet.addRow([]);

    // Progress Statistics
    const statsStartRow = 1 + workDetails.length + 2;
    const statsHeaderRow = summarySheet.getRow(statsStartRow);
    // statsHeaderRow.values = ['PROGRESS STATISTICS'];
    // statsHeaderRow.height = 25;
    // statsHeaderRow.font = {
    //   name: 'Arial',
    //   size: 12,
    //   bold: true,
    //   color: { argb: 'FFFFFF' }
    // };
    // statsHeaderRow.fill = {
    //   type: 'pattern',
    //   pattern: 'solid',
    //   fgColor: { argb: '166534' }
    // };
    // statsHeaderRow.alignment = {
    //   horizontal: 'center',
    //   vertical: 'middle',
    //   wrapText: true
    // };
    // summarySheet.mergeCells(`A${statsStartRow}:G${statsStartRow}`);

    // if (spurStats) {
    //   const statsData = [
    //     ['Total Spurs:', spurStats.total],
    //     ['Completed Spurs:', spurStats.completed],
    //     ['In Progress Spurs:', spurStats.inProgress],
    //     ['Not Started Spurs:', spurStats.notStarted],
    //     ['Total Spur Length:', `${spurStats.totalSpurLength.toLocaleString()} m`],
    //     ['Completed Length:', `${spurStats.completedSpurLength.toLocaleString()} m`],
    //     ['Completion by Length:', `${spurStats.completionByLength.toFixed(1)}%`]
    //   ];

    //   statsData.forEach(([label, value], index) => {
    //     const rowNumber = statsStartRow + 1 + index;
    //     const row = summarySheet.getRow(rowNumber);
    //     row.values = [label, value];
    //     row.height = 25;

    //     row.eachCell((cell, colNumber) => {
    //       if (colNumber === 1) {
    //         cell.font = { bold: true, color: { argb: '166534' } };
    //         cell.fill = {
    //           type: 'pattern',
    //           pattern: 'solid',
    //           fgColor: { argb: 'F0FDF4' }
    //         };
    //       } else {
    //         cell.alignment = { horizontal: 'left', vertical: 'middle' };
    //         if (index === 6) { // Completion Rate row
    //           const percent = spurStats.completionByLength;
    //           cell.font = {
    //             bold: true,
    //             color: { argb: percent >= 80 ? '00B050' : percent >= 50 ? 'FF9900' : 'FF0000' }
    //           };
    //         }
    //       }
    //     });
    //   });
    // }

    // summarySheet.addRow([]);
    // summarySheet.addRow([]);

    // Cumulative Summary Table
    const cumulStartRow = statsStartRow + (spurStats ? 2 : 2) + 2;
    const cumulHeaderRow = summarySheet.getRow(cumulStartRow);
    cumulHeaderRow.values = ['CUMULATIVE PROGRESS SUMMARY (PER SPUR)'];
    cumulHeaderRow.height = 25;
    cumulHeaderRow.font = {
      name: 'Arial',
      size: 12,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    cumulHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '166534' }
    };
    cumulHeaderRow.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    summarySheet.mergeCells(`A${cumulStartRow}:G${cumulStartRow}`);

    // Table headers
    const headersRow = summarySheet.getRow(cumulStartRow + 1);
    headersRow.values = ['Spur ID', 'Spur Name', 'Location (Km)', 'Length (m)', 
                         'Cumulative Completed (m)', 'Last Date', 'Cumulative %'];
    headersRow.height = 25;
    headersRow.eachCell((cell) => {
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFF' },
        name: 'Arial',
        size: 10
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '166534' }
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Cumulative data rows
    cumulativeSpurData.forEach((spur, index) => {
      const rowNumber = cumulStartRow + 2 + index;
      const row = summarySheet.getRow(rowNumber);
      
      const completionPercent = spur.spur_length > 0 ? 
        (spur.total_completed_km / spur.spur_length) * 100 : 0;
      
      row.values = [
        spur.spur_id,
        spur.spur_name,
        spur.location_km.toFixed(2),
        spur.spur_length.toLocaleString(),
        spur.total_completed_km.toLocaleString(),
        spur.latest_date ? new Date(spur.latest_date).toLocaleDateString() : '-',
        `${completionPercent.toFixed(1)}%`
      ];
      
      row.height = 25;

      // Style rows
      row.eachCell((cell, colNumber) => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber === 2 ? 'left' : 'center',
          wrapText: true
        };
        
        if (colNumber === 7) { // Completion %
          if (completionPercent >= 100) {
            cell.font = { bold: true, color: { argb: '00B050' } };
          } else if (completionPercent > 0) {
            cell.font = { bold: true, color: { argb: 'FF9900' } };
          } else {
            cell.font = { color: { argb: 'FF0000' } };
          }
        }
        
        // Alternating row colors
        if (index % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F9F9F9' }
          };
        } else {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F0FDF4' }
          };
        }
        
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // ========== SHEET 2: SPURS WITH PROGRESS ==========
    const progressSheet = workbook.addWorksheet('Spurs with Progress');

    progressSheet.columns = [
      { width: 10 },   // A: S.No.
      { width: 30 },   // B: Spur Name
      { width: 20 },   // C: Location (Km)
      { width: 20 },   // D: Spur Length (m)
      { width: 20 },   // E: Completed (m)
      { width: 20 },   // F: Progress Date
    ];

    // Header
    const progressTitleRow = progressSheet.addRow(['SPURS WITH PROGRESS DETAILS']);
    progressTitleRow.height = 30;
    progressTitleRow.font = {
      name: 'Arial',
      size: 16,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    progressTitleRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0066CC' } // Blue
    };
    progressTitleRow.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    progressSheet.mergeCells('A1:F1');

    progressSheet.addRow([]);

    // Table headers
    const progressHeaders = ['S.No.', 'Spur Name', 'Location (Km)', 'Spur Length (m)', 
                            'Completed (m)', 'Progress Date'];
    const progressHeadersRow = progressSheet.addRow(progressHeaders);
    progressHeadersRow.height = 25;
    progressHeadersRow.eachCell((cell) => {
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFF' },
        name: 'Arial',
        size: 10
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0066CC' }
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Progress data rows
    spursWithProgress.forEach((spur, index) => {
      const row = progressSheet.addRow([
        index + 1,
        spur.spur_name,
        spur.location_km.toFixed(2),
        (spur.spur_length || 0).toLocaleString(),
        (spur.completed_km || 0).toLocaleString(),
        spur.progress_date ? new Date(spur.progress_date).toLocaleDateString() : '-'
      ]);
      
      row.height = 25;

      // Style rows
      row.eachCell((cell, colNumber) => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber === 2 ? 'left' : 'center',
          wrapText: true
        };
        
        if (colNumber === 5) { // Completed
          const completed = spur.completed_km || 0;
          const total = spur.spur_length || 1;
          if (completed >= total) {
            cell.font = { bold: true, color: { argb: '00B050' } };
          } else if (completed > 0) {
            cell.font = { bold: true, color: { argb: 'FF9900' } };
          }
        }
        
        // Alternating row colors
        if (index % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F9F9F9' }
          };
        } else {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F0F8FF' }
          };
        }
        
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Save Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Spur_Work_Progress_${selectedPackage}_${new Date().toISOString().split('T')[0]}.xlsx`;
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