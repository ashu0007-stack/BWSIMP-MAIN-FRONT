import { useFarmerDetails } from "@/hooks/doaHooks/useFarmerDetails";
import { useSessionDetails } from "@/hooks/doaHooks/useSesstionDetails";
import React, { FC, useState } from "react";

export const Attendance: FC = () => {
  const { data: sessionsData, isLoading: loadingSessions } = useSessionDetails();
  const { data: farmersData, isLoading: loadingFarmers } = useFarmerDetails();
  // const { addAttendance, loading: submitting } = useAddFarmerAttendance();

  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [farmerList, setFarmerList] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  // 🔹 Load farmers for selected session
  const handleSessionChange = (sessionId: any) => {
    setSelectedSession(sessionId);
    setMessage("");

    if (!sessionId || !sessionsData || !farmersData) {
      setFarmerList([]);
      console.log('session data in ffs id', sessionsData[0].ffsId)
      console.log('farmer data in ffs id', farmersData)
      console.log('farmer list', farmerList)
      return;
    }

    // Find selected session
    const selected = sessionsData.find((s: any) => s.id === Number(sessionId));
    if (!selected) return;

    // Filter farmers by same FFS ID
    const filteredFarmers = farmersData.filter(
      (f: any) => f.ffsId === selected.ffsId
    );

    // Add attended = false by default
    setFarmerList(filteredFarmers.map((f: any) => ({ ...f, attended: false })));
  };

  // 🔹 Toggle attendance checkbox
  const toggleAttendance = (farmerId: number) => {
    setFarmerList((prev) =>
      prev.map((f) =>
        f.farmerId === farmerId ? { ...f, attended: !f.attended } : f
      )
    );
  };

  // 🔹 Submit attendance
  const handleSubmit = async () => {
    if (!selectedSession) {
      alert("Please select a session first");
      return;
    }

    const payload = farmerList.map((f) => ({
      session_id: selectedSession,
      farmer_id: f.farmerId,
      attended: f.attended ? 1 : 0,
      attendance_date: new Date().toISOString().split("T")[0],
    }));

    try {
      console.log("Submitting Attendance:", payload);
      // await addAttendance(payload);
      setMessage("✅ Attendance submitted successfully!");
    } catch (error) {
      console.error(error);
      setMessage("❌ Error submitting attendance");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 border">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">
        🧑‍🌾 Farmer Attendance
      </h2>

      {/* Session Dropdown */}
      <select
        value={selectedSession}
        onChange={(e) => handleSessionChange(e.target.value)}
        className="mb-4 border px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
        disabled={loadingSessions}
      >
        <option value="">Select a Session</option>
        {sessionsData?.map((s: any) => (
          <option key={s.id} value={s.id}>
            {s.sessionTopic}
          </option>
        ))}
      </select>

      {/* Farmers Table */}
      {loadingFarmers && <p>Loading farmers...</p>}

      {!loadingFarmers && farmerList.length > 0 && (
        <>
          <table className="w-full text-sm border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Farmer Name</th>
                <th className="border p-2">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {farmerList.map((farmer) => (
                <tr key={farmer.farmerId}>
                  <td className="border p-2">{farmer.farmerName}</td>
                  <td className="border p-2 text-center">
                    <input
                      type="checkbox"
                      checked={farmer.attended}
                      onChange={() => toggleAttendance(farmer.farmerId)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Submit Attendance
          </button>
        </>
      )}

      {!loadingFarmers && !farmerList.length && selectedSession && (
        <p className="text-gray-500 text-sm">No farmers found for this session.</p>
      )}

      {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
    </div>
  );
};
