// components/pages/wrd/PIMM/AllFarmersPage.tsx
import React, { useState, useEffect } from "react";
import { useAllFarmers, useFarmersStatistics } from "@/hooks/wrdHooks/pim/farmersHooks";
import { 
  Eye, 
  Edit, 
  Search, 
  Download,
  Plus,
  Users,
  Building,
  MapPin,
  Calendar,
  ArrowLeft,
  Award,
  Loader,
  User,
  BarChart3,
  Shield,
  FileText,
  Home,
  Phone,
  Mail,
  Globe,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  User as UserIcon,
  Calendar as CalendarIcon,
  Home as HomeIcon,
  Briefcase,
  FileText as FileTextIcon
} from "lucide-react";

interface Farmer {
  id: string;
  full_name: string;
  gender: 'Male' | 'Female';
  category: string;
  mobile_number: string;
  village_name: string;
  vlc_name: string;
  wua_name: string;
  land_size: string;
  total_land_holding: number;
  landless: boolean;
  is_executive: boolean;
  position: string;
  registration_date: string;
  age?: number;
  father_name?: string;
  aadhar_number?: string;
  bank_account?: string;
  ifsc_code?: string;
  crops_grown?: string[];
  irrigation_source?: string;
  annual_income?: number;
  training_attended?: string[];
}

// Type guard function to check if data is Farmer[]
const isFarmerArray = (data: unknown): data is Farmer[] => {
  return Array.isArray(data) && (data.length === 0 || 
    (typeof data[0] === 'object' && data[0] !== null && 'id' in data[0]));
};

// Helper function to safely access array
const getFarmersArray = (data: unknown): Farmer[] => {
  if (isFarmerArray(data)) {
    return data;
  }
  return [];
};

