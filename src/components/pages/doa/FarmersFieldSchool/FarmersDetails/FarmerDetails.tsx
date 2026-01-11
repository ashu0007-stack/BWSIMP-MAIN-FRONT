import React, { FC, useState } from "react";
// import { FormValues } from "./FarmerProfileForm";
import { useFarmerDetails } from "@/hooks/doaHooks/useFarmerDetails";
import { useDistricts } from "@/hooks/location/useDistricts";
import { useBlocks } from "@/hooks/location/useBlocks";
import { useClusters } from "@/hooks/location/useClusters";
import { LocationFilter } from "@/components/shared/LocationFilter";

interface FSSDetailsProps {
  // data: FormValues[];
  onAddNew: () => void;
}

export const FarmersDetails: FC<FSSDetailsProps> = ({  onAddNew }) => {
  const [selected, setSelected] = useState<Record<string, number | undefined>>({});

  const { data: farmerDetail, isLoading: farmerDetailLoading } = useFarmerDetails();
  const { data: districtData, isPending: loadingDistricts } = useDistricts();
  const { data: blockData, isLoading: loadingBlocks } = useBlocks(selected.district);
  const { data: clusterData, isPending: loadingClusters } = useClusters(selected.block);

  const handleLocationChange = (values: any) => {
    setSelected(values);
  };

  return (
    <div className="max-w-[1366px] mx-auto py-4">
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
          👨‍🌾 Farmers’ Profile
        </h2>
        <button
          onClick={onAddNew}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 shadow transition-all"
        >
          + Add New
        </button>
      </div>

      {/* 🔹 Farmers Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-x-auto">
        <table className="w-full text-xs sm:text-sm md:text-[13px] text-gray-700 border-collapse">
          <thead className="bg-blue-50 text-gray-700 sticky top-0 z-10">
            <tr>
              {[
                "Farmer ID / DBT Reg No",
                "Farmer’s Name",
                "Father’s / Husband’s Name",
                "Gender",
                "Age",
                "Category",
                "Contact No.",
                "Address",
                "Village",
                "Land (ha)",
                "Irrigated (ha)",
                "WUA Member",
                "Major Crops",
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
            {farmerDetailLoading ? (
              <tr>
                <td colSpan={13} className="text-center py-4 text-blue-600 flex align-center">
                  Loading data...
                </td>
              </tr>
            ) : farmerDetail?.length ? (
              farmerDetail?.map((farmer: any, index: number) => (
                <tr
                  key={farmer.id}
                  className={`border-b hover:bg-blue-50 transition-all ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="p-2 text-center break-words">{farmer.ffsTitle}</td>
                  <td className="p-2 text-center break-words">{farmer.farmerName}</td>
                  <td className="p-2 text-center break-words">{farmer.fatherOrHusbandName}</td>
                  <td className="p-2 text-center break-words">{farmer.gender}</td>
                  <td className="p-2 text-center">{farmer.age}</td>
                  <td className="p-2 text-center">{farmer.category}</td>
                  <td className="p-2 text-center">{farmer.contactNumber}</td>
                  <td className="p-2 text-center break-words max-w-[100px]">{farmer.address}</td>
                  <td className="p-2 text-center break-words">{farmer.village}</td>
                  <td className="p-2 text-center">{farmer.landHoldingSize}</td>
                  <td className="p-2 text-center">{farmer.irrigatedArea}</td>
                  <td className="p-2 text-center">{farmer.memberOfWua ? "Yes" : "No"}</td>
                  <td className="p-2 text-center break-words max-w-[120px]">{farmer.majorCropsGrown}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={13} className="text-center py-4 text-gray-500">
                  No farmers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
