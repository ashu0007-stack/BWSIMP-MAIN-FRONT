
'use client';
import React from "react";
import { FileDown, FileText, Table } from "lucide-react";
interface DownloadButtonsProps {
  onDownloadCSV: () => void;
  onDownloadPDF: () => void;
  onDownloadExcel: () => void;
  currentPage: number;
  hasActiveFilters: boolean;
  filteredEntriesCount: number;
}

export const DownloadButtons: React.FC<DownloadButtonsProps> = ({
  onDownloadCSV,
  onDownloadPDF,
  onDownloadExcel,
  currentPage,
  hasActiveFilters,
  filteredEntriesCount,
}) => {
  return (
    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
      <button
        onClick={onDownloadCSV}
        disabled={filteredEntriesCount === 0}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        title="Download current page as CSV"
      >
        <FileDown size={16} className="mr-2" />
        CSV (Page {currentPage})
      </button>
      <button
        onClick={onDownloadPDF}
        disabled={filteredEntriesCount === 0}
        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        title="Download current page as PDF"
      >
        <FileText size={16} className="mr-2" />
        PDF (Page {currentPage})
      </button>
      <button
        onClick={onDownloadExcel}
        disabled={filteredEntriesCount === 0}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        title="Download current page as Excel"
      >
        <Table size={16} className="mr-2" />
        Excel (Page {currentPage})
      </button>
    </div>
  );
};