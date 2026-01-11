import React, { FC, useState, useMemo } from "react";
import { useFfsDetails } from "@/hooks/doaHooks/useFfsDetails";
import { useSessionDetails } from "@/hooks/doaHooks/useSesstionDetails";
import { AttendanceForm } from "../Attendance/AttendanceForm";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/shared/Pagination";

interface SessionFormProps {
  onAddNew: () => void;
}

export const SessionTable: FC<SessionFormProps> = ({ onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFfs, setSelectedFfs] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [attendanceSession, setAttendanceSession] = useState<any>(null);

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

  // Pagination Hook (15 rows per page)
  const {
    currentPage,
    totalPages,
    currentData: paginatedSessions,
    goToPage,
    setCurrentPage
  } = usePagination(filteredSessions, 10);

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFfsChange = (value: string) => {
    setSelectedFfs(value);
    setCurrentPage(1);
  };


  if (sessionLoading)
    return <p className="text-blue-600 text-center">Loading Session details...</p>;
  if (isError)
    return <p className="text-red-500 text-center">Error fetching Session details.</p>;

  return (
    <div className=" mx-auto py-4 px-3 sm:px-4">

      {/* Filter Section */}
      <div className="mb-6 bg-white shadow-md rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm sm:text-base font-semibold mb-3 text-gray-700 border-b pb-2">🌍 Location Filters</h3>

        <div className=" grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="🔍 Search by Topic or Resource Person..."
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              onChange={(e) => handleFfsChange(e.target.value)}
              disabled={loadingFfs}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Filter by FFS</option>
              {ffsData?.map((ffs: any) => (
                <option key={ffs.ffsId} value={ffs.ffsId}>
                  {ffs.ffsTitle}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">📋 Session Training Details</h2>

        <button
          onClick={onAddNew}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 shadow transition-all w-full sm:w-auto"
        >
          + Add New
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-x-auto">
        <table className="min-w-[800px] w-full text-xs sm:text-sm md:text-[13px] text-gray-700 border-collapse">
          <thead className="bg-blue-50 text-gray-700">
            <tr>
              {["FFS Title", "Date", "Session Topic", "Resource Person", "Training Methods", "Status", "Actions"].map((header) => (
                <th key={header} className="px-2 py-2 border-b text-center font-semibold">{header}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedSessions.length ? (
              paginatedSessions.map((session: any, index: number) => (
                <tr
                  key={session.id}
                  className={`border-b hover:bg-blue-50 transition-all ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                >
                  <td className="p-2 text-center">{session.ffsTitle}</td>
                  <td className="p-2 text-center">{new Date(session.sessionDate).toLocaleDateString()}</td>
                  <td className="p-2 text-center">{session.sessionTopic}</td>
                  <td className="p-2 text-center">{session.resourcePerson}</td>
                  <td className="p-2 text-center">{session.trainingMethods}</td>
                  <td className="p-2 text-center">status</td>

                  <td className="p-2 text-center flex justify-center gap-2">
                    <button
                      onClick={() => setSelectedSession({ session })}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg shadow"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setAttendanceSession(session)}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg shadow"
                    >
                      Attendance
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500 text-sm">
                  No session records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />

      {/* View Modal */}
      {/* ✨ Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative border border-gray-200">
            {/* Close Button */}
            <button className="absolute top-3 right-3 text-gray-500 hover:text-red-600" onClick={() => setSelectedSession(null)} > ✕ </button>
            {/* Header */}
            <div className="border-b pb-3 mb-4">
              <h3 className="text-lg font-semibold text-blue-700"> Session Details </h3>
              <p className="text-sm text-gray-500"> Farmer Field School : {selectedSession.session.ffsTitle} </p>
            </div> {/* Content Grid */} <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
              <p><strong>Date:</strong> {new Date(selectedSession.session.sessionDate).toLocaleDateString()}</p>
              <p><strong>Topic:</strong> {selectedSession.session.sessionTopic}</p>
              <p><strong>Resource Person:</strong> {selectedSession.session.resourcePerson}</p>
              <p><strong>Training:</strong> {selectedSession.session.trainingMethods}</p>
              <p><strong>Farmers (M/F):</strong> {selectedSession.session.farmersMale}/{selectedSession.session.farmersFemale}</p>
              <p><strong>Agro Ecosystem:</strong> {selectedSession.session.agroEcosystem ? "Yes" : "No"}</p>
              <p><strong>Special Topic:</strong> {selectedSession.session.specialTopic ? "Yes" : "No"}</p>
              <p><strong>Group Dynamics:</strong> {selectedSession.session.groupDynamics ? "Yes" : "No"}</p>
              <p><strong>Feedback:</strong> {selectedSession.session.feedbackCollected ? "Yes" : "No"}</p>
              <p><strong>Issues:</strong> {selectedSession.session.issues || "-"}</p>
              <p><strong>Corrective Actions:</strong> {selectedSession.session.correctiveActions || "-"}</p>
            </div>
          </div>
        </div>
      )}

      {attendanceSession && (
        <AttendanceForm
          attendanceSession={attendanceSession}
          setAttendanceSession={setAttendanceSession}
        />
      )}
    </div>
  );
};
