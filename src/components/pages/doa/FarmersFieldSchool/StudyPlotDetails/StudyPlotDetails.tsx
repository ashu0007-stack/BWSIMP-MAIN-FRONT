import React, { FC, useState, useMemo, useEffect } from "react";
import { Download, SquareChartGantt, Table, User, Phone, Home, Leaf, Users, Search, Eye, Edit } from "lucide-react";
import { Pagination } from "@/components/shared/Pagination";
import { FormValues } from "./StudyPlotForm";

interface StudyPlotFormProps {
  data: FormValues[];
  onAddNew: () => void;
}

export const StudyDetails: FC<StudyPlotFormProps> = ({ data, onAddNew }) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRow, setSelectedRow] = useState<FormValues | null>(null);

  const PAGE_SIZE = 10;

  // Filter study plots based on search term
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    return data.filter((study: FormValues) => {
      return (
        searchTerm === "" ||
        study.HostFarmerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(study.StudyPlotID)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        study.CropPracticeDemonstrated?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        study.ObservationsRecorded?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [data, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleClearFilters = () => {
    setSearchTerm("");
  };

  // Export CSV function
  const exportCSV = () => {
    const headers = [
      "Study Plot ID",
      "Host Farmer Name",
      "Host Farmer Contact",
      "Study Plot Size (ha)",
      "Crop Practice Demonstrated",
      "Inputs Details",
      "Control Plot",
      "Observations Recorded"
    ];

    const rows = filteredData.map((study: FormValues) => [
      study.StudyPlotID || "-",
      study.HostFarmerName || "-",
      study.HostFarmerContact || "-",
      study.StudyPlotSize || "-",
      study.CropPracticeDemonstrated || "-",
      study.InputsDetails || "-",
      study.ControlPlot || "-",
      study.ObservationsRecorded || "-"
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "study_plots_report.csv";
    link.click();
  };

  // Control plot badge component
 const ControlPlotBadge = ({ isControl }: { isControl: boolean | string }) => {
  const isControlPlot =
    typeof isControl === "boolean"
      ? isControl
      : ["y", "yes", "true"].includes(isControl.toLowerCase());

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      isControlPlot ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
    }`}>
      {isControlPlot ? "Control Plot" : "Demonstration Plot"}
    </span>
  );
};


  return (
    <div className="min-h-screen bg-white shadow-md rounded-xl border border-gray-200">
      {/* 🔹 HEADER */}
      <div className="flex items-center justify-between bg-blue-900 rounded-t-xl px-5 py-4 mb-6 shadow">
        <h2 className="text-xl font-bold text-white tracking-wide">
          Study Plot Details
        </h2>
      </div>

      <div className="px-4 pb-6">
        {/* 🔍 MERGED FILTER PANEL */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md mb-6">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-7 bg-blue-900 rounded-full" />
              <SquareChartGantt className="w-5 h-5 text-blue-900" />
              <h2 className="text-lg font-semibold text-blue-900">
                Study Plot Filters
              </h2>
            </div>

            <button
              onClick={onAddNew}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm shadow transition-all"
            >
              + Add New Study Plot
            </button>
          </div>

          {/* Filter Body */}
          <div className="p-4 space-y-4">
            {/* Search Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-12">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Search Study Plots
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by ID, farmer name, crop practice, or observations..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Control Plot Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Filter by Plot Type
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  onChange={(e) => {
                    // Handle plot type filter
                  }}
                >
                  <option value="">All Plot Types</option>
                  <option value="control">Control Plots</option>
                  <option value="demonstration">Demonstration Plots</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Filter by Crop Practice
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  onChange={(e) => {
                    // Handle crop practice filter
                  }}
                >
                  <option value="">All Practices</option>
                  <option value="sowing">Sowing</option>
                  <option value="fertilization">Fertilization</option>
                  <option value="irrigation">Irrigation</option>
                  <option value="pest">Pest Management</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleClearFilters}
                  className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Active Filters Chips */}
            {searchTerm && (
              <div className="flex flex-wrap gap-2 pt-3 border-t">
                <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Search className="w-3 h-3" />
                  Search: {searchTerm}
                </span>
                <button
                  onClick={handleClearFilters}
                  className="text-gray-600 hover:text-gray-900 text-xs font-medium ml-auto"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 📊 STUDY PLOTS TABLE */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md px-4 py-3">
          <div className="flex items-center justify-between mb-3 pb-2 border-b">
            <div className="flex items-center gap-3">
              <Table className="w-5 h-5 text-blue-900" />
              <h2 className="text-lg font-semibold text-blue-900">
                Study Plot Details
              </h2>
            </div>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              <Download className="w-4 h-4" /> Download CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-gray-700 border-collapse">
              <thead className="bg-green-100 sticky top-0 z-10">
                <tr>
                  {[
                    "Study Plot ID",
                    "Host Farmer",
                    "Contact",
                    "Plot Size (ha)",
                    "Crop Practice",
                    "Inputs Details",
                    "Plot Type",
                    "Observations",
                    "Actions"
                  ].map((header, idx) => (
                    <th key={idx} className="border px-2 py-2 text-center">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-6 text-gray-500 text-sm">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Leaf className="w-8 h-8 text-gray-300" />
                        <p>No study plot records found</p>
                        {searchTerm && (
                          <button
                            onClick={handleClearFilters}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Clear search to see all study plots
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((study: FormValues, index: number) => (
                    <tr key={index} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                      <td className="border p-2 text-center font-medium">
                        <div className="flex items-center justify-center gap-2">
                          <Leaf className="w-3 h-3 text-blue-600" />
                          <span>{study.StudyPlotID}</span>
                        </div>
                      </td>
                      <td className="border p-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <User className="w-3 h-3 text-blue-600" />
                          <span className="font-medium">{study.HostFarmerName}</span>
                        </div>
                      </td>
                      <td className="border p-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Phone className="w-3 h-3 text-green-600" />
                          <span>{study.HostFarmerContact || "-"}</span>
                        </div>
                      </td>
                      <td className="border p-2 text-center">
                        <span className="font-medium">{study.StudyPlotSize || "0"}</span>
                      </td>
                      <td className="border p-2 text-center">
                        <div className="max-w-[150px] mx-auto">
                          <span className="truncate block" title={study.CropPracticeDemonstrated}>
                            {study.CropPracticeDemonstrated || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="border p-2 text-center">
                        <div className="max-w-[120px] mx-auto">
                          <span className="truncate block" title={study.InputsDetails}>
                            {study.InputsDetails || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="border p-2 text-center">
                        <div className="flex justify-center">
                          <ControlPlotBadge isControl={study.ControlPlot} />
                        </div>
                      </td>
                      <td className="border p-2 text-center">
                        <div className="max-w-[150px] mx-auto">
                          <span className="truncate block text-xs" title={study.ObservationsRecorded}>
                            {study.ObservationsRecorded || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="border p-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setSelectedRow(study)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg shadow transition-all flex items-center gap-1 text-xs"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                          <button
                            onClick={() => onAddNew()}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg shadow transition-all flex items-center gap-1 text-xs"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* 🔍 VIEW MODAL */}
      {selectedRow && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-4xl rounded-xl shadow-lg p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedRow(null)}
              className="absolute top-3 right-4 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            {/* Header */}
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              Study Plot Details
            </h2>

            <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4 text-sm">
              {/* Basic Information */}
              <div>
                <SectionTitle title="Basic Information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Detail label="Study Plot ID" value={selectedRow.StudyPlotID} />
                  <Detail label="Plot Size (ha)" value={selectedRow.StudyPlotSize} />
                  <Detail label="Plot Type" value={
                    <ControlPlotBadge isControl={selectedRow.ControlPlot} />
                  } />
                </div>
              </div>

              {/* Farmer Details */}
              <div>
                <SectionTitle title="Host Farmer Details" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Detail label="Farmer Name" value={selectedRow.HostFarmerName} />
                  <Detail label="Contact Number" value={selectedRow.HostFarmerContact} />
                </div>
              </div>

              {/* Crop Details */}
              <div>
                <SectionTitle title="Crop & Practice Details" />
                <div className="grid grid-cols-1 gap-4">
                  <Detail label="Crop Practice Demonstrated" value={selectedRow.CropPracticeDemonstrated} />
                  <Detail label="Inputs Details" value={selectedRow.InputsDetails} />
                </div>
              </div>

              {/* Observations */}
              <div>
                <SectionTitle title="Observations" />
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">
                    {selectedRow.ObservationsRecorded || "No observations recorded"}
                  </p>
                </div>
              </div>

              {/* Additional Data (if any) */}
              {selectedRow.additionalData && (
                <div>
                  <SectionTitle title="Additional Information" />
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-gray-700">{selectedRow.additionalData}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* 🔹 Detail Component */
const Detail = ({ label, value }: { label: string; value: any }) => (
  <div>
    <p className="text-gray-500 text-xs mb-1">{label}</p>
    <div className="font-medium text-gray-900">
      {value || "-"}
    </div>
  </div>
);

/* 🔹 Section Title Component */
const SectionTitle = ({ title }: { title: string }) => (
  <div className="mt-4 mb-2">
    <h3 className="text-sm font-semibold text-blue-900 border-b pb-1">
      {title}
    </h3>
  </div>
);