import React, { useState, useEffect } from "react";
import { 
  Package, 
  Eye, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Filter,
  Download
} from "lucide-react";
import { useWorks } from "@/hooks/wrdHooks/useWorks";
import { Work } from "@/components/pages/admin/work/work";

interface WorkListPageProps {
  onViewWork: (workId: number) => void;
  onCreateWork: () => void;
}

const WorkListPage: React.FC<WorkListPageProps> = ({ onViewWork, onCreateWork }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: worksList = [], isLoading: worksLoading, refetch: refetchWorks } = useWorks();

  // Filter works based on search and status
  const filteredWorks = React.useMemo(() => {
    if (!worksList || !Array.isArray(worksList)) return [];
    
    return worksList.filter((work: Work) => {
      const matchesSearch = 
        work.work_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.package_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.division_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || work.award_status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [worksList, searchTerm, statusFilter]);

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

  // Format currency
  const formatCurrency = (amount: string) => {
    if (!amount) return "₹0";
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Pagination Component
  const renderPagination = () => {
    const totalItems = filteredWorks?.length || 0;
    
    if (totalItems === 0) return null;
    
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
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
    
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white border-t border-gray-200 rounded-b-xl">
        <div className="mb-4 sm:mb-0">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{" "}
            <span className="font-medium">{endItem}</span> of{" "}
            <span className="font-medium">{totalItems}</span> work packages
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center mr-4">
            <label className="text-sm text-gray-700 mr-2">Rows per page:</label>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-1">
            {pageNumbers.map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            
            {totalPages > maxPageButtons && currentPage < totalPages - Math.floor(maxPageButtons / 2) && (
              <>
                <span className="px-2 text-gray-500">...</span>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium ${
                    currentPage === totalPages
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case "Awarded":
          return { bg: "bg-green-100", text: "text-green-800", label: "Awarded" };
        case "In Progress":
          return { bg: "bg-yellow-100", text: "text-yellow-800", label: "In Progress" };
        case "Completed":
          return { bg: "bg-blue-100", text: "text-blue-800", label: "Completed" };
        case "Pending":
          return { bg: "bg-orange-100", text: "text-orange-800", label: "Pending" };
        default:
          return { bg: "bg-gray-100", text: "text-gray-800", label: status || "Not Awarded" };
      }
    };
    
    const config = getStatusConfig(status);
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Render work list
  const renderWorkList = () => {
    const paginatedWorks = getPaginatedWorks();
    
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by work name, package number, or division..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Awarded">Awarded</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <button
                onClick={() => refetchWorks()}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                onClick={onCreateWork}
              >
                <Plus className="w-4 h-4" />
                Add New Work
              </button>
            </div>
          </div>

          {worksLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading work packages...</p>
            </div>
          ) : filteredWorks.length > 0 ? (
            <>
              <div className="overflow-x-auto rounded-xl border mb-4">
                <table className="w-full">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="p-4 text-left font-semibold whitespace-nowrap">
                        Package Details
                      </th>
                      <th className="p-4 text-left font-semibold whitespace-nowrap">
                        Work Name
                      </th>
                      <th className="p-4 text-left font-semibold whitespace-nowrap">
                        Division
                      </th>
                      <th className="p-4 text-left font-semibold whitespace-nowrap">
                        Estimated Cost(Cr.)
                      </th>
                      <th className="p-4 text-left font-semibold whitespace-nowrap">
                        Status
                      </th>
                      <th className="p-4 text-left font-semibold whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedWorks.map((work: Work) => (
                      <tr key={work.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{work.package_number || "N/A"}</span>
                            <span className="text-sm text-gray-500 mt-1">
                              Created: {formatDate(work.created_at || "")}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 line-clamp-2" title={work.work_name}>
                              {work.work_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-gray-900">{work.division_name || "N/A"}</span>
                            <div className="text-sm text-gray-500">
                              {work.circle_name && <span>{work.circle_name}, </span>}
                              {work.zone_name && <span>{work.zone_name}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{formatCurrency(work.work_cost || "0")}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={work.award_status || ""} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => onViewWork(work.id)}
                              className="inline-flex items-center px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {renderPagination()}
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== "all" ? "No matching work packages found" : "No work packages found"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "Create your first work package to get started"}
              </p>
              {(!searchTerm && statusFilter === "all") && (
                <button
                  onClick={onCreateWork}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
                >
                  <Plus className="w-5 h-5 mr-2 inline" />
                  Create New Work Package
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Work Package Management</h1>
              <p className="text-gray-600 mt-1">
                Manage and track all your work packages in one place
              </p>
            </div>
          </div>
        </div>

        {renderWorkList()}
      </div>
    </div>
  );
};

export default WorkListPage;