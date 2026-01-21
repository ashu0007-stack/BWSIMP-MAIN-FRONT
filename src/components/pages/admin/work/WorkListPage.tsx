import React, { useState, useEffect } from "react";
import { 
  Eye, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Filter,
  Download,
  Package,
  Building,
  Calendar,
  MapPin,
  Users,
  Award,
  Loader,
  Shield,
  FileText,
  ArrowLeft,
  BarChart3,
  DollarSign,
  Home
} from "lucide-react";
import { useWorks } from "@/hooks/wrdHooks/useWorks";
import { Work } from "@/components/shared/work";

interface WorkListPageProps {
  onViewWork: (workId: number) => void;
  onCreateWork: () => void;
  onBack?: () => void;
}

const WorkListPage: React.FC<WorkListPageProps> = ({ onViewWork, onCreateWork, onBack }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  
  const { data: worksList = [], isLoading: worksLoading, refetch: refetchWorks } = useWorks();

  // Filter works based on search, status and district
  const filteredWorks = React.useMemo(() => {
    if (!worksList || !Array.isArray(worksList)) return [];
    
    return worksList.filter((work: Work) => {
      const matchesSearch = 
        work.work_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.package_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.division_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.circle_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || work.award_status === statusFilter;
      const matchesDistrict = districtFilter === "all" || work.district_name === districtFilter;
      
      return matchesSearch && matchesStatus && matchesDistrict;
    });
  }, [worksList, searchTerm, statusFilter, districtFilter]);

  // Calculate total pages when filteredWorks changes
  useEffect(() => {
    if (filteredWorks && Array.isArray(filteredWorks)) {
      const totalItems = filteredWorks.length;
      const pages = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(pages > 0 ? pages : 1);
      
      if (currentPage > pages && pages > 0) {
        setCurrentPage(pages);
      }
    }
  }, [filteredWorks, itemsPerPage, currentPage]);

  // Get paginated data
  const getPaginatedWorks = () => {
    if (!filteredWorks || !Array.isArray(filteredWorks)) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredWorks.slice(startIndex, endIndex);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Get unique districts
 // const districts = Array.from(new Set(worksList.map((work: Work) => work.district_name).filter(Boolean)));

  // Format currency
  const formatCurrency = (amount: string) => {
    if (!amount) return "₹0";
    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber)) return "₹0";
    if (amountNumber >= 10000000) {
      return `₹${(amountNumber / 10000000).toFixed(2)} Cr`;
    }
    return `₹${amountNumber.toLocaleString('en-IN')}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case "Awarded":
          return { bg: "bg-green-100", text: "text-green-800", border: "border-green-300", label: "Awarded" };
        case "In Progress":
          return { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300", label: "In Progress" };
        case "Completed":
          return { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300", label: "Completed" };
        case "Pending":
          return { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300", label: "Pending" };
        default:
          return { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300", label: status || "Not Awarded" };
      }
    };
    
    const config = getStatusConfig(status);
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    );
  };

  // Calculate stats
  const totalWorks = worksList.length;
  const totalCost = worksList.reduce((sum: number, work: { work_cost: any; }) => sum + (parseFloat(work.work_cost || "0") || 0), 0);
  const awardedWorks = worksList.filter((work: { award_status: string; }) => work.award_status === "Awarded").length;
  const inProgressWorks = worksList.filter((work: { award_status: string; }) => work.award_status === "In Progress").length;

  if (worksLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-[#003087]" />
          <p className="mt-4 text-gray-700 font-medium">Loading Work Packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Government Header */}
      <header className="bg-[#003087] text-white border-b-4 border-[#FF9933]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Government Logo/Emblem Placeholder */}
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Work Package Management</h1>
                <p className="text-sm text-blue-100">Manage and track all your work packages</p>
              </div>
            </div>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded transition-colors"
            >
              <ArrowLeft size={18} /> Back
            </button>
          )}
        </div>
      </header>

      <main className="min-h-screen bg-gray-100 flex flex-col py-3">
        {/* Government Filter Panel */}
        <div className="bg-white border border-gray-300 rounded shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[280px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Search className="inline w-4 h-4 mr-2" />
                Search Work Packages
              </label>
              <input
                type="text"
                placeholder="Search by work name, package number, division, or circle..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-400 rounded focus:border-[#003087] w-40"
              >
                <option value="all">All Status</option>
                <option value="Awarded">Awarded</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <select
                value={districtFilter}
                onChange={e => setDistrictFilter(e.target.value)}
                className="px-4 py-2 border border-gray-400 rounded focus:border-[#003087] w-48"
              >
                <option value="all">All Districts</option>
                {districts.map((d: boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | React.Key | null | undefined) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div> */}

            <div className="flex gap-3">
              <button
                onClick={() => refetchWorks()}
                className="px-5 py-2 border border-gray-400 text-gray-700 font-medium rounded hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>

              <button
                onClick={onCreateWork}
                className="px-6 py-2 bg-green-700 text-white font-medium rounded hover:bg-green-800 flex items-center gap-2 transition-colors"
              >
                <Plus size={18} /> Create New Work
              </button>
            </div>
          </div>
        </div>

        {/* Government Data Table */}
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 text-gray-800">
                <tr>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300 whitespace-nowrap">Package Details</th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300 whitespace-nowrap">Work Name</th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300 whitespace-nowrap">Division</th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300 whitespace-nowrap">Estimated Cost</th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getPaginatedWorks().map((work: Work) => (
                  <tr key={work.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{work.package_number || "N/A"}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                        <Calendar size={14} /> 
                        {formatDate(work.created_at || "")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900" title={work.work_name}>
                        {work.work_name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium">{work.division_name || "N/A"}</div>
                      <div className="text-gray-600 mt-1">
                        {work.circle_name && <span>{work.circle_name}</span>}
                        {work.zone_name && <span> • {work.zone_name}</span>}
                        {work.district_name && <span> • {work.district_name}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{formatCurrency(work.work_cost || "0")}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={work.award_status || ""} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => onViewWork(work.id)}
                          className="text-[#003087] hover:text-[#00205b] flex items-center gap-1 text-sm font-medium"
                          title="View Details"
                        >
                          <Eye size={16} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredWorks.length === 0 && (
            <div className="py-16 text-center text-gray-600">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium">
                {searchTerm || statusFilter !== 'all' || districtFilter !== 'all' 
                  ? "No matching work packages found"
                  : "No work packages found"
                }
              </p>
              <p className="mt-1 text-gray-500">
                {searchTerm || statusFilter !== 'all' || districtFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first work package to get started'
                }
              </p>
              {(!searchTerm && statusFilter === 'all' && districtFilter === 'all') && (
                <button
                  onClick={onCreateWork}
                  className="mt-6 px-6 py-2 bg-[#003087] text-white font-medium rounded hover:bg-[#00205b] inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Create First Work Package
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {filteredWorks.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-300 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
                  <strong>{Math.min(currentPage * itemsPerPage, filteredWorks.length)}</strong> of{" "}
                  <strong>{filteredWorks.length}</strong> work packages
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center mr-4">
                    <label className="text-sm text-gray-700 mr-2">Rows per page:</label>
                    <select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="px-3 py-1 border border-gray-400 rounded text-sm focus:border-[#003087]"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className={`p-2 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'} rounded border border-gray-400`}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'} rounded border border-gray-400`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {(() => {
                      const pageNumbers = [];
                      const maxPageButtons = 5;
                      
                      if (totalPages <= maxPageButtons) {
                        for (let i = 1; i <= totalPages; i++) {
                          pageNumbers.push(i);
                        }
                      } else {
                        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
                        let endPage = startPage + maxPageButtons - 1;
                        
                        if (endPage > totalPages) {
                          endPage = totalPages;
                          startPage = Math.max(1, endPage - maxPageButtons + 1);
                        }
                        
                        for (let i = startPage; i <= endPage; i++) {
                          pageNumbers.push(i);
                        }
                      }
                      
                      return pageNumbers.map(page => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium border ${
                            currentPage === page
                              ? 'bg-[#003087] text-white border-[#003087]'
                              : 'text-gray-700 hover:bg-gray-100 border-gray-400'
                          }`}
                        >
                          {page}
                        </button>
                      ));
                    })()}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'} rounded border border-gray-400`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`p-2 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'} rounded border border-gray-400`}
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      
    </div>
  );
};

export default WorkListPage;