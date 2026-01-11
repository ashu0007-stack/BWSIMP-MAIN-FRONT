import React, { FC } from "react";
import { FormValues } from "./StudyPlotForm";

interface StudyPlotFormProps {
  data: FormValues[];
  onAddNew: () => void;
}

export const StudyDetails: FC<StudyPlotFormProps> = ({ data, onAddNew }) => {
  const handleAddNew = () => {
    onAddNew();
    console.log(data);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Study Plot Details</h2>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow-md mt-4">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-200 text-gray-800">
            <tr>
              <th className="p-2 border">Study Plot ID</th>
              <th className="p-2 border">Host Farmer’s Name</th>
              <th className="p-2 border">Host Farmer Contact</th>
              <th className="p-2 border">Study Plot Size (ha)</th>
              <th className="p-2 border">Crop Practice Demonstrated</th>
              <th className="p-2 border">Inputs Details</th>
              <th className="p-2 border">Control Plot (Y/N)</th>
              <th className="p-2 border">Observations Recorded</th>
            
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="text-center border-b border-gray-300 py-4"
                >
                  <p className="text-blue-600">No data</p>
                </td>
              </tr>
            ) : (
              data.map((Study, index) => (
                <tr
                  key={index}
                  className="border-b text-sm hover:bg-gray-50"
                >
                  <td className="p-2 text-center border">{Study.StudyPlotID}</td>
                  <td className="p-2 text-center border">{Study.HostFarmerName}</td>
                  <td className="p-2 text-center border">{Study.HostFarmerContact}</td>
                  <td className="p-2 text-center border">{Study.StudyPlotSize}</td>
                  <td className="p-2 text-center border">{Study.CropPracticeDemonstrated}</td>
                  <td className="p-2 text-center border">{Study.InputsDetails}</td>
                  <td className="p-2 text-center border">{Study.ControlPlot}</td>
                  <td className="p-2 text-center border">{Study.ObservationsRecorded}</td>
                   
                      <button
                        onClick={handleAddNew}
                        className="px-2 py-1 bg-blue-700 text-white text-xs rounded hover:bg-blue-800 transition"
                      >
                        View
                      </button>
                      <button
                        onClick={handleAddNew}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                      >
                        Edit
                      </button>
                    
                 
             </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
