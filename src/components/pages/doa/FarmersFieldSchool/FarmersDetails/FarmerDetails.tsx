import React, { FC, useState, useMemo, useEffect } from "react";
import { useFarmerDetails } from "@/hooks/doaHooks/useFarmerDetails";
import { useDistricts } from "@/hooks/location/useDistricts";
import { useBlocks } from "@/hooks/location/useBlocks";
import { useClusters } from "@/hooks/location/useClusters";
import { Download, SquareChartGantt, Table, User, Phone, MapPin, Home, Leaf, Users } from "lucide-react";
import { LocationFilter } from "@/components/shared/LocationFilter";
import { Pagination } from "@/components/shared/Pagination";

interface FSSDetailsProps {
  onAddNew: () => void;
}

export const FarmersDetails: FC<FSSDetailsProps> = ({ onAddNew }) => {
  const [selected, setSelected] = useState<Record<string, number | undefined>>({});
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: farmerDetail, isLoading: farmerDetailLoading } = useFarmerDetails();
  const { data: districtData, isPending: loadingDistricts } = useDistricts();
  const { data: blockData, isLoading: loadingBlocks } = useBlocks(selected.district);
  const { data: clusterData, isPending: loadingClusters } = useClusters(selected.block);

  const PAGE_SIZE = 10;

  // Filter farmers based on location and search term
  const filteredFarmers = useMemo(() => {
    if (!farmerDetail) return [];
    
    return farmerDetail.filter((farmer: any) => {
      const matchesSearch =
        searchTerm === "" ||
        farmer.farmerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.fatherOrHusbandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.contactNumber?.includes(searchTerm) ||
        farmer.dbtRegNo?.toLowerCase().includes(searchTerm.toLowerCase());

      // Add location filtering logic here if needed
      // Currently location filter is not integrated with farmer data
      
      return matchesSearch;
    });
  }, [farmerDetail, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredFarmers.length / PAGE_SIZE);
  const paginatedFarmers = filteredFarmers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [selected, searchTerm]);

  const handleLocationChange = (values: any) => {
    setSelected(values);
  };

  const handleClearFilters = () => {
    setSelected({});
    setSearchTerm("");
  };

  // Export CSV function
  const exportCSV = () => {
    const headers = [
      "Farmer ID",
      "DBT Reg No",
      "Farmer Name",
      "Father/Husband Name",
      "Gender",
      "Age",
      "Category",
      "Contact",
      "Address",
      "Village",
      "Land (ha)",
      "Irrigated (ha)",
      "WUA Member",
      "Major Crops"
    ];

    const rows = filteredFarmers.map((farmer: any) => [
      farmer.id || "-",
      farmer.dbtRegNo || "-",
      farmer.farmerName || "-",
      farmer.fatherOrHusbandName || "-",
      farmer.gender || "-",
      farmer.age || "-",
      farmer.category || "-",
      farmer.contactNumber || "-",
      farmer.address || "-",
      farmer.village || "-",
      farmer.landHoldingSize || "-",
      farmer.irrigatedArea || "-",
      farmer.memberOfWua ? "Yes" : "No",
      farmer.majorCropsGrown || "-"
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "farmers_report.csv";
    link.click();
  };

  // Category badge component
  const CategoryBadge = ({ category }: { category: string }) => {
    const getCategoryColor = (category: string) => {
      switch (category?.toLowerCase()) {
        case "small":
          return "bg-blue-100 text-blue-800";
        case "marginal":
          return "bg-green-100 text-green-800";
        case "landless":
          return "bg-yellow-100 text-yellow-800";
        case "sc/st":
          return "bg-purple-100 text-purple-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
        {category || "N/A"}
      </span>
    );
  };

  // Gender icon component
  const GenderIcon = ({ gender }: { gender: string }) => {
    if (gender?.toLowerCase() === "male") {
      return <span className="text-blue-600">♂</span>;
    } else if (gender?.toLowerCase() === "female") {
      return <span className="text-pink-600">♀</span>;
    }
    return <span className="text-gray-400">⚥</span>;
  };

  return (
    <div className="min-h-screen bg-white shadow-md rounded-xl border border-gray-200">
      {/* 🔹 HEADER */}
      <div className="flex items-center justify-between bg-blue-900 rounded-t-xl px-5 py-4 mb-6 shadow">
        <h2 className="text-xl font-bold text-white tracking-wide">
          Farmers' Profile Details
        </h2>
      </div>

      <div className="px-4 pb-6">
        {/* 🔍 MERGED FILTER PANEL */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md mb-6">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-7 bg-blue-900 rounded-full" />
              <SquareChartGantt className="w-5 h-5 text-blue-900" />
              <h2 className="text-lg font-semibold text-blue-900">
                Farmers Filters
              </h2>
            </div>

            <button
              onClick={onAddNew}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm shadow transition-all"
            >
              + Add New Farmer
            </button>
          </div>

          {/* Filter Body */}
          <div className="p-4 space-y-4">
            {/* Search and Location Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Search Farmers
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, father name, or contact..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-4">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Search by DBT Reg No
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter DBT Reg No..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Location Filters */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Location Filters
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

            {/* Active Filters Chips */}
            {(Object.keys(selected).length > 0 || searchTerm) && (
              <div className="flex flex-wrap gap-2 pt-3 border-t">
                {selected.district && (
                  <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    District: {districtData?.data?.find((d: any) => d.district_id === selected.district)?.district_name}
                  </span>
                )}
                {selected.block && (
                  <span className="bg-green-100 text-green-900 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Home className="w-3 h-3" />
                    Block: {blockData?.data?.find((b: any) => b.block_id === selected.block)?.block_name}
                  </span>
                )}
                {selected.cluster && (
                  <span className="bg-purple-100 text-purple-900 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Cluster: {clusterData?.data?.find((c: any) => c.cluster_id === selected.cluster)?.cluster_name}
                  </span>
                )}
                {searchTerm && (
                  <span className="bg-yellow-100 text-yellow-900 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Search: {searchTerm}
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="text-gray-600 hover:text-gray-900 text-xs font-medium ml-auto"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 📊 FARMERS TABLE */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md px-4 py-3">
          <div className="flex items-center justify-between mb-3 pb-2 border-b">
            <div className="flex items-center gap-3">
              <Table className="w-5 h-5 text-blue-900" />
              <h2 className="text-lg font-semibold text-blue-900">
                Farmers Details
              </h2>
            </div>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              <Download className="w-4 h-4" /> Download CSV
            </button>
          </div>

          {farmerDetailLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-3"></div>
              <p className="text-blue-600">Loading farmers data...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-gray-700 border-collapse">
                  <thead className="bg-green-100 sticky top-0 z-10">
                    <tr>
                      {[
                        "DBT Reg No",
                        "Farmer's Name",
                        "Father/Husband",
                        "Gender",
                        "Age",
                        "Category",
                        "Contact",
                        "Village",
                        "Land (ha)",
                        "Irrigated (ha)",
                        "WUA",
                        "Major Crops",
                        "FFS"
                      ].map((header, idx) => (
                        <th key={idx} className="border px-2 py-2 text-center">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedFarmers.length ? (
                      paginatedFarmers.map((farmer: any, index: number) => (
                        <tr key={farmer.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                          <td className="border p-2 text-center font-medium">
                            <div className="flex items-center justify-center gap-2">
                              <Phone className="w-3 h-3 text-blue-600" />
                              {farmer.dbtRegNo || "-"}
                            </div>
                          </td>
                          <td className="border p-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <User className="w-3 h-3 text-blue-600" />
                              <span className="font-medium">{farmer.farmerName}</span>
                            </div>
                          </td>
                          <td className="border p-2 text-center">
                            {farmer.fatherOrHusbandName}
                          </td>
                          <td className="border p-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <GenderIcon gender={farmer.gender} />
                              <span>{farmer.gender}</span>
                            </div>
                          </td>
                          <td className="border p-2 text-center">
                            <span className="font-medium">{farmer.age || "-"}</span>
                          </td>
                          <td className="border p-2 text-center">
                            <CategoryBadge category={farmer.category} />
                          </td>
                          <td className="border p-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Phone className="w-3 h-3 text-green-600" />
                              {farmer.contactNumber || "-"}
                            </div>
                          </td>
                          <td className="border p-2 text-center">
                            <div className="flex items-center justify-center gap-2 max-w-[120px] mx-auto">
                              <Home className="w-3 h-3 text-blue-600 flex-shrink-0" />
                              <span className="truncate" title={farmer.village}>
                                {farmer.village || "-"}
                              </span>
                            </div>
                          </td>
                          <td className="border p-2 text-center">
                            <span className="font-medium">{farmer.landHoldingSize || "0"}</span>
                          </td>
                          <td className="border p-2 text-center">
                            <span className="font-medium">{farmer.irrigatedArea || "0"}</span>
                          </td>
                          <td className="border p-2 text-center">
                            <div className="flex justify-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${farmer.memberOfWua ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {farmer.memberOfWua ? "Yes" : "No"}
                              </span>
                            </div>
                          </td>
                          <td className="border p-2 text-center">
                            <div className="flex items-center justify-center gap-2 max-w-[150px] mx-auto">
                              <Leaf className="w-3 h-3 text-green-600 flex-shrink-0" />
                              <span className="truncate" title={farmer.majorCropsGrown}>
                                {farmer.majorCropsGrown || "-"}
                              </span>
                            </div>
                          </td>
                          <td className="border p-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Users className="w-3 h-3 text-purple-600" />
                              <span className="truncate max-w-[100px]" title={farmer.ffsTitle}>
                                {farmer.ffsTitle || "-"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={13} className="text-center py-6 text-gray-500 text-sm">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <User className="w-8 h-8 text-gray-300" />
                            <p>No farmers found matching your criteria</p>
                            {Object.keys(selected).length > 0 && (
                              <button
                                onClick={handleClearFilters}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Clear filters to see all farmers
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};