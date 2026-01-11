import React, { FC, useState } from "react";
import { UserCheck } from "lucide-react";
import { farmerData } from "../TrainingReports/trainingData";
import { Pagination } from "@/components/shared/Pagination";

const PAGE_SIZE = 20;

const FarmerTable: FC = () => {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(farmerData.length / PAGE_SIZE);

  const paginatedData = farmerData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="min-h-screen p-4 bg-white shadow-md rounded-xl mt-4 border border-gray-200">

      {/* 🔹 HEADER */}
      <div className="flex items-center justify-between  bg-green-700 rounded-lg px-5 py-4 mb-6 shadow">
        <h2 className="text-xl font-bold text-white tracking-wide">
          Farmers Details
        </h2>
      </div>

      {/* 🔹 TABLE CARD */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-3 my-6">

        {/* Section Title */}
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-200">
           <div className="w-1.5 h-8 bg-green-700 rounded-full"></div>
          <UserCheck className="w-5 h-5 text-green-700" />
          <h2 className="text-xl font-semibold text-green-700">
            Farmers List
          </h2>
        </div>

        {/* 🔹 TABLE */}
        <table className="w-full text-xs sm:text-sm md:text-[13px] text-gray-700 border-collapse">
          <thead className="bg-green-50 text-gray-700 sticky top-0 z-10">
            <tr>
              {[
                "S. No",
                "Training ID",
                "Name",
                "DBT No",
                "Father's Name",
                "Contact",
                "Gender",
                "Category",
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
                key={index}
                className={`border-b hover:bg-green-50 transition
                  ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
              >
                <td className="p-2 text-center font-medium">
                  {(page - 1) * PAGE_SIZE + index + 1}
                </td>
                <td className="p-2 text-center font-medium text-green-700">
                  {row.training_id}
                </td>
                <td className="p-2 text-center">{row.name}</td>
                <td className="p-2 text-center">{row.dbt_no}</td>
                <td className="p-2 text-center">
                  {row.fathers_name || "-"}
                </td>
                <td className="p-2 text-center">{row.contact}</td>
                <td className="p-2 text-center">{row.gender}</td>
                <td className="p-2 text-center">{row.category}</td>
              </tr>
            ))}

            {paginatedData.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="p-6 text-center text-gray-500"
                >
                  No farmers data available
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

export default FarmerTable;
