"use client";

import React, { FC, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Building2, BookOpen, IndianRupee, BarChart as BarIcon } from "lucide-react";

/**
 * DoA Dashboard (Full page) - Next.js (Page Router)
 * - Advanced Financial module (Option 3)
 * - Use: paste as component in your page route (client component)
 * - Requires: `npm install recharts lucide-react`
 *
 * NOTE: All "used" values below are deterministic sample values for UI demonstration.
 * Replace with API values from Node/Express + MySQL.
 */

/* ---------- Static geographic & sample data (same as you provided) ---------- */
const DISTRICTS = [
  "Bhojpur",
  "Buxar",
  "Kaimur",
  "Rohtas",
  "Madhubani",
  "Gopalganj",
];

const BLOCKS = [
  { id: "B1", name: "Ara Block", district: "Bhojpur" },
  { id: "B2", name: "Charpokhari", district: "Bhojpur" },
  { id: "B3", name: "Buxar Block", district: "Buxar" },
  { id: "B4", name: "Ramgarh", district: "Kaimur" },
  { id: "B5", name: "Rohtas Block", district: "Rohtas" },
  { id: "B6", name: "Madhubani Block", district: "Madhubani" },
  { id: "B7", name: "Bairgania", district: "Gopalganj" },
  { id: "B8", name: "Sonepur", district: "Rohtas" },
  { id: "B9", name: "Kargahar", district: "Kaimur" },
  { id: "B10", name: "Benipur", district: "Madhubani" },
  { id: "B11", name: "Dighwara", district: "Gopalganj" },
];

const CLUSTERS = BLOCKS.flatMap((b) =>
  Array.from({ length: 3 }).map((_, i) => ({
    id: `${b.id}-C${i + 1}`,
    name: `${b.name} Cluster ${i + 1}`,
    blockId: b.id,
    district: b.district,
  }))
);

const VILLAGES = CLUSTERS.flatMap((c) => {
  const count = 6 + (c.id.charCodeAt(c.id.length - 1) % 5); // 6..10
  return Array.from({ length: count }).map((_, i) => ({
    id: `${c.id}-V${i + 1}`,
    name: `Village ${i + 1} of ${c.name}`,
    clusterId: c.id,
    blockId: c.blockId,
    district: c.district,
    demoAreaHa: Math.floor(((c.id.charCodeAt(0) % 7) + 1) * (i + 1) * 0.8) + 5, // deterministic-ish
    farmersTrained: Math.floor(((c.id.charCodeAt(1) % 5) + 1) * ((i % 5) + 1) * 2) + 3,
    ffsSessions: ((i + 1) % 6),
  }));
});

/* ---------- Helper ---------- */
function sum(arr: any[], key: string) {
  return arr.reduce((total, item) => total + (Number(item[key]) || 0), 0);
}

/* ---------- Financial totals (from your tables) ---------- */
/* Note: values used are the Grand Totals reported in your messages (INR) */
const FIN_TOTALS = {
  BCCRAS: 214_170_000, // Table 7 Grand Total
  CRA: 1_664_080_000, // Table 8 Grand Total
  DSS_HAISC: 88_000_000, // Table 11 Grand Total
  OTHER: 233_750_000, // Table 12 Grand Total
};

const GRAND_TOTAL =
  FIN_TOTALS.BCCRAS + FIN_TOTALS.CRA + FIN_TOTALS.DSS_HAISC + FIN_TOTALS.OTHER;

  const formatToCr = (num: number): string => {
  if (num >= 1_00_00_000) {
    return (num / 1_00_00_000).toFixed(2) + " Cr";
  } else if (num >= 1_00_000) {
    return (num / 1_00_000).toFixed(2) + " Lakh";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + " K";
  }
  return num.toString();
};

/* Sample deterministic 'used' percentages for demo (replace with real values) */
const usedPercent = {
  BCCRAS: 0.48,
  CRA: 0.36,
  DSS_HAISC: 0.4,
  OTHER: 0.52,
};

