"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { usePDOManagement } from "@/hooks/wrdHooks/usePdo";
import { useWorks } from "@/hooks/wrdHooks/useWorks";
import { Shield, Download as DownloadIcon, Eye, ChevronDown, Plus, X } from 'lucide-react';

// Types
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
  female_target: number;
  youth_target: number;
  created_by: string;
  created_email: string;
}

interface PDOProgress {
  id: number;
  work_id: number;
  indicator_id: number;
  period: string;
  achievement: number;
  cumulative: number;
  female_achievement: number;
  youth_achievement: number;
  remark: string;
  entry_date: string;
  created_at: string;
  created_by: string;
  created_email: string;
  indicator_name?: string;
  category?: string;
  unit?: string;
  work_name?: string;
  package_number?: string;
}

interface Scheme {
  id: number;
  name: string;
  schemeId: string;
  component: string;
  target: number; // PDO1 target (hectares)
  pdoIndicatorId: number;
  unit: "Hectare" | "People";
  workType: "IRRIGATION" | "EMBANKMENT";
  areaUnderImprovedIrrigation?: string;
  workCost?: string;
  totalPopulation?: number; // Add this for PDO2 target
}

const PERIODS = [
  "Period 1 (Oct 2025-Sep 2026)",
  "Period 2 (Oct 2026-Sep 2027)",
  "Period 3 (Oct 2027-Sep 2028)",
  "Period 4 (Oct 2028-Sep 2029)",
  "Period 5 (Oct 2029-Sep 2030)",
  "Period 6 (Oct 2030-Sep 2031)",
  "Period 7 (Oct 2031-Sep 2032)",
];

