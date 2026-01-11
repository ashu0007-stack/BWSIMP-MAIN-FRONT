"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, FileText, Database } from "lucide-react";
import { useEffect, useState } from "react";
import {
  useProjectExpenses,
  useUsersCount,
  useMGReportCount,
} from "@/hooks/useRdd";

export default function RddDashboard() {
  const [userRole, setUserRole] = useState<string>("");
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [isReady, setIsReady] = useState(false);

  // ----------------------------------------
  // Load user details from sessionStorage
  // ----------------------------------------
  useEffect(() => {
    const userDetail = sessionStorage.getItem("userdetail");

    if (userDetail) {
      try {
        const userData = JSON.parse(userDetail);
        setUserRole(userData?.role_name || "");
        setUserId(userData?.id);
      } catch (err) {
        console.error("Invalid userdetail in sessionStorage", err);
      }
    }

    setIsReady(true);
  }, []);

  const isAdmin = userRole.toLowerCase() === "admin";

  // ----------------------------------------
  // API Hooks
  // ----------------------------------------
  const {
    data: expenses = [],
    isLoading: loadingExpenses,
  } = useProjectExpenses();

  const {
    data: usersData,
    isLoading: loadingUsers,
  } = useUsersCount(3);

  const {
    data: reportsData,
    isLoading: loadingReports,
  } = useMGReportCount();

  const loading =
    !isReady || loadingUsers || loadingReports || loadingExpenses;

  const usersCount = usersData?.count ?? 0;
  const reportsCount = reportsData?.count ?? 0;

  // ----------------------------------------
  // Dashboard Cards
  // ----------------------------------------
  const stats = [
    ...(isAdmin
      ? [
          {
            title: "Total Users",
            value: loading ? "..." : usersCount.toString(),
            icon: <Users className="w-6 h-6" />,
            gradient: "from-blue-500 to-indigo-600",
            bgGradient: "from-blue-50 to-indigo-50",
            textColor: "text-blue-700",
            change: "+12%",
          },
        ]
      : []),
    {
      title: isAdmin ? "Total Reports" : "My Reports",
      value: loading ? "..." : reportsCount.toString(),
      icon: <FileText className="w-6 h-6" />,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-50 to-orange-50",
      textColor: "text-amber-700",
      change: "+8%",
    },
    {
      title: "Data Entries",
      value: loading ? "..." : reportsCount.toString(),
      icon: <Database className="w-6 h-6" />,
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      textColor: "text-green-700",
      change: "+5%",
    },
  ];

  // ----------------------------------------
  // UI
  // ----------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1">
              RDD Dashboard
            </h1>
            <p className="text-blue-100">
              Rural Development Department - Analytics Overview
            </p>
          </div>

          <span className="hidden md:block px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
            {userRole || "User"}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Summary Cards */}
        <div
          className={`grid grid-cols-1 ${
            isAdmin ? "md:grid-cols-3" : "md:grid-cols-2"
          } gap-6`}
        >
          {stats.map((stat, index) => (
            <Card
              key={index}
              className={`bg-gradient-to-br ${stat.bgGradient} border-0 shadow-lg hover:shadow-2xl transition-all rounded-2xl`}
            >
              <CardContent className="p-6 flex justify-between">
                <div>
                  <p className="text-slate-600 text-xs uppercase font-medium">
                    {stat.title}
                  </p>
                  <h3
                    className={`text-4xl font-bold mt-2 ${stat.textColor}`}
                  >
                    {stat.value}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-semibold">
                      {stat.change}
                    </span>
                    <span className="text-slate-500">vs last month</span>
                  </div>
                </div>

                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white`}
                >
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Project Expenses (Admin Only) */}
        {isAdmin && (
          <Card className="shadow-lg rounded-2xl bg-white">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                Project Expenses
              </h3>

              {loadingExpenses ? (
                <div className="text-center py-12">Loading...</div>
              ) : expenses.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-indigo-600 text-white">
                      <tr>
                        <th className="p-3 text-left">#</th>
                        <th className="p-3 text-left">Particulars</th>
                        <th className="p-3 text-right">
                          Estimated Expenses (₹ Cr)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((item: any, i: number) => (
                        <tr key={i} className="border-b">
                          <td className="p-3">{i + 1}</td>
                          <td className="p-3">{item.particulars}</td>
                          <td className="p-3 text-right font-semibold">
                            {Number(item.estimated_expenses_crore || 0).toFixed(
                              2
                            )}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-bold">
                        <td colSpan={2} className="p-4 text-right">
                          Total
                        </td>
                        <td className="p-4 text-right text-blue-600">
                          ₹{" "}
                          {expenses
                            .reduce(
                              (sum: number, item: any) =>
                                sum +
                                Number(item.estimated_expenses_crore || 0),
                              0
                            )
                            .toFixed(2)}{" "}
                          Cr
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
