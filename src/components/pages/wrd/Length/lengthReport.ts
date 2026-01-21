import React, { useMemo } from 'react';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';

interface Work {
  id: number;
  package_number: string;
  work_name: string;
  target_km: number;
  contractor_name: string;
  agreement_no?: string;
  contract_awarded_amount?: number;
  start_date?: string;
  end_date?: string;
  division_name?: string;
  work_commencement_date?: string;
  work_stipulated_date?: string;
  actual_date_of_completion?: string;
}

interface ProgressEntry {
  id?: number;
  start_km: number;
  end_km: number;
  earthwork_done_km: number;
  lining_done_km: number;
  date: string | null;
}

interface ReportGeneratorProps {
  selectedPackage: string | null;
  selectedWork: Work | undefined;
  works: Work[];
  targetKm: number;
  totalEarthwork: number;
  totalLining: number;
  progressEntries: ProgressEntry[];
}

export const useReportGenerator = (props: ReportGeneratorProps) => {
  const { 
    selectedPackage, 
    selectedWork, 
    targetKm, 
    totalEarthwork, 
    totalLining 
  } = props;
  // Calculate overall progress based on Lining ONLY
  const overallPercentage = useMemo(() => 
    totalLining > 0 ? ((totalLining / targetKm) * 100) : 0, 
    [totalLining, targetKm]
  );

  const earthworkPercentage = useMemo(() => 
    totalEarthwork > 0 ? ((totalEarthwork / targetKm) * 100) : 0, 
    [totalEarthwork, targetKm]
  );

  const downloadLengthwisePDF = () => {
    if (!selectedPackage) {
      alert("Please select a package first.");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");

    // Margins and settings
    const leftMargin = 7;
    const pageWidth = 210;
    const pageHeight = 297;
    const tableWidth = 182;
    let yPos = 10;

    // Add Header with styling
    doc.setFillColor(0, 51, 102);
    doc.rect(0, 0, pageWidth, 20, "F");

    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("LENGTHWISE PROGRESS REPORT", pageWidth / 2, 15, { align: "center" });

    yPos = 25;

    // Project title
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
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
    
    doc.text(`Work Package No:-${selectedPackage}               Monthly Progress-${currentMonth}/${currentYear}`, leftMargin, yPos);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - leftMargin, yPos, { align: "right" });
    yPos += 10;

    // Project Information Table
    doc.setFillColor(240, 248, 255);
    doc.rect(leftMargin, yPos, tableWidth, 70, "F");

    if (selectedWork) {
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");

      const workNameText = `Name of Work:- ${selectedWork.work_name}`;
      const maxWidth = 170;
      const lineHeight = 5;
      const workNameLines = doc.splitTextToSize(workNameText, maxWidth);
      doc.text(workNameLines, leftMargin + 10, yPos + 8);
      yPos += (workNameLines.length - 1) * lineHeight;
      doc.text(`Package No:- ${selectedWork.package_number}`, leftMargin + 10, yPos + 14);
      doc.text(`Work Order:- ${selectedWork.agreement_no || 'N/A'}`, leftMargin + 10, yPos + 20);
      doc.text(`Contractor:- ${selectedWork.contractor_name}`, leftMargin + 10, yPos + 26);
      doc.text(`Contract Value (Cr.):- ${selectedWork.contract_awarded_amount}`, leftMargin + 10, yPos + 32);
      doc.text(`Division:- ${selectedWork.division_name}`, leftMargin + 10, yPos + 38);
      doc.text(`Start Date of Work:- ${selectedWork.work_commencement_date}`, leftMargin + 10, yPos + 44);
      doc.text(`Stipulated Date of completion:- ${selectedWork.work_stipulated_date}`, leftMargin + 10, yPos + 50);
      doc.text(`Actual Completion Date:- ${selectedWork.actual_date_of_completion}`, leftMargin + 10, yPos + 56);
    }

    yPos += 90;

    // Lengthwise Progress Table Header
    doc.setFontSize(13);
    doc.setTextColor(0, 51, 102);
    doc.setFont("helvetica", "bold");
    doc.text("LENGTHWISE PROGRESS DETAILS", leftMargin, yPos);
    yPos += 8;

    // Table Header
    const columnHeaders = [
      { text: "S.No.", x: leftMargin + 5, width: 15 },
      { text: "Item of Work", x: leftMargin + 25, width: 70 },
      { text: "Target (Km)", x: leftMargin + 60, width: 25 },
      { text: "Progress (Km)", x: leftMargin + 90, width: 25 },
      { text: "Balance (Km)", x: leftMargin + 120, width: 25 },
      { text: "% Completed", x: leftMargin + 150, width: 20 }
    ];

    // Header background
    doc.setFillColor(0, 51, 102);
    doc.rect(leftMargin, yPos, tableWidth, 8, "F");

    // Header text
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    columnHeaders.forEach(header => {
      doc.text(header.text, header.x, yPos + 6);
    });

    yPos += 8;

    // Table Data
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    // Earthwork Row
    doc.setFillColor(250, 250, 250);
    doc.rect(leftMargin, yPos, tableWidth, 8, "F");

    const earthworkBalance = (targetKm - totalEarthwork).toFixed(2);
    doc.text("1", leftMargin + 8, yPos + 6);
    doc.text("Earth Work", leftMargin + 27, yPos + 6);
    doc.text(targetKm.toFixed(2), leftMargin + 65, yPos + 6, { align: "right" });
    doc.text(totalEarthwork.toFixed(2), leftMargin + 100, yPos + 6, { align: "right" });
    doc.text(earthworkBalance, leftMargin + 135, yPos + 6, { align: "right" });
    doc.text(`${earthworkPercentage.toFixed(1)}%`, leftMargin + 160, yPos + 6, { align: "right" });

    // Progress bar for Earthwork
    const barWidth = 20;
    const earthworkFillWidth = (totalEarthwork / targetKm) * barWidth;

    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(230, 230, 230);
    doc.rect(leftMargin + 160, yPos + 3, barWidth, 3, "FD");

    if (earthworkPercentage > 0) {
      doc.setFillColor(76, 175, 80);
      doc.rect(leftMargin + 160, yPos + 3, earthworkFillWidth, 3, "F");
    }

    yPos += 8;

    // Lining Row
    doc.setFillColor(240, 248, 255);
    doc.rect(leftMargin, yPos, tableWidth, 8, "F");

    const liningBalance = (targetKm - totalLining).toFixed(2);
    doc.text("2", leftMargin + 8, yPos + 6);
    doc.text("Canal Lining work", leftMargin + 27, yPos + 6);
    doc.text(targetKm.toFixed(2), leftMargin + 65, yPos + 6, { align: "right" });
    doc.text(totalLining.toFixed(2), leftMargin + 100, yPos + 6, { align: "right" });
    doc.text(liningBalance, leftMargin + 135, yPos + 6, { align: "right" });
    doc.text(`${overallPercentage.toFixed(1)}%`, leftMargin + 160, yPos + 6, { align: "right" });

    // Progress bar for Lining
    const liningFillWidth = (totalLining / targetKm) * barWidth;

    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(230, 230, 230);
    doc.rect(leftMargin + 160, yPos + 3, barWidth, 3, "FD");

    if (overallPercentage > 0) {
      doc.setFillColor(76, 175, 80);
      doc.rect(leftMargin + 160, yPos + 3, liningFillWidth, 3, "F");
    }

    yPos += 23;

    // Overall Progress Section
    doc.setFillColor(240, 248, 255);
    doc.rect(leftMargin, yPos, tableWidth, 15, "F");

    doc.setFontSize(11);
    doc.setTextColor(0, 51, 102);
    doc.setFont("helvetica", "bold");
    doc.text("OVERALL PROGRESS STATUS", leftMargin + 5, yPos + 10);

    doc.setFontSize(12);
    doc.setTextColor(overallPercentage >= 80 ? "green" :
      overallPercentage >= 50 ? "blue" : "orange");
    doc.text(`${overallPercentage.toFixed(1)}% COMPLETE`, leftMargin + 130, yPos + 10);

    // Progress bar
    const overallBarWidth = 100;
    const overallFillWidth = (overallPercentage / 100) * overallBarWidth;

    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(230, 230, 230);
    doc.rect(leftMargin + 40, yPos + 22, overallBarWidth, 6, "FD");

    if (overallPercentage > 0) {
      doc.setFillColor(overallPercentage >= 80 ? "green" :
        overallPercentage >= 50 ? "blue" : "orange");
      doc.rect(leftMargin + 40, yPos + 22, overallFillWidth, 6, "F");
    }

    yPos += 35;

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text("Bihar Water Security & Irrigation Modernization Project - Official Report", 
      pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.text("Page 1 of 1", pageWidth - leftMargin, pageHeight - 10, { align: "right" });

    // Save PDF
    doc.save(`${selectedPackage}_Lengthwise_Progress_Report_${new Date().getTime()}.pdf`);
  };

  const downloadLengthwiseExcel = async () => {
    if (!selectedPackage) {
      alert("Please select a package first.");
      return;
    }

    // Clean work name - remove unnecessary text
    const cleanWorkName = selectedWork?.work_name
      ? selectedWork.work_name.replace(/BidckarglerNo[\d\.DVtGMG\-PAdget:\s\/]+/g, '').trim()
      : 'N/A';

    // Create new workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Bihar Water Security & Irrigation Modernization Project';
    workbook.created = new Date();

    // ========== SHEET 1: MAIN PROGRESS REPORT ==========
    const worksheet = workbook.addWorksheet('Progress Report');

    // Set column widths
    worksheet.columns = [
      { width: 30 },
      { width: 50 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 35 },
    ];

    // ========== HEADER SECTION ==========
    // Row 1: Main Title
    const titleRow = worksheet.addRow(['BIHAR WATER SECURITY & IRRIGATION MODERNIZATION PROJECT']);
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
      fgColor: { argb: '003366' }
    };
    titleRow.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    worksheet.mergeCells('A1:G1');

    // Row 2: Subtitle
    const subtitleRow = worksheet.addRow(['LENGTHWISE PROGRESS REPORT']);
    subtitleRow.height = 25;
    subtitleRow.font = {
      name: 'Arial',
      size: 14,
      bold: true,
      color: { argb: '003366' }
    };
    subtitleRow.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    worksheet.mergeCells('A2:G2');

    worksheet.addRow([]);

    // ========== PROJECT INFORMATION SECTION ==========
    // Section Header
    const infoHeaderRow = worksheet.addRow(['PROJECT INFORMATION']);
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
      fgColor: { argb: '4F81BD' }
    };
    infoHeaderRow.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    worksheet.mergeCells('A4:G4');

    // Report Metadata
    const months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const currentMonth = months[new Date().getMonth()];
    const currentYear = new Date().getFullYear();

    const reportIdMonthRow = worksheet.addRow([]);
    reportIdMonthRow.height = 30;

    // Report ID
    const reportIdCell = reportIdMonthRow.getCell(1);
    reportIdCell.value = `Report ID:-${selectedPackage}-${currentYear}`;
    reportIdCell.font = { bold: true };
    reportIdCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };

    const monthCell = reportIdMonthRow.getCell(7);
    monthCell.value = `Monthly Progress:- ${currentMonth} ${currentYear}`;
    monthCell.font = { bold: true };
    monthCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    monthCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F9E076' }
    };

    worksheet.mergeCells(`B${reportIdMonthRow.number}:F${reportIdMonthRow.number}`);

    // Generated date
    const formattedDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const formattedTime = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const generatedRow = worksheet.addRow([`Generated: ${formattedDate} ${formattedTime}`]);
    generatedRow.height = 20;
    generatedRow.getCell(1).font = {
      bold: true,
      color: { argb: 'FF0000' }
    };
    generatedRow.getCell(1).alignment = { wrapText: true, horizontal: 'left', vertical: 'middle' };
    worksheet.mergeCells(`A${generatedRow.number}:G${generatedRow.number}`);

    worksheet.addRow([]);

    // Project Details
    const projectDetailsStartRow = 8;
    const projectDetails = [
      { label: 'Name of Work:', value: cleanWorkName, height: 40 },
      { label: 'Package No:', value: selectedPackage, height: 25, bgColor: 'F9E076' },
      { label: 'Contractor:', value: selectedWork?.contractor_name || 'N/A', height: 25 },
      { label: 'Work Order:', value: selectedWork?.agreement_no || 'N/A', height: 25, bgColor: 'F9E076' },
      { label: 'Contract Value (Cr.):', value: selectedWork?.contract_awarded_amount || 'N/A', height: 25, bgColor: 'F9E076' },
      { label: 'Division:', value: selectedWork?.division_name || 'N/A', height: 25 },
      { label: 'Start Date of Work:', value: selectedWork?.work_commencement_date, height: 25 },
      { label: 'Stipulated Date of Work:', value: selectedWork?.work_stipulated_date, height: 25 },
      { label: 'Actual Completion Date:', value: selectedWork?.actual_date_of_completion, height: 25 },
    ];

    projectDetails.forEach((detail, index) => {
      const rowNumber = projectDetailsStartRow + index;
      const row = worksheet.addRow(Array(7).fill(''));
      row.height = detail.height;

      // Label cell
      const labelCell = row.getCell(1);
      labelCell.value = detail.label;
      labelCell.font = {
        bold: true,
        color: { argb: '003366' },
        name: 'Arial',
        size: 10
      };
      labelCell.alignment = { vertical: 'middle', wrapText: true };
      labelCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: detail.bgColor || 'E6F2FF' }
      };

      // Value cell
      const valueCell = row.getCell(2);
      valueCell.value = detail.value;
      valueCell.font = {
        color: { argb: '000000' },
        name: 'Arial',
        size: 10
      };
      valueCell.alignment = {
        vertical: 'middle',
        wrapText: true,
        horizontal: 'left'
      };

      if (detail.bgColor) {
        valueCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: detail.bgColor }
        };
      }

      // Merge B through G
      worksheet.mergeCells(`B${rowNumber}:G${rowNumber}`);

      // Borders
      for (let col = 1; col <= 7; col++) {
        const cell = row.getCell(col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    });

    const lastProjectDetailRow = projectDetailsStartRow + projectDetails.length - 1;
    worksheet.addRow([]);
    worksheet.addRow([]);

    // ========== LENGTHWISE PROGRESS TABLE ==========
    const progressTableStartRow = lastProjectDetailRow + 3;

    // Section Header
    const progressHeaderRow = worksheet.getRow(progressTableStartRow);
    progressHeaderRow.values = ['LENGTHWISE PROGRESS DETAILS'];
    progressHeaderRow.height = 25;
    progressHeaderRow.font = {
      name: 'Arial',
      size: 12,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    progressHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4F81BD' }
    };
    progressHeaderRow.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    worksheet.mergeCells(`A${progressTableStartRow}:G${progressTableStartRow}`);

    // Table Headers
    const headerRowNumber = progressTableStartRow + 1;
    const tableHeaders = ['S.No.', 'Item of Work', 'Target (Km)', 'Progress (Km)', 'Balance (Km)', '% Completed'];
    const headerRow = worksheet.getRow(headerRowNumber);
    headerRow.values = tableHeaders;
    headerRow.height = 25;

    // Style header row
    headerRow.eachCell((cell, colNumber) => {
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFF' },
        name: 'Arial',
        size: 10
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '366092' }
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

    // Earthwork Row
    const earthworkRowNumber = headerRowNumber + 1;
    const earthworkRow = worksheet.getRow(earthworkRowNumber);
    earthworkRow.values = [
      1,
      'Earth Work',
      targetKm.toFixed(2),
      totalEarthwork.toFixed(2),
      (targetKm - totalEarthwork).toFixed(2),
      `${earthworkPercentage.toFixed(2)}%`
    ];
    earthworkRow.height = 25;

    // Style Earthwork row
    earthworkRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2E0' }
      };
      cell.alignment = {
        vertical: 'middle',
        wrapText: true
      };

      if (colNumber === 2) {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true
        };
      }

      if (colNumber === 6) {
        const percentValue = parseFloat(earthworkPercentage.toFixed(2));
        cell.font = {
          bold: true,
          color: { argb: percentValue >= 80 ? '00B050' : percentValue >= 50 ? 'FF9900' : 'FF0000' }
        };
        cell.alignment = {
          horizontal: 'right',
          vertical: 'middle',
          wrapText: true
        };
      }

      if (colNumber >= 3 && colNumber <= 5) {
        cell.alignment = {
          horizontal: 'right',
          vertical: 'middle',
          wrapText: true
        };
      }
    });

    // Lining Row
    const liningRowNumber = earthworkRowNumber + 1;
    const liningRow = worksheet.getRow(liningRowNumber);
    liningRow.values = [
      2,
      'Canal Lining work',
      targetKm.toFixed(2),
      totalLining.toFixed(2),
      (targetKm - totalLining).toFixed(2),
      `${overallPercentage.toFixed(2)}%`
    ];
    liningRow.height = 25;

    // Style Lining row
    liningRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E0F2F1' }
      };
      cell.alignment = {
        vertical: 'middle',
        wrapText: true
      };

      if (colNumber === 2) {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true
        };
      }

      if (colNumber === 6) {
        const percentValue = parseFloat(overallPercentage.toFixed(2));
        cell.font = {
          bold: true,
          color: { argb: percentValue >= 80 ? '00B050' : percentValue >= 50 ? 'FF9900' : 'FF0000' }
        };
        cell.alignment = {
          horizontal: 'right',
          vertical: 'middle',
          wrapText: true
        };
      }

      if (colNumber >= 3 && colNumber <= 5) {
        cell.alignment = {
          horizontal: 'right',
          vertical: 'middle',
          wrapText: true
        };
      }
    });

    worksheet.addRow([]);
    worksheet.addRow([]);

    // ========== PROGRESS SUMMARY SECTION ==========
    const summaryStartRow = liningRowNumber + 3;

    // Section Header
    const summaryHeaderRow = worksheet.getRow(summaryStartRow);
    summaryHeaderRow.values = ['PROGRESS SUMMARY'];
    summaryHeaderRow.height = 25;
    summaryHeaderRow.font = {
      name: 'Arial',
      size: 12,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    summaryHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4F81BD' }
    };
    summaryHeaderRow.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    worksheet.mergeCells(`A${summaryStartRow}:G${summaryStartRow}`);

    // Earthwork Summary
    const earthworkTitleRowNumber = summaryStartRow + 1;
    const earthworkTitleRow = worksheet.getRow(earthworkTitleRowNumber);
    earthworkTitleRow.values = ['EARTHWORK PROGRESS'];
    earthworkTitleRow.height = 25;
    earthworkTitleRow.font = {
      name: 'Arial',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    earthworkTitleRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9900' }
    };
    earthworkTitleRow.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    worksheet.mergeCells(`A${earthworkTitleRowNumber}:G${earthworkTitleRowNumber}`);

    // Earthwork data rows
    const earthworkDataRow1 = worksheet.addRow([`Completed: ${totalEarthwork.toFixed(2)} Km`, `Target: ${targetKm.toFixed(2)} Km`]);
    earthworkDataRow1.height = 25;
    earthworkDataRow1.eachCell((cell) => {
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      };
    });

    const earthworkProgressRow = worksheet.addRow([`Progress: ${earthworkPercentage.toFixed(2)}%`]);
    earthworkProgressRow.height = 25;
    earthworkProgressRow.getCell(1).font = {
      bold: true,
      color: { argb: earthworkPercentage >= 80 ? '00B050' : earthworkPercentage >= 50 ? 'FF9900' : 'FF0000' }
    };
    earthworkProgressRow.getCell(1).alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    worksheet.mergeCells(`A${earthworkProgressRow.number}:G${earthworkProgressRow.number}`);

    worksheet.addRow([]);

    // Overall Progress Summary
    const overallTitleRow = worksheet.addRow(['OVERALL PROGRESS (LINING)']);
    overallTitleRow.height = 25;
    overallTitleRow.font = {
      name: 'Arial',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    overallTitleRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '00B050' }
    };
    overallTitleRow.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    worksheet.mergeCells(`A${overallTitleRow.number}:G${overallTitleRow.number}`);

    // Overall data rows
    const overallDataRow1 = worksheet.addRow([`Completed: ${totalLining.toFixed(2)} Km`, `Target: ${targetKm.toFixed(2)} Km`]);
    overallDataRow1.height = 25;
    overallDataRow1.eachCell((cell) => {
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      };
    });

    const overallProgressRow = worksheet.addRow([`Progress: ${overallPercentage.toFixed(2)}%`]);
    overallProgressRow.height = 25;
    overallProgressRow.getCell(1).font = {
      bold: true,
      color: { argb: overallPercentage >= 80 ? '00B050' : overallPercentage >= 50 ? 'FF9900' : 'FF0000' }
    };
    overallProgressRow.getCell(1).alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    worksheet.mergeCells(`A${overallProgressRow.number}:G${overallProgressRow.number}`);

    worksheet.addRow([]);
    worksheet.addRow([]);

    // ========== FOOTER ==========
    const footerRow1 = worksheet.addRow(['Generated By: BWSIMP System']);
    footerRow1.height = 25;
    footerRow1.getCell(1).font = {
      italic: true,
      color: { argb: '666666' },
      name: 'Arial',
      size: 10
    };
    footerRow1.getCell(1).alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    worksheet.mergeCells(`A${footerRow1.number}:G${footerRow1.number}`);

    // ========== SAVE EXCEL FILE ==========
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Progress_Report_${selectedPackage}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

 return { 
    downloadLengthwisePDF, 
    downloadLengthwiseExcel,
    overallPercentage,
    earthworkPercentage
  };
};


