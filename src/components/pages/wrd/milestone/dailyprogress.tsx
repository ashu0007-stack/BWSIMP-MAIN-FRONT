import { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Eye, Download, Plus, ArrowLeft, ChevronDown, X } from "lucide-react";
import AddProgressForm from "../milestone/MilestoneProgress";
import {
  usePackageProgress,
  usePackageComponentsDetailed,
  useSaveMilestoneProgress,
  useWorksmiles,
  usePackageMilestones,
} from "@/hooks/wrdHooks/useMilestones";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import * as ExcelJS from 'exceljs';

interface MilestonePageProps {
  workId?: number | string ;
  packageNumber?: string;
  workName?: string;
  contractorName?: string;
  onClose?: () => void;
}
interface Milestone {
  work_name: string;
  contractor_name: string;
  package_number: string;
  agreement_no: string;
  nameofauthrizeperson: string;
  contract_awarded_amount: string;
  work_commencement_date: string;
  work_stipulated_date: string;
}

interface Component {
  id: number;
  name: string;
  field_name: string;
  unitname: string;
  total_qty: number;
  num_of_milestones?: number; 
  milestone_1_percentage?: number;
  milestone_2_percentage?: number;
  milestone_3_percentage?: number;
  milestone_4_percentage?: number;
}

interface MilestoneData {
  id: number;
  milestone_number: number;
  milestone_name: string;
  milestone_qty: number;
  completed_quantity: number;
  milestone_completed_qty: number;
  milestone_percentage: number;
  previous_month_qty: number;
  current_month_qty: number;
  cumulative_qty: number;
  achievement_percentage: number;
  status: string;
  unit: string;
}

interface PackageMilestoneComponent {
  component_id: number;
  name: string;
  unit: string;
  total_qty: number;
  milestones: MilestoneData[];
  milestone_1_percentage?: number;
  milestone_2_percentage?: number;
  milestone_3_percentage?: number;
  milestone_4_percentage?: number;
  milestoneCount?: number;
}

