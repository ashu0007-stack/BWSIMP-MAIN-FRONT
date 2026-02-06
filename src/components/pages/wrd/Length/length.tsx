import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { X, Shield, Download as DownloadIcon, Eye, ChevronDown, Plus } from 'lucide-react';
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
  Cell
} from "recharts";
import AddProgressForm from "./AddProgressForm";
import AddSpurProgressForm from "./AddSpurProgress";
import { useWorks, usePackageProgress, useAddProgressEntry, useAddSpurProgressEntry } from "@/hooks/wrdHooks/useLength";
import SpurProgressComponent from "./SpurProgressComponent";
import { useReportGenerator } from "./lengthReport";
import { useSpurReportGenerator } from "./spurReport";

interface SpurData {
  id: any;
  completed_km: number;
  completion_percentage: number;
  spur_id: number;
  spur_name: string;
  location_km: number;
  progress_date: string | null;
  status: string;
  spur_length?: number;
}

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
  has_spurs: number;
  total_spurs?: number;
  agreement_no?: string;
  contract_awarded_amount?: number;
  start_date?: string;
  end_date?: string;
  zone_id?: number;
  circle_id?: number;
  division_id?: number;
}

interface LengthwiseItem {
  item: string;
  progress: number;
  target: number;
}

interface LengthDetailPageProps {
  workId?: number | string;
  packageNumber?: string;
  workName?: string;
  contractorName?: string;
  has_spur? : number;
  onClose?: () => void;
}

interface UserData {
  username: string;
  email: string;
  dept_id: number;
  role: string;
  role_id?: number;
  role_name?: string;
  department?: string;
  designation?: string;
  levelname?: string;
  levelid?: number;
  zone_id?: number;
  circle_id?: number;
  division_id?: number;
  user_name?: string;
  full_name?: string;
}

