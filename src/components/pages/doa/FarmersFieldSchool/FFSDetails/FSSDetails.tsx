import React, { FC, useState } from "react";
import { useFfsDetails } from "@/hooks/doaHooks/useFfsDetails";
import { useDistricts } from "@/hooks/location/useDistricts";
import { useBlocks } from "@/hooks/location/useBlocks";
import { useClusters } from "@/hooks/location/useClusters";
import { LocationFilter } from "@/components/shared/LocationFilter";



export const FSSDetails: FC<any> = ({ onAddNew }) => {
  const [selected, setSelected] = useState<Record<string, number | undefined>>({});

  // API hooks
  const { data: ffsDetail, isLoading: ffsDetailLoading, isError } = useFfsDetails();
  const { data: districtData, isPending: loadingDistricts } = useDistricts();
  const { data: blockData, isLoading: loadingBlocks } = useBlocks(selected.district);
  const { data: clusterData, isPending: loadingClusters } = useClusters(selected.block);

  const handleLocationChange = (values: any) => {
    setSelected(values);
  };

  const handleAddNew = () => onAddNew();

  if (ffsDetailLoading) return <p className="text-blue-600 text-center">Loading FFS details...</p>;
  if (isError) return <p className="text-red-500 text-center">Error fetching FFS details.</p>;

  return (
    <div className=" mx-auto py-4 px-3 sm:px-4">
      {/* 🔹 Location Filter Section */}
      <div className="mb-6 bg-white shadow-md rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm sm:text-base font-semibold mb-3 text-gray-700 border-b pb-2">
          🌍 Location Filters
        </h3>
        <LocationFilter
          levels={["district", "block", "cluster"]}
          data={{
            district:
              districtData?.data?.map((d: any) => ({
                id: d.district_id,
                name: d.district_name,
              })) || [],
            block:
              blockData?.data?.map((b: any) => ({
                id: b.block_id,
                name: b.block_name,
              })) || [],
            cluster:
              clusterData?.data?.map((c: any) => ({
                id: c.cluster_id,
                name: c.cluster_name,
              })) || [],
          }}
          loading={{
            district: loadingDistricts,
            block: loadingBlocks,
            cluster: loadingClusters,
          }}
          onChange={handleLocationChange}
        />
      </div>

      {/* 🔹 Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          🌾 Farmers Field School Details
        </h2>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 shadow transition-all"
        >
          + Add New
        </button>
      </div>

      {/* 🔹 FFS Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-x-auto">
        <table className="w-full text-xs sm:text-sm md:text-[13px] text-gray-700 border-collapse">
          <thead className="bg-blue-50 text-gray-700 sticky top-0 z-10">
            <tr>
              {[
                "FFS Title",
                "Crop Theme",
                "Facilitator",
                "Contact",
                "Season / Year",
                "Start Date",
                "End Date",
                "Village",
                "Sessions Planned",
                "Sessions Conducted",
                "Farmers Enrolled",
              ].map((header, idx) => (
                <th
                  key={idx}
                  className="px-2 py-2 border-b border-gray-300 text-center font-semibold break-words whitespace-normal"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ffsDetail?.length ? (
              ffsDetail.map((ffs: any, index: number) => (
                <tr
                  key={ffs.id}
                  className={`border-b hover:bg-blue-50 transition-all ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                >
                  <td className="p-2 text-center break-words">{ffs.ffsTitle}</td>
                  <td className="p-2 text-center break-words">{ffs.cropTheme}</td>
                  <td className="p-2 text-center break-words">{ffs.nameOfFacilitator}</td>
                  <td className="p-2 text-center">{ffs.facilitatorContact}</td>
                  <td className="p-2 text-center">{ffs.seasonYear}</td>
                  <td className="p-2 text-center">{ffs.startDate}</td>
                  <td className="p-2 text-center">{ffs.endDate}</td>
                  <td className="p-2 text-center break-words">{ffs.village}</td>
                  <td className="p-2 text-center">{ffs.sessionsPlanned}</td>
                  <td className="p-2 text-center">{ffs.sessionsConducted}</td>
                  <td className="p-2 text-center">{ffs.farmersEnrolled}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="text-center py-4 text-gray-500">
                  No FFS records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
