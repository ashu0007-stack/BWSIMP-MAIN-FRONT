import React, { FC, useEffect, useState } from "react";
import { useFarmerDetails } from "@/hooks/doaHooks/useFarmerDetails";
import { useAddAttendanceDetails } from "@/hooks/doaHooks/useAttendance";
import toast from "react-hot-toast";

export const AttendanceForm: FC<any> = ({attendanceSession,setAttendanceSession,}) => {
  const sessionId = attendanceSession.sessionId;
  const ffsId = attendanceSession.ffsId;
  const { data: farmerData } = useFarmerDetails();
  const { mutate: addAttendance} = useAddAttendanceDetails();

  const [sessionPhotos, setSessionPhotos] = useState<{ photo1: File | null; photo2: File | null }>({
    photo1: null,
    photo2: null,
  });

  const [attendanceData, setAttendanceData] = useState<{ [farmerId: number]: boolean }>({});
  const [conductDetails, setConductDetails] = useState({
    resourcePerson: "",
    remarks: "",
    farmers_attended_male: "",
    farmers_attended_female: "",
    agro_ecosystem: false,
    agro_ecosystem_text: "",
    special_topic_planned: false,
    special_topic_text: "",
    group_dynamics: false,
    group_dynamics_text: "",
    feedback_collected: false,
    feedback_text: "",
    issues_challenges: "",
    corrective_actions: "",
  });

  // Filter farmers by FFS ID
  useEffect(() => {
    const farmersOfFfs =
      farmerData?.filter((farmer: any) => farmer.ffsId === ffsId) || [];
    setAttendanceSession((prev: any) => ({ ...prev, farmers: farmersOfFfs }));
    setAttendanceData({});
  }, [ffsId, farmerData, setAttendanceSession]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setSessionPhotos((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  // Attendance checkbox handler
  const handleAttendanceChange = (farmerId: number) => {
    setAttendanceData((prev) => ({
      ...prev,
      [farmerId]: !prev[farmerId],
    }));
  };

  // Conduct form input handler — ✅ Type-safe fix for 'checked'
  const handleConductChange = (e: any) => {
    const { name, value, type } = e.target;

    if (e.target instanceof HTMLInputElement && type === "checkbox") {
      setConductDetails((prev) => ({
        ...prev,
        [name]: e.target.checked,
      }));
    } else {
      setConductDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Submit combined form
  const handleSubmitAttendance = () => {
    const presentFarmers = Object.entries(attendanceData)
      .filter(([, isPresent]) => isPresent)
      .map(([farmerId]) => Number(farmerId));

    const payload = {
      sessionId,
      ffsId,
      sessionDate: attendanceSession.sessionDate,
      sessionTopic: attendanceSession.sessionTopic,
      resourcePerson: conductDetails.resourcePerson,
      remarks: conductDetails.remarks,
      farmers_attended_male: Number(conductDetails.farmers_attended_male) || 0,
      farmers_attended_female: Number(conductDetails.farmers_attended_female) || 0,
      agro_ecosystem: conductDetails.agro_ecosystem,
      agro_ecosystem_text: conductDetails.agro_ecosystem_text,
      special_topic_planned: conductDetails.special_topic_planned,
      special_topic_text: conductDetails.special_topic_text,
      group_dynamics: conductDetails.group_dynamics,
      group_dynamics_text: conductDetails.group_dynamics_text,
      feedback_collected: conductDetails.feedback_collected,
      feedback_text: conductDetails.feedback_text,
      issues_challenges: conductDetails.issues_challenges,
      corrective_actions: conductDetails.corrective_actions,
      presentFarmers,
      photo1: sessionPhotos.photo1,
      photo2: sessionPhotos.photo2,
    };

    // console.log("Submitting Payload:", payload);

  //   const formData = new FormData();
  // formData.append("sessionData", JSON.stringify(payload));
  // if (sessionPhotos.photo1) formData.append("photo1", sessionPhotos.photo1);
  // if (sessionPhotos.photo2) formData.append("photo2", sessionPhotos.photo2);

  // console.log("Submitting Payload:", formData);
    addAttendance(payload, {
    onSuccess: () => {
      toast.success("Session conduct & attendance submitted successfully!");
      setAttendanceSession(null);
    },
    onError: () => {
      toast.error("Failed to submit session. Please try again.");
    },
  });

    toast.success("Session conduct & attendance submitted successfully!");
    setAttendanceSession(null);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-5 relative border border-gray-200 overflow-y-auto max-h-[90vh] text-sm">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-base font-bold"
          onClick={() => setAttendanceSession(null)}
        >
          ✕
        </button>

        <h3 className="text-lg font-semibold text-green-700 mb-2">
          Conduct Session & Attendance
        </h3>
        <p className="text-xs text-gray-600 mb-3">
          FFS: {attendanceSession.ffsTitle} | Date:{" "}
          {new Date(attendanceSession.sessionDate).toLocaleDateString()}
        </p>

        {/* ===== Conduct Details ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border p-3 rounded-md bg-gray-50 mb-3">
          <div>
            <label className="font-medium text-gray-700 mb-0.5 block">
              Farmers (Male)
            </label>
            <input
              type="number"
              name="farmers_attended_male"
              value={conductDetails.farmers_attended_male}
              onChange={handleConductChange}
              placeholder="Enter number"
              className="w-full border rounded-md p-1.5 text-sm focus:ring-1 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700 mb-0.5 block">
              Farmers (Female)
            </label>
            <input
              type="number"
              name="farmers_attended_female"
              value={conductDetails.farmers_attended_female}
              onChange={handleConductChange}
              placeholder="Enter number"
              className="w-full border rounded-md p-1.5 text-sm focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>

        {/* ===== Checkboxes ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {/* Example: Agro Ecosystem */}
          <div>
            <label className="flex items-center font-medium text-gray-700 text-sm">
              <input
                type="checkbox"
                name="agro_ecosystem"
                checked={conductDetails.agro_ecosystem}
                onChange={handleConductChange}
                className="mr-2 h-4 w-4 accent-green-600"
              />
              Agro Ecosystem
            </label>
            {conductDetails.agro_ecosystem && (
              <input
                type="text"
                name="agro_ecosystem_text"
                value={conductDetails.agro_ecosystem_text}
                onChange={handleConductChange}
                placeholder="Enter details"
                className="w-full mt-1 border rounded-md p-1.5 text-sm focus:ring-1 focus:ring-green-500"
              />
            )}
          </div>

          <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-gray-700 mb-1 block">Session Photo 1</label>
              <input
                type="file"
                name="photo1"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full border rounded-md p-1.5 text-sm"
              />
              {sessionPhotos.photo1 && <p className="text-xs text-green-600 mt-1">{sessionPhotos.photo1.name}</p>}
            </div>

            <div>
              <label className="font-medium text-gray-700 mb-1 block">Session Photo 2</label>
              <input
                type="file"
                name="photo2"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full border rounded-md p-1.5 text-sm"
              />
              {sessionPhotos.photo2 && <p className="text-xs text-green-600 mt-1">{sessionPhotos.photo2.name}</p>}
            </div>
          </div>

          {/* Example: Feedback */}
          <div>
            <label className="flex items-center font-medium text-gray-700 text-sm">
              <input
                type="checkbox"
                name="feedback_collected"
                checked={conductDetails.feedback_collected}
                onChange={handleConductChange}
                className="mr-2 h-4 w-4 accent-green-600"
              />
              Feedback Collected
            </label>
            {conductDetails.feedback_collected && (
              <input
                type="text"
                name="feedback_text"
                value={conductDetails.feedback_text}
                onChange={handleConductChange}
                placeholder="Enter feedback details"
                className="w-full mt-1 border rounded-md p-1.5 text-sm focus:ring-1 focus:ring-green-500"
              />
            )}
          </div>
        </div>

        {/* ===== Textareas ===== */}
        <div className="mb-3">
          <label className="font-medium text-gray-700 mb-0.5 block">
            Issues / Challenges
          </label>
          <textarea
            name="issues_challenges"
            value={conductDetails.issues_challenges}
            onChange={handleConductChange}
            placeholder="Enter issues or challenges"
            className="w-full px-3 py-1.5 border rounded-md text-sm focus:ring-1 focus:ring-green-500"
            rows={2}
          />
        </div>

        <div className="mb-3">
          <label className="font-medium text-gray-700 mb-0.5 block">
            Corrective Actions
          </label>
          <textarea
            name="corrective_actions"
            value={conductDetails.corrective_actions}
            onChange={handleConductChange}
            placeholder="Enter corrective actions"
            className="w-full px-3 py-1.5 border rounded-md text-sm focus:ring-1 focus:ring-green-500"
            rows={2}
          />
        </div>

        {/* ===== Attendance List ===== */}
        <h4 className="text-base font-semibold text-gray-700 mb-2">
          Farmer Attendance
        </h4>
        <div className="max-h-48 overflow-y-auto border rounded-md p-2.5 mb-3 text-sm">
          {attendanceSession.farmers?.length ? (
            attendanceSession.farmers.map((farmer: any) => (
              <label
                key={farmer.farmerId}
                className="flex justify-between items-center border-b py-1 text-sm"
              >
                <span className="truncate">{farmer.farmerName}</span>
                <input
                  type="checkbox"
                  checked={!!attendanceData[farmer.farmerId]}
                  onChange={() => handleAttendanceChange(farmer.farmerId)}
                  className="w-4 h-4 accent-green-600"
                />
              </label>
            ))
          ) : (
            <p className="text-gray-500 text-center text-xs">
              No farmers found.
            </p>
          )}
        </div>

        {/* ===== Buttons ===== */}
        <div className="flex justify-end gap-2 text-sm">
          <button
            onClick={() => setAttendanceSession(null)}
            className="px-3 py-1.5 border rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitAttendance}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>

  );
};
