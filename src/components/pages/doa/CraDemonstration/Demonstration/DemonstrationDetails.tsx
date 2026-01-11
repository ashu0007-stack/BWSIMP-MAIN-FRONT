import React, { FC, useEffect, useMemo, useState } from "react";
import { Download, SquareChartGantt, Table } from "lucide-react";
import { LocationFormSelect } from "@/components/shared/Location/locationSelction";
import { useDistricts } from "@/hooks/location/useDistricts";
import { useBlocks } from "@/hooks/location/useBlocks";
import { useClusters } from "@/hooks/location/useClusters";
import { useVillages } from "@/hooks/location/useVillages";
import { Pagination } from "@/components/shared/Pagination";



const PAGE_SIZE = 10;

/* Dummy Table Data */
const demoList = [
  {
    id: 1,

    // 🔹 LOCATION IDS (USED FOR FILTERING)
    districtId: 1,   // Madhubani = 1, Patna = 2 (example)
    blockId: 11,
    clusterId: 101,
    villageId: 1001,

    // ===== LOCATION (TOP OF EXCEL) =====
    district: "Patna",
    block: "Bihta",
    clusterNo: "CL-01",
    gramPanchayat: "Rampur GP",
    village: "Rampur",

    season: "Rabi",
    cropName: "Wheat",

    // ===== FARMER =====
    farmerName: "Ramesh Kumar",
    fatherName: "Suresh Kumar",
    contact: "9876543210",
    gender: "Male",
    farmerPhoto: "uploaded.jpg",
    dbtRegNo: "DBT102233",

    // ===== DEMONSTRATION =====
    financialYear: "2025-26",
    commandArea: "1.2",
    cropVariety: "Wheat - HD 2967",

    seedRate: "50",
    sowingDate: "2024-11-20",
    cropPracticeDemo: "Seed and Sowing",

    fertilizers: [
      { name: "Urea", qty: "45 kg" },
      { name: "DAP", qty: "30 kg" },
    ],

    weedicides: [
      { name: "2,4-D", qty: "500 ml" },
    ],

    pesticides: [
      {
        name: "Chlorpyrifos",
        qty: "300 ml",
        bioName: "Neem Oil",
        bioQty: "250 ml",
      },
    ],

    irrigation: "canal",

    harvestingDate: "2025-03-15",
    cropYield: "45",

    gpsLocation: "25.6123, 85.1429",

    wuaMember: "Yes",
    wuaName: "Bihta WUA",

    comments: "Good crop condition",
  },
];


type Filters = {
  districtId?: number;
  blockId?: number;
  clusterId?: number;
  villageId?: number;
  financialYear?: string;
  season?: string;
  crop?: string;
};

