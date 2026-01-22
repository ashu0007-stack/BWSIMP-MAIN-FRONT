import React, { FC, useState, useMemo, useEffect } from 'react';
import { 
  Pencil, 
  UserX, 
  UserCheck, 
  Search, 
  Download, 
  Filter, 
  Users, 
  Shield, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  CheckCircle, 
  Ban,
  AlertCircle,
  Info
} from "lucide-react";
import { useUsersList, useToggleUserStatus } from '@/hooks/userHooks/useUserDetails';
import { useCountUp } from '@/hooks/useCountUp';
import { Modal } from '@/components/shared/modal';
import { EditUser } from './EditUser';

interface User {
  id: number;
  full_name: string;
  email: string;
  mobno: string;
  emp_code: string;
  role_name: string;
  department_name: string;
  designation_name: string;
  is_active: string;
  hrms_id?: string;
}

// ✅ Define role hierarchy and permissions
const ROLE_HIERARCHY = {
  'Super Admin': 1,
  'Admin': 2,
  'Approver': 3,
  'Reviewer': 4,
  'Operator': 5,
  'Viewer': 6
} as const;

// ✅ Define which roles can modify which other roles
const ROLE_PERMISSIONS: Record<keyof typeof ROLE_HIERARCHY, Array<keyof typeof ROLE_HIERARCHY>> = {
  'Super Admin': ['Admin', 'Approver', 'Reviewer', 'Operator', 'Viewer'],
  'Admin': ['Approver', 'Reviewer', 'Operator', 'Viewer'],
  'Approver': ['Reviewer', 'Operator', 'Viewer'],
  'Reviewer': ['Operator', 'Viewer'],
  'Operator': ['Viewer'],
  'Viewer': []
};

// ✅ Get role display colors
const getRoleColor = (roleName: string): string => {
  switch (roleName) {
    case 'Super Admin':
      return 'bg-purple-100 text-purple-700 border border-purple-300';
    case 'Admin':
      return 'bg-blue-100 text-blue-700 border border-blue-300';
    case 'Approver':
      return 'bg-indigo-100 text-indigo-700 border border-indigo-300';
    case 'Reviewer':
      return 'bg-cyan-100 text-cyan-700 border border-cyan-300';
    case 'Operator':
      return 'bg-emerald-100 text-emerald-700 border border-emerald-300';
    case 'Viewer':
      return 'bg-gray-100 text-gray-700 border border-gray-300';
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-300';
  }
};

