// import React, { FC, useState, useMemo } from "react";
// import { LocationFilter } from "@/components/shared/LocationFilter";
// import { Download, SquareChartGantt, Table } from "lucide-react";

// type SelectedFilters = {
//     districtName?: string;
//     blockName?: string;
//     clusterName?: string;
//     villageName?: string;
// };

// export const DemonstrationFarmerDetails: FC<any> = ({ onAddNew }) => {
//     const [filters, setFilters] = useState<SelectedFilters>({});

//     /* Dummy Farmer Data */
//     const farmerList = [
//         {
//             id: 1,
//             DBT_Reg_No: "DBT_Reg_001",
//             farmerName: "Ram Kumar",
//             fatherName: "Shyam Kumar",
//             mobile: "9XXXXXXXXX",
//             village: "Rampur",
//             area: "1.2",
//             crop: "Wheat",
//         },
//     ];

//     /* Location Change */
//     const handleLocationChange = (values: any) => {
//         setFilters((prev) => ({ ...prev, ...values }));
//     };

//     /* Filter Logic */
//     const filteredFarmers = useMemo(() => {
//         return farmerList.filter((f) => {
//             if (filters.villageName && f.village !== filters.villageName)
//                 return false;
//             // return true;
//         });
//     }, [farmerList, filters]);

//     return (
//         <div className="space-y-6">

//             {/* 🔍 MERGED FILTER PANEL */}
//             <div className="bg-white border border-gray-200 rounded-xl shadow-md">

//                 {/* Header */}
//                 <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b rounded-t-xl">
//                     <div className="flex items-center gap-3">
//                         <div className="w-1.5 h-7 bg-blue-900 rounded-full" />
//                         <SquareChartGantt className="w-5 h-5 text-blue-900" />
//                         <h2 className="text-lg font-semibold text-blue-900">
//                             Farmer Filters
//                         </h2>
//                     </div>

//                     <button
//                         onClick={onAddNew}
//                         className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm shadow"
//                     >
//                         + Add Farmer
//                     </button>
//                 </div>

//                 {/* Filter Body */}
//                 <div className="p-4 space-y-4">

//                     {/* Location Filter */}
//                     <LocationFilter
//                         levels={["district", "block", "cluster", "village"]}
//                         data={{
//                             district: [],
//                             block: [],
//                             cluster: [],
//                             village: [],
//                         }}
//                         loading={{
//                             district: false,
//                             block: false,
//                             cluster: false,
//                             village: false,
//                         }}
//                         onChange={handleLocationChange}
//                     />

//                     {/* Selected Filter Chips */}
//                     <div className="flex flex-wrap gap-2 pt-3 border-t">
//                         {filters.districtName && <Chip label={`District: ${filters.districtName}`} />}
//                         {filters.blockName && <Chip label={`Block: ${filters.blockName}`} />}
//                         {filters.villageName && <Chip label={`Village: ${filters.villageName}`} />}
//                     </div>
//                 </div>
//             </div>

//             {/* 📊 FARMER TABLE */}
//             <div className="bg-white border border-gray-200 rounded-xl shadow-md px-4 py-3">

//                 <div className="flex items-center justify-between mb-3 pb-2 border-b">
//                     <div className="flex items-center gap-3">
//                         <Table className="w-5 h-5 text-blue-900" />
//                         <h2 className="text-lg font-semibold text-blue-900">
//                             Demonstration Farmer Details
//                         </h2>
//                     </div>

//                     <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg">
//                         <Download className="w-4 h-4" /> Download CSV
//                     </button>
//                 </div>

//                 <table className="w-full text-sm border-collapse">
//                     <thead className="bg-blue-50">
//                         <tr>
//                             <th className="border p-2">DBT Reg. No.</th>
//                             <th className="border p-2">Farmer Name</th>
//                             <th className="border p-2">Father Name</th>
//                             <th className="border p-2">Mobile</th>
//                             <th className="border p-2">Village</th>
//                             <th className="border p-2">Area (Acre)</th>
//                             <th className="border p-2">Crop</th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {filteredFarmers.length === 0 ? (
//                             <tr>
//                                 <td colSpan={6} className="text-center p-4 text-gray-500">
//                                     No farmer data found
//                                 </td>
//                             </tr>
//                         ) : (
//                             filteredFarmers.map((f) => (
//                                 <tr key={f.id} className="even:bg-gray-50">
//                                     <td className="border p-2">{f.DBT_Reg_No}</td>
//                                     <td className="border p-2">{f.farmerName}</td>
//                                     <td className="border p-2">{f.fatherName}</td>
//                                     <td className="border p-2">{f.mobile}</td>
//                                     <td className="border p-2">{f.village}</td>
//                                     <td className="border p-2 text-center">{f.area}</td>
//                                     <td className="border p-2">{f.crop}</td>
//                                 </tr>
//                             ))
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// /* 🔹 Chip */
// const Chip = ({ label }: { label: string }) => (
//     <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-xs font-medium">
//         {label}
//     </span>
// );
