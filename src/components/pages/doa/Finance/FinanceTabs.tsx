"use client";

import { useState, useMemo } from "react";
import { FinanceTable } from "./FinanceTable";
import { financeColumns, financeData, fixedBudgetHeads } from "./financeData";
import { FinanceForm } from "./FinanceForm";

const tabs = ["Budget", "Fund_Flow", "Expenditure", "Variance", "UC"] as const;
type FinanceTab = (typeof tabs)[number];

// Map each tab to the relevant column in financeData
const tabColumnMap: Record<FinanceTab, string> = {
  Budget: "Comulative Planed Budget",
  Fund_Flow: "Amount Received in FY 2025-26",
  Expenditure: "Expenditure Incurred During the period",
  Variance: "Cumulative Achievement",
  UC: "Amount Expendniture",
};

export default function FinanceTabs() {
  const [activeTab, setActiveTab] = useState<FinanceTab>("Budget");
  const [showForm, setShowForm] = useState(false);
  const [budgetData, setBudgetData] = useState<any[]>([]);

  const parseCurrency = (value: string | undefined) => {
    if (!value) return 0;
    const num = Number(value.replace(/[₹,\sCr%]/g, ""));
    return num || 0;
  };

  const totalBudget = useMemo(
    () =>
      fixedBudgetHeads.reduce(
        (sum, item) => sum + item.totalBudget / 10000000,
        0
      ),
    []
  );

  const getComponentValues = (tab: FinanceTab) =>
    fixedBudgetHeads.map((head) => {
      const column = tabColumnMap[tab];
      const dataSource = tab === "Budget" ? budgetData : financeData;
      const value = dataSource
        .filter((d) => d["Budget Heads"].includes(head.head))
        .reduce((sum, d) => sum + parseCurrency(d[column]), 0);
      return { head: head.head, value };
    });

  const handleAddBudget = (newEntry: any) => {
    setBudgetData((prev) => [...prev, newEntry]);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">

      {/* ✅ TOTAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Total Budget Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-md flex flex-col justify-between">
          <p className="text-sm font-medium opacity-90">Total Project Budget</p>
          <h2 className="text-2xl font-bold mt-2">₹ {totalBudget.toFixed(2)} Cr</h2>
        </div>

        {/* Component-wise Cards */}
        {fixedBudgetHeads.map((head) => (
          <div
            key={head.id}
            className="bg-white p-4 rounded-xl shadow-md border flex flex-col justify-between hover:shadow-lg transition"
          >
            <p className="text-sm font-medium text-gray-600 truncate">{head.head}</p>
            <h3 className="text-xl font-bold mt-1">₹ {(head.totalBudget / 10000000).toFixed(2)} Cr</h3>
          </div>
        ))}
      </div>

      {/* ✅ TABS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
        {tabs.map((tab) => {
          const componentValues = getComponentValues(tab);

          return (
            <div
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setShowForm(false);
              }}
              className={`cursor-pointer p-4 rounded-xl shadow-md flex flex-col justify-start items-start text-left transition-transform hover:scale-105
                ${activeTab === tab
                  ? "bg-blue-600 text-white border border-blue-700"
                  : "bg-white hover:bg-blue-50"
                }
              `}
            >
              <p className="text-xs opacity-70 mb-1">Module</p>
              <h3 className="text-lg font-semibold mb-3">{tab}</h3>

              <div className="space-y-1 w-full">
                {componentValues.map((comp) => (
                  <div
                    key={comp.head}
                    className="flex justify-between px-2 py-1 bg-white/20 rounded-md"
                  >
                    <span className="truncate text-sm">{comp.head}</span>
                    <span className="text-sm font-semibold">₹ {comp.value.toFixed(2)} Cr</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Bar */}
      {activeTab === "Budget" && (
        <div className="flex justify-between items-center flex-wrap gap-3 mt-4">
          <h2 className="text-lg font-semibold text-gray-700 tracking-wide">Budget Planning</h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 shadow-lg transition"
            >
              ➕ Add Budget Plan
            </button>
          )}
        </div>
      )}

      {/* Form Section */}
      {activeTab === "Budget" && showForm && (
        <div className="bg-white border rounded-2xl shadow-lg p-5 mt-2">
          <div className="flex justify-end mb-3">
            <button
              onClick={() => setShowForm(false)}
              className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition"
            >
              ✖ Close
            </button>
          </div>
          <FinanceForm formType="Budget" onSubmitData={handleAddBudget} />
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white border rounded-2xl shadow-lg p-5 mt-2">
        <FinanceTable
          title={activeTab}
          columns={financeColumns[activeTab]}
          data={activeTab === "Budget" ? budgetData : financeData}
        />
      </div>
    </div>
  );
}
