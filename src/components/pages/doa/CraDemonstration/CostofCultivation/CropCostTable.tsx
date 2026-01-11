import React, { FC, useState, useMemo, useEffect } from "react";
import { Pagination } from "@/components/shared/Pagination";
import { SquareChartGantt } from "lucide-react";
import { LocationFormSelect } from "@/components/shared/Location/locationSelction";
import { useDistricts } from "@/hooks/location/useDistricts";
import { useBlocks } from "@/hooks/location/useBlocks";
import { useClusters } from "@/hooks/location/useClusters";
import { useVillages } from "@/hooks/location/useVillages";

/* ---------------- Chip ---------------- */
const Chip: FC<{ label: string }> = ({ label }) => (
  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
    {label}
  </span>
);

const PAGE_SIZE = 10;

/* ---------------- Dummy Crop Data ---------------- */
const cropData = [
  {
    farmer: "Ramesh Kumar",
    father: "Shyam Lal",
    area: 2,
    financialYear: "2024-25",
    season: "Rabi",
    cropVariety: "Wheat",
    inputCost: {
      seed: 500,
      fertilizer: 1200,
      irrigation: 300,
      weedicide: 200,
      pesticide: 150,
      other: 100,
    },
    operationalCost: {
      fieldPrep: 400,
      nursery: 0,
      sowing: 150,
      manureApplication: 300,
      irrigation: 200,
      pesticideApp: 150,
      harvesting: 500,
      other: 50,
    },
    totalIncome: {
      grainYield: 5,
      sellingPrice: 2000,
      byProduct: 500,
      total: 10500,
    },
    totalCost: 4950,
    netProfit: 5550,
  },
];

/* ---------------- Types ---------------- */
type Filters = {
  districtId?: number;
  blockId?: number;
  clusterId?: number;
  villageId?: number;
  financialYear?: string;
  season?: string;
  crop?: string;
};

