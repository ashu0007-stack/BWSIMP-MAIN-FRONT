"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Users, Shield, Droplets, AlertCircle, BarChart, Calendar } from "lucide-react";
import { LineChart, Line, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useESStatistics } from "@/hooks/wrdHooks/ES/useESReports";

interface ESStatisticsProps {
  id: number;
}

export default function ESStatistics({ id }: ESStatisticsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  
  // ✅ Hook से data fetch करें
  const { data: statisticsData, isLoading, error } = useESStatistics(id);

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-4">Failed to load dashboard statistics. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ✅ Check if data is available
  if (!statisticsData) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-yellow-700 mb-2">No Data Available</h2>
          <p className="text-yellow-600">Dashboard statistics are not available for this project yet.</p>
        </div>
      </div>
    );
  }

  // ✅ Extract data directly from API response
  const environmentalData = statisticsData.environmental_trends || [];
  const socialData = statisticsData.social_indicators || [];
  const recentActivities = statisticsData.recent_activities || [];

  // ✅ Format compliance data
  const complianceData = [
    { 
      name: 'Environmental', 
      value: statisticsData.compliance?.environmental || 0, 
      color: '#10B981' 
    },
    { 
      name: 'Social', 
      value: statisticsData.compliance?.social || 0, 
      color: '#3B82F6' 
    },
    { 
      name: 'Safety', 
      value: statisticsData.compliance?.safety || 0, 
      color: '#F59E0B' 
    },
    { 
      name: 'Labour Camp', 
      value: statisticsData.compliance?.labour_camp || 0, 
      color: '#8B5CF6' 
    },
  ];

  // ✅ Format grievance data
  const grievanceData = [
    { 
      status: 'Resolved', 
      value: statisticsData.grievances?.resolved || 0, 
      color: '#10B981' 
    },
    { 
      status: 'Pending', 
      value: statisticsData.grievances?.pending || 0, 
      color: '#F59E0B' 
    },
    { 
      status: 'In Progress', 
      value: statisticsData.grievances?.in_progress || 0, 
      color: '#3B82F6' 
    },
    { 
      status: 'Rejected', 
      value: statisticsData.grievances?.rejected || 0, 
      color: '#EF4444' 
    },
  ];

  // ✅ Format summary stats
  const summaryStats = [
    { 
      title: 'Total Workers', 
      value: statisticsData.summary?.total_workers || '0', 
      change: statisticsData.summary?.worker_change || '0%', 
      icon: <Users className="w-6 h-6" />, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100' 
    },
    { 
      title: 'Env. Compliance', 
      value: `${statisticsData.summary?.env_compliance || 0}%`, 
      change: statisticsData.summary?.env_change || '0%', 
      icon: <Droplets className="w-6 h-6" />, 
      color: 'text-green-600', 
      bg: 'bg-green-100' 
    },
    { 
      title: 'Social Compliance', 
      value: `${statisticsData.summary?.social_compliance || 0}%`, 
      change: statisticsData.summary?.social_change || '0%', 
      icon: <Shield className="w-6 h-6" />, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100' 
    },
    { 
      title: 'Open Issues', 
      value: statisticsData.summary?.open_issues || '0', 
      change: statisticsData.summary?.issues_change || '0', 
      icon: <AlertCircle className="w-6 h-6" />, 
      color: 'text-red-600', 
      bg: 'bg-red-100' 
    },
  ];

  // ✅ Check if there's any data to display
  const hasEnvironmentalData = environmentalData.length > 0;
  const hasSocialData = socialData.length > 0;
  const hasComplianceData = complianceData.some(item => item.value > 0);
  const hasGrievanceData = grievanceData.some(item => item.value > 0);
  const hasRecentActivities = recentActivities.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">E&S Dashboard</h2>
          <p className="text-gray-600">Comprehensive overview of environmental and social performance</p>
        </div>
        
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-full text-sm capitalize ${
                timeRange === range 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
              <div className={`text-sm font-medium flex items-center ${
                stat.change?.startsWith?.('+') ? 'text-green-600' : 
                stat.change?.startsWith?.('-') ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stat.change?.startsWith?.('+') ? <TrendingUp className="w-4 h-4 mr-1" /> : 
                 stat.change?.startsWith?.('-') ? <TrendingDown className="w-4 h-4 mr-1" /> : null}
                {stat.change}
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-gray-600">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Environmental Trends */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Environmental Trends</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              Last 6 months
            </div>
          </div>
          
          {hasEnvironmentalData ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={environmentalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="water" stroke="#3B82F6" name="Water Quality" strokeWidth={2} />
                <Line type="monotone" dataKey="air" stroke="#10B981" name="Air Quality" strokeWidth={2} />
                <Line type="monotone" dataKey="noise" stroke="#F59E0B" name="Noise Level" strokeWidth={2} />
                <Line type="monotone" dataKey="waste" stroke="#8B5CF6" name="Waste Mgmt %" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No environmental data available
            </div>
          )}
        </div>

        {/* Social Indicators */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Social Indicators</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              Monthly averages
            </div>
          </div>
          
          {hasSocialData ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={socialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="labour" fill="#3B82F6" name="Labour Count" />
                <Bar dataKey="training" fill="#10B981" name="Training Sessions" />
                <Bar dataKey="ppe" fill="#F59E0B" name="PPE Compliance %" />
              </RechartsBarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No social data available
            </div>
          )}
        </div>

        {/* Compliance Distribution */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-gray-800 mb-6">Compliance Distribution</h3>
          
          {hasComplianceData ? (
            <>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={complianceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {complianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Compliance']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                {complianceData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm">{item.name}</span>
                    <span className="ml-auto font-semibold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No compliance data available
            </div>
          )}
        </div>

        {/* Grievance Status */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-gray-800 mb-6">Grievance Status</h3>
          
          {hasGrievanceData ? (
            <>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={grievanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ status, value }) => `${status}: ${value}`}
                    >
                      {grievanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="text-center mt-4">
                <div className="text-2xl font-bold">
                  {grievanceData.reduce((acc, curr) => acc + curr.value, 0)}
                </div>
                <div className="text-gray-600">Total Grievances</div>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No grievance data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      {hasRecentActivities && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-gray-800 mb-6">Recent Activities</h3>
          
          <div className="space-y-4">
            {recentActivities.map((activity: any, index: number) => (
              <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                <div className={`p-2 rounded ${
                  activity.type === 'report' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'inspection' ? 'bg-green-100 text-green-600' :
                  activity.type === 'test' ? 'bg-purple-100 text-purple-600' :
                  activity.type === 'training' ? 'bg-orange-100 text-orange-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {activity.type === 'report' && <BarChart className="w-4 h-4" />}
                  {activity.type === 'inspection' && <Shield className="w-4 h-4" />}
                  {activity.type === 'test' && <Droplets className="w-4 h-4" />}
                  {activity.type === 'training' && <Users className="w-4 h-4" />}
                  {activity.type === 'grievance' && <AlertCircle className="w-4 h-4" />}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium">{activity.activity}</div>
                  <div className="text-sm text-gray-500">{activity.user}</div>
                </div>
                
                <div className="text-sm text-gray-500">
                  {new Date(activity.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No data message if nothing to show */}
      {!hasEnvironmentalData && !hasSocialData && !hasComplianceData && !hasGrievanceData && !hasRecentActivities && (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <BarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Dashboard Data Available</h3>
          <p className="text-gray-500">
            Start monitoring environmental and social indicators to see data here.
          </p>
        </div>
      )}
    </div>
  );
}