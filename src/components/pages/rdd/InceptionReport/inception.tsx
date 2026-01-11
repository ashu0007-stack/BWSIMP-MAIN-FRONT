// components/MGNREGAInspectionForm.tsx
'use client';

import React, { useState } from 'react';
import { FileText, Building2, MapPin, Ruler, CheckSquare, AlertTriangle, Camera, PenTool, Users } from 'lucide-react';

interface PhysicalStatus {
  totalTargetLength: string;
  totalLengthCompleted: string;
  proposedBedWidth: string;
  actualTopWidth: string;
  actualDepth: string;
  actualBedWidthIfChanged: string;
  actualTopWidthIfChanged: string;
  actualDepthIfChanged: string;
  liningType: 'Earthen' | 'Brick' | 'C.C Lining' | '';
  structures: string;
}

interface PhysicalStatusPartB {
  photographsTaken: boolean | null;
  geoTaggedPhotosUploaded: boolean | null;
  measurementBookUpdated: boolean | null;
}

interface QualityAssessment {
  qualityOfEarthwork: 'Good' | 'Satisfactory' | 'Poor' | '';
  qualityOfLiningMaterials: boolean | null;
  properCompaction: boolean | null;
  properSlope: boolean | null;
  waterFlowTested: boolean | null;
}

interface NonConformanceReport {
  dateOfInspection: string;
  detailOfObservation: string;
  remedialMeasures: string;
  actionDate: string;
  detailOfActionTaken: string;
  observationOfOfficials: string;
  status: 'Pending' | 'Closed' | '';
}

interface FormData {
  rfiNo: string;
  date: string;
  district: string;
  block: string;
  gramPanchayat: string;
  workName: string;
  workId: string;
  category: string;
  estimatedCost: string;
  sanctionDate: string;
  dateOfCommencement: string;
  executingAgency: string;
  fieldChannelOfftakeName: string;
  chainageOfOutlet: string;
  physicalProgress: string;
  financialProgress: string;
  workStarted: boolean | null;
  physicalStatus: PhysicalStatus;
  physicalStatusPartB: PhysicalStatusPartB;
  qualityAssessment: QualityAssessment;
  nonConformanceReports: NonConformanceReport[];
  inspectionOfficial1Name: string;
  inspectionOfficial1Signature: string;
  inspectionOfficial1Date: string;
  inspectionOfficial2Name: string;
  inspectionOfficial2Signature: string;
  inspectionOfficial2Date: string;
  tpiaOfficialName: string;
  tpiaOfficialSignature: string;
  tpiaOfficialDate: string;
  gramPanchayatRepName: string;
  gramPanchayatRepSignature: string;
  gramPanchayatRepDate: string;
  villageWardRepName: string;
  villageWardRepSignature: string;
  villageWardRepDate: string;
  otherRepName: string;
  otherRepSignature: string;
  otherRepDate: string;
  geoTaggedPhotos: File[];
}

