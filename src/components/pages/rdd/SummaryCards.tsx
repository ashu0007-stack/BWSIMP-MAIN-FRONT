// components/SummaryCards.tsx
'use client';

import React from "react";
import { FileText, Download, Calendar, Filter } from "lucide-react";

interface SummaryCardsProps {
  currentPageCount: number;
  totalRecords: number;
  totalSanctioned: string;
  currentPage: number;
  totalPages: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  currentPageCount,
  totalRecords,
  totalSanctioned,
  currentPage,
  totalPages,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <FileText className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Current Page</p>
            <p className="text-2xl font-bold text-gray-900">{currentPageCount}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <Download className="w-8 h-8 text-green-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Total Records</p>
            <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <Calendar className="w-8 h-8 text-purple-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Total Sanctioned</p>
            <p className="text-xl font-bold text-gray-900">{totalSanctioned}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <Filter className="w-8 h-8 text-orange-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Current Page</p>
            <p className="text-2xl font-bold text-gray-900">{currentPage} of {totalPages}</p>
          </div>
        </div>
      </div>
    </div>
  );
};