export default function LengthProgressPage({
  packageNumber,
  workName,
  contractorName,
  onClose }: LengthDetailPageProps) {

  const [selectedPackage, setSelectedPackage] = useState<string | null>(packageNumber || null);
  const [showForm, setShowForm] = useState(false);
  const [showSpurForm, setShowSpurForm] = useState(false);
  const [selectedRange, setSelectedRange] = useState<[number, number]>([0, 0]);
  const [selectedSpur, setSelectedSpur] = useState<SpurData | null>(null);
  const [editingEntry, setEditingEntry] = useState<ProgressEntry | null>(null);
  const [editingSpurEntry, setEditingSpurEntry] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const queryClient = useQueryClient();
  
  const { data: works = [] } = useWorks();
  const { data: packageData } = usePackageProgress(selectedPackage);
  const addProgressMutation = useAddProgressEntry();
  const addSpurProgressMutation = useAddSpurProgressEntry();
  
  // Load user data
  useEffect(() => {
    const getUserData = () => {
      try {
        if (typeof window !== "undefined") {
          const userDetails = sessionStorage.getItem("userdetail");

          if (userDetails) {
            try {
              const parsedData = JSON.parse(userDetails);
              const userData: UserData = {
                username: parsedData.full_name || parsedData.user_name || "Unknown User",
                email: parsedData.email || "unknown@example.com",
                dept_id: parsedData.department_id || 1,
                role: parsedData.role_name || "user",
                role_id: parsedData.role_id,
                role_name: parsedData.role_name,
                department: parsedData.department_name,
                designation: parsedData.designation_name,
                levelname: parsedData.level_name,
                levelid: parsedData.user_level_id,
                zone_id: parsedData.zone_id,
                circle_id: parsedData.circle_id,
                division_id: parsedData.division_id,
                user_name: parsedData.user_name,
                full_name: parsedData.full_name
              };

              setUser(userData);
              setUserRole(parsedData.role_name || '');
            } catch (parseError) {
              console.error("Error parsing user data:", parseError);
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    getUserData();
  }, []);

  // Filter works based on user's hierarchy
  const filteredWorks = useMemo(() => {
    // 1. Check if user is super admin (role_id = 1)
    const isSuperAdmin = user?.role_id === 1;
    
    // 2. If super admin, show all works
    if (isSuperAdmin) {
      return works.filter(
        (w: any) =>
          w.package_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.work_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.contractor_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 3. For non-super admin users, filter based on hierarchy
    return works.filter((w: any) => {
      // Check hierarchy matching
      let matchesHierarchy = true;
      
      // Check zone if user has zone_id
      if (user?.zone_id) {
        matchesHierarchy = matchesHierarchy && w.zone_id === user.zone_id;
      }
      
      // Check circle if user has circle_id
      if (user?.circle_id) {
        matchesHierarchy = matchesHierarchy && w.circle_id === user.circle_id;
      }
      
      // Check division if user has division_id
      if (user?.division_id) {
        matchesHierarchy = matchesHierarchy && w.division_id === user.division_id;
      }
      
      // Check search term
      const matchesSearch = 
        searchTerm === '' ||
        w.package_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.work_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.contractor_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesHierarchy && matchesSearch;
    });
  }, [works, user, searchTerm]);

  const spurProgress: SpurData[] = packageData?.spurs?.map((spur: any) => ({
    spur_id: spur.spur_id,
    spur_name: spur.spur_name,
    completed_km: spur.completed_km,
    location_km: spur.location_km,
    progress_date: spur.progress_date,
    status: spur.status || 'not_started',
    spur_length: spur.spur_length || 0
  })) || [];

  const selectedWork = useMemo(() => 
    works.find((w: any) => w.package_number === selectedPackage),
    [works, selectedPackage]
  );

  const canAddProgress = () => {
    if (!user) return false;
    
    // Super admin can always add progress
    if (user.role_id === 1) return true;
    
    // Check if user is in the correct hierarchy for the selected work
    if (selectedPackage && selectedWork) {
      // Check zone
      if (user.zone_id && selectedWork.zone_id !== user.zone_id) {
        return false;
      }
      // Check circle
      if (user.circle_id && selectedWork.circle_id !== user.circle_id) {
        return false;
      }
      // Check division
      if (user.division_id && selectedWork.division_id !== user.division_id) {
        return false;
      }
    }
    
    // Allow specific roles (Operator or role_id 5)
    const allowedRoles = ['Operator'];
    return allowedRoles.includes(user.role_name || user.role || '') || 
           [5].includes(user.role_id || 0);
  };

  const progressEntries: ProgressEntry[] = packageData?.progress || [];
  const targetKm: number = packageData?.target_km || 0;
  const hasSpurs: boolean = selectedWork?.has_spurs === 1;
  const work_start_range: number = packageData?.work_start_range;
  const work_end_range: number = packageData?.work_end_range;

  const lengthwiseData: LengthwiseItem[] = useMemo(() => {
    if (hasSpurs) return [];

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
  }, [progressEntries, targetKm, hasSpurs]);

  const totalEarthwork = useMemo(
    () => hasSpurs ? 0 : progressEntries.reduce((sum, e) => sum + (typeof e.earthwork_done_km === 'number' ? e.earthwork_done_km : 0), 0),
    [progressEntries, hasSpurs]
  );

  const totalLining = useMemo(
    () => hasSpurs ? 0 : progressEntries.reduce((sum, e) => sum + (typeof e.lining_done_km === 'number' ? e.lining_done_km : 0), 0),
    [progressEntries, hasSpurs]
  );

  const overallProgress = useMemo(() => {
    if (hasSpurs) return 0;
    if (!targetKm || targetKm <= 0) return 0;
    return Math.min((totalLining / targetKm) * 100, 100);
  }, [totalLining, targetKm, hasSpurs]);

  const kilometerData = useMemo(() => {
    if (hasSpurs) return [];
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
  }, [progressEntries, targetKm, hasSpurs]);

  const gaugeData = [
    { name: "Completed", value: overallProgress },
    { name: "Remaining", value: 100 - overallProgress },
  ];
  const COLORS = ["#3B82F6", "#E5E7EB"];

  const handleAddProgress = (formData: any) => {
    if (!selectedPackage || hasSpurs) return;

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

  const handleAddSpurProgress = async (formData: any) => {
    if (!selectedPackage || !hasSpurs) return;

    try {
      const storedProfile = sessionStorage.getItem("userdetail");
      const profile = storedProfile ? JSON.parse(storedProfile) : {};

      const completePayload = {
        ...formData,
        packageNumber: selectedPackage,
        created_by: profile.user_name || "System",
        created_email: profile.email || "system@example.com",
        progress_date: formData.progress_date || new Date().toISOString().split('T')[0]
      };

      const result = await addSpurProgressMutation.mutateAsync(completePayload);
      
      setShowSpurForm(false);
      setSelectedSpur(null);
      setEditingSpurEntry(null);
      
      queryClient.invalidateQueries({ queryKey: ['progress', selectedPackage] });
      
      alert(`✅ ${result.message || "Spur progress saved successfully"}`);
      
    } catch (error: any) {
      console.error('❌ Error saving spur progress:', error);
      alert(error.response?.data?.error || error.message || "Failed to save spur progress");
    }
  };

  const cumulativeSpurData = useMemo(() => {
    if (!Array.isArray(spurProgress)) return [];
    
    const spurMap = new Map();
    
    spurProgress.forEach(spur => {
      const existing = spurMap.get(spur.spur_id);
      const completed_km = spur.completed_km || 0;
      const spur_length = spur.spur_length || 0;
      
      if (!existing) {
        spurMap.set(spur.spur_id, {
          spur_id: spur.spur_id,
          spur_name: spur.spur_name,
          location_km: spur.location_km,
          spur_length: spur_length,
          total_completed_km: completed_km,
          latest_date: spur.progress_date,
          completionPercentage: spur.completion_percentage || 0,
          entries: 1
        });
      } else {
        existing.total_completed_km += completed_km;
        
        if (spur.progress_date && (!existing.latest_date || 
            new Date(spur.progress_date) > new Date(existing.latest_date))) {
          existing.latest_date = spur.progress_date;
        }
        
        if (spur.completion_percentage && 
            spur.completion_percentage > existing.completionPercentage) {
          existing.completionPercentage = spur.completion_percentage;
        }
        
        existing.entries++;
      }
    });
    
    return Array.from(spurMap.values());
  }, [spurProgress]);

  const spursWithProgress = useMemo(() => {
    if (!Array.isArray(spurProgress)) return [];
    return spurProgress.filter(spur => (spur.completed_km || 0) > 0);
  }, [spurProgress]);

  const spurStats = useMemo(() => {
    if (!cumulativeSpurData.length) return null;
    
    const completed = cumulativeSpurData.filter(s => {
      const status = s.status?.toLowerCase();
      return status === 'completed' || status === 'done' || 
            (s.completionPercentage >= 100);
    }).length;
    
    const inProgress = cumulativeSpurData.filter(s => {
      const status = s.status?.toLowerCase();
      return status === 'in_progress' || status === 'in progress' || 
            (s.completionPercentage > 0 && s.completionPercentage < 100);
    }).length;
    
    const notStarted = cumulativeSpurData.filter(s => {
      const status = s.status?.toLowerCase();
      return !status || status === 'not started' || status === 'pending' ||
            (s.completionPercentage === 0);
    }).length;
    
    const total = cumulativeSpurData.length;
    
    const totalSpurLength = cumulativeSpurData.reduce((sum, spur) => 
      sum + (spur.spur_length || 0), 0
    );
    const completedSpurLength = cumulativeSpurData.reduce((sum, spur) => 
      sum + spur.total_completed_km, 0
    );
    
    return { 
      completed, 
      inProgress, 
      notStarted, 
      total, 
      totalSpurLength: parseFloat(totalSpurLength.toFixed(2)),
      completedSpurLength: parseFloat(completedSpurLength.toFixed(2)),
      completionByLength: totalSpurLength > 0 ? 
        (completedSpurLength / totalSpurLength) * 100 : 0
    };
  }, [cumulativeSpurData]);

  const lengthReportGenerator = useReportGenerator({
    selectedPackage,
    selectedWork,
    works,
    targetKm,
    totalEarthwork,
    totalLining,
    progressEntries
  });

  const spurReportGenerator = useSpurReportGenerator({
    selectedPackage: selectedPackage ?? '',
    selectedWork: selectedWork || {},
    spurs: Array.isArray(spurProgress) ? spurProgress : [],
    cumulativeSpurData,
    spursWithProgress,
    targetKm: targetKm ?? 0,
    workStartRange: work_start_range ?? 0,
    workEndRange: work_end_range ?? 0,
    spurStats
  });

  const handleLengthPDFDownload = () => {
    lengthReportGenerator.downloadLengthwisePDF();
  };

  const handleLengthExcelDownload = async () => {
    await lengthReportGenerator.downloadLengthwiseExcel();
  };

  const handleSpurPDFDownload = () => {
    if (spurReportGenerator) {
      spurReportGenerator.downloadSpurPDFReport();
    }
  };

  const handleSpurExcelDownload = async () => {
    if (spurReportGenerator) {
      await spurReportGenerator.downloadSpurExcelReport();
    }
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-[#003087] text-white border-b-4 border-[#FF9933]">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {hasSpurs ? "Spur-wise Progress Monitoring" : "Lengthwise Progress Monitoring"}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1800px] mx-auto w-full px-4 py-6">
        {onClose && (
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              <X className="w-5 h-5" />
              Close
            </button>
          </div>
        )}

        {!selectedPackage && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-300 rounded shadow-sm p-6 mb-6">
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
                    className="w-full px-4 py-3 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                  />
                </div>
               </div>
            </div>

            <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-400">
                  <thead>
                    <tr className="bg-gray-100 text-gray-800 whitespace-nowrap">
                      <th className="border border-gray-400 p-3 font-semibold">Package No.</th>
                      <th className="border border-gray-400 p-3 font-semibold">Work Name</th>
                      <th className="border border-gray-400 p-3 font-semibold">Agency Name</th>
                      <th className="border border-gray-400 p-3 font-semibold">Type</th>
                      <th className="border border-gray-400 p-3 font-semibold">Target</th>
                      <th className="border border-gray-400 p-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorks.map((w: Work) => (
                      <tr key={w.id} className="hover:bg-gray-50">
                        <td className="border border-gray-400 p-3">{w.package_number}</td>
                        <td className="border border-gray-400 p-3">{w.work_name}</td>
                        <td className="border border-gray-400 p-3">{w.contractor_name}</td>
                        <td className="border border-gray-400 p-3">
                          {w.has_spurs === 1 ? "Spur Work" : "Length Work"}
                        </td>
                        <td className="border border-gray-400 p-3">
                          {w.has_spurs === 1 ? `${w.total_spurs || 0} Spurs` : `${w.target_km} Km`}
                        </td>
                        <td className="border border-gray-400 p-3 text-center">
                          <button
                            className="flex items-center justify-center gap-2 bg-[#003087] text-white px-4 py-2 rounded hover:bg-[#00205b] transition-colors"
                            onClick={() => setSelectedPackage(w.package_number)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                            View Progress
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredWorks.length === 0 && (
                      <tr>
                        <td colSpan={6} className="border border-gray-400 p-3 text-center text-gray-500">
                          {user?.role_id === 1 ? "No works found in the system." : `No works found for your ${user?.division_id ? 'division' : user?.circle_id ? 'circle' : user?.zone_id ? 'zone' : 'location'}.`}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedPackage && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              {!onClose && (
                <button
                  className="flex items-center gap-2 px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedPackage(null)}
                >
                  ← Back
                </button>
              )}

              <div className="flex items-center gap-3">
                {canAddProgress() && !hasSpurs && (
                  <button
                    className="flex items-center gap-2 px-6 py-2 bg-[#003087] text-white rounded hover:bg-[#00205b] transition-colors"
                    onClick={() => {
                      setSelectedRange([0, targetKm]);
                      setEditingEntry(null);
                      setShowForm(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Length Progress
                  </button>
                )}
                
                {canAddProgress() && hasSpurs && (
                  <button
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded hover:from-green-700 hover:to-blue-700 transition-colors"
                    onClick={() => {
                      setSelectedSpur(null);
                      setEditingSpurEntry(null);
                      setShowSpurForm(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Spur Progress
                  </button>
                )}
                
                {selectedPackage && (
                  <div className="relative download-menu">
                    <button
                      onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#003087] text-white rounded hover:bg-[#00205b] transition-colors"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      {hasSpurs ? "Download Spur Reports" : "Download Length Reports"}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {showDownloadOptions && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded shadow-sm z-10 overflow-hidden">
                        {hasSpurs ? (
                          <>
                            <button
                              onClick={handleSpurPDFDownload}
                              className="block w-full text-left px-4 py-3 hover:bg-purple-50 text-purple-700 font-medium border-b border-gray-200"
                            >
                              <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span>Spur Report (PDF)</span>
                              </div>
                            </button>
                            <button
                              onClick={handleSpurExcelDownload}
                              className="block w-full text-left px-4 py-3 hover:bg-indigo-50 text-indigo-700 font-medium"
                            >
                              <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Spur Report (Excel)</span>
                              </div>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={handleLengthPDFDownload}
                              className="block w-full text-left px-4 py-3 hover:bg-blue-50 text-blue-700 font-medium border-b border-gray-200"
                            >
                              <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span>Lengthwise Report (PDF)</span>
                              </div>
                            </button>
                            <button
                              onClick={handleLengthExcelDownload}
                              className="block w-full text-left px-4 py-3 hover:bg-green-50 text-green-700 font-medium"
                            >
                              <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Lengthwise Report (Excel)</span>
                              </div>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedWork && (
              <div className="mb-4 p-6 bg-white border border-gray-300 rounded shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-gray-800">
                      Contractor Details
                    </h3>
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        <span className="font-semibold">Name:</span> {selectedWork.contractor_name}
                      </p>
                      {selectedWork.agreement_no && (
                        <p className="text-gray-700">
                          <span className="font-semibold">Agreement No:</span> {selectedWork.agreement_no}
                        </p>
                      )}
                      {selectedWork.contract_awarded_amount && (
                        <p className="text-gray-700">
                          <span className="font-semibold">Contract Value (Cr.):</span>{" "}
                          <span className="text-green-700">₹{selectedWork.contract_awarded_amount.toLocaleString()}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-3 text-gray-800">
                      Work Information
                    </h3>
                    <div className="space-y-2">
                      {selectedWork.start_date && (
                        <p className="text-gray-700">
                          <span className="font-semibold">Start Date:</span> {selectedWork.start_date}
                        </p>
                      )}
                      {selectedWork.end_date && (
                        <p className="text-gray-700">
                          <span className="font-semibold">End Date:</span> {selectedWork.end_date}
                        </p>
                      )}
                      <p className="text-gray-700">
                        <span className="font-semibold">Work Type:</span>{" "}
                        <span className="text-blue-700 font-bold">
                          {hasSpurs ? "Spur Work" : "Length Work"}
                        </span>
                      </p>
                      {hasSpurs ? (
                        <p className="text-gray-700">
                          <span className="font-semibold">Total Spurs:</span>
                          <span className="text-blue-700 font-bold ml-2">{selectedWork.total_spurs || 0}</span>
                        </p>
                      ) : (
                        <p className="text-gray-700">
                          <span className="font-semibold">Target Length:</span>{" "}
                          <span className="text-blue-700 font-bold">{selectedWork.target_km} Km</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {hasSpurs && (
              <>
                <SpurProgressComponent
                  spurs={spurProgress}
                  targetKm={targetKm}
                  work_start_range={work_start_range}
                  work_end_range={work_end_range}
                  packageNumber={selectedPackage}
                  workName={selectedWork?.work_name || ""}
                />
              </>
            )}

            {!hasSpurs && (
              <>
                <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
                  <div className="bg-[#003087] text-white p-4">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                      Lengthwise Progress Overview
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">Preview of downloadable report format</p>
                  </div>

                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-400">
                        <thead>
                          <tr className="bg-gray-100 text-gray-800">
                            <th className="border border-gray-400 p-3 font-semibold text-left">S.No.</th>
                            <th className="border border-gray-400 p-3 font-semibold text-left">Item of Work</th>
                            <th className="border border-gray-400 p-3 font-semibold text-left">Progress (Km)</th>
                            <th className="border border-gray-400 p-3 font-semibold text-left">Target Length (Km)</th>
                            <th className="border border-gray-400 p-3 font-semibold text-left">% Completed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lengthwiseData.map((item: LengthwiseItem, index: number) => {
                            const percentage = item.target > 0 ? ((item.progress / item.target) * 100).toFixed(1) : "0.0";
                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-400 p-3">{index + 1}</td>
                                <td className="border border-gray-400 p-3 font-medium">{item.item}</td>
                                <td className="border border-gray-400 p-3">
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
                                <td className="border border-gray-400 p-3">{item.target.toFixed(2)}</td>
                                <td className="border border-gray-400 p-3">
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

                    <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-300">
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
                  <div className="bg-yellow-50 border border-yellow-300 p-4 rounded shadow-sm text-center">
                    <h3 className="font-semibold text-yellow-700">Earthwork Done (Km)</h3>
                    <p className="text-3xl font-bold text-yellow-800">{totalEarthwork.toFixed(2)}</p>
                    <p className="text-sm text-yellow-600">Target: {targetKm.toFixed(2)} Km</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-300 p-4 rounded shadow-sm text-center">
                    <h3 className="font-semibold text-blue-700">Lining Done (Km)</h3>
                    <p className="text-3xl font-bold text-blue-800">{totalLining.toFixed(2)}</p>
                    <p className="text-sm text-blue-600">Target: {targetKm.toFixed(2)} Km</p>
                  </div>
                  <div className="bg-green-50 border border-green-300 p-4 rounded shadow-sm text-center">
                    <h3 className="font-semibold text-green-700">Target (Km)</h3>
                    <p className="text-3xl font-bold text-green-800">{targetKm.toFixed(2)}</p>
                    <p className="text-sm text-green-600">Remaining: {(targetKm - totalLining).toFixed(2)} Km</p>
                  </div>
                </div>

                <div className="bg-white border border-gray-300 rounded shadow-sm p-6 flex flex-col items-center">
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
                  <div className="bg-white border border-gray-300 p-4 rounded shadow-sm">
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

                  <div className="bg-white border border-gray-300 p-4 rounded shadow-sm">
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

                <div className="bg-white border border-gray-300 p-4 rounded shadow-sm">
                  <h3 className="font-semibold mb-3">Progress Entries</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-400 text-sm">
                      <thead>
                        <tr className="bg-gray-100 text-left">
                          <th className="border border-gray-400 p-2 font-semibold">Start KM</th>
                          <th className="border border-gray-400 p-2 font-semibold">End KM</th>
                          <th className="border border-gray-400 p-2 font-semibold">Earthwork Done</th>
                          <th className="border border-gray-400 p-2 font-semibold">Lining Done</th>
                          <th className="border border-gray-400 p-2 font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {progressEntries.length > 0 ? (
                          progressEntries.map((p, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="border border-gray-400 p-2">{typeof p.start_km === 'number' ? p.start_km : parseFloat(p.start_km)}</td>
                              <td className="border border-gray-400 p-2">{typeof p.end_km === 'number' ? p.end_km : parseFloat(p.end_km)}</td>
                              <td className="border border-gray-400 p-2">{typeof p.earthwork_done_km === 'number' ? p.earthwork_done_km.toFixed(2) : "0.00"}</td>
                              <td className="border border-gray-400 p-2">{typeof p.lining_done_km === 'number' ? p.lining_done_km.toFixed(2) : "0.00"}</td>
                              <td className="border border-gray-400 p-2">{p.date ? new Date(p.date).toLocaleDateString() : "-"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="border border-gray-400 p-2 text-center text-gray-500">
                              No progress data available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {showForm && selectedPackage && !hasSpurs && (
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

        {showSpurForm && selectedPackage && hasSpurs && (
          <AddSpurProgressForm
            showModal={showSpurForm}
            onAddProgress={handleAddSpurProgress}
            selectedSpur={selectedSpur}
            editingEntry={editingSpurEntry}
            onClose={() => {
              setShowSpurForm(false);
              setSelectedSpur(null);
              setEditingSpurEntry(null);
            }}
            spurs={spurProgress.map(spur => ({
              id: spur.id,
              spur_id: spur.spur_id,
              spur_name: spur.spur_name,
              spur_length: spur.spur_length || 0,
              location_km: spur.location_km,
              completed_km: spur.completed_km || 0,
              completion_percentage: spur.completion_percentage || 0,
              status: spur.status
            }))}
            totalSpurs={spurProgress.length}
          />
        )}
      </main>
    </div>
  );
}