export default function PDOProgressModule() {
  const {
    // Queries
    useGetPDOWorks,
    useGetPDOIndicators,
    useGetPDOSummary,
    useGetPDOProgressByWork,
    useGetWorkPDOData,
    
    // Mutations
    useCreatePDOProgress,
    
    // Utility functions
    refreshAllPDOData,
  } = usePDOManagement();

  // Fetch works data from works hook
  const { data: worksData, isLoading: worksLoading } = useGetPDOWorks();
  
  // Fetch PDO data using hooks
  const { data: indicatorsResponse, isLoading: indicatorsLoading } = useGetPDOIndicators();
  const { data: summaryResponse, isLoading: summaryLoading } = useGetPDOSummary();
  
  // Extract data from responses
  const indicators = indicatorsResponse?.indicators || [];
  const summaryData = summaryResponse?.summary;
  const works = worksData || [];
  
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [viewMode, setViewMode] = useState<"overview" | "schemes" | "pdo">("overview");
  const [searchTerm, setSearchTerm] = useState("");

  // Mutations
  const createProgressMutation = useCreatePDOProgress();

  // Form state for adding progress
  const [formState, setFormState] = useState({
    work_id: 0,
    indicator_id: 0,
    period: "",
    achievement: 0,
    remark: "",
    female_achievement: 0,
    youth_achievement: 0
  });

  // Fetch work-specific data when scheme is selected
  const { 
    progress: workProgress,
    isLoading: workDataLoading,
    refetch: refetchWorkData
  } = useGetWorkPDOData(selectedScheme?.id || 0);

  // Helper function to safely get percentage
  const getPercentage = (indicator: any) => {
    if (!indicator) return 0;
    const percentage = parseFloat(indicator.percentage?.toString() || "0");
    return isNaN(percentage) ? 0 : percentage;
  };

  // Helper function to safely get cumulative
  const getCumulative = (indicator: any) => {
    if (!indicator) return 0;
    const cumulative = parseFloat(indicator.cumulative?.toString() || "0");
    return isNaN(cumulative) ? 0 : cumulative;
  };

  // Helper function to safely get target
  const getTarget = (indicator: any) => {
    if (!indicator) return 0;
    const target = parseFloat(indicator.target?.toString() || "0");
    return isNaN(target) ? 0 : target;
  };

  // Calculate OVERALL summary statistics
  const totalAreaTarget = useMemo(() => indicators
    .filter((i: { category: string }) => i.category === 'PDO1')
    .reduce((sum: number, i: { target: { toString: () => string } }) => sum + getTarget(i), 0), [indicators]);

  const totalAreaAchieved = useMemo(() => indicators
    .filter((i: { category: string }) => i.category === 'PDO1')
    .reduce((sum: number, i: { cumulative: { toString: () => string } }) => sum + getCumulative(i), 0), [indicators]);

  const totalAreaPercentage = useMemo(() => totalAreaTarget > 0 
    ? (totalAreaAchieved / totalAreaTarget) * 100 
    : 0, [totalAreaTarget, totalAreaAchieved]);

  const totalPeopleTarget = useMemo(() => indicators
    .filter((i: { category: string }) => i.category === 'PDO2')
    .reduce((sum: number, i: { target: { toString: () => string } }) => sum + getTarget(i), 0), [indicators]);

  const totalPeopleAchieved = useMemo(() => indicators
    .filter((i: { category: string }) => i.category === 'PDO2')
    .reduce((sum: number, i: { cumulative: { toString: () => string } }) => sum + getCumulative(i), 0), [indicators]);

  const totalPeoplePercentage = useMemo(() => totalPeopleTarget > 0 
    ? (totalPeopleAchieved / totalPeopleTarget) * 100 
    : 0, [totalPeopleTarget, totalPeopleAchieved]);

  // Transform works data to schemes
  useEffect(() => {
    if (works.length > 0) {
      const transformedSchemes: Scheme[] = works.map((work: any, index: number) => {
        const workName = work.work_name || work.workName || work.name || `Work ${index + 1}`;
        const schemeId = work.package_number || work.workId || work.code || `WORK-${index + 1}`;
        const component = work.division_name || work.component || "Irrigation";
        
        const workNameLower = workName.toLowerCase();
        const divisionLower = component.toLowerCase();
        
        let workType: "IRRIGATION" | "EMBANKMENT" = "IRRIGATION";
        
        if (
          workNameLower.includes("embankment") || 
          workNameLower.includes("bundh") || 
          workNameLower.includes("bund") ||
          workNameLower.includes("flood") ||
          divisionLower.includes("embankment") ||
          divisionLower.includes("flood") ||
          (work.work_type && work.work_type.toLowerCase().includes("embankment")) ||
          (work.work_type && work.work_type.toLowerCase().includes("flood"))
        ) {
          workType = "EMBANKMENT";
        }
        
        let targetValue = 0;
        
        if (work.Area_Under_improved_Irrigation) {
          targetValue = parseFloat(work.Area_Under_improved_Irrigation) || 0;
        } else if (work.target_ha) {
          targetValue = parseFloat(work.target_ha) || 0;
        } else if (work.work_cost) {
          targetValue = parseFloat(work.work_cost) || 0;
        }
        
        // Determine which PDO indicator to associate with
        let pdoIndicatorId = 1; // default to irrigation area
        let unit: "Hectare" | "People" = "Hectare";
        
        if (workType === "IRRIGATION") {
          const irrigationIndicator = indicators.find((ind: { category: string; name: string; }) => 
            ind.category === 'PDO1' && ind.name?.toLowerCase().includes('irrigation')
          );
          pdoIndicatorId = irrigationIndicator?.id || 1;
        } else {
          const floodIndicator = indicators.find((ind: { category: string; name: string; }) => 
            ind.category === 'PDO1' && ind.name?.toLowerCase().includes('flood')
          );
          pdoIndicatorId = floodIndicator?.id || 2;
        }
        
        return {
          id: work.id || index + 1,
          name: workName,
          schemeId: schemeId,
          component: component,
          target: targetValue,
          pdoIndicatorId: pdoIndicatorId,
          unit: unit,
          workType: workType,
          areaUnderImprovedIrrigation: work.Area_Under_improved_Irrigation,
          workCost: work.work_cost,
          totalPopulation: work.total_population || 0
        };
      });
      
      setSchemes(transformedSchemes);
    }
  }, [works, indicators]);

  // Get PDOs for selected work
  const getPDOsForSelectedWork = () => {
    if (!selectedScheme) return [];
    
    const workType = selectedScheme.workType;
    
    if (workType === "IRRIGATION") {
      return [
        ...indicators.filter((ind: { id: number; category: string; name: string }) => 
          ind.category === 'PDO1' && (ind.name?.toLowerCase().includes('irrigation') || ind.id === 1)
        ),
        ...indicators.filter((ind: { id: number; category: string; name: string }) => 
          ind.category === 'PDO2' && (ind.name?.toLowerCase().includes('irrigation') || ind.id === 3)
        )
      ];
    } else {
      return [
        ...indicators.filter((ind: { id: number; category: string; name: string }) => 
          ind.category === 'PDO1' && (ind.name?.toLowerCase().includes('flood') || ind.id === 2)
        ),
        ...indicators.filter((ind: { id: number; category: string; name: string }) => 
          ind.category === 'PDO2' && (
            ind.name?.toLowerCase().includes('flood') || 
            ind.name?.toLowerCase().includes('embankment') || 
            ind.name?.toLowerCase().includes('riverbank') ||
            ind.id === 4
          )
        )
      ];
    }
  };

  const workPDOs = getPDOsForSelectedWork();

  // NEW: Calculate WORK SPECIFIC progress
const getWorkSpecificProgress = useMemo(() => {
  if (!selectedScheme || !workProgress?.progress) {
    return {};
  }

  const progressByIndicator: Record<number, {
    totalAchievement: number;
    entries: number;
  }> = {};

  // Group progress by indicator_id
  workProgress.progress.forEach((entry: any) => {
    const indicatorId = entry.indicator_id;
    const achievement = parseFloat(entry.achievement) || 0;
    
    if (!progressByIndicator[indicatorId]) {
      progressByIndicator[indicatorId] = {
        totalAchievement: 0,
        entries: 0
      };
    }
    
    progressByIndicator[indicatorId].totalAchievement += achievement;
    progressByIndicator[indicatorId].entries += 1;
  });

  // Calculate work-specific progress for each indicator
  const result: Record<number, {
    workTarget: number;
    workAchieved: number;
    workPercentage: number;
    overallTarget: number;
    overallAchieved: number;
    overallPercentage: number;
  }> = {};

  workPDOs.forEach((indicator: any) => {
    // IMPORTANT: Different targets for PDO1 and PDO2
    let workTarget = 0;
    
    if (indicator.category === "PDO1") {
      // PDO1: Use selectedScheme.target (in hectares)
      workTarget = selectedScheme.target;
    } else if (indicator.category === "PDO2") {
      // PDO2: Use total_population from work data (in people)
      // First check workProgress.work.total_population
      // If not available, check selectedScheme.totalPopulation
      workTarget = workProgress?.work?.total_population || 
                   selectedScheme.totalPopulation || 
                   0;
    }
    
    const workProgressData = progressByIndicator[indicator.id] || { 
      totalAchievement: 0, 
      entries: 0 
    };
    
    const workAchieved = workProgressData.totalAchievement;
    
    // Work-specific percentage
    const workPercentage = workTarget > 0 
      ? (workAchieved / workTarget) * 100 
      : 0;
    
    // Overall PDO progress
    const overallTarget = getTarget(indicator);
    const overallAchieved = getCumulative(indicator);
    const overallPercentage = getPercentage(indicator);
    
    result[indicator.id] = {
      workTarget,
      workAchieved,
      workPercentage: Math.min(workPercentage, 100),
      overallTarget,
      overallAchieved,
      overallPercentage
    };
  });

  return result;
}, [selectedScheme, workProgress, workPDOs]);

  // Chart data for selected work's PDOs - USING WORK SPECIFIC DATA
  const getDashboardData = () => {
    if (!selectedScheme || workPDOs.length === 0) return [];
    
    return workPDOs.map(ind => {
      const workData = getWorkSpecificProgress[ind.id] || {
        workTarget: 0,
        workAchieved: 0,
        workPercentage: 0
      };
      
      return {
        name: ind.name || `Indicator ${ind.id}`,
        target: workData.workTarget,
        cumulative: workData.workAchieved,
        percentage: workData.workPercentage,
      };
    });
  };

  const dashboardData = getDashboardData();

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "achievement" || name === "female_achievement" || name === "youth_achievement") {
      const numValue = parseFloat(value) || 0;
      
      setFormState(prev => {
        const selectedIndicatorData = indicators.find((ind: { id: number }) => ind.id === formState.indicator_id);
        const isPDO2 = selectedIndicatorData?.category === "PDO2";
        
        if (isPDO2 && name === "achievement") {
          const femaleValue = Math.round(numValue * 0.49);
          const youthValue = Math.round(numValue * 0.29);
          
          return {
            ...prev,
            [name]: numValue,
            female_achievement: femaleValue,
            youth_achievement: youthValue
          };
        }
        
        return {
          ...prev,
          [name]: numValue
        };
      });
    } else {
      setFormState(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Add progress handler
  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedIndicator) {
      alert("Please select an indicator first");
      return;
    }

    try {
      const progressData = {
        work_id: selectedScheme?.id || formState.work_id,
        indicator_id: selectedIndicator,
        period: formState.period,
        achievement: formState.achievement,
        remark: formState.remark,
        female_achievement: formState.female_achievement,
        youth_achievement: formState.youth_achievement
      };

      await createProgressMutation.mutateAsync(progressData);
      
      // Refresh data
      await refreshAllPDOData();
      if (selectedScheme?.id) {
        refetchWorkData();
      }

      // Reset form
      setFormState({
        work_id: 0,
        indicator_id: 0,
        period: "",
        achievement: 0,
        remark: "",
        female_achievement: 0,
        youth_achievement: 0
      });
      setShowAddForm(false);
      
      // Show success message
      alert("Progress updated successfully!");
      
    } catch (error) {
      console.error("Error creating progress:", error);
      alert("Failed to update progress. Please try again.");
    }
  };

  // Get specific indicators for overview
  const irrigationAreaIndicator = indicators.find((ind: { id: number }) => ind.id === 1);
  const floodAreaIndicator = indicators.find((ind: { id: number }) => ind.id === 2);
  const irrigationPeopleIndicator = indicators.find((ind: { id: number }) => ind.id === 3);
  const floodPeopleIndicator = indicators.find((ind: { id: number }) => ind.id === 4);

  // Handle loading states
  const isLoading = indicatorsLoading || summaryLoading || worksLoading;
  const hasError = indicatorsResponse?.success === false || summaryResponse?.success === false;

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading PDO and works data...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h2>
          <p className="text-red-600 mb-4">Unable to fetch PDO data. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="bg-[#003087] text-white border-b-4 border-[#FF9933]">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  PDO Progress Monitoring
                </h1>
                <p className="text-blue-100 text-sm">
                  Bihar Water Security and Irrigation Modernization Project
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 max-w-[1800px] mx-auto w-full px-4 py-6">
        {/* VIEW MODE TOGGLE */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setViewMode("overview")}
              className={`px-4 py-2 font-medium ${viewMode === "overview" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
            >
              Overview Dashboard
            </button>
            <button
              onClick={() => setViewMode("schemes")}
              className={`px-4 py-2 font-medium ${viewMode === "schemes" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
            >
              Works List ({schemes.length})
            </button>
            <button
              onClick={() => setViewMode("pdo")}
              className={`px-4 py-2 font-medium ${viewMode === "pdo" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
              disabled={!selectedScheme}
            >
              {selectedScheme ? `PDO for ${selectedScheme.name.substring(0, 20)}...` : "Select a Work First"}
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        {viewMode === "overview" ? (
          // OVERVIEW DASHBOARD (OVERALL DATA)
          <div className="space-y-6">
            {/* PDO1 - AREA SECTION */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <div className="w-3 h-6 bg-blue-600 rounded mr-3"></div>
                    PDO1 - Area under improved irrigation services and climate resilience
                  </h2>
                </div>
                <button
                  onClick={() => handleDownload("pdf")}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                >
                  📊 Export Report
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Irrigation Area Card */}
                <div className="border rounded-lg p-5 bg-gradient-to-br from-blue-50 to-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-blue-800 text-lg">Gross Irrigated Area under improved irrigation services and drought resilience</h3>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      PDO1
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span className="font-semibold">{getPercentage(irrigationAreaIndicator).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full bg-blue-600"
                        style={{ width: `${Math.min(getPercentage(irrigationAreaIndicator), 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">Target</p>
                      <p className="text-xl font-bold text-blue-700">
                        {getTarget(irrigationAreaIndicator).toLocaleString()}
                      </p>
                      <p className="text-xs text-blue-600">Hectares</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">Achieved</p>
                      <p className="text-xl font-bold text-green-700">
                        {getCumulative(irrigationAreaIndicator).toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600">Hectares</p>
                    </div>
                  </div>
                </div>
                
                {/* Flood Resilience Area Card */}
                <div className="border rounded-lg p-5 bg-gradient-to-br from-cyan-50 to-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-cyan-800 text-lg">Area with improved flood resilience</h3>
                    </div>
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-800 text-sm font-medium rounded-full">
                      PDO1
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span className="font-semibold">{getPercentage(floodAreaIndicator).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full bg-cyan-600"
                        style={{ width: `${Math.min(getPercentage(floodAreaIndicator), 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-cyan-100 p-3 rounded-lg">
                      <p className="text-sm text-cyan-800 font-medium">Target</p>
                      <p className="text-xl font-bold text-cyan-700">
                        {getTarget(floodAreaIndicator).toLocaleString()}
                      </p>
                      <p className="text-xs text-cyan-600">Hectares</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">Achieved</p>
                      <p className="text-xl font-bold text-green-700">
                        {getCumulative(floodAreaIndicator).toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600">Hectares</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Total Area Progress */}
              <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-800 text-lg mb-4">Overall PDO1 Progress</h3>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-3xl font-bold text-blue-700">{totalAreaPercentage.toFixed(1)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Achieved / Target</p>
                    <p className="text-xl font-bold text-gray-800">
                      {totalAreaAchieved.toLocaleString()} / {totalAreaTarget.toLocaleString()} Ha
                    </p>
                  </div>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-blue-600"
                    style={{ width: `${Math.min(totalAreaPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* PDO2 - PEOPLE SECTION */}
            {/* PDO2 - PEOPLE SECTION */}
<div className="bg-white rounded-lg shadow p-6">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-xl font-bold text-gray-800 flex items-center">
        <div className="w-3 h-6 bg-green-600 rounded mr-3"></div>
        PDO2 - People with enhanced resilience to climate risks
      </h2>
    </div>
  </div>
  
  {/* Total People Progress Card */}
  <div className="border rounded-lg p-5 bg-gradient-to-br from-green-50 to-white mb-6">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="font-bold text-green-800 text-lg">People benefiting from climate resilient infrastructure</h3>
      </div>
      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
        PDO2 Total
      </span>
    </div>
    
    <div className="mb-4">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Overall Progress</span>
        <span className="font-semibold">{totalPeoplePercentage.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="h-3 rounded-full bg-green-600"
          style={{ width: `${Math.min(totalPeoplePercentage, 100)}%` }}
        ></div>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-green-100 p-3 rounded-lg">
        <p className="text-sm text-green-800 font-medium">Target</p>
        <p className="text-xl font-bold text-green-700">{totalPeopleTarget.toLocaleString()} People</p>
      </div>
      <div className="bg-green-100 p-3 rounded-lg">
        <p className="text-sm text-green-800 font-medium">Achieved</p>
        <p className="text-xl font-bold text-green-700">{totalPeopleAchieved.toLocaleString()} People</p>
      </div>
    </div>
  </div>
  
  {/* FEMALE & YOUTH BREAKDOWN CARDS - ADD THESE BACK */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    {/* Female Beneficiaries Card */}
    <div className="border rounded-lg p-5 bg-gradient-to-br from-purple-50 to-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-purple-800 text-lg">People benefiting from climate resilient infrastructure - Female</h3>
          {/* <p className="text-sm text-purple-600">(49% of total beneficiaries)</p> */}
        </div>
        {/* <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
          Women Empowerment
        </span> */}
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span className="font-semibold">
            {totalPeopleTarget > 0 
              ? ((totalPeopleAchieved * 0.49) / (totalPeopleTarget * 0.49) * 100).toFixed(1) 
              : "0.0"}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="h-3 rounded-full bg-purple-600"
            style={{ 
              width: `${totalPeopleTarget > 0 
                ? Math.min((totalPeopleAchieved * 0.49) / (totalPeopleTarget * 0.49) * 100, 100) 
                : 0}%` 
            }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-purple-100 p-3 rounded-lg">
          <p className="text-sm text-purple-800 font-medium">Target</p>
          <p className="text-xl font-bold text-purple-700">
           {Math.round(totalPeopleTarget * 0.49).toLocaleString()}
          </p>
          <p className="text-xs text-purple-600">Women</p>
        </div>
        <div className="bg-green-100 p-3 rounded-lg">
          <p className="text-sm text-green-800 font-medium">Achieved</p>
          <p className="text-xl font-bold text-green-700">
            {Math.round(totalPeopleAchieved * 0.49).toLocaleString()}
          </p>
          <p className="text-xs text-green-600">Women</p>
        </div>
      </div>
    </div>
    
    {/* Youth Beneficiaries Card */}
    <div className="border rounded-lg p-5 bg-gradient-to-br from-teal-50 to-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-teal-800 text-lg">People benefiting from climate resilient infrastructure - Youth</h3>
          {/* <p className="text-sm text-teal-600">(29% of total beneficiaries)</p> */}
        </div>
        {/* <span className="px-3 py-1 bg-teal-100 text-teal-800 text-sm font-medium rounded-full">
          Youth Engagement
        </span> */}
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span className="font-semibold">
            {totalPeopleTarget > 0 
              ? ((totalPeopleAchieved * 0.29) / (totalPeopleTarget * 0.29) * 100).toFixed(1) 
              : "0.0"}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="h-3 rounded-full bg-teal-600"
            style={{ 
              width: `${totalPeopleTarget > 0 
                ? Math.min((totalPeopleAchieved * 0.29) / (totalPeopleTarget * 0.29) * 100, 100) 
                : 0}%` 
            }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-teal-100 p-3 rounded-lg">
          <p className="text-sm text-teal-800 font-medium">Target</p>
          <p className="text-xl font-bold text-teal-700">
            {Math.round(totalPeopleTarget * 0.29).toLocaleString()}
          </p>
          <p className="text-xs text-teal-600">Youth</p>
        </div>
        <div className="bg-green-100 p-3 rounded-lg">
          <p className="text-sm text-green-800 font-medium">Achieved</p>
          <p className="text-xl font-bold text-green-700">
            {Math.round(totalPeopleAchieved * 0.29).toLocaleString()}
          </p>
          <p className="text-xs text-green-600">Youth</p>
        </div>
      </div>
    </div>
  </div>
  
  {/* 2 Cards in a row - Irrigation and Flood */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Irrigation Beneficiaries Card */}
    <div className="border rounded-lg p-5 bg-gradient-to-br from-blue-50 to-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-blue-800 text-lg">People benefitting from improved irrigation infrastructure</h3>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span className="font-semibold">{getPercentage(irrigationPeopleIndicator).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="h-3 rounded-full bg-blue-600"
            style={{ width: `${Math.min(getPercentage(irrigationPeopleIndicator), 100)}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-100 p-3 rounded-lg">
          <p className="text-sm text-blue-800 font-medium">Target</p>
          <p className="text-xl font-bold text-blue-700">
            {getTarget(irrigationPeopleIndicator).toLocaleString()}
          </p>
          <p className="text-xs text-blue-600">People</p>
        </div>
        <div className="bg-green-100 p-3 rounded-lg">
          <p className="text-sm text-green-800 font-medium">Achieved</p>
          <p className="text-xl font-bold text-green-700">
            {getCumulative(irrigationPeopleIndicator).toLocaleString()}
          </p>
          <p className="text-xs text-green-600">People</p>
        </div>
      </div>
    </div>
    
    {/* Flood Protection Beneficiaries Card */}
    <div className="border rounded-lg p-5 bg-gradient-to-br from-cyan-50 to-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-cyan-800 text-lg">People benefitting from strengthened embankments and riverbanks</h3>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span className="font-semibold">{getPercentage(floodPeopleIndicator).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="h-3 rounded-full bg-cyan-600"
            style={{ width: `${Math.min(getPercentage(floodPeopleIndicator), 100)}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-cyan-100 p-3 rounded-lg">
          <p className="text-sm text-cyan-800 font-medium">Target</p>
          <p className="text-xl font-bold text-cyan-700">
            {getTarget(floodPeopleIndicator).toLocaleString()}
          </p>
          <p className="text-xs text-cyan-600">People</p>
        </div>
        <div className="bg-green-100 p-3 rounded-lg">
          <p className="text-sm text-green-800 font-medium">Achieved</p>
          <p className="text-xl font-bold text-green-700">
            {getCumulative(floodPeopleIndicator).toLocaleString()}
          </p>
          <p className="text-xs text-green-600">People</p>
        </div>
      </div>
    </div>
  </div>
</div>
          </div>
        ) : viewMode === "schemes" ? (
          /* WORKS LIST VIEW */
          <div className="space-y-6">
            {/* CONTROLS */}
            <div className="bg-white border border-gray-300 rounded shadow-sm p-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">All Works ({schemes.length})</h2>
                  <p className="text-sm text-gray-500">Select a work to view its PDO1 & PDO2</p>
                </div>
                
                <div className="flex gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by work name, package ID, or division..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-80 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="relative download-menu">
                    <button
                      onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#003087] text-white rounded hover:bg-[#00205b] transition-colors"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      Export Data
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {showDownloadOptions && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-sm z-10 overflow-hidden">
                        <button onClick={() => handleDownload("pdf")} className="block w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-200">
                          📄 PDF Report
                        </button>
                        <button onClick={() => handleDownload("excel")} className="block w-full text-left px-4 py-3 hover:bg-gray-100">
                          📊 Excel File
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* WORKS TABLE */}
            <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-400">
                  <thead>
                    <tr className="bg-gray-100 text-gray-800">
                      <th className="border border-gray-400 p-3 font-semibold text-left">Sr. No.</th>
                      <th className="border border-gray-400 p-3 font-semibold text-left">Work Name</th>
                      <th className="border border-gray-400 p-3 font-semibold text-left">Package ID</th>
                      <th className="border border-gray-400 p-3 font-semibold text-left">Division</th>
                      <th className="border border-gray-400 p-3 font-semibold text-left">Work Type</th>
                      <th className="border border-gray-400 p-3 font-semibold text-right">Target (Ha)</th>
                      <th className="border border-gray-400 p-3 font-semibold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schemes.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="border border-gray-400 p-3 text-center text-gray-500">
                          No works found.
                        </td>
                      </tr>
                    ) : (
                      schemes
                        .filter(scheme => 
                          scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scheme.schemeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scheme.component.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((scheme, index) => {
                          const isSelected = selectedScheme?.id === scheme.id;
                          const isIrrigation = scheme.workType === "IRRIGATION";
                          
                          return (
                            <tr key={scheme.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                              <td className="border border-gray-400 p-3 text-center">{index + 1}</td>
                              <td className="border border-gray-400 p-3">
                                <div className="font-medium">{scheme.name}</div>
                              </td>
                              <td className="border border-gray-400 p-3">{scheme.schemeId}</td>
                              <td className="border border-gray-400 p-3">{scheme.component}</td>
                              <td className="border border-gray-400 p-3">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${isIrrigation ? 'bg-blue-100 text-blue-800' : 'bg-cyan-100 text-cyan-800'}`}>
                                  {scheme.workType}
                                </span>
                              </td>
                              <td className="border border-gray-400 p-3 text-right font-medium">
                                {scheme.target.toLocaleString()}
                              </td>
                              <td className="border border-gray-400 p-3 text-center">
                                <button
                                  onClick={() => {
                                    setSelectedScheme(scheme);
                                    setViewMode("pdo");
                                  }}
                                  className="flex items-center gap-2 justify-center w-full px-4 py-1 bg-[#003087] text-white rounded hover:bg-[#00205b] transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View PDO
                                </button>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : viewMode === "pdo" && selectedScheme ? (
          /* PDO VIEW FOR SELECTED WORK (WORK SPECIFIC DATA) */
          <div className="space-y-6">
            {/* WORK HEADER */}
            <div className="bg-white border border-gray-300 rounded shadow-sm p-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <button
                      onClick={() => setViewMode("schemes")}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                    >
                      ← Back to Works
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">{selectedScheme.name}</h2>
                  </div>
                  <p className="text-gray-600">Package ID: {selectedScheme.schemeId} | Division: {selectedScheme.component}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedScheme.workType === "IRRIGATION" ? 'bg-blue-100 text-blue-800' : 'bg-cyan-100 text-cyan-800'}`}>
                      {selectedScheme.workType}
                    </span>
                    <span className="text-gray-600">
                      Work Target: <span className="font-bold">{selectedScheme.target.toLocaleString()} {selectedScheme.unit}</span>
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownload("pdf")}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Export Report
                  </button>
                </div>
              </div>
            </div>

            {/* WORK SPECIFIC PDO INDICATORS */}
            {workDataLoading ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading work data...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  PDO Indicators for {selectedScheme.workType === "IRRIGATION" ? "Irrigation Work" : "Embankment Work"}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {workPDOs.map((indicator: any) => {
                    const workData = getWorkSpecificProgress[indicator.id] || {
                      workTarget: selectedScheme.target,
                      workAchieved: 0,
                      workPercentage: 0,
                      overallTarget: 0,
                      overallAchieved: 0,
                      overallPercentage: 0
                    };
                    
                    return (
                      <div key={indicator.id} className="border rounded-lg p-5 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-gray-800">{indicator.name || `Indicator ${indicator.id}`}</h4>
                            <p className="text-sm text-gray-500">{indicator.category} - {indicator.unit}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${indicator.category === "PDO1" ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {indicator.category}
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Work Progress</span>
                            <span className="font-semibold">{workData.workPercentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${indicator.category === "PDO1" ? 'bg-blue-600' : 'bg-green-600'}`}
                              style={{ width: `${Math.min(workData.workPercentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                       {/* Work-specific progress card में */}
<div className="grid grid-cols-2 gap-4 mb-2">
  <div className={`p-3 rounded-lg ${indicator.category === "PDO1" ? 'bg-blue-50' : 'bg-green-50'}`}>
    <p className="text-sm text-gray-600">Work Target</p>
    <p className="text-lg font-bold">
      {workData.workTarget.toLocaleString()} 
      <span className="text-xs ml-1">{indicator.unit}</span>
    </p>
  </div>
  <div className="bg-green-50 p-3 rounded-lg">
    <p className="text-sm text-gray-600">Work Achieved</p>
    <p className="text-lg font-bold text-green-700">
      {workData.workAchieved.toLocaleString()}
      <span className="text-xs ml-1">{indicator.unit}</span>
    </p>
  </div>
</div>

                        {/* Overall Progress Info */}
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                          <p>Overall Project: {workData.overallAchieved.toLocaleString()} / {workData.overallTarget.toLocaleString()} ({workData.overallPercentage.toFixed(1)}%)</p>
                        </div>
                        
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              setSelectedIndicator(indicator.id);
                              setShowAddForm(true);
                            }}
                            className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                          >
                            Update Progress
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CHART - WORK SPECIFIC DATA */}
                {dashboardData.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Work Progress Visualization</h4>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardData}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => [value.toLocaleString(), ""]} />
                          <Legend />
                          <Bar dataKey="target" fill="#3b82f6" name="Work Target" />
                          <Bar dataKey="cumulative" fill="#10b981" name="Work Achieved" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : viewMode === "pdo" && !selectedScheme ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Work Selected</h3>
            <p className="text-gray-500 mb-6">Please select a work from the Works List to view its PDO progress</p>
            <button
              onClick={() => setViewMode("schemes")}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Works List
            </button>
          </div>
        ) : null}
      </div>

      {/* ADD PROGRESS FORM MODAL */}
      {showAddForm && selectedIndicator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Update Progress - {indicators.find((ind: { id: number }) => ind.id === selectedIndicator)?.name || `Indicator ${selectedIndicator}`}
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddProgress}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Period
                  </label>
                  <select
                    name="period"
                    value={formState.period}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  >
                    <option value="">Select Period</option>
                    {PERIODS.map((period) => (
                      <option key={period} value={period}>{period}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Achievement ({indicators.find((ind: { id: number }) => ind.id === selectedIndicator)?.unit || "Units"})
                  </label>
                  <input
                    type="number"
                    name="achievement"
                    value={formState.achievement}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                    min="0"
                  />
                </div>
                
                {/* PDO2 के लिए Female और Youth breakdown */}
                {indicators.find((ind: { id: number }) => ind.id === selectedIndicator)?.category === "PDO2" && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium text-gray-700 mb-3">Beneficiary Breakdown (Auto-calculated)</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <label className="block text-xs font-medium text-purple-700 mb-1">
                          Female Beneficiaries 
                        </label>
                        <input
                          type="number"
                          name="female_achievement"
                          value={formState.female_achievement}
                          onChange={handleFormChange}
                          className="w-full border border-purple-200 bg-white rounded px-2 py-1 text-sm"
                          placeholder="Auto-calculated"
                          min="0"
                        />
                        <p className="text-xs text-purple-600 mt-1">
                          {formState.female_achievement.toLocaleString()} people
                        </p>
                      </div>
                      
                      <div className="bg-teal-50 p-3 rounded-lg">
                        <label className="block text-xs font-medium text-teal-700 mb-1">
                          Youth Beneficiaries 
                        </label>
                        <input
                          type="number"
                          name="youth_achievement"
                          value={formState.youth_achievement}
                          onChange={handleFormChange}
                          className="w-full border border-teal-200 bg-white rounded px-2 py-1 text-sm"
                          placeholder="Auto-calculated"
                          min="0"
                        />
                        <p className="text-xs text-teal-600 mt-1">
                          {formState.youth_achievement.toLocaleString()} people
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    name="remark"
                    value={formState.remark}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    rows={3}
                    placeholder="Add any notes or observations..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={createProgressMutation.isPending}
                >
                  {createProgressMutation.isPending ? "Saving..." : "Save Progress"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Download functions (kept outside return for clarity)
  function handleDownload(format: "pdf" | "excel") {
    if (format === "pdf") {
      generatePDF();
    } else {
      generateExcel();
    }
    setShowDownloadOptions(false);
  }

  function generatePDF() {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(16);
    doc.text("PDO Progress Report", 14, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text("Bihar Water Security and Irrigation Modernization Project", 14, yPos);
    yPos += 8;
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, yPos);
    yPos += 15;

    const tableData = indicators.map((ind: { name: any; id: any; unit: any }) => [
      ind.name || `Indicator ${ind.id}`,
      ind.unit || "N/A",
      getTarget(ind).toLocaleString(),
      getCumulative(ind).toLocaleString(),
      `${getPercentage(ind).toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Indicator", "Unit", "Target", "Achieved", "Progress %"]],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [66, 135, 245] },
    });

    doc.save("PDO_Progress_Report.pdf");
  }

  function generateExcel() {
    const exportData = indicators.map((ind: { name: any; id: any; category: any; unit: any; current: { toString: () => string } }) => ({
      "Indicator Name": ind.name || `Indicator ${ind.id}`,
      "Category": ind.category,
      "Unit": ind.unit || "N/A",
      "Target": getTarget(ind),
      "Current Achievement": parseFloat(ind.current?.toString() || "0"),
      "Cumulative Achievement": getCumulative(ind),
      "Progress Percentage": getPercentage(ind),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PDO Progress");
    XLSX.writeFile(wb, "PDO_Progress_Report.xlsx");
  }
}