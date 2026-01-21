import React, { useState } from 'react';
import SLCList from './SLCList';
import SLCForm from './slcForm';

interface SLCData {
  id: number;
  slc_name: string;
  wua_name: string;
  wua_id: string;
  formation_date: string;
  executive_members_count: number;
  status: string;
  circle?: string;
  subdivision?: string;
  zone?: string;
  section?: string;
  last_election_date?: string;
  next_election_date?: string;
  created_at?: string;
}

const SLCManagement: React.FC = () => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingSLC, setEditingSLC] = useState<SLCData | null>(null);

  const handleViewSLCList = () => {
    setShowForm(false);
    setEditingSLC(null);
  };

  const handleCreateNewSLC = () => {
    setEditingSLC(null);
    setShowForm(true);
  };

  const handleEditSLC = (slc: SLCData) => {
    setEditingSLC(slc);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingSLC(null);
    setShowForm(false);
  };

  if (showForm) {
    return (
      <SLCForm 
        onBackToList={handleViewSLCList}
        editingSLC={editingSLC}
        onCancelEdit={handleCancelEdit}
      />
    );
  }

  return (
    <SLCList 
      onViewDetails={() => {}} // Will be handled in SLCList modal
      onEditSLC={handleEditSLC}
      onCreateNewSLC={handleCreateNewSLC}
    />
  );
};

export default SLCManagement;