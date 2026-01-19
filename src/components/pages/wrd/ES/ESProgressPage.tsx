import { useState, useEffect } from "react";
import { Download, Eye, ChevronDown, FileText, Users, AlertCircle, Home, BarChart, FileCheck, Shield } from "lucide-react";
import ESGrievanceManager from "./ESGrievanceManager";
import ESLabourCamp from "./ESLabourCamp";
import ESReportForm from "./ESReportForm";
import ESIndicatorsTable from "./ESIndicatorsTable";
import ESReportsView from "./ESReportsView";
import ESStatistics from "./ESStatistics";
import { useESReports, useESProjects } from "@/hooks/wrdHooks/ES/useESReports";

interface ESProgressPageProps {
  id?: number; // ✅ Optional - parent से आ सकता है
  onClose?: () => void;
}

interface Project {
  id: number;
  package_number: string;
  work_name: string;
  contractor_name: string;
  target_km: number;
  status: string;
  created_at: string;
}

export default function ESProgressPage({ id, onClose }: ESProgressPageProps) {
  // ✅ FIX: selectedProject को initialize करते समय check करें
  const [selectedProject, setSelectedProject] = useState<number | null>(
    id !== undefined && id !== null ? id : null
  );
  
  const [activeTab, setActiveTab] = useState<'environmental' | 'social' | 'grievance' | 'labour' | 'reports' | 'dashboard'>('dashboard');
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<'daily' | 'weekly' | 'monthly' | 'six_monthly'>('monthly');
  const [searchTerm, setSearchTerm] = useState("");
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useESProjects();
  
  // ✅ FIX: Check if selectedProject is valid before passing to hook
  const { data: stats, isLoading: statsLoading } = useESReports(
    selectedProject && selectedProject > 0 ? selectedProject : 0
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.download-dropdown-container')) {
        setShowDownloadDropdown(false);
      }
    };

    if (showDownloadDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDownloadDropdown]);

  // ✅ FIX: Safely handle projects data
  const filteredProjects = Array.isArray(projects)
    ? projects.filter((p: Project) =>
      p.package_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.work_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contractor_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  // ✅ FIX: Get selected project details safely
  const selectedProjectDetails = selectedProject && Array.isArray(projects)
    ? projects.find((p: Project) => p.id === selectedProject)
    : null;

  const handleDownloadReport = (format: 'pdf' | 'excel' | 'word') => {
    if (!selectedProject) {
      alert("Please select a project first");
      return;
    }
    console.log(`Download ${format} for project ${selectedProject}`);
    setShowDownloadDropdown(false);
  };

  const handleExportData = (type: 'environmental' | 'grievances' | 'attendance') => {
    if (!selectedProject) {
      alert("Please select a project first");
      return;
    }
    // Export logic
    window.open(`/api/esRoutes/export/${selectedProject}/${type}?startDate=2024-01-01&endDate=2024-12-31`, '_blank');
    setShowDownloadDropdown(false);
  };

  // Show loading state
  if (projectsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (projectsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Projects</h2>
          <p className="text-red-600 mb-4">Failed to load project data. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ✅ FIX: Better check for selectedProject
  if (!selectedProject || selectedProject === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Social & Environmental (E&S) MIS Reporting</h1>
          <p className="text-gray-600">Monitor and report environmental and social indicators</p>
        </div>

        {/* Project Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-800 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Select Project/Scheme
          </h2>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by package number, work name, or contractor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border mb-4">
            <table className="w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-4 text-center font-semibold whitespace-nowrap">Package No.</th>
                  <th className="p-4 text-center font-semibold whitespace-nowrap">Work Name</th>
                  <th className="p-4 text-center font-semibold whitespace-nowrap">Contractor Name</th>
                  <th className="p-4 text-center font-semibold whitespace-nowrap">Target KM</th>
                  <th className="p-4 text-center font-semibold whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project: Project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="border p-3">{project.package_number}</td>
                      <td className="border p-3">{project.work_name}</td>
                      <td className="border p-3">{project.contractor_name}</td>
                      <td className="border p-3">{project.target_km || 0} Km</td>
                      <td className="border p-3 text-center">
                        <button
                          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                          onClick={() => setSelectedProject(project.id)}
                        >
                          <Eye className="w-4 h-4" />
                          View E&S Reporting
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="border p-6 text-center text-gray-500">
                      {searchTerm ? "No projects found matching your search" : "No projects available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl shadow border border-green-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-800">Environmental Monitoring</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Monitor air, water, soil quality, noise levels, and waste management as per EMP guidelines.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl shadow border border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-800">Social Safeguards</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Track labour welfare, grievances, training, camp facilities, and social compliance.
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl shadow border border-purple-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileCheck className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-purple-800">Compliance Reporting</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Generate daily, weekly, monthly, and six-monthly reports for regulatory compliance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        {onClose ? (
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ← Back
          </button>
        ) : (
          <button
            onClick={() => setSelectedProject(null)}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ← Select Different Project
          </button>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowReportForm(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Submit Report
          </button>

          {/* Download Dropdown */}
          <div className="relative download-dropdown-container">
            <button 
              onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download/Export
              <ChevronDown className={`w-4 h-4 transition-transform ${showDownloadDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showDownloadDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-xl z-10 overflow-hidden">
                <button 
                  onClick={() => handleDownloadReport('excel')} 
                  className="block w-full text-left px-4 py-3 hover:bg-green-50 text-green-700 font-medium border-b"
                >
                  📊 Excel Report
                </button>
                <button 
                  onClick={() => handleDownloadReport('pdf')} 
                  className="block w-full text-left px-4 py-3 hover:bg-red-50 text-red-700 font-medium border-b"
                >
                  📄 PDF Report
                </button>
                <button 
                  onClick={() => handleExportData('environmental')} 
                  className="block w-full text-left px-4 py-3 hover:bg-blue-50 text-blue-700 font-medium border-b"
                >
                  🌿 Environmental Data (CSV)
                </button>
                <button 
                  onClick={() => handleExportData('grievances')} 
                  className="block w-full text-left px-4 py-3 hover:bg-orange-50 text-orange-700 font-medium"
                >
                  ⚠️ Grievances Data (CSV)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Info */}
      {selectedProjectDetails && (
        <div key={selectedProjectDetails.id} className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-lg mb-3 text-blue-800">Project Details</h3>
              <p className="text-gray-700 mb-1">
                <strong>Work:</strong> {selectedProjectDetails.work_name}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Package:</strong> {selectedProjectDetails.package_number}
              </p>
              <p className="text-gray-700">
                <strong>Contractor:</strong> {selectedProjectDetails.contractor_name}
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3 text-green-800">E&S Contact</h3>
              <p className="text-gray-700 mb-1">
                <strong>E&S Officer:</strong> To be assigned
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Contact:</strong> +91 9876543210
              </p>
              <p className="text-gray-700">
                <strong>Email:</strong> es-officer@contractor.com
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3 text-purple-800">Reporting Status</h3>
              <p className="text-gray-700 mb-1">
                <strong>Last Report:</strong> 15 Jan 2024 (Monthly)
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Next Due:</strong> 15 Feb 2024
              </p>
              <p className="text-gray-700">
                <strong>Compliance:</strong>{" "}
                <span className="text-green-600 font-bold">92%</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
        <div className="border-b">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'dashboard'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <BarChart className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('environmental')}
              className={`py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'environmental'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              🌿 Environmental
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'social'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              👥 Social
            </button>
            <button
              onClick={() => setActiveTab('grievance')}
              className={`py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'grievance'
                  ? 'border-b-2 border-red-600 text-red-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              ⚠️ Grievance
            </button>
            <button
              onClick={() => setActiveTab('labour')}
              className={`py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'labour'
                  ? 'border-b-2 border-orange-600 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              🏠 Labour Camp
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'reports'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              📋 Reports
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && (
            <ESStatistics id={selectedProject} />
          )}
          {activeTab === 'environmental' && (
            <ESIndicatorsTable type="environmental" id={selectedProject} />
          )}
          {activeTab === 'social' && (
            <ESIndicatorsTable type="social" id={selectedProject} />
          )}
          {activeTab === 'grievance' && (
            <ESGrievanceManager id={selectedProject} />
          )}
          {activeTab === 'labour' && (
            <ESLabourCamp id={selectedProject} />
          )}
          {activeTab === 'reports' && (
            <ESReportsView id={selectedProject} />
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 p-4 rounded-xl shadow animate-pulse">
              <div className="h-8 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl shadow border border-green-200">
            <div className="text-2xl font-bold text-green-700">
              {stats?.environmental?.rate || 0}%
            </div>
            <div className="text-sm text-green-600">Env. Compliance</div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl shadow border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">
              {stats?.social?.rate || 0}%
            </div>
            <div className="text-sm text-blue-600">Social Compliance</div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl shadow border border-red-200">
            <div className="text-2xl font-bold text-red-700">
              {stats?.grievances?.pending || 0}
            </div>
            <div className="text-sm text-red-600">Pending Grievances</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl shadow border border-purple-200">
            <div className="text-2xl font-bold text-purple-700">
              {Math.round(stats?.labour?.avg_daily || 0)}
            </div>
            <div className="text-sm text-purple-600">Avg. Daily Labour</div>
          </div>
        </div>
      )}

      {/* Report Form Modal */}
      {showReportForm && (
        <ESReportForm
          id={selectedProject}
          reportType={selectedReportType}
          onClose={() => setShowReportForm(false)}
          onSubmit={(data) => {
            console.log("Submit report:", data);
            setShowReportForm(false);
          }}
        />
      )}
    </div>
  );
}