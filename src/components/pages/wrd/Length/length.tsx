import { useState, useMemo, useEffect } from "react";
import { X } from 'lucide-react';
import ExcelJS from 'exceljs';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AddProgressForm from "./AddProgressForm";
import { useWorks, usePackageProgress, useAddProgressEntry } from "@/hooks/wrdHooks/useLength";
import jsPDF from "jspdf";

import { Eye } from "lucide-react";


interface ProgressEntry {
  id?: number;
  start_km: number;
  end_km: number;
  earthwork_done_km: number;
  lining_done_km: number;
  date: string | null;
}

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
}

interface LengthwiseItem {
  item: string;
  progress: number;
  target: number;
}


const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return "-";
  }
};

interface LengthDetailPageProps {
  workId?: number;
  packageNumber?: string;
  workName?: string;
  contractorName?: string;
  onClose?: () => void;
}


export default function LengthProgressPage({
  workId, 
  packageNumber, 
  workName, 
  contractorName,
  onClose}:LengthDetailPageProps ) {

  

  const [selectedPackage, setSelectedPackage] =useState<string | null>(packageNumber || null);
  const [showForm, setShowForm] = useState(false);
  const [selectedRange, setSelectedRange] = useState<[number, number]>([0, 0]);
  const [editingEntry, setEditingEntry] = useState<ProgressEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const { data: works = [] } = useWorks();
  const { data: packageData } = usePackageProgress(selectedPackage);
  const addProgressMutation = useAddProgressEntry();

   useEffect(() => {
    // Get user details from sessionStorage
    const storedProfile = sessionStorage.getItem("userdetail");
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      setUser(profile);
      setUserRole(profile?.role_name || '');
    }
  }, []);

 const canAddProgress = () => {
    if (!user) return false;
    
    // Role IDs that can add progress (operator, admin, etc.)
    // आपके role structure के according adjust करें
    const allowedRoles = ['Operator'];
    
    return allowedRoles.includes(user.role_name) || 
           [5].includes(user.role_id); // Example: role_id 5,6 for operators, 1,2 for admins
  };

 const progressEntries: ProgressEntry[] = useMemo(() => {
  return packageData?.progress ?? [];
}, [packageData?.progress]);
  const targetKm: number = packageData?.target_km || 0;
  
  const lengthwiseData: LengthwiseItem[] = useMemo(() => {
    const totalEarthworkDone = progressEntries.reduce((sum, entry) => 
      sum + (typeof entry.earthwork_done_km === 'number' ? entry.earthwork_done_km : 0), 0
    );
    
    const totalLiningDone = progressEntries.reduce((sum, entry) => 
      sum + (typeof entry.lining_done_km === 'number' ? entry.lining_done_km : 0), 0
    );
    
    return [
      { 
        item: "Earth Work", 
        progress: parseFloat(totalEarthworkDone.toFixed(2)), 
        target: targetKm 
      },
      { 
        item: "Canal Lining work", 
        progress: parseFloat(totalLiningDone.toFixed(2)), 
        target: targetKm 
      }
    ];
  }, [progressEntries, targetKm]);

  const filteredWorks = works.filter(
    (w:any) =>
      w.package_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.work_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.contractor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEarthwork = useMemo(
    () => progressEntries.reduce((sum, e) => sum + (typeof e.earthwork_done_km === 'number' ? e.earthwork_done_km : 0), 0),
    [progressEntries]
  );
  
  const totalLining = useMemo(
    () => progressEntries.reduce((sum, e) => sum + (typeof e.lining_done_km === 'number' ? e.lining_done_km : 0), 0),
    [progressEntries]
  );
  
  const overallProgress = useMemo(() => {
    if (!targetKm || targetKm <= 0) return 0;
    return Math.min((totalLining / targetKm) * 100, 100);
  }, [totalLining, targetKm]);

  const kilometerData = useMemo(() => {
    const data = [];
    const validTargetKm = typeof targetKm === 'number' ? targetKm : 0;

    for (let km = 0; km <= validTargetKm; km += 0.5) {
      let earthworkDone = 0;
      let liningDone = 0;

      const entriesInThisKm = progressEntries.filter((e) => {
        const start = typeof e.start_km === 'number' ? e.start_km : parseFloat(e.start_km);
        const end = typeof e.end_km === 'number' ? e.end_km : parseFloat(e.end_km);
        return km >= start && km < end;
      });

      entriesInThisKm.forEach(entry => {
        earthworkDone += typeof entry.earthwork_done_km === 'number' ? entry.earthwork_done_km : 0;
        liningDone += typeof entry.lining_done_km === 'number' ? entry.lining_done_km : 0;
      });

      data.push({
        kilometer: parseFloat(km.toFixed(2)),
        earthworkDone: parseFloat(earthworkDone.toFixed(2)),
        liningDone: parseFloat(liningDone.toFixed(2)),
      });
    }

    return data;
  }, [progressEntries, targetKm]);

  const gaugeData = [
    { name: "Completed", value: overallProgress },
    { name: "Remaining", value: 100 - overallProgress },
  ];
  const COLORS = ["#3B82F6", "#E5E7EB"];

  const handleAddProgress = (formData: any) => {
    if (!selectedPackage) return;

    const totalRange = formData.endKm - formData.startKm;
    const totalEarthworkAfter = totalEarthwork + formData.earthworkDoneKm;
    const totalLiningAfter = totalLining + formData.liningDoneKm;

    if (totalRange > targetKm) {
      alert(`Selected range (${totalRange} KM) cannot exceed target KM (${targetKm} KM)`);
      return;
    }

    if (formData.endKm > targetKm) {
      alert(`End KM (${formData.endKm}) cannot exceed target KM (${targetKm})`);
      return;
    }

    addProgressMutation.mutate({ packageNumber: selectedPackage, ...formData });
    setShowForm(false);
  };

const downloadLengthwisePDF = () => {
  if (!selectedPackage) {
    alert("Please select a package first.");
    return;
  }

  const selectedWork = works.find((w: Work) => w.package_number === selectedPackage);
  const doc = new jsPDF("p", "mm", "a4");
  
  // Margins and settings
  const leftMargin = 7;
  const pageWidth = 210;
  const pageHeight = 297;
  const tableWidth = 182;
  let yPos = 10;

  // Calculate overall progress based on Lining ONLY
  const overallPercentage = totalLining > 0 ? ((totalLining / targetKm) * 100) : 0;

  // Add Header with styling
  doc.setFillColor(0, 51, 102); // Dark blue background
  doc.rect(0, 0, pageWidth, 20, "F");
  
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("LENGTHWISE PROGRESS REPORT", pageWidth / 2, 15, { align: "center" });
  
  yPos = 25;

  // Project title
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102); // Dark blue
  doc.setFont("helvetica", "bold");
  doc.text("Bihar Water Security & Irrigation Modernization Project", pageWidth / 2, yPos, { align: "center" });
  yPos += 8;

  // Report metadata
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  // Get month name (full name)
const months = ["January", "February", "March", "April", "May", "June", 
                "July", "August", "September", "October", "November", "December"];
const currentMonth = months[new Date().getMonth()];
const currentYear = new Date().getFullYear();
  doc.text(`Work Package No:-${selectedPackage}               Monthly Progress-${currentMonth}/${new Date().getFullYear()}`, leftMargin, yPos);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - leftMargin, yPos, { align: "right" });
  yPos += 10;

  // Project Information Table
  doc.setFillColor(240, 248, 255); // Light blue background
  doc.rect(leftMargin, yPos, tableWidth, 70, "F");
  
  // doc.setFontSize(12);
  // doc.setTextColor(0, 51, 102);
  // doc.setFont("helvetica", "bold");
  // doc.text("PROJECT INFORMATION", leftMargin + 5, yPos + 8);
  
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

  // Table Data - Only Lining for Overall Progress
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  // Earthwork Row
  doc.setFillColor(250, 250, 250);
  doc.rect(leftMargin, yPos, tableWidth, 8, "F");
  
  const earthworkPercentage = totalEarthwork > 0 ? ((totalEarthwork / targetKm) * 100).toFixed(1) : "0.0";
  const earthworkBalance = (targetKm - totalEarthwork).toFixed(2);
  
  doc.text("1", leftMargin + 8, yPos + 6);
  doc.text("Earth Work", leftMargin + 27, yPos + 6);
  doc.text(targetKm.toFixed(2), leftMargin + 65, yPos + 6, { align: "right" });
  doc.text(totalEarthwork.toFixed(2), leftMargin + 100, yPos + 6, { align: "right" });
  doc.text(earthworkBalance, leftMargin + 135, yPos + 6, { align: "right" });
  doc.text(`${earthworkPercentage}%`, leftMargin + 160, yPos + 6, { align: "right" });
  
  // Progress bar for Earthwork
  const barWidth = 20;
  const earthworkFillWidth = (totalEarthwork / targetKm) * barWidth;
  
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(230, 230, 230);
  doc.rect(leftMargin + 160, yPos + 3, barWidth, 3, "FD");
  
  if (parseFloat(earthworkPercentage) > 0) {
    doc.setFillColor(76, 175, 80); // Green for progress
    doc.rect(leftMargin + 160, yPos + 3, earthworkFillWidth, 3, "F");
  }
  
  yPos += 8;
  
  // Lining Row - THIS IS USED FOR OVERALL PROGRESS
  doc.setFillColor(240, 248, 255);
  doc.rect(leftMargin, yPos, tableWidth, 8, "F");
  
  const liningPercentage = totalLining > 0 ? ((totalLining / targetKm) * 100).toFixed(1) : "0.0";
  const liningBalance = (targetKm - totalLining).toFixed(2);
  
  doc.text("2", leftMargin + 8, yPos + 6);
  doc.text("Canal Lining work", leftMargin + 27, yPos + 6);
  doc.text(targetKm.toFixed(2), leftMargin + 65, yPos + 6, { align: "right" });
  doc.text(totalLining.toFixed(2), leftMargin + 100, yPos + 6, { align: "right" });
  doc.text(liningBalance, leftMargin + 135, yPos + 6, { align: "right" });
  doc.text(`${liningPercentage}%`, leftMargin + 160, yPos + 6, { align: "right" });
  
  // Progress bar for Lining (Overall Progress)
  const liningFillWidth = (totalLining / targetKm) * barWidth;
  
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(230, 230, 230);
  doc.rect(leftMargin + 160, yPos + 3, barWidth, 3, "FD");
  
  if (parseFloat(liningPercentage) > 0) {
    doc.setFillColor(76, 175, 80); // Green for progress
    doc.rect(leftMargin + 160, yPos + 3, liningFillWidth, 3, "F");
  }
  
  yPos += 8;

  // Summary Row - Overall Progress based on Lining
  // yPos += 5;
  // doc.setFillColor(0, 51, 102);
  // doc.rect(leftMargin, yPos, tableWidth, 8, "F");
  
  // doc.setFontSize(10);
  // doc.setTextColor(255, 255, 255);
  // doc.setFont("helvetica", "bold");
  // doc.text("TOTAL", leftMargin + 27, yPos + 6);
  // doc.text((targetKm * 2).toFixed(2), leftMargin + 105, yPos + 6, { align: "right" });
  // doc.text((totalEarthwork + totalLining).toFixed(2), leftMargin + 135, yPos + 6, { align: "right" });
  // doc.text(((targetKm * 2) - (totalEarthwork + totalLining)).toFixed(2), leftMargin + 165, yPos + 6, { align: "right" });
  
  // // OVERALL PROGRESS = Lining Progress
  // doc.text(`${overallPercentage.toFixed(1)}%`, leftMargin + 195, yPos + 6, { align: "right" });
  
  yPos += 15;

  // // Progress Summary Section
  // doc.setFontSize(12);
  // doc.setTextColor(0, 51, 102);
  // doc.setFont("helvetica", "bold");
  // doc.text("PROGRESS SUMMARY", leftMargin, yPos);
  // yPos += 8;

  // // Summary Box
  // doc.setFillColor(249, 251, 253);
  // doc.rect(leftMargin, yPos, tableWidth, 40, "F");
  // doc.setDrawColor(220, 220, 220);
  // doc.rect(leftMargin, yPos, tableWidth, 40, "S");
  
  // doc.setFontSize(10);
  // doc.setTextColor(0, 0, 0);
  
  // // Column 1
  // const summaryX1 = leftMargin + 10;
  // const summaryX2 = leftMargin + 110;
  
  // // Earthwork Section
  // doc.setFont("helvetica", "bold");
  // doc.setTextColor(33, 150, 243); // Blue
  // doc.text("Earthwork", summaryX1, yPos + 10);
  // doc.setFont("helvetica", "normal");
  // doc.setTextColor(0, 0, 0);
  // doc.text(`Completed: ${totalEarthwork.toFixed(2)} Km`, summaryX1 + 10, yPos + 16);
  // doc.text(`Target: ${targetKm.toFixed(2)} Km`, summaryX1 + 10, yPos + 22);
  
  // const earthworkPercentageCalc = totalEarthwork > 0 ? ((totalEarthwork / targetKm) * 100).toFixed(1) : "0.0";
  // doc.setFont("helvetica", "bold");
  // doc.setTextColor(parseFloat(earthworkPercentageCalc) >= 80 ? "green" : parseFloat(earthworkPercentageCalc) >= 50 ? "orange" : "red");
  // doc.text(`${earthworkPercentageCalc}% Complete`, summaryX1 + 10, yPos + 28);
  
  // // Lining Section - THIS IS OVERALL PROGRESS
  // doc.setFont("helvetica", "bold");
  // doc.setTextColor(76, 175, 80); // Green
  // doc.text("Overall Progress (Lining)", summaryX2, yPos + 10);
  // doc.setFont("helvetica", "normal");
  // doc.setTextColor(0, 0, 0);
  // doc.text(`Completed: ${totalLining.toFixed(2)} Km`, summaryX2 + 10, yPos + 16);
  // doc.text(`Target: ${targetKm.toFixed(2)} Km`, summaryX2 + 10, yPos + 22);
  
  // const liningPercentageCalc = overallPercentage.toFixed(1);
  // doc.setFont("helvetica", "bold");
  // doc.setTextColor(overallPercentage >= 80 ? "green" : overallPercentage >= 50 ? "orange" : "red");
  // doc.text(`${liningPercentageCalc}% Complete`, summaryX2 + 10, yPos + 28);
  
  // Overall Progress Section
  yPos += 45;
  doc.setFillColor(240, 248, 255);
  doc.rect(leftMargin, yPos, tableWidth, 15, "F");
  
  doc.setFontSize(11);
  doc.setTextColor(0, 51, 102);
  doc.setFont("helvetica", "bold");
  doc.text("OVERALL PROGRESS STATUS", leftMargin + 5, yPos + 10);
  
  doc.setFontSize(12);
  doc.setTextColor(overallPercentage >= 80 ? "green" : 
                   overallPercentage >= 50 ?  "blue" : "orange");
  doc.text(`${overallPercentage.toFixed(1)}% COMPLETE`, leftMargin + 130, yPos + 10);
  
  // Progress bar - Based on Lining only
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

  // Key Dates
  // if (selectedWork) {
  //   doc.setFontSize(10);
  //   doc.setTextColor(100, 100, 100);
  //   doc.setFont("helvetica", "normal");
    
  //   doc.setFont("helvetica", "bold");
  //   doc.text(`Work start Date: ${formatDate(selectedWork.work_commencement_date)}`, leftMargin + 10, yPos);
  //   doc.text(`Work Stipulated Date: ${formatDate(selectedWork.work_stipulated_date)}`, leftMargin + 70, yPos);
    
  //   if (selectedWork.actual_date_of_completion) {
  //     doc.setTextColor(76, 175, 80);
  //     doc.text(`Actual Completed Date: ${formatDate(selectedWork.actual_date_of_completion)}`, leftMargin + 130, yPos);
  //   } else {
  //     const daysRemaining = Math.ceil((new Date(selectedWork.work_stipulated_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  //     doc.setTextColor(daysRemaining < 30 ? "red" : daysRemaining < 90 ? "orange" : "green");
  //     doc.text(`Days Remaining: ${daysRemaining}`, leftMargin + 160, yPos);
  //   }
  // }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "italic");
  doc.text("Bihar Water Security & Irrigation Modernization Project - Official Report", pageWidth / 2, pageHeight - 10, { align: "center" });
  doc.text("Page 1 of 1", pageWidth - leftMargin, pageHeight - 10, { align: "right" });

  // Save PDF
  doc.save(`${selectedPackage}_Lengthwise_Progress_Report_${new Date().getTime()}.pdf`);
};