export const DemonstrationDetails: FC<any> = ({ onAddNew, setActiveTab, setSelectedDemoId }) => {
  const [selectedRow, setSelectedRow] = useState<any>(null);



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

  /* ---------------- Location Data ---------------- */
  const locationData = useMemo(() => ({
    district: (districtData?.data ?? []).map((d: any) => ({
      id: d.district_id,
      name: d.district_name,
    })),
    block: (blockData ?? []).map((b: any) => ({
      id: Number(b.block_id),
      name: b.block_name,
      parentId: Number(b.districtId), // ✅ FIXED
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
    return demoList.filter(d => {
      if (filters.financialYear && d.financialYear !== filters.financialYear) return false;
      if (filters.season && d.season !== filters.season) return false;
      if (filters.crop && d.cropVariety !== filters.crop) return false;
      return true;
    });
  }, [filters]);

  /* ---------------- Pagination ---------------- */
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [filters]);
  /* Add New */
  const handleAddNew = () => {
    onAddNew?.(filters);
  };

  /* CSV Export */
  const exportCSV = () => {
    const headers = [
      "FY",
      "Season",
      "Command Area",
      "Crop",
      "Sowing Date",
      "Harvest Date",
      "Yield",
      "WUA",
    ];

    const rows = demoList.map((d) => [
      d.financialYear,
      d.season,
      d.commandArea,
      d.cropVariety,
      d.sowingDate,
      d.harvestingDate,
      d.cropYield,
      // d.wuaName,
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "demonstration_report.csv";
    link.click();
  };

  const handleCostofCultivation = (demoId: number) => {
    setSelectedDemoId(demoId);            // ✅ store ID
    setActiveTab("costofCultivation");    // ✅ switch screen
  };

  return (

    <div className="min-h-screen p-4 bg-white shadow-md rounded-xl  border border-gray-200">
      {/* 🔹 HEADER */}
      <div className="flex items-center justify-between bg-blue-900 rounded-lg px-5 py-4 mb-6 shadow">
        <h2 className="text-xl font-bold text-white tracking-wide">
          CRA Demonstration  Details
        </h2>
      </div>

      {/* 🔍 MERGED FILTER PANEL */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 bg-blue-900 rounded-full" />
            <SquareChartGantt className="w-5 h-5 text-blue-900" />
            <h2 className="text-lg font-semibold text-blue-900">
              Demonstration Filters
            </h2>
          </div>

          <button
            onClick={handleAddNew}
            // disabled={!filters.crop}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm shadow"
          >
            + Add Demonstration
          </button>
        </div>

        {/* Filter Body */}
        <div className="p-4 space-y-5">

          {/* Location Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Location
            </h3>
            <LocationFormSelect
              levels={["district", "block", "cluster", "village"]}
              data={locationData}
              value={filters}
              onChange={handleLocationChange}
              // loading={locationLoading}
            />

          </div>

          {/* FY / Season / Crop */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Financial Year */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Financial Year <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border rounded-lg p-2"
                value={filters.financialYear || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    financialYear: e.target.value,
                    season: "",
                    crop: "",
                  })
                }
              >
                <option value="">Select FY</option>
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
              </select>
            </div>

            {/* Season */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Season <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border rounded-lg p-2 disabled:bg-gray-100"
                disabled={!filters.financialYear}
                value={filters.season || ""}
                onChange={(e) =>
                  setFilters({ ...filters, season: e.target.value, crop: "" })
                }
              >
                <option value="">Select Season</option>
                <option className="text-sm italic" value="Kharif">Kharif</option>
                <option className="text-sm italic" value="Rabi">Rabi</option>
                <option className="text-sm italic" value="Zaid">Zaid</option>
              </select>
            </div>

            {/* Crop */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Crop <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border rounded-lg p-2 disabled:bg-gray-100"
                disabled={!filters.season}
                value={filters.crop || ""}
                onChange={(e) =>
                  setFilters({ ...filters, crop: e.target.value })
                }
              >
                <option value="">Select Crop</option>
                {filters.season === "Rabi" &&
                  ["Wheat", "Mustard", "Chickpea"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                {filters.season === "Kharif" &&
                  ["Rice", "Maize"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
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
      </div>

      {/* 📊 DEMONSTRATION TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md px-4 py-3">
        <div className="flex items-center justify-between mb-3 pb-2 border-b">
          <div className="flex items-center gap-3">
            <Table className="w-5 h-5 text-blue-900" />
            <h2 className="text-lg font-semibold text-blue-900">
              Demonstration Details
            </h2>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            <Download className="w-4 h-4" /> Download CSV
          </button>
        </div>

        <table className="min-w-[1200px] w-full text-xs text-gray-700 border-collapse">
          <thead className="bg-green-100 sticky top-0 z-10">
            <tr>
              <th className="border px-2 py-1">FY</th>
              <th className="border px-2 py-1">Season</th>
              <th className="border px-2 py-1">DBT Reg. No.</th>
              <th className="border px-2 py-1">{"Farmer's Name"}</th>
              <th className="border px-2 py-1">{"Father's Name"}</th>
              <th className="border px-2 py-1">Gender</th>
              <th className="border px-2 py-1">Command Area (acre)</th>
              <th className="border px-2 py-1">Crop / Variety</th>
              <th className="border px-2 py-1">Sowing Date</th>
              <th className="border px-2 py-1">Crop Practice Demonstration</th>
              {/* <th className="border px-2 py-1">Harvest Date</th>
              <th className="border px-2 py-1">Crop Yield (q/acre)</th> */}
              <th className="border px-2 py-1">Source of Irrigation</th>
              <th className="border px-2 py-1">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((d) => (
              <tr key={d.id} className="even:bg-gray-50">
                <td className="border p-2 text-center">{d.financialYear}</td>
                <td className="border p-2 text-center">{d.season}</td>
                <td className="border p-2 text-center">{d.dbtRegNo}</td>
                <td className="border p-2 text-center">{d.farmerName}</td>
                <td className="border p-2 text-center">{d.fatherName}</td>
                <td className="border p-2 text-center">{d.gender}</td>
                <td className="border p-2 text-center">{d.commandArea}</td>
                <td className="border p-2 text-center">{d.cropVariety}</td>
                <td className="border p-2 text-center">{d.sowingDate}</td>
                <td className="border p-2 text-center">{d.cropPracticeDemo}</td>
                {/* <td className="border p-2 text-center">{d.harvestingDate}</td>
                <td className="border p-2 text-center">{d.cropYield}</td> */}
                <td className="border p-2 text-center">{d.irrigation}</td>
                <td className="p-2 text-center flex justify-center gap-2">
                  <button
                    onClick={() => setSelectedRow(d)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg shadow"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleCostofCultivation(d.id)}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg shadow"
                  >
                    Cost of Cultivation
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

      </div>
      {selectedRow && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[90%] max-w-4xl rounded-xl shadow-lg p-6 relative">

            <button
              onClick={() => setSelectedRow(null)}
              className="absolute top-3 right-4 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              Demonstration Details
            </h2>

            <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4 text-sm">

              {/* ================= LOCATION ================= */}
              <div>
                <SectionTitle title="Location Details" />
                <div className="grid grid-cols-5 gap-4">
                  <Detail label="District" value={selectedRow.district} />
                  <Detail label="Block" value={selectedRow.block} />
                  <Detail label="Cluster No" value={selectedRow.clusterNo} />
                  <Detail label="Gram Panchayat" value={selectedRow.gramPanchayat} />
                  <Detail label="Village" value={selectedRow.village} />
                </div>
              </div>

              {/* ================= FARMER ================= */}
              <div>
                <SectionTitle title="Farmer Details" />
                <div className="grid grid-cols-5 gap-4">
                  <Detail label="DBT Reg. No." value={selectedRow.dbtRegNo} />
                  <Detail label="Farmer Name" value={selectedRow.farmerName} />
                  <Detail label="Father's Name" value={selectedRow.fatherName} />
                  <Detail label="Contact No." value={selectedRow.contact} />
                  <Detail label="Gender" value={selectedRow.gender} />
                </div>
              </div>

              {/* ================= SEASON & CROP ================= */}
              <div>
                <SectionTitle title="Season & Crop" />
                <div className="grid grid-cols-5 gap-4">
                  <Detail label="Financial Year" value={selectedRow.financialYear} />
                  <Detail label="Season" value={selectedRow.season} />
                  <Detail label="Crop Name" value={selectedRow.cropName} />
                  <Detail label="Crop / Variety" value={selectedRow.cropVariety} />
                  <Detail label="Command Area (acre)" value={selectedRow.commandArea} />
                </div>
              </div>

              {/* ================= SEED & SOWING ================= */}
              <div>
                <SectionTitle title="Seed & Sowing" />
                <div className="grid grid-cols-5 gap-4">
                  <Detail label="Seed Rate (kg/acre)" value={selectedRow.seedRate} />
                  <Detail label="Sowing Date" value={selectedRow.sowingDate} />
                  <Detail label="Practice Type" value={selectedRow.cropPracticeDemo} />
                </div>
              </div>

              {/* ================= FERTILIZER ================= */}
              <div>
                <SectionTitle title="Fertilizer Application" />
                <div className="grid grid-cols-1">
                  <Detail
                    label="Fertilizer (Name & Quantity)"
                    value={
                      selectedRow.fertilizers?.length
                        ? selectedRow.fertilizers
                          .map((f: any) => `${f.name} (${f.qty})`)
                          .join(", ")
                        : "-"
                    }
                  />
                </div>
              </div>

              {/* ================= WEEDICIDE ================= */}
              <div>
                <SectionTitle title="Weedicide Application" />
                <div className="grid grid-cols-1">
                  <Detail
                    label="Weedicide (Name & Quantity)"
                    value={
                      selectedRow.weedicides?.length
                        ? selectedRow.weedicides
                          .map((w: any) => `${w.name} (${w.qty})`)
                          .join(", ")
                        : "-"
                    }
                  />
                </div>
              </div>

              {/* ================= PESTICIDE ================= */}
              <div>
                <SectionTitle title="Pesticide Application" />
                <div className="grid grid-cols-1">
                  <Detail
                    label="Pesticide / Bio-agents"
                    value={
                      selectedRow.pesticides?.length
                        ? selectedRow.pesticides
                          .map(
                            (p: any) =>
                              `${p.name} (${p.qty})` +
                              (p.bioName
                                ? ` | Bio: ${p.bioName} (${p.bioQty})`
                                : "")
                          )
                          .join(", ")
                        : "-"
                    }
                  />
                </div>
              </div>

              {/* ================= IRRIGATION & HARVEST ================= */}
              <div>
                <SectionTitle title="Irrigation & Harvest" />
                <div className="grid grid-cols-5 gap-4">
                  <Detail label="Source of Irrigation" value={selectedRow.irrigation} />
                  <Detail label="Harvesting Date" value={selectedRow.harvestingDate} />
                  <Detail label="Crop Yield (q/acre)" value={selectedRow.cropYield} />
                </div>
              </div>

              {/* ================= WUA & GPS ================= */}
              <div>
                <SectionTitle title="WUA & GPS Details" />
                <div className="grid grid-cols-5 gap-4">
                  <Detail label="WUA Member" value={selectedRow.wuaMember} />
                  <Detail label="WUA Name" value={selectedRow.wuaName} />
                  <Detail label="GPS Location" value={selectedRow.gpsLocation} />
                </div>
              </div>

              {/* ================= COMMENTS ================= */}
              <div>
                <SectionTitle title="Comments" />
                <Detail label="Remarks" value={selectedRow.comments} />
              </div>

            </div>


          </div>
        </div>
      )}

    </div>
  );
};

/* 🔹 Chip Component */
const Chip = ({ label }: { label: string }) => (
  <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-xs font-medium">
    {label}
  </span>
);


const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-gray-500 text-xs">{label}</p>
    <p className="font-medium">{value || "-"}</p>
  </div>
);

const SectionTitle = ({ title }: { title: string }) => (
  <div className="col-span-2 mt-4 mb-1">
    <h3 className="text-sm font-semibold text-blue-900 border-b pb-1">
      {title}
    </h3>
  </div>
);