/* BCCRAS itemized (from Table 7) */
const BCCRAS_ITEMS = [
  { name: "Recruitment & staffing (total)", amount: 40_000_000 },
  { name: " - Consultants / Experts", amount: 30_720_000 },
  { name: " - Data Entry Operator", amount: 5_040_000 },
  { name: " - Office Boy", amount: 4_240_000 },
  { name: "Equipping & furnishing (total)", amount: 10_000_000 },
  { name: " - IT Hardware", amount: 2_100_000 },
  { name: " - MIS development", amount: 4_500_000 },
  { name: " - Communication Tools", amount: 2_000_000 },
  { name: " - Furniture & Fixtures", amount: 1_400_000 },
  { name: "Capacity Strengthening (total)", amount: 109_700_000 },
  { name: " - Training State", amount: 1_000_000 },
  { name: " - Training District", amount: 1_500_000 },
  { name: " - Training Block", amount: 2_200_000 },
  { name: " - Meetings & Workshops", amount: 100_000_000 },
  { name: " - Exposure visits", amount: 5_000_000 },
  { name: "Baseline study", amount: 5_000_000 },
  { name: "Operational & recurring costs (total)", amount: 30_000_000 },
  { name: " - Utilities", amount: 5_000_000 },
  { name: " - Maintenance", amount: 5_000_000 },
  { name: " - Logistics", amount: 10_000_000 },
  { name: " - Consumables", amount: 5_000_000 },
  { name: " - Overhead", amount: 5_000_000 },
  { name: "Inflation (10%)", amount: 19_470_000 },
];

/* CRA itemized (from Table 8) */
const CRA_ITEMS = [
  { name: "Critical agricultural inputs", amount: 1_000_000_000 },
  { name: "Equipment & machinery", amount: 200_000_000 },
  { name: "Hired mechanical services", amount: 30_000_000 },
  { name: "Implementing support org", amount: 50_000_000 },
  { name: "Farmer Field School (1,188 units)", amount: 60_000_000 },
  { name: "Farmer Training", amount: 10_000_000 },
  { name: "WUA Training", amount: 10_000_000 },
  { name: "Communication & Knowledge Products", amount: 70_000_000 },
  { name: "Awareness Campaign & Field Day", amount: 40_000_000 },
  { name: "Farmer Field Exposure Visits", amount: 40_000_000 },
  { name: "Pico Projector Kit", amount: 2_800_000 },
  { name: "Inflation (10%)", amount: 151_280_000 },
];

