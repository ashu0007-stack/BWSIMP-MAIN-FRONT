import React, { FC } from "react";
import { TrainingFormValues } from "./Traningform";

interface TrainingTableProps {
  data: TrainingFormValues[];
  onAddNew: () => void;
}

export const TrainingTable: FC<TrainingTableProps> = ({ data, onAddNew }) => {
  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">Training Details</h2>
        <button
          onClick={onAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Add New
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto bg-white rounded shadow-md">
        <table className="min-w-[1500px] text-sm border-collapse border border-gray-300">
          <thead className="bg-gray-100 text-gray-800">
            {/* First Header Row */}
            <tr>
              <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center">S. No.</th>
              <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center">Training ID / Batch</th>
              <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center">Type of Training</th>
              <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center">Topic of Training</th>
              <th colSpan={2} className="border border-gray-300 px-3 py-2 text-center">Duration</th>
              <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center">Venue / Location with GPS</th>
              <th colSpan={3} className="border border-gray-300 px-3 py-2 text-center">Resource Person Details</th>
              <th colSpan={2} className="border border-gray-300 px-3 py-2 text-center">Target Groups</th>
              <th colSpan={2} className="border border-gray-300 px-3 py-2 text-center">Total farmer</th>
              {/* <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center">Name of Participants</th>
              <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center">Father’s Name</th>
              <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center">Gender</th> */}
              <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center">Contact Information</th>
              <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center">DBT Reg. No. (If Farmer)</th>
              <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center">
                Category (Gen/ OBC/ SC/ ST/ Youth)
              </th>
              <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center">Remarks</th>
              <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center">Action</th>
            </tr>

            {/* Second Header Row */}
            <tr>
              <th className="border border-gray-300 px-3 py-2 text-center">Start Date</th>
              <th className="border border-gray-300 px-3 py-2 text-center">End Date</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Trainer’s Name</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Designation / Affiliation</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Contact Information</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Officials</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Farmers</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {data && data.length > 0 ? (
              data.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border px-3 py-2 text-center">{index + 1}</td>
                  {/* <td className="border px-3 py-2 text-center">{record.trainingId}</td> */}
                  {/* <td className="border px-3 py-2">{record.typeOfTraining}</td> */}
                  <td className="border px-3 py-2">{record.topicOfTraining}</td>
                  <td className="border px-3 py-2 text-center">{new Date(record.startDate).toLocaleDateString()}</td>
                  <td className="border px-3 py-2 text-center">{new Date(record.endDate).toLocaleDateString()}</td>
                  <td className="border px-3 py-2">{record.venueLocation} ({record.gpsLocation})</td>
                  <td className="border px-3 py-2">{record.trainerName}</td>
                  <td className="border px-3 py-2">{record.trainerDesignation}</td>
                  <td className="border px-3 py-2">{record.trainerContact}</td>
                  <td className="border px-3 py-2 text-center">{record.targetGroup === "Officials" ? "✔" : ""}</td>
                  <td className="border px-3 py-2 text-center">{record.targetGroup === "Farmers" ? "✔" : ""}</td>
                  <td className="border px-3 py-2">{record.noOfFarmer}</td>
                  {/* <td className="border px-3 py-2">{record.nameOfParticipant}</td>
                  {/* <td className="border px-3 py-2">{record.nameOfParticipant}</td>
                  <td className="border px-3 py-2">{record.fatherName}</td>
                  <td className="border px-3 py-2 text-center">{record.gender}</td> */}
                  <td className="border px-3 py-2">{record.contactInfo}</td>
                  <td className="border px-3 py-2">{record.dbtRegNo}</td>
                  <td className="border px-3 py-2">{record.category}</td>
                  <td className="border px-3 py-2">{record.remarks}</td>
                  <td className="border px-3 py-2 text-center">
                    <div className="flex gap-1 justify-center">
                      <button className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">View</button>
                      <button className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">Edit</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={21} className="text-center py-6 text-gray-500 border">No training records found.</td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};
