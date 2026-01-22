"use client";

import { useState } from "react";
import { Search, Filter, Calendar, FileText, Eye, Download, Printer, Share2 } from "lucide-react";

interface Report {
  id: number;
  report_number: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'six_monthly';
  reporting_period_start: string;
  reporting_period_end: string;
  submission_date: string;
  submitted_by: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  environmental_summary?: string;
  social_summary?: string;
}

interface ESReportsViewProps {
  id: number;
}

export default function ESReportsView({ id }: ESReportsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Sample reports data
  const reports: Report[] = [
    {
      id: 1,
      report_number: 'ESR-2024-01',
      report_type: 'monthly',
      reporting_period_start: '2024-01-01',
      reporting_period_end: '2024-01-31',
      submission_date: '2024-02-05',
      submitted_by: 'E&S Officer',
      status: 'approved',
      environmental_summary: 'All environmental parameters within limits. Water quality satisfactory.',
      social_summary: 'Labour camp facilities adequate. 2 training sessions conducted.'
    },
    {
      id: 2,
      report_number: 'ESR-2023-12',
      report_type: 'monthly',
      reporting_period_start: '2023-12-01',
      reporting_period_end: '2023-12-31',
      submission_date: '2024-01-05',
      submitted_by: 'E&S Officer',
      status: 'approved'
    },
    {
      id: 3,
      report_number: 'ESR-2023-S1',
      report_type: 'six_monthly',
      reporting_period_start: '2023-07-01',
      reporting_period_end: '2023-12-31',
      submission_date: '2024-01-15',
      submitted_by: 'E&S Officer',
      status: 'reviewed'
    },
    {
      id: 4,
      report_number: 'ESR-D-2024-02-01',
      report_type: 'daily',
      reporting_period_start: '2024-02-01',
      reporting_period_end: '2024-02-01',
      submission_date: '2024-02-02',
      submitted_by: 'Site Supervisor',
      status: 'submitted'
    },
    {
      id: 5,
      report_number: 'ESR-W-2024-05',
      report_type: 'weekly',
      reporting_period_start: '2024-01-29',
      reporting_period_end: '2024-02-04',
      submission_date: '2024-02-05',
      submitted_by: 'Site Supervisor',
      status: 'draft'
    }
  ];

  const filteredReports = reports.filter(report =>
    (selectedType === '' || report.report_type === selectedType) &&
    (selectedStatus === '' || report.status === selectedStatus) &&
    (searchTerm === '' || 
      report.report_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.submitted_by.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      reviewed: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      daily: '📅',
      weekly: '📊',
      monthly: '📋',
      six_monthly: '📑',
    };
    return icons[type] || '📄';
  };

  const handleDownload = (report: Report, format: 'pdf' | 'excel') => {
    // Implement download logic
  };

  const handlePrint = (report: Report) => {
    window.print();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">E&S Reports</h2>
          <p className="text-gray-600">View and manage environmental and social reports</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Report Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="six_monthly">Six-Monthly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search reports by number or submitter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded pl-10 pr-3 py-2"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow border hover:shadow-lg transition-shadow">
            <div className="p-5">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{getTypeIcon(report.report_type)}</span>
                    <span className="font-bold">{report.report_number}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Submitted</div>
                  <div className="text-sm font-medium">
                    {new Date(report.submission_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Period */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Calendar className="w-4 h-4" />
                {new Date(report.reporting_period_start).toLocaleDateString()} - 
                {new Date(report.reporting_period_end).toLocaleDateString()}
              </div>

              {/* Type */}
              <div className="mb-4">
                <div className="text-sm text-gray-500">Report Type</div>
                <div className="font-medium capitalize">{report.report_type} Report</div>
              </div>

              {/* Submitted By */}
              <div className="mb-4">
                <div className="text-sm text-gray-500">Submitted By</div>
                <div className="font-medium">{report.submitted_by}</div>
              </div>

              {/* Summary (if available) */}
              {report.environmental_summary && (
                <div className="mb-3">
                  <div className="text-sm text-gray-500 mb-1">Environmental Summary</div>
                  <p className="text-sm line-clamp-2">{report.environmental_summary}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => setSelectedReport(report)}
                  className="flex-1 flex items-center justify-center gap-1 p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">View</span>
                </button>
                
                <button
                  onClick={() => handleDownload(report, 'pdf')}
                  className="flex-1 flex items-center justify-center gap-1 p-2 text-green-600 hover:bg-green-50 rounded"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">PDF</span>
                </button>
                
                <button
                  onClick={() => handlePrint(report)}
                  className="flex-1 flex items-center justify-center gap-1 p-2 text-gray-600 hover:bg-gray-50 rounded"
                  title="Print"
                >
                  <Printer className="w-4 h-4" />
                  <span className="text-sm">Print</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredReports.length === 0 && (
          <div className="col-span-3 text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Reports Found</h3>
            <p className="text-gray-500">Try adjusting your search filters</p>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onDownload={handleDownload}
          onPrint={handlePrint}
        />
      )}
    </div>
  );
}

// Report Detail Modal Component
function ReportDetailModal({ report, onClose, onDownload, onPrint }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold">{report.report_number}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
                <span className="text-gray-600 capitalize">{report.report_type} Report</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Report Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Reporting Period</h4>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(report.reporting_period_start).toLocaleDateString()} - 
                  {new Date(report.reporting_period_end).toLocaleDateString()}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Submission Details</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submitted By:</span>
                    <span className="font-medium">{report.submitted_by}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submission Date:</span>
                    <span className="font-medium">
                      {new Date(report.submission_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {report.environmental_summary && (
                <div>
                  <h4 className="font-semibold mb-2">Environmental Summary</h4>
                  <p className="text-gray-700">{report.environmental_summary}</p>
                </div>
              )}
              
              {report.social_summary && (
                <div>
                  <h4 className="font-semibold mb-2">Social Summary</h4>
                  <p className="text-gray-700">{report.social_summary}</p>
                </div>
              )}
            </div>
          </div>

          {/* Report Content Preview */}
          <div className="border rounded-lg p-4 mb-6">
            <h4 className="font-semibold mb-3">Report Preview</h4>
            <div className="bg-gray-50 p-4 rounded border">
              <div className="text-center mb-4">
                <div className="font-bold text-lg">E&S MONITORING REPORT</div>
                <div className="text-gray-600">{report.report_number}</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Project:</span>
                  <span>BWSIMP Package No. XYZ</span>
                </div>
                <div className="flex justify-between">
                  <span>Contractor:</span>
                  <span>ABC Constructions Ltd.</span>
                </div>
                <div className="flex justify-between">
                  <span>Report Type:</span>
                  <span className="capitalize">{report.report_type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Period:</span>
                  <span>
                    {new Date(report.reporting_period_start).toLocaleDateString()} to 
                    {new Date(report.reporting_period_end).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 text-sm text-gray-500 text-center">
                [Full report content would be displayed here]
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => onPrint(report)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              
              <button
                onClick={() => onDownload(report, 'pdf')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              
              <button
                onClick={() => onDownload(report, 'excel')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function (reuse from previous component)
function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    reviewed: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}