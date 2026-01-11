import React, { FC, useState } from "react";
import { SessionForm } from "./SessionForm";
import { SessionTable } from "./SessionTable";
import { Attendance } from "../Attendance/Attendance"; // 👈 new component

export const Session: FC = () => {
  const [activeTab, setActiveTab] = useState<"session" | "attendance">("session");
  // const [sessionRecords, setSessionRecords] = useState<SessionFormValues[]>([]);
  const [showForm, setShowForm] = useState(false);

  // const handleAddSession = (data: SessionFormValues) => {
  //   // setSessionRecords((prev) => [...prev, data]);
  //   setShowForm(false);
  // };

  return (
    <div className="max-w-[1366px] mx-auto py-4">
      {/* 🔹 Tab Navigation */}
      <div className="flex gap-4 border-b mb-4">
        <button
          onClick={() => setActiveTab("session")}
          className={`pb-2 font-semibold ${
            activeTab === "session"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Session Details
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          className={`pb-2 font-semibold ${
            activeTab === "attendance"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Farmer Attendance
        </button>
      </div>

      {/* 🔹 Tab Content */}
      {activeTab === "session" ? (
        showForm ? (
          <SessionForm setShowForm={setShowForm}  />
        ) : (
          <SessionTable onAddNew={() => setShowForm(true)} />
        )
      ) : (
        <Attendance />
      )}
    </div>
  );
};