const downloadLengthwiseExcel = async () => {
  if (!selectedPackage) {
    alert("Please select a package first.");
    return;
  }

  const selectedWork = works.find((w: Work) => w.package_number === selectedPackage);
  
  // Create new workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Bihar Water Security & Irrigation Modernization Project';
  workbook.created = new Date();
  
  // Calculate overall progress based on Lining ONLY
  const overallPercentage = totalLining > 0 ? ((totalLining / targetKm) * 100) : 0;
  const earthworkPercentage = totalEarthwork > 0 ? ((totalEarthwork / targetKm) * 100) : 0;
  
  // ========== SHEET 1: MAIN PROGRESS REPORT ==========
  const worksheet = workbook.addWorksheet('Progress Report');
  
  // Set column widths with adjusted widths for better display
  worksheet.columns = [
    { width: 30},   // A: S.No.
    { width: 50 },  // B: Item of Work/Description (increased width)
    { width: 15 },  // C: Target (Km)
    { width: 15 },  // D: Progress (Km)
    { width: 15 },  // E: Balance (Km)
    { width: 15 },  // F: % Completed
    { width: 35 },  // G: Merged cells
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
    fgColor: { argb: '003366' } // Dark Blue
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

  // Row 3: Empty
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
    fgColor: { argb: '4F81BD' } // Blue
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

// Report ID और Month एक ही row में दो columns में
const reportIdMonthRow = worksheet.addRow([]);
reportIdMonthRow.height = 30;

// Report ID (left aligned)
const reportIdCell = reportIdMonthRow.getCell(1);
reportIdCell.value = `Report ID:-${selectedPackage}-${currentYear}`;
reportIdCell.font = { bold: true };
reportIdCell.alignment = { horizontal: 'center', 
  vertical: 'middle', wrapText: true };

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
  fgColor: { argb: 'F9E076' } // Bright Yellow
};
// Merge cells for proper spacing
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
generatedRow.getCell(1).alignment = { wrapText: true,horizontal:'left',vertical:'middle' };
worksheet.mergeCells(`A${generatedRow.number}:G${generatedRow.number}`);
  
  worksheet.addRow([]);

  // Project Details Table - With multiline support
  const projectDetailsStartRow = 8;
  
  // Clean work name - remove unnecessary text
  const workName = selectedWork?.work_name 
    ? selectedWork.work_name.replace(/BidckarglerNo[\d\.DVtGMG\-PAdget:\s\/]+/g, '').trim()
    : 'N/A';
  
  const projectDetails = [
  { label: 'Name of Work:', value: workName, height: 40 },
  { label: 'Package No:', value: selectedPackage, height: 25, bgColor: 'F9E076' }, 
  { label: 'Contractor:', value: selectedWork?.contractor_name || 'N/A', height: 25 },
  { label: 'Work Order:', value: selectedWork?.agreement_no || 'N/A', height: 25,bgColor: 'F9E076' },
  { label: 'Contract Value (Cr.):', value: selectedWork?.contract_awarded_amount || 'N/A', height: 25,bgColor: 'F9E076' },
  { label: 'Division:', value: selectedWork?.division_name || 'N/A', height: 25 },
  { label: 'Start Date of Work:', value: selectedWork?.work_commencement_date , height: 25 },
  { label: 'Stipulated Date of Work:', value: selectedWork?.work_stipulated_date , height: 25 },
  { label: 'Actual Completion Date:', value: selectedWork?.actual_date_of_completion , height: 25 },
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
    fgColor: { argb: 'E6F2FF' }
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
  
  
  if (detail.label === 'Package No:') {
    valueCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F9E076' } 
    };
    
    // Label में भी same color (optional)
    labelCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F9E076' } 
    };
  }
  else if (detail.label === 'Work Order:') {
    // Contractor के लिए Light Blue
    labelCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F9E076' } 
    };
    valueCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F9E076' } 
    };
  }
   else if (detail.label === 'Contract Value (Cr.):') {
    // Contractor के लिए Light Blue
    labelCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F9E076' } 
    };
    valueCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F9E076' } 
    };
  }
   else if (detail.label === 'Division:') {
    // Contractor के लिए Light Blue
    labelCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F9E076' } 
    };
    valueCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F9E076' } 
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
    fgColor: { argb: '4F81BD' } // Blue
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
      fgColor: { argb: '366092' } // Darker Blue
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

  // Table Data - Earthwork
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
      fgColor: { argb: 'FFF2E0' } // Light Orange
    };
    cell.alignment = { 
      vertical: 'middle',
      wrapText: true 
    };
    
    if (colNumber === 2) { // Item of Work column
      cell.alignment = { 
        vertical: 'middle',
        horizontal: 'left',
        wrapText: true 
      };
    }
    
    if (colNumber === 6) { // % Completed column
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
    
    if (colNumber >= 3 && colNumber <= 5) { // Numeric columns
      cell.alignment = { 
        horizontal: 'right',
        vertical: 'middle',
        wrapText: true 
      };
    }
  });

  // Table Data - Lining (Overall Progress)
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
      fgColor: { argb: 'E0F2F1' } // Light Green
    };
    cell.alignment = { 
      vertical: 'middle',
      wrapText: true 
    };
    
    if (colNumber === 2) { // Item of Work column
      cell.alignment = { 
        vertical: 'middle',
        horizontal: 'left',
        wrapText: true 
      };
    }
    
    if (colNumber === 6) { // % Completed column
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
    
    if (colNumber >= 3 && colNumber <= 5) { // Numeric columns
      cell.alignment = { 
        horizontal: 'right',
        vertical: 'middle',
        wrapText: true 
      };
    }
  });

  // Add empty rows after table
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
    fgColor: { argb: 'FF9900' } // Orange
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
    color: { argb: parseFloat(earthworkPercentage.toFixed(2)) >= 80 ? '00B050' : parseFloat(earthworkPercentage.toFixed(2)) >= 50 ? 'FF9900' : 'FF0000' } 
  };
  earthworkProgressRow.getCell(1).alignment = { 
    horizontal: 'center', 
    vertical: 'middle',
    wrapText: true 
  };
  worksheet.mergeCells(`A${earthworkProgressRow.number}:G${earthworkProgressRow.number}`);
  
  worksheet.addRow([]);

  // Overall Progress (Lining) Summary
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
    fgColor: { argb: '00B050' } // Green
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
    color: { argb: parseFloat(overallPercentage.toFixed(2)) >= 80 ? '00B050' : parseFloat(overallPercentage.toFixed(2)) >= 50 ? 'FF9900' : 'FF0000' } 
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

  useEffect(() => {
    const closeMenu = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".download-menu")) {
        setShowDownloadOptions(false);
      }
    };
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  return (
    <div className="p-6 space-y-6">
     {onClose && (
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
            Close
          </button>
          </div>
     )}
      {!selectedPackage && (
        <div className="space-y-4">
           <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
           <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Number
                </label>
                <input
                  type="text"
                  placeholder="Enter package number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contractor Name
                </label>
                <input
                  type="text"
                  placeholder="Enter contractor name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div> */}
            </div>
</div>

           <div className="overflow-x-auto border rounded-md shadow-sm">
            <table className="w-full border-collapse shadow-sm">
              <thead>
                 <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <th className="border p-2">Package No.</th>
                  <th className="border p-2">Work Name</th>
                  <th className="border p-2">Agency Name</th>
                  <th className="border p-2">Target KM</th>
                  <th className="border p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorks.map((w: Work) => (
                  <tr key={w.id} className="hover:bg-gray-50">
                    <td className="border p-2">{w.package_number}</td>
                    <td className="border p-2">{w.work_name}</td>
                    <td className="border p-2">{w.contractor_name}</td>
                    <td className="border p-2">{w.target_km} Km</td>
                    <td className="border p-2 text-center">
                      <button
                        className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 group overflow-hidden"
                        onClick={() => setSelectedPackage(w.package_number)}
                      >
                        <div className="relative z-10 flex items-center gap-2">
                          <Eye className="w-5 h-5" />
                          <span className="font-medium">View Progress</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredWorks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="border p-2 text-center text-gray-500">
                      No works found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedPackage && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            {!onClose && (
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              onClick={() => setSelectedPackage(null)}
            >
              ⬅ Back
            </button>
            )}

            <div className="flex items-center gap-3">
              { canAddProgress() && (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => {
                  setSelectedRange([0, targetKm]);
                  setEditingEntry(null);
                  setShowForm(true);
                }}
              >
                ➕ Add Progress
              </button>
               )}
              <div className="relative download-menu">
                <button
                  onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Lengthwise Report ▾
                </button>
                {showDownloadOptions && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-xl z-10 overflow-hidden">
                    <button
                      onClick={downloadLengthwisePDF}
                      className="block w-full text-left px-4 py-3 hover:bg-blue-50 text-blue-700 font-medium border-b"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span>PDF Report (Excel Format)</span>
                      </div>
                    </button>
                    <button
                      onClick={downloadLengthwiseExcel}
                      className="block w-full text-left px-4 py-3 hover:bg-green-50 text-green-700 font-medium border-b"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Excel File (.xlsx)</span>
                      </div>
                    </button>
                   
                  </div>
                )}
              </div>
            </div>
          </div>

          {works
            .filter((w:any) => w.package_number === selectedPackage)
            .map((w:any) => (
              <div
                key={w.id}
                className="mb-4 p-6 bg-gradient-to-r from-blue-50 to-gray-50 rounded-xl shadow border border-blue-100"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-blue-800 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Contractor Details
                    </h3>
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        <span className="font-semibold">Name:</span> {w.contractor_name}
                      </p>
                      {w.agreement_no && (
                        <p className="text-gray-700">
                          <span className="font-semibold">Agreement No:</span> {w.agreement_no}
                        </p>
                      )}
                      {w.contract_awarded_amount && (
                        <p className="text-gray-700">
                          <span className="font-semibold">Contract Value (Cr.):</span>{" "}
                          <span className="text-green-700">₹{w.contract_awarded_amount.toLocaleString()}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-3 text-blue-800 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Work Information
                    </h3>
                    <div className="space-y-2">
                      {w.work_commencement_date && (
                        <p className="text-gray-700">
                          <span className="font-semibold">Start Date:</span> {w.work_commencement_date}
                        </p>
                      )}
                      {w.work_stipulated_date && (
                        <p className="text-gray-700">
                          <span className="font-semibold">End Date:</span> {w.work_stipulated_date}
                        </p>
                      )}
                      <p className="text-gray-700">
                        <span className="font-semibold">Target Length:</span>{" "}
                        <span className="text-blue-700 font-bold">{w.target_km} Km</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Lengthwise Progress Overview
              </h2>
              <p className="text-blue-100 text-sm mt-1">Preview of downloadable report format</p>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="border p-3 text-left">S.No.</th>
                      <th className="border p-3 text-left">Item of Work</th>
                      <th className="border p-3 text-left">Progress (Km)</th>
                      <th className="border p-3 text-left">Target Length (Km)</th>
                      <th className="border p-3 text-left">% Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lengthwiseData.map((item: LengthwiseItem, index: number) => {
                      const percentage = item.target > 0 ? ((item.progress / item.target) * 100).toFixed(1) : "0.0";
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border p-3">{index + 1}</td>
                          <td className="border p-3 font-medium">{item.item}</td>
                          <td className="border p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-500 h-2 rounded-full" 
                                  style={{ 
                                    width: `${item.target > 0 ? Math.min((item.progress / item.target) * 100, 100) : 0}%` 
                                  }}
                                ></div>
                              </div>
                              <span>{item.progress.toFixed(2)}</span>
                            </div>
                          </td>
                          <td className="border p-3">{item.target.toFixed(2)}</td>
                          <td className="border p-3">
                            <span className={`font-bold ${parseFloat(percentage) >= 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                              {percentage}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-bold text-lg mb-3 text-blue-800">Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-semibold">Total Length Completed:</span>{" "}
                      <span className="text-blue-700 font-bold">{totalLining.toFixed(2)} Km</span>
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Total Target Length:</span>{" "}
                      <span className="text-blue-700 font-bold">{targetKm.toFixed(2)} Km</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-semibold">Overall Progress:</span>{" "}
                      <span className="text-green-700 font-bold text-xl">{overallProgress.toFixed(1)}%</span>
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Remaining Length:</span>{" "}
                      <span className="text-orange-700 font-bold">{(targetKm - totalLining).toFixed(2)} Km</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-yellow-100 p-4 rounded-lg shadow text-center">
              <h3 className="font-semibold text-yellow-700">Earthwork Done (Km)</h3>
              <p className="text-3xl font-bold text-yellow-800">{totalEarthwork.toFixed(2)}</p>
              <p className="text-sm text-yellow-600">Target: {targetKm.toFixed(2)} Km</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg shadow text-center">
              <h3 className="font-semibold text-blue-700">Lining Done (Km)</h3>
              <p className="text-3xl font-bold text-blue-800">{totalLining.toFixed(2)}</p>
              <p className="text-sm text-blue-600">Target: {targetKm.toFixed(2)} Km</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg shadow text-center">
              <h3 className="font-semibold text-green-700">Target (Km)</h3>
              <p className="text-3xl font-bold text-green-800">{targetKm.toFixed(2)}</p>
              <p className="text-sm text-green-600">Remaining: {(targetKm - totalLining).toFixed(2)} Km</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">
              Overall Progress (Based on Lining)
            </h2>
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={gaugeData}
                  dataKey="value"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="text-4xl font-bold text-blue-700">{overallProgress.toFixed(1)}%</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2 text-center">Earthwork Progress (KM)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={kilometerData}>
                  <defs>
                    <linearGradient id="earthwork" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="kilometer" domain={[0, targetKm]} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="earthworkDone"
                    stroke="#F59E0B"
                    fillOpacity={1}
                    fill="url(#earthwork)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2 text-center">Lining Progress (KM)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={kilometerData}>
                  <defs>
                    <linearGradient id="lining" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="kilometer" domain={[0, targetKm]} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="liningDone"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#lining)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-3">Progress Entries</h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="border p-2">Start KM</th>
                  <th className="border p-2">End KM</th>
                  <th className="border p-2">Earthwork Done</th>
                  <th className="border p-2">Lining Done</th>
                  <th className="border p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {progressEntries.length > 0 ? (
                  progressEntries.map((p, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border p-2">{typeof p.start_km === 'number' ? p.start_km : parseFloat(p.start_km)}</td>
                      <td className="border p-2">{typeof p.end_km === 'number' ? p.end_km : parseFloat(p.end_km)}</td>
                      <td className="border p-2">{typeof p.earthwork_done_km === 'number' ? p.earthwork_done_km.toFixed(2) : "0.00"}</td>
                      <td className="border p-2">{typeof p.lining_done_km === 'number' ? p.lining_done_km.toFixed(2) : "0.00"}</td>
                      <td className="border p-2">{p.date ? new Date(p.date).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="border p-2 text-center text-gray-500">
                      No progress data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && selectedPackage && (
        <AddProgressForm
          showModal={showForm}
          onAddProgress={handleAddProgress}
          selectedRange={selectedRange}
          editingEntry={editingEntry}
          onClose={() => setShowForm(false)}
          targetKm={targetKm}
          totalEarthwork={totalEarthwork}
          totalLining={totalLining}
          progressEntries={progressEntries}
        />
      )}
    </div>
  );
}