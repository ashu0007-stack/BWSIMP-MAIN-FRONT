"use client";

import { useState, useMemo, useRef, JSX } from "react";
import { 
  TrendingUp, 
  Target, 
  Droplets, 
  Ruler, 
  Users,
  DollarSign,
  Sprout,
  HardHat,
  LandPlot,
  Tractor,
  ChevronRight,
  ChevronDown,
  Award,
  Calendar,
  MapPin,
  Activity,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Download,
  RefreshCw,
  Filter,
  Zap,
  GitBranch,
  GanttChart,
  FileCheck,
  Briefcase,
  Award as AwardIcon,
  Globe,
  Users2,
  Flower2,
  Home,
  TreePine,
  Eye,
  Info,
  FileText,
  Printer,
  Share2,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Maximize2,
  Minimize2,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Layers,
  Grid3x3,
  LayoutDashboard,
  Table,
  FileSpreadsheet,
  FilePieChart,
  Mail,
  Copy,
  MoreHorizontal,
  PieChart as PieChartIcon,
  BarChart4,
  LineChart as LineChartIcon,
} from 'lucide-react';
import { useMEManagement } from "@/hooks/wrdHooks/useMEManagement";
import { usePDOManagement } from "@/hooks/wrdHooks/usePdo";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";

// Import Report Module
import MEReportModule from "./MEReportModule";

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

interface MainIndicator extends Indicator {
  icon: JSX.Element;
  color: string;
  subIndicators: Indicator[];
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

interface SummaryData {
  overallPercentage: number;
  [key: string]: any;
}

type ViewMode = 'grid' | 'table';
type TimeRange = 'quarter' | 'half-year' | 'year' | 'project-life';

export default function MEModule() {
  const { useGetMEIndicators, useGetMESummary } = useMEManagement();
  const { useGetPDOIndicators, useGetPDOSummary } = usePDOManagement();
  const reportContentRef = useRef<HTMLDivElement>(null);
  
  const { data: indicators = [], isLoading: indicatorsLoading } = useGetMEIndicators();
  const { data: summary, isLoading: summaryLoading } = useGetMESummary();
  
  // PDO data
  const { data: pdoResponse, isLoading: pdoLoading } = useGetPDOIndicators();
  const { data: pdoSummaryResponse, isLoading: pdoSummaryLoading } = useGetPDOSummary();

  // UI State
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"pdo" | "intermediate" | "pbc">("pdo");
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [timeRange, setTimeRange] = useState<TimeRange>('project-life');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showReportPanel, setShowReportPanel] = useState(false);
  const [fullscreenChart, setFullscreenChart] = useState<string | null>(null);

  // Extract PDO data from response
  const pdoIndicators: PDOIndicator[] = pdoResponse?.indicators || [];
  const pdoSummary = pdoSummaryResponse?.summary;

  // Helper functions
  const formatNumber = (val: string | number | undefined): string => {
    if (!val && val !== 0) return "0";
    return Number(val).toLocaleString('en-IN');
  };

  const formatPercentage = (val: string | number | undefined): string => {
    if (!val && val !== 0) return "0.0";
    return Number(val).toFixed(1);
  };

