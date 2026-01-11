// app/mg-report/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { RefreshCw, FileText, Filter, TrendingUp, Database, CheckCircle2 } from "lucide-react";
import { useDataEntries, useFilterValues, useUpdateDataEntryStatus } from "@/hooks/useRdd";
import { Filters } from "../rdd/Filters";
import { SummaryCards } from "../rdd/SummaryCards";
import { DataTable } from "./DataTable";
import { Pagination } from "../rdd/Pagination";
import { DataEntry, District, Filters as FiltersType, PaginationInfo } from "../rdd/types/index";
import UserForm from './scheamProgess/UserForm';
import { useWorkLogsByDataEntryId } from "@/hooks/useWorkLogRdd";
import { LogsModal } from "../rdd/LogsModal";

export default function MgReport() {
  const [filters, setFilters] = useState<FiltersType>({
    district: "all",
    search: "",
    workCode: "",
    financialYear: "all"
  });
  const [localSearch, setLocalSearch] = useState("");
  const [localWorkCode, setLocalWorkCode] = useState("");
  const [userDistrict, setUserDistrict] = useState<string>("");
  const [districtResolved, setDistrictResolved] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [updatingEntryId, setUpdatingEntryId] = useState<number | null>(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [selectedEntryForLogs, setSelectedEntryForLogs] = useState<DataEntry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DataEntry | null>(null);

  // API filters for backend
  const apiFilters = useMemo(() => ({
    district: filters.district !== "all" ? filters.district : undefined,
    search: filters.search || filters.workCode,
    financialYear: filters.financialYear !== "all" ? filters.financialYear : undefined,
    page: currentPage,
    limit: itemsPerPage,
  }), [filters.district, filters.search, filters.workCode, filters.financialYear, currentPage, itemsPerPage]);
  
  const { 
    data: entriesResponse, 
    isLoading, 
    isError,
    error,
    refetch,
    isRefetching
  } = useDataEntries(apiFilters);
  
  const { data: filterResponse } = useFilterValues();
  const { data: workLogs, isLoading: isLoadingLogs } = useWorkLogsByDataEntryId(
    selectedEntryForLogs?.id
  );

  // Memoized data transformations to prevent unnecessary re-renders
  const rawDataEntries = useMemo<DataEntry[]>(
    () => entriesResponse?.data || [],
    [entriesResponse?.data]
  );

  const pagination = useMemo<PaginationInfo>(() => 
    entriesResponse?.pagination || { 
      page: 1, 
      limit: 10, 
      total: 0, 
      pages: 1 
    },
    [entriesResponse?.pagination]
  );

  const districts = useMemo<District[]>(
    () => filterResponse?.data?.districts || [],
    [filterResponse?.data?.districts]
  );

  // ✅ DEDUPLICATE DATA at the source
  const deduplicatedData = useMemo(() => {
    const seen = new Set<number>();
    const uniqueData: DataEntry[] = [];
    
    rawDataEntries.forEach(entry => {
      if (!seen.has(entry.id)) {
        seen.add(entry.id);
        uniqueData.push(entry);
      }
    });
    
    // Log duplicates for debugging
    if (uniqueData.length !== rawDataEntries.length) {
      console.warn(`⚠️ Removed ${rawDataEntries.length - uniqueData.length} duplicates from API response`);
    }
    
    return uniqueData;
  }, [rawDataEntries]);

  // ✅ Client-side filtering for work code (using deduplicated data)
  const filteredEntries = useMemo(() => {
    if (!filters.workCode) return deduplicatedData;
    
    return deduplicatedData.filter(entry => 
      entry.work_code?.toLowerCase().includes(filters.workCode.toLowerCase())
    );
  }, [deduplicatedData, filters.workCode]);

  // ✅ Calculate accurate total entries in database (from pagination)
  const accurateTotalRecords = pagination.total || 0;

  // Set user district from sessionStorage on component mount
  useEffect(() => {
    const userDetail = sessionStorage.getItem('userdetail');
    if (userDetail) {
      try {
        const user = JSON.parse(userDetail);
        setUserDistrict(user.districts || "");
      } catch (error) {
        console.error("Error parsing user details:", error);
      }
    }
  }, []);

  // Resolve district name to ID and set filter
useEffect(() => {
  if (userDistrict && districts.length > 0) {
    const foundDistrict = districts.find(
      d => d.district_name?.toLowerCase().trim() === userDistrict?.toLowerCase().trim()
    );
    
    if (foundDistrict) {
      // Use district_id as string for the filter
      setFilters(prev => ({ 
        ...prev, 
        district: String(foundDistrict.district_id)
      }));
      setDistrictResolved(true);
      
      // Log for debugging
      console.log("User district resolved:", {
        userDistrictName: userDistrict,
        foundDistrictId: foundDistrict.district_id,
        filterValueSet: String(foundDistrict.district_id),
        allDistricts: districts.map(d => ({ id: d.district_id, name: d.district_name }))
      });
    } else {
      setDistrictResolved(false);
      setFilters(prev => ({ ...prev, district: "all" }));
      console.warn("District not found:", userDistrict, "Available:", districts);
    }
  } else if (!userDistrict && districts.length > 0) {
    // No user district, ensure filter shows "all"
    setFilters(prev => ({ ...prev, district: "all" }));
  }
}, [userDistrict, districts]);

  // Extract unique financial years from database
  const financialYears = useMemo(() => {
    const years = new Set<string>();
    deduplicatedData.forEach(entry => {
      if (entry.financial_year) {
        years.add(entry.financial_year);
      }
    });
    return Array.from(years)
      .sort((a, b) => b.localeCompare(a))
      .map(year => ({
        value: year,
        label: year
      }));
  }, [deduplicatedData]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.district, filters.search, filters.workCode, filters.financialYear]);

  // Debounced search for work name
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: localSearch }));
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch]);

  // Debounced search for work code
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, workCode: localWorkCode }));
    }, 500);
    return () => clearTimeout(timer);
  }, [localWorkCode]);

  // Memoized utility functions
  const formatDate = useCallback((dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? "—" : d.toLocaleDateString('en-IN');
    } catch {
      return "—";
    }
  }, []);

  const formatCurrency = useCallback((amount: number | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  const formatArea = useCallback((area?: number | null) => {
    if (!area) return "—";
    return `${area.toLocaleString('en-IN')} ha`;
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const clearFilters = useCallback(() => {
    setFilters(prev => ({
      district: prev.district,
      search: "",
      workCode: "",
      financialYear: "all"
    }));
    setLocalSearch("");
    setLocalWorkCode("");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = useMemo(() => 
    Boolean(
      (filters.district !== "all" && !userDistrict) ||
      filters.search || 
      filters.workCode || 
      filters.financialYear !== "all"
    ),
    [filters.district, userDistrict, filters.search, filters.workCode, filters.financialYear]
  );

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pagination.pages]);

  const { mutate: updateStatusMutation } = useUpdateDataEntryStatus();
  
  const handleStatusUpdate = useCallback((entryId: number, newStatus: 'Approved' | 'Ongoing' | 'complete' | 'Suspended') => {
    setUpdatingEntryId(entryId);
    
    updateStatusMutation(
      { 
        id: entryId, 
        status: newStatus 
      },
      {
        onSuccess: () => {
          setUpdatingEntryId(null);
        },
        onError: (error) => {
          console.error('Failed to update status:', error);
          setUpdatingEntryId(null);
        }
      }
    );
  }, [updateStatusMutation]);

  const handleViewLogs = useCallback((entryId: number) => {
    const entryToView = deduplicatedData.find(entry => entry.id === entryId);
    if (entryToView) {
      setSelectedEntryForLogs(entryToView);
      setIsLogsModalOpen(true);
    }
  }, [deduplicatedData]);

  const handleCloseLogsModal = useCallback(() => {
    setIsLogsModalOpen(false);
    setSelectedEntryForLogs(null);
  }, []);

  const handleEditRecord = useCallback((entryId: number) => {
    const entryToEdit = deduplicatedData.find(entry => entry.id === entryId);
    if (entryToEdit) {
      setEditingEntry(entryToEdit);
      setIsFormOpen(true);
    }
  }, [deduplicatedData]);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingEntry(null);
  }, []);

  // Calculate total sanctioned amount
  const totalSanctioned = useMemo(() => {
    return filteredEntries.reduce((sum, entry) => {
      const wages = Number(entry.sanction_amt_wages) || 0;
      const material = Number(entry.sanction_amt_material) || 0;
      return sum + wages + material;
    }, 0);
  }, [filteredEntries]);

  const totalSanctionedFormatted = useMemo(() => formatCurrency(totalSanctioned), [totalSanctioned, formatCurrency]);

  // Download functions
  const downloadCSV = useCallback(() => {
    if (filteredEntries.length === 0) return;

    const headers = [
      'Date', 'District Name', 'Block Name', 'Panchayat Name', 'Work Code', 'Work Name',
      'Work Category', 'Work Type', 'Agency Name', 'Command Area (ha)', 'Status',
      'Proposed Length (m)', 'Proposed Width (m)', 'Proposed Height (m)',
      'Sanction Amount - Wages', 'Sanction Amount - Material', 'Total Sanction Amount',
      'Work Start Date', 'Work Completion Date', 'Financial Year', 'Remarks'
    ];

    const csvData = filteredEntries.map(entry => {
      const wages = Number(entry.sanction_amt_wages) || 0;
      const material = Number(entry.sanction_amt_material) || 0;
      const total = wages + material;
      
      return [
        formatDate(entry.dated_at || entry.created_at),
        entry.district_name || entry.district || '—',
        entry.block_name || entry.block || '—',
        entry.panchayat_name || entry.panchayat || '—',
        entry.work_code || '—',
        entry.work_name || '—',
        entry.work_category_name || '—',
        entry.work_type_name || '—',
        entry.agency || '—',
        entry.command_area || '—',
        entry.status || 'Approved',
        entry.prop_length || '—',
        entry.prop_width || '—',
        entry.prop_height || '—',
        wages,
        material,
        total,
        formatDate(entry.work_start_date),
        formatDate(entry.work_completion_date),
        entry.financial_year || '—',
        entry.remarks || '—'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const filterSuffix = hasActiveFilters ? '-filtered' : '';
    link.setAttribute('download', `rdd-report-${filteredEntries.length}-entries${filterSuffix}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredEntries, hasActiveFilters, formatDate]);

  const downloadPDF = useCallback(() => {
    if (filteredEntries.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const filterInfo = hasActiveFilters ? `
      <div style="margin: 10px 0; padding: 10px; background: #f0f9ff; border-left: 4px solid #3b82f6;">
        <strong>Applied Filters:</strong><br/>
        ${filters.district !== "all" && userDistrict ? `District: ${userDistrict}<br/>` : ''}
        ${filters.financialYear !== "all" ? `Financial Year: ${filters.financialYear}<br/>` : ''}
        ${filters.search ? `Work Name: ${filters.search}<br/>` : ''}
        ${filters.workCode ? `Work Code: ${filters.workCode}<br/>` : ''}
      </div>
    ` : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>RDD Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 9px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { text-align: center; margin-bottom: 20px; }
            .summary { margin: 20px 0; padding: 15px; background: #f9f9f9; border: 1px solid #ddd; }
            .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
            .summary-item { text-align: center; }
            .summary-label { font-size: 12px; color: #666; }
            .summary-value { font-size: 18px; font-weight: bold; color: #333; }
            .page-info { text-align: center; margin: 10px 0; font-size: 14px; color: #666; }
            .merged-header { background-color: #e5e7eb; text-align: center; font-weight: bold; }
            .sub-header { background-color: #f8fafc; text-align: center; font-size: 8px; }
            .status-Approved { background-color: #cce7ff; color: #004085; }
            .status-Ongoing { background-color: #d4c2f9; color: #4c3391; }
            .status-complete { background-color: #d4edda; color: #155724; }
            .status-Suspended { background-color: #f8d7da; color: #721c24; }
            @media print {
              body { margin: 0; }
              table { font-size: 7px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Rural Development Department - Work Report</h2>
            <p>Generated on: ${new Date().toLocaleDateString('en-IN')}</p>
            <p class="page-info">
              Page ${currentPage} of ${pagination.pages} | 
              Showing ${filteredEntries.length} unique entries of ${accurateTotalRecords} total records
            </p>
          </div>
          ${filterInfo}
          <div class="summary">
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-label">Current Page Entries</div>
                <div class="summary-value">${filteredEntries.length}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Total Sanctioned Amount</div>
                <div class="summary-value">${formatCurrency(totalSanctioned)}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Total Database Records</div>
                <div class="summary-value">${accurateTotalRecords}</div>
              </div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>District</th>
                <th>Block</th>
                <th>Panchayat</th>
                <th>Work Code</th>
                <th>Work Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Agency</th>
                <th>Area (ha)</th>
                <th>Status</th>
                <th class="merged-header" colspan="3">Sanction Amount</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
              <tr>
                <th colspan="11"></th>
                <th class="sub-header">Wages</th>
                <th class="sub-header">Material</th>
                <th class="sub-header">Total</th>
                <th colspan="2"></th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map(entry => {
                const wages = Number(entry.sanction_amt_wages) || 0;
                const material = Number(entry.sanction_amt_material) || 0;
                const total = wages + material;
                const statusClass = `status-${entry.status || 'Approved'}`;
                return `
                <tr>
                  <td>${formatDate(entry.dated_at || entry.created_at)}</td>
                  <td>${entry.district_name || entry.district || '—'}</td>
                  <td>${entry.block_name || entry.block || '—'}</td>
                  <td>${entry.panchayat_name || entry.panchayat || '—'}</td>
                  <td>${entry.work_code || '—'}</td>
                  <td>${entry.work_name || '—'}</td>
                  <td>${entry.work_category_name || '—'}</td>
                  <td>${entry.work_type_name || '—'}</td>
                  <td>${entry.agency || '—'}</td>
                  <td>${entry.command_area || '—'}</td>
                  <td class="${statusClass}">${entry.status || 'Approved'}</td>
                  <td>${formatCurrency(wages)}</td>
                  <td>${formatCurrency(material)}</td>
                  <td><strong>${formatCurrency(total)}</strong></td>
                  <td>${formatDate(entry.work_start_date)}</td>
                  <td>${formatDate(entry.work_completion_date)}</td>
                </tr>
              `;
              }).join('')}
            </tbody>
          </table>
          <div class="page-info" style="margin-top: 20px;">
            Page ${currentPage} of ${pagination.pages} | 
            ${filteredEntries.length} unique entries shown
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, [filteredEntries, hasActiveFilters, userDistrict, filters, currentPage, pagination.pages, accurateTotalRecords, totalSanctioned, formatCurrency, formatDate]);

  const downloadExcel = useCallback(() => {
    downloadCSV();
  }, [downloadCSV]);

  const handleFilterChange = useCallback((filter: string, value: string) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Database className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading report data...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-red-100">
            <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Data</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {error?.message || "Failed to load report data. Please try again."}
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium rounded-xl hover:from-red-700 hover:to-orange-700 transition-all shadow-lg shadow-red-500/30 w-full"
            >
              <RefreshCw className="inline w-5 h-5 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header with Gradient */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">RDD Data Entry Report</h1>
                  </div>
                  <p className="text-blue-100 ml-14">
                    {hasActiveFilters 
                      ? `Filtered: ${filteredEntries.length} entries` 
                      : `Showing: ${filteredEntries.length} of ${accurateTotalRecords} total entries`
                    }
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-4 lg:mt-0">
                  <button
                    onClick={handleRefresh} 
                    disabled={isRefetching}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={18} className={isRefetching ? 'animate-spin' : ''} />
                    <span className="font-medium">{isRefetching ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-4 border-t border-blue-100">
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-gray-700">
                    Page Entries: {filteredEntries.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-700">
                    Database Total: {accurateTotalRecords} Records
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Page {currentPage} of {pagination.pages}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">
                    Last updated: {isRefetching ? 'Updating...' : new Date().toLocaleTimeString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6">
          <Filters
            filters={filters}
            localSearch={localSearch}
            localWorkCode={localWorkCode}
            userDistrict={userDistrict}
            districtResolved={districtResolved}
            districts={districts}
            financialYears={financialYears}
            hasActiveFilters={hasActiveFilters}
            onFilterChange={handleFilterChange}
            onLocalSearchChange={setLocalSearch}
            onLocalWorkCodeChange={setLocalWorkCode}
            onClearFilters={clearFilters}
            onDownloadCSV={downloadCSV}
            onDownloadPDF={downloadPDF}
            onDownloadExcel={downloadExcel}
            currentPage={currentPage}
            filteredEntriesCount={filteredEntries.length}
            // totalRecordsCount={accurateTotalRecords}
          />
        </div>

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <div className="mb-6 animate-in slide-in-from-top duration-300">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl px-6 py-3 shadow-lg">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Filter size={18} />
                  <span className="font-medium">
                    Active Filters • Showing {filteredEntries.length} entries
                  </span>
                </div>
                <button
                  onClick={clearFilters}
                  className="text-sm bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg transition-all"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-6">
          <SummaryCards
            currentPageCount={filteredEntries.length}
            totalRecords={accurateTotalRecords}
            totalSanctioned={totalSanctionedFormatted}
            currentPage={currentPage}
            totalPages={pagination.pages}
          />
        </div>

        {/* Data Table Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <DataTable
            data={filteredEntries}
            onStatusUpdate={handleStatusUpdate}
            onEditRecord={handleEditRecord}
            onViewLogs={handleViewLogs}
            updatingEntryId={updatingEntryId}
            hasActiveFilters={hasActiveFilters}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            formatArea={formatArea}
          />
          
          <LogsModal
            isOpen={isLogsModalOpen}
            onClose={handleCloseLogsModal}
            logs={workLogs || []}
            workName={selectedEntryForLogs?.work_name}
            workCode={selectedEntryForLogs?.work_code}
            dataEntryId={selectedEntryForLogs?.id}
          />
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mb-6">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.pages}
              totalItems={accurateTotalRecords}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* User Form */}
        <UserForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          editingEntry={editingEntry}
        />

        {/* Modern Footer */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>
                  System Active • Generated on {new Date().toLocaleDateString('en-IN')} • 
                  {hasActiveFilters 
                    ? ` Showing ${filteredEntries.length} filtered entries`
                    : ` Total ${accurateTotalRecords} entries in database`
                  }
                </span>
              </div>
              {hasActiveFilters && (
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                  <Filter size={14} />
                  <span>Downloads include filtered results only</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="fixed top-0 right-0 -z-10 opacity-20 pointer-events-none">
          <div className="w-96 h-96 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full blur-3xl"></div>
        </div>
        <div className="fixed bottom-0 left-0 -z-10 opacity-20 pointer-events-none">
          <div className="w-96 h-96 bg-gradient-to-tr from-purple-400 to-pink-600 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}