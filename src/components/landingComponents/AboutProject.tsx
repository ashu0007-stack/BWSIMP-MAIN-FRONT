import { Droplets, AlertTriangle, Building, Settings, AlertCircle, Download, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';

interface ProjectComponent {
  id: string;
  title: string;
  subtitle: string;
  items: string[];
  hasPDF?: boolean;
}

export const AboutProject = () => {
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set(['component1'])); // Start with first component expanded
  
  // const pdfFiles = {
  //   component1: '/SupportingDocuments/Component-1_CRI.pdf',
  //   component2: '/SupportingDocuments/Component-2_FRR.pdf',
  //   component3: '/SupportingDocuments/Component-3_WG.pdf',
  //   component4: '/SupportingDocuments/Component-4_PM.pdf',
  // };
  
  // const handleDownloadPDF = (componentId: string, componentName: string) => {
  //   const pdfPath = pdfFiles[componentId as keyof typeof pdfFiles];
    
  //   if (!pdfPath) {
  //     console.error(`PDF not found for ${componentId}`);
  //     return;
  //   }

  //   const link = document.createElement('a');
  //   link.href = pdfPath;
  //   link.download = `${componentName.replace(/\s+/g, '_')}_Details.pdf`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  const toggleComponent = (componentId: string) => {
    const newExpanded = new Set(expandedComponents);
    if (newExpanded.has(componentId)) {
      newExpanded.delete(componentId);
    } else {
      newExpanded.add(componentId);
    }
    setExpandedComponents(newExpanded);
  };

  const toggleAll = () => {
    if (expandedComponents.size === projectComponents.length) {
      setExpandedComponents(new Set());
    } else {
      setExpandedComponents(new Set(projectComponents.map(comp => comp.id)));
    }
  };

  const projectComponents: ProjectComponent[] = [
    {
      id: 'component1',
      title: "Climate Resilient Irrigation",
      subtitle: "Component 1",
      items: [
        "1.1. Rehabilitation and modernization (R&M) of Select Irrigation Schemes.",
        "1.2. O&M models for improved irrigation services.",
        "1.3. Climate Resilient Agriculture in select irrigation scheme commands  ",
        "1.4. Training and Capacity Building",
        
      ],

    },
    {
      id: 'component2',
      title: "Flood Risk Reduction",
      subtitle: "Component 2",
      items: [
        "2.1. Strengthening of select reaches of embankments and riverbanks.",
        
        "2.2. Integrating Blue and Green infrastructure in flood/erosion management",
      ],
  
    },
    {
      id: 'component3',
      title: "Water Governance",
      subtitle: "Component 3",
      items: [
        // "3.1. Revision of Standard Operational Procedure (SOP) and Irrigation Service Delivery rules; and Establishment of a PIM Cell and PIM Units in four Project Zones",
        // "3.2. Establishment of Hydrology and Agriculture Information Support Centre (HAISC) and development of advanced tools",
        // "3.3. Strengthening of Flood Management Improvement Support Centre and the Mathematical Modelling Centre",
        // "3.4. Compilation of a new Bihar State Water Policy (SWP) and a charter for Bihar State Water Regulatory Authority (BSWRA)"
          "3.1. Institutional mechanism for improved O&M of irrigation schemes established",
          "3.2. Platform for improved irrigation and drought management established and operationalized.",
          "3.3. Advanced Flood Forecasting and Early Warning System (FF-EWS) scaled up and institutionalized",
          "3.4. Supportive policy and regulatory arrangements for sustainable water resources management developed"

      
      ],
  
    },
    {
      id: 'component4',
      title: "Project Management",
      subtitle: "Component 4",
      items: [
        "Project Management Unit (PMU) in the WRD.",
        "Project Management Technical Consultant (PMTC) to oversee and coordinate activities of the project.",
        "Project Implementing Units namely WRD,DOA & RDD.",
        "Monitoring and evaluation, including an Independent Verification Agency (IVA) and a project MIS that is integrated with the State Water Information System."
      ],
    
    },
    {
      id: 'component5',
      title: "Contingent Emergency Response",
      subtitle: "Component 5",
      items: [ 
        "Provision of immediate response to an Eligible Crisis or Emergency, as needed. This will include reallocation of loan proceeds from other components to provide immediate response (which may include recovery and reconstruction support) following an eligible crisis or emergency, as needed."
      ],
  
    }
  ];

  return (
    <section id="aboutProject" className="w-full py-12 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        {/* Project Components Section */}
        <div className="mb-12">
          <div className="border-l-4 border-blue-900 pl-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 uppercase">Project Components</h2>
                <p className="text-gray-600 mt-2">Five major components for comprehensive water resource management</p>
              </div>
              <button
                onClick={toggleAll}
                className="text-sm text-blue-900 hover:text-blue-700 font-medium px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                {expandedComponents.size === projectComponents.length ? 'Collapse All' : 'Expand All'}
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {projectComponents.map((component, index) => {
              const isExpanded = expandedComponents.has(component.id);
              
              return (
                <div key={component.id} className="border border-gray-300 bg-white shadow-sm rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md">
                  {/* Component Header - Always Visible */}
                  <button
                    onClick={() => toggleComponent(component.id)}
                    className="w-full bg-gray-50 border-b border-gray-300 px-6 py-4 hover:bg-gray-100 transition-colors text-left"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-900 text-white rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="text-left">
                          <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">
                            {component.subtitle}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 uppercase">{component.title}</h3>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* {component.hasPDF && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPDF(component.id, component.title);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-md transition-colors text-sm font-medium shadow-sm z-10"
                          >
                            <Download size={16} />
                            Supporting Documents
                          </button>
                        )} */}
                        <div className="text-blue-900">
                          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  {/* Component Content - Collapsible */}
                  {isExpanded && (
                    <div className="px-6 py-5 animate-fadeIn">
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                          <div className="w-1 h-4 bg-orange-500"></div>
                          Key Activities
                        </h4>
                        
                        <div className="grid md:grid-cols-2 gap-3">
                          {component.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-start gap-2 text-sm text-gray-700">
                              <div className="w-1.5 h-1.5 bg-blue-900 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Optional: Add a summary or additional info */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {/* <AlertCircle size={16} /> */}
                            {/* <span className="font-medium">Impact:</span> */}
                            {/* <span>This component contributes to the overall project objectives by addressing key challenges in water resource management.</span> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Information Box */}
        {/* <div className="mt-12">
          <div className="border-4 border-blue-900 bg-gradient-to-r from-orange-50 to-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-blue-900 px-6 py-4">
              <h3 className="text-xl font-bold text-white uppercase text-center">Official Project Information</h3>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="border-l-4 border-orange-500 pl-4">
                  <div className="text-xs text-gray-600 uppercase font-semibold mb-2 tracking-wide">Governing Authority</div>
                  <div className="text-lg font-bold text-gray-900">Government of Bihar</div>
                  <div className="text-sm text-gray-700">Water Resources Department</div>
                </div>
                
                <div className="border-l-4 border-blue-900 pl-4">
                  <div className="text-xs text-gray-600 uppercase font-semibold mb-2 tracking-wide">Project Timeline</div>
                  <div className="text-lg font-bold text-gray-900">2025 - 2032</div>
                  <div className="text-sm text-gray-700">7 Years Duration</div>
                </div>
                
                <div className="border-l-4 border-green-700 pl-4">
                  <div className="text-xs text-gray-600 uppercase font-semibold mb-2 tracking-wide">Total Investment</div>
                  <div className="text-lg font-bold text-gray-900">₹4,415 Crore</div>
                  <div className="text-sm text-gray-700">World Bank Assisted</div>
                </div>
                
                <div className="border-l-4 border-orange-500 pl-4">
                  <div className="text-xs text-gray-600 uppercase font-semibold mb-2 tracking-wide">Project Coverage</div>
                  <div className="text-lg font-bold text-gray-900">10 Districts</div>
                  <div className="text-sm text-gray-700">72 Blocks, 4.34M Beneficiaries</div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t-2 border-gray-200 text-center">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">For official updates and information:</span> Water Resources Department, Government of Bihar
                </p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
};