  const getProgressColor = (progress: string | number | undefined) => {
    const p = Number(progress || 0);
    if (p >= 75) return { 
      text: "text-green-600", 
      bg: "bg-green-500", 
      light: "bg-green-100", 
      border: "border-green-200", 
      label: "Excellent",
      icon: <CheckCircle className="w-4 h-4 text-green-600" />
    };
    if (p >= 40) return { 
      text: "text-amber-600", 
      bg: "bg-amber-500", 
      light: "bg-amber-100", 
      border: "border-amber-200", 
      label: "On Track",
      icon: <Minus className="w-4 h-4 text-amber-600" />
    };
    return { 
      text: "text-red-600", 
      bg: "bg-red-500", 
      light: "bg-red-100", 
      border: "border-red-200", 
      label: "Behind",
      icon: <AlertCircle className="w-4 h-4 text-red-600" />
    };
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Excellent': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Excellent</span>;
      case 'On Track': return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1"><Minus className="w-3 h-3" /> On Track</span>;
      case 'Behind': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Behind</span>;
      default: return null;
    }
  };

  // Helper functions for PDO data
  const getPDOTarget = (indicator: PDOIndicator | undefined): number => {
    if (!indicator) return 0;
    return Number(indicator.target || 0);
  };

  const getPDOCumulative = (indicator: PDOIndicator | undefined): number => {
    if (!indicator) return 0;
    return Number(indicator.cumulative || 0);
  };

  const getPDOPercentage = (indicator: PDOIndicator | undefined): number => {
    if (!indicator) return 0;
    return Number(indicator.percentage || 0);
  };

  // Get specific PDO indicators
  const irrigationAreaIndicator = pdoIndicators.find((ind: PDOIndicator) => ind.id === 1);
  const floodAreaIndicator = pdoIndicators.find((ind: PDOIndicator) => ind.id === 2);
  const irrigationPeopleIndicator = pdoIndicators.find((ind: PDOIndicator) => ind.id === 3);
  const floodPeopleIndicator = pdoIndicators.find((ind: PDOIndicator) => ind.id === 4);

  // Calculate totals
  const totalAreaTarget = (getPDOTarget(irrigationAreaIndicator) + getPDOTarget(floodAreaIndicator)) || 0;
  const totalAreaAchieved = (getPDOCumulative(irrigationAreaIndicator) + getPDOCumulative(floodAreaIndicator)) || 0;
  const totalAreaPercentage = totalAreaTarget > 0 ? (totalAreaAchieved / totalAreaTarget) * 100 : 0;

  const totalPeopleTarget = (getPDOTarget(irrigationPeopleIndicator) + getPDOTarget(floodPeopleIndicator)) || 0;
  const totalPeopleAchieved = (getPDOCumulative(irrigationPeopleIndicator) + getPDOCumulative(floodPeopleIndicator)) || 0;
  const totalPeoplePercentage = totalPeopleTarget > 0 ? (totalPeopleAchieved / totalPeopleTarget) * 100 : 0;

  // PDO Chart Data
  const pdoAreaData = [
    { name: "Irrigation Area", target: getPDOTarget(irrigationAreaIndicator), achieved: getPDOCumulative(irrigationAreaIndicator), color: "#3B82F6" },
    { name: "Flood Area", target: getPDOTarget(floodAreaIndicator), achieved: getPDOCumulative(floodAreaIndicator), color: "#10B981" }
  ];

  const pdoPeopleData = [
    { name: "Irrigation People", target: getPDOTarget(irrigationPeopleIndicator), achieved: getPDOCumulative(irrigationPeopleIndicator), color: "#8B5CF6" },
    { name: "Flood People", target: getPDOTarget(floodPeopleIndicator), achieved: getPDOCumulative(floodPeopleIndicator), color: "#F59E0B" }
  ];

  // Helper functions for icons and colors
  const getIndicatorIcon = (id: number): JSX.Element => {
    const icons: { [key: number]: JSX.Element } = {
      1: <LandPlot className="w-5 h-5" />,
      2: <Users className="w-5 h-5" />,
      3: <Sprout className="w-5 h-5" />,
      4: <Tractor className="w-5 h-5" />,
      5: <Tractor className="w-5 h-5" />,
      6: <HardHat className="w-5 h-5" />,
      7: <DollarSign className="w-5 h-5" />,
      8: <Ruler className="w-5 h-5" />
    };
    return icons[id] || <Target className="w-5 h-5" />;
  };

  const getIndicatorColor = (id: number): string => {
    const colors: { [key: number]: string } = {
      1: "#3B82F6",
      2: "#8B5CF6",
      3: "#10B981",
      4: "#F59E0B",
      5: "#F59E0B",
      6: "#EF4444",
      7: "#14B8A6",
      8: "#6B7280"
    };
    return colors[id] || "#3B82F6";
  };

  // Main indicators with proper typing
  const mainIndicators: MainIndicator[] = useMemo(() => {
    return indicators
      .filter((i: Indicator) => i.id <= 8)
      .map((ind: Indicator) => ({
        ...ind,
        icon: getIndicatorIcon(ind.id),
        color: getIndicatorColor(ind.id),
        subIndicators: indicators.filter((sub: Indicator) => 
          (ind.id === 1 && [13, 14, 15].includes(sub.id)) ||
          (ind.id === 3 && [16, 17].includes(sub.id)) ||
          (ind.id === 6 && [18, 19, 20, 21].includes(sub.id)) ||
          (ind.id === 8 && [22, 23].includes(sub.id))
        )
      }));
  }, [indicators]);

  // PBC Indicators with proper typing
  const pbcIndicators: Indicator[] = useMemo(() => {
    return indicators.filter((i: Indicator) => i.id >= 9 && i.id <= 12);
  }, [indicators]);

  // Component distribution data
  const componentData = [
    { name: "Climate Resilient", value: 7, color: "#3B82F6", fullName: "Component 1: Climate Resilient Irrigation" },
    { name: "Flood Risk", value: 1, color: "#10B981", fullName: "Component 2: Flood Risk Reduction" }
  ];

  // PBC Allocation Data
  const pbcAllocationData = [
    { name: "PBC A - Institutional Mechanism", value: 9.8, color: "#EC4899", fullName: "PBC A: Institutional Mechanism for Water Governance" },
    { name: "PBC B - Irrigation & Drought Platform", value: 12.6, color: "#14B8A6", fullName: "PBC B: Irrigation & Drought Management Platform" },
    { name: "PBC C - Flood Forecasting", value: 4.2, color: "#F59E0B", fullName: "PBC C: Flood Forecasting & Early Warning" },
    { name: "PBC D - Policy & Regulatory", value: 1.4, color: "#3B82F6", fullName: "PBC D: Policy & Regulatory Framework" }
  ];

  // Progress distribution
  const progressData = useMemo(() => {
    const excellent = mainIndicators.filter((m: MainIndicator) => Number(m?.percentage) >= 75).length;
    const onTrack = mainIndicators.filter((m: MainIndicator) => Number(m?.percentage) >= 40 && Number(m?.percentage) < 75).length;
    const behind = mainIndicators.filter((m: MainIndicator) => Number(m?.percentage) < 40).length;
    
    return [
      { name: "Excellent (75%+)", value: excellent, color: "#10B981", count: excellent },
      { name: "On Track (40-75%)", value: onTrack, color: "#F59E0B", count: onTrack },
      { name: "Behind (<40%)", value: behind, color: "#EF4444", count: behind }
    ];
  }, [mainIndicators]);

  const pbcProgressData = useMemo(() => {
    const achieved = pbcIndicators.filter((p: Indicator) => Number(p?.percentage || 0) >= 100).length;
    const partial = pbcIndicators.filter((p: Indicator) => Number(p?.percentage || 0) > 0 && Number(p?.percentage || 0) < 100).length;
    const notStarted = pbcIndicators.filter((p: Indicator) => Number(p?.percentage || 0) === 0).length;
    
    return [
      { name: "Achieved (100%)", value: achieved, color: "#10B981", count: achieved },
      { name: "Partial Progress", value: partial, color: "#F59E0B", count: partial },
      { name: "Not Started", value: notStarted, color: "#EF4444", count: notStarted }
    ];
  }, [pbcIndicators]);

  // Filter indicators
  const filteredMainIndicators = useMemo(() => {
    return mainIndicators.filter((indicator: MainIndicator) => {
      const matchesSearch = searchQuery === '' || 
        indicator.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        indicator.component_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesComponent = selectedComponents.length === 0 || 
        (indicator.component_name && selectedComponents.includes(indicator.component_name));
      
      const matchesCategory = selectedCategories.length === 0 || 
        (indicator.category && selectedCategories.includes(indicator.category));
      
      return matchesSearch && matchesComponent && matchesCategory;
    });
  }, [mainIndicators, searchQuery, selectedComponents, selectedCategories]);

  // Get unique components and categories
  const uniqueComponents = useMemo(() => {
    const comps = new Set(mainIndicators.map((i: MainIndicator) => i.component_name).filter(Boolean) as string[]);
    return Array.from(comps);
  }, [mainIndicators]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(mainIndicators.map((i: MainIndicator) => i.category).filter(Boolean) as string[]);
    return Array.from(cats);
  }, [mainIndicators]);

  // Chart components for fullscreen view
  const renderFullscreenChart = () => {
    if (!fullscreenChart) return null;

    // build a single chart element and pass it as the single child to ResponsiveContainer
    let chartElement: JSX.Element | null = null;

    if (fullscreenChart === 'pdo-area') {
      chartElement = (
        <BarChart data={pdoAreaData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString()} Ha`, ""]} />
          <Legend />
          <Bar dataKey="target" fill="#3B82F6" name="Target (Ha)" />
          <Bar dataKey="achieved" fill="#10B981" name="Achieved (Ha)" />
        </BarChart>
      );
    } else if (fullscreenChart === 'pdo-people') {
      chartElement = (
        <BarChart data={pdoPeopleData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString()} People`, ""]} />
          <Legend />
          <Bar dataKey="target" fill="#8B5CF6" name="Target (People)" />
          <Bar dataKey="achieved" fill="#F59E0B" name="Achieved (People)" />
        </BarChart>
      );
    } else if (fullscreenChart === 'component') {
      chartElement = (
        <PieChart>
          <Pie
            data={componentData}
            cx="50%"
            cy="50%"
            innerRadius={100}
            outerRadius={200}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
          >
            {componentData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      );
    } else if (fullscreenChart === 'pbc') {
      chartElement = (
        <PieChart>
          <Pie
            data={pbcAllocationData}
            cx="50%"
            cy="50%"
            innerRadius={100}
            outerRadius={200}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name.split(' - ')[0]} (${((percent ?? 0) * 100).toFixed(0)}%)`}
          >
            {pbcAllocationData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => [`US$ ${value}M`, "Allocation"]} />
        </PieChart>
      );
    } else if (fullscreenChart === 'progress') {
      const dataForProgress =
        activeTab === 'pdo'
          ? [
              { name: "Irrigation Area", value: totalAreaPercentage, color: "#3B82F6" },
              { name: "Flood Area", value: (getPDOPercentage(floodAreaIndicator) || 0), color: "#10B981" },
              { name: "Irrigation People", value: (getPDOPercentage(irrigationPeopleIndicator) || 0), color: "#8B5CF6" },
              { name: "Flood People", value: (getPDOPercentage(floodPeopleIndicator) || 0), color: "#F59E0B" }
            ]
          : activeTab === 'intermediate'
          ? progressData
          : pbcProgressData;

      chartElement = (
        <BarChart data={dataForProgress} layout="vertical">
          <XAxis type="number" unit="%" />
          <YAxis type="category" dataKey="name" width={150} />
          <Tooltip formatter={(value: any) => [`${Number(value).toFixed(1)}%`, ""]} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {dataForProgress.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {fullscreenChart === 'pdo-area' && 'PDO1 - Area Under Improved Services'}
              {fullscreenChart === 'pdo-people' && 'PDO2 - People Benefitting'}
              {fullscreenChart === 'component' && 'Indicators by Component'}
              {fullscreenChart === 'pbc' && 'PBC Funding Distribution'}
              {fullscreenChart === 'progress' && 'Progress Distribution'}
            </h3>
            <button
              onClick={() => setFullscreenChart(null)}
              className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 h-[70vh]">
            <ResponsiveContainer width="100%" height="100%">
              {chartElement as any}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  if (indicatorsLoading || summaryLoading || pdoLoading || pdoSummaryLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Droplets className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mt-6">Loading Dashboard</h3>
          <p className="text-gray-500 mt-2">Bihar Water Security Project M&E Data</p>
          <div className="mt-6 flex justify-center gap-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#003087] via-[#00205b] to-[#001a4a] text-white shadow-2xl ">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20">
                <Droplets className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  M&E Performance Dashboard
                  <span className="bg-blue-500/30 text-xs px-3 py-1 rounded-full font-normal animate-pulse">
                    Live
                  </span>
                </h1>
                <div className="flex items-center gap-3 text-sm text-blue-200">
                  <span>Bihar Water Security Project</span>
                  <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
                  <span>2 PDO | 8 Intermediate | 4 PBC</span>
                  <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
                  <span>Updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition flex items-center gap-2 border border-white/20">
                <Calendar className="w-4 h-4" />
                <select 
                  className="bg-transparent text-white text-sm outline-none cursor-pointer"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                >
                  <option value="quarter" className="bg-[#003087]">Current Quarter</option>
                  <option value="half-year" className="bg-[#003087]">Current Half-Year</option>
                  <option value="year" className="bg-[#003087]">Current Year</option>
                  <option value="project-life" className="bg-[#003087]">Project Life</option>
                </select>
              </button>
              <button 
                onClick={() => setShowReportPanel(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl transition flex items-center gap-2 border border-green-500"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm">Generate Report</span>
              </button>
              <button className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition flex items-center gap-2 border border-white/20">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Total Indicators
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{indicators.length + 4}</p>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  2 PDO | 8 Intermediate | 4 PBC
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-green-500" />
              <span>+2 from last quarter</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-600 hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Droplets className="w-4 h-4" />
                  Component 1
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">7</p>
                <p className="text-xs text-gray-500 mt-2">Climate Resilient Irrigation</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <Droplets className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>4 indicators on track</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-amber-600 hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Component 2
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">1</p>
                <p className="text-xs text-gray-500 mt-2">Flood Risk Reduction</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-xl">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-500" />
              <span>Needs attention</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-600 hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <AwardIcon className="w-4 h-4" />
                  Component 3
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">4</p>
                <p className="text-xs text-gray-500 mt-2">Water Governance (PBCs)</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <AwardIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-purple-500" />
              <span>2 PBCs achieved</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-600 hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Overall Progress
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatPercentage(summary?.overallPercentage)}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${Math.min(Number(summary?.overallPercentage || 0), 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-indigo-100 p-3 rounded-xl">
                <Activity className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-400 flex items-center gap-1">
              <span>{progressData[0].count} excellent, {progressData[1].count} on track, {progressData[2].count} behind</span>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        {/* <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search indicators, components, or categories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(selectedComponents.length > 0 || selectedCategories.length > 0) && (
              <span className="ml-1 px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs">
                {selectedComponents.length + selectedCategories.length}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 border-l pl-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
              title="Grid View"
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
              title="Table View"
            >
              <Table className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition" title="Export Data">
              <FileSpreadsheet className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition" title="Print">
              <Printer className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition" title="Share">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div> */}

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-blue-200 animate-slideDown">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter Indicators
              </h3>
              <button
                onClick={() => {
                  setSelectedComponents([]);
                  setSelectedCategories([]);
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Components</label>
                <div className="space-y-2">
                  {uniqueComponents.map((comp: string) => (
                    <label key={comp} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedComponents.includes(comp)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedComponents([...selectedComponents, comp]);
                          } else {
                            setSelectedComponents(selectedComponents.filter(c => c !== comp));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{comp}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Categories</label>
                <div className="space-y-2">
                  {uniqueCategories.map((cat: string) => (
                    <label key={cat} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, cat]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== cat));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab("pdo")}
            className={`px-6 py-3 rounded-xl font-medium transition flex items-center gap-2 ${
              activeTab === "pdo" 
                ? "bg-green-600 text-white shadow-lg scale-105" 
                : "bg-white text-gray-600 hover:bg-gray-50 hover:scale-102"
            }`}
          >
            <Target className="w-5 h-5" />
            PDO Indicators (2)
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {totalAreaPercentage >= 50 ? '🟢' : '🟡'}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("intermediate")}
            className={`px-6 py-3 rounded-xl font-medium transition flex items-center gap-2 ${
              activeTab === "intermediate" 
                ? "bg-blue-600 text-white shadow-lg scale-105" 
                : "bg-white text-gray-600 hover:bg-gray-50 hover:scale-102"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Intermediate Indicators (8)
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {progressData[0].count} ✅ {progressData[2].count} ⚠️
            </span>
          </button>
          <button
            onClick={() => setActiveTab("pbc")}
            className={`px-6 py-3 rounded-xl font-medium transition flex items-center gap-2 ${
              activeTab === "pbc" 
                ? "bg-purple-600 text-white shadow-lg scale-105" 
                : "bg-white text-gray-600 hover:bg-gray-50 hover:scale-102"
            }`}
          >
            <AwardIcon className="w-5 h-5" />
            PBC Indicators (4)
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {pbcProgressData[0].count} 🏆
            </span>
          </button>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* PDO Area Chart */}
          {activeTab === "pdo" && (
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-600" />
                  PDO1 - Area Under Improved Services
                </h3>
                <button
                  onClick={() => setFullscreenChart('pdo-area')}
                  className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition opacity-0 group-hover:opacity-100"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pdoAreaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => [`${Number(value).toLocaleString()} Ha`, ""]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="target" fill="#3B82F6" name="Target (Ha)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="achieved" fill="#10B981" name="Achieved (Ha)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">Target</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">Achieved</span>
                </div>
              </div>
            </div>
          )}

          {/* PDO People Chart */}
          {activeTab === "pdo" && (
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Users2 className="w-5 h-5 text-purple-600" />
                  PDO2 - People Benefitting
                </h3>
                <button
                  onClick={() => setFullscreenChart('pdo-people')}
                  className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition opacity-0 group-hover:opacity-100"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pdoPeopleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => [`${Number(value).toLocaleString()} People`, ""]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="target" fill="#8B5CF6" name="Target (People)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="achieved" fill="#F59E0B" name="Achieved (People)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Component Distribution */}
          {activeTab === "intermediate" && (
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-blue-600" />
                  Indicators by Component
                </h3>
                <button
                  onClick={() => setFullscreenChart('component')}
                  className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition opacity-0 group-hover:opacity-100"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={componentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    >
                      {componentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any) => [`${value} indicators`, name]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {componentData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PBC Allocation Chart */}
          {activeTab === "pbc" && (
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  PBC Funding Distribution (US$ Million)
                </h3>
                <button
                  onClick={() => setFullscreenChart('pbc')}
                  className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition opacity-0 group-hover:opacity-100"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pbcAllocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name.split(' - ')[0]} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    >
                      {pbcAllocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`US$ ${value}M`, "Allocation"]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Progress Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                {activeTab === "pdo" && "PDO Progress Status"}
                {activeTab === "intermediate" && "Progress Distribution"}
                {activeTab === "pbc" && "PBC Achievement Status"}
              </h3>
              <button
                onClick={() => setFullscreenChart('progress')}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition opacity-0 group-hover:opacity-100"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={
                    activeTab === "pdo" ? [
                      { name: "Irrigation Area", value: totalAreaPercentage, color: "#3B82F6" },
                      { name: "Flood Area", value: (getPDOPercentage(floodAreaIndicator) || 0), color: "#10B981" },
                      { name: "Irrigation People", value: (getPDOPercentage(irrigationPeopleIndicator) || 0), color: "#8B5CF6" },
                      { name: "Flood People", value: (getPDOPercentage(floodPeopleIndicator) || 0), color: "#F59E0B" }
                    ] : 
                    activeTab === "intermediate" ? progressData : pbcProgressData
                  } 
                  layout="vertical"
                >
                  <XAxis type="number" unit="%" />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`, ""]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {(activeTab === "pdo" ? [
                      { name: "Irrigation Area", value: totalAreaPercentage, color: "#3B82F6" },
                      { name: "Flood Area", value: (getPDOPercentage(floodAreaIndicator) || 0), color: "#10B981" },
                      { name: "Irrigation People", value: (getPDOPercentage(irrigationPeopleIndicator) || 0), color: "#8B5CF6" },
                      { name: "Flood People", value: (getPDOPercentage(floodPeopleIndicator) || 0), color: "#F59E0B" }
                    ] : activeTab === "intermediate" ? progressData : pbcProgressData).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Main Content - Grid or Table View */}
        {activeTab === "pdo" && viewMode === 'grid' && (
          <div className="space-y-6">
            {/* PDO1 - AREA SECTION */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <div className="w-3 h-6 bg-blue-600 rounded mr-3"></div>
                    PDO1 - Area under improved irrigation services and climate resilience
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Target: {formatNumber(totalAreaTarget)} Ha | Achieved: {formatNumber(totalAreaAchieved)} Ha</p>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {formatPercentage(totalAreaPercentage)}%
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Irrigation Area Card */}
                <div className="border rounded-xl p-5 bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition">
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
                      <span className={`font-semibold ${getProgressColor(getPDOPercentage(irrigationAreaIndicator)).text}`}>
                        {formatPercentage(getPDOPercentage(irrigationAreaIndicator))}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${Math.min(getPDOPercentage(irrigationAreaIndicator), 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">Target</p>
                      <p className="text-xl font-bold text-blue-700">
                        {formatNumber(getPDOTarget(irrigationAreaIndicator))}
                      </p>
                      <p className="text-xs text-blue-600">Hectares</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">Achieved</p>
                      <p className="text-xl font-bold text-green-700">
                        {formatNumber(getPDOCumulative(irrigationAreaIndicator))}
                      </p>
                      <p className="text-xs text-green-600">Hectares</p>
                    </div>
                  </div>
                </div>

                {/* Flood Resilience Area Card */}
                <div className="border rounded-xl p-5 bg-gradient-to-br from-cyan-50 to-white hover:shadow-md transition">
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
                      <span className={`font-semibold ${getProgressColor(getPDOPercentage(floodAreaIndicator)).text}`}>
                        {formatPercentage(getPDOPercentage(floodAreaIndicator))}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-cyan-600 transition-all duration-500"
                        style={{ width: `${Math.min(getPDOPercentage(floodAreaIndicator), 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-cyan-100 p-3 rounded-lg">
                      <p className="text-sm text-cyan-800 font-medium">Target</p>
                      <p className="text-xl font-bold text-cyan-700">
                        {formatNumber(getPDOTarget(floodAreaIndicator))}
                      </p>
                      <p className="text-xs text-cyan-600">Hectares</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">Achieved</p>
                      <p className="text-xl font-bold text-green-700">
                        {formatNumber(getPDOCumulative(floodAreaIndicator))}
                      </p>
                      <p className="text-xs text-green-600">Hectares</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Area Progress */}
              <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
                <h3 className="font-bold text-blue-800 text-lg mb-4">Overall PDO1 Progress</h3>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-3xl font-bold text-blue-700">{formatPercentage(totalAreaPercentage)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Achieved / Target</p>
                    <p className="text-xl font-bold text-gray-800">
                      {formatNumber(totalAreaAchieved)} / {formatNumber(totalAreaTarget)} Ha
                    </p>
                  </div>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${Math.min(totalAreaPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* PDO2 - PEOPLE SECTION */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <div className="w-3 h-6 bg-green-600 rounded mr-3"></div>
                    PDO2 - People with enhanced resilience to climate risks
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Target: {formatNumber(totalPeopleTarget)} People | Achieved: {formatNumber(totalPeopleAchieved)} People</p>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {formatPercentage(totalPeoplePercentage)}%
                </div>
              </div>

              {/* Total People Progress Card */}
              <div className="border rounded-xl p-5 bg-gradient-to-br from-green-50 to-white mb-6 hover:shadow-md transition">
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
                    <span className="font-semibold text-green-600">{formatPercentage(totalPeoplePercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-green-600 transition-all duration-500"
                      style={{ width: `${Math.min(totalPeoplePercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">Target</p>
                    <p className="text-xl font-bold text-green-700">{formatNumber(totalPeopleTarget)} People</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">Achieved</p>
                    <p className="text-xl font-bold text-green-700">{formatNumber(totalPeopleAchieved)} People</p>
                  </div>
                </div>
              </div>

              {/* FEMALE & YOUTH BREAKDOWN CARDS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Female Beneficiaries Card */}
                <div className="border rounded-xl p-5 bg-gradient-to-br from-purple-50 to-white hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-purple-800 text-lg">People benefiting from climate resilient infrastructure - Female</h3>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span className="font-semibold text-purple-600">
                        {totalPeopleTarget > 0
                          ? formatPercentage((totalPeopleAchieved * 0.49) / (totalPeopleTarget * 0.49) * 100)
                          : "0.0"}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-purple-600 transition-all duration-500"
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
                        {formatNumber(Math.round(totalPeopleTarget * 0.49))}
                      </p>
                      <p className="text-xs text-purple-600">Women</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">Achieved</p>
                      <p className="text-xl font-bold text-green-700">
                        {formatNumber(Math.round(totalPeopleAchieved * 0.49))}
                      </p>
                      <p className="text-xs text-green-600">Women</p>
                    </div>
                  </div>
                </div>

                {/* Youth Beneficiaries Card */}
                <div className="border rounded-xl p-5 bg-gradient-to-br from-teal-50 to-white hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-teal-800 text-lg">People benefiting from climate resilient infrastructure - Youth</h3>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span className="font-semibold text-teal-600">
                        {totalPeopleTarget > 0
                          ? formatPercentage((totalPeopleAchieved * 0.29) / (totalPeopleTarget * 0.29) * 100)
                          : "0.0"}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-teal-600 transition-all duration-500"
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
                        {formatNumber(Math.round(totalPeopleTarget * 0.29))}
                      </p>
                      <p className="text-xs text-teal-600">Youth</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">Achieved</p>
                      <p className="text-xl font-bold text-green-700">
                        {formatNumber(Math.round(totalPeopleAchieved * 0.29))}
                      </p>
                      <p className="text-xs text-green-600">Youth</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2 Cards in a row - Irrigation and Flood */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Irrigation Beneficiaries Card */}
                <div className="border rounded-xl p-5 bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-blue-800 text-lg">People benefitting from improved irrigation infrastructure</h3>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span className={`font-semibold ${getProgressColor(getPDOPercentage(irrigationPeopleIndicator)).text}`}>
                        {formatPercentage(getPDOPercentage(irrigationPeopleIndicator))}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${Math.min(getPDOPercentage(irrigationPeopleIndicator), 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">Target</p>
                      <p className="text-xl font-bold text-blue-700">
                        {formatNumber(getPDOTarget(irrigationPeopleIndicator))}
                      </p>
                      <p className="text-xs text-blue-600">People</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">Achieved</p>
                      <p className="text-xl font-bold text-green-700">
                        {formatNumber(getPDOCumulative(irrigationPeopleIndicator))}
                      </p>
                      <p className="text-xs text-green-600">People</p>
                    </div>
                  </div>
                </div>

                {/* Flood Protection Beneficiaries Card */}
                <div className="border rounded-xl p-5 bg-gradient-to-br from-cyan-50 to-white hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-cyan-800 text-lg">People benefitting from strengthened embankments and riverbanks</h3>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span className={`font-semibold ${getProgressColor(getPDOPercentage(floodPeopleIndicator)).text}`}>
                        {formatPercentage(getPDOPercentage(floodPeopleIndicator))}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-cyan-600 transition-all duration-500"
                        style={{ width: `${Math.min(getPDOPercentage(floodPeopleIndicator), 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-cyan-100 p-3 rounded-lg">
                      <p className="text-sm text-cyan-800 font-medium">Target</p>
                      <p className="text-xl font-bold text-cyan-700">
                        {formatNumber(getPDOTarget(floodPeopleIndicator))}
                      </p>
                      <p className="text-xs text-cyan-600">People</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">Achieved</p>
                      <p className="text-xl font-bold text-green-700">
                        {formatNumber(getPDOCumulative(floodPeopleIndicator))}
                      </p>
                      <p className="text-xs text-green-600">People</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Intermediate Indicators - Grid View */}
        {activeTab === "intermediate" && viewMode === 'grid' && (
          <div className="space-y-4 mb-6">
            {/* Main Indicators Title */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                8 Main Intermediate Indicators
                {searchQuery && <span className="text-sm font-normal text-gray-500">(Filtered: {filteredMainIndicators.length})</span>}
              </h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Excellent ({progressData[0].count})
                </span>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <Minus className="w-3 h-3" />
                  On Track ({progressData[1].count})
                </span>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Behind ({progressData[2].count})
                </span>
              </div>
            </div>

            {filteredMainIndicators.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No indicators found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredMainIndicators.map((indicator: MainIndicator, index: number) => {
                const isExpanded = expandedId === indicator.id;
                const progress = Number(indicator?.percentage || 0);
                const progressStyle = getProgressColor(progress);
                
                return (
                  <div key={indicator.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition border border-gray-100">
                    {/* Indicator Row */}
                    <div 
                      className="p-6 cursor-pointer hover:bg-gray-50 transition"
                      onClick={() => setExpandedId(isExpanded ? null : indicator.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                          backgroundColor: `${indicator.color}15`,
                          color: indicator.color
                        }}>
                          {indicator.icon}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
                                <h3 className="text-lg font-semibold text-gray-900">{indicator.name}</h3>
                                {getStatusBadge(progressStyle.label)}
                              </div>
                              
                              <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                                <span className="text-gray-600 flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  {indicator.component_name}
                                </span>
                                {indicator.subcomponent && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-600">{indicator.subcomponent}</span>
                                  </>
                                )}
                                {indicator.subIndicators?.length > 0 && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-blue-600 font-medium">
                                      {indicator.subIndicators.length} Sub-indicators
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <div className="text-2xl font-bold" style={{ color: indicator.color }}>
                                  {formatPercentage(progress)}%
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {formatNumber(indicator.cumulative)} / {formatNumber(indicator.target)} {indicator.unit}
                                </div>
                              </div>
                              {indicator.subIndicators?.length > 0 && (
                                <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 w-full bg-gray-100 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${progressStyle.bg} transition-all duration-500`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sub Indicators */}
                    {isExpanded && indicator.subIndicators?.length > 0 && (
                      <div className="border-t border-gray-100 bg-gray-50 p-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Sub-Indicators ({indicator.subIndicators.length})
                        </h4>
                        
                        <div className="grid grid-cols-1 gap-3">
                          {indicator.subIndicators.map((sub: Indicator, idx: number) => {
                            const subProgress = Number(sub?.percentage || 0);
                            const subProgressStyle = getProgressColor(subProgress);
                            
                            return (
                              <div 
                                key={sub.id} 
                                className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedIndicator(sub);
                                  setShowModal(true);
                                }}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                      Sub #{idx + 1}
                                    </span>
                                    <h5 className="font-medium text-gray-900">{sub.name}</h5>
                                  </div>
                                  <span className={`text-sm font-semibold ${subProgressStyle.text}`}>
                                    {formatPercentage(subProgress)}%
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                                  <div>
                                    <span className="text-gray-500">Target:</span>
                                    <span className="ml-1 font-medium">{formatNumber(sub.target)}</span>
                                    <span className="ml-1 text-xs text-gray-400">{sub.unit}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Achieved:</span>
                                    <span className="ml-1 font-medium text-green-600">
                                      {formatNumber(sub.cumulative)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Baseline:</span>
                                    <span className="ml-1">{formatNumber(sub.baseline)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Frequency:</span>
                                    <span className="ml-1">{sub.frequency || 'Yearly'}</span>
                                  </div>
                                </div>

                                <div className="w-full bg-gray-100 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${subProgressStyle.bg} transition-all duration-500`}
                                    style={{ width: `${Math.min(subProgress, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Table View for Intermediate */}
        {activeTab === "intermediate" && viewMode === 'table' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indicator</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Component</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Achieved</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMainIndicators.map((indicator: MainIndicator, idx: number) => {
                    const progress = Number(indicator?.percentage || 0);
                    const progressStyle = getProgressColor(progress);
                    
                    return (
                      <tr key={indicator.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-500">#{idx + 1}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{indicator.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{indicator.component_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{indicator.unit}</td>
                        <td className="px-6 py-4 text-sm text-right font-medium">{formatNumber(indicator.target)}</td>
                        <td className="px-6 py-4 text-sm text-right font-medium text-green-600">{formatNumber(indicator.cumulative)}</td>
                        <td className="px-6 py-4 text-sm text-right font-bold" style={{ color: progressStyle.text }}>
                          {formatPercentage(progress)}%
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${progressStyle.light} ${progressStyle.text}`}>
                            {progressStyle.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PBC Indicators */}
        {activeTab === "pbc" && viewMode === 'grid' && (
          <div className="space-y-4 mb-6">
            {/* PBC Title */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <AwardIcon className="w-6 h-6 text-purple-600" />
                4 Performance Based Conditions (PBC) Indicators
              </h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Achieved ({pbcProgressData[0].count})
                </span>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <Minus className="w-3 h-3" />
                  Partial ({pbcProgressData[1].count})
                </span>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Not Started ({pbcProgressData[2].count})
                </span>
              </div>
            </div>

            {pbcIndicators.map((indicator: Indicator, index: number) => {
              const progress = Number(indicator?.percentage || 0);
              const progressStyle = getProgressColor(progress >= 100 ? 100 : progress);
              const pbcColors = ["#EC4899", "#14B8A6", "#F59E0B", "#3B82F6"];
              const pbcIcons = [
                <GitBranch className="w-5 h-5" />,
                <GanttChart className="w-5 h-5" />,
                <Zap className="w-5 h-5" />,
                <FileCheck className="w-5 h-5" />
              ];
              
              return (
                <div key={indicator.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition border border-purple-100">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                        backgroundColor: `${pbcColors[index]}15`,
                        color: pbcColors[index]
                      }}>
                        {pbcIcons[index] || <AwardIcon className="w-5 h-5" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-400">PBC {String.fromCharCode(65 + index)}</span>
                              <h3 className="text-lg font-semibold text-gray-900">{indicator.name}</h3>
                              <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-purple-100 text-purple-700">
                                Performance Based Condition
                              </span>
                              {progress >= 100 ? (
                                <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-green-100 text-green-700 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Achieved
                                </span>
                              ) : progress > 0 ? (
                                <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-amber-100 text-amber-700">
                                  In Progress
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-gray-100 text-gray-700">
                                  Not Started
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-gray-600 flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                {indicator.component_name || 'Water Governance'}
                              </span>
                              {indicator.subcomponent && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-600">{indicator.subcomponent}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-2xl font-bold" style={{ color: pbcColors[index] }}>
                                {progress >= 100 ? '100%' : formatPercentage(progress) + '%'}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Status: {progress >= 100 ? 'Completed' : progress > 0 ? 'Ongoing' : 'Pending'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 w-full bg-gray-100 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${progressStyle.bg} transition-all duration-500`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Report Module */}
        {showReportPanel && (
          <MEReportModule 
            onClose={() => setShowReportPanel(false)}
            indicators={indicators}
            pdoIndicators={pdoIndicators}
            summary={summary}
            mainIndicators={mainIndicators}
            pbcIndicators={pbcIndicators}
            progressData={progressData}
            pbcProgressData={pbcProgressData}
            totalAreaPercentage={totalAreaPercentage}
            totalPeoplePercentage={totalPeoplePercentage}
            totalAreaTarget={totalAreaTarget}
            totalAreaAchieved={totalAreaAchieved}
            totalPeopleTarget={totalPeopleTarget}
            totalPeopleAchieved={totalPeopleAchieved}
            irrigationAreaIndicator={irrigationAreaIndicator}
            floodAreaIndicator={floodAreaIndicator}
            irrigationPeopleIndicator={irrigationPeopleIndicator}
            floodPeopleIndicator={floodPeopleIndicator}
          />
        )}

        {/* Fullscreen Chart Modal */}
        {fullscreenChart && renderFullscreenChart()}

        {/* Footer */}
        {/* <div className="mt-8 text-center text-sm text-gray-500 border-t pt-6">
          <p>© 2025 Bihar Water Security and Irrigation Modernization Project • M&E Dashboard v2.0</p>
          <p className="text-xs mt-1">Last updated: {new Date().toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div> */}
      </div>

      {/* Modal for Indicator Details */}
      {showModal && selectedIndicator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6" />
                <h3 className="text-xl font-semibold">Indicator Details</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedIndicator.name}</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {selectedIndicator.category}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                    {selectedIndicator.component_name}
                  </span>
                  {selectedIndicator.subcomponent && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {selectedIndicator.subcomponent}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getProgressColor(selectedIndicator.percentage).light} ${getProgressColor(selectedIndicator.percentage).text}`}>
                    {getProgressColor(selectedIndicator.percentage).label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl">
                  <p className="text-sm text-blue-600 mb-1">Target Value</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {formatNumber(selectedIndicator.target)}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">{selectedIndicator.unit}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl">
                  <p className="text-sm text-green-600 mb-1">Achieved Value</p>
                  <p className="text-3xl font-bold text-green-900">
                    {formatNumber(selectedIndicator.cumulative)}
                  </p>
                  <p className="text-sm text-green-600 mt-1">{selectedIndicator.unit}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Progress</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${getProgressColor(selectedIndicator.percentage).bg} transition-all duration-500`}
                      style={{ width: `${Math.min(Number(selectedIndicator.percentage || 0), 100)}%` }}
                    ></div>
                  </div>
                  <span className={`text-2xl font-bold ${getProgressColor(selectedIndicator.percentage).text}`}>
                    {formatPercentage(selectedIndicator.percentage)}%
                  </span>
                </div>
              </div>

              <div className="border rounded-xl divide-y">
                <div className="grid grid-cols-2 p-4">
                  <div>
                    <p className="text-sm text-gray-500">Baseline</p>
                    <p className="font-medium mt-1">{formatNumber(selectedIndicator.baseline)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Frequency</p>
                    <p className="font-medium mt-1">{selectedIndicator.frequency || 'Yearly'}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-2">Data Source</p>
                  <p className="font-medium">{selectedIndicator.data_source || 'Not specified'}</p>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-2">Responsible Agency</p>
                  <p className="font-medium">{selectedIndicator.responsible_agency || 'Not specified'}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Verification Protocol</p>
                    <p className="text-sm text-blue-800 mt-1">
                      Progress is reported through PIR, PIU Reports, and verified by PMU-PMTC.
                    </p>
                  </div>
                </div>
              </div>

              {selectedIndicator.achievements && (
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Key Achievements</p>
                      <p className="text-sm text-green-800 mt-1">{selectedIndicator.achievements}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedIndicator.challenges && (
                <div className="bg-amber-50 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900">Challenges</p>
                      <p className="text-sm text-amber-800 mt-1">{selectedIndicator.challenges}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedIndicator.recommendations && (
                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-900">Recommendations</p>
                      <p className="text-sm text-purple-800 mt-1">{selectedIndicator.recommendations}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}