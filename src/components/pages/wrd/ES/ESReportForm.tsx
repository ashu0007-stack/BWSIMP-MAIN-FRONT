"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Calendar, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface ESReportFormProps {
  id: number;
  reportType: 'daily' | 'weekly' | 'monthly' | 'six_monthly';
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function ESReportForm({ id, reportType, onClose, onSubmit }: ESReportFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Report Info
    reporting_period_start: '',
    reporting_period_end: '',
    
    // Environmental Parameters
    environmental: {
      water_quality: { value: '', remarks: '', file: null as File | null },
      air_quality: { value: '', remarks: '', file: null as File | null },
      noise_level: { value: '', remarks: '', file: null as File | null },
      waste_management: { value: '', remarks: '', file: null as File | null }
    },
    
    // Social Parameters
    social: {
      labour_count: { male: 0, female: 0 },
      training_conducted: 0,
      grievances_received: 0,
      grievances_resolved: 0,
      ppe_compliance: 'yes',
      camp_inspection: 'satisfactory'
    },
    
    // Labour Camp
    labour_camp: {
      accommodation: 'yes',
      sanitation: 'yes',
      drinking_water: 'yes',
      first_aid: 'yes',
      issues: ''
    },
    
    // Issues & Recommendations
    key_issues: '',
    recommendations: '',
    attachments: [] as File[]
  });

  useEffect(() => {
    const today = new Date();
    const start = new Date(today);
    
    switch(reportType) {
      case 'daily':
        start.setDate(today.getDate() - 1);
        break;
      case 'weekly':
        start.setDate(today.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(today.getMonth() - 1);
        break;
      case 'six_monthly':
        start.setMonth(today.getMonth() - 6);
        break;
    }
    
    setFormData(prev => ({
      ...prev,
      reporting_period_start: start.toISOString().split('T')[0],
      reporting_period_end: today.toISOString().split('T')[0]
    }));
  }, [reportType]);

 const handleChange = (section: string, field: string, value: any) => {
  setFormData(prev => {
    const sectionKey = section as keyof typeof prev;
    const sectionValue = prev[sectionKey];
    
    // Check if sectionValue is an object before spreading
    if (sectionValue && typeof sectionValue === 'object' && !Array.isArray(sectionValue)) {
      return {
        ...prev,
        [section]: {
          ...sectionValue,
          [field]: value
        }
      };
    } else {
      // For non-object sections (like key_issues, recommendations)
      return {
        ...prev,
        [section]: value
      };
    }
  });
};

  const handleFileUpload = (section: string, field: string, files: FileList | null) => {
    if (files && files[0]) {
      handleChange(section, field, files[0]);
    }
  };

  const handleSubmit = () => {
    // Validate form
    if (!formData.reporting_period_start || !formData.reporting_period_end) {
      alert('Please select reporting period');
      return;
    }

    onSubmit(formData);
  };

  const renderStep = () => {
    switch(step) {
      case 1: return <EnvironmentalStep formData={formData} onChange={handleChange} onFileUpload={handleFileUpload} />;
      case 2: return <SocialStep formData={formData} onChange={handleChange} />;
      case 3: return <LabourCampStep formData={formData} onChange={handleChange} />;
      case 4: return <IssuesStep formData={formData} onChange={handleChange} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">
              Submit {reportType.charAt(0).toUpperCase() + reportType.slice(1)} E&S Report
            </h2>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-1" />
              {formData.reporting_period_start} to {formData.reporting_period_end}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {['Environmental', 'Social', 'Labour Camp', 'Summary'].map((label, index) => (
                <div key={label} className="text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    step > index + 1 ? 'bg-green-100 text-green-600' :
                    step === index + 1 ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {step > index + 1 ? <CheckCircle className="w-5 h-5" /> : index + 1}
                  </div>
                  <div className={`text-sm ${step === index + 1 ? 'font-semibold' : 'text-gray-500'}`}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <div className="h-1 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${(step - 1) * 33.33}%` }}
              ></div>
            </div>
          </div>

          {/* Step Content */}
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <div>
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  ← Previous
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              
              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Submit Report
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
function EnvironmentalStep({ formData, onChange, onFileUpload }: any) {
  return (
    <div>
      <h3 className="font-bold text-lg mb-4 text-green-700">Environmental Monitoring</h3>
      
      <div className="space-y-6">
        {/* Water Quality */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            💧 Water Quality (IS:10500-2012)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Test Results</label>
              <textarea
                value={formData.environmental.water_quality.value}
                onChange={(e) => onChange('environmental', 'water_quality', {
                  ...formData.environmental.water_quality,
                  value: e.target.value
                })}
                className="w-full border rounded px-3 py-2 h-24"
                placeholder="Enter test results and observations..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Upload Test Report</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => onFileUpload('environmental', 'water_quality', e.target.files)}
                  className="hidden"
                  id="water-quality-file"
                />
                <label htmlFor="water-quality-file" className="cursor-pointer text-blue-600 hover:text-blue-800">
                  Click to upload
                </label>
                <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 5MB</p>
                {formData.environmental.water_quality.file && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ {formData.environmental.water_quality.file.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Air Quality */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            💨 Air Quality Monitoring
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['PM2.5 (µg/m³)', 'PM10 (µg/m³)', 'SO2 (ppb)', 'NOx (ppb)'].map((param) => (
              <div key={param}>
                <label className="block text-sm font-medium mb-1">{param}</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Value"
                />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <textarea
              value={formData.environmental.air_quality.remarks}
              onChange={(e) => onChange('environmental', 'air_quality', {
                ...formData.environmental.air_quality,
                remarks: e.target.value
              })}
              className="w-full border rounded px-3 py-2 h-20"
              placeholder="Any observations or issues..."
            />
          </div>
        </div>

        {/* Noise Level */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            🔊 Noise Level Monitoring
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Equivalent Noise Level (dB)</label>
              <input
                type="number"
                value={formData.environmental.noise_level.value}
                onChange={(e) => onChange('environmental', 'noise_level', {
                  ...formData.environmental.noise_level,
                  value: e.target.value
                })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time of Measurement</label>
              <input
                type="time"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Waste Management */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            🗑️ Waste Management
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="waste-segregation"
                className="rounded"
              />
              <label htmlFor="waste-segregation">Waste segregation at source</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="proper-disposal"
                className="rounded"
              />
              <label htmlFor="proper-disposal">Proper disposal of construction waste</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="recycling"
                className="rounded"
              />
              <label htmlFor="recycling">Recycling of materials</label>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Waste Generated (kg)</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              placeholder="Estimated waste generated"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialStep({ formData, onChange }: any) {
  return (
    <div>
      <h3 className="font-bold text-lg mb-4 text-blue-700">Social Monitoring</h3>
      
      <div className="space-y-6">
        {/* Labour Statistics */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3">👥 Labour Statistics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Male Workers</label>
              <input
                type="number"
                value={formData.social.labour_count.male}
                onChange={(e) => onChange('social', 'labour_count', {
                  ...formData.social.labour_count,
                  male: parseInt(e.target.value) || 0
                })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Female Workers</label>
              <input
                type="number"
                value={formData.social.labour_count.female}
                onChange={(e) => onChange('social', 'labour_count', {
                  ...formData.social.labour_count,
                  female: parseInt(e.target.value) || 0
                })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Workers</label>
              <input
                type="number"
                value={formData.social.labour_count.male + formData.social.labour_count.female}
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Training & Grievances */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3">📚 Training & Grievances</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Training Sessions Conducted</label>
              <input
                type="number"
                value={formData.social.training_conducted}
                onChange={(e) => onChange('social', 'training_conducted', parseInt(e.target.value) || 0)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Participants</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                placeholder="Total participants"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Grievances Received</label>
              <input
                type="number"
                value={formData.social.grievances_received}
                onChange={(e) => onChange('social', 'grievances_received', parseInt(e.target.value) || 0)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Grievances Resolved</label>
              <input
                type="number"
                value={formData.social.grievances_resolved}
                onChange={(e) => onChange('social', 'grievances_resolved', parseInt(e.target.value) || 0)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Safety Compliance */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3">🛡️ Safety Compliance</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">PPE Compliance</label>
              <select
                value={formData.social.ppe_compliance}
                onChange={(e) => onChange('social', 'ppe_compliance', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="yes">Yes - 100% Compliance</option>
                <option value="partial">Partial - Some non-compliance</option>
                <option value="no">No - Significant non-compliance</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Safety Equipment Status</label>
              <div className="space-y-2">
                {['Hard Hats', 'Safety Shoes', 'Gloves', 'Goggles', 'High-Vis Vests'].map((item) => (
                  <div key={item} className="flex items-center justify-between">
                    <span>{item}</span>
                    <select className="border rounded px-2 py-1">
                      <option>Available</option>
                      <option>Partially Available</option>
                      <option>Not Available</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LabourCampStep({ formData, onChange }: any) {
  return (
    <div>
      <h3 className="font-bold text-lg mb-4 text-orange-700">🏠 Labour Camp Inspection</h3>
      
      <div className="space-y-6">
        {/* Facilities Checklist */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3">Facilities Checklist</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'accommodation', label: 'Separate Accommodation', icon: '🏠' },
              { key: 'sanitation', label: 'Sanitation Facilities', icon: '🚿' },
              { key: 'drinking_water', label: 'Safe Drinking Water', icon: '💧' },
              { key: 'first_aid', label: 'First Aid Facilities', icon: '🏥' }
            ].map((item) => (
              <div key={item.key} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <select
                    value={formData.labour_camp[item.key as keyof typeof formData.labour_camp]}
                    onChange={(e) => onChange('labour_camp', item.key, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="yes">Yes</option>
                    <option value="partial">Partial</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issues & Observations */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3">Issues & Observations</h4>
          <textarea
            value={formData.labour_camp.issues}
            onChange={(e) => onChange('labour_camp', 'issues', e.target.value)}
            className="w-full border rounded px-3 py-2 h-32"
            placeholder="Record any issues found during camp inspection..."
          />
        </div>

        {/* Photographic Evidence */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3">📷 Photographic Evidence</h4>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-3">Upload photos of labour camp facilities</p>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              id="camp-photos"
            />
            <label
              htmlFor="camp-photos"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              Select Photos
            </label>
            <p className="text-xs text-gray-500 mt-2">Maximum 10 photos, 5MB each</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IssuesStep({ formData, onChange }: any) {
  return (
    <div>
      <h3 className="font-bold text-lg mb-4 text-red-700">⚠️ Issues & Recommendations</h3>
      
      <div className="space-y-6">
        {/* Key Issues */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Key Issues Identified
          </h4>
          <textarea
            value={formData.key_issues}
            onChange={(e) => onChange('key_issues', e.target.value)}
            className="w-full border rounded px-3 py-2 h-32"
            placeholder="List any significant issues or non-compliances identified..."
          />
        </div>

        {/* Recommendations */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Recommendations
          </h4>
          <textarea
            value={formData.recommendations}
            onChange={(e) => onChange('recommendations', e.target.value)}
            className="w-full border rounded px-3 py-2 h-32"
            placeholder="Provide recommendations for addressing identified issues..."
          />
        </div>

        {/* Report Summary */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold mb-3">📋 Report Summary</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Reporting Period:</span>
              <span className="font-semibold">
                {formData.reporting_period_start} to {formData.reporting_period_end}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Total Workers:</span>
              <span className="font-semibold">
                {formData.social.labour_count.male + formData.social.labour_count.female}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Grievance Resolution Rate:</span>
              <span className="font-semibold">
                {formData.social.grievances_received > 0 
                  ? Math.round((formData.social.grievances_resolved / formData.social.grievances_received) * 100) 
                  : 0}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Overall Compliance Status:</span>
              <span className="font-semibold text-green-600">
                {formData.labour_camp.accommodation === 'yes' && 
                 formData.labour_camp.sanitation === 'yes' && 
                 formData.labour_camp.drinking_water === 'yes' 
                  ? 'SATISFACTORY' : 'NEEDS IMPROVEMENT'}
              </span>
            </div>
          </div>
        </div>

        {/* Final Attachments */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3">📎 Additional Attachments</h4>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">Upload any additional supporting documents</p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              multiple
              className="hidden"
              id="additional-files"
            />
            <label
              htmlFor="additional-files"
              className="inline-block px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Select Files
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}