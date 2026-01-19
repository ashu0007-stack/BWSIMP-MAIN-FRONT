import React, { useState, useEffect } from "react";
import WorkListPage from "@/components/pages/admin/work/WorkListPage";
import CreateWorkPage from "@/components/pages/admin/work/CreateWorkPage";
import ViewWorkPage from "@/components/pages/admin/work/ViewWorkPage";
import { UserData } from "@/components/pages/admin/work/work";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<"list" | "create" | "view" | "edit">("list");
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  const [user, setUser] = useState<UserData | null>(null);

  // Get user data from sessionStorage
  useEffect(() => {
    const getUserData = () => {
      try {
        if (typeof window !== "undefined") {
          const userDetails = sessionStorage.getItem("userdetail");

          if (userDetails) {
            try {
              const parsedData = JSON.parse(userDetails);

              const userData: UserData = {
                username: parsedData.full_name || "Unknown User",
                email: parsedData.email || "unknown@example.com",
                dept_id: parsedData.dept_id || 1,
                role: parsedData.role || "user",
                department: parsedData.department,
                designation: parsedData.designation,
                levelname: parsedData.level,
                levelid: parsedData.id,
                zone_id: parsedData.zone_id,
                circle_id: parsedData.circle_id,
                division_id: parsedData.division_id
              };

              setUser(userData);
            } catch (parseError) {
              console.error("❌ Error parsing user data:", parseError);
              setDefaultUser();
            }
          } else {
            setDefaultUser();
          }
        }
      } catch (error) {
        console.error("❌ Error loading user data:", error);
        setDefaultUser();
      }
    };

    const setDefaultUser = () => {
      const defaultUser: UserData = {
        username: "System User",
        email: "system@example.com",
        dept_id: 1,
        role: "user"
      };
      setUser(defaultUser);
    };

    getUserData();
  }, []);

  // Navigation handlers
  const handleViewWork = (workId: number) => {
    setSelectedWorkId(workId);
    setCurrentPage("view");
  };

  const handleCreateWork = () => {
    setSelectedWorkId(null);
    setCurrentPage("create");
  };

  const handleEditWork = () => {
    setCurrentPage("edit");
  };

  const handleBackToList = () => {
    setCurrentPage("list");
    setSelectedWorkId(null);
  };

  // Render based on current page
  switch (currentPage) {
    case "list":
      return (
        <WorkListPage
          onViewWork={handleViewWork}
          onCreateWork={handleCreateWork}
        />
      );

    case "create":
      return (
        <CreateWorkPage
          user={user}
          onBackToList={handleBackToList}
        />
      );

    case "view":
      return (
        <ViewWorkPage
          workId={selectedWorkId!}
          user={user}
          onBackToList={handleBackToList}
          onEditWork={handleEditWork}
        />
      );

    case "edit":
      return (
        <ViewWorkPage
          workId={selectedWorkId!}
          user={user}
          onBackToList={handleBackToList}
          onEditWork={() => setCurrentPage("view")}
        />
      );

    default:
      return (
        <WorkListPage
          onViewWork={handleViewWork}
          onCreateWork={handleCreateWork}
        />
      );
  }
};

export default App;