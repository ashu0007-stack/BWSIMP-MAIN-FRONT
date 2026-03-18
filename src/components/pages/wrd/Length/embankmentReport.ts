// embankmentReport.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface EmbankmentProgressEntry {
  id?: number;
  start_km: number;
  end_km: number;
  embankment_done_km: number;
  date: string | null;
  created_by?: string;
}

interface EmbankmentReportProps {
  selectedPackage: string | null;
  selectedWork: any;
  works: any[];
  targetKm: number;
  totalEmbankment: number;
  progressEntries: EmbankmentProgressEntry[];
}

// ✅ PDF Report Generator for Embankment
export const downloadEmbankmentPDF = ({
  selectedPackage,
  selectedWork,
  works,
  targetKm,
  totalEmbankment,
  progressEntries
}: EmbankmentReportProps) => {
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(0, 48, 135); // #003087
  doc.text("Embankment Progress Report", pageWidth / 2, 20, { align: "center" });
  
  // Package Info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Package: ${selectedPackage || 'N/A'}`, 14, 35);
  doc.text(`Work: ${selectedWork?.work_name || 'N/A'}`, 14, 42);
  doc.text(`Agency: ${selectedWork?.contractor_name || 'N/A'}`, 14, 49);
  
  // Target Info
  doc.text(`Target Length: ${targetKm} Km`, 14, 60);
  doc.text(`Total Embankment Done: ${totalEmbankment.toFixed(2)} Km`, 14, 67);
  doc.text(`Remaining: ${(targetKm - totalEmbankment).toFixed(2)} Km`, 14, 74);
  doc.text(`Progress: ${targetKm > 0 ? ((totalEmbankment / targetKm) * 100).toFixed(2) : 0}%`, 14, 81);
  
  // Table
  const tableColumn = ["S.No.", "Start KM", "End KM", "Length (KM)", "Embankment Done (KM)", "Date"];
  const tableRows: any[][] = [];
  
  progressEntries.forEach((entry, index) => {
    const length = (entry.end_km - entry.start_km).toFixed(2);
    tableRows.push([
      index + 1,
      entry.start_km.toFixed(2),
      entry.end_km.toFixed(2),
      length,
      entry.embankment_done_km.toFixed(2),
      entry.date ? new Date(entry.date).toLocaleDateString() : '-'
    ]);
  });
  
  if (progressEntries.length === 0) {
    tableRows.push(["", "", "", "", "No data available", ""]);
  }
  
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 90,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [128, 0, 128] } // Purple color for embankment
  });
  
  // Save PDF
  doc.save(`embankment_report_${selectedPackage || 'package'}.pdf`);
};

// ✅ Excel Report Generator for Embankment
export const downloadEmbankmentExcel = async ({
  selectedPackage,
  selectedWork,
  works,
  targetKm,
  totalEmbankment,
  progressEntries
}: EmbankmentReportProps) => {
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  
  // Summary Sheet
  const summaryData = [
    ["Embankment Progress Report"],
    [],
    ["Package Number", selectedPackage || 'N/A'],
    ["Work Name", selectedWork?.work_name || 'N/A'],
    ["Agency Name", selectedWork?.contractor_name || 'N/A'],
    ["Target Length (KM)", targetKm],
    ["Total Embankment Done (KM)", totalEmbankment.toFixed(2)],
    ["Remaining (KM)", (targetKm - totalEmbankment).toFixed(2)],
    ["Progress Percentage", `${targetKm > 0 ? ((totalEmbankment / targetKm) * 100).toFixed(2) : 0}%`],
    ["Total Entries", progressEntries.length],
    [],
    ["Generated On", new Date().toLocaleString()]
  ];
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");
  
  // Details Sheet
  const detailsData = [
    ["S.No.", "Start KM", "End KM", "Length (KM)", "Embankment Done (KM)", "Date", "Created By"]
  ];
  
  progressEntries.forEach((entry, index) => {
    const length = (entry.end_km - entry.start_km).toFixed(2);
    detailsData.push([
      `${index + 1}`,
      entry.start_km.toFixed(2),
      entry.end_km.toFixed(2),
      length,
      entry.embankment_done_km.toFixed(2),
      entry.date ? new Date(entry.date).toLocaleDateString() : '-',
      entry.created_by || 'System'
    ]);
  });
  
  const detailsWs = XLSX.utils.aoa_to_sheet(detailsData);
  XLSX.utils.book_append_sheet(wb, detailsWs, "Details");
  
  // Save Excel
  XLSX.writeFile(wb, `embankment_report_${selectedPackage || 'package'}.xlsx`);
};

// ✅ Custom hook for embankment report
export const useEmbankmentReportGenerator = (props: EmbankmentReportProps) => {
  return {
    downloadEmbankmentPDF: () => downloadEmbankmentPDF(props),
    downloadEmbankmentExcel: () => downloadEmbankmentExcel(props)
  };
};