const AllFarmersPage = () => {
  const { data: farmersData, isLoading, error } = useAllFarmers();
  const { data: statistics } = useFarmersStatistics();
  
  // Safely convert farmers data to array
  const farmers: Farmer[] = getFarmersArray(farmersData);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWUA, setSelectedWUA] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [districtFilter, setDistrictFilter] = useState<string>("all");

  // Calculate statistics
  const calculateStats = (farmers: Farmer[]) => {
    if (!farmers || farmers.length === 0) {
      return {
        total_farmers: 0,
        wuas_covered: 0,
        villages_covered: 0,
        vlcs_covered: 0,
        male_farmers: 0,
        female_farmers: 0,
        landless_farmers: 0,
        executive_farmers: 0,
        category_distribution: {}
      };
    }

    const totalFarmers = farmers.length;
    const uniqueWUAs = [...new Set(farmers.map(f => f.wua_name))].filter(Boolean);
    const uniqueVillages = [...new Set(farmers.map(f => f.village_name))].filter(Boolean);
    const uniqueVLCs = [...new Set(farmers.map(f => f.vlc_name))].filter(Boolean);
    
    const genderStats = {
      male: farmers.filter(f => f.gender === 'Male').length,
      female: farmers.filter(f => f.gender === 'Female').length
    };

    const landlessCount = farmers.filter(f => f.landless).length;
    const executiveCount = farmers.filter(f => f.is_executive).length;

    const categoryStats = farmers.reduce((acc, farmer) => {
      const category = farmer.category || 'Unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total_farmers: totalFarmers,
      wuas_covered: uniqueWUAs.length,
      villages_covered: uniqueVillages.length,
      vlcs_covered: uniqueVLCs.length,
      male_farmers: genderStats.male,
      female_farmers: genderStats.female,
      landless_farmers: landlessCount,
      executive_farmers: executiveCount,
      category_distribution: categoryStats
    };
  };

  const frontendStats = calculateStats(farmers);

  // Filter farmers
  const filteredFarmers = farmers.filter((farmer: Farmer) => {
    const matchesSearch = farmer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farmer.village_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farmer.vlc_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farmer.mobile_number?.includes(searchTerm) ||
                         farmer.wua_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesWUA = selectedWUA === 'All' || farmer.wua_name === selectedWUA;
    const matchesCategory = selectedCategory === 'All' || farmer.category === selectedCategory;
    const matchesGender = selectedGender === 'All' || farmer.gender === selectedGender;
    const matchesDistrict = districtFilter === "all" || true; // Add district logic if available
    
    return matchesSearch && matchesWUA && matchesCategory && matchesGender && matchesDistrict;
  });

  // Get unique values for filters
  const uniqueWUAs = [...new Set(farmers.map((f: Farmer) => f.wua_name))].filter(Boolean);
  const uniqueCategories = [...new Set(farmers.map((f: Farmer) => f.category))].filter(Boolean);

  // View farmer details
  const viewFarmerDetails = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setShowDetailModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedFarmer(null);
  };

  // Export function
  const handleExport = async () => {
    try {
      const exportData = filteredFarmers.map(farmer => {
        const row: Record<string, string | number | boolean> = {
          'Farmer ID': farmer.id,
          'Full Name': farmer.full_name,
          'Gender': farmer.gender,
          'Category': farmer.category,
          'Mobile Number': farmer.mobile_number || '',
          'Village': farmer.village_name,
          'VLC Name': farmer.vlc_name,
          'WUA Name': farmer.wua_name,
          'Land Size': farmer.land_size || '',
          'Total Land Holding': farmer.total_land_holding,
          'Landless': farmer.landless ? 'Yes' : 'No',
          'Executive Member': farmer.is_executive ? 'Yes' : 'No',
          'Position': farmer.position || '',
          'Registration Date': new Date(farmer.registration_date).toLocaleDateString('en-IN'),
          'Age': farmer.age || '',
          'Father Name': farmer.father_name || '',
          'Aadhar Number': farmer.aadhar_number || '',
          'Bank Account': farmer.bank_account || '',
          'IFSC Code': farmer.ifsc_code || ''
        };
        return row;
      });

      const headers = Object.keys(exportData[0]);
      const csvRows = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const cell = (row as Record<string, string | number | boolean>)[header];
            return typeof cell === 'string' && cell.includes(',') 
              ? `"${cell}"` 
              : cell;
          }).join(',')
        )
      ];

      const csvContent = csvRows.join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Farmers-Export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      
    } catch (err) {
      console.error('Error exporting farmers:', err);
      alert('Failed to export farmers data. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-[#003087]" />
          <p className="mt-4 text-gray-700 font-medium">Loading Farmers Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white border border-red-300 rounded p-8 text-center">
            <p className="text-red-700 text-lg font-medium">Error Loading Data: {error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-[#003087] text-white font-medium rounded hover:bg-[#00205b]"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Government Header */}
      <header className="bg-[#003087] text-white border-b-4 border-[#FF9933]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Farmers Database</h1>
                <p className="text-sm text-blue-200">Complete database of all registered farmers</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Government Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          {[
            { title: "Total Farmers", value: frontendStats.total_farmers, icon: Users, color: "blue" },
            { title: "Male Farmers", value: frontendStats.male_farmers, icon: User, color: "blue" },
            { title: "Female Farmers", value: frontendStats.female_farmers, icon: User, color: "pink" },
            { title: "Executive Farmers", value: frontendStats.executive_farmers, icon: Award, color: "yellow" },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-gray-300 rounded shadow-sm p-5 hover:border-[#003087] transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 ${stat.color === 'blue' ? 'bg-blue-50' : stat.color === 'pink' ? 'bg-pink-50' : 'bg-yellow-50'} rounded`}>
                  <stat.icon className={`w-8 h-8 ${stat.color === 'blue' ? 'text-blue-600' : stat.color === 'pink' ? 'text-pink-600' : 'text-yellow-600'}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            { title: "WUAs Covered", value: frontendStats.wuas_covered, icon: Building, color: "green" },
            { title: "Villages Covered", value: frontendStats.villages_covered, icon: MapPin, color: "purple" },
            { title: "VLCs Formed", value: frontendStats.vlcs_covered, icon: Home, color: "indigo" },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-gray-300 rounded shadow-sm p-5 hover:border-[#003087] transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 ${stat.color === 'green' ? 'bg-green-50' : stat.color === 'purple' ? 'bg-purple-50' : 'bg-indigo-50'} rounded`}>
                  <stat.icon className={`w-8 h-8 ${stat.color === 'green' ? 'text-green-600' : stat.color === 'purple' ? 'text-purple-600' : 'text-indigo-600'}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Government Filter Panel */}
        <div className="bg-white border border-gray-300 rounded shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[280px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Search className="inline w-4 h-4 mr-2" />
                Search Farmers
              </label>
              <input
                type="text"
                placeholder="Search by name, village, VLC, mobile, or WUA..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WUA</label>
              <select
                value={selectedWUA}
                onChange={e => setSelectedWUA(e.target.value)}
                className="px-4 py-2 border border-gray-400 rounded focus:border-[#003087] w-48"
              >
                <option value="All">All WUAs</option>
                {uniqueWUAs.map(wua => (
                  <option key={wua} value={wua}>{wua}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-400 rounded focus:border-[#003087] w-48"
              >
                <option value="All">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={selectedGender}
                onChange={e => setSelectedGender(e.target.value)}
                className="px-4 py-2 border border-gray-400 rounded focus:border-[#003087] w-40"
              >
                <option value="All">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="px-5 py-2 bg-[#FF9933] text-white font-medium rounded hover:bg-[#e68a00] flex items-center gap-2 transition-colors"
              >
                <Download size={18} /> Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Government Data Table */}
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 text-gray-800">
                <tr>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">Farmer Details</th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">Contact & Land</th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">VLC & Village</th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">WUA & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFarmers.map((farmer: Farmer) => (
                  <tr key={farmer.id} className="hover:bg-gray-50 transition-colors">
                    {/* Farmer Details */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{farmer.full_name}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${
                          farmer.gender === 'Male' 
                            ? 'bg-blue-100 text-blue-800 border-blue-300' 
                            : 'bg-pink-100 text-pink-800 border-pink-300'
                        }`}>
                          {farmer.gender}
                        </span>
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full border border-gray-300">
                          {farmer.category}
                        </span>
                        {farmer.is_executive && (
                          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full border border-yellow-300">
                            Executive
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Contact & Land */}
                    <td className="px-6 py-4">
                      <div className="font-medium flex items-center gap-2">
                        <PhoneIcon size={14} className="text-gray-500" />
                        {farmer.mobile_number || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        Land: {farmer.total_land_holding > 0 ? `${farmer.total_land_holding} Ha` : 'N/A'}
                      </div>
                      {farmer.landless && (
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full border border-red-300 mt-2">
                          Landless
                        </span>
                      )}
                    </td>

                    {/* VLC & Village */}
                    <td className="px-6 py-4">
                      <div className="font-medium">{farmer.vlc_name}</div>
                      <div className="text-sm text-gray-600">{farmer.village_name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Position: {farmer.position || 'Member'}
                      </div>
                    </td>

                    {/* WUA & Actions */}
                    <td className="px-6 py-4">
                      <div className="font-medium">{farmer.wua_name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <CalendarIcon size={14} className="text-gray-400" />
                        Registered: {new Date(farmer.registration_date).toLocaleDateString('en-IN')}
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={() => viewFarmerDetails(farmer)}
                          className="text-[#003087] hover:text-[#00205b] flex items-center gap-1 text-sm font-medium"
                        >
                          <Eye size={16} /> View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredFarmers.length === 0 && (
            <div className="py-16 text-center text-gray-600">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium">No Farmers Found</p>
              <p className="mt-1 text-gray-500">
                {searchTerm || selectedWUA !== 'All' || selectedCategory !== 'All' || selectedGender !== 'All'
                  ? 'Try adjusting your search or filters'
                  : 'No farmers have been registered yet'
                }
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredFarmers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-300 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <strong>1</strong> to <strong>{filteredFarmers.length}</strong> of{' '}
                  <strong>{farmers.length}</strong> Farmers
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 border border-gray-400 rounded text-sm hover:bg-gray-100">
                    Previous
                  </button>
                  <button className="px-4 py-2 bg-[#003087] text-white rounded text-sm">
                    1
                  </button>
                  <button className="px-4 py-2 border border-gray-400 rounded text-sm hover:bg-gray-100">
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Farmer Detail Modal - Updated to match government style */}
      {showDetailModal && selectedFarmer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-300 rounded shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#003087] text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">{selectedFarmer.full_name}</h2>
                  <p className="text-blue-200">Farmer ID: {selectedFarmer.id}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-[#003087]" />
                    Personal Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-medium">{selectedFarmer.gender}</span>
                    </div>
                    {selectedFarmer.age && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Age:</span>
                        <span className="font-medium">{selectedFarmer.age}</span>
                      </div>
                    )}
                    {selectedFarmer.father_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Father's Name:</span>
                        <span className="font-medium">{selectedFarmer.father_name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{selectedFarmer.category}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-[#003087]" />
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mobile:</span>
                      <span className="font-medium">{selectedFarmer.mobile_number || 'N/A'}</span>
                    </div>
                    {selectedFarmer.aadhar_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Aadhar:</span>
                        <span className="font-medium">{selectedFarmer.aadhar_number}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bank Details */}
                {selectedFarmer.bank_account && (
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FileTextIcon className="h-5 w-5 text-[#003087]" />
                      Bank Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account No:</span>
                        <span className="font-medium">{selectedFarmer.bank_account}</span>
                      </div>
                      {selectedFarmer.ifsc_code && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">IFSC Code:</span>
                          <span className="font-medium">{selectedFarmer.ifsc_code}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Land Information */}
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Land Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Land Holding:</span>
                      <span className="font-medium">
                        {selectedFarmer.total_land_holding > 0 ? 
                          `${selectedFarmer.total_land_holding} Ha` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Land Size:</span>
                      <span className="font-medium">{selectedFarmer.land_size || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Land Status:</span>
                      <span className={`font-medium ${selectedFarmer.landless ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedFarmer.landless ? 'Landless' : 'Land Owner'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Crops & Income */}
                {selectedFarmer.crops_grown && selectedFarmer.crops_grown.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-3">Crops & Income</h3>
                    <div className="space-y-2">
                      <div>
                        <div className="text-gray-600 text-sm mb-1">Crops Grown:</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedFarmer.crops_grown.map((crop, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded border border-green-300">
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>
                      {selectedFarmer.annual_income && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Annual Income:</span>
                          <span className="font-medium">
                            ₹{selectedFarmer.annual_income.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Organizational Details */}
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Organizational Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Village:</span>
                      <span className="font-medium">{selectedFarmer.village_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">VLC:</span>
                      <span className="font-medium">{selectedFarmer.vlc_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">WUA:</span>
                      <span className="font-medium">{selectedFarmer.wua_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Position:</span>
                      <span className="font-medium">{selectedFarmer.position || 'Member'}</span>
                    </div>
                  </div>
                </div>

                {/* Training & Status */}
                <div className="bg-gray-50 p-4 rounded border border-gray-200 md:col-span-2 lg:col-span-3">
                  <h3 className="font-semibold text-gray-800 mb-3">Training & Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-gray-600 text-sm">Training Attended:</div>
                      <div className="mt-2 space-y-1">
                        {selectedFarmer.training_attended && selectedFarmer.training_attended.length > 0 ? (
                          selectedFarmer.training_attended.map((training, index) => (
                            <div key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded border border-blue-300">
                              {training}
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500">No training attended</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-sm">Registration Date:</div>
                      <div className="font-medium mt-1">
                        {new Date(selectedFarmer.registration_date).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-sm">Executive Status:</div>
                      <div className={`font-medium mt-1 ${selectedFarmer.is_executive ? 'text-yellow-600' : 'text-gray-600'}`}>
                        {selectedFarmer.is_executive ? 'Executive Member' : 'Regular Member'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-colors">
                  Edit Details
                </button>
                <button className="px-6 py-2 bg-[#003087] text-white rounded hover:bg-[#00205b] transition-colors">
                  Print Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllFarmersPage;