import React, { FC, useState, useMemo } from "react";
import { Pagination } from "@/components/shared/Pagination";
import { SquareChartGantt } from "lucide-react";

// Dummy Chip component (replace with your actual)
const Chip: FC<{ label: string }> = ({ label }) => (
  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{label}</div>
);

// Dummy LocationFilter component (replace with actual)
const LocationFilter: FC<any> = ({ levels, data, loading, onChange }) => (
  <div className="flex gap-2">
    {levels.map((l: string) => (
      <select
        key={l}
        className="border rounded-lg p-2 text-sm"
        onChange={(e) => onChange(l, e.target.value)}
      >
        <option value="">Select {l}</option>
      </select>
    ))}
  </div>
);

const PAGE_SIZE = 10;

const cropData = [
  {
    farmer: "Ramesh Kumar",
    father: "Shyam Lal",
    area: 2,
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
  // Add more farmer objects as needed
];

export const CropCostTable: FC = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<any>({});

  const totalPages = Math.ceil(cropData.length / PAGE_SIZE);
  const paginatedData = cropData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAddNew = () => {
    console.log("Add Demonstration clicked");
  };

  const handleLocationChange = (level: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [level]: value }));
  };

  // Filtered data
  // const filteredData = useMemo(() => {
  //   // return cropData.filter((d) => {
  //   //   if (filters.financialYear && d.financialYear !== filters.financialYear)
  //   //     return false;
  //   //   if (filters.season && d.season !== filters.season) return false;
  //   //   if (filters.crop && d.cropVariety !== filters.crop) return false;
  //   //   return true;
  //   // });
  // }, [filters]);

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      {/* Page Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-xl px-5 py-4 mb-6 shadow-lg">
        <h2 className="text-xl font-bold tracking-wide">CRA Demonstration Details</h2>
      </div>

      {/* Filters Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md mb-6">
        <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 bg-blue-900 rounded-full" />
            <SquareChartGantt className="w-5 h-5 text-blue-900" />
            <h2 className="text-lg font-semibold text-blue-900">Demonstration Filters</h2>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm shadow"
          >
            + Add Demonstration
          </button>
        </div>

        {/* Filter Body */}
        <div className="p-4 space-y-5">
          {/* Location Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Location</h3>
            <LocationFilter
              levels={["district", "block", "cluster", "village"]}
              data={{ district: [], block: [], cluster: [], village: [] }}
              loading={{ district: false, block: false, cluster: false, village: false }}
              onChange={handleLocationChange}
            />
          </div>

          {/* FY / Season / Crop */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Financial Year */}
            <div>
              <label className="text-sm font-medium text-gray-700">Financial Year</label>
              <select
                className="w-full border rounded-lg p-2 text-sm"
                value={filters.financialYear || ""}
                onChange={(e) => setFilters({ ...filters, financialYear: e.target.value, season: "", crop: "" })}
              >
                <option value="">Select FY</option>
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
              </select>
            </div>

            {/* Season */}
            <div>
              <label className="text-sm font-medium text-gray-700">Season</label>
              <select
                className="w-full border rounded-lg p-2 text-sm disabled:bg-gray-100"
                disabled={!filters.financialYear}
                value={filters.season || ""}
                onChange={(e) => setFilters({ ...filters, season: e.target.value, crop: "" })}
              >
                <option value="">Select Season</option>
                <option value="Kharif">Kharif</option>
                <option value="Rabi">Rabi</option>
                <option value="Zaid">Zaid</option>
              </select>
            </div>

            {/* Crop */}
            <div>
              <label className="text-sm font-medium text-gray-700">Crop</label>
              <select
                className="w-full border rounded-lg p-2 text-sm disabled:bg-gray-100"
                disabled={!filters.season}
                value={filters.crop || ""}
                onChange={(e) => setFilters({ ...filters, crop: e.target.value })}
              >
                <option value="">Select Crop</option>
                {filters.season === "Rabi" &&
                  ["Wheat", "Mustard", "Chickpea"].map((c) => <option key={c}>{c}</option>)}
                {filters.season === "Kharif" &&
                  ["Rice", "Maize"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Clear */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({})}
                className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Selected Filter Chips */}
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            {filters.district && <Chip label={`District: ${filters.district}`} />}
            {filters.block && <Chip label={`Block: ${filters.block}`} />}
            {filters.cluster && <Chip label={`Cluster: ${filters.cluster}`} />}
            {filters.village && <Chip label={`Village: ${filters.village}`} />}
            {filters.financialYear && <Chip label={`FY: ${filters.financialYear}`} />}
            {filters.season && <Chip label={`Season: ${filters.season}`} />}
            {filters.crop && <Chip label={`Crop: ${filters.crop}`} />}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-x-auto">
        <table className="min-w-[1200px] w-full text-xs text-gray-700 border-collapse">
          <thead className="bg-green-100 sticky top-0 z-10">
            <tr>
              <th rowSpan={2} className="border px-2 py-1">S.No.</th>
              <th rowSpan={2} className="border px-2 py-1">Name of Farmer</th>
              <th rowSpan={2} className="border px-2 py-1">Father &apos;s Name</th>
              <th rowSpan={2} className="border px-2 py-1">Area Covered (acre)</th>
              <th colSpan={6} className="border px-2 py-1">Cost of Cultivation - Input Cost (₹)</th>
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
                <td className="border px-2 py-1 text-center">{idx + 1 + (page-1)*PAGE_SIZE}</td>
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
