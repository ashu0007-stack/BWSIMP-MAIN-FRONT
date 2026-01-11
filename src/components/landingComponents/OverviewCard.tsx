import React, { useState } from 'react';
import { BarChart2, MapPin, Users } from 'lucide-react';

interface CardData {
    title: string;
    subtitle: string;
    desc: string;
    overview: string | React.ReactNode;
    dept: string;
    color: string;
    stats: Array<{
        label: string;
        value: string | React.ReactNode;
    }>;
}

// Function to render HTML with formatting
const renderOverview = (overview: string | React.ReactNode) => {
    if (typeof overview === 'string') {
        return <div dangerouslySetInnerHTML={{ __html: overview }} />;
    }
    return overview;
};

const cardsOverview: CardData[] = [
    {
        title: "BWSIMP Overview",
        subtitle: "Project Overview",
        desc: "Flagship initiative for water security and irrigation modernization in Bihar.",
        overview: `The Bihar Water Security and Irrigation Modernization Project (BWSIMP) for Rs.4415 Cr. is a flagship comprehensive initiative of the Government of Bihar, funded by the World Bank, aimed at strengthening irrigation services, Flood Risk reduction, and water governance across the state; the project will be executed from 2025 to 2032. Bihar faces recurring challenges of floods in the north and droughts in the south thereby severely affecting agriculture, livelihoods, existing infra structures, etc. The gap between irrigation potential created and that utilized remains significant due to aging infrastructure, weak operation and maintenance systems, limited community participation, etc. The project aims at addressing challenges through an integrated approach that combines modern irrigation infrastructure, flood risk reduction measures, institutional reforms, and climate-resilient agricultural practices. In addition, the project emphasizes Participatory Irrigation Management (PIM), use of advanced data and forecasting tools, and farmer-centric irrigation service delivery to ensure long-term sustainability and improved water productivity.`,
        dept: "BWSIMP",
        color: "blue",
        stats: [
            { label: "Project Cost", value: "₹4,415 Cr" },
            {
                label: "Funding Agency", value: (
                    <div className="flex flex-wrap gap-1.5">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            World Bank: 70%
                        </span>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            State Govt: 30%
                        </span>
                    </div>
                )
            },
            { label: "Duration", value: "2025 - 2032" },
            { label: "Coverage", value: "10 Districts, 72 Blocks" },
            { label: "Beneficiaries", value: "4.34 Million People" },
            { label: "SPMU", value: "FMISC" },
            { label: "PIU", value: "WRD,DOA,RDD" }
        ]
    },
    {
        title: "WRD Overview",
        subtitle: "Water Resources Department",
        desc: "Implementing agency responsible for irrigation infrastructure and water management.",
        overview: `The Water Resources Department (WRD), Government of Bihar is the primary implementing agency for BWSIMP. The department is responsible for:
    • Planning, development, and management of water resources
    • Implementation of major and medium irrigation schemes
    • Flood control measures and river management
    • Rehabilitation and modernization of aging infrastructure
    • Capacity building through WALMI (Water & Land Management Institute)
    • Strengthening Water User Associations (WUAs)
    WRD plays a crucial role in executing all project components including climate-resilient irrigation, flood risk reduction, and water governance reforms.`,
        dept: "WRD",
        color: "cyan",
        stats: [
            { label: "Project Cost", value: "₹4,145 Cr. Estimated" },
            {
                label: "Funding Agency", value: (
                    <div className="flex flex-wrap gap-1.5">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            World Bank: 70%
                        </span>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            State Govt: 30%
                        </span>
                    </div>
                )
            },
            { label: "Duration", value: "2025 - 2032" },
            { label: "Coverage", value: "10 Districts, 72 Blocks" },
            { label: "Beneficiaries", value: "4.34 Million People" },
            { label: "SPMU", value: "FMISC" },
            { label: "PIU", value: "WRD" }
        ]
        },
        {
            title: "DoA Overview",
            subtitle: "Department of Agriculture",
            desc: "Promotion of Climate Resilient Agriculture (CRA) practices.",
            overview: `<strong>Climate change poses significant challenges to agricultural sustainability and livelihoods, particularly for smallholder farmers.</strong> In response, Climate Resilient Agriculture (CRA) has been integrated as a key sub-component of the Bihar Water Security and Irrigation Modernization Project (BWSIMP) to promote climate-smart practices and strengthen agricultural resilience in project command areas. The CRA component focuses on addressing climate risks while ensuring sustainable agricultural production, improving productivity and enhancing the resilience of smallholders. The key objectives of CRA are to enhance agricultural productivity, improve resource-use efficiency, strengthen farmers’ capacities and increase farm incomes. <br>

        <strong>Project Milestones:</strong><br>
        • <strong>Institutional Setup and Project Initiation:</strong> Establish and operationalize Bihar Centre for Climate Resilient Agriculture Systems as a central hub for climate-resilient agriculture planning and coordination. Additionally, the establishment of the BCCRAS is expected to foster a robust institutional framework for scaling CRA in the state of Bihar.<br>
        • <strong>Climate Resilient Agriculture (CRA) Technologies Demonstration & Adoption:</strong> Implement on-farm demonstrations of Direct Seeded Rice (DSR), crop diversification and other CRA technologies across 50,000 hectares in project districts to showcase productivity, resource efficiency and climate benefits.<br>
        • <strong>Capacity Building & Community Engagement:</strong> Strengthen technical and operational capacities of DoA officials, Water User Associations (WUAs) and farmers to ensure knowledge transfer and wider adoption of CRA practices.<br>
        • <strong>Technology Innovation:</strong> Develop and pilot Command Area Agriculture Decision Support System (CAA-DSS) to integrate weather, soil, crop, and water data, delivering real-time advisories.<br><br>
        • <strong>MIS Integration:</strong> All field-level data is systematically captured and logged in the management information system (MIS), ensuring accuracy and transparency. This enables real-time monitoring, analysis and informed decision-making.<br>
        • <strong>Carbon Market:</strong> Establish systems for climate-smart carbon credit generation and finalize the carbon credit verification process and facilitate the transaction for participating farmers.<br>
            • <strong>Sustainability and Partnerships:</strong> Build robust multi-stakeholder partnerships, mainstream CRA technologies, fully integrate CAA-DSS into farmer services (advisories, market linkages) and finalize carbon credit verification and transactions to provide farmers with direct economic benefits from reduced emissions.`,
            dept: "DoA",
            color: "green",
            stats: [
                { label: "Project Cost", value: "₹220 Cr" },
                {
                    label: "Funding Agency", value: (
                        <div className="flex flex-wrap gap-1.5">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                World Bank: 70%
                            </span>
                            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                State Govt: 30%
                            </span>
                        </div>
                    )
                },
                { label: "Duration", value: "2025 - 2032" },
                { label: "Coverage", value: "6 Districts, 11 Blocks" },
                { label: "Beneficiaries", value: "-" },
                { label: "SPMU", value: "FMISC" },
                { label: "PIU", value: "DOA" }
            ]
        },
        {
            title: "RDD Overview",
            subtitle: "Rural Development Department",
            desc: "Improved agricultural productivity by Infrastructure development & farming system resilience",
            overview: `The Rural Development Department (RDD) is a Project Implementing Unit under BWSIMP and leads On-Farm Development (OFD) in irrigation commands restored under <strong>Component 1: Climate Resilient Irrigation (CRI)</strong>.
            RDD ensures that rehabilitated irrigation systems are converted into effective and efficient farm-level irrigation services, by addressing the last-mile delivery of water through field channels and sustainable O&M mechanisms.

            <strong>Key responsibilities under BWSIMP include </strong>:
            •	On-farm development in restored irrigation commands through construction of field channels using MGNREGA funds to ensure last-mile water delivery.
                <strong>Key Information</strong>
            •   <b>Project Component</b>: Climate Resilient Irrigation 
            •   <b>Activity</b>: On-Farm Development
            •   <b>Focus</b>: Better water use, fair sharing, and long-term maintenance`,
            dept: "RDD",
            color: "orange",
            stats: [
                { label: "Project Cost", value: "₹50 Cr" },
                {
                    label: "Funding Agency", value: (
                        <div className="flex flex-wrap gap-1.5">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                World Bank: 70%
                            </span>
                            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                State Govt: 30%
                            </span>
                        </div>
                    )
                },
                { label: "Duration", value: "2025 - 2032" },
                { label: "Coverage", value: "-" },
                { label: "Beneficiaries", value: "-" },
                { label: "SPMU", value: "FMISC" },
                { label: "PIU", value: "RDD" }
            ]
        }
];
const colorClasses = {
    blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-900',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-100',
        active: 'bg-blue-100 border-blue-500',
        gradient: 'from-blue-600 to-blue-800',
        darkText: 'text-blue-800',
        lightText: 'text-blue-600',
        dot: 'bg-blue-500',
        cardBg: 'bg-blue-100',
        cardBorder: 'border-blue-300'
    },
    cyan: {
        bg: 'bg-cyan-50',
        text: 'text-cyan-900',
        border: 'border-cyan-200',
        hover: 'hover:bg-cyan-100',
        active: 'bg-cyan-100 border-cyan-500',
        gradient: 'from-cyan-600 to-cyan-800',
        darkText: 'text-cyan-800',
        lightText: 'text-cyan-600',
        dot: 'bg-cyan-500',
        cardBg: 'bg-cyan-100',
        cardBorder: 'border-cyan-300'
    },
    green: {
        bg: 'bg-green-50',
        text: 'text-green-900',
        border: 'border-green-200',
        hover: 'hover:bg-green-100',
        active: 'bg-green-100 border-green-500',
        gradient: 'from-green-600 to-green-800',
        darkText: 'text-green-800',
        lightText: 'text-green-600',
        dot: 'bg-green-500',
        cardBg: 'bg-green-100',
        cardBorder: 'border-green-300'
    },
    orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-900',
        border: 'border-orange-200',
        hover: 'hover:bg-orange-100',
        active: 'bg-orange-100 border-orange-500',
        gradient: 'from-orange-600 to-orange-800',
        darkText: 'text-orange-800',
        lightText: 'text-orange-600',
        dot: 'bg-orange-500',
        cardBg: 'bg-orange-100',
        cardBorder: 'border-orange-300'
    }
};

