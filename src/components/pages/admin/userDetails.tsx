import React, { FC, useState, useMemo } from 'react';
import { Pencil, UserX, UserCheck, Search, Download, Filter, Users, Shield, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useUsersList } from '@/hooks/userHooks/useUserDetails';
import { useCountUp } from '@/hooks/useCountUp';

export const UserDetails: FC = () => {
  const { data: usersList } = useUsersList();
  const [filters, setFilters] = useState({
    search: "",
    role: "ALL",
    department: "ALL",
    designation: "ALL",
    status: "ALL",
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);

  const totalUsers = usersList?.length ?? 0;
  const activeUsers = usersList?.filter((u: any) => u.is_active === "1").length ?? 0;
  const inActiveUsers = usersList?.filter((u: any) => u.is_active === "0").length ?? 0;

  const totalUsersCount = useCountUp(totalUsers, 3000);
  const activeUsersCount = useCountUp(activeUsers, 2500);
  const inActiveUsersCount = useCountUp(inActiveUsers, 2000);

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

    return usersList.filter((user: any) => {
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

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-600 rounded-2xl p-6 shadow-lg mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8" /> User Management
        </h1>
        <p className="text-blue-100 mt-1">Government MIS Portal - User Administration</p>
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
            className="w-full pl-11 py-3 pr-4 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select 
              className="w-full pl-11 py-3 pr-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md">
            <Download className="w-5 h-5" /> Export
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-0">

            {/* Table Header */}
            <thead className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm">
              <tr>
                <th className="px-4 py-3 text-left">S No.</th>
                {/* <th className="px-4 py-3 text-left">Employee</th> */}
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Mobile</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Designation</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="text-sm text-gray-700">
              {currentUsers.length ? (
                currentUsers.map((user: any, idx: number) => (
                  <tr
                    key={user.id}
                    className={`transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-indigo-50`}
                  >
                    {/* S No. */}
                    <td className="px-4 py-3 text-gray-500">
                      {startUser + idx}
                    </td>

                    {/* Employee id */}
                    {/* <td className="px-4 py-3 font-semibold">
                      {user.hrms_id || "-"}
                    </td> */}

                    {/* (Avatar + Name) */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-[220px]">

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow">
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
                    <td className="px-4 py-3 max-w-[300px] text-gray-600">
                      {user.email}
                    </td>

                    {/* Mobile */}
                    <td className="px-4 py-3 text-gray-600">
                      {user.mobno}
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                        <Shield size={14} />
                        {user.role_name || "N/A"}
                      </span>
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
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${user.is_active === "1"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {user.is_active === "1" ? (
                          <UserCheck size={14} />
                        ) : (
                          <UserX size={14} />
                        )}
                        {user.is_active === "1" ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          title="Edit User"
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          title="Disable User"
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          <UserX size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-gray-500">
                    <Users className="w-14 h-14 mx-auto mb-3 opacity-50" />
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


        {/* Pagination */}
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
                className="border border-gray-300 rounded px-2 py-1 text-sm"
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
              className={`p-2 rounded-lg border ${currentPage === 1 ? 'border-gray-200 text-gray-400' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border ${currentPage === 1 ? 'border-gray-200 text-gray-400' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
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
                    className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium ${currentPage === pageNum
                      ? 'bg-indigo-600 text-white'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
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
              className={`p-2 rounded-lg border ${currentPage === totalPages ? 'border-gray-200 text-gray-400' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border ${currentPage === totalPages ? 'border-gray-200 text-gray-400' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}