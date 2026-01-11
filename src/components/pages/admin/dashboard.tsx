import { useState } from "react";
import Link from "next/link";
import CreateWorkPackages from "./work";
import DmsPage from "./DmsPage";
import { Sidebar } from "@/components/shared/sidebar";
import { UserCreate } from "./userCreate";
import { UserDetails } from "./userDetails";
import SuperAdminReportPage from "./schmeReport";

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<string>("home");



  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar: SuperAdmin actions only */}
      {/* <Sidebar
        department="SuperAdmin"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      /> */}

      <Sidebar setActiveTab={setActiveTab} activeTab={activeTab}/>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === "home" && (
          <div>
            <h3 className="text-2xl font-bold mb-6">Welcome SuperAdmin</h3>
            <p className="text-gray-600 mb-6">
              Select a department to open its dashboard:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* RDD */}
              <Link href="/rdd/dashboard">
                <div className="cursor-pointer bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xl rounded-2xl p-8 text-center transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  <div className="mx-auto mb-4">
                    <span className="text-4xl">🏢</span>
                  </div>
                  <h4 className="text-2xl font-bold mb-2">RDD</h4>
                  <p className="text-sm opacity-90">Click to open RDD Dashboard</p>
                </div>
              </Link>

              {/* WRD */}
              <Link href="/wrd/dashboard">
                <div className="cursor-pointer bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-xl rounded-2xl p-8 text-center transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  <div className="mx-auto mb-4">
                    <span className="text-4xl">💧</span>
                  </div>
                  <h4 className="text-2xl font-bold mb-2">WRD</h4>
                  <p className="text-sm opacity-90">Click to open WRD Dashboard</p>
                </div>
              </Link>

              {/* DoA */}
              <Link href="/doa/dashboard">
                <div className="cursor-pointer bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl rounded-2xl p-8 text-center transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  <div className="mx-auto mb-4">
                    <span className="text-4xl">🌿</span>
                  </div>
                  <h4 className="text-2xl font-bold mb-2">DoA</h4>
                  <p className="text-sm opacity-90">Click to open DoA Dashboard</p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* SuperAdmin actions */}
        {activeTab === "work" && <CreateWorkPackages />}
        {activeTab === "usersDetails" && <UserDetails />}
        {activeTab === "addUser" && <UserCreate />}
        {activeTab === "dms" && <DmsPage />}
         {activeTab === "schemes" && <SuperAdminReportPage />}
      </main>
    </div>
  );
}
