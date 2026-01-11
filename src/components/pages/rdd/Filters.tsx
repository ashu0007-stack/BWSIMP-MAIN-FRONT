'use client';

import React from "react";
import {
  Filter,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  FileDown,
  FileText,
  Table,
} from "lucide-react";

interface District {
  district_id: number;
  district_name: string;
}

interface FiltersProps {
  filters: {
    district: string;
    search: string;
    workCode: string;
    financialYear: string;
  };
  localSearch: string;
  localWorkCode: string;
  userDistrict: string; // district NAME
  districtResolved: boolean;
  districts: District[];
  financialYears: Array<{ value: string; label: string }>;
  hasActiveFilters: boolean;
  onFilterChange: (filter: string, value: string) => void;
  onLocalSearchChange: (value: string) => void;
  onLocalWorkCodeChange: (value: string) => void;
  onClearFilters: () => void;
  onDownloadCSV: () => void;
  onDownloadPDF: () => void;
  onDownloadExcel: () => void;
  currentPage: number;
  filteredEntriesCount: number;
}

export const Filters: React.FC<FiltersProps> = ({
  filters,
  localSearch,
  localWorkCode,
  userDistrict,
  districtResolved,
  districts,
  financialYears,
  hasActiveFilters,
  onFilterChange,
  onLocalSearchChange,
  onLocalWorkCodeChange,
  onClearFilters,
  onDownloadCSV,
  onDownloadPDF,
  onDownloadExcel,
  currentPage,
  filteredEntriesCount,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            <X size={16} className="mr-1" />
            Clear All
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* District */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            District{" "}
            {districtResolved && (
              <span className="text-green-600 text-xs">(Auto-selected)</span>
            )}
          </label>

          {/* SHOW DROPDOWN WHEN NOT RESOLVED */}
                {districtResolved ? (
                  <input
                    type="text"
                    value={userDistrict}
                    disabled
                    readOnly
                    className="..."
                  />
                ) : (
              <select
                value={filters.district}
                onChange={(e) => onFilterChange('district', e.target.value)}
              >
                <option value="all">All Districts</option>
                {districts.map(d => (
                  <option key={d.district_id} value={Number(d.district_id)}>
                    {d.district_name}
                  </option>
                ))}
              </select>
            )}
          {/* Status message */}
          {userDistrict && !districtResolved && (
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> District not found in system
            </p>
          )}
        </div>

        {/* Financial Year */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Financial Year
          </label>
          <select
            value={filters.financialYear}
            onChange={(e) =>
              onFilterChange("financialYear", e.target.value)
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Financial Years</option>
            {financialYears.map((fy) => (
              <option key={fy.value} value={fy.value}>
                {fy.label}
              </option>
            ))}
          </select>
        </div>

        {/* Work Code */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Work Code
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={localWorkCode}
              onChange={(e) => onLocalWorkCodeChange(e.target.value)}
              placeholder="Search by work code"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Work Name */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Work Name
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={localSearch}
            onChange={(e) => onLocalSearchChange(e.target.value)}
            placeholder="Search by work name"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Download buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button
          onClick={onDownloadCSV}
          disabled={filteredEntriesCount === 0}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
        >
          <FileDown size={16} className="mr-2" /> CSV (Page {currentPage})
        </button>

        <button
          onClick={onDownloadPDF}
          disabled={filteredEntriesCount === 0}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
        >
          <FileText size={16} className="mr-2" /> PDF (Page {currentPage})
        </button>

        <button
          onClick={onDownloadExcel}
          disabled={filteredEntriesCount === 0}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          <Table size={16} className="mr-2" /> Excel (Page {currentPage})
        </button>
      </div>
    </div>
  );
};