export const DoaDashboard: FC = () => {
  /* Filters (kept simple) */
  const [district, setDistrict] = useState<string | "">("");
  const [block, setBlock] = useState<string | "">("");
  const [cluster, setCluster] = useState<string | "">("");
  const [village, setVillage] = useState<string | "">("");

  /* Derived lists */
  const blocksForDistrict = useMemo(
    () => (district ? BLOCKS.filter((b) => b.district === district) : BLOCKS),
    [district]
  );
  const clustersForBlock = useMemo(
    () => (block ? CLUSTERS.filter((c) => c.blockId === block) : CLUSTERS),
    [block]
  );
  const villagesForCluster = useMemo(
    () => (cluster ? VILLAGES.filter((v) => v.clusterId === cluster) : VILLAGES),
    [cluster]
  );

  /* Filtered villages for KPI calculation */
  const filteredVillages = useMemo(
    () =>
      VILLAGES.filter((v) => {
        if (district && v.district !== district) return false;
        if (block && v.blockId !== block) return false;
        if (cluster && v.clusterId !== cluster) return false;
        if (village && v.id !== village) return false;
        return true;
      }),
    [district, block, cluster, village]
  );

  /* KPIs */
  const totalFarmersTrained = sum(filteredVillages, "farmersTrained");
  const totalDemoHa = sum(filteredVillages, "demoAreaHa");
  const totalFFSSessions = sum(filteredVillages, "ffsSessions");
  const totalVillages = filteredVillages.length;
  const totalVillagesAll = VILLAGES.length;
  // const totalBlocks = BLOCKS.length;
  const totalClusters = CLUSTERS.length;

  /* Financial calculations */
  const components = [
    { key: "BCCRAS", label: "BCCRAS", allocated: FIN_TOTALS.BCCRAS, used: Math.round(FIN_TOTALS.BCCRAS * usedPercent.BCCRAS) },
    { key: "CRA", label: "CRA Demonstration", allocated: FIN_TOTALS.CRA, used: Math.round(FIN_TOTALS.CRA * usedPercent.CRA) },
    { key: "DSS_HAISC", label: "DSS & HAISC", allocated: FIN_TOTALS.DSS_HAISC, used: Math.round(FIN_TOTALS.DSS_HAISC * usedPercent.DSS_HAISC) },
    { key: "OTHER", label: "Communication / Partnerships / Other", allocated: FIN_TOTALS.OTHER, used: Math.round(FIN_TOTALS.OTHER * usedPercent.OTHER) },
  ];

  const financialSummary = {
    allocatedTotal: GRAND_TOTAL,
    usedTotal: components.reduce((acc, c) => acc + c.used, 0),
    remainingTotal: GRAND_TOTAL - components.reduce((acc, c) => acc + c.used, 0),
    utilizationPercent: Math.round((components.reduce((acc, c) => acc + c.used, 0) / GRAND_TOTAL) * 100),
  };

  /* District-wise allocation: distribute GRAND_TOTAL proportional to demo area in districtSummary */
  const districtSummary = DISTRICTS.map((d) => {
    const v = VILLAGES.filter((vv) => vv.district === d);
    return {
      district: d,
      demoHa: sum(v, "demoAreaHa"),
      farmers: sum(v, "farmersTrained"),
    };
  });

  const totalDemoHaAll = districtSummary.reduce((s, d) => s + d.demoHa, 0) || 1;
  const districtBudget = districtSummary.map((d) => ({
    district: d.district,
    allocated: Math.round((d.demoHa / totalDemoHaAll) * FIN_TOTALS.CRA), // allocate CRA pot by demo area
    demoHa: d.demoHa,
  }));

  /* Block summary (for table) */
  const blockSummary = BLOCKS.map((b) => {
    const v = VILLAGES.filter((vv) => vv.blockId === b.id);
    return {
      blockId: b.id,
      blockName: b.name,
      district: b.district,
      demoHa: sum(v, "demoAreaHa"),
      farmers: sum(v, "farmersTrained"),
      ffs: sum(v, "ffsSessions"),
    };
  });

  /* Recent FFS and demos (filtered) */
  const recentFfs = filteredVillages
    .filter((v) => v.ffsSessions > 0)
    .slice(0, 20)
    .map((v) => ({
      id: `FFS-${v.id}`,
      village: v.name,
      cluster: v.clusterId,
      block: v.blockId,
      district: v.district,
      sessions: v.ffsSessions,
    }));

  const recentDemos = filteredVillages.slice(0, 20).map((v) => ({
    id: `DEM-${v.id}`,
    village: v.name,
    cluster: v.clusterId,
    demoAreaHa: v.demoAreaHa,
    farmers: v.farmersTrained,
  }));

  /* Charts: training trend using KPI */
  const trainingTrend = [
    { month: "Jan", trained: Math.round(totalFarmersTrained * 0.08) },
    { month: "Feb", trained: Math.round(totalFarmersTrained * 0.12) },
    { month: "Mar", trained: Math.round(totalFarmersTrained * 0.15) },
    { month: "Apr", trained: Math.round(totalFarmersTrained * 0.2) },
    { month: "May", trained: Math.round(totalFarmersTrained * 0.25) },
    { month: "Jun", trained: Math.round(totalFarmersTrained * 0.2) },
  ];

  const pieData = components.map((c) => ({ name: c.label, value: c.allocated }));

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6"];

  return (
    <div className="max-w-8xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Department of Agriculture Dashboard</h1>
        <p className="text-gray-600 mt-1">Full monitoring of Department Of Agricluter</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
        <div className="flex gap-3 flex-wrap">
          <div>
            <label className="text-sm text-gray-600">District</label>
            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setBlock("");
                setCluster("");
                setVillage("");
              }}
              className="mt-1 block w-48 p-2 border rounded-md"
            >
              <option value="">All Districts</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Block</label>
            <select
              value={block}
              onChange={(e) => { setBlock(e.target.value); setCluster(""); setVillage(""); }}
              className="mt-1 block w-56 p-2 border rounded-md"
            >
              <option value="">All Blocks</option>
              {blocksForDistrict.map((b) => (
                <option key={b.id} value={b.id}>{b.name} — {b.district}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Cluster</label>
            <select
              value={cluster}
              onChange={(e) => { setCluster(e.target.value); setVillage(""); }}
              className="mt-1 block w-72 p-2 border rounded-md"
            >
              <option value="">All Clusters</option>
              {clustersForBlock.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Village</label>
            <select
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="mt-1 block w-80 p-2 border rounded-md"
            >
              <option value="">All Villages</option>
              {villagesForCluster.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setDistrict(""); setBlock(""); setCluster(""); setVillage(""); }}
            className="px-4 py-2 bg-gray-100 rounded-md border"
          >
            Reset
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Farmers Trained</div>
          <div className="text-2xl font-bold text-green-600">{totalFarmersTrained}</div>
          <div className="text-xs text-gray-500 mt-1">Across selected area</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">CRA Demo Area (ha)</div>
          <div className="text-2xl font-bold text-blue-600">{totalDemoHa} ha</div>
          <div className="text-xs text-gray-500 mt-1">Demonstration plots</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">FFS Sessions</div>
          <div className="text-2xl font-bold text-purple-600">{totalFFSSessions}</div>
          <div className="text-xs text-gray-500 mt-1">Sessions recorded</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Villages</div>
          <div className="text-2xl font-bold text-yellow-600">{totalVillages}</div>
          <div className="text-xs text-gray-500 mt-1">Selected / {totalVillagesAll} total</div>
        </div>

        {/* Financial KPIs */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Budget (Allocated)</div>
          <div className="text-2xl font-bold text-gray-800">₹{formatToCr(financialSummary.allocatedTotal)}</div>
          <div className="text-xs text-gray-500 mt-1">All components total</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Utilization</div>
          <div className="text-2xl font-bold text-indigo-600">{financialSummary.utilizationPercent}%</div>
          <div className="text-xs text-gray-500 mt-1">Used / Allocated</div>
        </div>
      </div>

      {/* Main Cards: Institutional / CRA / Trainings / Finance */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-6">
        {/* Institutional Setup */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-md bg-blue-50 text-blue-600"><Building2 /></div>
            <div>
              <div className="text-sm text-gray-600">Institutional Setup</div>
              <div className="text-lg font-semibold">BCCRAS & Field Units</div>
            </div>
          </div>
          <div className="text-sm text-gray-600 flex justify-between"><span>State Unit</span><span className="font-medium">Functional</span></div>
          <div className="text-sm text-gray-600 flex justify-between mt-2"><span>District Units</span><span className="font-medium">6/6</span></div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }} />
            </div>
            <div className="text-xs text-gray-500 mt-2">75% operational</div>
          </div>
        </div>

        {/* CRA Demonstration */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-md bg-green-50 text-green-600"><BarIcon /></div>
            <div>
              <div className="text-sm text-gray-600">CRA Demonstration</div>
              <div className="text-lg font-semibold">Coverage & Adoption</div>
            </div>
          </div>
          <div className="text-sm text-gray-600 flex justify-between"><span>Area covered</span><span className="font-medium">{totalDemoHa} ha</span></div>
          <div className="text-sm text-gray-600 flex justify-between mt-2"><span>Clusters active</span><span className="font-medium">{totalClusters}</span></div>
        </div>

        {/* Trainings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-md bg-purple-50 text-purple-600"><BookOpen /></div>
            <div>
              <div className="text-sm text-gray-600">Trainings & FFS</div>
              <div className="text-lg font-semibold">Capacity Building</div>
            </div>
          </div>
          <div className="text-sm text-gray-600 flex justify-between"><span>People trained</span><span className="font-medium">{totalFarmersTrained}</span></div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${Math.min(100, Math.round((totalFarmersTrained / 5300) * 100))}%` }} />
            </div>
            <div className="text-xs text-gray-500 mt-2">{Math.min(100, Math.round((totalFarmersTrained / 5300) * 100))}% of target</div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-md bg-yellow-50 text-yellow-600"><IndianRupee /></div>
            <div>
              <div className="text-sm text-gray-600">Financial Progress</div>
              <div className="text-lg font-semibold">Budget Utilization</div>
            </div>
          </div>

          <div className="text-sm text-gray-600 flex justify-between"><span>Allocated</span><span className="font-medium">₹{financialSummary.allocatedTotal.toLocaleString("en-IN")}</span></div>
          <div className="text-sm text-gray-600 flex justify-between mt-2"><span>Used</span><span className="font-medium">₹{financialSummary.usedTotal.toLocaleString("en-IN")}</span></div>
          <div className="text-sm text-gray-600 flex justify-between mt-2"><span>Remaining</span><span className="font-medium">₹{financialSummary.remainingTotal.toLocaleString("en-IN")}</span></div>

          <div className="mt-4">
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${financialSummary.utilizationPercent}%` }} />
            </div>
            <div className="text-xs text-gray-500 mt-2">{financialSummary.utilizationPercent}% spent</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow col-span-2">
          <h3 className="text-lg font-semibold mb-4">Training Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trainingTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="trained" stroke="#10B981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Component-wise Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* District-wise allocation */}
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h3 className="text-lg font-semibold mb-4">District-wise CRA Allocation (proxy by demo area)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={districtBudget}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="district" />
            <YAxis />
            <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
            <Bar dataKey="allocated" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Financial Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Component-wise summary */}
        <div className="bg-white p-4 rounded-lg shadow overflow-auto">
          <h3 className="text-lg font-semibold mb-3">Component-wise Financial Summary</h3>
          <table className="w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="pb-2">Component</th>
                <th className="pb-2">Allocated (₹)</th>
                <th className="pb-2">Used (₹)</th>
                <th className="pb-2">% Used</th>
              </tr>
            </thead>
            <tbody>
              {components.map((c) => {
                const pct = Math.round((c.used / c.allocated) * 100);
                return (
                  <tr key={c.key} className="border-t">
                    <td className="py-2">{c.label}</td>
                    <td className="py-2">₹{c.allocated.toLocaleString("en-IN")}</td>
                    <td className="py-2">₹{c.used.toLocaleString("en-IN")}</td>
                    <td className="py-2">{pct}%</td>
                  </tr>
                );
              })}
              <tr className="border-t font-semibold">
                <td className="py-2">Total</td>
                <td className="py-2">₹{financialSummary.allocatedTotal.toLocaleString("en-IN")}</td>
                <td className="py-2">₹{financialSummary.usedTotal.toLocaleString("en-IN")}</td>
                <td className="py-2">{financialSummary.utilizationPercent}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BCCRAS activity-level table */}
        <div className="bg-white p-4 rounded-lg shadow overflow-auto">
          <h3 className="text-lg font-semibold mb-3">BCCRAS — Activity-level Budget</h3>
          <table className="w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="pb-2">Activity</th>
                <th className="pb-2">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {BCCRAS_ITEMS.map((it, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2">{it.name}</td>
                  <td className="py-2">₹{it.amount.toLocaleString("en-IN")}</td>
                </tr>
              ))}
              <tr className="border-t font-semibold">
                <td className="py-2">BCCRAS Grand Total</td>
                <td className="py-2">₹{FIN_TOTALS.BCCRAS.toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* CRA activity-level table */}
        <div className="bg-white p-4 rounded-lg shadow overflow-auto">
          <h3 className="text-lg font-semibold mb-3">CRA — Activity-level Budget</h3>
          <table className="w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="pb-2">Activity</th>
                <th className="pb-2">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {CRA_ITEMS.map((it, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2">{it.name}</td>
                  <td className="py-2">₹{it.amount.toLocaleString("en-IN")}</td>
                </tr>
              ))}
              <tr className="border-t font-semibold">
                <td className="py-2">CRA Grand Total</td>
                <td className="py-2">₹{FIN_TOTALS.CRA.toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Other operational tables (blocks/ffs/demos) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-4 rounded-lg shadow overflow-auto">
          <h3 className="text-lg font-semibold mb-3">Block Summary</h3>
          <table className="w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="pb-2">Block</th>
                <th className="pb-2">Demo Ha</th>
                <th className="pb-2">Farmers</th>
              </tr>
            </thead>
            <tbody>
              {blockSummary.map((b) => (
                <tr key={b.blockId} className="border-t">
                  <td className="py-2">{b.blockName}</td>
                  <td className="py-2">{b.demoHa}</td>
                  <td className="py-2">{b.farmers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-4 rounded-lg shadow overflow-auto">
          <h3 className="text-lg font-semibold mb-3">Recent FFS Sessions</h3>
          <table className="w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="pb-2">FFS ID</th>
                <th className="pb-2">Village</th>
                <th className="pb-2">Sessions</th>
              </tr>
            </thead>
            <tbody>
              {recentFfs.length ? recentFfs.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2">{r.id}</td>
                  <td className="py-2">{r.village}</td>
                  <td className="py-2">{r.sessions}</td>
                </tr>
              )) : <tr><td colSpan={3} className="py-4 text-center text-gray-500">No recent FFS in selected filters</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-4 rounded-lg shadow overflow-auto">
          <h3 className="text-lg font-semibold mb-3">Recent Demonstrations</h3>
          <table className="w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="pb-2">Demo ID</th>
                <th className="pb-2">Village</th>
                <th className="pb-2">Area (ha)</th>
              </tr>
            </thead>
            <tbody>
              {recentDemos.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="py-2">{d.id}</td>
                  <td className="py-2">{d.village}</td>
                  <td className="py-2">{d.demoAreaHa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        Note: financial used values are sample deterministic values for UI demonstration. Connect your Node.js + Express APIs (MySQL) to fetch live allocation & expenditure data and replace the sample `usedPercent` values.
      </div>
    </div>
  );
};