export const CropCostTable: FC<any> = ({ onAddNew}) => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({});

  /* ---------------- Selected IDs ---------------- */
  const selectedDistrict = filters.districtId;
  const selectedBlock = filters.blockId;
  const selectedCluster = filters.clusterId;

  /* ---------------- API Hooks ---------------- */
  const { data: districtData = [], isPending: loadingDistricts } = useDistricts();
  const { data: blockData = [], isLoading: loadingBlocks } = useBlocks(selectedDistrict);
  const { data: clusterData = [], isPending: loadingClusters } = useClusters(selectedBlock);
  const { data: villageData = [], isPending: loadingVillages } = useVillages(selectedCluster);

  
    console.log("typeof window:", typeof window);

  /* ---------------- Location Data ---------------- */
  const locationData = useMemo(() => ({
    district: (districtData?.data ?? []).map((d: any) => ({
      id: d.district_id,
      name: d.district_name,
    })),
    block: (blockData ?? []).map((b: any) => ({
      id: b.block_id,
      name: b.block_name,
      parentId: b.district_id,
    })),
    cluster: (clusterData?.data ?? []).map((c: any) => ({
      id: c.cluster_code,
      name: c.cluster_name,
      parentId: c.block_id,
    })),
    village: (villageData?.data ?? []).map((v: any) => ({
      id: v.village_id,
      name: v.village_name,
      parentId: v.cluster_code,
    })),
  }), [districtData, blockData, clusterData, villageData]);

  const locationLoading = {
    district: loadingDistricts,
    block: loadingBlocks,
    cluster: loadingClusters,
    village: loadingVillages,
  };

  /* ---------------- Lookup Maps (ID → Name) ---------------- */
  const districtMap = useMemo(
    () => Object.fromEntries(locationData.district.map((d: any) => [d.id, d.name])),
    [locationData.district]
  );
  const blockMap = useMemo(
    () => Object.fromEntries(locationData.block.map((b: any) => [b.id, b.name])),
    [locationData.block]
  );
  const clusterMap = useMemo(
    () => Object.fromEntries(locationData.cluster.map((c: any) => [c.id, c.name])),
    [locationData.cluster]
  );
  const villageMap = useMemo(
    () => Object.fromEntries(locationData.village.map((v: any) => [v.id, v.name])),
    [locationData.village]
  );

  /* ---------------- Location Change Handler ---------------- */
  const handleLocationChange = (level: string, value?: number | string) => {
    setFilters(prev => {
      const updated: Filters = {
        ...prev,
        [`${level}Id`]: value ? Number(value) : undefined,
      };

      if (level === "district") {
        delete updated.blockId;
        delete updated.clusterId;
        delete updated.villageId;
      }
      if (level === "block") {
        delete updated.clusterId;
        delete updated.villageId;
      }
      if (level === "cluster") {
        delete updated.villageId;
      }

      return updated;
    });
  };

  /* ---------------- Filter Data ---------------- */
  const filteredData = useMemo(() => {
    return cropData.filter(d => {
      if (filters.financialYear && d.financialYear !== filters.financialYear) return false;
      if (filters.season && d.season !== filters.season) return false;
      if (filters.crop && d.cropVariety !== filters.crop) return false;
      return true;
    });
  }, [filters]);

    const handleAddNew = () => {
      console.log("click on button")
    onAddNew?.(filters);
  };

  /* ---------------- Pagination ---------------- */
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      {/* Header */}
      
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-xl px-5 py-4 mb-6 shadow-lg">
        <h2 className="text-xl font-bold">Cost of Cultivation Details</h2>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 space-y-5 mb-6 shadow">
        {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-7 bg-blue-900 rounded-full" />
                    <SquareChartGantt className="w-5 h-5 text-blue-900" />
                    <h2 className="text-lg font-semibold text-blue-900">
                      Cost of Cultivation Filters
                    </h2>
                  </div>
        
                  <button
                    onClick={handleAddNew}
                    // disabled={!filters.crop}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm shadow"
                  >
                    + Add Cost of Cultivation
                  </button>
                </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Location
          </h3>
          <LocationFormSelect
            levels={["district", "block", "cluster", "village"]}
            data={locationData}
            value={filters}
            onChange={handleLocationChange}
            //loading={locationLoading}
          />
        </div>
        
        {/* FY / Season / Crop */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <select
            className="border rounded-lg p-2"
            value={filters.financialYear || ""}
            onChange={(e) =>
              setFilters({ ...filters, financialYear: e.target.value, season: "", crop: "" })
            }
          >
            <option value="">Select FY</option>
            <option value="2024-25">2024-25</option>
            <option value="2025-26">2025-26</option>
          </select>

          <select
            className="border rounded-lg p-2"
            disabled={!filters.financialYear}
            value={filters.season || ""}
            onChange={(e) =>
              setFilters({ ...filters, season: e.target.value, crop: "" })
            }
          >
            <option value="">Select Season</option>
            <option value="Rabi">Rabi</option>
            <option value="Kharif">Kharif</option>
          </select>

          <select
            className="border rounded-lg p-2"
            disabled={!filters.season}
            value={filters.crop || ""}
            onChange={(e) => setFilters({ ...filters, crop: e.target.value })}
          >
            <option value="">Select Crop</option>
            {filters.season === "Rabi" && ["Wheat", "Mustard"].map(c => (
              <option key={c}>{c}</option>
            ))}
            {filters.season === "Kharif" && ["Rice", "Maize"].map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={() => setFilters({})}
            className="border rounded-lg hover:bg-gray-100"
          >
            Clear
          </button>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2 pt-3 border-t">
          {filters.districtId && <Chip label={`District: ${districtMap[filters.districtId]}`} />}
          {filters.blockId && <Chip label={`Block: ${blockMap[filters.blockId]}`} />}
          {filters.clusterId && <Chip label={`Cluster: ${clusterMap[filters.clusterId]}`} />}
          {filters.villageId && <Chip label={`Village: ${villageMap[filters.villageId]}`} />}
          {filters.financialYear && <Chip label={`FY: ${filters.financialYear}`} />}
          {filters.season && <Chip label={`Season: ${filters.season}`} />}
          {filters.crop && <Chip label={`Crop: ${filters.crop}`} />}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-x-auto">
        <table className="min-w-[1200px] w-full text-xs text-gray-700 border-collapse">
          <thead className="bg-green-100 sticky top-0 z-10">
            <tr>
              <th rowSpan={2} className="border px-2 py-1">Name of Farmer</th>
              <th rowSpan={2} className="border px-2 py-1">{"Father's Name"}</th>
              <th rowSpan={2} className="border px-2 py-1">Area Covered (acre)</th>
              <th colSpan={6} className="border px-2 py-1">Input Cost (₹)</th>
              <th colSpan={8} className="border px-2 py-1">Operational Cost (₹)</th>
              <th colSpan={4} className="border px-2 py-1">Total Income (₹)</th>
              <th rowSpan={2} className="border px-2 py-1">Total Cost of Cultivation (₹)</th>
              <th rowSpan={2} className="border px-2 py-1">Net Profit (₹)</th>
            </tr>
            <tr>
              {/* Input Cost */}
              <th className="border px-2 py-1">Seed</th>
              <th className="border px-2 py-1">Fertilizer</th>
              <th className="border px-2 py-1">Irrigation</th>
              <th className="border px-2 py-1">Weedicide</th>
              <th className="border px-2 py-1">Pesticide</th>
              <th className="border px-2 py-1">Other</th>

              {/* Operational Cost */}
              <th className="border px-2 py-1">Field Prep</th>
              <th className="border px-2 py-1">Nursery</th>
              <th className="border px-2 py-1">Sowing</th>
              <th className="border px-2 py-1">Manure/Fert App</th>
              <th className="border px-2 py-1">Irrigation</th>
              <th className="border px-2 py-1">Pesticides App</th>
              <th className="border px-2 py-1">Harvesting</th>
              <th className="border px-2 py-1">Other</th>

              {/* Total Income */}
              <th className="border px-2 py-1">Grain Yield (q)</th>
              <th className="border px-2 py-1">Selling Price (₹/q)</th>
              <th className="border px-2 py-1">By Product (₹)</th>
              <th className="border px-2 py-1">Total</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={idx}
                className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} border-b hover:bg-gray-100 transition`}
              >
                <td className="border px-2 py-1">{row.farmer}</td>
                <td className="border px-2 py-1">{row.father}</td>
                <td className="border px-2 py-1 text-center">{row.area}</td>

                {/* Input Cost */}
                <td className="border px-2 py-1 text-right">{row.inputCost.seed}</td>
                <td className="border px-2 py-1 text-right">{row.inputCost.fertilizer}</td>
                <td className="border px-2 py-1 text-right">{row.inputCost.irrigation}</td>
                <td className="border px-2 py-1 text-right">{row.inputCost.weedicide}</td>
                <td className="border px-2 py-1 text-right">{row.inputCost.pesticide}</td>
                <td className="border px-2 py-1 text-right">{row.inputCost.other}</td>

                {/* Operational Cost */}
                <td className="border px-2 py-1 text-right">{row.operationalCost.fieldPrep}</td>
                <td className="border px-2 py-1 text-right">{row.operationalCost.nursery}</td>
                <td className="border px-2 py-1 text-right">{row.operationalCost.sowing}</td>
                <td className="border px-2 py-1 text-right">{row.operationalCost.manureApplication}</td>
                <td className="border px-2 py-1 text-right">{row.operationalCost.irrigation}</td>
                <td className="border px-2 py-1 text-right">{row.operationalCost.pesticideApp}</td>
                <td className="border px-2 py-1 text-right">{row.operationalCost.harvesting}</td>
                <td className="border px-2 py-1 text-right">{row.operationalCost.other}</td>

                {/* Total Income */}
                <td className="border px-2 py-1 text-right">{row.totalIncome.grainYield}</td>
                <td className="border px-2 py-1 text-right">{row.totalIncome.sellingPrice}</td>
                <td className="border px-2 py-1 text-right">{row.totalIncome.byProduct}</td>
                <td className="border px-2 py-1 text-right">{row.totalIncome.total}</td>

                <td className="border px-2 py-1 text-right">{row.totalCost}</td>
                <td className="border px-2 py-1 text-right">{row.netProfit}</td>
              </tr>
            ))}

            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={25} className="text-center p-4 text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};
