import SuperAdminDashboard from "@/components/pages/admin/dashboard";
import ProtectedPage from "@/components/auth/ProtectedPage";

export default function SuperAdminPage() {
  return (
           <ProtectedPage>
            <SuperAdminDashboard />
            </ProtectedPage>
          );
}
