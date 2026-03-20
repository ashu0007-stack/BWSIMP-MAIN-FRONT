import { useState } from "react";
import Link from "next/link";
import App from "./work/work";
import DmsPage from "./dms/DmsPage";
import { Sidebar } from "@/components/shared/sidebar";
import { UserCreate } from "./usermanagement/userCreate";
import { UserDetails } from "./usermanagement/userDetails";
import MEModule from "./meDash";
import SuperAdminReportPage from "./reports/schmeReport";
import PIMSuperAdminPage from "./reports/pimReports";
import DepartmentProgressOverview from "./DepartmentProgressOverview";
import MilestonePDOTracker from "./MilestonePDOTracker";
import EnhancedPIMDashboard from "./EnhancedPIMDashboard";
import LengthwiseProgressTracker from "./LengthwiseProgressTracker";
import RiskAlerts from "./RiskAlerts";
import SchemePerformance from "./SchemePerformance";

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<string>("home");

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with enhanced navigation */}
      <Sidebar 
        setActiveTab={setActiveTab} 
        activeTab={activeTab}
        userRole="SuperAdmin"
      />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === "home" && (
          <div>
            {/* Welcome Section */}
            <div className="mb-8">
              <h3 className="text-3xl font-bold mb-2">Welcome SuperAdmin</h3>
              <p className="text-gray-600">
                Monitor all departments, track progress, and manage PDO indicators
              </p>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Schemes</p>
                    <p className="text-2xl font-bold">45</p>
                  </div>
                  <span className="text-3xl">📊</span>
                </div>
                <p className="text-xs text-green-600 mt-2">↑ 12% from last month</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold">38</p>
                  </div>
                  <span className="text-3xl">🚀</span>
                </div>
                <p className="text-xs text-blue-600 mt-2">7 completed</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average PDO</p>
                    <p className="text-2xl font-bold">72%</p>
                  </div>
                  <span className="text-3xl">📈</span>
                </div>
                <p className="text-xs text-green-600 mt-2">↑ 5% from last quarter</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">At Risk</p>
                    <p className="text-2xl font-bold text-red-600">8</p>
                  </div>
                  <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-xs text-red-600 mt-2">Need immediate attention</p>
              </div>
            </div>

            {/* Department Cards */}
            <div>
              <h4 className="text-xl font-bold mb-4">Department Dashboards</h4>
              <p className="text-gray-600 mb-6">
                Select a department to open its detailed dashboard:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* RDD */}
                <Link href="/rdd/dashboard">
                  <div className="cursor-pointer bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xl rounded-2xl p-8 text-center transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
                    <div className="mx-auto mb-4">
                      <span className="text-4xl">🏢</span>
                    </div>
                    <h4 className="text-2xl font-bold mb-2">RDD</h4>
                    <p className="text-sm opacity-90">Rural Development Department</p>
                    <div className="mt-4 flex justify-center gap-2">
                      <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">18 Schemes</span>
                      <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">78% PDO</span>
                    </div>
                  </div>
                </Link>

                {/* WRD */}
                <Link href="/wrd/dashboard">
                  <div className="cursor-pointer bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-xl rounded-2xl p-8 text-center transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
                    <div className="mx-auto mb-4">
                      <span className="text-4xl">💧</span>
                    </div>
                    <h4 className="text-2xl font-bold mb-2">WRD</h4>
                    <p className="text-sm opacity-90">Water Resources Department</p>
                    <div className="mt-4 flex justify-center gap-2">
                      <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">15 Schemes</span>
                      <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">65% PDO</span>
                    </div>
                  </div>
                </Link>

                {/* DoA */}
                <Link href="/doa/dashboard">
                  <div className="cursor-pointer bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl rounded-2xl p-8 text-center transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
                    <div className="mx-auto mb-4">
                      <span className="text-4xl">🌿</span>
                    </div>
                    <h4 className="text-2xl font-bold mb-2">DoA</h4>
                    <p className="text-sm opacity-90">Department of Agriculture</p>
                    <div className="mt-4 flex justify-center gap-2">
                      <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">12 Schemes</span>
                      <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">71% PDO</span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Progress Overview Section */}
            <DepartmentProgressOverview />
          </div>
        )}

        {/* Enhanced Dashboard Sections */}
        {activeTab === "progress-overview" && <DepartmentProgressOverview />}
        {activeTab === "milestone-tracker" && <MilestonePDOTracker />}
        {activeTab === "lengthwise-progress" && <LengthwiseProgressTracker />}
        {activeTab === "pim-enhanced" && <EnhancedPIMDashboard />}
        {activeTab === "risk-alerts" && <RiskAlerts />}
        {activeTab === "scheme-performance" && <SchemePerformance />}
        
        {/* Existing sections */}
        {activeTab === "work" && <App />}
        {activeTab === "usersDetails" && <UserDetails />}
        {activeTab === "addUser" && <UserCreate />}
        {activeTab === "dms" && <DmsPage />}
        {activeTab === "schemes" && <SuperAdminReportPage />}
        {activeTab === "pim" && <PIMSuperAdminPage />}

      </main>
    </div>
  );
}