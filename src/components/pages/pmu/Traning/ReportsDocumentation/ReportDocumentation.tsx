import React from "react";
import { Table } from "lucide-react";
/* import { } from "@/hooks/programesTraining/useProgrammeOrganizing"; */

interface Props {
  openPostTrainingTab:  (id: number) => void;
}

export const ReportDocumnetationTable: React.FC<Props> = ({ openPostTrainingTab }) => {
/*   const { data: programeOrganizingdata, isLoading:isProgrameOrganizingLoading } = useProgrammeOrganizing();

  const handlePostTraining = (id: any) => {
    openPostTrainingTab(id)
  } */


  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-3 my-6">
      {/* 🔵 Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-blue-900 rounded-lg px-5 py-4 mb-6 shadow">
        <h2 className="text-xl font-bold text-white tracking-wide">
          Report Documentation  Details
        </h2>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between w-full gap-2 mb-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
          <Table className="w-5 h-5 text-blue-900" />
          <h2 className="text-xl font-semibold text-blue-900">
             Report Documentation Details Table
          </h2>
        </div>
      </div>

      <table className="min-w-full text-sm bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-100">
          <tr className="text-gray-700 text-sm">
            <th className="px-4 py-2 border">Financial Year</th>
            <th className="px-4 py-2 border">Level</th>
            <th className="px-4 py-2 border">Programme Type</th>
            <th className="px-4 py-2 border">Sub Programme</th>
            <th className="px-4 py-2 border">Department</th>
            <th className="px-4 py-2 border">Geo Photos</th>
            <th className="px-4 py-2 border">Reports PDF</th>
            <th className="px-4 py-2 border">Feedback PDF</th>
            <th className="px-4 py-2 border">Bills PDF</th>
            <th className="px-4 py-2 border">Remarks</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
             <tr className="hover:bg-gray-50 transition border-t">
                <td className="px-4 py-2 border"></td>
                <td className="px-4 py-2 border"></td>
                <td className="px-4 py-2 border"></td>
                <td className="px-4 py-2 border"></td>
                <td className="px-4 py-2 border"></td>
                <td className="px-4 py-2 border"></td>
                <td className="px-4 py-2 border"></td>
                <td className="px-4 py-2 border"></td>
                <td className="px-4 py-2 border"></td>
                <td className="px-4 py-2 border"></td>


                <td className="px-4 py-2 border text-center">
                  <div className="flex justify-center gap-2 flex-nowrap">

                    <button
                    //   onClick={ () => ReportsDocumentation(rd.id)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-xs shadow transition"
                    >
                      Post-Training
                    </button>

                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-xs shadow transition">
                      View
                    </button>

                    <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-md text-xs shadow transition">
                      Edit
                    </button>

                    <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs shadow transition">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
        </tbody>
{/* 
        <tbody>
          {isProgrameOrganizingLoading ? (
            <tr>
              <td
                colSpan={12}
                className="py-4 text-center text-gray-500 italic"
              >
                No data added yet.
              </td>
            </tr>
          ) : (
            // programeOrganizingdata?.data?.map((po: any) => (
              <tr className="hover:bg-gray-50 transition border-t">
                <td className="px-4 py-2 border"></td>
                <td className="px-4 py-2 border"></td>
                <td className="px-4 py-2 border"></td>
                <td className="px-4 py-2 border"></td>
                <td className="px-4 py-2 border"></td>
                <td className="px-4 py-2 border"></td>
                <td className="px-4 py-2 border"></td>
                <td className="px-4 py-2 border"></td>
                <td className="px-4 py-2 border"></td>
                <td className="px-4 py-2 border"></td>


                <td className="px-4 py-2 border text-center">
                  <div className="flex justify-center gap-2 flex-nowrap">

                    <button
                    //   onClick={ () => ReportsDocumentation(rd.id)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-xs shadow transition"
                    >
                      Post-Training
                    </button>

                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-xs shadow transition">
                      View
                    </button>

                    <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-md text-xs shadow transition">
                      Edit
                    </button>

                    <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs shadow transition">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody> */}
      </table>
    </div>
  );
};
