// components/pages/wrd/PIMM/AllFarmersPage.tsx
import React, { useState } from 'react';
import { useAllFarmers, useFarmersStatistics } from '@/hooks/wrdHooks/pim/farmersHooks';
import { Eye, Phone, MapPin, User, Calendar, Home, Briefcase, FileText } from 'lucide-react';

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
      category_distribution: categoryStats
    };
  };

  const frontendStats = calculateStats(farmers);

  // Filter farmers
  const filteredFarmers = farmers.filter((farmer: Farmer) => {
    const matchesSearch = farmer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farmer.village_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farmer.vlc_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farmer.mobile_number?.includes(searchTerm);
    
    const matchesWUA = selectedWUA === 'All' || farmer.wua_name === selectedWUA;
    const matchesCategory = selectedCategory === 'All' || farmer.category === selectedCategory;
    const matchesGender = selectedGender === 'All' || farmer.gender === selectedGender;
    
    return matchesSearch && matchesWUA && matchesCategory && matchesGender;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading farmers data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Data</h2>
          <p className="text-red-600">Failed to load farmers data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-[1800px] mx-auto px-4">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-8 text-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">👨‍🌾 Farmers Database</h2>
                <p className="text-blue-100">
                  Complete database of all registered farmers with detailed information
                </p>
              </div>
              <div className="bg-white/20 p-6 rounded-2xl backdrop-blur-sm text-center">
                <div className="text-3xl font-bold">{frontendStats.total_farmers}</div>
                <div className="text-blue-100">Total Farmers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{frontendStats.male_farmers}</div>
            <div className="text-gray-600">Male Farmers</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="text-2xl font-bold text-pink-600">{frontendStats.female_farmers}</div>
            <div className="text-gray-600">Female Farmers</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">{frontendStats.landless_farmers}</div>
            <div className="text-gray-600">Landless Farmers</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{frontendStats.wuas_covered}</div>
            <div className="text-gray-600">WUAs Covered</div>
          </div>
        </div>

        {/* Additional Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{frontendStats.villages_covered}</div>
            <div className="text-gray-600">Villages Covered</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="text-2xl font-bold text-cyan-600">{frontendStats.vlcs_covered}</div>
            <div className="text-gray-600">VLCs Formed</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="text-2xl font-bold text-indigo-600">{frontendStats.total_farmers}</div>
            <div className="text-gray-600">Total Farmers</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Farmers</label>
              <input
                type="text"
                placeholder="Search by name, village, VLC, mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* WUA Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WUA</label>
              <select
                value={selectedWUA}
                onChange={(e) => setSelectedWUA(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="All">All WUAs</option>
                {uniqueWUAs.map(wua => (
                  <option key={wua} value={wua}>{wua}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="All">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="All">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
        </div>

        {/* Farmers Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Farmers List</h2>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {filteredFarmers.length} farmers
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact & Land</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VLC & Village</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WUA & Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFarmers.map((farmer: Farmer) => (
                  <tr key={farmer.id} className="hover:bg-gray-50 transition-colors">
                    {/* Farmer Details */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {farmer.full_name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            farmer.gender === 'Male' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-pink-100 text-pink-800'
                          }`}>
                            {farmer.gender}
                          </span>
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                            {farmer.category}
                          </span>
                          {farmer.is_executive && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                              Executive
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact & Land */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {farmer.mobile_number || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Land: {farmer.total_land_holding > 0 ? `${farmer.total_land_holding} Ha` : 'N/A'}
                        </div>
                        {farmer.landless && (
                          <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs mt-1">
                            Landless
                          </span>
                        )}
                      </div>
                    </td>

                    {/* VLC & Village */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          {farmer.vlc_name}
                        </div>
                        <div className="text-sm text-gray-500">{farmer.village_name}</div>
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          <Briefcase className="h-3 w-3" />
                          {farmer.position}
                        </div>
                      </div>
                    </td>

                    {/* WUA & Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{farmer.wua_name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Registered: {new Date(farmer.registration_date).toLocaleDateString()}
                        </div>
                        <div className="mt-3">
                          <button
                            onClick={() => viewFarmerDetails(farmer)}
                            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredFarmers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👨‍🌾</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Farmers Found</h3>
              <p className="text-gray-600">Try adjusting your search filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Farmer Detail Modal */}
      {showDetailModal && selectedFarmer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 rounded-t-2xl text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{selectedFarmer.full_name}</h2>
                  <p className="text-blue-100">Farmer ID: {selectedFarmer.id}</p>
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
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-medium">{selectedFarmer.gender}</span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">{selectedFarmer.age || 'N/A'}</span>
                    </div> */}
                    {/* <div className="flex justify-between">
                      <span className="text-gray-600">Father's Name:</span>
                      <span className="font-medium">{selectedFarmer.father_name || 'N/A'}</span>
                    </div> */}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{selectedFarmer.category}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mobile:</span>
                      <span className="font-medium">{selectedFarmer.mobile_number || 'N/A'}</span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="text-gray-600">Aadhar:</span>
                      <span className="font-medium">{selectedFarmer.aadhar_number || 'N/A'}</span>
                    </div> */}
                  </div>
                </div>

                {/* Bank Details */}
                {/* <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Bank Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account No:</span>
                      <span className="font-medium">{selectedFarmer.bank_account || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IFSC Code:</span>
                      <span className="font-medium">{selectedFarmer.ifsc_code || 'N/A'}</span>
                    </div>
                  </div>
                </div> */}

                {/* Land Information */}
                <div className="bg-gray-50 p-4 rounded-xl">
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
                    {/* <div className="flex justify-between">
                      <span className="text-gray-600">Irrigation Source:</span>
                      <span className="font-medium">{selectedFarmer.irrigation_source || 'N/A'}</span>
                    </div> */}
                  </div>
                </div>

                {/* Crops & Income */}
                {/* <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-3">Crops & Income</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Crops Grown:</span>
                      <div className="text-right">
                        {selectedFarmer.crops_grown?.map((crop, index) => (
                          <div key={index} className="text-sm font-medium">{crop}</div>
                        )) || 'N/A'}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annual Income:</span>
                      <span className="font-medium">
                        {selectedFarmer.annual_income ? 
                          `₹${selectedFarmer.annual_income.toLocaleString()}` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div> */}

                {/* Organizational Details */}
                <div className="bg-gray-50 p-4 rounded-xl">
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
                <div className="bg-gray-50 p-4 rounded-xl md:col-span-2 lg:col-span-3">
                  <h3 className="font-semibold text-gray-800 mb-3">Training & Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <div className="text-gray-600 text-sm">Training Attended:</div>
                      <div className="mt-1 space-y-1">
                        {selectedFarmer.training_attended?.map((training, index) => (
                          <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {training}
                          </div>
                        )) || 'No training attended'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-sm">Registration Date:</div>
                      <div className="font-medium mt-1">
                        {new Date(selectedFarmer.registration_date).toLocaleDateString()}
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
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Edit Details
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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