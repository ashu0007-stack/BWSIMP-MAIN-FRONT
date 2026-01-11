"use client";
import ProtectedPage from "@/components/auth/ProtectedPage";
//import DashboardDetails from "@/components/pages/wrd/DashboardDetails ";
import WrdLayout from "@/components/pages/wrd/Wrdlayout";

export default function DashboardPage() {
  return (
              <ProtectedPage>       
              {/* <DashboardDetails /> */}
              <WrdLayout/>
              </ProtectedPage>
              )
}
