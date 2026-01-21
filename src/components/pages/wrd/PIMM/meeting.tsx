import React, { useState, useEffect, useMemo } from 'react';
import { useMeetings, useCreateMeeting, useUpdateMeeting, useDeleteMeeting, useUpdateMeetingStatus, useDeleteDocument } from '@/hooks/wrdHooks/pim/meetingHooks';
import { downloadDocument, getMeetingById } from '@/services/api/wrdApi/pim/meetingApi';
import { useWUAs } from '@/hooks/wrdHooks/useWuaMaster';

import {
  Calendar,
  Users,
  FileText,
  DownloadIcon,
  Trash2,
  Edit3,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  Shield,
  Building,
  MapPin,
  UserCheck,
  IndianRupee,
  Wrench,
  MessageSquare,
  ArrowLeft,
  Save,
  RefreshCw,
  Upload,
  List
} from 'lucide-react';

interface FormData {
  meeting_date: string;
  agenda_topic: string;
  venue: string;
  attendance_male: string;
  attendance_female: string;
  meeting_outcome: string;
  training_feedback: string;
  water_tax_collected: string;
  water_tax_remarks: string;
  maintenance_fund_received: string;
  maintenance_fund_remarks: string;
  ofd_work_identified: string;
  communication_done: string;
  communicated_to: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_by: string;
}

interface Document {
  id: string;
  original_name: string;
  file_size: number;
}

interface Meeting {
  id: string;
  wua_id: string;
  wua_name: string;
  meeting_date: string;
  agenda_topic: string;
  venue: string;
  attendance_male: number;
  attendance_female: number;
  total_attendance: number;
  status: string;
  water_tax_collected: string;
  maintenance_fund_received: string;
  ofd_work_identified: string;
  communication_done: string;
  documents?: Document[];
  document_count?: number;
}

interface WUA {
  id: string | number;
  wua_name: string;
  wua_id: string;
}

interface MeetingTrainingProps {
  editId?: number;
  onSuccess?: () => void;
}