const projectComponents = [
    {
        title: "Climate Resilient Irrigation",
        desc: "Rehabilitation and modernization of irrigation schemes, strengthening Water User Associations (WUAs), and promoting climate-resilient agriculture.",
        icon: "💧",
    },
    {
        title: "Flood Risk Reduction",
        desc: `Flooding is a persistent and serious challenge in Bihar, especially in North Bihar. Heavy monsoon rainfall, combined with sediment-laden river flows coming from the steep catchments of Nepal into the flat plains of North Bihar, causes swelling rivers to overflow the banks almost every year. These recurring floods damage homes, crops, roads, embankments, and irrigation systems, repeatedly disrupting livelihoods and slowing development. Although embankments have been constructed over time, many are old, weakened, or affected by erosion, leaving several vulnerable river stretches inadequately protected.
To address these challenges, the Bihar Water Security and Irrigation Modernization Project (BWSIMP), supported by the World Bank, includes a dedicated Flood Risk Reduction (FRR) component focused on strengthening flood protection at the most critical locations.
The key structural interventions under this component include: (i) Restoration of 25 spurs along the Eastern Kosi Embankment, (ii) Strengthening of the Bagmati Left Embankment, (iii) Extension and Restoration of spurs along the Sikar Hatta–Manjhari Bund on the Kosi River, and (iv) Targeted anti-erosion works in the Patthartola–Kamlakani (Kursela) reach. Together, these projects aim to stabilize riverbanks, reduce erosion, minimize the risk of embankment breaches, and protect settlements, farmland, and rural infrastructure in some of the most flood-prone areas of the state.
Combined with improved flood forecasting and early warning systems providing 3–5 days’ advance notice, and other non-structural flood management measures, these interventions will significantly reduce flood damage, improve preparedness, and enhance the long-term resilience of communities across North Bihar.`,
        icon: "🛡️",
    },
    {
        title: "Water Governance",
        desc: "Revision of Participatory Irrigation Management (PIM) SOPs and establishment of a Hydrologic and Agricultural Information Support Centre.",
        icon: "🏛️",
    },
    {
        title: "Project Management",
        desc: "Support to the Project Management Unit (PMU), Project Implementation Units (PIUs), Project Management Technical Consultants, MIS, and Monitoring & Evaluation.",
        icon: "📊",
    },
];

