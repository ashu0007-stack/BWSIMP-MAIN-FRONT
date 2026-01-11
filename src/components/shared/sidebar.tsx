import { FC, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useUserStore, useChangePassword } from "@/hooks/useAuth";
import { toast } from "react-hot-toast";
import {
  HomeIcon,
  ChevronRightIcon,
  CircleDot,
  ListChecks,
  Wallet,
  ChevronLeft,
  LogOut,
  Users,
  Home,
  FileText,
  Briefcase,
  UserPlus,
  Lock,
  X,
  PieChart,
  Presentation,
  IndianRupee,
  ClipboardList,
  UserCog,
  User,
} from "lucide-react";
import { FarmerFieldSchool, ProcurementIcon } from "./Icons/customIcon";
import { useLogout } from "@/hooks/userHooks/useLogout";
import { AnimatePresence, motion } from "framer-motion";

export const Sidebar: FC<any> = ({ setActiveTab, activeTab }) => {
  const router = useRouter();
  const { setIsLoggedIn } = useUserStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const logout = useLogout();
  useEffect(() => {
    const storedProfile = sessionStorage.getItem("userdetail");
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
    setLoading(false);
  }, []);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const { mutate: changePassword, isPending: cpLoading } = useChangePassword();
  const [oldPassword, setOldPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };
  console.log("Profile", profile);
  const getDepartmentFromUrl = () => {
    const path = router.pathname;
    if (path.startsWith('/wrd')) return 'WRD';
    if (path.startsWith('/doa')) return 'DOA';
    if (path.startsWith('/rdd')) return 'RDD';
    if (path.startsWith('/superadmin')) return 'SystemAdministration';
    return null;
  };
  const currentDepartment = getDepartmentFromUrl();

  const getEffectiveDepartment = () => {
    if (profile?.role_id === 1 && currentDepartment) {
      return currentDepartment;
    }
    return profile?.department_name;
  };
  const effectiveDepartment = getEffectiveDepartment();

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword) {
      toast.error("Please enter both old and new passwords");
      return;
    }
    setPasswordError("");

    changePassword(
      { oldPassword, newPassword },
      {
        onSuccess: () => {
          setOldPassword("");
          setNewPassword("");
          setChangePasswordOpen(false);
          setPasswordError("");
          toast.success("Password changed successfully");
        },
        onError: (error: any) => {
          console.error("Password change error:", error);
          const backendMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.response?.data?.msg ||
            error?.message ||
            "Something went wrong while changing the password.";
          toast.error(backendMessage);
        },
      }
    );
  };

  const toggleDropdown = (label: string) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  // ----------------------------------------
  // MENU CONFIG WITH ROLE-BASED FILTERING
  // ----------------------------------------
  const menuConfig: Record<string, any[]> = {
    SystemAdministration: [
      { id: "home", label: "Dashboard", icon: HomeIcon, roles: [1] },
      { id: "work", label: "Work Packages", icon: Briefcase, roles: [1,] },
      { id: "usersDetails", label: "Manage Users", icon: Users, roles: [1] },
      { id: "addUser", label: "Add User", icon: UserPlus, roles: [1] },
      { id: "dms", label: "Document Upload", icon: FileText, roles: [1] },
      {
                id: "reports",
                label: "Reports",
                type: "dropdown",
                icon: FarmerFieldSchool,
                roles: [1],
                children: [
                    { id: "schemes", label: "Schemes", icon: CircleDot, roles: [1] },
                    { id: "pim", label: "PIM", icon: ListChecks, roles: [1] },
                ]
            }
    ],
 
 DOA: [
      { id: "dashboard", label: "Dashboard", icon: HomeIcon, roles: [1, 2, 3, 4] },
      {
        id: "CRADEMO",
        label: "CRA Demonstration",
        type: "dropdown",
        icon: FarmerFieldSchool,
        roles: [1, 2, 3, 4, 5], // Admin, Manager, Field Officer
        children: [
          { id: "demonstration", label: "CRA Demonstration", icon: Presentation, roles: [1, 2, 3, 4, 5] },
          { id: "costofCultivation", label: "Cost of Cultivation", icon: IndianRupee , roles: [1, 2, 3,4, 5] },
        ],
      },
      {
        id: "ffs",
        label: "Farmer's Field School",
        type: "dropdown",
        icon: FarmerFieldSchool,
        roles: [1, 2, 3, 4, 5], // Admin, Manager, Field Officer
        children: [
          { id: "ffsDetails", label: "FFS Details", icon: CircleDot, roles: [1, 2, 3, 4, 5] },
          { id: "ffsSession", label: "FFS Session", icon: ListChecks, roles: [1, 2, 3, 5] },
          { id: "farmerDetails", label: "Farmers' Details", icon: CircleDot, roles: [1, 2, 3, 4, 5] },
          { id: "studyPlot", label: "Study Plot", icon: ListChecks, roles: [1, 2, 3, 4, 5] },
        ],
      },
      {
        id: "trainingDetails",
        label: "Training",
        type: "dropdown",
        icon: Presentation,
        roles: [1, 2, 3, 4, 5], // Admin, Manager, Field Officer
        children: [
          { id: "training", label: "Training Details", icon: ClipboardList, roles: [1, 2, 3, 4, 5] },
          { id: "officialParticipant", label: "Official Participant", icon: UserCog, roles: [1, 2, 3, 4, 5] },
          { id: "farmerParticipant", label: "Farmer Participant", icon: User, roles: [1, 2, 3, 4, 5] },
          { id: "trainingReport", label: "Training", icon: FileText, roles: [1, 2, 3, 4, 5] },
        ],
      },
      { id: "finance", label: "Finance", icon: Wallet, roles: [1, 2, 3, 4, 5] },
      // { id: "reports", label: "Reports", icon: FileText, roles: [1, 2] },
      { id: "addUser", label: "Add User", icon: UserPlus, roles: [1] },
      { id: "dms", label: "Document Upload", icon: FileText, roles: [1, 2, 3, 4, 5] },
    ],
 

    WRD: [
      { id: "dashboard", label: "Dashboard", icon: HomeIcon, roles: [1, 2, 3, 5, 6] },
      {
        id: "procurement",
        label: "Procurement",
        type: "dropdown",
        icon: ProcurementIcon,
        roles: [1, 2, 3, 5, 6],
        children: [
          { id: "work", label: "Work Packages", icon: CircleDot, roles: [1, 2] },
          { id: "tenderform", label: "Tender Details", icon: CircleDot, roles: [1, 2, 3, 5, 6] },
          { id: "contractform", label: "Contract Details", icon: ListChecks, roles: [1, 2, 3, 5, 6] },
        ],
      },
      // {
      //   id: "finance",
      //   label: "Finance",
      //   type: "dropdown",
      //   icon: Wallet,
      //   roles: [1, 2],
      //   children: [
      //     { id: "pipDetails", label: "PIP Details", icon: CircleDot, roles: [1, 2] },
      //     { id: "awpDetails", label: "AWP Details", icon: ListChecks, roles: [1, 2] },
      //   ],
      // },

      {
        id: "progress",
        label: "Progress",
        type: "dropdown",
        icon: Wallet,
        roles: [1, 2, 3, 5, 6],
        children: [
          { id: "length", label: "Length", icon: CircleDot, roles: [1, 2, 3, 5, 6] },
          { id: "milestone", label: "Milestone", icon: ListChecks, roles: [1, 2, 3, 5, 6] },
        ],
      },

      {
        id: "PIM",
        label: "PIM",
        type: "dropdown",
        icon: Wallet,
        roles: [1, 2, 3, 5, 6],
        children: [
          { id: "pimw", label: "Dashboard", icon: CircleDot, roles: [1, 2, 3, 5, 6] },
          { id: "wua", label: "Wua Creation", icon: ListChecks, roles: [1, 2, 3, 5, 6] },
          { id: "vlc", label: "Vlc Formation", icon: CircleDot, roles: [1, 2, 3, 5, 6] },
          { id: "slc", label: "Slc Formation", icon: CircleDot, roles: [1, 2, 3, 5, 6] },
          { id: "farmer", label: "Farmer Details", icon: CircleDot, roles: [1, 2, 3, 5, 6] },
          { id: "meeting", label: "Meeting & Training", icon: ListChecks, roles: [1, 2, 3, 5, 6] },
        ],
      },

      {
        id: "User Management",
        label: "User Management",
        type: "dropdown",
        icon: Wallet,
        roles: [1, 2],
        children: [
          { id: "createuser", label: "Add User", icon: CircleDot, roles: [1, 2, 3, 5, 6] },
          { id: "manageuser", label: "Manage User", icon: ListChecks, roles: [1, 2, 3, 5, 6] },
        ],
      },

      { id: "Doc", label: "Document Upload", icon: FileText, roles: [1, 2, 3, 5, 6] },
      // { id: "reports", label: "Reports", icon: FileText, roles: [1, 2, 3 ,5 ,6] },

    ],

    RDD: [
      { id: "dashboard", label: "Dashboard", icon: Home, roles: [1, 2, 3, 5, 6] },
      { id: "dataentry", label: "Data Entry", icon: FileText, roles: [5] },
      // { id: "dms", label: "Document Upload", icon: <FileText size={20} /> },
      {
        id: "User Management",
        label: "User Management",
        type: "dropdown",
        icon: Wallet,
        roles: [1, 2],
        children: [
          { id: "createuser", label: "Add User", icon: CircleDot, roles: [1, 2] },
          { id: "manageuser", label: "Manage User", icon: ListChecks, roles: [1, 2] },
        ],
      },

      { id: "reports", label: "Reports", icon: PieChart, roles: [1, 2, 3, 4, 5] },
    ],
    PMU: [
            // { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
            { id: "programes", label: "Programs / Activities", icon: ClipboardList, roles: [1, 2, 3, 5, 6] },
            { id: "conduct", label: "Program Conduct", icon: ClipboardList, roles: [1, 2, 3, 5, 6] },
            { id: "TrainingSummary", label: "TrainingSummary", icon: ClipboardList, roles: [1, 2, 3, 5, 6] },
           
    ]
  };

  // Function to filter menu items based on role
  const filterMenuItems = (items: any[]) => {
    if (!profile?.role_id) return [];

    return items.filter(item => {
      const hasAccess = item.roles?.includes(profile.role_id);

      if (item.type === "dropdown" && hasAccess) {
        const filteredChildren = item.children?.filter((child: any) =>
          child.roles?.includes(profile.role_id)
        );
        return filteredChildren && filteredChildren.length > 0;
      }

      return hasAccess;
    });
  };


  // Get department menu and filter items based on role
  const getFilteredMenuItems = () => {
    if (!effectiveDepartment || !menuConfig[effectiveDepartment]) return [];
    return filterMenuItems(menuConfig[effectiveDepartment]);
  };

  const filteredMenuItems = getFilteredMenuItems();

  const handleMenuItemClick = (itemId: string) => {
    setActiveTab(itemId);
    if (profile?.role_id === 1 && currentDepartment) {
      router.push(`/${currentDepartment.toLowerCase()}/dashboard?tab=${itemId}`);
    }
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    if (passwordError) {
      setPasswordError("");
    }
    if (value && !validatePassword(value)) {
      setPasswordError("Password must be at least 8 characters with uppercase, lowercase, number and special character");
    } else {
      setPasswordError("");
    }
  };

  // ----------------------------------------
  // SIDEBAR UI
  // ----------------------------------------
  return (
    <aside
      className={`min-h-screen hidden md:flex flex-col bg-[#102253] text-white 
                transition-all duration-500 ease-[cubic-bezier(0.4,0.0,0.2,1)]
                ${collapsed ? "w-16" : "w-64"}
            `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/20 bg-white/10">
        <p
          className={`
                        font-bold text-lg tracking-wide
                        transition-all duration-500 ease-[cubic-bezier(0.4,0.0,0.2,1)]
                        overflow-hidden whitespace-nowrap
                        ${collapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-[200px]"}
                    `}
        >
          Dashboard
        </p>

        <button
          onClick={() => {
            setCollapsed(!collapsed);
            setOpenMenu(null);
          }}
          className="p-2 rounded hover:bg-white/20 transition-all duration-500 ease-[cubic-bezier(0.4,0.0,0.2,1)]">
          <ChevronLeft
            size={20}
            className={`
                            transition-transform duration-500 ease-[cubic-bezier(0.4,0.0,0.2,1)]
                            ${collapsed ? "rotate-180" : "rotate-0"}
                        `}
          />
        </button>
      </div>

      {/* User Profile */}
      <div className="px-2 py-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center font-bold">
            {profile?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-semibold text-sm">{profile?.full_name || "User"}</p>
            <p className="text-gray-200 text-xs">
              {profile?.designation_name || "Designation"}
              {profile?.role_id === 1 && currentDepartment && (
                <span className="ml-1 text-yellow-300">
                  (Viewing {currentDepartment})
                </span>
              )}
            </p>
            <p className="text-gray-300 text-xs">
              {profile?.role_name || "Role"} | {profile?.level_name || "Level"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setChangePasswordOpen(true)}
          className="mt-3 text-xs flex items-center gap-1 hover:text-yellow-300"
        >
          <Lock size={12} />
          <span>Change Password</span>
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 mt-4 space-y-2">
        {filteredMenuItems.map((item) => (
          <div key={item.id || item.label} className="transition-all duration-300">
            {/* DROPDOWN ITEM */}
            {item.type === "dropdown" ? (
              <>
                <button
                  disabled={collapsed}
                  onClick={() => toggleDropdown(item.label)}
                  className={`flex items-center w-full p-2 rounded transition-all duration-500 hover:bg-gray-700
                                        ${!collapsed ? 'justify-between' : 'ps-4'}
                                        ${activeTab === item.id ? 'bg-gray-700' : ''}
                                    `}
                >
                  <div className={`${!collapsed ? 'flex items-center' : ''}`}>
                    <item.icon
                      className={`h-6 w-6 text-[#98eace] transition-all duration-500 ease-[cubic-bezier(0.4,0.0,0.2,1)] mr-2`}
                    />
                    {!collapsed && (
                      <span className="transition-all duration-300 opacity-100 ml-1">
                        {item.label}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <ChevronRightIcon
                      className={`h-4 w-4 transition-transform duration-300
                                                ${openMenu === item.label ? "rotate-90" : ""}`}
                    />
                  )}
                </button>

                {/* Filter children based on role */}
                <div
                  className={`overflow-hidden transition-all duration-300
                                        ${openMenu === item.label && !collapsed
                      ? "max-h-80 opacity-100"
                      : "max-h-0 opacity-0"
                    }`}
                >
                  {item.children
                    ?.filter((child: any) => child.roles?.includes(profile?.role_id))
                    .map((sub: any) => (
                      <button
                        key={sub.id}
                        className={`flex items-center py-3 pl-10 text-sm hover:bg-gray-600 rounded w-full text-left
                                                    ${activeTab === sub.id ? 'bg-gray-600' : ''}
                                                `}
                        onClick={() => handleMenuItemClick(sub.id)}
                      >
                        {sub.icon && <sub.icon className="h-4 w-4 mr-2 text-[#a8ffd6]" />}
                        {sub.label}
                      </button>
                    ))}
                </div>
              </>
            ) : (
              /* NORMAL ITEM */
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.id)}
                className={`flex items-center w-full p-2 rounded hover:bg-gray-700 transition-all duration-500
                                    ${!collapsed ? '' : 'ps-4'}
                                    ${activeTab === item.id ? 'bg-gray-700' : ''}
                                `}
              >
                <item.icon
                  className={`h-6 w-6 text-[#98eace] transition-all duration-500 ease-[cubic-bezier(0.4,0.0,0.2,1)] mr-2`}
                />
                <span
                  className={`transition-all duration-300
                                        ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}
                >
                  {item.label}
                </span>
              </button>
            )}
          </div>
        ))}

        {/* Back to SuperAdmin Dashboard (only when SuperAdmin is in other department) */}
        {profile?.role_id === 1 && currentDepartment && currentDepartment !== 'SystemAdministration' && !collapsed && (
          <div className="px-3 pt-5 border-t border-white/20">
            <Link href="/admin">
              <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm">
                <ChevronLeft size={18} />
                Back to SuperAdmin
              </button>
            </Link>
          </div>
        )}

        {/* Logout */}
        <div className="px-3 pb-5">
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm"
            title={collapsed ? "Logout" : ""}
          >
            <LogOut size={18} />
            {!collapsed && "Logout"}
          </button>
        </div>
      </nav>
      {/* Modern Change Password Modal */}
      <AnimatePresence>
        {changePasswordOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-[380px] bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-gray-200"
            >
              <button
                onClick={() => {
                  setChangePasswordOpen(false);
                  setPasswordError("");
                  setOldPassword("");
                  setNewPassword("");
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>

              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                Change Password
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Enter your old and new password below.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Old Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter old password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3 py-2 text-gray-600 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => handleNewPasswordChange(e.target.value)}
                    className={`w-full px-3 py-2 text-gray-600 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${passwordError ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {passwordError && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      {passwordError}
                    </p>
                  )}
                  {!passwordError && newPassword && (
                    <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                      ✓ Password meets requirements
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  onClick={() => {
                    setChangePasswordOpen(false);
                    setPasswordError("");
                    setOldPassword("");
                    setNewPassword("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  onClick={handleChangePassword}
                  disabled={cpLoading || !!passwordError}
                >
                  {cpLoading && (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                  )}
                  {cpLoading ? "Updating..." : "Change Password"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};