export const UserDetails: FC = () => {
  const { data: usersList, isLoading: userDataLoading } = useUsersList();
  const { toggleUserStatus, isToggling } = useToggleUserStatus();
  
  // ✅ Get logged in user information
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);
  const [loggedInUserRole, setLoggedInUserRole] = useState<keyof typeof ROLE_HIERARCHY>('Viewer');
  const [loggedInUserName, setLoggedInUserName] = useState<string>('');
  
  useEffect(() => {
    // Get logged in user data from sessionStorage
    const userDetail = sessionStorage.getItem("userdetail");
    if (userDetail) {
      try {
        const userData = JSON.parse(userDetail);
        setLoggedInUserId(userData.id || null);
        // Ensure role exists in our hierarchy, default to 'Viewer'
        const role = userData.role_name as keyof typeof ROLE_HIERARCHY;
        setLoggedInUserRole(ROLE_HIERARCHY[role] ? role : 'Viewer');
        setLoggedInUserName(userData.full_name || '');
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const [filters, setFilters] = useState({
    search: "",
    role: "ALL",
    department: "ALL",
    designation: "ALL",
    status: "ALL",
  });
  const [editUserModal, setEditUserModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false); 
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'enable' | 'disable'>('disable');
  const [showSelfWarning, setShowSelfWarning] = useState(false);
  const [showPermissionInfo, setShowPermissionInfo] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);

  const totalUsers = usersList?.length ?? 0;
  const activeUsers = usersList?.filter((u: User) => u.is_active === "1").length ?? 0;
  const inActiveUsers = usersList?.filter((u: User) => u.is_active === "0").length ?? 0;

  const totalUsersCount = useCountUp(totalUsers, 3000);
  const activeUsersCount = useCountUp(activeUsers, 2500);
  const inActiveUsersCount = useCountUp(inActiveUsers, 2000);

  // ✅ Check if user is trying to modify themselves
  const isCurrentUser = (userId: number): boolean => {
    return userId === loggedInUserId;
  };

  // ✅ Check if user can modify another user based on role permissions
  const canModifyUser = (userToModify: User): boolean => {
    if (!userToModify || !loggedInUserId) return false;
    
    // If trying to modify self
    if (userToModify.id === loggedInUserId) {
      return false; // Cannot modify self
    }
    
    // Check if target role is in current user's allowed modification list
    const allowedRoles = ROLE_PERMISSIONS[loggedInUserRole] || [];
    return allowedRoles.includes(userToModify.role_name as keyof typeof ROLE_HIERARCHY);
  };

  // ✅ Check if user can view edit button
  const canEditUser = (user: User): boolean => {
    return canModifyUser(user);
  };

  // ✅ Get roles that current user can modify (for filter dropdown)
  const getRolesCurrentUserCanModify = (): string[] => {
    return ROLE_PERMISSIONS[loggedInUserRole] || [];
  };

  const handleFilterChange = (
    key: keyof typeof filters,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  const filteredUsers = useMemo(() => {
    if (!usersList) return [];

    return usersList.filter((user: User) => {
      const searchMatch =
        !filters.search ||
        user.full_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.emp_code?.toLowerCase().includes(filters.search.toLowerCase());

      const roleMatch =
        filters.role === "ALL" || user.role_name === filters.role;

      const departmentMatch =
        filters.department === "ALL" ||
        user.department_name === filters.department;

      const designationMatch =
        filters.designation === "ALL" ||
        user.designation_name === filters.designation;

      const statusMatch =
        filters.status === "ALL" ||
        user.is_active === filters.status;

      return (
        searchMatch &&
        roleMatch &&
        departmentMatch &&
        designationMatch &&
        statusMatch
      );
    });
  }, [usersList, filters]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const startUser = indexOfFirstUser + 1;
  const endUser = Math.min(indexOfLastUser, filteredUsers.length);

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      pageNumbers.push(1);
      if (start > 2) pageNumbers.push('...');

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (end < totalPages - 1) pageNumbers.push('...');
      if (totalPages > 1) pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  // Handle users per page change
  const handleUsersPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUsersPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  const handleEditUser = (user: User) => {
    // ✅ Check if user can edit this user
    if (isCurrentUser(user.id)) {
      setShowSelfWarning(true);
      setTimeout(() => setShowSelfWarning(false), 3000);
      return;
    }
    
    if (!canEditUser(user)) {
      alert(`You do not have permission to edit ${user.role_name} users.`);
      return;
    }
    
    setEditUserModal(true);
    setSelectedUser(user);
  };

  // Handle Enable/Disable User
  const handleToggleUserStatus = (user: User) => {
    // ✅ Prevent self-modification
    if (isCurrentUser(user.id)) {
      setShowSelfWarning(true);
      setTimeout(() => setShowSelfWarning(false), 3000);
      return;
    }
    
    // ✅ Check permissions
    if (!canModifyUser(user)) {
      alert(`You do not have permission to modify ${user.role_name} users.`);
      return;
    }
    
    const newStatus = user.is_active === "1" ? false : true;
    const action = newStatus ? 'enable' : 'disable';
    
    setSelectedUser(user);
    setActionType(action);
    setConfirmModal(true); // Show confirmation modal
  };

  // Confirm Toggle Status
  const confirmToggleStatus = () => {
    if (!selectedUser) return;
    
    // ✅ Double-check security (client-side validation)
    if (isCurrentUser(selectedUser.id)) {
      alert("Security Error: Cannot modify your own account!");
      setConfirmModal(false);
      return;
    }
    
    if (!canModifyUser(selectedUser)) {
      alert("Permission Error: You cannot modify this user!");
      setConfirmModal(false);
      return;
    }
    
    const newStatus = selectedUser.is_active === "1" ? false : true;
    
    toggleUserStatus({
      userId: selectedUser.id,
      isActive: newStatus
    }, {
      onSuccess: () => {
        // Show success message
        alert(`User ${newStatus ? 'enabled' : 'disabled'} successfully!`);
        setConfirmModal(false);
        setSelectedUser(null);
      },
      onError: (error) => {
        alert(`Failed to toggle user status: ${error.message}`);
        setConfirmModal(false);
      }
    });
  };

  // Export to CSV
  const handleExport = () => {
    // Simple export logic
    const csvData = filteredUsers.map((user: User) => ({
      'Employee Code': user.emp_code,
      'Full Name': user.full_name,
      'Email': user.email,
      'Mobile': user.mobno,
      'Role': user.role_name,
      'Department': user.department_name,
      'Designation': user.designation_name,
      'Status': user.is_active === "1" ? 'Active' : 'Inactive'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map((row: { [s: string]: unknown; } | ArrayLike<unknown>) => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get role filter options based on permissions
  const roleFilterOptions = [
    { value: "ALL", label: "All Roles" },
    { value: "Super Admin", label: "Super Admin" },
    { value: "Admin", label: "Admin" },
    { value: "Approver", label: "Approver" },
    { value: "Reviewer", label: "Reviewer" },
    { value: "Operator", label: "Operator" },
    { value: "Viewer", label: "Viewer" }
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Self-modification Warning Toast */}
      {showSelfWarning && (
        <div className="fixed top-4 right-4 z-50 animate-slideIn">
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-3" />
              <div>
                <p className="font-semibold">Self-modification not allowed</p>
                <p className="text-sm">You cannot modify your own account from this page.</p>
              </div>
              <button 
                onClick={() => setShowSelfWarning(false)}
                className="ml-auto text-amber-700 hover:text-amber-900"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Info Modal */}
      {showPermissionInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Your Permissions</h3>
                  <p className="text-sm text-gray-600">As {loggedInUserRole}</p>
                </div>
                <button
                  onClick={() => setShowPermissionInfo(false)}
                  className="ml-auto text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  You can modify users with the following roles:
                </p>
                <div className="space-y-2">
                  {ROLE_PERMISSIONS[loggedInUserRole].length > 0 ? (
                    ROLE_PERMISSIONS[loggedInUserRole].map(role => (
                      <div key={role} className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}>
                          {role}
                        </div>
                        <span className="text-xs text-gray-500">(Lower privilege)</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">You cannot modify any users.</p>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Note:</span> You cannot modify users with the same or higher privilege level.
                </p>
              </div>
              
              <button
                onClick={() => setShowPermissionInfo(false)}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-600 rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8" /> User Management
            </h1>
            <p className="text-blue-100 mt-1">Government MIS Portal - User Administration</p>
          </div>
          
          {/* Current User Info with Permission Info */}
          {loggedInUserId && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-3 bg-blue-800/30 px-4 py-2 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold">
                  {loggedInUserName?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{loggedInUserName}</p>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getRoleColor(loggedInUserRole)}`}>
                      {loggedInUserRole}
                    </span>
                    <span className="text-blue-200 text-xs">
                      (ID: {loggedInUserId})
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowPermissionInfo(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
              >
                <Info className="w-4 h-4" />
                <span className="text-sm">View Permissions</span>
              </button>
            </div>
          )}
        </div>
        
        {/* ✅ Show current user info and role hierarchy */}
        {loggedInUserId && (
          <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4 text-sm bg-blue-800/30 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-200" />
              <span className="text-blue-100">
                <span className="font-semibold">Role Hierarchy:</span> 
                <span className="ml-2 text-xs text-blue-200">
                  Super Admin → Admin → Approver → Reviewer → Operator → Viewer
                </span>
              </span>
            </div>
            <div className="hidden md:block w-px h-4 bg-blue-600/50"></div>
            <div className="text-blue-100 text-sm">
              <span className="font-medium">Permission Rule:</span> You can only modify users with <span className="font-semibold">lower privilege</span>.
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Total Users */}
        <div className="relative bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-6 hover:scale-105 transform transition-all duration-300">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase">Total Users</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{totalUsersCount}</p>
            </div>
            <div className="p-4 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 text-white shadow-md">
              <Users className="w-8 h-8" />
            </div>
          </div>
          <div className="mt-3 h-1 bg-blue-300 rounded-full animate-pulse"></div>
        </div>

        {/* Active Users */}
        <div className="relative bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-6 hover:scale-105 transform transition-all duration-300">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase">Active Users</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{activeUsersCount}</p>
            </div>
            <div className="p-4 rounded-full bg-gradient-to-tr from-green-400 to-green-600 text-white shadow-md">
              <UserCheck className="w-8 h-8" />
            </div>
          </div>
          <div className="mt-3 h-1 bg-green-300 rounded-full animate-pulse"></div>
        </div>

        {/* Inactive Users */}
        <div className="relative bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-6 hover:scale-105 transform transition-all duration-300">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase">Inactive Users</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{inActiveUsersCount}</p>
            </div>
            <div className="p-4 rounded-full bg-gradient-to-tr from-red-400 to-red-600 text-white shadow-md">
              <UserX className="w-8 h-8" />
            </div>
          </div>
          <div className="mt-3 h-1 bg-red-300 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or employee code..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full pl-11 py-3 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                className="w-full pl-11 py-3 pr-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                value={filters.role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
              >
                {roleFilterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <select
                className="w-full pl-3 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
          </div>
          
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={filteredUsers.length === 0}
          >
            <Download className="w-5 h-5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-0 w-full">
            {/* Table Header */}
            <thead className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">S No.</th>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Mobile</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-left font-semibold">Department</th>
                <th className="px-4 py-3 text-left font-semibold">Designation</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="text-sm text-gray-700">
              {currentUsers.length ? (
                currentUsers.map((user: User, idx: number) => {
                  const isSelf = isCurrentUser(user.id);
                  const canModify = canModifyUser(user);
                  const canEdit = canEditUser(user);
                  
                  return (
                    <tr
                      key={user.id}
                      className={`transition-all duration-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-indigo-50 ${isSelf ? 'bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 border-l-4 border-amber-400' : ''} ${!canModify && !isSelf ? 'opacity-80' : ''}`}
                    >
                      {/* S No. */}
                      <td className="px-4 py-3 text-gray-500">
                        <div className="flex items-center gap-1">
                          <span>{startUser + idx}</span>
                          {isSelf && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full" title="This is your account">
                              You
                            </span>
                          )}
                          {!canModify && !isSelf && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full" title="Higher privilege">
                              🔒
                            </span>
                          )}
                        </div>
                      </td>

                      {/* (Avatar + Name) */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          {/* Avatar */}
                          <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold shadow ${
                            isSelf 
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 ring-2 ring-amber-300 ring-offset-1' 
                              : !canModify && !isSelf
                                ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                          }`}>
                            {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          {/* Name + Code */}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 leading-tight max-w-[160px]">
                              {user.full_name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500 max-w-[160px]">
                              {user.emp_code || ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 max-w-[200px] text-gray-600 truncate" title={user.email}>
                        {user.email}
                      </td>

                      {/* Mobile */}
                      <td className="px-4 py-3 text-gray-600">
                        {user.mobno || "-"}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role_name)}`}>
                            <Shield size={12} />
                            {user.role_name || "N/A"}
                          </span>
                          {isSelf && (
                            <span className="text-xs text-amber-600 font-medium">(You)</span>
                          )}
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3 text-gray-600">
                        {user.department_name || "-"}
                      </td>

                      {/* Designation */}
                      <td className="px-4 py-3 text-gray-600">
                        {user.designation_name || "-"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            user.is_active === "1"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          } ${isSelf ? 'border border-amber-300' : ''}`}
                        >
                          {user.is_active === "1" ? (
                            <UserCheck size={12} />
                          ) : (
                            <UserX size={12} />
                          )}
                          {user.is_active === "1" ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          {/* Edit Button */}
                          <button
                            title={
                              isSelf 
                                ? "Cannot edit your own profile" 
                                : !canEdit 
                                  ? `No permission to edit ${user.role_name} users`
                                  : "Edit User"
                            }
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              isSelf || !canEdit
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-md hover:scale-105'
                            }`}
                            onClick={() => handleEditUser(user)}
                            disabled={isSelf || !canEdit}
                          >
                            <Pencil size={16} />
                          </button>
                          
                          {/* Enable/Disable Button */}
                          <button
                            title={
                              isSelf 
                                ? "You cannot disable/enable your own account" 
                                : !canModify 
                                  ? `No permission to modify ${user.role_name} users`
                                  : user.is_active === "1" 
                                    ? "Disable User" 
                                    : "Enable User"
                            }
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              isSelf || !canModify
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : user.is_active === "1"
                                  ? "bg-amber-50 text-amber-600 hover:bg-amber-100 hover:shadow-md hover:scale-105"
                                  : "bg-green-50 text-green-600 hover:bg-green-100 hover:shadow-md hover:scale-105"
                            } ${isToggling ? 'opacity-70 cursor-not-allowed' : ''}`}
                            onClick={() => handleToggleUserStatus(user)}
                            disabled={isSelf || !canModify || isToggling}
                          >
                            {user.is_active === "1" ? (
                              <Ban size={16} />
                            ) : (
                              <CheckCircle size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-500">
                    <Users className="w-14 h-14 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {filters.search || filters.role !== "ALL" || filters.status !== "ALL" 
                        ? "Try adjusting your filters" 
                        : "No users in the system"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Same as before */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-semibold">{startUser}</span> to <span className="font-semibold">{endUser}</span> of <span className="font-semibold">{filteredUsers.length}</span> results
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <select
                value={usersPerPage}
                onChange={handleUsersPerPageChange}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border transition ${
                currentPage === 1 
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:shadow'
              }`}
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border transition ${
                currentPage === 1 
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:shadow'
              }`}
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-1 mx-2">
              {getPageNumbers().map((pageNum, index) => (
                pageNum === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(Number(pageNum))}
                    className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white shadow'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:shadow'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border transition ${
                currentPage === totalPages 
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:shadow'
              }`}
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border transition ${
                currentPage === totalPages 
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:shadow'
              }`}
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <Modal isOpen={editUserModal} isClose={setEditUserModal} size="xl">
        {selectedUser && (
          <EditUser
            user={selectedUser}
            onClose={() => setEditUserModal(false)}
            onSubmit={(data) => {
              setEditUserModal(false);
            }}
          />
        )}
      </Modal>

      {/* Confirmation Modal for Enable/Disable */}
      <Modal 
        isOpen={confirmModal} 
        isClose={() => setConfirmModal(false)} 
        size="md"
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-full ${
              actionType === 'disable' 
                ? 'bg-amber-100 text-amber-600' 
                : 'bg-green-100 text-green-600'
            }`}>
              {actionType === 'disable' ? (
                <Ban className="w-8 h-8" />
              ) : (
                <CheckCircle className="w-8 h-8" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {actionType === 'disable' ? 'Disable User' : 'Enable User'}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedUser?.full_name} ({selectedUser?.emp_code})
              </p>
              <div className={`mt-1 px-2 py-1 rounded text-xs font-medium inline-block ${getRoleColor(selectedUser?.role_name || '')}`}>
                {selectedUser?.role_name}
              </div>
              {isCurrentUser(selectedUser?.id || 0) && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Warning: This is your own account!</span>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            Are you sure you want to {actionType} this user? 
            {actionType === 'disable' 
              ? ' They will not be able to access the system.' 
              : ' They will regain access to the system.'
            }
          </p>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setConfirmModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              disabled={isToggling}
            >
              Cancel
            </button>
            <button
              onClick={confirmToggleStatus}
              className={`px-4 py-2 rounded-lg text-white transition flex items-center gap-2 ${
                actionType === 'disable' 
                  ? 'bg-amber-600 hover:bg-amber-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } ${isToggling ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isToggling}
            >
              {isToggling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  {actionType === 'disable' ? <Ban size={16} /> : <CheckCircle size={16} />}
                  {actionType === 'disable' ? 'Disable User' : 'Enable User'}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};