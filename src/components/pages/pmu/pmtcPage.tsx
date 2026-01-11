import React, { FC, useState } from 'react'
import { usePrograme } from '@/hooks/programesTraining/usePrograme';
import { PMTCDashboard } from './dashboard';
import { Programs } from './Traning/programActivite/programs';
import { ConductProgrammeTable } from './Traning/ConductTraining/conductTraningDetails';
import { CondcutForm } from './Traning/ConductTraining/condcutDetailsForm';
import { TrainingSummary } from './Traning/SummaryTraning/SummaryTraning';
import { useConduct } from '@/hooks/programesTraining/useCondcut';
import { Sidebar } from '@/components/shared/sidebar';


export const PMTCLayout: FC = () => {

    const { data: programData } = usePrograme();
    const { data: cunductData } = useConduct();

    const [activeTab, setActiveTab] = useState<string>("dashboard");
    const [selectProgrameId, setSelectProgrameId] = useState<number | null>(null);




    const handleOpenConductTab = (programId: number) => {
        setSelectProgrameId(programId);
        setActiveTab("conduct");
    };



    const handleTabChange = (tab: string) => {
        setActiveTab(tab);

        if (tab !== "conduct") {
            setSelectProgrameId(null);
        }
    };


    const renderContent = () => {
        switch (activeTab) {
            // case "dashboard":
            //     return <PMTCDashboard />;
            case "programes":
                return (
                    <Programs
                        setActiveTab={setActiveTab}
                        openCalendarTab={handleOpenConductTab}
                    />
                );

            case "conduct":
                return (
                    <>
                        {selectProgrameId ? (
                            <CondcutForm
                                programData={programData}
                                selectProgrameId={selectProgrameId}
                                onCloseForm={() => setSelectProgrameId(null)}
                            />
                        ) : (
                            <ConductProgrammeTable />
                        )}
                    </>
                );

            case "TrainingSummary":
                return (
                    <TrainingSummary
                    programData={programData}
                    cunductData={cunductData}
                    />
                );


                  case "Audit":
                return (
                    <TrainingSummary
                    programData={programData}
                    cunductData={cunductData}
                    />
                );



            default:
                return <TrainingSummary />;
        }
    }


    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Sidebar
                setActiveTab={handleTabChange}
                activeTab={activeTab}
            />
            <main className="flex-1 p-6 bg-gray-100">{renderContent()}</main>
        </div>
    )
}
