"use client";
import { useState,useEffect } from "react";
import { Sidebar } from "@/components/shared/sidebar";
import RddDashboard from "./rddashboard";
import DataEntryForm from "./dataentry";
//import DataEntryTable from "./DataEntryTable";
import { UserDetails } from "../admin/userDetails";
import MgReport from "./mgreport";
import { UserCreate } from "../admin/userCreate";

export default function RddLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");
  useEffect(() => {
    const storedTab = sessionStorage.getItem("rddActiveTab");
    if (storedTab) setActiveTab(storedTab);
  }, []);

  // Save active tab to localStorage whenever it changes
  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    sessionStorage.setItem("rddActiveTab", tab);
  };
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <RddDashboard />;
      case "dataentry":
        return <DataEntryForm />;
      // case "mgreport":
      //   return <DataEntryTable />;
      case "createuser":
        return <UserCreate />;
      case "manageuser":
        return <UserDetails/>;
      case "reports":
        return <MgReport/>;
      default:
        return <div className="text-center mt-10">Select an option from the sidebar</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        department="RDD"
        activeTab={activeTab}
         setActiveTab={handleSetActiveTab} // use our wrapper to save tab
      />
      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}
