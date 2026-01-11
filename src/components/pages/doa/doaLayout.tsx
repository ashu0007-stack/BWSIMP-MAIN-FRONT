import { useState, useEffect } from "react";
import { DoaDashboard } from "./doaDash";
import { FFS } from "./FarmersFieldSchool/FFSDetails/FFS";
import { Session } from "./FarmersFieldSchool/SessionDetails/Session";
import { Farmer } from "./FarmersFieldSchool/FarmersDetails/farmer";
import { StudyPlot } from "./FarmersFieldSchool/StudyPlotDetails/StudyPlot";
import { Demonstration } from "./CraDemonstration/Demonstration/Demonstration";
import { Training } from "./Training/TrainingForm/Training";
import { Finance } from "./Finance/finance";
import { TrainingReportTable } from "./Training/TrainingReports/TrainingReportPage";
import { OfficialParticipant } from "./Training/TargetGroups/Official/officialParticipant";
import { FarmerParticipant } from "./Training/TargetGroups/Farmer/farmerParticipant";
import { UserCreate } from "../admin/userCreate";
import { UserDetails } from "../admin/userDetails";
import { Sidebar } from "@/components/shared/sidebar";
import { CostofCultivation } from "./CraDemonstration/CostofCultivation/CostofCultivation";
export default function DoaLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Load active tab from localStorage
  useEffect(() => {
    const storedTab = sessionStorage.getItem("doaActiveTab");
    if (storedTab) setActiveTab(storedTab);
  }, []);

  // Save active tab to localStorage whenever it changes
  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    sessionStorage.setItem("doaActiveTab", tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DoaDashboard />;
      case "demonstration":
        return <Demonstration setActiveTab={setActiveTab} />;
      // case "demonstrationFarmer":
      //   return <DemonstrationFarmer />;
      case "costofCultivation":
        return <CostofCultivation />;

      case "ffsDetails":
        return <FFS />;
      case "ffsSession":
        return <Session />;
      case "farmerDetails":
        return <Farmer />;
      case "studyPlot":
        return <StudyPlot />;
      case "training":
        return <Training />;
      case "officialParticipant":
        return <OfficialParticipant />;
      case "farmerParticipant":
        return <FarmerParticipant />;
      case "trainingReport":
        return <TrainingReportTable />;
      case "finance":
        return <Finance />;
      case "createuser":
        return <UserCreate />;
      case "manageuser":
        return <UserDetails />;
      default:
        return <DoaDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar
        setActiveTab={handleSetActiveTab} // use our wrapper to save tab
        activeTab={activeTab}
        department="DOA"
      />
      <main className="flex-1 p-6 bg-gray-100">{renderContent()}</main>
    </div>
  );
}