const InceptionReport: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    rfiNo: '',
    date: '',
    district: '',
    block: '',
    gramPanchayat: '',
    workName: 'Construction of Field Channel',
    workId: '',
    category: 'Natural Resource Management (NRM) / Irrigation & Flood Control',
    estimatedCost: '',
    sanctionDate: '',
    dateOfCommencement: '',
    executingAgency: '',
    fieldChannelOfftakeName: '',
    chainageOfOutlet: '',
    physicalProgress: '',
    financialProgress: '',
    workStarted: null,
    physicalStatus: {
      totalTargetLength: '',
      totalLengthCompleted: '',
      proposedBedWidth: '',
      actualTopWidth: '',
      actualDepth: '',
      actualBedWidthIfChanged: '',
      actualTopWidthIfChanged: '',
      actualDepthIfChanged: '',
      liningType: '',
      structures: ''
    },
    physicalStatusPartB: {
      photographsTaken: null,
      geoTaggedPhotosUploaded: null,
      measurementBookUpdated: null
    },
    qualityAssessment: {
      qualityOfEarthwork: '',
      qualityOfLiningMaterials: null,
      properCompaction: null,
      properSlope: null,
      waterFlowTested: null
    },
    nonConformanceReports: Array(4).fill({
      dateOfInspection: '',
      detailOfObservation: '',
      remedialMeasures: '',
      actionDate: '',
      detailOfActionTaken: '',
      observationOfOfficials: '',
      status: ''
    }),
    inspectionOfficial1Name: '',
    inspectionOfficial1Signature: '',
    inspectionOfficial1Date: '',
    inspectionOfficial2Name: '',
    inspectionOfficial2Signature: '',
    inspectionOfficial2Date: '',
    tpiaOfficialName: '',
    tpiaOfficialSignature: '',
    tpiaOfficialDate: '',
    gramPanchayatRepName: '',
    gramPanchayatRepSignature: '',
    gramPanchayatRepDate: '',
    villageWardRepName: '',
    villageWardRepSignature: '',
    villageWardRepDate: '',
    otherRepName: '',
    otherRepSignature: '',
    otherRepDate: '',
    geoTaggedPhotos: []
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'physicalStatus') {
        setFormData(prev => ({
          ...prev,
          physicalStatus: {
            ...prev.physicalStatus,
            [child]: value
          }
        }));
      } else if (parent === 'physicalStatusPartB') {
        setFormData(prev => ({
          ...prev,
          physicalStatusPartB: {
            ...prev.physicalStatusPartB,
            [child]: value === 'yes'
          }
        }));
      } else if (parent === 'qualityAssessment') {
        setFormData(prev => ({
          ...prev,
          qualityAssessment: {
            ...prev.qualityAssessment,
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNonConformanceChange = (index: number, field: keyof NonConformanceReport, value: string) => {
    const updatedReports = [...formData.nonConformanceReports];
    updatedReports[index] = {
      ...updatedReports[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      nonConformanceReports: updatedReports
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        geoTaggedPhotos: files
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    // Add form submission logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Government Form Header */}
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden ">
        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Section 1: Basic Information */}
            <div className="mb-8 border-2 border-blue-200 rounded-lg">
              <div className="bg-blue-100 p-4 border-b-2 border-blue-200">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-700" />
                  <h2 className="text-xl font-bold text-blue-900">Section 1: Basic Information</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">RFI No. *</label>
                    <input
                      type="text"
                      name="rfiNo"
                      value={formData.rfiNo}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Inspection *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">District *</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Block *</label>
                    <input
                      type="text"
                      name="block"
                      value={formData.block}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gram Panchayat *</label>
                    <input
                      type="text"
                      name="gramPanchayat"
                      value={formData.gramPanchayat}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Work ID (NREGA Soft) *</label>
                    <input
                      type="text"
                      name="workId"
                      value={formData.workId}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Work Details */}
            <div className="mb-8 border-2 border-green-200 rounded-lg">
              <div className="bg-green-100 p-4 border-b-2 border-green-200">
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-green-700" />
                  <h2 className="text-xl font-bold text-green-900">Section 2: Work Details</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Work Name</label>
                    <div className="p-3 bg-gray-50 border-2 border-gray-300 rounded-lg">
                      <span className="font-medium">{formData.workName}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <div className="p-3 bg-gray-50 border-2 border-gray-300 rounded-lg">
                      <span className="font-medium">{formData.category}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Cost (Rs. In Lakh) *</label>
                    <input
                      type="number"
                      name="estimatedCost"
                      value={formData.estimatedCost}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sanction Date *</label>
                    <input
                      type="date"
                      name="sanctionDate"
                      value={formData.sanctionDate}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Commencement *</label>
                    <input
                      type="date"
                      name="dateOfCommencement"
                      value={formData.dateOfCommencement}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Executing Agency *</label>
                    <select
                      name="executingAgency"
                      value={formData.executingAgency}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      required
                    >
                      <option value="">Select Agency</option>
                      <option value="Gram Panchayat">Gram Panchayat</option>
                      <option value="Line Department">Line Department</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Field Channel Details */}
            <div className="mb-8 border-2 border-purple-200 rounded-lg">
              <div className="bg-purple-100 p-4 border-b-2 border-purple-200">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-purple-700" />
                  <h2 className="text-xl font-bold text-purple-900">Section 3: Field Channel Details</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name of Distributary/Sub-Distributary/Minor/Sub-Minor *</label>
                    <input
                      type="text"
                      name="fieldChannelOfftakeName"
                      value={formData.fieldChannelOfftakeName}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Chainage of Outlet (In km) *</label>
                    <input
                      type="text"
                      name="chainageOfOutlet"
                      value={formData.chainageOfOutlet}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Physical Progress (%) *</label>
                    <div className="relative">
                      <input
                        type="range"
                        name="physicalProgress"
                        value={formData.physicalProgress}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-2 py-1 rounded text-sm font-bold">
                        {formData.physicalProgress || 0}%
                      </span>
                      <input
                        type="number"
                        name="physicalProgress"
                        value={formData.physicalProgress}
                        onChange={handleInputChange}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg mt-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Financial Progress (%) *</label>
                    <div className="relative">
                      <input
                        type="range"
                        name="financialProgress"
                        value={formData.financialProgress}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-2 py-1 rounded text-sm font-bold">
                        {formData.financialProgress || 0}%
                      </span>
                      <input
                        type="number"
                        name="financialProgress"
                        value={formData.financialProgress}
                        onChange={handleInputChange}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg mt-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Work Started *</label>
                    <div className="flex gap-6">
                      <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg hover:border-purple-500 cursor-pointer flex-1">
                        <input
                          type="radio"
                          name="workStarted"
                          checked={formData.workStarted === true}
                          onChange={() => setFormData(prev => ({ ...prev, workStarted: true }))}
                          className="mr-3 h-5 w-5 text-purple-600"
                        />
                        <div>
                          <span className="font-medium">Yes</span>
                          <p className="text-sm text-gray-500">Work has commenced</p>
                        </div>
                      </label>
                      <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg hover:border-purple-500 cursor-pointer flex-1">
                        <input
                          type="radio"
                          name="workStarted"
                          checked={formData.workStarted === false}
                          onChange={() => setFormData(prev => ({ ...prev, workStarted: false }))}
                          className="mr-3 h-5 w-5 text-purple-600"
                        />
                        <div>
                          <span className="font-medium">No</span>
                          <p className="text-sm text-gray-500">Work has not started</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Physical Status (Technical Parameters) */}
            <div className="mb-8 border-2 border-amber-200 rounded-lg">
              <div className="bg-amber-100 p-4 border-b-2 border-amber-200">
                <div className="flex items-center gap-3">
                  <Ruler className="w-6 h-6 text-amber-700" />
                  <h2 className="text-xl font-bold text-amber-900">Section 4: Physical Status (Technical Parameters)</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total/Target Length (In m) *</label>
                    <input
                      type="number"
                      name="physicalStatus.totalTargetLength"
                      value={formData.physicalStatus.totalTargetLength}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Length Completed/Achieved (In m) *</label>
                    <input
                      type="number"
                      name="physicalStatus.totalLengthCompleted"
                      value={formData.physicalStatus.totalLengthCompleted}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                      required
                    />
                  </div>
                  <div className="col-span-2 mt-4">
                    <h3 className="text-lg font-bold text-amber-800 mb-4 pb-2 border-b-2 border-amber-200">As per Design/Estimate</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Proposed Bed Width (In ft) *</label>
                        <input
                          type="number"
                          name="physicalStatus.proposedBedWidth"
                          value={formData.physicalStatus.proposedBedWidth}
                          onChange={handleInputChange}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Actual Top Width (In ft) *</label>
                        <input
                          type="number"
                          name="physicalStatus.actualTopWidth"
                          value={formData.physicalStatus.actualTopWidth}
                          onChange={handleInputChange}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Actual Depth (In ft) *</label>
                        <input
                          type="number"
                          name="physicalStatus.actualDepth"
                          value={formData.physicalStatus.actualDepth}
                          onChange={handleInputChange}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 mt-4">
                    <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                      <h3 className="text-lg font-bold text-yellow-800 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        If Parameters Changed as per Site Condition
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Actual Bed Width (In ft)</label>
                          <input
                            type="number"
                            name="physicalStatus.actualBedWidthIfChanged"
                            value={formData.physicalStatus.actualBedWidthIfChanged}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Actual Top Width (In ft)</label>
                          <input
                            type="number"
                            name="physicalStatus.actualTopWidthIfChanged"
                            value={formData.physicalStatus.actualTopWidthIfChanged}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Actual Depth (In ft)</label>
                          <input
                            type="number"
                            name="physicalStatus.actualDepthIfChanged"
                            value={formData.physicalStatus.actualDepthIfChanged}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Lining Type *</label>
                    <select
                      name="physicalStatus.liningType"
                      value={formData.physicalStatus.liningType}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Earthen">Earthen</option>
                      <option value="Brick">Brick</option>
                      <option value="C.C Lining">C.C Lining</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Structures (No./Chainage)</label>
                    <input
                      type="text"
                      name="physicalStatus.structures"
                      value={formData.physicalStatus.structures}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Documentation & Monitoring */}
            <div className="mb-8 border-2 border-teal-200 rounded-lg">
              <div className="bg-teal-100 p-4 border-b-2 border-teal-200">
                <div className="flex items-center gap-3">
                  <Camera className="w-6 h-6 text-teal-700" />
                  <h2 className="text-xl font-bold text-teal-900">Section 5: Documentation & Monitoring</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Photographs taken', name: 'photographsTaken', icon: Camera },
                    { label: 'Geo-tagged photos uploaded on NREGA Soft', name: 'geoTaggedPhotosUploaded', icon: MapPin },
                    { label: 'Measurement Book (MB) updated', name: 'measurementBookUpdated', icon: FileText }
                  ].map((item, index) => (
                    <div key={index} className="bg-white p-6 border-2 border-gray-200 rounded-lg hover:border-teal-500 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <item.icon className="w-5 h-5 text-teal-600" />
                        <label className="block text-sm font-semibold text-gray-700">{item.label}</label>
                      </div>
                      <div className="flex gap-4">
                        <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg hover:border-teal-500 cursor-pointer flex-1">
                          <input
                            type="radio"
                            name={`physicalStatusPartB.${item.name}`}
                            checked={formData.physicalStatusPartB[item.name as keyof PhysicalStatusPartB] === true}
                            onChange={() => setFormData(prev => ({
                              ...prev,
                              physicalStatusPartB: {
                                ...prev.physicalStatusPartB,
                                [item.name]: true
                              }
                            }))}
                            className="mr-2 h-4 w-4 text-teal-600"
                          />
                          <span className="font-medium">Yes</span>
                        </label>
                        <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg hover:border-teal-500 cursor-pointer flex-1">
                          <input
                            type="radio"
                            name={`physicalStatusPartB.${item.name}`}
                            checked={formData.physicalStatusPartB[item.name as keyof PhysicalStatusPartB] === false}
                            onChange={() => setFormData(prev => ({
                              ...prev,
                              physicalStatusPartB: {
                                ...prev.physicalStatusPartB,
                                [item.name]: false
                              }
                            }))}
                            className="mr-2 h-4 w-4 text-teal-600"
                          />
                          <span className="font-medium">No</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 6: Quality Assessment */}
            <div className="mb-8 border-2 border-emerald-200 rounded-lg">
              <div className="bg-emerald-100 p-4 border-b-2 border-emerald-200">
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-6 h-6 text-emerald-700" />
                  <h2 className="text-xl font-bold text-emerald-900">Section 6: Quality Assessment</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quality of Earthwork *</label>
                    <div className="grid grid-cols-3 gap-4">
                      {['Good', 'Satisfactory', 'Poor'].map((quality) => (
                        <label key={quality} className="flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg hover:border-emerald-500 cursor-pointer">
                          <input
                            type="radio"
                            name="qualityAssessment.qualityOfEarthwork"
                            value={quality}
                            checked={formData.qualityAssessment.qualityOfEarthwork === quality}
                            onChange={handleInputChange}
                            className="h-5 w-5 text-emerald-600 mb-2"
                          />
                          <span className="font-medium">{quality}</span>
                          <span className="text-xs text-gray-500 mt-1">
                            {quality === 'Good' ? 'Excellent' : quality === 'Satisfactory' ? 'Acceptable' : 'Needs Improvement'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Quality of Lining Materials (Tested at Site)', name: 'qualityOfLiningMaterials' },
                      { label: 'Proper Compaction done', name: 'properCompaction' },
                      { label: 'Proper Slope maintained', name: 'properSlope' },
                      { label: 'Water flow tested', name: 'waterFlowTested' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg">
                        <span className="font-medium text-gray-700">{item.label}</span>
                        <div className="flex gap-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`qualityAssessment.${item.name}`}
                              checked={formData.qualityAssessment[item.name as keyof QualityAssessment] === true}
                              onChange={() => setFormData(prev => ({
                                ...prev,
                                qualityAssessment: {
                                  ...prev.qualityAssessment,
                                  [item.name]: true
                                }
                              }))}
                              className="h-4 w-4 text-emerald-600"
                            />
                            <span className="ml-2">Yes</span>
                          </label>
                          <label className="flex items-center ml-4">
                            <input
                              type="radio"
                              name={`qualityAssessment.${item.name}`}
                              checked={formData.qualityAssessment[item.name as keyof QualityAssessment] === false}
                              onChange={() => setFormData(prev => ({
                                ...prev,
                                qualityAssessment: {
                                  ...prev.qualityAssessment,
                                  [item.name]: false
                                }
                              }))}
                              className="h-4 w-4 text-emerald-600"
                            />
                            <span className="ml-2">No</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 7: Non-Conformance Report */}
            <div className="mb-8 border-2 border-red-200 rounded-lg">
              <div className="bg-red-100 p-4 border-b-2 border-red-200">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-700" />
                  <h2 className="text-xl font-bold text-red-900">Section 7: Non-Conformance Report</h2>
                </div>
              </div>
              <div className="p-6">
                {formData.nonConformanceReports.map((report, index) => (
                  <div key={index} className="mb-6 p-4 border-2 border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                        NCR #{index + 1}
                      </div>
                      <h3 className="font-bold text-gray-800">Non-Conformance Report {index + 1}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Inspection</label>
                        <input
                          type="date"
                          value={report.dateOfInspection}
                          onChange={(e) => handleNonConformanceChange(index, 'dateOfInspection', e.target.value)}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Detail of Observation</label>
                        <textarea
                          value={report.detailOfObservation}
                          onChange={(e) => handleNonConformanceChange(index, 'detailOfObservation', e.target.value)}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Remedial Measures Suggested</label>
                        <textarea
                          value={report.remedialMeasures}
                          onChange={(e) => handleNonConformanceChange(index, 'remedialMeasures', e.target.value)}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Action Date</label>
                        <input
                          type="date"
                          value={report.actionDate}
                          onChange={(e) => handleNonConformanceChange(index, 'actionDate', e.target.value)}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Detail of Action Taken</label>
                        <textarea
                          value={report.detailOfActionTaken}
                          onChange={(e) => handleNonConformanceChange(index, 'detailOfActionTaken', e.target.value)}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Observation of Officials</label>
                        <textarea
                          value={report.observationOfOfficials}
                          onChange={(e) => handleNonConformanceChange(index, 'observationOfOfficials', e.target.value)}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                        <select
                          value={report.status}
                          onChange={(e) => handleNonConformanceChange(index, 'status', e.target.value)}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        >
                          <option value="">Select Status</option>
                          <option value="Pending">Pending</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 8: Signatures & Approvals */}
            <div className="mb-8 border-2 border-indigo-200 rounded-lg">
              <div className="bg-indigo-100 p-4 border-b-2 border-indigo-200">
                <div className="flex items-center gap-3">
                  <PenTool className="w-6 h-6 text-indigo-700" />
                  <h2 className="text-xl font-bold text-indigo-900">Section 8: Signatures & Approvals</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: 'Inspection Official 1', prefix: 'inspectionOfficial1', role: 'District Technical Official' },
                    { title: 'Inspection Official 2', prefix: 'inspectionOfficial2', role: 'District Administration Official' },
                    { title: 'TPIA Official', prefix: 'tpiaOfficial', role: 'Third Party Inspection Agency' },
                    { title: 'Gram Panchayat Representative', prefix: 'gramPanchayatRep', role: 'Local Governance' },
                    { title: 'Village/Ward Representative', prefix: 'villageWardRep', role: 'Community Representative' },
                    { title: 'Other Official', prefix: 'otherRep', role: 'Additional Signatory' }
                  ].map((item, index) => (
                    <div key={index} className="p-4 border-2 border-gray-200 rounded-lg bg-white">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-5 h-5 text-indigo-600" />
                        <div>
                          <h3 className="font-bold text-gray-800">{item.title}</h3>
                          <p className="text-xs text-gray-500">{item.role}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            name={`${item.prefix}Name`}
                            value={formData[`${item.prefix}Name` as keyof FormData] as string}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Signature</label>
                          <div className="h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400">Signature Area</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                          <input
                            type="date"
                            name={`${item.prefix}Date`}
                            value={formData[`${item.prefix}Date` as keyof FormData] as string}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 9: Geo-Tagged Photographs */}
            <div className="mb-8 border-2 border-cyan-200 rounded-lg">
              <div className="bg-cyan-100 p-4 border-b-2 border-cyan-200">
                <div className="flex items-center gap-3">
                  <Camera className="w-6 h-6 text-cyan-700" />
                  <h2 className="text-xl font-bold text-cyan-900">Section 9: Geo-Tagged Photographs</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-cyan-50 p-4 rounded-lg border-2 border-cyan-200 mb-4">
                  <p className="text-cyan-800 font-medium">
                    <Camera className="inline w-4 h-4 mr-2" />
                    Upload minimum 4 geo-tagged photographs showing different angles of the work
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-4">
                      <Camera className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Photo {num}</span>
                      <span className="text-xs text-gray-400">Geo-tagged</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Photos</label>
                    <div className="border-2 border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full"
                      />
                      {formData.geoTaggedPhotos.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            Selected: {formData.geoTaggedPhotos.length} photo(s)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">GPS Coordinates</label>
                    <input
                      type="text"
                      placeholder="Enter GPS coordinates manually"
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="mt-8 p-6 bg-gray-50 border-2 border-gray-200 rounded-lg">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold">Note:</span> All fields marked with * are mandatory.
                  </p>
                  <p className="text-sm text-gray-600">
                    This form is to be submitted within 7 days of inspection.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition"
                  >
                    Print Form
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 transition shadow-lg"
                  >
                    Submit Inspection Report
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InceptionReport;