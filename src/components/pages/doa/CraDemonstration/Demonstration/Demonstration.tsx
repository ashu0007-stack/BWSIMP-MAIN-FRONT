import React, { FC, useState } from 'react'
import { DemonstrationDetails } from './DemonstrationDetails';
import { DemonstrationForm } from './DemonstrationForm';

export const Demonstration: FC<any> = ({setActiveTab}) => {
    const [showForm, setShowForm] = useState(true);

    const user = sessionStorage.getItem("userdetail")
        ? JSON.parse(sessionStorage.getItem("userdetail")!)
        : null;
    console.log('user details', user?.user_level_id)

    const isUserLevel = user?.user_level_id === 1;

    return (
        <div>
            {isUserLevel ? (
                // Level 1 users see only table
                <DemonstrationDetails isUserLevel={isUserLevel} setActiveTab={setActiveTab} onAddNew={() => setShowForm(false)} />
            ) : (
                // Other levels can toggle form/table
                showForm ? (
                    <DemonstrationDetails isUserLevel={isUserLevel} setActiveTab={setActiveTab} onAddNew={() => setShowForm(false)} />
                ) : (
                    <DemonstrationForm userDetails={user} setShowForm={setShowForm} />
                )
            )}
        </div>
    )
}
