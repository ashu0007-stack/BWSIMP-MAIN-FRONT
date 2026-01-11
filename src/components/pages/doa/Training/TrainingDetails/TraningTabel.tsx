import React, { FC, useState } from "react";
import { Table } from "lucide-react";
import { trainingData } from "../TrainingReports/trainingData";
import { Pagination } from "@/components/shared/Pagination";

const TRAINING_PAGE_SIZE = 20;

const TrainingTable: FC<any> = ({setActiveTab, activeTab}) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(trainingData.length / TRAINING_PAGE_SIZE);

  const paginatedData = trainingData.slice(
    (page - 1) * TRAINING_PAGE_SIZE,
    page * TRAINING_PAGE_SIZE
  );

  return (
    <div className="min-h-screen p-4 bg-white shadow-md rounded-xl mt-4 border border-gray-200">

      {/* 🔹 HEADER */}
      <div className="flex items-center justify-between bg-blue-900 rounded-lg px-5 py-4 mb-6 shadow">
        <h2 className="text-xl font-bold text-white tracking-wide">
          Training Details
        </h2>
      </div>

      {/* 🔹 TABLE CARD */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-3 my-6">

        {/* Section Title */}
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-200">
          <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
          <Table className="w-5 h-5 text-blue-900" />
          <h2 className="text-xl font-semibold text-blue-900">
            Training List
          </h2>

          <button type="button"onClick={() => setActiveTab("trainingOfficialTable")}>Add from</button>
        </div>

        {/* 🔹 TABLE */}
        <table className="w-full text-xs sm:text-sm md:text-[13px] text-gray-700 border-collapse">
          <thead className="bg-blue-50 text-gray-700 sticky top-0 z-10">
            <tr>
              {[
                "S. No",
                "Training ID",
                "Type",
                "Topic",
                "Start Date",
                "End Date",
                "Venue",
                "Resource Person",
                "Designation",
                "Contact",
                "Remarks",
              ].map((header, idx) => (
                <th
                  key={idx}
                  className="px-2 py-2 border-b border-gray-300 text-center font-semibold"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((row: any, index: number) => (
              <tr
                key={row.training_id}
                className={`border-b hover:bg-blue-50 transition
                  ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
              >
                <td className="p-2 text-center font-medium">
                  {(page - 1) * TRAINING_PAGE_SIZE + index + 1}
                </td>
                <td className="p-2 text-center font-medium text-blue-700">
                  {row.training_id}
                </td>
                <td className="p-2 text-center">{row.type_of_training}</td>
                <td className="p-2 text-center break-words">
                  {row.topic_of_training}
                </td>
                <td className="p-2 text-center">{row.start_date}</td>
                <td className="p-2 text-center">{row.end_date}</td>
                <td className="p-2 text-center break-words">{row.venue}</td>
                <td className="p-2 text-center">
                  {row.resource_person_name}
                </td>
                <td className="p-2 text-center">
                  {row.resource_person_designation}
                </td>
                <td className="p-2 text-center">{row.contact_info}</td>
                <td className="p-2 text-center">
                  {row.remarks || "-"}
                </td>
              </tr>
            ))}

            {paginatedData.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="p-6 text-center text-gray-500"
                >
                  No training data available
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 🔹 PAGINATION */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default TrainingTable;
