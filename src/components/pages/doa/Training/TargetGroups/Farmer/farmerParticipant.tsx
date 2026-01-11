import React, { FC, useState } from 'react'
import { FarmerParticipantForm } from './farmerParticipantForm';
import { FarmerParticipantTable } from './farmerParticipantTable';


export const FarmerParticipant: FC = () => {
     const [showForm, setShowForm] = useState(false);
    return (
        <div className="">
            {showForm ? (
                // Show form
                <FarmerParticipantTable />
            ) : (
                // Show table
                <FarmerParticipantForm  setShowForm={setShowForm} />
            )}
        </div>
    )
}