const MeetingTraining: React.FC<MeetingTrainingProps> = ({ editId, onSuccess }) => {
  const { data: wuas = [], isLoading: wuasLoading } = useWUAs();
  const { data: meetings = [], isLoading: meetingsLoading, refetch: refetchMeetings } = useMeetings();
  const createMeetingMutation = useCreateMeeting();
  const updateMeetingMutation = useUpdateMeeting();
  const deleteMeetingMutation = useDeleteMeeting();
  const updateStatusMutation = useUpdateMeetingStatus();
  const deleteDocumentMutation = useDeleteDocument();

  const [selectedWua, setSelectedWua] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    meeting_date: '',
    agenda_topic: '',
    venue: '',
    attendance_male: '',
    attendance_female: '',
    meeting_outcome: '',
    training_feedback: '',
    water_tax_collected: 'No',
    water_tax_remarks: '',
    maintenance_fund_received: 'No',
    maintenance_fund_remarks: '',
    ofd_work_identified: 'No',
    communication_done: 'No',
    communicated_to: '',
    status: 'draft',
    created_by: 'Admin'
  });

  const [documents, setDocuments] = useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<Document[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [totalAttendance, setTotalAttendance] = useState<number>(0);
  const [showForm, setShowForm] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: '', direction: 'asc' });

  // Calculate total attendance
  useEffect(() => {
    const male = parseInt(formData.attendance_male) || 0;
    const female = parseInt(formData.attendance_female) || 0;
    setTotalAttendance(male + female);
  }, [formData.attendance_male, formData.attendance_female]);

  // Enhanced filtering and sorting with useMemo
  const filteredMeetings = useMemo(() => {
    let filtered = meetings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((meeting: Meeting) =>
        meeting.wua_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.agenda_topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.venue?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((meeting: Meeting) => meeting.status === statusFilter);
    }

    // Date filter
    if (dateFilter.from && dateFilter.to) {
      const fromDate = new Date(dateFilter.from);
      const toDate = new Date(dateFilter.to);
      filtered = filtered.filter((meeting: Meeting) => {
        const meetingDate = new Date(meeting.meeting_date);
        return meetingDate >= fromDate && meetingDate <= toDate;
      });
    }

    // Sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Meeting];
        const bValue = b[sortConfig.key as keyof Meeting];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [meetings, searchTerm, statusFilter, dateFilter, sortConfig]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter(file => {
      const validTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'];
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!fileExt || !validTypes.includes(fileExt)) {
        alert(`Invalid file type: ${file.name}. Only JPG, PNG, PDF, DOC, DOCX files are allowed.`);
        return false;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert(`File too large: ${file.name}. Maximum size is 10MB.`);
        return false;
      }
      
      return true;
    });
    
    setDocuments(prev => [...prev, ...validFiles]);
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingDocument = async (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocumentMutation.mutate(documentId, {
        onSuccess: () => {
          setExistingDocuments(prev => prev.filter(doc => doc.id !== documentId));
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWua || !formData.meeting_date || !formData.agenda_topic) {
      alert('Please fill all required fields: WUA, Date, and Agenda/Topic');
      return;
    }

    const submitData = new FormData();
    
    // Properly append wua_id
    submitData.append('wua_id', selectedWua);
    
    // Append all form data
    Object.keys(formData).forEach(key => {
      const value = formData[key as keyof FormData];
      submitData.append(key, value.toString());
    });
    
    // Append documents
    documents.forEach(file => {
      submitData.append('documents', file);
    });

    try {
      if (editingId) {
        await updateMeetingMutation.mutateAsync({ id: editingId, data: submitData });
      } else {
        await createMeetingMutation.mutateAsync(submitData);
      }
      resetForm();
      refetchMeetings();
      setActiveTab('list');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const editMeeting = async (id: string) => {
    try {
      const meeting = await getMeetingById(id);
      let formattedDate = '';
      if (meeting.meeting_date) {
        formattedDate = meeting.meeting_date;
        if (formattedDate.includes('T')) {
          formattedDate = formattedDate.split('T')[0];
        }
      }
      
      setSelectedWua(meeting.wua_id);
      setFormData({
        meeting_date: formattedDate,
        agenda_topic: meeting.agenda_topic || '',
        venue: meeting.venue || '',
        attendance_male: meeting.attendance_male?.toString() || '',
        attendance_female: meeting.attendance_female?.toString() || '',
        meeting_outcome: meeting.meeting_outcome || '',
        training_feedback: meeting.training_feedback || '',
        water_tax_collected: meeting.water_tax_collected || 'No',
        water_tax_remarks: meeting.water_tax_remarks || '',
        maintenance_fund_received: meeting.maintenance_fund_received || 'No',
        maintenance_fund_remarks: meeting.maintenance_fund_remarks || '',
        ofd_work_identified: meeting.ofd_work_identified || 'No',
        communication_done: meeting.communication_done || 'No',
        communicated_to: meeting.communicated_to || '',
        status: meeting.status || 'draft',
        created_by: meeting.created_by || 'Admin'
      });
      
      setExistingDocuments(meeting.documents || []);
      setEditingId(id);
      setActiveTab('form');
    } catch (error: any) {
      console.error('Error fetching meeting:', error);
      alert('Error loading meeting data');
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      deleteMeetingMutation.mutate(id);
    }
  };

  const handleDownloadDocument = async (documentId: string, originalName: string) => {
    try {
      const blob = await downloadDocument(documentId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading document:', error);
      alert('Error downloading document: ' + error.message);
    }
  };

  const resetForm = () => {
    setSelectedWua('');
    setFormData({
      meeting_date: '',
      agenda_topic: '',
      venue: '',
      attendance_male: '',
      attendance_female: '',
      meeting_outcome: '',
      training_feedback: '',
      water_tax_collected: 'No',
      water_tax_remarks: '',
      maintenance_fund_received: 'No',
      maintenance_fund_remarks: '',
      ofd_work_identified: 'No',
      communication_done: 'No',
      communicated_to: '',
      status: 'draft',
      created_by: 'Admin'
    });
    setDocuments([]);
    setExistingDocuments([]);
    setEditingId(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleStatusUpdate = async (meetingId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: meetingId, status: newStatus });
  };

  const exportToExcel = () => {
    try {
      const headers = ['WUA Name', 'Date', 'Agenda/Topic', 'Venue', 'Male', 'Female', 'Total Attendance', 'Status', 'Water Tax', 'Maintenance Fund'];
      const csvData = filteredMeetings.map((meeting: Meeting) => [
        meeting.wua_name || '',
        new Date(meeting.meeting_date).toLocaleDateString('en-IN'),
        meeting.agenda_topic || '',
        meeting.venue || '',
        meeting.attendance_male || 0,
        meeting.attendance_female || 0,
        meeting.total_attendance || 0,
        meeting.status || '',
        meeting.water_tax_collected || 'No',
        meeting.maintenance_fund_received || 'No'
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map((field: any) => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meetings_data_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error exporting data:', error);
      alert('Error exporting data');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border border-green-300';
      case 'submitted': return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'rejected': return 'bg-red-100 text-red-800 border border-red-300';
      default: return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    }
  };

  const inputClass = "w-full px-4 py-2 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]";
  const sectionClass = "bg-gray-50 border border-gray-300 rounded p-6";
  const sectionHeaderClass = "text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2";

  if (!showForm) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-[#003087] text-white border-b-4 border-[#FF9933]">
          <div className="max-w-[1800px] mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Meeting & Training Management</h1>
                <p className="text-blue-200 text-sm">The meeting and training management form is currently closed</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-[1800px] mx-auto w-full px-4 py-6">
          <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden text-center p-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center border border-blue-300">
              <Calendar className="w-10 h-10 text-[#003087]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Meeting/Training Form Closed</h3>
            <p className="text-gray-600 mb-6">The meeting and training management form is currently closed.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#003087] text-white px-8 py-3 rounded hover:bg-[#00205b] transition-colors font-medium"
            >
              Reopen Meeting Form
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Government Header */}
      <header className="bg-[#003087] text-white border-b-4 border-[#FF9933]">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Meeting & Training Management</h1>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowForm(false)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Close Form
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1800px] mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-300 rounded shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Overview</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-300">
                  <div className="text-2xl font-bold text-[#003087]">{meetings.length}</div>
                  <div className="text-sm text-blue-800">Total Meetings</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-300">
                  <div className="text-2xl font-bold text-green-600">
                    {meetings.filter((m: Meeting) => m.status === 'approved').length}
                  </div>
                  <div className="text-sm text-green-800">Approved</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-300">
                  <div className="text-2xl font-bold text-purple-600">
                    {meetings.reduce((sum: number, meeting: Meeting) => sum + (meeting.total_attendance || 0), 0)}
                  </div>
                  <div className="text-sm text-purple-800">Total Attendance</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-300">
                  <div className="text-2xl font-bold text-orange-600">
                    {meetings.filter((m: Meeting) => (m.document_count || 0) > 0).length}
                  </div>
                  <div className="text-sm text-orange-800">With Documents</div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="mt-6 border-t border-gray-300 pt-6">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg border border-gray-300">
                  <button
                    onClick={() => setActiveTab('form')}
                    className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      activeTab === 'form'
                        ? 'bg-white text-[#003087] shadow-sm border border-gray-300'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Form
                  </button>
                  <button
                    onClick={() => setActiveTab('list')}
                    className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      activeTab === 'list'
                        ? 'bg-white text-[#003087] shadow-sm border border-gray-300'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    List
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'form' ? (
              /* Form View */
              <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-300 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#003087]" />
                      {editingId ? 'Edit Meeting/Training' : 'Create New Meeting/Training'}
                    </h2>
                    <button
                      onClick={() => setActiveTab('list')}
                      className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View List
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <form onSubmit={handleSubmit}>
                    {/* Basic Information */}
                    <div className={sectionClass}>
                      <h3 className={sectionHeaderClass}>
                        <Building className="w-5 h-5 text-[#003087]" />
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select WUA *
                          </label>
                          <select 
                            value={selectedWua} 
                            onChange={(e) => setSelectedWua(e.target.value)}
                            className={`${inputClass} ${wuasLoading ? 'bg-gray-100' : ''}`}
                            required
                            disabled={wuasLoading}
                          >
                            <option value="">Select WUA</option>
                            {wuas.map((wua: WUA) => (
                              <option key={String(wua.id)} value={String(wua.id)}>
                                {wua.wua_name} ({wua.wua_id})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Meeting Date *
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="date"
                              name="meeting_date"
                              value={formData.meeting_date}
                              onChange={handleInputChange}
                              className={`${inputClass} pl-10`}
                              required
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Agenda/Topic *
                          </label>
                          <input
                            type="text"
                            name="agenda_topic"
                            placeholder="Enter meeting agenda or training topic"
                            value={formData.agenda_topic}
                            onChange={handleInputChange}
                            className={inputClass}
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Venue
                          </label>
                          <input
                            type="text"
                            name="venue"
                            placeholder="Enter meeting venue"
                            value={formData.venue}
                            onChange={handleInputChange}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Documents Upload */}
                    <div className={sectionClass}>
                      <h3 className={sectionHeaderClass}>
                        <Upload className="w-5 h-5 text-[#003087]" />
                        Documents Upload
                      </h3>
                      <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-all duration-200">
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Meeting Documents
                          </label>
                          <input
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            Supported formats: JPG, PNG, PDF, DOC, DOCX (Max 10MB each)
                          </p>
                        </div>
                        
                        {/* New Documents Preview */}
                        {documents.length > 0 && (
                          <div className="mt-4">
                            <p className="font-medium text-gray-700 mb-2 text-sm">Files to upload:</p>
                            <div className="space-y-2">
                              {documents.map((file, index) => (
                                <div key={index} className="flex justify-between items-center bg-white p-3 rounded border border-gray-300">
                                  <span className="text-sm truncate max-w-xs">{file.name} ({formatFileSize(file.size)})</span>
                                  <button
                                    type="button"
                                    onClick={() => removeDocument(index)}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Existing Documents */}
                        {existingDocuments.length > 0 && (
                          <div className="mt-4">
                            <p className="font-medium text-gray-700 mb-2 text-sm">Existing documents:</p>
                            <div className="space-y-2">
                              {existingDocuments.map((doc) => (
                                <div key={doc.id} className="flex justify-between items-center bg-blue-50 p-3 rounded border border-blue-300">
                                  <span className="text-sm truncate max-w-xs">{doc.original_name} ({formatFileSize(doc.file_size)})</span>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadDocument(doc.id, doc.original_name)}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                      title="Download"
                                    >
                                      <DownloadIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeExistingDocument(doc.id)}
                                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Attendance Details */}
                    <div className={sectionClass}>
                      <h3 className={sectionHeaderClass}>
                        <Users className="w-5 h-5 text-[#003087]" />
                        Attendance Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Male Attendance
                          </label>
                          <input
                            type="number"
                            name="attendance_male"
                            placeholder="Number of males"
                            value={formData.attendance_male}
                            onChange={handleInputChange}
                            min="0"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Female Attendance
                          </label>
                          <input
                            type="number"
                            name="attendance_female"
                            placeholder="Number of females"
                            value={formData.attendance_female}
                            onChange={handleInputChange}
                            min="0"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Attendance
                          </label>
                          <input
                            type="number"
                            value={totalAttendance}
                            disabled
                            className={`${inputClass} bg-gray-100 text-gray-600`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Meeting Outcome & Training Feedback */}
                    <div className={sectionClass}>
                      <h3 className={sectionHeaderClass}>
                        <FileText className="w-5 h-5 text-[#003087]" />
                        Meeting Outcome & Training Feedback
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Meeting Outcome (Minutes)
                          </label>
                          <textarea
                            name="meeting_outcome"
                            placeholder="Enter meeting outcomes and minutes"
                            value={formData.meeting_outcome}
                            onChange={handleInputChange}
                            rows={4}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Training Feedback
                          </label>
                          <textarea
                            name="training_feedback"
                            placeholder="Enter training feedback and observations"
                            value={formData.training_feedback}
                            onChange={handleInputChange}
                            rows={4}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Financial Details */}
                    <div className={sectionClass}>
                      <h3 className={sectionHeaderClass}>
                        <IndianRupee className="w-5 h-5 text-[#003087]" />
                        Financial Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Water Tax Collected
                          </label>
                          <select
                            name="water_tax_collected"
                            value={formData.water_tax_collected}
                            onChange={handleInputChange}
                            className={inputClass}
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Water Tax Remarks
                          </label>
                          <input
                            type="text"
                            name="water_tax_remarks"
                            placeholder="Enter remarks about water tax collection"
                            value={formData.water_tax_remarks}
                            onChange={handleInputChange}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Maintenance Fund Received
                          </label>
                          <select
                            name="maintenance_fund_received"
                            value={formData.maintenance_fund_received}
                            onChange={handleInputChange}
                            className={inputClass}
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Maintenance Fund Remarks
                          </label>
                          <input
                            type="text"
                            name="maintenance_fund_remarks"
                            placeholder="Enter remarks about maintenance fund"
                            value={formData.maintenance_fund_remarks}
                            onChange={handleInputChange}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Work & Communication */}
                    <div className={sectionClass}>
                      <h3 className={sectionHeaderClass}>
                        <Wrench className="w-5 h-5 text-[#003087]" />
                        Work & Communication
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            OFD Work Identified
                          </label>
                          <select
                            name="ofd_work_identified"
                            value={formData.ofd_work_identified}
                            onChange={handleInputChange}
                            className={inputClass}
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Communication Done
                          </label>
                          <select
                            name="communication_done"
                            value={formData.communication_done}
                            onChange={handleInputChange}
                            className={inputClass}
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Communicated To
                          </label>
                          <input
                            type="text"
                            name="communicated_to"
                            placeholder="WRD/RDD/DM/Mukhia"
                            value={formData.communicated_to}
                            onChange={handleInputChange}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status Field */}
                    <div className={sectionClass}>
                      <h3 className={sectionHeaderClass}>
                        <CheckCircle className="w-5 h-5 text-[#003087]" />
                        Status
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Meeting Status
                          </label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className={`${inputClass} ${
                              formData.status === 'draft' ? 'bg-yellow-50 border-yellow-400' : 
                              formData.status === 'submitted' ? 'bg-blue-50 border-blue-400' : 
                              formData.status === 'approved' ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
                            }`}
                          >
                            <option value="draft">Draft</option>
                            <option value="submitted">Submitted</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-300">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-3 border border-gray-400 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={createMeetingMutation.isPending || updateMeetingMutation.isPending}
                        className="flex items-center gap-2 px-8 py-3 bg-[#003087] text-white rounded hover:bg-[#00205b] disabled:opacity-50 transition-colors font-medium"
                      >
                        {createMeetingMutation.isPending || updateMeetingMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>{editingId ? 'Updating...' : 'Creating...'}</span>
                          </>
                        ) : editingId ? (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Update Meeting</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Create Meeting</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              /* List View */
              <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-300 bg-gray-50">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <List className="w-5 h-5 text-[#003087]" />
                      Meetings & Trainings List
                    </h2>
                    <div className="flex gap-3">
                      <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
                      >
                        <DownloadIcon className="w-4 h-4" />
                        Export Excel
                      </button>
                      <button
                        onClick={() => setActiveTab('form')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#003087] text-white rounded hover:bg-[#00205b] transition-colors font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        New Meeting
                      </button>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by WUA, agenda, venue..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full pl-10 pr-8 py-2 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] appearance-none"
                        >
                          <option value="">All Status</option>
                          <option value="draft">Draft</option>
                          <option value="submitted">Submitted</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          value={dateFilter.from}
                          onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          value={dateFilter.to}
                          onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meetings List */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-300 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('wua_name')}
                        >
                          <div className="flex items-center space-x-1">
                            <Building className="w-3 h-3" />
                            <span>WUA</span>
                            {sortConfig.key === 'wua_name' && (
                              <span className="text-xs">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-300 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('meeting_date')}
                        >
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Date</span>
                            {sortConfig.key === 'meeting_date' && (
                              <span className="text-xs">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-300">
                          Agenda
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-300 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('total_attendance')}
                        >
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>Attendance</span>
                            {sortConfig.key === 'total_attendance' && (
                              <span className="text-xs">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-300">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-300">
                      {filteredMeetings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            {meetingsLoading ? (
                              <div className="flex justify-center">
                                <div className="w-8 h-8 border-2 border-[#003087] border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            ) : (
                              <div className="text-center py-6">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">No meetings found</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredMeetings.map((meeting: Meeting) => (
                          <tr key={meeting.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{meeting.wua_name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(meeting.meeting_date).toLocaleDateString('en-IN')}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div 
                                className="text-sm text-gray-900 font-medium" 
                                title={meeting.agenda_topic || ''}
                              >
                                {meeting.agenda_topic}
                              </div>
                              <div className="text-sm text-gray-500">{meeting.venue}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-medium">
                                {meeting.total_attendance || 0} total
                              </div>
                              <div className="text-xs text-gray-500">
                                M: {meeting.attendance_male || 0} | F: {meeting.attendance_female || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={meeting.status}
                                onChange={(e) => handleStatusUpdate(meeting.id, e.target.value)}
                                className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(meeting.status)} focus:ring-2 focus:ring-[#003087]`}
                              >
                                <option value="draft">Draft</option>
                                <option value="submitted">Submitted</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => editMeeting(meeting.id)}
                                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                  title="Edit"
                                >
                                  <Edit3 className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteMeeting(meeting.id)}
                                  className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-300 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-semibold">{filteredMeetings.length}</span> of{' '}
                      <span className="font-semibold">{meetings.length}</span> meetings
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MeetingTraining;