import React, { FC, useState, useMemo, useEffect } from "react";
import { useFfsDetails } from "@/hooks/doaHooks/useFfsDetails";
import { useSessionDetails } from "@/hooks/doaHooks/useSesstionDetails";
import { AttendanceForm } from "../Attendance/AttendanceForm";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/shared/Pagination";
import { Download, SquareChartGantt, Table, Users, Calendar, BookOpen, User, Activity } from "lucide-react";

interface SessionFormProps {
  onAddNew: () => void;
}

export const SessionTable: FC<SessionFormProps> = ({ onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFfs, setSelectedFfs] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [attendanceSession, setAttendanceSession] = useState<any>(null);
  const [page, setPage] = useState(1);

  const { data: ffsData, isLoading: loadingFfs } = useFfsDetails();
  const { data: sessionData, isLoading: sessionLoading, isError } = useSessionDetails();

  // 🔍 Filter Sessions
  const filteredSessions = useMemo(() => {
    if (!sessionData) return [];
    return sessionData.filter((session: any) => {
      const matchesSearch =
        session.sessionTopic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.resourcePerson?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFfs = selectedFfs ? session.ffsId === Number(selectedFfs) : true;

      return matchesSearch && matchesFfs;
    });
  }, [sessionData, searchTerm, selectedFfs]);

  // Pagination
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(filteredSessions.length / PAGE_SIZE);
  const paginatedSessions = filteredSessions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedFfs]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleFfsChange = (value: string) => {
    setSelectedFfs(value);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedFfs(null);
  };

  // Export CSV function
  const exportCSV = () => {
    const headers = [
      "FFS Title",
      "Date",
      "Session Topic",
      "Resource Person",
      "Training Methods",
      "Farmers Male",
      "Farmers Female",
      "Status"
    ];

    const rows = filteredSessions.map((session: any) => [
      session.ffsTitle,
      new Date(session.sessionDate).toLocaleDateString(),
      session.sessionTopic,
      session.resourcePerson,
      session.trainingMethods,
      session.farmersMale || "0",
      session.farmersFemale || "0",
      "Active"
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "session_report.csv";
    link.click();
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case "completed":
          return "bg-green-100 text-green-800";
        case "ongoing":
          return "bg-blue-100 text-blue-800";
        case "scheduled":
          return "bg-yellow-100 text-yellow-800";
        case "cancelled":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
        {status}
      </span>
    );
  };

  if (sessionLoading)
    return <p className="text-blue-600 text-center py-8">Loading Session details...</p>;
  if (isError)
    return <p className="text-red-500 text-center py-8">Error fetching Session details.</p>;

  return (
    <div className="min-h-screen bg-white shadow-md rounded-xl border border-gray-200">
      {/* 🔹 HEADER */}
      <div className="flex items-center justify-between bg-blue-900 rounded-t-xl px-5 py-4 mb-6 shadow">
        <h2 className="text-xl font-bold text-white tracking-wide">
          FFS Session Training Details
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
                Session Filters
              </h2>
            </div>

            <button
              onClick={onAddNew}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm shadow transition-all"
            >
              + Add New Session
            </button>
          </div>

          {/* Filter Body */}
          <div className="p-4 space-y-4">
            {/* Search and Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Search Sessions
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search by Topic or Resource Person..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-4">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Filter by FFS
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={selectedFfs || ""}
                    onChange={(e) => handleFfsChange(e.target.value)}
                    disabled={loadingFfs}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white disabled:bg-gray-100"
                  >
                    <option value="">All FFS Programs</option>
                    {ffsData?.map((ffs: any) => (
                      <option key={ffs.ffsId} value={ffs.ffsId}>
                        {ffs.ffsTitle}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters Chips */}
            {(searchTerm || selectedFfs) && (
              <div className="flex flex-wrap gap-2 pt-3 border-t">
                {searchTerm && (
                  <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Search: {searchTerm}
                  </span>
                )}
                {selectedFfs && ffsData?.find((f: any) => f.ffsId === Number(selectedFfs)) && (
                  <span className="bg-green-100 text-green-900 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    FFS: {ffsData.find((f: any) => f.ffsId === Number(selectedFfs))?.ffsTitle}
                  </span>
                )}
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

        {/* 📊 SESSION TABLE */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md px-4 py-3">
          <div className="flex items-center justify-between mb-3 pb-2 border-b">
            <div className="flex items-center gap-3">
              <Table className="w-5 h-5 text-blue-900" />
              <h2 className="text-lg font-semibold text-blue-900">
                Session Details
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
                  <th className="border px-2 py-2">FFS Title</th>
                  <th className="border px-2 py-2">Date</th>
                  <th className="border px-2 py-2">Session Topic</th>
                  <th className="border px-2 py-2">Resource Person</th>
                  <th className="border px-2 py-2">Training Methods</th>
                  <th className="border px-2 py-2">Farmers (M/F)</th>
                  <th className="border px-2 py-2">Status</th>
                  <th className="border px-2 py-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedSessions.length ? (
                  paginatedSessions.map((session: any, index: number) => (
                    <tr key={session.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                      <td className="border p-2 text-center font-medium">
                        <div className="flex items-center justify-center gap-2">
                          <Users className="w-3 h-3 text-blue-600" />
                          {session.ffsTitle}
                        </div>
                      </td>
                      <td className="border p-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          {new Date(session.sessionDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="border p-2 text-center font-medium">
                        <div className="flex items-center justify-center gap-2">
                          <BookOpen className="w-3 h-3 text-blue-600" />
                          {session.sessionTopic}
                        </div>
                      </td>
                      <td className="border p-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <User className="w-3 h-3 text-blue-600" />
                          {session.resourcePerson}
                        </div>
                      </td>
                      <td className="border p-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Activity className="w-3 h-3 text-blue-600" />
                          {session.trainingMethods}
                        </div>
                      </td>
                      <td className="border p-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-blue-700 font-medium">
                            {session.farmersMale || 0}/{session.farmersFemale || 0}
                          </span>
                        </div>
                      </td>
                      <td className="border p-2 text-center">
                        <div className="flex justify-center">
                          <StatusBadge status={session.status || "Active"} />
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setSelectedSession({ session })}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg shadow transition-all flex items-center gap-1"
                          >
                            <BookOpen className="w-3 h-3" />
                            View
                          </button>
                          <button
                            onClick={() => setAttendanceSession(session)}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg shadow transition-all flex items-center gap-1"
                          >
                            <Users className="w-3 h-3" />
                            Attendance
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-500 text-sm">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <BookOpen className="w-8 h-8 text-gray-300" />
                        No session records found
                      </div>
                    </td>
                  </tr>
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

        {/* View Modal */}
        {selectedSession && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-4xl rounded-xl shadow-lg p-6 relative">
              {/* Close Button */}
              <button
                className="absolute top-3 right-4 text-gray-500 hover:text-black"
                onClick={() => setSelectedSession(null)}
              >
                ✕
              </button>

              {/* Header */}
              <div className="border-b pb-3 mb-4">
                <h3 className="text-lg font-semibold text-blue-700">
                  Session Details
                </h3>
                <p className="text-sm text-gray-500">
                  Farmer Field School: {selectedSession.session.ffsTitle}
                </p>
              </div>

              {/* Content Grid */}
              <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4 text-sm">
                {/* Basic Information */}
                <div>
                  <SectionTitle title="Basic Information" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Detail label="Date" value={new Date(selectedSession.session.sessionDate).toLocaleDateString()} />
                    <Detail label="Session Topic" value={selectedSession.session.sessionTopic} />
                    <Detail label="Resource Person" value={selectedSession.session.resourcePerson} />
                    <Detail label="Training Methods" value={selectedSession.session.trainingMethods} />
                  </div>
                </div>

                {/* Attendance */}
                <div>
                  <SectionTitle title="Attendance Details" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Detail label="Male Farmers" value={selectedSession.session.farmersMale || "0"} />
                    <Detail label="Female Farmers" value={selectedSession.session.farmersFemale || "0"} />
                    <Detail label="Total Attendance" value={
                      (parseInt(selectedSession.session.farmersMale || 0) + parseInt(selectedSession.session.farmersFemale || 0)).toString()
                    } />
                  </div>
                </div>

                {/* Session Activities */}
                <div>
                  <SectionTitle title="Session Activities" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Detail label="Agro Ecosystem Analysis" value={selectedSession.session.agroEcosystem ? "Yes" : "No"} />
                    <Detail label="Special Topic Covered" value={selectedSession.session.specialTopic ? "Yes" : "No"} />
                    <Detail label="Group Dynamics" value={selectedSession.session.groupDynamics ? "Yes" : "No"} />
                    <Detail label="Feedback Collected" value={selectedSession.session.feedbackCollected ? "Yes" : "No"} />
                  </div>
                </div>

                {/* Issues & Actions */}
                <div>
                  <SectionTitle title="Issues & Corrective Actions" />
                  <div className="grid grid-cols-1 gap-4">
                    <Detail label="Issues Identified" value={selectedSession.session.issues || "-"} />
                    <Detail label="Corrective Actions" value={selectedSession.session.correctiveActions || "-"} />
                  </div>
                </div>

                {/* Additional Information */}
                {selectedSession.session.additionalNotes && (
                  <div>
                    <SectionTitle title="Additional Notes" />
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700">{selectedSession.session.additionalNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Attendance Form Modal */}
        {attendanceSession && (
          <AttendanceForm
            attendanceSession={attendanceSession}
            setAttendanceSession={setAttendanceSession}
          />
        )}
      </div>
    </div>
  );
};

/* 🔹 Chip Component */
const Chip = ({ label }: { label: string }) => (
  <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-xs font-medium">
    {label}
  </span>
);

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-gray-500 text-xs mb-1">{label}</p>
    <p className="font-medium text-gray-900">{value || "-"}</p>
  </div>
);

const SectionTitle = ({ title }: { title: string }) => (
  <div className="mt-4 mb-2">
    <h3 className="text-sm font-semibold text-blue-900 border-b pb-1">
      {title}
    </h3>
  </div>
);