export const financeColumns = {
  Budget: [
    "Sl No",
    "Budget Heads",
    "Total Budgeted for entire project",
    "Financial Year",
    " Target Plan (₹ Cr)",
    "Comulative Planed Budget"
  ],

  Fund_Flow: [
    "Sl No",
    "Budget Heads",
    "Total Budgeted for entire project",
    "Financial Year",
    "Amount Received (₹ Cr)",
    "Total Amount Received"
  ],

  Expenditure: [
    "Sl No",
    "Budget Heads",
    "Total Budgeted for entire project",
    "Financial Year",
    "Target Plan (₹ Cr)",
    "Amount Received During the Period",
    "Total Amount Received till Date",
    "Expenditure Incurred During the period",
    "Total Expenditure Incurred till Date"
  ],

  Variance: [
    "Sl No",
    "Budget Heads",
    "Monitoring Parameters",
    "Total Budgeted for entire project",
    "Financial Year",
    "Target Plan (₹ Cr)",
    "Achieved (Reporting Period)",
    "Cumulative Achievement",
    "% Progress",
    "Remarks / Challenges"
  ],

  UC: [
    "Sl No",
    "Budget Heads",
    "Monitoring Parameters",
    "Total Budgeted for entire project",
    "Financial Year",
    "Target Plan (₹ Cr)",
    "Amount Received",
    "Amount Expendniture",
    "Balance",
    "Remarks"
  ]
};




export const financeData = [
  {
    id: 1,
    "Sl No": 1,
    "Budget Heads": "Activities at BCCRAS",
    "Total Budgeted for entire project": "₹21.417 Cr",
    "Target as per Yearly Plan For FY 2025-26": "₹5.00 Cr",
    "Comulative Planed Budget": "₹5.00 Cr",

    "Amount Received in FY 2025-26": "₹4.20 Cr",
    "Total Amount Received": "₹7.00 Cr",

    "Amount Received During the Period": "₹4.20 Cr",
    "Total Amount Received till Date": "₹7.00 Cr",
    "Expenditure Incurred During the period": "₹3.00 Cr",
    "Total Expenditure Incurred till Date": "₹5.50 Cr",

    "Monitoring Parameters": "Budget utilization (%)",
    "Achieved (Reporting Period)": "₹3.00 Cr",
    "Cumulative Achievement": "₹5.50 Cr",
    "% Progress": "25.68 %",

    "Amount Expendniture": "₹5.50 Cr",
    "Balance": "₹1.50 Cr",
    "Remarks / Challenges": "-",
    "Remarks": "-"
  },

  {
    id: 2,
    "Sl No": 2,
    "Budget Heads": "CRA demonstration, extension & Agri-entrepreneurship",
    "Total Budgeted for entire project": "₹166.408 Cr",
    "Target as per Yearly Plan For FY 2025-26": "₹40.00 Cr",
    "Comulative Planed Budget": "₹40.00 Cr",

    "Amount Received in FY 2025-26": "₹25.00 Cr",
    "Total Amount Received": "₹38.00 Cr",

    "Amount Received During the Period": "₹25.00 Cr",
    "Total Amount Received till Date": "₹38.00 Cr",
    "Expenditure Incurred During the period": "₹21.00 Cr",
    "Total Expenditure Incurred till Date": "₹30.00 Cr",

    "Monitoring Parameters": "Budget utilization (%)",
    "Achieved (Reporting Period)": "₹21.00 Cr",
    "Cumulative Achievement": "₹30.00 Cr",
    "% Progress": "18.02 %",

    "Amount Expendniture": "₹30.00 Cr",
    "Balance": "₹8.00 Cr",
    "Remarks / Challenges": "-",
    "Remarks": "-"
  },
];


export interface FixedBudgetHead {
  id: number;
  head: string;
  totalBudget: number;
}

export const fixedBudgetHeads: FixedBudgetHead[] = [
  {
    id: 1,
    head: "Activities at BCCRAS",
    totalBudget: 214170000, // 21.417 Cr
  },
  {
    id: 2,
    head: "CRA demonstration",
    totalBudget: 1664080000, // 166.408 Cr
  },
  {
    id: 3,
    head: "CAA DSS",
    totalBudget: 88000000, // 8.80 Cr
  },
  {
    id: 4,
    head: "Other",
    totalBudget: 233750000, // 23.375 Cr
  },
];




export const financeFormConfig = {
  Budget: [
    { key: "budgetHead", label: "Budget Head", type: "select" },
    { key: "financialYear", label: "Financial Year", type: "select" },
    { key: "yearlyTarget", label: "Yearly Plan (₹ Cr)", type: "number" },
    { key: "cumulativeBudget", label: "Cumulative Budget (₹ Cr)", type: "number" },
  ],

  Revenue: [
    { key: "financialYear", label: "Financial Year", type: "select" },
    { key: "source", label: "Revenue Source", type: "text" },
    { key: "receivedAmount", label: "Received Amount (₹ Cr)", type: "number" },
  ],

  Expenditure: [
    { key: "financialYear", label: "Financial Year", type: "select" },
    { key: "budgetHead", label: "Budget Head", type: "select" },
    { key: "spentAmount", label: "Spent Amount (₹ Cr)", type: "number" },
  ],

  UC: [
    { key: "financialYear", label: "Financial Year", type: "select" },
    { key: "budgetHead", label: "Budget Head", type: "select" },
    { key: "ucAmount", label: "UC Amount (₹ Cr)", type: "number" },
  ],
};