export default function OverviewCard() {
    const [selectedCard, setSelectedCard] = useState<CardData>(cardsOverview[0]);
    const [expandedComponent, setExpandedComponent] = useState<number | null>(null);

    const toggleReadMore = (index: number) => {
        setExpandedComponent(prev => (prev === index ? null : index));
    };

    const getShortText = (text: string, length = 220) => {
        if (text.length <= length) return text;
        return text.substring(0, length) + "...";
    };

    const handleSelectCard = (card: CardData) => {
        setSelectedCard(card);
    };

    const bwsimpCard = cardsOverview[0];
    const departmentCards = cardsOverview.slice(1);

    return (
        <section className="w-full py-8 px-4 bg-gray-50">
            <div className="container mx-auto max-w-7xl">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 text-center">
                        Bihar Water Security and Irrigation Modernization Project
                    </h1>
                    <p className="text-gray-600 text-center max-w-3xl mx-auto">
                        A flagship initiative of the Government of Bihar, supported by the World Bank
                    </p>
                </div>

                {/* Hierarchical Card Layout */}
                <div className="mb-12">
                    {/* Top Card - BWSIMP */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div
                                onClick={() => handleSelectCard(bwsimpCard)}
                                className={`w-80 rounded-2xl border-2 p-6 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${selectedCard.title === bwsimpCard.title
                                    ? `${colorClasses.blue.cardBg} ${colorClasses.blue.cardBorder} ring-4 ring-blue-200`
                                    : `${colorClasses.blue.cardBg} ${colorClasses.blue.cardBorder}`
                                    }`}
                            >
                                {selectedCard.title === bwsimpCard.title && (
                                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse ml-auto"></div>
                                )}

                                <h3 className="text-xl font-bold text-blue-900 mb-2">
                                    BWSIMP
                                </h3>
                                <p className="text-sm text-blue-800 mb-4 line-clamp-2">
                                    {bwsimpCard.desc}
                                </p>

                                <div className="pt-4 border-t border-blue-300">
                                    <div className="text-xs text-blue-700 font-medium mb-1">Quick Stats:</div>
                                    <div className="text-2xl font-bold text-blue-900">₹4,415 Cr</div>
                                </div>
                            </div>

                            {/* Vertical connector line */}
                            <div className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-gray-400 h-8 bottom-0 translate-y-full"></div>
                        </div>
                    </div>

                    {/* Horizontal connector line */}
                    <div className="flex justify-center mb-8">
                        <div className="relative w-full max-w-5xl">
                            <div className="absolute left-1/2 -translate-x-1/2 w-full h-0.5 bg-gray-400 top-0"></div>

                            {/* Vertical lines to cards */}
                            <div className="absolute left-[16.66%] w-0.5 bg-gray-400 h-8 top-0"></div>
                            <div className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-gray-400 h-8 top-0"></div>
                            <div className="absolute left-[83.33%] w-0.5 bg-gray-400 h-8 top-0"></div>
                        </div>
                    </div>

                    {/* Bottom Cards - Departments */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-5xl mx-auto">
                        {departmentCards.map((card, index) => {
                            const color = colorClasses[card.color as keyof typeof colorClasses];
                            const isActive = selectedCard.title === card.title;

                            return (
                                <div
                                    key={index}
                                    onClick={() => handleSelectCard(card)}
                                    className={`rounded-2xl border-2 p-6 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${isActive
                                        ? `${color.cardBg} ${color.cardBorder} ring-4 ring-${card.color}-200`
                                        : `${color.cardBg} ${color.cardBorder}`
                                        }`}
                                >
                                    {isActive && (
                                        <div className={`w-3 h-3 rounded-full ${color.dot} animate-pulse ml-auto`}></div>
                                    )}

                                    <h3 className={`text-xl font-bold mb-2 ${color.text}`}>
                                        {card.title.split(' ')[0]}
                                    </h3>
                                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                                        {card.desc}
                                    </p>

                                    <div className={`pt-4 border-t ${color.cardBorder}`}>
                                        <div className={`text-xs font-medium mb-1 ${color.text}`}>
                                            Quick Stats:
                                        </div>
                                        <div className={`text-xl font-bold ${color.text}`}>
                                            {card.stats[0].value}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Content Area */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
                    {/* Content Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    {selectedCard.title}
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    {selectedCard.subtitle}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 md:p-8">
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Left Content - Overview */}
                            <div className="lg:col-span-2">
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Overview</h3>
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="text-gray-700 leading-relaxed text-justify whitespace-pre-line overview-content">
                                            {renderOverview(selectedCard.overview)}
                                        </div>
                                    </div>
                                </div>

                                {/* Project Components for BWSIMP */}
                                {selectedCard.title === "BWSIMP Overview" && (
                                    <div className="mt-8">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Project Components</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {projectComponents.map((comp, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-white rounded-lg p-5 border border-gray-200 hover:border-blue-200 transition-colors shadow-sm"
                                                >
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className="text-2xl">{comp.icon}</span>
                                                        <h4 className="font-bold text-gray-900">{comp.title}</h4>
                                                    </div>

                                                    <p className="text-sm text-gray-600 text-justify whitespace-pre-line">
                                                        {expandedComponent === index
                                                            ? comp.desc
                                                            : getShortText(comp.desc)}
                                                    </p>

                                                    {comp.desc.length > 220 && (
                                                        <button
                                                            onClick={() => toggleReadMore(index)}
                                                            className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                                                        >
                                                            {expandedComponent === index ? "Read Less ▲" : "Read More ▼"}
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Sidebar - Department Info */}
                            <div className="lg:col-span-1">
                                <div className={`${colorClasses[selectedCard.color as keyof typeof colorClasses].bg} rounded-xl border ${colorClasses[selectedCard.color as keyof typeof colorClasses].border} p-6 sticky top-6`}>
                                    <h4 className="font-bold text-gray-900 mb-6 text-lg">Key Information</h4>

                                    <div className="space-y-5 mb-6">
                                        {selectedCard.stats.map((stat, index) => (
                                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-300 last:border-0">
                                                <span className="text-sm text-gray-700 font-medium">{stat.label}</span>
                                                <span className={`font-semibold text-right ${colorClasses[selectedCard.color as keyof typeof colorClasses].text}`}>
                                                    {stat.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add CSS for better HTML rendering */}
            <style jsx>{`
                .overview-content :global(strong) {
                    font-weight: bold;
                }
                .overview-content :global(br) {
                    display: block;
                    margin-bottom: 0.5rem;
                }
            `}</style>
        </section>
    );
}