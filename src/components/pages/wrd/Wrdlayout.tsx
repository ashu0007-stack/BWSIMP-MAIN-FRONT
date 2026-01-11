import { useState, useEffect } from "react";
import {Sidebar} from "@/components/shared/sidebar";
import DashboardDetails from "./DashboardDetails ";
import TenderForm from "./ProcueMent/TenderForm";
import ContractForm from "./ProcueMent/contract";
import LengthPage from "./Length/length";
import MilestonePage from "./milestone/dailyprogress";
import { UserCreate} from "../admin/userCreate";
import { UserDetails} from "../admin/userDetails";
import DmsPage from "../admin/DmsPage";
import CreateWorkPackages from "../admin/work";
import WUACreation from "./PIMM/wua";
import VLCFormation from "./PIMM/vlc";
import SLCFormation from "./PIMM/slc";
import AllFarmersPage from "./PIMM/farmer";
import PimComparativeStudy from "./PIMM/pimstudy";
import Reports from "./PIMM/report";
import Dashboard from "./PIMM/wuApim";
import MeetingTraining from "./PIMM/meeting";
export default function WrdLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");
 // Load active tab from localStorage
  useEffect(() => {
    const storedTab = sessionStorage.getItem("wrdActiveTab");
    if (storedTab) setActiveTab(storedTab);
  }, []);

  // Save active tab to localStorage whenever it changes
  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    sessionStorage.setItem("wrdActiveTab", tab);
  };
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardDetails />;
      case "tenderform":
        return <TenderForm />;
      case "contractform":
        return <ContractForm />;
      case "work":
        return <CreateWorkPackages />;
      case "length":
        return <LengthPage />;
      case "milestone":
        return <MilestonePage />;
     case "wua":
        return <WUACreation />
       case "vlc":
        return <VLCFormation />
      case "slc":
        return <SLCFormation/>
      case "farmer":
       return <AllFarmersPage/>
      case "meeting":
       return <MeetingTraining/>
      case "pimstudy":
         return <PimComparativeStudy/>
      case "createuser":
        return <UserCreate />;
      case "manageuser":
        return <UserDetails/>;
        case "Doc":
        return <DmsPage/>;
        case "pimw" :
         return <Dashboard/>
      default:
        return <DashboardDetails />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar
         setActiveTab={handleSetActiveTab} // use our wrapper to save tab
        activeTab={activeTab}
        department="WRD"
      />
       <main className="flex-1 p-6 overflow-y-auto">
        {renderContent()}</main>
    </div>
  );
}