export default function MilestonePage({ 
  workId, 
  packageNumber, 
  workName, 
  contractorName, 
  onClose 
}: MilestonePageProps) {
  const [searchPackage, setSearchPackage] = useState(packageNumber || "");
  const [searchContractor, setSearchContractor] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<string | null>(packageNumber || null);
  const [showModal, setShowModal] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<number>(1);
  const [formattedComponents, setFormattedComponents] = useState<Component[]>([]);
  const [actualMilestoneCount, setActualMilestoneCount] = useState<number>(0);
  const downloadMenuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    // Get user details from sessionStorage
    const storedProfile = sessionStorage.getItem("userdetail");
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      setUser(profile);
      setUserRole(profile?.role_name || '');
    }
  }, []);

  // 🔹 Check if user has permission to add progress
  const canAddProgress = () => {
    if (!user) return false;
    
    // Role IDs that can add progress (operator, admin, etc.)
    // आपके role structure के according adjust करें
    const allowedRoles = ['Operator'];
    
    return allowedRoles.includes(user.role_name) || 
           [5].includes(user.role_id); // Example: role_id 5,6 for operators, 1,2 for admins
  };

  const { data: miles = [], isLoading: worksLoading } = useWorksmiles();
  const { data: progress = [], refetch: refetchProgress } = usePackageProgress(
    selectedPackage || ""
  );
  
  const { data: packageMilestones = [], refetch: refetchMilestones } = usePackageMilestones(
    selectedPackage || ""
  );
  
  const { data: components = [] } = usePackageComponentsDetailed(
    selectedPackage || ""
  );
  
  const saveProgressMutation = useSaveMilestoneProgress();


  useEffect(() => {
    if (components && Array.isArray(components) && components.length > 0) {
      const formatted = components.map((comp: any) => ({
        id: comp.id || 0,
        name: comp.name || "",
        field_name: comp.field_name || comp.name?.toLowerCase().replace(/\s+/g, '_') || "",
        unitname: comp.unitname || "",
        total_qty: Number(comp.total_qty) || 0,
        milestone_1_percentage: Number(comp.milestone_1_percentage) || 0,
        milestone_2_percentage: Number(comp.milestone_2_percentage) || 0,
        milestone_3_percentage: Number(comp.milestone_3_percentage) || 0,
        milestone_4_percentage: Number(comp.milestone_4_percentage) || 0,
      }));
      setFormattedComponents(formatted);
    }
  }, [components]);


  useEffect(() => {
    if (packageMilestones && Array.isArray(packageMilestones) && packageMilestones.length > 0) {
      const milestoneNumbers = new Set<number>();
      packageMilestones.forEach((comp: PackageMilestoneComponent) => {
        if (comp.milestones && Array.isArray(comp.milestones)) {
          comp.milestones.forEach((m: MilestoneData) => {
            milestoneNumbers.add(m.milestone_number);
          });
        }
      });
      setActualMilestoneCount(milestoneNumbers.size);
    } else {
      setActualMilestoneCount(0);
    }
  }, [packageMilestones]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setShowDownloadOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

// MilestonePage.tsx में handleAddProgress function update करें

const handleAddProgress = (formData: any) => {
  if (!selectedPackage) {
    alert("Please select a package first!");
    return;
  }

  console.log("📤 Saving progress data:", formData);

  // Convert fortnight back to display format if needed
  const progressData = {
    packageNumber: selectedPackage,
    progressDate: formData.progressDate,
    fortnight: formData.fortnight, // ये "1-15" या "16-31" format में आएगा
    milestoneNumber: formData.milestoneNumber,
    components: formData.components || [],
    remark: formData.remark || "",
  };

  // ✅ Check for existing progress in same fortnight
  const selectedDate = new Date(progressData.progressDate);
  const existingProgress = progress.filter((p: any) => {
    return (
      p.package_number === selectedPackage &&
      p.milestone_number === progressData.milestoneNumber &&
      p.fortnight === progressData.fortnight &&
      new Date(p.progress_date).getMonth() === selectedDate.getMonth() &&
      new Date(p.progress_date).getFullYear() === selectedDate.getFullYear()
    );
  });

  if (existingProgress.length > 0) {
    const confirmUpdate = confirm(
      `Progress already exists for ${progressData.fortnight} of ${selectedDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}. Do you want to update it?`
    );
    if (!confirmUpdate) return;
  }

  saveProgressMutation.mutate(progressData, {
    onSuccess: (data) => {
      refetchMilestones();
      refetchProgress();
      setShowModal(false);
      alert(`Progress saved successfully for ${progressData.fortnight} fortnight!`);
    },
    onError: (error) => {
      console.error("❌ Error saving progress:", error);
      alert("Failed to save progress.");
    },
  });
};

const handleDownload = async  (format: "pdf" | "excel") => {
  if (!selectedPackage || !Array.isArray(packageMilestones) || packageMilestones.length === 0) {
    alert("No milestone data available to download.");
    return;
  }

  const selectedWork = miles.find(
    (w: Milestone) => w.package_number === selectedPackage
  );

  if (format === "pdf") {
    const doc = new jsPDF("l", "mm", "a4");
    let yPos = 15;

    // ==================== HEADER SECTION ====================
    // Main Title with gradient effect
    doc.setFillColor(0, 51, 102); 
    doc.rect(0, 0, doc.internal.pageSize.width, 25, 'F');
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("BIHAR WATER SECURITY & IRRIGATION MODERNISATION PROJECT", 
             doc.internal.pageSize.width / 2, yPos, { align: 'center' });
    yPos += 10;

    // Subtitle
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("MILESTONE PROGRESS REPORT", 
             doc.internal.pageSize.width / 2, yPos, { align: 'center' });
    yPos += 15;

    // Project Information Box
    doc.setFillColor(230, 242, 255);
    doc.rect(14, yPos, doc.internal.pageSize.width - 28, 65, 'F'); 
    
    doc.setDrawColor(0, 51, 102); // Dark Blue border
    doc.setLineWidth(0.5);
    doc.rect(14, yPos, doc.internal.pageSize.width - 28, 65, 'S'); // Height increased
    
    // Project Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 51, 102); 
    
    if (selectedWork) {
      doc.text("PROJECT DETAILS", 20, yPos + 8);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      
      // Work Name - MULTILINE
      const workNameLines = doc.splitTextToSize(
        `Work Name: ${selectedWork.work_name}`,
        doc.internal.pageSize.width - 100 
      );
      
      // Print work name in multiple lines
      workNameLines.forEach((line: string, index: number) => {
        doc.text(line, 20, yPos + 15 + (index * 4));
      });
      
      // Calculate position after work name
      const workNameHeight = workNameLines.length * 4;
      doc.text(`Contractor: ${selectedWork.contractor_name}`, 20, yPos + 20 + workNameHeight);
      doc.text(`Package No: ${selectedPackage}`, 20, yPos + 25 + workNameHeight);
      doc.text(`Contract Value (Cr.): ${selectedWork.contract_awarded_amount}`, 20, yPos + 30 + workNameHeight);
      doc.text(`Start date of Work: ${selectedWork.work_commencement_date}`, 20, yPos + 35 + workNameHeight);
      doc.text(`Stipulated date of Work: ${selectedWork.work_stipulated_date}`, 20, yPos + 40 + workNameHeight);
      doc.text(`Actual date of completion: ${selectedWork.actual_date_of_completion}`, 20, yPos + 45 + workNameHeight);
    }
    
    yPos += 70; 

    // ==================== PHYSICAL PROGRESS SECTION ====================
    // Section Header
    doc.setFillColor(79, 129, 189); // Blue
    doc.rect(14, yPos, doc.internal.pageSize.width - 28, 10, 'F');
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("PHYSICAL PROGRESS", 20, yPos + 7);
    yPos += 15;

    // Render all milestones
    for (let milestoneNum = 1; milestoneNum <= actualMilestoneCount; milestoneNum++) {
      // Milestone Header with different colors
      const milestoneColors = [
        { bg: [255, 153, 0], text: [255, 255, 255] },  // Orange
        { bg: [57, 181, 74], text: [255, 255, 255] },  // Green
        { bg: [155, 81, 224], text: [255, 255, 255] }, // Purple
        { bg: [224, 57, 151], text: [255, 255, 255] }, // Pink
        { bg: [57, 181, 224], text: [255, 255, 255] }, // Light Blue
      ];
      
      const colorIndex = (milestoneNum - 1) % milestoneColors.length;
      const color = milestoneColors[colorIndex];
      
      doc.setFillColor(color.bg[0], color.bg[1], color.bg[2]);
      doc.rect(14, yPos, doc.internal.pageSize.width - 28, 8, 'F');
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(color.text[0], color.text[1], color.text[2]);
      doc.text(`MILESTONE ${milestoneNum}`, 20, yPos + 5.5);
      yPos += 12;

      // Table Data for this milestone
     const tableData = packageMilestones
  .map((component: PackageMilestoneComponent, index: number) => {
    const milestoneData = component.milestones?.find(
      (m: MilestoneData) => m.milestone_number === milestoneNum
    );
    
    if (!milestoneData) return null;
    
            const getMilestonePercentage = () => {
            const milestoneQty = Number(milestoneData.milestone_qty) || 0;
            const totalQty = Number(component.total_qty) || 0;
              return totalQty > 0 ? (milestoneQty / totalQty) * 100 : 0;
            };
            
            const milestonePercentage = getMilestonePercentage();
            const milestoneQty = Number(milestoneData.milestone_qty) || 0;
            const achievementPercentage = Number(milestoneData.achievement_percentage) || 0;

    return [
      (index + 1).toString(),
              component.name,
              component.unit,
              (Number(component.total_qty) || 0).toLocaleString(),
              `${(milestonePercentage).toFixed(1)}%`,
      milestoneQty.toLocaleString(),
      (Number(milestoneData.previous_month_qty) || 0).toLocaleString(),
      (Number(milestoneData.current_month_qty) || 0).toLocaleString(),
      (Number(milestoneData.cumulative_qty) || 0).toLocaleString(),
      `${achievementPercentage.toFixed(1)}%`
    ];
  })
  .filter(row => row !== null);

// Create Table with colors
if (tableData.length > 0) {
  autoTable(doc, {
    startY: yPos,
    head: [
      ["Sno", "Item of Work", "Unit", "Total Qty", 
       "% as per Agreement", "Qty as per Milestone",
       "Previous Month", "Current Month", "Cumulative", "Achieved %"]
    ],
    body: tableData,
    theme: 'grid',
    styles: { 
      fontSize: 8, 
      textColor: [0, 0, 0], 
      fillColor: [255, 255, 255],
      cellPadding: 2,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
      valign: 'top',
      halign: 'center',
      minCellHeight: 8
    },
    headStyles: { 
      fillColor: [54, 96, 146],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
      fontSize: 7,
      halign: 'center',
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'left', cellWidth: 35, valign: 'top' },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'right', cellWidth: 24 },
      4: { halign: 'center', cellWidth: 30 },
      5: { halign: 'right', cellWidth: 30 },
      6: { halign: 'right', cellWidth: 30 },
      7: { halign: 'right', cellWidth: 30 },
      8: { halign: 'right', cellWidth: 28 },
      9: { halign: 'center', cellWidth: 30, fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 },
    didDrawCell: (data: any) => {
      // Highlight the "Achieved %" column
      if (data.column.index === 9 && data.row.index > 0) {
        const cellValue = data.cell.text[0];
        if (cellValue) {
          const percentage = parseFloat(cellValue.toString().replace('%', ''));
          let bgColor = [255, 255, 255];
          
          if (percentage >= 80) {
            bgColor = [220, 252, 231];
          } else if (percentage >= 50) {
            bgColor = [254, 249, 195];
          } else {
            bgColor = [254, 226, 226];
          }
          
          doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          
          // Re-draw the text on top
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(7);
          const textX = data.cell.x + (data.cell.width / 2);
          const textY = data.cell.y + (data.cell.height / 2) + 2;
          doc.text(cellValue.toString(), textX, textY, { align: 'center', baseline: 'middle' });
        }
      }
    },
    // Handle multiline content
    didParseCell: (data: any) => {
      // For component name column (index 1)
      if (data.column.index === 1 && data.row.index > 0) {
        const cellValue = data.cell.raw;
        if (typeof cellValue === 'string') {
          const lines = doc.splitTextToSize(cellValue, 25);
          data.cell.text = lines;
          data.cell.styles.minCellHeight = Math.max(8, lines.length * 3.5);
        }
      }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;
}
      
      // Add page if needed
      if (yPos > 180 && milestoneNum < actualMilestoneCount) {
        doc.addPage();
        yPos = 20;
      }
    }

    // ==================== CUMULATIVE PROGRESS SECTION ====================
if (actualMilestoneCount > 1) {
  doc.addPage();
  yPos = 20;
  
  // Section Header
  doc.setFillColor(57, 181, 74); // Green
  doc.rect(14, yPos, doc.internal.pageSize.width - 28, 10, 'F');
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("CUMULATIVE PROGRESS SUMMARY", 20, yPos + 7);
  yPos += 15;

  const cumulativeHeaders = [
    ["Sno", "Item of Work", "Unit", "Total Qty", 
     "Previous Month", "Current Month", "Cumulative", "Achieved %"]
  ];

  const cumulativeData = packageMilestones
    .map((component: PackageMilestoneComponent, index: number) => {
      const allMilestones = component.milestones || [];
      const previousMonthTotal = allMilestones.reduce((sum: number, m: MilestoneData) => 
        sum + (Number(m.previous_month_qty) || 0), 0);
      const currentMonthTotal = allMilestones.reduce((sum: number, m: MilestoneData) => 
        sum + (Number(m.current_month_qty) || 0), 0);
      const cumulativeTotal = allMilestones.reduce((sum: number, m: MilestoneData) => 
        sum + (Number(m.cumulative_qty) || 0), 0);
      const totalQty = Number(component.total_qty) || 0;
      const achievementPercentage = totalQty > 0 ? 
        (cumulativeTotal / totalQty) * 100 : 0;

      return [
        (index + 1).toString(),
        component.name || "",
        component.unit || "",
        totalQty.toLocaleString(),
        previousMonthTotal.toLocaleString(),
        currentMonthTotal.toLocaleString(),
        cumulativeTotal.toLocaleString(),
        `${achievementPercentage.toFixed(1)}%` // Simple string
      ];
    });

  autoTable(doc, {
    startY: yPos,
    head: cumulativeHeaders,
    body: cumulativeData,
    theme: 'grid',
    styles: { 
      fontSize: 8, 
      textColor: [0, 0, 0], 
      fillColor: [255, 255, 255],
      cellPadding: 2,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
      valign: 'top',
      halign: 'center',
      minCellHeight: 10
    },
    headStyles: { 
      fillColor: [16, 185, 129], // Green header
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
      fontSize: 8,
      halign: 'center',
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: [240, 253, 244] // Light Green alternate rows
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 19 },
      1: { halign: 'left', cellWidth: 50, valign: 'top' },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'right', cellWidth: 35 },
      4: { halign: 'right', cellWidth: 35 },
      5: { halign: 'right', cellWidth: 35 },
      6: { halign: 'right', cellWidth: 35 },
      7: { halign: 'center', cellWidth: 35, fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 },
    didDrawCell: (data: any) => {
      // Highlight the "Achieved %" column (index 7)
      if (data.column.index === 7 && data.row.index > 0) {
        const cellValue = data.cell.text ? data.cell.text[0] : '';
        if (cellValue && typeof cellValue === 'string') {
          const percentage = parseFloat(cellValue.replace('%', '')) || 0;
          let bgColor = [255, 255, 255];
          let textColor = [0, 0, 0];
          
          if (percentage >= 80) {
            bgColor = [220, 252, 231]; // Light Green
            textColor = [16, 185, 129]; // Green text
          } else if (percentage >= 50) {
            bgColor = [254, 249, 195]; // Light Yellow
            textColor = [245, 158, 11]; // Yellow text
          } else {
            bgColor = [254, 226, 226]; // Light Red
            textColor = [239, 68, 68]; // Red text
          }
          
          // Apply background color
          doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          
          // Apply text color
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          
          // Calculate text position
          const textX = data.cell.x + (data.cell.width / 2);
          const textY = data.cell.y + (data.cell.height / 2) + 2.5;
          
          // Draw the text
          doc.text(cellValue, textX, textY, { 
            align: 'center', 
            baseline: 'middle' 
          });
          
          // Reset text color for other cells
          doc.setTextColor(0, 0, 0);
        }
      }
    },
    didParseCell: (data: any) => {
      // For component name column (index 1)
      if (data.column.index === 1 && data.row.index > 0) {
        const cellValue = data.cell.raw;
        if (typeof cellValue === 'string' && cellValue.length > 40) {
          const lines = doc.splitTextToSize(cellValue, 45);
          data.cell.text = lines;
          data.cell.styles.minCellHeight = Math.max(10, lines.length * 3.5);
        }
      }
    }
  });
}

    // ==================== FOOTER ====================
    const pageCount = (doc as any).internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer gradient
      doc.setFillColor(240, 240, 240);
      doc.rect(0, doc.internal.pageSize.height - 15, 
               doc.internal.pageSize.width, 15, 'F');
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      
      doc.text(
        `Report Generated: ${new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })} ${new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        14,
        doc.internal.pageSize.height - 10
      );
      
      doc.text(
        `BWSIMP System | Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 14,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
    }

    doc.save(`${selectedPackage}_Color_Progress_Report.pdf`);
    
  } 
 else {
  // Excel Download with Colors using ExcelJS
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Milestone Progress Report');
  
  // ==================== HEADER SECTION ====================
  // Row 0: Main Title
  const titleRow = worksheet.addRow(['BIHAR WATER SECURITY & IRRIGATION MODERNISATION PROJECT']);
  titleRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 16 };
  titleRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF003366' } // Dark Blue
  };
  titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.mergeCells('A1:J1');
  
  // Row 1: Subtitle
  const subtitleRow = worksheet.addRow(['MILESTONE PROGRESS REPORT']);
  subtitleRow.font = { bold: true, color: { argb: 'FF003366' }, size: 14 };
  subtitleRow.alignment = { horizontal: 'center' };
  worksheet.mergeCells('A2:J2');
  
  // Row 2: Empty
  worksheet.addRow([]);
  
  // ==================== PROJECT INFORMATION ====================
  // Row 3: Project Information Header
  const projectInfoHeader = worksheet.addRow(['PROJECT INFORMATION']);
  projectInfoHeader.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
  projectInfoHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F81BD' } // Blue
  };
  projectInfoHeader.alignment = { horizontal: 'left' };
  worksheet.mergeCells('A4:J4');
  
  // Row 4: Empty
  worksheet.addRow([]);
 
  // Row 5-12: Project Details
 if (selectedWork) {
  const projectDetails = [
    ['Work Name:', selectedWork.work_name || ''],
    ['Contractor:', selectedWork.contractor_name || ''],
    ['Package No:', selectedPackage],
    ['Contract Value (Cr.):', selectedWork.contract_awarded_amount || ''],
    ['Start Date of Work:', selectedWork.work_commencement_date || ''],
    ['Stipulated Date of Work:', selectedWork.work_stipulated_date || ''],
    ['Actual Date of Completion:', selectedWork.actual_date_of_completion || ''],
    ['Report Generated:', new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) + ' ' + new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })]
  ];
  
  projectDetails.forEach(([label, value], index) => {
    const rowNumber = 5 + index; // Starting from row 5
    const row = worksheet.addRow([label, value]);
    
    // Set column widths
    worksheet.getColumn(1).width = 25;
    worksheet.getColumn(2).width = 25;
    
    // Style label cell (column A)
    const labelCell = row.getCell(1);
    labelCell.font = { bold: true, color: { argb: 'FF003366' } };
    labelCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F2FF' } // Light Blue
    };
    
    // Style value cell (column B)
    const valueCell = row.getCell(2);
    valueCell.alignment = { horizontal: 'left' };
    
    // WORK NAME ROW SPECIFIC - B se J tak merge karen
    if (index === 0) { // First row is Work Name
      // Merge columns B through J (columns 2 through 10)
      worksheet.mergeCells(`B${rowNumber}:J${rowNumber}`);
      
      // Adjust column B width for merged area
      worksheet.getColumn(2).width = 60;
      
      // Wrap text for work name
      valueCell.alignment = { 
        horizontal: 'left', 
        vertical: 'top',
        wrapText: true 
      };
    } else {
      // Other rows - B to J merge
      worksheet.mergeCells(`B${rowNumber}:J${rowNumber}`);
    }
  });
}
  // Add empty rows
  worksheet.addRow([]);
  worksheet.addRow([]);
  
  // ==================== PHYSICAL PROGRESS SECTION ====================
  let currentRow = worksheet.rowCount + 1;
  
  // Physical Progress Header
  const physicalProgressHeader = worksheet.addRow(['PHYSICAL PROGRESS']);
  physicalProgressHeader.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
  physicalProgressHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F81BD' } // Blue
  };
  physicalProgressHeader.alignment = { horizontal: 'center' };
  worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
  
  currentRow++;
  worksheet.addRow([]); // Empty row
  currentRow++;
  
  // Add each milestone
  for (let milestoneNum = 1; milestoneNum <= actualMilestoneCount; milestoneNum++) {
    // Milestone Header
    const milestoneHeader = worksheet.addRow([`MILESTONE ${milestoneNum}`]);
    milestoneHeader.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    milestoneHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFC65911' } // Brown/Orange
    };
    milestoneHeader.alignment = { horizontal: 'center' };
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
    
    currentRow++;
    
    // Table Headers
    const headers = [
      'Sno', 'Item of Work', 'Unit', 'Total Qty', 
      '% of Milestone as per Agreement', 'Qty as per Milestone',
      'Previous Month', 'Current Month', 'Cumulative', 'Achieved %'
    ];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF366092' } // Dark Blue
      };
      cell.alignment = { horizontal: 'center' };
    });
    
    currentRow++;
    
    // Add milestone data
    packageMilestones.forEach((component: PackageMilestoneComponent, index: number) => {
      const milestoneData = component.milestones?.find(
        (m: MilestoneData) => m.milestone_number === milestoneNum
      );
      
      if (milestoneData) {
        const getMilestonePercentage = () => {
            const milestoneQty = Number(milestoneData.milestone_qty) || 0;
            const totalQty = Number(component.total_qty) || 0;
              return totalQty > 0 ? (milestoneQty / totalQty) * 100 : 0;
            };
        const milestonePercentage = getMilestonePercentage();
        const milestoneQty = Number(milestoneData.milestone_qty) || 0;
        const achievementPercentage = Number(milestoneData.achievement_percentage) || 0;
        const totalQty = Number(component.total_qty) || 0;
console.log("perceb",milestonePercentage);
        const rowData = [
          index + 1,
          component.name || '',
          component.unit || '',
          totalQty,
          (milestonePercentage).toFixed(1) + "%",
          milestoneQty,
          Number(milestoneData.previous_month_qty) || 0,
          Number(milestoneData.current_month_qty) || 0,
          Number(milestoneData.cumulative_qty) || 0,
          (achievementPercentage).toFixed(1) + "%",
        ];
        
        const row = worksheet.addRow(rowData);
        
        // Format numeric cells (right aligned)
        [3, 5, 6, 7, 8].forEach(colIndex => {
          const cell = row.getCell(colIndex + 1);
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'right' };
        });
        
        // Format percentage cells (center aligned)
        [4, 9].forEach(colIndex => {
          const cell = row.getCell(colIndex + 1);
          cell.numFmt = '0.0%';
          cell.alignment = { horizontal: 'center' };
        });
        
        // Apply conditional formatting to Achieved %
        const achievedCell = row.getCell(10);
        if (achievementPercentage >= 100) {
          achievedCell.font = { bold: true, color: { argb: 'FF107C10' } };
          achievedCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFC6EFCE' }
          };
        } else if (achievementPercentage >= 50) {
          achievedCell.font = { bold: true, color: { argb: 'FFFFC000' } };
          achievedCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFEB9C' }
          };
        } else {
          achievedCell.font = { bold: true, color: { argb: 'FFFF0000' } };
          achievedCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFC7CE' }
          };
        }
        
        currentRow++;
      }
    });
    
    // Add empty rows between milestones
    worksheet.addRow([]);
    worksheet.addRow([]);
    currentRow += 2;
  }
  
  // ==================== CUMULATIVE PROGRESS SECTION ====================
  if (actualMilestoneCount > 1) {
    // Cumulative Progress Header
    const cumulativeHeader = worksheet.addRow(['CUMULATIVE PROGRESS']);
    cumulativeHeader.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    cumulativeHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F81BD' } // Blue
    };
    cumulativeHeader.alignment = { horizontal: 'center' };
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
    
    currentRow++;
    worksheet.addRow([]);
    currentRow++;
    
    // Cumulative Table Headers
    const cumulativeHeaders = [
      'Sno', 'Item of Work', 'Unit', 'Total Qty', 
      'Previous Month', 'Current Month', 'Cumulative', 'Achieved %'
    ];
    const cumulativeHeaderRow = worksheet.addRow(cumulativeHeaders);
    cumulativeHeaderRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF366092' } // Dark Blue
      };
      cell.alignment = { horizontal: 'center' };
    });
    
    currentRow++;
    
    // Add cumulative data
    packageMilestones.forEach((component: PackageMilestoneComponent, index: number) => {
      const allMilestones = component.milestones || [];
      const previousMonthTotal = allMilestones.reduce((sum: number, m: MilestoneData) => 
        sum + (Number(m.previous_month_qty) || 0), 0);
      const currentMonthTotal = allMilestones.reduce((sum: number, m: MilestoneData) => 
        sum + (Number(m.current_month_qty) || 0), 0);
      const cumulativeTotal = allMilestones.reduce((sum: number, m: MilestoneData) => 
        sum + (Number(m.cumulative_qty) || 0), 0);
      const totalQty = Number(component.total_qty) || 0;
      const achievementPercentage = totalQty > 0 ? 
        (cumulativeTotal / totalQty) * 100 : 0;

      const rowData = [
        index + 1,
        component.name || '',
        component.unit || '',
        totalQty,
        previousMonthTotal,
        currentMonthTotal,
        cumulativeTotal,
        achievementPercentage / 100 // Convert to decimal for percentage format
      ];
      
      const row = worksheet.addRow(rowData);
      
      // Format numeric cells (right aligned)
      [3, 4, 5, 6].forEach(colIndex => {
        const cell = row.getCell(colIndex + 1);
        cell.numFmt = '#,##0';
        cell.alignment = { horizontal: 'right' };
      });
      
      // Format percentage cell (center aligned)
      const percentageCell = row.getCell(8);
      percentageCell.numFmt = '0.0%';
      percentageCell.alignment = { horizontal: 'center' };
      
      // Apply conditional formatting to Achieved %
      if (achievementPercentage >= 100) {
        percentageCell.font = { bold: true, color: { argb: 'FF107C10' } };
        percentageCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC6EFCE' }
        };
      } else if (achievementPercentage >= 50) {
        percentageCell.font = { bold: true, color: { argb: 'FFFFC000' } };
        percentageCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFEB9C' }
        };
      } else {
        percentageCell.font = { bold: true, color: { argb: 'FFFF0000' } };
        percentageCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFC7CE' }
        };
      }
      
      currentRow++;
    });
    
    // Add empty rows
    worksheet.addRow([]);
    worksheet.addRow([]);
    currentRow += 2;
  }
  
  // ==================== FOOTER ====================
  const footerRow = worksheet.addRow(['Generated By: BWSIMP System']);
  footerRow.font = { italic: true, color: { argb: 'FF666666' } };
  footerRow.alignment = { horizontal: 'center' };
  worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
  
  // Set column widths
  worksheet.columns = [
    { width: 25 },   // A: Sno
    { width: 20 },  // B: Item of Work
    { width: 8 },   // C: Unit
    { width: 15 },  // D: Total Qty
    { width: 25 },  // E: % as per Agreement
    { width: 20 },  // F: Qty as per Milestone
    { width: 15 },  // G: Previous Month
    { width: 15 },  // H: Current Month
    { width: 15 },  // I: Cumulative
    { width: 12 }   // J: Achieved %
  ];
  
  // Save the workbook
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `WSMC-P-1_Complete_Progress_Report.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
}
};

  const chartData = Array.isArray(progress) ? progress.map((row: any) => ({
    name: row.component || "",
    total: Number(row.total) || 0,
    tillLast: Number(row.tillLast) || 0,
    current: Number(row.current) || 0,
    cumulative: Number(row.cumulative) || 0,
  })) : [];

  const filteredWorks = Array.isArray(miles) ? miles.filter(
    (item: Milestone) =>
      (item.package_number ?? "")
        .toLowerCase()
        .includes(searchPackage.toLowerCase()) &&
      (item.contractor_name ?? "")
        .toLowerCase()
        .includes(searchContractor.toLowerCase())
  ) : [];

  const selectedWork = miles.find(
    (w: Milestone) => w.package_number === selectedPackage
  );

  // Render milestone buttons dynamically based on actual count
  const renderMilestoneButtons = () => {
    const buttons = [];
    
    // Add milestone buttons
    for (let i = 1; i <= actualMilestoneCount; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setSelectedMilestone(i)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedMilestone === i
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Milestone {i}
        </button>
      );
    }
    
    // Add Cumulative button
    buttons.push(
      <button
        key="cumulative"
        onClick={() => setSelectedMilestone(0)}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          selectedMilestone === 0
            ? 'bg-green-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Cumulative
      </button>
    );
    
    return buttons;
  };

  // Render milestone table
  const renderMilestoneTable = () => {
    if (!Array.isArray(packageMilestones) || packageMilestones.length === 0) {
      return (
        <tr>
          <td colSpan={selectedMilestone === 0 ? 8 : 10} className="px-6 py-8 text-center text-gray-500">
            No milestone data available
          </td>
        </tr>
      );
    }

    // If Cumulative selected
    if (selectedMilestone === 0) {
      return packageMilestones.map((component: PackageMilestoneComponent, index: number) => {
        const allMilestones = component.milestones || [];
        
        const previousMonthTotal = allMilestones.reduce((sum: number, m: MilestoneData) => 
          sum + (Number(m.previous_month_qty) || 0), 0);
        
        const currentMonthTotal = allMilestones.reduce((sum: number, m: MilestoneData) => 
          sum + (Number(m.current_month_qty) || 0), 0);
        
        const cumulativeTotal = allMilestones.reduce((sum: number, m: MilestoneData) => 
          sum + (Number(m.cumulative_qty) || 0), 0);
        
        const totalQty = Number(component.total_qty) || 0;
        const achievementPercentage = totalQty > 0 ? 
          (cumulativeTotal / totalQty) * 100 : 0;

        return (
          <tr key={component.component_id || index} className="hover:bg-gray-50">
            <td className="px-6 py-4 border text-center">{index + 1}</td>
            <td className="px-6 py-4 border font-medium text-gray-900">
              {component.name}
            </td>
            <td className="px-6 py-4 border text-gray-700 text-center">
              {component.unit}
            </td>
            <td className="px-6 py-4 border text-gray-900 text-right">
              {totalQty.toLocaleString()}
            </td>
            <td className="px-6 py-4 border text-gray-700 text-right">
              {previousMonthTotal.toLocaleString()}
            </td>
            <td className="px-6 py-4 border text-gray-700 text-right">
              {currentMonthTotal.toLocaleString()}
            </td>
            <td className="px-6 py-4 border font-medium text-gray-900 text-right">
              {cumulativeTotal.toLocaleString()}
            </td>
            <td className="px-6 py-4 border">
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${achievementPercentage}%`,
                      backgroundColor:
                        achievementPercentage >= 80
                          ? "#10b981"
                          : achievementPercentage >= 50
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium min-w-[60px]">
                  {achievementPercentage.toFixed(1)}%
                </span>
              </div>
            </td>
          </tr>
        );
      });
    }

    // If specific milestone selected
    return packageMilestones.map((component: PackageMilestoneComponent, index: number) => {
      const milestoneData = component.milestones?.find(
        (m: MilestoneData) => m.milestone_number === selectedMilestone
      );

      if (!milestoneData) return null;

       const getMilestonePercentage = () => {
            const milestoneQty = Number(milestoneData.milestone_qty) || 0;
            const totalQty = Number(component.total_qty) || 0;
              return totalQty > 0 ? (milestoneQty / totalQty) * 100 : 0;
            };
             const milestonePercentage = getMilestonePercentage();
      const milestoneQty = Number(milestoneData.milestone_qty) || 0;
      const achievementPercentage = Number(milestoneData.achievement_percentage) || 0;
      const totalQty = Number(component.total_qty) || 0;

      return (
        <tr key={component.component_id || index} className="hover:bg-gray-50">
          <td className="px-6 py-4 border text-center">{index + 1}</td>
          <td className="px-6 py-4 border font-medium text-gray-900">
            {component.name}
          </td>
          <td className="px-6 py-4 border text-gray-700 text-center">
            {component.unit}
          </td>
          <td className="px-6 py-4 border text-gray-900 text-right">
            {totalQty.toLocaleString()}
          </td>
          <td className="px-6 py-4 border text-center">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {milestonePercentage.toFixed(1)}%
            </span>
          </td>
          <td className="px-6 py-4 border font-medium text-gray-900 text-right">
            {milestoneQty.toLocaleString()}
          </td>
          <td className="px-6 py-4 border text-gray-700 text-right">
            {(Number(milestoneData.previous_month_qty) || 0).toLocaleString()}
          </td>
          <td className="px-6 py-4 border text-gray-700 text-right">
            {(Number(milestoneData.current_month_qty) || 0).toLocaleString()}
          </td>
          <td className="px-6 py-4 border font-medium text-gray-900 text-right">
            {(Number(milestoneData.cumulative_qty) || 0).toLocaleString()}
          </td>
          <td className="px-6 py-4 border">
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${achievementPercentage}%`,
                    backgroundColor:
                      achievementPercentage >= 80
                        ? "#10b981"
                        : achievementPercentage >= 50
                        ? "#f59e0b"
                        : "#ef4444",
                  }}
                ></div>
              </div>
              <span className="text-sm font-medium min-w-[60px]">
                {achievementPercentage.toFixed(1)}%
              </span>
              </div>
            </td>
          </tr>
        );
      }).filter(Boolean);
  };

  const milestoneCardsData = () => {
    if (!Array.isArray(packageMilestones) || packageMilestones.length === 0) return [];
    
    const milestoneCards: any[] = [];
    
    for (let milestoneNum = 1; milestoneNum <= actualMilestoneCount; milestoneNum++) {
      const allMilestones: MilestoneData[] = packageMilestones.flatMap((comp: PackageMilestoneComponent) => 
        (comp.milestones?.filter((m: MilestoneData) => m.milestone_number === milestoneNum) || [])
      );
      
      if (allMilestones.length === 0) continue;
      
      const totalQty = allMilestones.reduce((sum: number, m: MilestoneData) => sum + (Number(m.milestone_qty) || 0), 0);
      const completedQty = allMilestones.reduce((sum: number, m: MilestoneData) => sum + (Number(m.cumulative_qty) || 0), 0);
      const achievementPercentage = totalQty > 0 ? (completedQty / totalQty) * 100 : 0;
      
      let status = "Not Started";
      if (achievementPercentage >= 100) {
        status = "Completed";
      } else if (achievementPercentage > 0) {
        status = "In Progress";
      }
      
      milestoneCards.push({
        milestone_number: milestoneNum,
        milestone_name: `Milestone-${milestoneNum}`,
        total_qty: totalQty,
        completed_qty: completedQty,
        achievement_percentage: achievementPercentage,
        status: status
      });
    }
    
    return milestoneCards;
  };

  if (worksLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* Header with close button for embedded view */}
      {onClose && (
        <div className="flex justify-between items-center mb-6">
          {/* <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Milestone Progress Dashboard</h1>
            <p className="text-gray-600">
              {workName && `Work: ${workName}`} {contractorName && `| Contractor: ${contractorName}`}
            </p>
          </div> */}
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
            Close
          </button>
        </div>
      )}

      {!selectedPackage ? (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Milestone Progress Dashboard</h1>
            <p className="text-gray-600">Track and manage project milestones efficiently</p>
          </div>

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
                  value={searchPackage}
                  onChange={(e) => setSearchPackage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contractor Name
                </label>
                <input
                  type="text"
                  placeholder="Enter contractor name..."
                  value={searchContractor}
                  onChange={(e) => setSearchContractor(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto border rounded-md shadow-sm">
               <table className="w-full border-collapse shadow-sm">
               <thead>
                 <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <th className="border p-2 whitespace-nowrap">Package No.</th>
                  <th className="border p-2">Work Name</th>
                  <th className="border p-2 whitespace-nowrap">Agency Name</th>
                  <th className="border p-2">Agreement Number</th>
                  <th className="border p-2">Action</th>
                </tr>
              </thead>
                <tbody>
                  {filteredWorks.length > 0 ? (
                    filteredWorks.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                          <td className="border p-2">{row.package_number}</td>
                         <td className="border p-2">{row.work_name}</td>
                         <td className="border p-2">{row.contractor_name}</td>
                         <td className="border p-2">{row.agreement_no}</td>
                        <td className="px-6 py-4 text-center">
                          <button className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 group overflow-hidden"
                            onClick={() => setSelectedPackage(row.package_number)}
                            title="View Details"
                          >
                             <div className="relative z-10 flex items-center gap-2">
                          <Eye className="w-3 h-3" />
                         
                        </div>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <div className="text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="mt-2">No projects found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Back button (only show if not in embedded mode) */}
          {!onClose && (
          <div className="mb-6">
             <button
              onClick={() => setSelectedPackage(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
                   ⬅ Back
            </button>
          </div>
          )}

          {selectedWork && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-blue-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">Work Details</h3>
                  <p className="text-gray-700 mb-1">
                    <span className="font-bold">Package No.:</span> {selectedWork.package_number}
                  </p>
                  <p className="text-gray-700">
                    {selectedWork.work_name}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">Contractor</h3>
                  <p className="text-gray-700 mb-1">
                    <span className="font-bold">Contractor Name:</span> {selectedWork.contractor_name}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-bold">Agreement No:</span> {selectedWork.agreement_no}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">Financial</h3>
                  <p className="text-gray-700 mb-1">
                    <span className="font-bold">Contract Value (Cr.):</span> 
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    ₹{selectedWork.contract_awarded_amount}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">Timeline</h3>
                  <p className="text-gray-700">
                    <span className="font-bold">Start Date of Work:</span> {selectedWork.work_commencement_date}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-bold">Stipulated Date of Work:</span> {selectedWork.work_stipulated_date}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold text-gray-800">Milestone Progress</h3>
              
              <div className="flex gap-2 flex-wrap">
                {renderMilestoneButtons()}
              </div>
            </div>

            <div className="flex items-center gap-3">
             {canAddProgress() && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add Progress
              </button>
              )}
              <div className="relative download-menu">
                <button
                  onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  Download
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showDownloadOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
                    <button
                      onClick={() => handleDownload("pdf")}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      <div className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded">
                        📄
                      </div>
                      <div>
                        <div className="font-medium">PDF Report</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDownload("excel")}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded">
                        📊
                      </div>
                      <div>
                        <div className="font-medium">Excel Report</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 h-full">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Progress Overview</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="total"
                        name="Total Quantity"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="cumulative"
                        name="Cumulative"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="current"
                        name="Current Month"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {milestoneCardsData().map((milestone) => (
                <div
                  key={milestone.milestone_number}
                  className="bg-white rounded-xl shadow-lg p-5 border-l-4"
                  style={{
                    borderLeftColor:
                      milestone.status === "Completed"
                        ? "#10b981"
                        : milestone.status === "In Progress"
                        ? "#f59e0b"
                        : "#ef4444",
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-semibold text-gray-800">{milestone.milestone_name}</h5>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        milestone.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : milestone.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {milestone.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${milestone.achievement_percentage}%`,
                          backgroundColor:
                            milestone.achievement_percentage >= 80
                              ? "#10b981"
                              : milestone.achievement_percentage >= 50
                              ? "#f59e0b"
                              : "#ef4444",
                        }}
                      ></div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      {milestone.achievement_percentage.toFixed(1)}% Complete
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Excel जैसा टेबल लेआउट */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            {/* Header - एक्सेल की तरह */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-bold">
                  Bihar Water Security & Irrigation Modernisation Project
                </div>
                <div className="text-sm text-gray-600">
                  Package: {selectedPackage} | Contractor: {selectedWork?.contractor_name}
                </div>
              </div>
              <h4 className="text-lg font-bold text-gray-800">
                {selectedMilestone === 0 
                  ? "CUMULATIVE PROGRESS" 
                  : `PHYSICAL PROGRESS - MILESTONE ${selectedMilestone}`}
              </h4>
            </div>

            {/* Table - एक्सेल स्टाइल */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-t border-b border-gray-300">
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-300">
                      Sno
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                      Item of the Work
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-300">
                      Unit
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-r border-gray-300">
                      Total Quantity
                    </th>
                    
                    {selectedMilestone > 0 && (
                      <>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-300">
                          % of Milestone as per Agreement
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-r border-gray-300">
                          Qty as per Milestone
                        </th>
                      </>
                    )}
                    
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-r border-gray-300">
                      Previous Month
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-r border-gray-300">
                      Current Month
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-r border-gray-300">
                      Cumulative
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Achieved %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {renderMilestoneTable()}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Progress Modal */}
      <AddProgressForm
        showModal={showModal}
        setShowModal={setShowModal}
        onAddProgress={handleAddProgress}
        components={formattedComponents}
        selectedPackage={selectedPackage}
        selectedMilestone={selectedMilestone}
        packageMilestones={packageMilestones}
      />
    </div>
  );
}