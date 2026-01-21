import React, { useState } from 'react';
import WUACreationList from './WUACreationList';
import WUACreationForm from './WUACreationForm';

const WUACreationContainer = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedWuaId, setSelectedWuaId] = useState<string>("");

  const handleCreateNew = () => {
    setSelectedWuaId(""); // New WUA creation
    setShowForm(true);
  };

  const handleViewWUA = (wuaId: string) => {
    setSelectedWuaId(wuaId);
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setSelectedWuaId("");
  };

  if (showForm) {
    return (
      <WUACreationForm 
        selectedWuaId={selectedWuaId}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <WUACreationList 
      onCreateNew={handleCreateNew}
      onViewWUA={handleViewWUA}
    />
  );
};

export default WUACreationContainer;