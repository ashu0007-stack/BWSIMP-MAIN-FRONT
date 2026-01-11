import React, { FC, useState } from 'react'
import { OfficialParticipantForm } from './officialParticipantForm';
import { OfficialParticipantTable } from './officialParticipantTable';


export const OfficialParticipant: FC = () => {
     const [showForm, setShowForm] = useState(false);
    return (
        <div className="">
            {showForm ? (
                // Show form
                <OfficialParticipantTable OnAddNew = {()=>setShowForm(false)} />
            ) : (
                // Show table
                <OfficialParticipantForm  setShowForm={setShowForm} />
            )}
        </div>
    )
}
