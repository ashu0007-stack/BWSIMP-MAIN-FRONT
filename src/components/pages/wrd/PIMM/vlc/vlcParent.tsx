import React, { useState } from "react";
import VLCFormation from "./vlc";
import VLCListPage from "./vlcList";

const VLCParent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'view'>('list');
  const [selectedWUA, setSelectedWUA] = useState<any>(null);
  const [selectedVLC, setSelectedVLC] = useState<any>(null);

  // VLC list से create form पर जाने के लिए
  const handleCreateNewVLC = (wua?: any) => {
    setSelectedWUA(wua || null);
    setSelectedVLC(null);
    setCurrentView('create');
  };

  // VLC list से edit form पर जाने के लिए
  const handleEditVLC = (vlc: any) => {
    setSelectedVLC(vlc);
    setCurrentView('edit');
  };

  // VLC list से view details पर जाने के लिए
  const handleViewDetails = (vlc: any) => {
    setSelectedVLC(vlc);
    setCurrentView('view');
  };

  // Create/Edit/View form से list पर वापस जाने के लिए
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedWUA(null);
    setSelectedVLC(null);
  };

  // VLC creation successful होने पर
  const handleVLCCreated = () => {
    setCurrentView('list');
    setSelectedWUA(null);
  };

  // Render the appropriate component based on current view
  switch (currentView) {
    case 'list':
      return (
        <VLCListPage
          onBack={() => {}} // Empty function for list page
          onCreateNew={handleCreateNewVLC}
          onEdit={handleEditVLC}
          onViewDetails={handleViewDetails}
        />
      );
      
    case 'create':
    case 'edit':
      return (
        <VLCFormation
          preselectedWUA={selectedWUA}
          editId={currentView === 'edit' ? selectedVLC?.id : undefined}
          onSuccess={handleVLCCreated}
          onCancel={handleBackToList}
          onViewVLCs={handleBackToList}
        />
      );
      
    case 'view':
      // यहां आप VLCDetail component render कर सकते हैं
      // For now, showing a simple view
      return (
        <div className="min-h-screen bg-gray-50 py-6">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleBackToList}
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      Back to List
                    </button>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">VLC Details</h1>
                      <p className="text-green-100">{selectedVLC?.vlc_name || "VLC Details"}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Basic Information</h3>
                    <p><span className="font-medium">VLC Name:</span> {selectedVLC?.vlc_name}</p>
                    <p><span className="font-medium">Village:</span> {selectedVLC?.village_name}</p>
                    <p><span className="font-medium">WUA:</span> {selectedVLC?.wua_name}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Location Details</h3>
                    <p><span className="font-medium">District:</span> {selectedVLC?.district_name}</p>
                    <p><span className="font-medium">Block:</span> {selectedVLC?.block_name}</p>
                    <p><span className="font-medium">Gram Panchayat:</span> {selectedVLC?.gp_name}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={handleBackToList}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Back to VLC List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
      
    default:
      return (
        <VLCListPage
          onBack={() => {}}
          onCreateNew={handleCreateNewVLC}
          onEdit={handleEditVLC}
          onViewDetails={handleViewDetails}
        />
      );
  }
};

export default VLCParent;