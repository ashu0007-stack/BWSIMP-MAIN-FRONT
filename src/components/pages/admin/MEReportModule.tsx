"use client";

import { useState, useRef } from "react";
import {
  FileText,
  X,
  Calendar,
  Layers,
  BarChart3,
  CheckCircle,
  Copy,
  FileDown,
  FileOutput,
  RefreshCw,
  Mail,
  Share2,
  Maximize2,
  AwardIcon,
  Target,
  Users,
  Droplets,
  Download,
  Printer,
  PieChart as PieChartIcon,
  Globe,
  Users2,
  Activity,
  DollarSign,
  AlertCircle,
  Minus,
  MapPin,
  Info
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Types
interface Indicator {
  id: number;
  name: string;
  category: string;
  unit: string;
  target: string | number;
  baseline: string | number;
  current: string | number;
  cumulative: string | number;
  percentage: string | number;
  subcomponent?: string;
  frequency?: string;
  data_source?: string;
  responsible_agency?: string;
  component_name?: string;
  achievements?: string;
  challenges?: string;
  recommendations?: string;
}

interface PDOIndicator {
  id: number;
  name: string;
  category: "PDO1" | "PDO2";
  unit: "Hectare" | "People";
  target: number;
  baseline: number;
  current: number;
  cumulative: number;
  percentage: number;
  achievements?: string;
  challenges?: string;
}

interface ReportData {
  generatedOn: Date;
  period: string;
  reportType: 'quarterly' | 'half-yearly' | 'yearly';
  quarter?: number;
  year: number;
  overallProgress: number;
  pdoProgress: { pdo1: number; pdo2: number };
  intermediateProgress: { excellent: number; onTrack: number; behind: number };
  pbcProgress: { achieved: number; partial: number; notStarted: number };
  topPerformers: Indicator[];
  needAttention: Indicator[];
  summary: string;
  recommendations: string[];
  achievements: string[];
  challenges: string[];
  financialProgress?: {
    totalBudget: number;
    expended: number;
    percentage: number;
  };
  genderStats?: {
    femaleBeneficiaries: number;
    youthBeneficiaries: number;
    femaleTarget: number;
    youthTarget: number;
  };
  componentProgress?: Array<{
    name: string;
    progress: number;
    indicators: number;
  }>;
}

type ReportType = 'quarterly' | 'half-yearly' | 'yearly';

interface MEReportModuleProps {
  onClose: () => void;
  indicators: Indicator[];
  pdoIndicators: PDOIndicator[];
  summary: any;
  mainIndicators: any[];
  pbcIndicators: Indicator[];
  progressData: any[];
  pbcProgressData: any[];
  totalAreaPercentage: number;
  totalPeoplePercentage: number;
  totalAreaTarget: number;
  totalAreaAchieved: number;
  totalPeopleTarget: number;
  totalPeopleAchieved: number;
  irrigationAreaIndicator?: PDOIndicator;
  floodAreaIndicator?: PDOIndicator;
  irrigationPeopleIndicator?: PDOIndicator;
  floodPeopleIndicator?: PDOIndicator;
}

export default function MEReportModule({
  onClose,
  indicators,
  pdoIndicators,
  summary,
  mainIndicators,
  pbcIndicators,
  progressData,
  pbcProgressData,
  totalAreaPercentage,
  totalPeoplePercentage,
  totalAreaTarget,
  totalAreaAchieved,
  totalPeopleTarget,
  totalPeopleAchieved,
  irrigationAreaIndicator,
  floodAreaIndicator,
  irrigationPeopleIndicator,
  floodPeopleIndicator
}: MEReportModuleProps) {
  const reportContentRef = useRef<HTMLDivElement>(null);
  
  // Report State
  const [reportType, setReportType] = useState<ReportType>('quarterly');
  const [reportYear, setReportYear] = useState<number>(new Date().getFullYear());
  const [reportQuarter, setReportQuarter] = useState<number>(Math.floor((new Date().getMonth() / 3) + 1));
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Helper functions
  const formatNumber = (val: string | number | undefined): string => {
    if (!val && val !== 0) return "0";
    return Number(val).toLocaleString('en-IN');
  };

  const formatPercentage = (val: string | number | undefined): string => {
    if (!val && val !== 0) return "0.0";
    return Number(val).toFixed(1);
  };

  const getPDOTarget = (indicator: PDOIndicator | undefined): number => {
    if (!indicator) return 0;
    return Number(indicator.target || 0);
  };

  const getPDOCumulative = (indicator: PDOIndicator | undefined): number => {
    if (!indicator) return 0;
    return Number(indicator.cumulative || 0);
  };

  // Generate comprehensive report data
  const generateReportData = (type: ReportType, year: number, quarter?: number): ReportData => {
    // Calculate period based on type
    let period = '';
    if (type === 'quarterly' && quarter) {
      const quarterNames = ['Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec'];
      period = `Q${quarter} (${quarterNames[quarter-1]}) ${year}`;
    } else if (type === 'half-yearly') {
      period = `H1 ${year}`;
    } else {
      period = `Annual Report ${year}`;
    }

    // Top performers (>=75%)
    const topPerformers = mainIndicators
      .filter((i: any) => Number(i?.percentage) >= 75)
      .sort((a: any, b: any) => Number(b?.percentage) - Number(a?.percentage))
      .slice(0, 5) as Indicator[];

    // Need attention (<40%)
    const needAttention = mainIndicators
      .filter((i: any) => Number(i?.percentage) < 40)
      .sort((a: any, b: any) => Number(a?.percentage) - Number(b?.percentage))
      .slice(0, 5) as Indicator[];

    // Generate achievements
    const achievements = [];
    if (progressData[0].count > 0) {
      achievements.push(`${progressData[0].count} intermediate indicators achieved excellent progress (>75%)`);
    }
    if (pbcProgressData[0].count > 0) {
      achievements.push(`${pbcProgressData[0].count} PBCs fully achieved`);
    }
    if (totalAreaPercentage >= 50) {
      achievements.push(`PDO1 (Area) achieved ${formatPercentage(totalAreaPercentage)}% of target`);
    }
    if (totalPeoplePercentage >= 50) {
      achievements.push(`PDO2 (People) achieved ${formatPercentage(totalPeoplePercentage)}% of target`);
    }

    // Generate challenges
    const challenges = [];
    if (progressData[2].count > 0) {
      challenges.push(`${progressData[2].count} intermediate indicators are behind schedule (<40%)`);
    }
    if (pbcProgressData[2].count > 0) {
      challenges.push(`${pbcProgressData[2].count} PBCs not yet started`);
    }
    if (totalAreaPercentage < 40) {
      challenges.push(`PDO1 (Area) progress is critically low at ${formatPercentage(totalAreaPercentage)}%`);
    }
    if (totalPeoplePercentage < 40) {
      challenges.push(`PDO2 (People) progress is critically low at ${formatPercentage(totalPeoplePercentage)}%`);
    }

    // Generate summary
    const overallPercent = Number(summary?.overallPercentage || 0);
    let summaryText = '';
    
    if (overallPercent >= 70) {
      summaryText = `Project is progressing excellently during ${period} with strong performance across most indicators. Key achievements include ${achievements.slice(0,2).join(' and ')}.`;
    } else if (overallPercent >= 50) {
      summaryText = `Project is on track during ${period} with good progress, though some areas need attention. Focus required on ${challenges.slice(0,2).join(' and ')}.`;
    } else {
      summaryText = `Project progress during ${period} is slower than expected. Immediate attention required for lagging indicators including ${challenges.slice(0,2).join(' and ')}.`;
    }

    // Generate recommendations based on report type
    const recommendations = [];
    
    if (type === 'quarterly') {
      recommendations.push('Focus on quarterly targets for the next quarter');
      if (needAttention.length > 0) {
        recommendations.push(`Develop action plans for ${needAttention.length} indicators that are behind schedule`);
      }
      recommendations.push('Conduct review meetings with PIUs for lagging components');
    } else if (type === 'half-yearly') {
      recommendations.push('Review semi-annual targets and adjust implementation strategies');
      recommendations.push('Strengthen M&E data collection and verification processes');
      if (pbcProgressData[2].count > 0) {
        recommendations.push('Accelerate PBC implementation to meet annual targets');
      }
    } else {
      recommendations.push('Document lessons learned and best practices for next year');
      recommendations.push('Update annual work plans based on performance gaps');
      recommendations.push('Strengthen capacity building for staff and stakeholders');
    }

    if (totalAreaPercentage < 50) {
      recommendations.push('Accelerate irrigation and flood protection infrastructure delivery');
    }
    
    if (totalPeoplePercentage < 50) {
      recommendations.push('Enhance beneficiary outreach and awareness programs');
    }

    // Component progress
    const componentProgress = [
      { name: 'Component 1', progress: totalAreaPercentage, indicators: 7 },
      { name: 'Component 2', progress: totalAreaPercentage, indicators: 1 },
      { name: 'Component 3', progress: pbcProgressData[0].count * 25, indicators: 4 }
    ];

    return {
      generatedOn: new Date(),
      period,
      reportType: type,
      quarter,
      year,
      overallProgress: overallPercent,
      pdoProgress: {
        pdo1: totalAreaPercentage,
        pdo2: totalPeoplePercentage
      },
      intermediateProgress: {
        excellent: progressData[0].count,
        onTrack: progressData[1].count,
        behind: progressData[2].count
      },
      pbcProgress: {
        achieved: pbcProgressData[0].count,
        partial: pbcProgressData[1].count,
        notStarted: pbcProgressData[2].count
      },
      topPerformers,
      needAttention,
      summary: summaryText,
      recommendations,
      achievements,
      challenges,
      financialProgress: {
        totalBudget: 250000000,
        expended: 157500000,
        percentage: 63
      },
      genderStats: {
        femaleBeneficiaries: Math.round(totalPeopleAchieved * 0.49),
        youthBeneficiaries: Math.round(totalPeopleAchieved * 0.29),
        femaleTarget: Math.round(totalPeopleTarget * 0.49),
        youthTarget: Math.round(totalPeopleTarget * 0.29)
      },
      componentProgress
    };
  };

  // Generate PDF Report
  const generatePDFReport = async (type: ReportType, year: number, quarter?: number) => {
    setIsGeneratingReport(true);
    
    try {
      const reportData = generateReportData(type, year, quarter);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add custom fonts and colors
      const primaryColor = [0, 48, 135]; // #003087
      const secondaryColor = [16, 185, 129]; // #10B981
      const accentColor = [139, 92, 246]; // #8B5CF6
      const textColor = [51, 51, 51];
      const lightGray = [245, 245, 245];

      // Helper function to add header
      const addHeader = (pageNumber?: number) => {
        // Add logo placeholder
        pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.rect(20, 15, 30, 30, 'F');
        
        pdf.setFontSize(20);
        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Bihar Water Security Project', 55, 30);
        
        pdf.setFontSize(12);
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
        pdf.setFont('helvetica', 'normal');
        pdf.text('M&E Performance Report', 55, 38);
        
        pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.setLineWidth(0.5);
        pdf.line(20, 48, 190, 48);
        
        if (pageNumber) {
          pdf.setFontSize(8);
          pdf.setTextColor(150, 150, 150);
          pdf.text(`Page ${pageNumber}`, 180, 285);
        }
      };

      // Helper function to add footer
      const addFooter = (pageNumber: number) => {
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.1);
        pdf.line(20, 270, 190, 270);
        
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Generated on: ${reportData.generatedOn.toLocaleDateString('en-IN', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`, 20, 277);
        
        pdf.text(`Report ID: M&E-${type}-${year}${quarter ? `-Q${quarter}` : ''}`, 20, 282);
        pdf.text(`Page ${pageNumber}`, 180, 282);
      };

      // Cover Page
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(0, 0, 210, 297, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('M&E PERFORMANCE', 105, 100, { align: 'center' });
      pdf.text('REPORT', 105, 120, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text(reportData.period, 105, 160, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.text('Bihar Water Security and', 105, 190, { align: 'center' });
      pdf.text('Irrigation Modernization Project', 105, 200, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text('Government of Bihar', 105, 230, { align: 'center' });
      pdf.text('World Bank Funded Project', 105, 240, { align: 'center' });
      
      pdf.addPage();

      // Table of Contents
      let pageNumber = 2;
      addHeader(pageNumber);
      
      pdf.setFontSize(16);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Table of Contents', 20, 60);
      
      pdf.setFontSize(11);
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.setFont('helvetica', 'normal');
      
      const tocItems = [
        { title: 'Executive Summary', page: 3 },
        { title: 'PDO Indicators Performance', page: 4 },
        { title: 'Intermediate Indicators', page: 5 },
        { title: 'PBC Indicators', page: 6 },
        { title: 'Gender & Youth Analysis', page: 7 },
        { title: 'Component-wise Progress', page: 8 },
        { title: 'Financial Progress', page: 9 },
        { title: 'Top Performers', page: 10 },
        { title: 'Indicators Needing Attention', page: 11 },
        { title: 'Challenges & Recommendations', page: 12 },
        { title: 'Annexures', page: 13 }
      ];
      
      let yPos = 70;
      tocItems.forEach(item => {
        pdf.text(item.title, 25, yPos);
        pdf.text(item.page.toString(), 180, yPos, { align: 'right' });
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.1);
        pdf.line(20, yPos + 1, 190, yPos + 1);
        yPos += 8;
      });
      
      addFooter(pageNumber);
      pdf.addPage();
      pageNumber++;

      // Executive Summary
      addHeader(pageNumber);
      
      pdf.setFontSize(18);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Executive Summary', 20, 60);
      
      pdf.setFontSize(11);
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.setFont('helvetica', 'normal');
      
      const summaryLines = pdf.splitTextToSize(reportData.summary, 170);
      pdf.text(summaryLines, 20, 70);
      
      // Key Metrics Box
      pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.roundedRect(20, 90, 170, 50, 3, 3, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text('Key Performance Metrics', 25, 100);
      
      pdf.setFontSize(10);
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.setFont('helvetica', 'normal');
      
      pdf.text(`Overall Progress: ${reportData.overallProgress.toFixed(1)}%`, 25, 110);
      pdf.text(`PDO1 (Area): ${reportData.pdoProgress.pdo1.toFixed(1)}%`, 25, 117);
      pdf.text(`PDO2 (People): ${reportData.pdoProgress.pdo2.toFixed(1)}%`, 25, 124);
      pdf.text(`Reporting Period: ${reportData.period}`, 25, 131);
      
      pdf.text(`Intermediate Indicators: ${reportData.intermediateProgress.excellent} Excellent, ${reportData.intermediateProgress.onTrack} On Track, ${reportData.intermediateProgress.behind} Behind`, 80, 110);
      pdf.text(`PBC Status: ${reportData.pbcProgress.achieved} Achieved, ${reportData.pbcProgress.partial} Partial, ${reportData.pbcProgress.notStarted} Not Started`, 80, 117);
      
      // Progress Chart ASCII representation (simplified)
      const chartY = 150;
      pdf.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      pdf.roundedRect(20, chartY, (reportData.pdoProgress.pdo1 / 100) * 50, 5, 1, 1, 'F');
      pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      pdf.roundedRect(80, chartY, (reportData.pdoProgress.pdo2 / 100) * 50, 5, 1, 1, 'F');
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.roundedRect(140, chartY, (reportData.overallProgress / 100) * 50, 5, 1, 1, 'F');
      
      pdf.setFontSize(8);
      pdf.text('PDO1', 20, chartY - 2);
      pdf.text('PDO2', 80, chartY - 2);
      pdf.text('Overall', 140, chartY - 2);
      
      addFooter(pageNumber);
      pdf.addPage();
      pageNumber++;

      // PDO Indicators Table
      addHeader(pageNumber);
      
      pdf.setFontSize(18);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PDO Indicators Performance', 20, 60);
      
      // PDO Table
      autoTable(pdf, {
        startY: 70,
        head: [['Indicator', 'Target', 'Achieved', 'Progress', 'Status']],
        body: [
          ['Irrigation Area (Ha)', 
           formatNumber(irrigationAreaIndicator?.target), 
           formatNumber(irrigationAreaIndicator?.cumulative),
           `${formatPercentage(irrigationAreaIndicator?.percentage)}%`,
           Number(irrigationAreaIndicator?.percentage) >= 75 ? 'Excellent' : 
           Number(irrigationAreaIndicator?.percentage) >= 40 ? 'On Track' : 'Behind'],
          ['Flood Area (Ha)', 
           formatNumber(floodAreaIndicator?.target), 
           formatNumber(floodAreaIndicator?.cumulative),
           `${formatPercentage(floodAreaIndicator?.percentage)}%`,
           Number(floodAreaIndicator?.percentage) >= 75 ? 'Excellent' : 
           Number(floodAreaIndicator?.percentage) >= 40 ? 'On Track' : 'Behind'],
          ['Irrigation People', 
           formatNumber(irrigationPeopleIndicator?.target), 
           formatNumber(irrigationPeopleIndicator?.cumulative),
           `${formatPercentage(irrigationPeopleIndicator?.percentage)}%`,
           Number(irrigationPeopleIndicator?.percentage) >= 75 ? 'Excellent' : 
           Number(irrigationPeopleIndicator?.percentage) >= 40 ? 'On Track' : 'Behind'],
          ['Flood Protection People', 
           formatNumber(floodPeopleIndicator?.target), 
           formatNumber(floodPeopleIndicator?.cumulative),
           `${formatPercentage(floodPeopleIndicator?.percentage)}%`,
           Number(floodPeopleIndicator?.percentage) >= 75 ? 'Excellent' : 
           Number(floodPeopleIndicator?.percentage) >= 40 ? 'On Track' : 'Behind']
        ],
        theme: 'striped',
        headStyles: { fillColor: [0, 48, 135], textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 25, halign: 'right' },
          2: { cellWidth: 25, halign: 'right' },
          3: { cellWidth: 25, halign: 'right' },
          4: { cellWidth: 25, halign: 'center' }
        }
      });

      // PDO Summary
      pdf.setFontSize(14);
      pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PDO Summary', 20, (pdf as any).lastAutoTable.finalY + 15);
      
      pdf.setFontSize(10);
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.setFont('helvetica', 'normal');
      
      pdf.text(`Total Area Target: ${formatNumber(totalAreaTarget)} Ha`, 20, (pdf as any).lastAutoTable.finalY + 25);
      pdf.text(`Total Area Achieved: ${formatNumber(totalAreaAchieved)} Ha`, 20, (pdf as any).lastAutoTable.finalY + 32);
      pdf.text(`Area Progress: ${formatPercentage(totalAreaPercentage)}%`, 20, (pdf as any).lastAutoTable.finalY + 39);
      
      pdf.text(`Total People Target: ${formatNumber(totalPeopleTarget)}`, 120, (pdf as any).lastAutoTable.finalY + 25);
      pdf.text(`Total People Achieved: ${formatNumber(totalPeopleAchieved)}`, 120, (pdf as any).lastAutoTable.finalY + 32);
      pdf.text(`People Progress: ${formatPercentage(totalPeoplePercentage)}%`, 120, (pdf as any).lastAutoTable.finalY + 39);
      
      addFooter(pageNumber);
      pdf.addPage();
      pageNumber++;

      // Intermediate Indicators Table
      addHeader(pageNumber);
      
      pdf.setFontSize(18);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Intermediate Indicators', 20, 60);
      
      const intermediateBody = mainIndicators.map((ind: any) => [
        ind.name?.substring(0, 40) + (ind.name?.length > 40 ? '...' : ''),
        formatNumber(ind.target),
        formatNumber(ind.cumulative),
        `${formatPercentage(ind.percentage)}%`,
        Number(ind.percentage) >= 75 ? 'Excellent' : 
        Number(ind.percentage) >= 40 ? 'On Track' : 'Behind'
      ]);
      
      autoTable(pdf, {
        startY: 70,
        head: [['Indicator', 'Target', 'Achieved', 'Progress', 'Status']],
        body: intermediateBody,
        theme: 'striped',
        headStyles: { fillColor: [0, 48, 135], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 20, halign: 'right' },
          2: { cellWidth: 20, halign: 'right' },
          3: { cellWidth: 20, halign: 'right' },
          4: { cellWidth: 20, halign: 'center' }
        }
      });
      
      addFooter(pageNumber);
      pdf.addPage();
      pageNumber++;

      // PBC Indicators
      addHeader(pageNumber);
      
      pdf.setFontSize(18);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Performance Based Conditions (PBC)', 20, 60);
      
      const pbcBody = pbcIndicators.map((ind: Indicator, index: number) => [
        `PBC ${String.fromCharCode(65 + index)}`,
        ind.name?.substring(0, 40) + (ind.name?.length > 40 ? '...' : ''),
        `${formatPercentage(ind.percentage)}%`,
        Number(ind.percentage) >= 100 ? 'Achieved' : 
        Number(ind.percentage) > 0 ? 'In Progress' : 'Not Started'
      ]);
      
      autoTable(pdf, {
        startY: 70,
        head: [['PBC ID', 'Description', 'Progress', 'Status']],
        body: pbcBody,
        theme: 'striped',
        headStyles: { fillColor: [0, 48, 135], textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 100 },
          2: { cellWidth: 25, halign: 'right' },
          3: { cellWidth: 25, halign: 'center' }
        }
      });
      
      addFooter(pageNumber);
      pdf.addPage();
      pageNumber++;

      // Gender & Youth Analysis
      addHeader(pageNumber);
      
      pdf.setFontSize(18);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Gender & Youth Analysis', 20, 60);
      
      pdf.setFontSize(12);
      pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Beneficiary Breakdown', 20, 70);
      
      // Gender table
      autoTable(pdf, {
        startY: 75,
        head: [['Category', 'Target', 'Achieved', 'Progress']],
        body: [
          ['Women', 
           formatNumber(reportData.genderStats?.femaleTarget), 
           formatNumber(reportData.genderStats?.femaleBeneficiaries),
           `${((reportData.genderStats?.femaleBeneficiaries || 0) / (reportData.genderStats?.femaleTarget || 1) * 100).toFixed(1)}%`],
          ['Youth', 
           formatNumber(reportData.genderStats?.youthTarget), 
           formatNumber(reportData.genderStats?.youthBeneficiaries),
           `${((reportData.genderStats?.youthBeneficiaries || 0) / (reportData.genderStats?.youthTarget || 1) * 100).toFixed(1)}%`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30, halign: 'right' },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 30, halign: 'right' }
        }
      });
      
      // Gender insights
      pdf.setFontSize(10);
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.setFont('helvetica', 'normal');
      
      const femaleProgress = ((reportData.genderStats?.femaleBeneficiaries || 0) / (reportData.genderStats?.femaleTarget || 1) * 100);
      const youthProgress = ((reportData.genderStats?.youthBeneficiaries || 0) / (reportData.genderStats?.youthTarget || 1) * 100);
      
      pdf.text(`Women represent approximately 49% of total beneficiaries with ${femaleProgress.toFixed(1)}% of target achieved.`, 20, (pdf as any).lastAutoTable.finalY + 10);
      pdf.text(`Youth represent approximately 29% of total beneficiaries with ${youthProgress.toFixed(1)}% of target achieved.`, 20, (pdf as any).lastAutoTable.finalY + 17);
      
      addFooter(pageNumber);
      pdf.addPage();
      pageNumber++;

      // Component Progress
      addHeader(pageNumber);
      
      pdf.setFontSize(18);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Component-wise Progress', 20, 60);
      
      const componentBody = reportData.componentProgress?.map(comp => [
        comp.name,
        comp.indicators.toString(),
        `${comp.progress.toFixed(1)}%`,
        comp.progress >= 70 ? 'Good' : comp.progress >= 40 ? 'Moderate' : 'Critical'
      ]) || [];
      
      autoTable(pdf, {
        startY: 70,
        head: [['Component', 'Indicators', 'Progress', 'Status']],
        body: componentBody,
        theme: 'striped',
        headStyles: { fillColor: [0, 48, 135], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 30, halign: 'center' }
        }
      });
      
      addFooter(pageNumber);
      pdf.addPage();
      pageNumber++;

      // Financial Progress
      addHeader(pageNumber);
      
      pdf.setFontSize(18);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Financial Progress', 20, 60);
      
      if (reportData.financialProgress) {
        pdf.setFontSize(12);
        pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Budget Utilization', 20, 70);
        
        autoTable(pdf, {
          startY: 75,
          head: [['Description', 'Amount (US$)', 'Percentage']],
          body: [
            ['Total Budget', `$${formatNumber(reportData.financialProgress.totalBudget)}`, '100%'],
            ['Expended', `$${formatNumber(reportData.financialProgress.expended)}`, `${reportData.financialProgress.percentage}%`],
            ['Balance', `$${formatNumber(reportData.financialProgress.totalBudget - reportData.financialProgress.expended)}`, `${(100 - reportData.financialProgress.percentage).toFixed(1)}%`]
          ],
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129], textColor: 255 },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 40, halign: 'right' },
            2: { cellWidth: 30, halign: 'right' }
          }
        });
        
        // Financial progress bar
        const barY = (pdf as any).lastAutoTable.finalY + 10;
        pdf.setDrawColor(200, 200, 200);
        pdf.setFillColor(240, 240, 240);
        pdf.roundedRect(20, barY, 150, 10, 2, 2, 'FD');
        
        pdf.setFillColor(16, 185, 129);
        pdf.roundedRect(20, barY, (reportData.financialProgress.percentage / 100) * 150, 10, 2, 2, 'F');
        
        pdf.setFontSize(8);
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
        pdf.text(`Expenditure: ${reportData.financialProgress.percentage}%`, 20, barY - 2);
      }
      
      addFooter(pageNumber);
      pdf.addPage();
      pageNumber++;

      // Top Performers
      addHeader(pageNumber);
      
      pdf.setFontSize(18);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Top Performing Indicators', 20, 60);
      
      if (reportData.topPerformers.length > 0) {
        const topBody = reportData.topPerformers.map(ind => [
          ind.name?.substring(0, 45) + (ind.name?.length > 45 ? '...' : ''),
          ind.component_name || 'N/A',
          `${formatPercentage(ind.percentage)}%`
        ]);
        
        autoTable(pdf, {
          startY: 70,
          head: [['Indicator', 'Component', 'Progress']],
          body: topBody,
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129], textColor: 255 },
          columnStyles: {
            0: { cellWidth: 90 },
            1: { cellWidth: 40 },
            2: { cellWidth: 25, halign: 'right' }
          }
        });
        
        pdf.setFontSize(10);
        pdf.setTextColor(16, 185, 129);
        pdf.setFont('helvetica', 'italic');
        pdf.text('These indicators demonstrate excellent progress and best practices that can be replicated.', 20, (pdf as any).lastAutoTable.finalY + 10);
      } else {
        pdf.setFontSize(10);
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
        pdf.text('No indicators have achieved excellent progress (>75%) in this reporting period.', 20, 70);
      }
      
      addFooter(pageNumber);
      pdf.addPage();
      pageNumber++;

      // Indicators Needing Attention
      addHeader(pageNumber);
      
      pdf.setFontSize(18);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Indicators Needing Attention', 20, 60);
      
      if (reportData.needAttention.length > 0) {
        const attentionBody = reportData.needAttention.map(ind => [
          ind.name?.substring(0, 45) + (ind.name?.length > 45 ? '...' : ''),
          ind.component_name || 'N/A',
          `${formatPercentage(ind.percentage)}%`,
          ind.challenges?.substring(0, 30) || 'Behind schedule'
        ]);
        
        autoTable(pdf, {
          startY: 70,
          head: [['Indicator', 'Component', 'Progress', 'Issue']],
          body: attentionBody,
          theme: 'striped',
          headStyles: { fillColor: [239, 68, 68], textColor: 255 },
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 30 },
            2: { cellWidth: 20, halign: 'right' },
            3: { cellWidth: 40 }
          }
        });
        
        pdf.setFontSize(10);
        pdf.setTextColor(239, 68, 68);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Immediate action required for these indicators:', 20, (pdf as any).lastAutoTable.finalY + 10);
      } else {
        pdf.setFontSize(10);
        pdf.setTextColor(16, 185, 129);
        pdf.text('All indicators are on track. No immediate concerns identified.', 20, 70);
      }
      
      addFooter(pageNumber);
      pdf.addPage();
      pageNumber++;

      // Challenges & Recommendations
      addHeader(pageNumber);
      
      pdf.setFontSize(18);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Challenges & Recommendations', 20, 60);
      
      // Challenges
      pdf.setFontSize(14);
      pdf.setTextColor(239, 68, 68);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Challenges', 20, 70);
      
      pdf.setFontSize(10);
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.setFont('helvetica', 'normal');
      
      let yPosChallenge = 78;
      if (reportData.challenges.length > 0) {
        reportData.challenges.forEach((challenge, index) => {
          pdf.text(`${index + 1}. ${challenge}`, 25, yPosChallenge);
          yPosChallenge += 7;
        });
      } else {
        pdf.text('No significant challenges identified in this reporting period.', 25, yPosChallenge);
        yPosChallenge += 7;
      }
      
      // Recommendations
      yPosChallenge += 10;
      pdf.setFontSize(14);
      pdf.setTextColor(16, 185, 129);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recommendations', 20, yPosChallenge);
      
      yPosChallenge += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.setFont('helvetica', 'normal');
      
      reportData.recommendations.forEach((rec, index) => {
        const recLines = pdf.splitTextToSize(`${index + 1}. ${rec}`, 160);
        pdf.text(recLines, 25, yPosChallenge);
        yPosChallenge += (recLines.length * 5) + 2;
      });
      
      addFooter(pageNumber);
      pdf.addPage();
      pageNumber++;

      // Annexures
      addHeader(pageNumber);
      
      pdf.setFontSize(18);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Annexures', 20, 60);
      
      pdf.setFontSize(12);
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Annexure A: Complete Indicator List', 20, 70);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('All M&E indicators with detailed information', 25, 77);
      
      pdf.text('Annexure B: Data Collection Methodology', 20, 87);
      pdf.text('Details of data sources, frequency, and responsible agencies', 25, 94);
      
      pdf.text('Annexure C: Acronyms and Definitions', 20, 104);
      pdf.text('List of acronyms used in this report', 25, 111);
      
      pdf.text('Annexure D: Contact Information', 20, 121);
      pdf.text('PMU and PIU contact details', 25, 128);
      
      addFooter(pageNumber);
      
      // Save PDF
      const fileName = `M&E_Report_${type}_${year}${quarter ? `_Q${quarter}` : ''}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      // Generate preview URL
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setGeneratedPdfUrl(pdfUrl);
      setShowPdfPreview(true);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Handle PDF generation
  const handleGeneratePDF = () => {
    generatePDFReport(reportType, reportYear, reportType === 'quarterly' ? reportQuarter : undefined);
  };

  // Handle download report as text
  const handleDownloadReport = () => {
    const reportData = generateReportData(reportType, reportYear, reportType === 'quarterly' ? reportQuarter : undefined);
    
    let content = `M&E PERFORMANCE REPORT\n`;
    content += `Bihar Water Security and Irrigation Modernization Project\n`;
    content += `===============================================\n\n`;
    content += `Report Type: ${reportType === 'quarterly' ? 'Quarterly Report' : reportType === 'half-yearly' ? 'Half-Yearly Report' : 'Annual Report'}\n`;
    content += `Period: ${reportData.period}\n`;
    content += `Generated On: ${reportData.generatedOn.toLocaleString('en-IN')}\n\n`;
    
    content += `EXECUTIVE SUMMARY\n`;
    content += `-----------------\n`;
    content += `${reportData.summary}\n\n`;
    
    content += `KEY METRICS\n`;
    content += `-----------\n`;
    content += `Overall Progress: ${reportData.overallProgress.toFixed(1)}%\n`;
    content += `PDO1 (Area): ${reportData.pdoProgress.pdo1.toFixed(1)}%\n`;
    content += `PDO2 (People): ${reportData.pdoProgress.pdo2.toFixed(1)}%\n\n`;
    
    content += `PROGRESS DISTRIBUTION\n`;
    content += `--------------------\n`;
    content += `Intermediate Indicators:\n`;
    content += `  - Excellent (75%+): ${reportData.intermediateProgress.excellent}\n`;
    content += `  - On Track (40-75%): ${reportData.intermediateProgress.onTrack}\n`;
    content += `  - Behind (<40%): ${reportData.intermediateProgress.behind}\n`;
    content += `PBC Indicators:\n`;
    content += `  - Achieved (100%): ${reportData.pbcProgress.achieved}\n`;
    content += `  - Partial Progress: ${reportData.pbcProgress.partial}\n`;
    content += `  - Not Started: ${reportData.pbcProgress.notStarted}\n\n`;
    
    if (reportData.topPerformers.length > 0) {
      content += `TOP PERFORMERS\n`;
      content += `--------------\n`;
      reportData.topPerformers.forEach(i => {
        content += `- ${i.name}: ${Number(i.percentage).toFixed(1)}% (${i.component_name || 'N/A'})\n`;
      });
      content += `\n`;
    }
    
    if (reportData.needAttention.length > 0) {
      content += `NEED ATTENTION\n`;
      content += `--------------\n`;
      reportData.needAttention.forEach(i => {
        content += `- ${i.name}: ${Number(i.percentage).toFixed(1)}% (${i.component_name || 'N/A'})\n`;
      });
      content += `\n`;
    }
    
    content += `RECOMMENDATIONS\n`;
    content += `---------------\n`;
    reportData.recommendations.forEach((r, i) => {
      content += `${i+1}. ${r}\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `M&E_Report_${reportType}_${reportYear}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle copy report to clipboard
  const handleCopyReport = () => {
    const reportData = generateReportData(reportType, reportYear, reportType === 'quarterly' ? reportQuarter : undefined);
    
    let content = `M&E PERFORMANCE REPORT\n`;
    content += `Bihar Water Security and Irrigation Modernization Project\n\n`;
    content += `Report Type: ${reportType}\n`;
    content += `Period: ${reportData.period}\n`;
    content += `Generated On: ${reportData.generatedOn.toLocaleString('en-IN')}\n\n`;
    content += `Overall Progress: ${reportData.overallProgress.toFixed(1)}%\n`;
    content += `PDO1: ${reportData.pdoProgress.pdo1.toFixed(1)}%\n`;
    content += `PDO2: ${reportData.pdoProgress.pdo2.toFixed(1)}%\n`;
    
    navigator.clipboard.writeText(content);
    alert('Report summary copied to clipboard!');
  };

  // Handle share report
  const handleShareReport = () => {
    setShowShareModal(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <h3 className="text-xl font-semibold">Generate M&E Report</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Report Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Report Type</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setReportType('quarterly')}
                  className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition ${
                    reportType === 'quarterly'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    reportType === 'quarterly' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Quarterly</span>
                </button>
                
                <button
                  onClick={() => setReportType('half-yearly')}
                  className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition ${
                    reportType === 'half-yearly'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    reportType === 'half-yearly' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Half-Yearly</span>
                </button>
                
                <button
                  onClick={() => setReportType('yearly')}
                  className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition ${
                    reportType === 'yearly'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    reportType === 'yearly' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Annual</span>
                </button>
              </div>
            </div>

            {/* Period Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select
                  value={reportYear}
                  onChange={(e) => setReportYear(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                  <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                  <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
                </select>
              </div>
              
              {reportType === 'quarterly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quarter</label>
                  <select
                    value={reportQuarter}
                    onChange={(e) => setReportQuarter(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Q1 (Jan - Mar)</option>
                    <option value={2}>Q2 (Apr - Jun)</option>
                    <option value={3}>Q3 (Jul - Sep)</option>
                    <option value={4}>Q4 (Oct - Dec)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Report Preview */}
            <div ref={reportContentRef} className="border rounded-xl p-6 bg-gray-50">
              <h4 className="font-semibold text-gray-800 mb-4">Report Configuration</h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">Report Type</h5>
                    <p className="text-lg font-semibold text-gray-900">
                      {reportType === 'quarterly' ? 'Quarterly Report' :
                       reportType === 'half-yearly' ? 'Half-Yearly Report' : 'Annual Report'}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">Reporting Period</h5>
                    <p className="text-lg font-semibold text-gray-900">
                      {reportType === 'quarterly' ? `Q${reportQuarter} ${reportYear}` :
                       reportType === 'half-yearly' ? `H1 ${reportYear}` : `Year ${reportYear}`}
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-2">Content Includes:</h5>
                  <ul className="grid grid-cols-2 gap-2">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Executive Summary</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>PDO Performance Analysis</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Intermediate Indicators</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>PBC Achievement Status</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Gender & Youth Analysis</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Financial Progress</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Top Performers</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Recommendations</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <h5 className="text-sm font-medium text-blue-800 mb-2">Estimated Report Size</h5>
                  <p className="text-sm text-blue-700">
                    Approximately 15-20 pages including cover page, tables, and annexures.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCopyReport}
                className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Summary
              </button>
              {/* <button
                onClick={handleDownloadReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                Download Text
              </button> */}
              <button
                onClick={handleGeneratePDF}
                disabled={isGeneratingReport}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isGeneratingReport ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <FileOutput className="w-4 h-4" />
                    <span>Generate PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPdfPreview && generatedPdfUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6" />
                <h3 className="text-xl font-semibold">PDF Report Preview</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(generatedPdfUrl, '_blank')}
                  className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition"
                  title="Open in new tab"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setShowPdfPreview(false);
                    URL.revokeObjectURL(generatedPdfUrl);
                  }}
                  className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="w-full h-[calc(90vh-80px)]">
              <iframe
                src={generatedPdfUrl}
                className="w-full h-full"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share Report
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Add a message..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Include</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                    <span className="text-sm text-gray-700">Report PDF</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    <span className="text-sm text-gray-700">Data in Excel format</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Send Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}