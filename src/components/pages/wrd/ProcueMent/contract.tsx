import { JSX, useEffect, useMemo, useState } from "react";
import { ChevronDown, Building, User, MapPin, Phone, Mail, Eye, Printer,Calendar, Clock, BadgeCheck, IndianRupee, Plus, X, Trees, Users, FileText, ShieldCheck, Edit, History, Filter, Search, Layers } from "lucide-react";
import { useTenderByWorkId } from "@/hooks/wrdHooks/useTenders";
import { useContracts, useCreateContract, useWorkTender, useContractById, useUpdateContract } from "@/hooks/wrdHooks/useContracts";
import ContractHistory from "@/components/pages/wrd/ProcueMent/ContractHistory";

interface KeyPersonnel {
  id: string;
  role: string;
  persons: Array<{
    name: string;
    contact: string;
  }>;
}

interface EquipmentItem {
  type: string;
  quantity_bid: string;
  quantity_site: string;
}

interface SocialData {
  id?: string;
  sn: string;
  particular: string;
  other_particular?: string;
  obtained: 'yes' | 'no';
  issue_date: string;
  valid_up_to: string;
  document: string;
  remarks: string;
}

interface EnvironmentalData {
  id?: string;
  sno: string;
  clearance_authorization: string;
  other_clearance?: string;
  obtained: 'yes' | 'no';
  issue_date: string;
  valid_up_to: string;
  document: string;
  remarks: string;
}

interface WorkMethodologyData {
  id?: string;
  sn: string;
  document_name: string;
  other_document?: string;
  contractor_submission_date: string;
  approval_date: string;
  review_status: string;
  resubmission_date: string;
  document: string;
  remark: string;
}

interface FormData {
  tenderRefNo: string;
  work_id: string;
  agreement_no: string;
  agency_name: string;
  authorized: string;
  address: string;
  phone: string;
  alternate_phone: string;
  email: string;
  alternate_email: string;
  contract_amount: string;
  start_date: string;
  stipulated_date: string;
  actual_date_of_completion: string | null;
  inserted_by?: string;
  division_id?: number;
  updated_by?: string;
  key_personnel: KeyPersonnel[];
  equipment: EquipmentItem[];
  social_data: SocialData[];
  environmental_data: EnvironmentalData[];
  work_methodology_data: WorkMethodologyData[];

  // Social safeguard files
  labour_license_file?: File | null;
  migrant_labour_file?: File | null;
  group_insurance_file?: File | null;
  bocw_file?: File | null;
  public_liability_file?: File | null;

  // Environmental clearance files
  hot_mix_plant_file?: File | null;
  hazardous_material_file?: File | null;
  sand_mining_file?: File | null;
  boulders_aggregates_file?: File | null;
  borrow_area_file?: File | null;

  // Work methodology files
  contractor_plan_file?: File | null;
  ohs_plan_file?: File | null;
  community_health_file?: File | null;
  boundary_marking_file?: File | null;
}

interface FormErrors {
  [key: string]: string;
}

interface Contract {
  id: string;
  tenderrefno: string;
  work_name: string;
  contractor_name: string;
  contract_awarded_amount: string;
  work_commencement_date: string;
  work_stipulated_date: string;
  actual_date_of_completion?: string;
  environmental_count: number;
  social_count: number;
  methodology_count: number;
  work_id?: string;
  nameofauthrizeperson?: string;
  agency_address?: string;
  mobileno?: string;
  alternate_mobile?: string;
  email?: string;
  alternate_email?: string;
  start_date_formatted?: string;
  completion_date_formatted?: string;
  agreement_no?: string;
  // Form fields
  agency_name?: string;
  authorized?: string;
  address?: string;
  phone?: string;
  alternate_phone?: string;
  contract_amount?: string;
  start_date?: string;
  stipulated_date?: string;
  key_personnel?: KeyPersonnel[];
  equipment?: EquipmentItem[];
  social_data?: SocialData[];
  environmental_data?: EnvironmentalData[];
  work_methodology_data?: WorkMethodologyData[];
}

const PERSONNEL_OPTIONS = [
  {
    value: "project_manager",
    label: "Project Manager",
    singlePerson: true,
    fields: ["name", "contact"]
  },
  {
    value: "safety_specialist",
    label: "Safety Specialist",
    singlePerson: true,
    fields: ["name"]
  },
  {
    value: "social_specialist",
    label: "Social Specialist",
    singlePerson: true,
    fields: ["name"]
  },
  {
    value: "environment_specialist",
    label: "Environment Specialist",
    singlePerson: true,
    fields: ["name"]
  },
  {
    value: "site_engineer",
    label: "Site Engineer",
    singlePerson: false,
    fields: ["name"]
  },
  {
    value: "quantity_surveyor",
    label: "Quantity Surveyor",
    singlePerson: false,
    fields: ["name"]
  },
  {
    value: "survey_engineer",
    label: "Survey Engineer",
    singlePerson: false,
    fields: ["name"]
  },
  {
    value: "site_supervisor",
    label: "Site Supervisor",
    singlePerson: false,
    fields: ["name"]
  },
  {
    value: "qc_engineer",
    label: "QC Engineer",
    singlePerson: false,
    fields: ["name"]
  },
  {
    value: "lab_technician",
    label: "Lab Technician",
    singlePerson: false,
    fields: ["name"]
  },
  {
    value: "finance_manager",
    label: "Finance Manager",
    singlePerson: false,
    fields: ["name"]
  },
  {
    value: "admin_officer",
    label: "Admin Officer",
    singlePerson: false,
    fields: ["name"]
  },
];

const DateDisplay = ({ dateString, format = 'DD-MM-YYYY' }: { dateString: string, format?: string }) => {
  if (!dateString) return <span className="text-gray-400">N/A</span>;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return <span className="text-red-500">Invalid Date</span>;
    }

    if (format === 'YYYY-MM-DD') {
      return <span>{date.toISOString().split('T')[0]}</span>;
    } else {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return <span>{`${day}-${month}-${year}`}</span>;
    }
  } catch (error) {
    return <span className="text-gray-400">Format Error</span>;
  }
};

const EQUIPMENT_OPTIONS = [
  { value: "tipper", label: "Tipper" },
  { value: "tractor", label: "Tractor" },
  { value: "excavator", label: "Excavator/Front End Loader" },
  { value: "concrete_plant", label: "Concrete Batching and Mixing Plant" },
  { value: "vibratory_roller", label: "Vibratory Road Roller" },
  { value: "smooth_roller", label: "Smooth Wheeled Roller" },
  { value: "sheep_foot_roller", label: "Sheep Foot Roller" },
  { value: "concrete_paver", label: "Fully Automatic Concrete Canal Paver" },
  { value: "paver_finisher", label: "Paver Finisher with electronics censor" },
  { value: "motor_grader", label: "Motor Grader" },
  { value: "concrete_mixer", label: "Concrete Mixer with integral weigh batching" },
  { value: "hot_mix_plant", label: "Fully computerized hot mix plant" },
  { value: "wet_mix_plant", label: "Wet mix plant" },
  { value: "transit_mixer", label: "Transit mixer" },
  { value: "dozer", label: "Dozer" },
];

// Social Safeguard Options
const SOCIAL_PARTICULARS = [
  "Labour license",
  "Migrant Labour Registration",
  "Group Insurance",
  "BOCW",
  "Public Liability (Act) Insurance Policy"
];

// Environmental Clearance Options
const ENVIRONMENTAL_CLEARANCES = [
  "Hot mix plants, Wet Mix Macadam plants, Crushers, Batching Plants, DG sets",
  "Storage, handling and transport of hazardous materials and waste",
  "Permission for sand mining from river bed",
  "Sourcing of Boulders and aggregates ( EC/ CTE/ CTO) MoEFCC notification dated 02.08.2024 (S.O 3099)",
  "Borrow Area"
];

// Work Methodology Documents
const WORK_METHODOLOGY_DOCUMENTS = [
  "Contractor Environment Health Safety Management Plan",
  "Occupational Health and Safety Plan (OHS Plan) including Hazard Identification and Risk Assessment (HIRA)",
  "Community Health and Safety (CHS) Plan with a Traffic management plan",
  "Boundary marking and protection strategy plan"
];

// Review Status Options
const REVIEW_STATUS_OPTIONS = [
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-800" },
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
  { value: "under_review", label: "Under Review", color: "bg-blue-100 text-blue-800" }
];

// ✅ Contracts List Component
function ContractsList({
  contracts,
  onViewContract,
  onAddNew,
  user
}: {
  contracts: Contract[];
  onViewContract: (contract: Contract) => void;
  onAddNew: () => void;
  user: any;
}) {
  return (
   <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
         <div className="flex items-center gap-4">
 <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <Layers className="w-8 h-8 text-white" />
              </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Contract Management</h1>
          <p className="text-gray-600 mt-2">View and manage all contractor contracts</p>
        </div>

         </div>
        

        {user.role_id === 5 && (
          <button
            onClick={onAddNew}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Contract
          </button>
        )}
      </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
         <div className="flex items-center gap-4"> 
             <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tenders by division, work, or reference..."
                    //value={searchTerm}
                    //onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>
              </div>
           </div>
         </div>
      </div>
      <div className="p-4">  </div>
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="flex items-center mb-6">
          <div className="w-2 h-8 bg-blue-500 rounded-full mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">Contractor List</h2>
        </div>
        {contracts?.length ? (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-4 text-left font-semibold">Tender Ref. No</th>
                  <th className="p-4 text-left font-semibold">Name of Work</th>
                  <th className="p-4 text-left font-semibold">Contractor Name</th>
                  <th className="p-4 text-left font-semibold">Agreement Amount (Cr.)</th>
                  <th className="p-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract: Contract, index: number) => (
                  <tr
                    key={contract.id}
                    className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}
                  >
                    <td className="p-4">{contract.tenderrefno || '-'}</td>
                    <td className="p-4">{contract.work_name || '-'}</td>
                    <td className="p-4">{contract.contractor_name || '-'}</td>
                    <td className="p-4 text-green-700 font-semibold">₹{contract.contract_awarded_amount || '0'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onViewContract(contract)}
                         title="View Details"
                          className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Building className="w-16 h-16 mx-auto opacity-50" />
            </div>
            <p className="text-gray-500 text-lg">No contracts found.</p>
            <p className="text-gray-400 mt-2">Start by creating your first contract.</p>
             {user.role_id === 5 && (
            <button
              onClick={onAddNew}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Plus className="w-5 h-5 mr-2 inline" />
              Add New Contract
            </button>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ Contractor Form Component
function ContractorFormComponent({
  initialForm,
  onCancel,
  onSubmit,
  pageMode = 'create',
  viewContractData = null,
  onEdit,
  user,
  onBackToList,
  onViewHistory
}: {
  initialForm: FormData;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
  pageMode?: 'create' | 'view' | 'edit';
  viewContractData?: Contract | null;
  onEdit?: () => void;
  onBackToList?: () => void;
  onViewHistory?: () => void;
  user: any;
}) {
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>("");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'social' | 'environmental' | 'work_methodology'>('social');

  useEffect(() => {
    console.log("🔄 ContractorFormComponent: initialForm updated", {
      pageMode,
      initialFormLengths: {
        social: initialForm.social_data?.length,
        environmental: initialForm.environmental_data?.length,
        methodology: initialForm.work_methodology_data?.length
      }
    });

    if (pageMode === 'edit' || pageMode === 'view') {
      // Deep copy to ensure state updates
      const deepCopy = JSON.parse(JSON.stringify(initialForm));
      setFormData(deepCopy);

      // Log the data being set
      console.log("📥 Setting form data from initialForm:", {
        agency_name: deepCopy.agency_name,
        key_personnel_count: deepCopy.key_personnel?.length,
        equipment_count: deepCopy.equipment?.length,
        social_data_count: deepCopy.social_data?.length,
        environmental_data_count: deepCopy.environmental_data?.length
      });
    }
  }, [initialForm, pageMode]);

  // Form states
  const [socialForm, setSocialForm] = useState<Omit<SocialData, 'id'>>({
    sn: "",
    particular: "",
    obtained: "no",
    issue_date: "",
    valid_up_to: "",
    document: "",
    remarks: ""
  });

  const [environmentalForm, setEnvironmentalForm] = useState<Omit<EnvironmentalData, 'id'>>({
    sno: "",
    clearance_authorization: "",
    obtained: "no",
    issue_date: "",
    valid_up_to: "",
    document: "",
    remarks: ""
  });

  const [workMethodologyForm, setWorkMethodologyForm] = useState<Omit<WorkMethodologyData, 'id'>>({
    sn: "",
    document_name: "",
    contractor_submission_date: "",
    approval_date: "",
    review_status: "",
    resubmission_date: "",
    document: "",
    remark: ""
  });

  // ✅ Hooks
  const { data: tendercontracts = [], isLoading: isWorksLoading } = useWorkTender();
  const { data: tenderData } = useTenderByWorkId(formData.work_id);
  console.log("📊 Tendercontracts data:", { data: tenderData });

  useEffect(() => {
    if (tenderData) {
      console.log("📋 Tender data received:", tenderData);
      setFormData((prev) => ({
        ...prev,
        tenderRefNo: tenderData?.tenderRefNo || tenderData?.tenderrefno || prev.tenderRefNo,
        agreement_no: tenderData?.agreement_no || prev.agreement_no,
      }));
    }

    if (formData.work_id && tendercontracts.length > 0) {
      const work = tendercontracts.find((w: any) => w.id?.toString() === formData.work_id);
      if (work) {
        console.log("✅ Found work in tendercontracts:", work);
        setFormData((prev) => ({
          ...prev,
          tenderRefNo: work.tenderRefNo || work.tenderrefno || prev.tenderRefNo,
          agreement_no: work.agreement_no || prev.agreement_no,
        }));
      }
    }
  }, [tenderData, tendercontracts, formData.work_id]);

  const getPersonnelOption = (role: string) => {
    return PERSONNEL_OPTIONS.find(opt => opt.value === role);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const safeTrim = (value: any): string => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return value.trim();
      return String(value).trim();
    };

    const hasValue = (value: any): boolean => {
      const trimmed = safeTrim(value);
      return trimmed.length > 0;
    };

    if (!hasValue(formData.work_id)) {
      newErrors.work_id = "Work Project is required";
    }

    // Contractor Details validation
    if (!hasValue(formData.agency_name)) {
      newErrors.agency_name = "Agency Name is required";
    }
    if (!hasValue(formData.authorized)) {
      newErrors.authorized = "Authorized Person is required";
    }

    // Phone validation with safe handling
    const phone = safeTrim(formData.phone);
    if (!hasValue(phone)) {
      newErrors.phone = "Phone Number 1 is required";
    } else if (!/^[0-9]{10}$/.test(phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

    // Alternate Phone validation
    const alternatePhone = safeTrim(formData.alternate_phone);
    if (alternatePhone && !/^[0-9]{10}$/.test(alternatePhone)) {
      newErrors.alternate_phone = "Alternate phone must be 10 digits";
    }

    // Email validation
    const email = safeTrim(formData.email);
    if (!hasValue(email)) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    // Alternate Email validation
    const alternateEmail = safeTrim(formData.alternate_email);
    if (alternateEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alternateEmail)) {
      newErrors.alternate_email = "Invalid alternate email format";
    }

    // Address validation
    if (!hasValue(formData.address)) {
      newErrors.address = "Address is required";
    }

    // Agreement Details validation
    const contractAmount = safeTrim(formData.contract_amount).replace(/,/g, '');
    if (!hasValue(contractAmount)) {
      newErrors.contract_amount = "Contract Amount is required";
    } else if (isNaN(Number(contractAmount)) || Number(contractAmount) <= 0) {
      newErrors.contract_amount = "Contract Amount must be a positive number";
    }

    // Date validations
    const startDate = formData.start_date;
    const completionDate = formData.stipulated_date;
    const actualCompletionDate = formData.actual_date_of_completion;

    if (!startDate) {
      newErrors.start_date = "Start Date is required";
    }
    if (!completionDate) {
      newErrors.completion_date = "Completion Date is required";
    } else if (startDate && completionDate) {
      try {
        const start = new Date(startDate);
        const end = new Date(completionDate);
        if (end <= start) {
          newErrors.completion_date = "Completion Date must be after Start Date";
        }
      } catch (e) {
        newErrors.completion_date = "Invalid date format";
      }
    }

    if (actualCompletionDate) {
      try {
        const actual = new Date(actualCompletionDate);
        const start = new Date(startDate);
        if (actual < start) {
          newErrors.actual_date_of_completion = "Actual completion date cannot be before start date";
        }
      } catch (e) {

      }
    }

    // ✅ Key Personnel Validation
    if (!formData.key_personnel || formData.key_personnel.length === 0) {
      newErrors.key_personnel = "At least one key personnel is required";
    } else {
      formData.key_personnel.forEach((personnel, personnelIndex) => {
        if (!personnel) return;
        const option = getPersonnelOption(personnel.role);

        if (personnel.persons && Array.isArray(personnel.persons)) {
          personnel.persons.forEach((person, personIndex) => {
            if (!person) return;

            if (option?.fields.includes('name') && !hasValue(person.name)) {
              newErrors[`personnel_${personnelIndex}_${personIndex}_name`] = "Name is required";
            }

            if (option?.fields.includes('contact')) {
              const contact = safeTrim(person.contact);
              if (!hasValue(contact)) {
                newErrors[`personnel_${personnelIndex}_${personIndex}_contact`] = "Contact is required";
              } else if (!/^[0-9]{10}$/.test(contact)) {
                newErrors[`personnel_${personnelIndex}_${personIndex}_contact`] = "Contact must be 10 digits";
              }
            }
          });
        }
      });
    }

    // ✅ Equipment Validation
    if (!formData.equipment || formData.equipment.length === 0) {
      newErrors.equipment = "At least one equipment is required";
    } else {
      formData.equipment.forEach((equip, index) => {
        if (!equip) return;
        const quantityBid = safeTrim(equip.quantity_bid);
        const quantitySite = safeTrim(equip.quantity_site);
        if (!hasValue(quantityBid)) {
          newErrors[`equipment_${index}_bid`] = "Quantity as per bid is required";
        } else if (isNaN(Number(quantityBid)) || Number(quantityBid) <= 0) {
          newErrors[`equipment_${index}_bid`] = "Quantity must be a positive number";
        }

        if (!hasValue(quantitySite)) {
          newErrors[`equipment_${index}_site`] = "Quantity as per site is required";
        } else if (isNaN(Number(quantitySite)) || Number(quantitySite) <= 0) {
          newErrors[`equipment_${index}_site`] = "Quantity must be a positive number";
        } else if (Number(quantitySite) > Number(quantityBid)) {

          newErrors[`equipment_${index}_validation`] =
            `Site quantity (${quantitySite}) cannot exceed required quantity (${quantityBid}). Actual quantity at site must be ≤ ${quantityBid}.`
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "contract_amount") {
      const numericValue = value.replace(/[^0-9]/g, '');
      const formattedValue = numericValue ? Number(numericValue).toLocaleString('en-IN') : '';
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleWorkSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, work_id: value }));
    if (errors.work_id) {
      setErrors((prev) => ({ ...prev, work_id: "" }));
    }
  };

  const handleAddPersonnelRole = () => {
    if (!selectedPersonnel) {
      alert("Please select a personnel role");
      return;
    }

    const existing = formData.key_personnel.find(p => p.role === selectedPersonnel);
    if (existing) {
      alert("This role has already been added");
      return;
    }

    const option = getPersonnelOption(selectedPersonnel);
    if (!option) return;

    const personsCount = option.singlePerson ? 1 : 1;
    setFormData(prev => ({
      ...prev,
      key_personnel: [
        ...prev.key_personnel,
        {
          id: `${selectedPersonnel}_${Date.now()}`,
          role: selectedPersonnel,
          persons: Array(personsCount).fill(null).map(() => {
            const person: any = {};
            option.fields.forEach(field => {
              person[field] = "";
            });
            return person;
          })
        }
      ]
    }));

    setSelectedPersonnel("");
  };

  const handleAddPersonToRole = (personnelIndex: number) => {
    const option = getPersonnelOption(formData.key_personnel[personnelIndex].role);
    if (!option || option.singlePerson) {
      alert("Only one person is allowed for this role");
      return;
    }

    setFormData(prev => {
      const updated = [...prev.key_personnel];
      const newPerson: any = {};

      if (option.fields.includes('name')) newPerson.name = "";
      if (option.fields.includes('contact')) newPerson.contact = "";

      updated[personnelIndex] = {
        ...updated[personnelIndex],
        persons: [...updated[personnelIndex].persons, newPerson]
      };

      return { ...prev, key_personnel: updated };
    });
  };

  const handleUpdatePersonnel = (personnelIndex: number, personIndex: number, field: string, value: string) => {
    setFormData(prev => {
      const updated = [...prev.key_personnel];
      updated[personnelIndex].persons[personIndex] = {
        ...updated[personnelIndex].persons[personIndex],
        [field]: value
      };
      return { ...prev, key_personnel: updated };
    });

    const errorKey = `personnel_${personnelIndex}_${personIndex}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: "" }));
    }
  };

  const handleRemovePersonnelRole = (index: number) => {
    setFormData(prev => ({
      ...prev,
      key_personnel: prev.key_personnel.filter((_, i) => i !== index)
    }));

    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(`personnel_${index}_`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const handleRemovePersonFromRole = (personnelIndex: number, personIndex: number) => {
    const option = getPersonnelOption(formData.key_personnel[personnelIndex].role);
    if (!option || option.singlePerson) {
      alert("Cannot remove the only person for this role");
      return;
    }

    if (formData.key_personnel[personnelIndex].persons.length <= 1) {
      alert("At least one person is required for this role");
      return;
    }

    setFormData(prev => {
      const updated = [...prev.key_personnel];
      updated[personnelIndex].persons = updated[personnelIndex].persons.filter((_, i) => i !== personIndex);
      return { ...prev, key_personnel: updated };
    });

    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(`personnel_${personnelIndex}_${personIndex}_`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  // ✅ Add Equipment
  const handleAddEquipment = () => {
    if (!selectedEquipment) {
      alert("Please select equipment type");
      return;
    }

    const existing = formData.equipment.find(e => e.type === selectedEquipment);
    if (existing) {
      alert("This equipment has already been added");
      return;
    }

    setFormData(prev => ({
      ...prev,
      equipment: [
        ...prev.equipment,
        {
          type: selectedEquipment,
          quantity_bid: "",
          quantity_site: "",
        }
      ]
    }));

    setSelectedEquipment("");
  };

  // ✅ Update Equipment
  const handleUpdateEquipment = (index: number, field: string, value: string) => {
    // Allow only numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setFormData(prev => {
      const updated = [...prev.equipment];
      // Update the field
      updated[index] = { ...updated[index], [field]: numericValue };
      // Validate quantity_site cannot exceed quantity_bid
      if (field === 'quantity_site') {
        const quantityBid = parseInt(updated[index].quantity_bid || '0');
        const quantitySite = parseInt(numericValue || '0');

        if (!isNaN(quantityBid) && !isNaN(quantitySite) && quantitySite > quantityBid) {
          // Reset to bid quantity if exceeds
          updated[index] = {
            ...updated[index],
            quantity_site: updated[index].quantity_bid
          };

          // Show error message
          setErrors(prev => ({
            ...prev,
            [`equipment_${index}_validation`]:
              `Site quantity (${quantitySite}) cannot exceed required quantity (${quantityBid}). Actual quantity at site must be ≤ ${quantityBid}.`
          }));

          // Show alert
          setTimeout(() => {
            alert(`⚠️ ${EQUIPMENT_OPTIONS.find(opt => opt.value === updated[index].type)?.label || 'Equipment'}: Site quantity cannot exceed required quantity.`);
          }, 100);
        } else {
          // Clear error if validation passes
          setErrors(prev => ({
            ...prev,
            [`equipment_${index}_validation`]: ""
          }));
        }
      }
      return { ...prev, equipment: updated };
    });

    // Clear previous errors
    const errorKey = `equipment_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: "" }));
    }
  };

  // ✅ Remove Equipment
  const handleRemoveEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index)
    }));
    const newErrors = { ...errors };
    delete newErrors[`equipment_${index}_bid`];
    delete newErrors[`equipment_${index}_site`];
    setErrors(newErrors);
  };

  // ✅ Social Data Handlers
  const handleSocialChange = (field: keyof Omit<SocialData, 'id'>, value: string) => {
    setSocialForm(prev => ({ ...prev, [field]: value }));
  };
  const handleAddSocialData = () => {
    if (!socialForm.particular) {
      alert("Please select particular");
      return;
    }
    const newSn = (formData.social_data.length + 1).toString();
    setFormData(prev => ({
      ...prev,
      social_data: [
        ...prev.social_data,
        {
          ...socialForm,
          id: `social_${Date.now()}`,
          sn: socialForm.sn || newSn
        }
      ]
    }));

    // Reset form
    setSocialForm({
      sn: "",
      particular: "",
      obtained: "no",
      issue_date: "",
      valid_up_to: "",
      document: "",
      remarks: ""
    });
  };

  const handleUpdateSocialData = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const updated = [...prev.social_data];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, social_data: updated };
    });
  };

  const handleRemoveSocialData = (index: number) => {
    setFormData(prev => ({
      ...prev,
      social_data: prev.social_data.filter((_, i) => i !== index)
    }));
  };

  // ✅ Environmental Data Handlers
  const handleEnvironmentalChange = (field: keyof Omit<EnvironmentalData, 'id'>, value: string) => {
    setEnvironmentalForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddEnvironmentalData = () => {
    if (!environmentalForm.clearance_authorization) {
      alert("Please select clearance/authorization");
      return;
    }

    const newSno = (formData.environmental_data.length + 1).toString();
    setFormData(prev => ({
      ...prev,
      environmental_data: [
        ...prev.environmental_data,
        {
          ...environmentalForm,
          id: `env_${Date.now()}`,
          sno: environmentalForm.sno || newSno
        }
      ]
    }));

    // Reset form
    setEnvironmentalForm({
      sno: "",
      clearance_authorization: "",
      obtained: "no",
      issue_date: "",
      valid_up_to: "",
      document: "",
      remarks: ""
    });
  };

  const handleUpdateEnvironmentalData = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const updated = [...prev.environmental_data];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, environmental_data: updated };
    });
  };

  const handleRemoveEnvironmentalData = (index: number) => {
    setFormData(prev => ({
      ...prev,
      environmental_data: prev.environmental_data.filter((_, i) => i !== index)
    }));
  };

  // ✅ Work Methodology Data Handlers
  const handleWorkMethodologyChange = (field: keyof Omit<WorkMethodologyData, 'id'>, value: string) => {
    setWorkMethodologyForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddWorkMethodologyData = () => {
    if (!workMethodologyForm.document_name) {
      alert("Please select document name");
      return;
    }
    const newSn = (formData.work_methodology_data.length + 1).toString();
    setFormData(prev => ({
      ...prev,
      work_methodology_data: [
        ...prev.work_methodology_data,
        {
          ...workMethodologyForm,
          id: `method_${Date.now()}`,
          sn: workMethodologyForm.sn || newSn
        }
      ]
    }));

    // Reset form
    setWorkMethodologyForm({
      sn: "",
      document_name: "",
      contractor_submission_date: "",
      approval_date: "",
      review_status: "",
      resubmission_date: "",
      document: "",
      remark: ""
    });
  };

  const handleUpdateWorkMethodologyData = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const updated = [...prev.work_methodology_data];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, work_methodology_data: updated };
    });
  };

  const handleRemoveWorkMethodologyData = (index: number) => {
    setFormData(prev => ({
      ...prev,
      work_methodology_data: prev.work_methodology_data.filter((_, i) => i !== index)
    }));
  };

  // ✅ File Upload Handler
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'social' | 'environmental' | 'work_methodology',
    index: number,
    existingDocumentPath?: string 
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
   
      if (existingDocumentPath) {
       
        if (type === 'social') {
          handleUpdateSocialData(index, 'document', existingDocumentPath);
        } else if (type === 'environmental') {
          handleUpdateEnvironmentalData(index, 'document', existingDocumentPath);
        } else if (type === 'work_methodology') {
          handleUpdateWorkMethodologyData(index, 'document', existingDocumentPath);
        }
      }
      return;
    }

    // File validation
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      alert('Only PDF, Word, JPG, PNG files are allowed');
      return;
    }

    try {
      // Convert file to base64
      const base64String = await convertFileToBase64(file);

      if (type === 'social') {
        handleUpdateSocialData(index, 'document', base64String);
      } else if (type === 'environmental') {
        handleUpdateEnvironmentalData(index, 'document', base64String);
      } else if (type === 'work_methodology') {
        handleUpdateWorkMethodologyData(index, 'document', base64String);
      }

      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Error converting file:', error);
      alert('Error uploading file. Please try again.');
    }
  };
 
  // const renderFileInput = (
  //   type: 'social' | 'environmental' | 'work_methodology',
  //   index: number,
  //   existingDocument: string,
  //   disabled?: boolean
  // ) => {
  //   const hasExistingDocument = existingDocument && !existingDocument.startsWith('data:');

  //   return (
  //     <div className="space-y-2">
  //       {hasExistingDocument ? (
  //         <div className="mb-2">
  //           <p className="text-sm text-gray-600 mb-1">Existing Document:</p>
  //           <button
  //             type="button"
  //             onClick={() => window.open(existingDocument, '_blank')}
  //             className="flex items-center text-blue-600 hover:text-blue-800 hover:underline text-sm"
  //           >
  //             <Eye className="w-4 h-4 mr-1" />
  //             View Current Document
  //           </button>
  //           {!disabled && (
  //             <p className="text-xs text-gray-500 mt-1">
  //               Upload a new file only if you want to replace this document
  //             </p>
  //           )}
  //         </div>
  //       ) : (
  //         <p className="text-sm text-gray-500 mb-1">No document uploaded yet</p>
  //       )}

  //       {!disabled && (
  //         <input
  //           type="file"
  //           onChange={(e) => handleFileUpload(e, type, index, existingDocument)}
  //           className="w-full text-sm"
  //           accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
  //         />
  //       )}
  //     </div>
  //   );
  // };

  // Helper function to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[data-error="${firstError}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (errorElement as HTMLElement).focus();
      }
      return;
    }

    // Format contract amount - remove commas
    const formattedData = {
      ...formData,
      contract_amount: formData.contract_amount.replace(/,/g, ''),
      start_date: formData.start_date,
      stipulated_date: formData.stipulated_date,
      actual_date_of_completion: formData.actual_date_of_completion || null
    };

    onSubmit(formattedData);
  };

  // ✅ Custom Select Component
  const CustomSelect: React.FC<{
    options: Array<{ value: string; label: string; singlePerson?: boolean }>;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
  }> = ({ options, value, onChange, placeholder, required = false, disabled = false, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find((option) => option.value === value);

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 border rounded-xl bg-white transition flex items-center justify-between ${disabled ? "bg-gray-50 cursor-not-allowed opacity-70" : "hover:border-gray-400"
            } ${error ? "border-red-500" : "border-gray-300"}`}
        >
          <span className={`${!selectedOption?.value ? "text-gray-400" : "text-gray-900"}`}>
            {selectedOption?.label || placeholder || "Select an option"}
          </span>
          <ChevronDown className={`w-5 h-5 text-gray-400 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && !disabled && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-center justify-between ${option.value === value
                  ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                  : "text-gray-900 hover:bg-blue-50"
                  }`}
              >
                <span>{option.label}</span>
                {option.singlePerson && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Single
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
    );
  };

  const workOptions = tendercontracts.map((work: any) => ({
    value: work.id.toString(),
    label: work.work_name || "Unnamed Work",
  }));

  const renderInputField = (
    field: {
      label: string;
      name: keyof FormData;
      icon: JSX.Element;
      type?: string;
      required?: boolean;
      placeholder?: string;
      disabled?: boolean;
    }
  ) => (
    <div key={field.name}>
      <label className="font-semibold text-gray-700 flex items-center mb-2">
        {field.icon} <span className="ml-2">{field.label}</span> {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={field.type || "text"}
        name={field.name}
        value={formData[field.name] as string}
        onChange={handleChange}
        placeholder={field.placeholder}
        disabled={field.disabled || pageMode === 'view'}
        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${pageMode === 'view' ? 'bg-gray-50 text-gray-600' : ''} ${errors[field.name] ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
          }`}
      />
      {errors[field.name] && (
        <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
      )}
    </div>
  );

  // ✅ View Mode Header Component
  const ViewModeHeader = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={onBackToList}
             className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
             ⬅ Back
          </button>
        </div>
        <div className="flex items-center gap-3">
          {onViewHistory && pageMode === 'view' && (
            <button
              onClick={onViewHistory}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <History className="w-4 h-4 mr-2" />
              View History
            </button>
          )}
          {onEdit && pageMode === 'view' && user.role_id === 5 && (
            <button
              onClick={onEdit}
              className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // ✅ View Mode Content Component
  const ViewModeContent = () => {
    // Safe access to formData with fallbacks
    const keyPersonnel = formData.key_personnel || [];
    const equipment = formData.equipment || [];
    const socialData = formData.social_data || [];
    const environmentalData = formData.environmental_data || [];
    const workMethodologyData = formData.work_methodology_data || [];

    // Function to format date
    const formatDate = (dateString: string) => {
      if (!dateString) return '-';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (e) {
        return dateString;
      }
    };

    // Function to get personnel role label
    const getPersonnelRoleLabel = (role: string = "") => {
      if (!role) return "Unknown Role";

      const option = PERSONNEL_OPTIONS?.find(opt => opt.value === role);

      return option?.label ||
        role.replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
    };

    // Function to get equipment label
    const getEquipmentLabel = (type: string) => {
      if (!type) return "Unknown Equipment";

      const option = EQUIPMENT_OPTIONS.find(opt => opt.value === type);

      // Safe string conversion and formatting
      return option?.label ||
        (typeof type === 'string'
          ? type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          : "Unknown Equipment"
        );
    };

    return (
      <div className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2 text-blue-500" />
            Project Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-500 text-sm">Work Name</p>
              <p className="font-semibold">{viewContractData?.work_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Tender Reference No</p>
              <p className="font-semibold">{viewContractData?.tenderrefno || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Agreement No</p>
              <p className="font-semibold">{formData.agreement_no || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Contractor Details */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-green-500" />
            Contractor Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-500 text-sm">Agency / Company Name</p>
              <p className="font-semibold">{viewContractData?.contractor_name || formData.agency_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Authorized Person</p>
              <p className="font-semibold">{viewContractData?.authorized || formData.authorized || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Phone Number</p>
              <p className="font-semibold">{viewContractData?.phone || formData.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p className="font-semibold">{viewContractData?.email || formData.email || 'N/A'}</p>
            </div>
            <div className="md:col-span-4">
              <p className="text-gray-500 text-sm">Address</p>
              <p className="font-semibold">{viewContractData?.address || formData.address || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Agreement & Timeline */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-500" />
            Agreement & Timeline
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-500 text-sm">Contract Value (Cr.)</p>
              <p className="text-2xl font-bold text-green-700">
                ₹{viewContractData?.contract_awarded_amount || formData.contract_amount || '0'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Start Date of Work</p>
              <p className="font-semibold">
                <DateDisplay dateString={viewContractData?.work_commencement_date || formData.start_date || ''} />
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Stipulated Date of Completion</p>
              <p className="font-semibold">
                <DateDisplay dateString={viewContractData?.work_stipulated_date || formData.stipulated_date || ''} />
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Actual Completion of Work</p>
              <p className="font-semibold">
                <DateDisplay dateString={viewContractData?.actual_date_of_completion || formData.actual_date_of_completion || ''} />
              </p>
            </div>
          </div>
        </div>

        {/* Key Personnel Section */}
        {keyPersonnel.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              Key Personnel ({keyPersonnel.length} roles)
            </h2>

            {/* Horizontal Scroll Container */}
            <div className="overflow-x-auto pb-4">
              <div className="flex space-x-4 min-w-max">
                {keyPersonnel.map((personnel, index) => (
                  <div
                    key={personnel.id}
                    className="flex-shrink-0 w-80 border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Role Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {getPersonnelRoleLabel(personnel.role)}
                        </h3>
                      </div>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        {personnel.persons.length} {personnel.persons.length === 1 ? 'Person' : 'Persons'}
                      </span>
                    </div>

                    {/* Persons List - Vertical within horizontal card */}
                    <div className="space-y-3">
                      {personnel.persons.map((person, personIndex) => (
                        <div
                          key={personIndex}
                          className={`p-3 rounded-lg ${personIndex === 0 ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50 border border-gray-100'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">
                                Person {personIndex + 1}
                              </span>
                            </div>
                            {personIndex === 0 && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Primary
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            <p className="font-bold text-gray-900 text-base">
                              {person.name || 'Not specified'}
                            </p>
                            {person.contact && (
                              <div className="flex items-center text-gray-600">
                                <Phone className="w-3 h-3 mr-2" />
                                <span className="text-sm">{person.contact}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Equipment Section */}
        {equipment.length > 0 && (
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Building className="w-5 h-5 mr-2 text-cyan-500" />
              Equipment ({equipment.length} types)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">S.No</th>
                    <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">Equipment Type</th>
                    <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">Quantity as per bid</th>
                    <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">Quantity at site</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.map((equip, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3">{index + 1}</td>
                      <td className="border border-gray-300 p-3 font-medium">
                        {getEquipmentLabel(equip.type)}
                      </td>
                      <td className="border border-gray-300 p-3">{equip.quantity_bid}</td>
                      <td className="border border-gray-300 p-3">{equip.quantity_site}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

         {/* Environment & Social Safeguard Tabs */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <ShieldCheck className="w-5 h-5 mr-2 text-emerald-500" />
            Environment & Social Safeguard
          </h2>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {socialData.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('social')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'social'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Users className="w-4 h-4" />
                  Social Safeguard ({socialData.length})
                </button>
              )}
              {environmentalData.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('environmental')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'environmental'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Trees className="w-4 h-4" />
                  Environmental ({environmentalData.length})
                </button>
              )}
              {workMethodologyData.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('work_methodology')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'work_methodology'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <FileText className="w-4 h-4" />
                  Work Methodology ({workMethodologyData.length})
                </button>
              )}
            </nav>
          </div>

          {/* Social Safeguard Tab Content */}
          {activeTab === 'social' && socialData.length > 0 && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Social Safeguard Documents</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="border border-blue-300 p-3 text-left font-semibold text-gray-700">S.N</th>
                        <th className="border border-blue-300 p-3 text-left font-semibold text-gray-700">Particular</th>
                        <th className="border border-blue-300 p-3 text-left font-semibold text-gray-700">Status</th>
                        <th className="border border-blue-300 p-3 text-left font-semibold text-gray-700">Issue Date</th>
                        <th className="border border-blue-300 p-3 text-left font-semibold text-gray-700">Valid up to</th>
                        <th className="border border-blue-300 p-3 text-left font-semibold text-gray-700">Document</th>
                      </tr>
                    </thead>
                    <tbody>
                      {socialData.map((item, index) => (
                        <tr key={item.id} className="bg-white hover:bg-blue-50">
                          <td className="border border-blue-300 p-3">{item.sn || index + 1}</td>
                          <td className="border border-blue-300 p-3">{item.particular}</td>
                          <td className="border border-blue-300 p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.obtained === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {item.obtained === 'yes' ? 'Obtained' : 'Not Obtained'}
                            </span>
                          </td>
                          <td className="border border-blue-300 p-3">
                            {item.obtained === 'yes' ? formatDate(item.issue_date) : '-'}
                          </td>
                          <td className="border border-blue-300 p-3">
                            {item.obtained === 'yes' ? formatDate(item.valid_up_to) : '-'}
                          </td>
                          <td className="border border-blue-300 p-3">
                            {item.obtained === 'yes' && item.document ? (
                              <button
                                type="button"
                                onClick={() => window.open(item.document, '_blank')}
                                className="flex items-center text-blue-600 hover:text-blue-800 hover:underline text-sm"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Document
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm">No document</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Environmental Tab Content */}
          {activeTab === 'environmental' && environmentalData.length > 0 && (
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Environmental Clearances</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-green-100">
                      <tr>
                        <th className="border border-green-300 p-3 text-left font-semibold text-gray-700">S.No</th>
                        <th className="border border-green-300 p-3 text-left font-semibold text-gray-700">Clearance/Authorization</th>
                        <th className="border border-green-300 p-3 text-left font-semibold text-gray-700">Status</th>
                        <th className="border border-green-300 p-3 text-left font-semibold text-gray-700">Issue Date</th>
                        <th className="border border-green-300 p-3 text-left font-semibold text-gray-700">Valid Up-to</th>
                        <th className="border border-green-300 p-3 text-left font-semibold text-gray-700">Document</th>
                      </tr>
                    </thead>
                    <tbody>
                      {environmentalData.map((item, index) => (
                        <tr key={item.id} className="bg-white hover:bg-green-50">
                          <td className="border border-green-300 p-3">{item.sno || index + 1}</td>
                          <td className="border border-green-300 p-3">{item.clearance_authorization}</td>
                          <td className="border border-green-300 p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.obtained === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {item.obtained === 'yes' ? 'Obtained' : 'Not Obtained'}
                            </span>
                          </td>
                          <td className="border border-green-300 p-3">
                            {item.obtained === 'yes' ? formatDate(item.issue_date) : '-'}
                          </td>
                          <td className="border border-green-300 p-3">
                            {item.obtained === 'yes' ? formatDate(item.valid_up_to) : '-'}
                          </td>
                          <td className="border border-green-300 p-3">
                            {item.obtained === 'yes' && item.document ? (
                              <button
                                type="button"
                                onClick={() => window.open(item.document, '_blank')}
                                className="flex items-center text-blue-600 hover:text-blue-800 hover:underline text-sm"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Document
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm">No document</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Work Methodology Tab Content */}
          {activeTab === 'work_methodology' && workMethodologyData.length > 0 && (
            <div className="space-y-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Work Methodology Documents</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-purple-100">
                      <tr>
                        <th className="border border-purple-300 p-3 text-left font-semibold text-gray-700">S.N</th>
                        <th className="border border-purple-300 p-3 text-left font-semibold text-gray-700">Document</th>
                        <th className="border border-purple-300 p-3 text-left font-semibold text-gray-700">Submission Date</th>
                        <th className="border border-purple-300 p-3 text-left font-semibold text-gray-700">Approval Date</th>
                        <th className="border border-purple-300 p-3 text-left font-semibold text-gray-700">Status</th>
                        <th className="border border-purple-300 p-3 text-left font-semibold text-gray-700">Document</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workMethodologyData.map((item, index) => {
                        const reviewStatus = REVIEW_STATUS_OPTIONS.find(s => s.value === item.review_status);
                        return (
                          <tr key={item.id} className="bg-white hover:bg-purple-50">
                            <td className="border border-purple-300 p-3">{item.sn || index + 1}</td>
                            <td className="border border-purple-300 p-3 font-medium">{item.document_name}</td>
                            <td className="border border-purple-300 p-3">{formatDate(item.contractor_submission_date)}</td>
                            <td className="border border-purple-300 p-3">{formatDate(item.approval_date)}</td>
                            <td className="border border-purple-300 p-3">
                              {reviewStatus && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${reviewStatus.color}`}>
                                  {reviewStatus.label}
                                </span>
                              )}
                            </td>
                            <td className="border border-purple-300 p-3">
                              {item.document ? (
                                <button
                                  type="button"
                                  onClick={() => window.open(item.document, '_blank')}
                                  className="flex items-center text-blue-600 hover:text-blue-800 hover:underline text-sm"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Document
                                </button>
                              ) : (
                                <span className="text-gray-400 text-sm">No document</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* No Data Message */}
          {socialData.length === 0 && environmentalData.length === 0 && workMethodologyData.length === 0 && (
            <div className="text-center py-8">
              <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No environment or social safeguard data available</p>
              <p className="text-gray-400 text-sm mt-1">Switch to edit mode to add data</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <div className="flex items-center space-x-2 text-gray-600">
            <Eye className="w-4 h-4" />
            <span className="text-sm">View Mode</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Contract
              </button>
            )}
          </div>
        </div>


      </div>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      <div className="p-6 lg:p-8">
        {pageMode === 'view' && viewContractData ? (
          <>
            <ViewModeHeader />
            <ViewModeContent />
          </>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                {pageMode === 'edit' ? 'Edit Contract' : 'Add New Contract'}
              </h1>
              <p className="text-gray-600 mt-2">
                {pageMode === 'edit' ? 'Edit contractor contract details' : 'Create new contractor contract details'}
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-8 p-6 border rounded-xl bg-white shadow-lg">
              <div className="space-y-12">
                {/* BASIC INFO SECTION */}
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-2 h-8 bg-blue-500 rounded-full mr-3" />
                    <h2 className="text-2xl font-bold text-gray-800">Project Information</h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="font-semibold text-gray-700 flex items-center mb-2">
                        <Building className="w-4 h-4 mr-2 text-blue-500" /> Name of Work *
                      </label>

                      {pageMode === 'edit' || pageMode === 'view' ? (
                        // View/Edit mode: Show work name as text
                        <div className="w-full px-4 py-3 border rounded-xl bg-gray-50">
                          <p className="font-medium text-gray-800">
                            {viewContractData?.work_name || 'Work Name Not Available'}
                          </p>
                          <input type="hidden" name="work_id" value={formData.work_id} />
                        </div>
                      ) : (
                        // Create mode only: Show dropdown
                        <CustomSelect
                          options={workOptions}
                          value={formData.work_id}
                          onChange={handleWorkSelect}
                          placeholder="Please select work"
                          required
                          disabled={isWorksLoading}
                          error={errors.work_id}
                        />
                      )}

                      {isWorksLoading && <p className="text-xs text-gray-500 mt-1">Loading works...</p>}
                    </div>

                    {[
                      { label: "Tender Reference No", name: "tenderRefNo" as keyof FormData },
                      { label: "Agreement No", name: "agreement_no" as keyof FormData },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="font-semibold text-gray-700 flex items-center mb-2">
                          <BadgeCheck className="w-4 h-4 mr-2 text-blue-500" /> {field.label}
                        </label>
                        <input
                          type="text"
                          name={field.name}
                          value={formData[field.name] as string}
                          className="w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-600"
                          readOnly
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* CONTRACTOR DETAILS SECTION */}
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-2 h-8 bg-green-500 rounded-full mr-3" />
                    <h2 className="text-2xl font-bold text-gray-800">Contractor Details</h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[
                      { label: "Agency / Company Name", name: "agency_name" as keyof FormData, icon: <Building />, required: true, placeholder: "Enter company name" },
                      { label: "Authorized Person", name: "authorized" as keyof FormData, icon: <User />, required: true, placeholder: "Enter authorized person name" },
                      { label: "Phone Number 1", name: "phone" as keyof FormData, icon: <Phone />, required: true, placeholder: "Enter 10-digit phone number" },
                      { label: "Alternate Number", name: "alternate_phone" as keyof FormData, icon: <Phone />, placeholder: "Optional alternate number" },
                      { label: "Email", name: "email" as keyof FormData, icon: <Mail />, required: true, placeholder: "Enter email address" },
                      { label: "Alternate Email", name: "alternate_email" as keyof FormData, icon: <Mail />, required: false, placeholder: "Optional alternate email" },
                    ].map(field => renderInputField({ ...field, disabled: pageMode === 'view' }))}

                    <div className="lg:col-span-2">
                      <label className="font-semibold text-gray-700 flex items-center mb-2">
                        <MapPin className="w-4 h-4 mr-2 text-green-500" /> Agency / Company Address *
                      </label>
                      <input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter complete address"
                        disabled={pageMode === 'view'}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${pageMode === 'view' ? 'bg-gray-50 text-gray-600' : ''} ${errors.address ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                          }`}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* AGREEMENT DETAILS SECTION */}
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-2 h-8 bg-purple-500 rounded-full mr-3" />
                    <h2 className="text-2xl font-bold text-gray-800">Agreement & Timeline</h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[
                      { name: "contract_amount" as keyof FormData, label: "Agreement Amount", icon: <IndianRupee />, required: true, placeholder: "Enter contract amount", disabled: pageMode === 'view' },
                      { name: "start_date" as keyof FormData, label: "Start Date of Work", icon: <Calendar />, type: "date", required: true, disabled: pageMode === 'view' },
                      { name: "stipulated_date" as keyof FormData, label: "Stipulated Date of Completion", icon: <Clock />, type: "date", required: true, disabled: pageMode === 'view' },
                      { name: "actual_date_of_completion" as keyof FormData, label: "Actual Date of Completion", icon: <Clock />, type: "date", disabled: pageMode === 'view' },
                    ].map(field => renderInputField(field))}
                  </div>
                </div>

                {/* Key Personnel Section */}
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-2 h-8 bg-red-500 rounded-full mr-3" />
                    <h2 className="text-2xl font-bold text-gray-800">Key Personnel</h2>
                    {errors.key_personnel && (
                      <span className="ml-4 text-red-500 text-sm">{errors.key_personnel}</span>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="font-semibold text-gray-700 mb-2 block">
                          Select Personnel Role
                        </label>
                        <CustomSelect
                          options={PERSONNEL_OPTIONS}
                          value={selectedPersonnel}
                          onChange={setSelectedPersonnel}
                          placeholder="Select role to add"
                          disabled={pageMode === 'view'}
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={handleAddPersonnelRole}
                          disabled={pageMode === 'view'}
                          className={`px-6 py-3 rounded-xl transition flex items-center ${pageMode === 'view' ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Role
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {formData.key_personnel.map((personnel, personnelIndex) => {
                      const option = getPersonnelOption(personnel.role);
                      const roleName = option?.label || personnel.role;
                      const isSinglePerson = option?.singlePerson || false;

                      return (
                        <div key={personnel.id} className="border border-gray-200 rounded-xl p-6 bg-white">
                          <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center">
                              <h3 className="text-xl font-bold text-gray-800">{roleName}</h3>
                              {isSinglePerson ? (
                                <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                  Single Person
                                </span>
                              ) : (
                                <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                  {personnel.persons?.length || 0} {personnel.persons?.length === 1 ? 'Person' : 'Persons'}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {!isSinglePerson && pageMode !== 'view' && (
                                <button
                                  type="button"
                                  onClick={() => handleAddPersonToRole(personnelIndex)}
                                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add Person
                                </button>
                              )}
                              {pageMode !== 'view' && (
                                <button
                                  type="button"
                                  onClick={() => handleRemovePersonnelRole(personnelIndex)}
                                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            {personnel.persons?.map((person, personIndex) => (
                              <div key={personIndex} className={`border ${isSinglePerson ? 'border-blue-200 bg-blue-50' : personIndex === 0 ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'} rounded-lg p-4`}>
                                {!isSinglePerson && (
                                  <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-semibold text-gray-700">
                                      Person {personIndex + 1}
                                      {personIndex === 0 && (
                                        <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                                          Primary
                                        </span>
                                      )}
                                    </h4>
                                    {personnel.persons.length > 1 && pageMode !== 'view' && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemovePersonFromRole(personnelIndex, personIndex)}
                                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                )}

                                <div className={`grid gap-4 ${isSinglePerson ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                                  {option?.fields.map((field) => (
                                    <div key={field}>
                                      <label className="text-gray-700 text-sm mb-1 block">
                                        {field === 'name' ? 'Name' : 'Contact'} *
                                      </label>
                                      <input
                                        type={field === 'contact' ? 'tel' : 'text'}
                                        value={person[field as keyof typeof person] || ''}
                                        onChange={(e) => handleUpdatePersonnel(personnelIndex, personIndex, field, e.target.value)}
                                        data-error={`personnel_${personnelIndex}_${personIndex}_${field}`}
                                        disabled={pageMode === 'view'}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${pageMode === 'view' ? 'bg-gray-50 text-gray-600' : ''} ${errors[`personnel_${personnelIndex}_${personIndex}_${field}`] ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                                        placeholder={`Enter ${field === 'name' ? 'name' : 'contact number'}`}
                                        required
                                      />
                                      {errors[`personnel_${personnelIndex}_${personIndex}_${field}`] && (
                                        <p className="text-red-500 text-xs mt-1">{errors[`personnel_${personnelIndex}_${personIndex}_${field}`]}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {formData.key_personnel.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                        <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No key personnel added yet</p>
                        <p className="text-gray-400 text-sm mt-1">Use the dropdown above to add personnel roles</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Equipment Section */}
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-2 h-8 bg-cyan-500 rounded-full mr-3" />
                    <h2 className="text-2xl font-bold text-gray-800">Equipment</h2>
                    {errors.equipment && (
                      <span className="ml-4 text-red-500 text-sm">{errors.equipment}</span>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="font-semibold text-gray-700 mb-2 block">
                          Select Equipment Type
                        </label>
                        <CustomSelect
                          options={EQUIPMENT_OPTIONS.map(opt => ({ ...opt, singlePerson: undefined }))}
                          value={selectedEquipment}
                          onChange={setSelectedEquipment}
                          placeholder="Select equipment to add"
                          disabled={pageMode === 'view'}
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={handleAddEquipment}
                          disabled={pageMode === 'view'}
                          className={`px-6 py-3 rounded-xl transition flex items-center ${pageMode === 'view' ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Equipment
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {formData.equipment.map((equip, index) => {
                      const equipmentName = EQUIPMENT_OPTIONS.find(opt => opt.value === equip.type)?.label || equip.type;

                      return (
                        <div key={index} className="border border-gray-200 rounded-xl p-6 bg-white">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">{equipmentName}</h3>
                            {pageMode !== 'view' && (
                              <button
                                type="button"
                                onClick={() => handleRemoveEquipment(index)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <label className="text-gray-700 text-sm mb-1 block">
                                Numbers as per requirement *
                              </label>
                              <input
                                type="text"
                                value={equip.quantity_bid}
                                onChange={(e) => handleUpdateEquipment(index, 'quantity_bid', e.target.value)}
                                data-error={`equipment_${index}_bid`}
                                disabled={pageMode === 'view'}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${pageMode === 'view' ? 'bg-gray-50 text-gray-600' : ''} ${errors[`equipment_${index}_bid`] ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                                placeholder="e.g., 2 units"
                                required
                              />
                              {errors[`equipment_${index}_bid`] && (
                                <p className="text-red-500 text-sm mt-1">{errors[`equipment_${index}_bid`]}</p>
                              )}
                            </div>

                            <div>
                              <label className="text-gray-700 text-sm mb-1 block">
                                Actual Number available at site *
                              </label>
                              <input
                                type="text"
                                value={equip.quantity_site}
                                onChange={(e) => handleUpdateEquipment(index, 'quantity_site', e.target.value)}
                                data-error={`equipment_${index}_site`}
                                disabled={pageMode === 'view'}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${pageMode === 'view' ? 'bg-gray-50 text-gray-600' : ''} ${errors[`equipment_${index}_site`] || errors[`equipment_${index}_validation`] ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                                placeholder="e.g., 2 units"
                                required
                              />
                              {errors[`equipment_${index}_site`] && (
                                <p className="text-red-500 text-sm mt-1">{errors[`equipment_${index}_site`]}</p>
                              )}
                              {/* ✅ नई validation message */}
                              {errors[`equipment_${index}_validation`] && (
                                <p className="text-red-500 text-sm mt-1 font-medium">
                                  ⚠️ {errors[`equipment_${index}_validation`]}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {formData.equipment.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                        <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No equipment added yet</p>
                        <p className="text-gray-400 text-sm mt-1">Use the dropdown above to add equipment</p>
                      </div>
                    )}
                  </div>
                </div>

                 {/* Environment & Social Safeguard Section - UPDATED FORMAT */}
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-2 h-8 bg-emerald-500 rounded-full mr-3" />
                    <h2 className="text-2xl font-bold text-gray-800">Environment & Social Safeguard</h2>
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        type="button"
                        onClick={() => setActiveTab('social')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'social'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        <Users className="w-4 h-4" />
                        Social Safeguard
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('environmental')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'environmental'
                          ? 'border-emerald-500 text-emerald-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        <Trees className="w-4 h-4" />
                        Environmental
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('work_methodology')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'work_methodology'
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        <FileText className="w-4 h-4" />
                        Work Methodology
                      </button>
                    </nav>
                  </div>

                  {/* Social Safeguard Tab Content */}
                  {activeTab === 'social' && (
                    <div className="space-y-6">
                      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-gray-800">Licenses, Permissions and Documents Required</h3>
                          {pageMode !== 'view' && (
                            <button
                              type="button"
                              onClick={handleAddSocialData}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Add Record
                            </button>
                          )}
                        </div>

                        {/* Social Safeguard Form - Only show in create/edit mode */}
                        {pageMode !== 'view' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-white rounded-lg">
                            <div>
                              <label className="text-gray-700 text-sm mb-1 block">Particular *</label>
                              <select
                                value={socialForm.particular}
                                onChange={(e) => handleSocialChange('particular', e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                              >
                                <option value="">Select Particular</option>
                                {SOCIAL_PARTICULARS.map((item, index) => (
                                  <option key={index} value={item}>{item}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-gray-700 text-sm mb-1 block">Obtained Yes/No</label>
                              <select
                                value={socialForm.obtained}
                                onChange={(e) => handleSocialChange('obtained', e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                              >
                                <option value="no">No</option>
                                <option value="yes">Yes</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-gray-700 text-sm mb-1 block">Issue Date</label>
                              <input
                                type="date"
                                value={socialForm.issue_date}
                                onChange={(e) => handleSocialChange('issue_date', e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                              />
                            </div>
                            <div>
                              <label className="text-gray-700 text-sm mb-1 block">Valid up to</label>
                              <input
                                type="date"
                                value={socialForm.valid_up_to}
                                onChange={(e) => handleSocialChange('valid_up_to', e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                              />
                            </div>
                          </div>
                        )}

                        {/* Social Safeguard Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead className="bg-blue-100">
                              <tr>
                                <th className="border border-blue-300 p-3 text-left font-semibold text-gray-700">S.N</th>
                                <th className="border border-blue-300 p-3 text-left font-semibold text-gray-700">Particular</th>
                                <th className="border border-blue-300 p-3 text-left font-semibold text-gray-700">Obtained Yes/No</th>
                                <th className="border border-blue-300 p-3 text-left font-semibold text-gray-700">Issue Date</th>
                                <th className="border border-blue-300 p-3 text-left font-semibold text-gray-700">Valid up to</th>
                                <th className="border border-blue-300 p-3 text-left font-semibold text-gray-700">Document</th>
                                {pageMode !== 'view' && (
                                  <th className="border border-blue-300 p-3 text-left font-semibold text-gray-700">Action</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {formData.social_data.length > 0 ? (
                                formData.social_data.map((item, index) => (
                                  <tr key={item.id} className="bg-white hover:bg-blue-50">
                                    <td className="border border-blue-300 p-3">{item.sn}</td>
                                    <td className="border border-blue-300 p-3">{item.particular}</td>
                                    <td className="border border-blue-300 p-3">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.obtained === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {item.obtained === 'yes' ? 'Yes' : 'No'}
                                      </span>
                                    </td>
                                    <td className="border border-blue-300 p-3">
                                      {item.obtained === 'yes' ? item.issue_date : '-'}
                                    </td>
                                    <td className="border border-blue-300 p-3">
                                      {item.obtained === 'yes' ? item.valid_up_to : '-'}
                                    </td>
                                    <td className="border border-blue-300 p-3">
                                      {item.obtained === 'yes' ? (
                                        pageMode !== 'view' ? (
                                          <>
                                            <input
                                              type="file"
                                              onChange={(e) => handleFileUpload(e, 'social', index)}
                                              className="w-full"
                                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            />
                                            {item.document && (
                                              <div className="mt-1">
                                                <span className="text-xs text-green-600">✓ Uploaded</span>
                                                <button
                                                  type="button"
                                                  onClick={() => window.open(item.document, '_blank')}
                                                  className="text-blue-600 text-xs ml-2 hover:underline"
                                                >
                                                  View
                                                </button>
                                              </div>
                                            )}
                                          </>
                                        ) : item.document ? (
                                          <button
                                            type="button"
                                            onClick={() => window.open(item.document, '_blank')}
                                            className="text-blue-600 hover:underline text-sm"
                                          >
                                            View Document
                                          </button>
                                        ) : (
                                          <span className="text-gray-400 text-sm">No document</span>
                                        )
                                      ) : (
                                        <span className="text-gray-400 text-sm">Not applicable</span>
                                      )}
                                    </td>
                                    {pageMode !== 'view' && (
                                      <td className="border border-blue-300 p-3">
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveSocialData(index)}
                                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </td>
                                    )}
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={pageMode !== 'view' ? 7 : 6} className="border border-blue-300 p-4 text-center text-gray-500">
                                    No social safeguard records added yet. {pageMode !== 'view' && 'Click "Add Record" to add.'}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Environmental Tab Content */}
                  {activeTab === 'environmental' && (
                    <div className="space-y-6">
                      <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-gray-800">Environmental Clearances and Authorizations</h3>
                          {pageMode !== 'view' && (
                            <button
                              type="button"
                              onClick={handleAddEnvironmentalData}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Add Record
                            </button>
                          )}
                        </div>

                        {/* Environmental Form - Only show in create/edit mode */}
                        {pageMode !== 'view' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-white rounded-lg">
                            <div>
                              <label className="text-gray-700 text-sm mb-1 block">Clearance/Authorization *</label>
                              <select
                                value={environmentalForm.clearance_authorization}
                                onChange={(e) => handleEnvironmentalChange('clearance_authorization', e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                              >
                                <option value="">Select Clearance</option>
                                {ENVIRONMENTAL_CLEARANCES.map((item, index) => (
                                  <option key={index} value={item}>{item}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-gray-700 text-sm mb-1 block">Obtained Yes/No</label>
                              <select
                                value={environmentalForm.obtained}
                                onChange={(e) => handleEnvironmentalChange('obtained', e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                              >
                                <option value="no">No</option>
                                <option value="yes">Yes</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-gray-700 text-sm mb-1 block">Issue Date</label>
                              <input
                                type="date"
                                value={environmentalForm.issue_date}
                                onChange={(e) => handleEnvironmentalChange('issue_date', e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                              />
                            </div>
                            <div>
                              <label className="text-gray-700 text-sm mb-1 block">Valid Up-to</label>
                              <input
                                type="date"
                                value={environmentalForm.valid_up_to}
                                onChange={(e) => handleEnvironmentalChange('valid_up_to', e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                              />
                            </div>
                          </div>
                        )}

                        {/* Environmental Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead className="bg-green-100">
                              <tr>
                                <th className="border border-green-300 p-3 text-left font-semibold text-gray-700">S.No</th>
                                <th className="border border-green-300 p-3 text-left font-semibold text-gray-700">Clearance/Authorization</th>
                                <th className="border border-green-300 p-3 text-left font-semibold text-gray-700">Obtained Yes/No</th>
                                <th className="border border-green-300 p-3 text-left font-semibold text-gray-700">Issue Date</th>
                                <th className="border border-green-300 p-3 text-left font-semibold text-gray-700">Valid Up-to</th>
                                <th className="border border-green-300 p-3 text-left font-semibold text-gray-700">Document</th>
                                {pageMode !== 'view' && (
                                  <th className="border border-green-300 p-3 text-left font-semibold text-gray-700">Action</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {formData.environmental_data.length > 0 ? (
                                formData.environmental_data.map((item, index) => (
                                  <tr key={item.id} className="bg-white hover:bg-green-50">
                                    <td className="border border-green-300 p-3">{item.sno}</td>
                                    <td className="border border-green-300 p-3">{item.clearance_authorization}</td>
                                    <td className="border border-green-300 p-3">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.obtained === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {item.obtained === 'yes' ? 'Yes' : 'No'}
                                      </span>
                                    </td>
                                    <td className="border border-green-300 p-3">
                                      {item.obtained === 'yes' ? item.issue_date : '-'}
                                    </td>
                                    <td className="border border-green-300 p-3">
                                      {item.obtained === 'yes' ? item.valid_up_to : '-'}
                                    </td>
                                    <td className="border border-green-300 p-3">
                                      {item.obtained === 'yes' ? (
                                        pageMode !== 'view' ? (
                                          <>
                                            <input
                                              type="file"
                                              onChange={(e) => handleFileUpload(e, 'environmental', index)}
                                              className="w-full"
                                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            />
                                            {item.document && (
                                              <div className="mt-1">
                                                <span className="text-xs text-green-600">✓ Uploaded</span>
                                                <button
                                                  type="button"
                                                  onClick={() => window.open(item.document, '_blank')}
                                                  className="text-blue-600 text-xs ml-2 hover:underline"
                                                >
                                                  View
                                                </button>
                                              </div>
                                            )}
                                          </>
                                        ) : item.document ? (
                                          <button
                                            type="button"
                                            onClick={() => window.open(item.document, '_blank')}
                                            className="text-blue-600 hover:underline text-sm"
                                          >
                                            View Document
                                          </button>
                                        ) : (
                                          <span className="text-gray-400 text-sm">No document</span>
                                        )
                                      ) : (
                                        <span className="text-gray-400 text-sm">Not applicable</span>
                                      )}
                                    </td>
                                    {pageMode !== 'view' && (
                                      <td className="border border-green-300 p-3">
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveEnvironmentalData(index)}
                                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </td>
                                    )}
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={pageMode !== 'view' ? 7 : 6} className="border border-green-300 p-4 text-center text-gray-500">
                                    No environmental records added yet. {pageMode !== 'view' && 'Click "Add Record" to add.'}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Work Methodology Tab Content */}
                  {activeTab === 'work_methodology' && (
                    <div className="space-y-6">
                      <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-gray-800">Work Methodology Documents</h3>
                          {pageMode !== 'view' && (
                            <button
                              type="button"
                              onClick={handleAddWorkMethodologyData}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Add Document
                            </button>
                          )}
                        </div>

                        {/* Work Methodology Form - Only show in create/edit mode */}
                        {pageMode !== 'view' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-white rounded-lg">
                            <div>
                              <label className="text-gray-700 text-sm mb-1 block">Document&apos;s *</label>
                              <select
                                value={workMethodologyForm.document_name}
                                onChange={(e) => handleWorkMethodologyChange('document_name', e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                              >
                                <option value="">Select Document</option>
                                {WORK_METHODOLOGY_DOCUMENTS.map((item, index) => (
                                  <option key={index} value={item}>{item}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-gray-700 text-sm mb-1 block">Contractor Submission Date</label>
                              <input
                                type="date"
                                value={workMethodologyForm.contractor_submission_date}
                                onChange={(e) => handleWorkMethodologyChange('contractor_submission_date', e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                              />
                            </div>
                            <div>
                              <label className="text-gray-700 text-sm mb-1 block">Approval Date</label>
                              <input
                                type="date"
                                value={workMethodologyForm.approval_date}
                                onChange={(e) => handleWorkMethodologyChange('approval_date', e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                              />
                            </div>
                            <div>
                              <label className="text-gray-700 text-sm mb-1 block">Status</label>
                              <select
                                value={workMethodologyForm.review_status}
                                onChange={(e) => handleWorkMethodologyChange('review_status', e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                              >
                                <option value="">Select Status</option>
                                {REVIEW_STATUS_OPTIONS.map((status) => (
                                  <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Work Methodology Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead className="bg-purple-100">
                              <tr>
                                <th className="border border-purple-300 p-3 text-left font-semibold text-gray-700">S.N</th>
                                <th className="border border-purple-300 p-3 text-left font-semibold text-gray-700">Document&apos;s</th>
                                <th className="border border-purple-300 p-3 text-left font-semibold text-gray-700">Contractor Submission Date</th>
                                <th className="border border-purple-300 p-3 text-left font-semibold text-gray-700">Approval Date</th>
                                <th className="border border-purple-300 p-3 text-left font-semibold text-gray-700">Response</th>
                                <th className="border border-purple-300 p-3 text-left font-semibold text-gray-700">Document</th>
                                {pageMode !== 'view' && (
                                  <th className="border border-purple-300 p-3 text-left font-semibold text-gray-700">Action</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {formData.work_methodology_data.length > 0 ? (
                                formData.work_methodology_data.map((item, index) => {
                                  const reviewStatus = REVIEW_STATUS_OPTIONS.find(s => s.value === item.review_status);

                                  return (
                                    <tr key={item.id} className="bg-white hover:bg-purple-50">
                                      <td className="border border-purple-300 p-3">{item.sn}</td>
                                      <td className="border border-purple-300 p-3">
                                        {pageMode !== 'view' ? (
                                          <>
                                            <input
                                              type="file"
                                              onChange={(e) => handleFileUpload(e, 'work_methodology', index)}
                                              className="w-full"
                                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                              disabled={!item.document_name}
                                            />
                                            {item.document && (
                                              <div className="mt-1">
                                                <span className="text-xs text-green-600">✓ Uploaded</span>
                                                <button
                                                  type="button"
                                                  onClick={() => window.open(item.document, '_blank')}
                                                  className="text-blue-600 text-xs ml-2 hover:underline"
                                                >
                                                  View
                                                </button>
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          <span>{item.document_name}</span>
                                        )}
                                      </td>
                                      <td className="border border-purple-300 p-3">{item.contractor_submission_date}</td>
                                      <td className="border border-purple-300 p-3">{item.approval_date}</td>
                                      <td className="border border-purple-300 p-3">
                                        {reviewStatus && (
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${reviewStatus.color}`}>
                                            {reviewStatus.label}
                                          </span>
                                        )}
                                      </td>
                                      <td className="border border-purple-300 p-3">
                                        {pageMode !== 'view' ? (
                                          <input
                                            type="file"
                                            onChange={(e) => handleFileUpload(e, 'work_methodology', index)}
                                            className="w-full"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                          />
                                        ) : item.document ? (
                                          <button
                                            type="button"
                                            onClick={() => window.open(item.document, '_blank')}
                                            className="text-blue-600 hover:underline text-sm"
                                          >
                                            View Document
                                          </button>
                                        ) : (
                                          <span className="text-gray-400 text-sm">No document</span>
                                        )}
                                      </td>
                                      {pageMode !== 'view' && (
                                        <td className="border border-purple-300 p-3">
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveWorkMethodologyData(index)}
                                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </td>
                                      )}
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={pageMode !== 'view' ? 7 : 6} className="border border-purple-300 p-4 text-center text-gray-500">
                                    No work methodology documents added yet. {pageMode !== 'view' && 'Click "Add Document" to add.'}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>


              {/* FORM BUTTONS - Only show in create/edit mode */}
              {pageMode !== 'view' && (
                <div className="flex flex-col sm:flex-row justify-end gap-4 mt-12 pt-8 border-t">
                  <button
                    onClick={onCancel}
                    type="button"
                    className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
                  >
                    {pageMode === 'edit' ? 'Update Contract' : 'Save Contract'}
                  </button>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ✅ Main Component
export default function ContractorForm() {
  const initialForm: FormData = {
    tenderRefNo: "",
    work_id: "",
    agreement_no: "",
    agency_name: "",
    authorized: "",
    address: "",
    phone: "",
    alternate_phone: "",
    email: "",
    alternate_email: "",
    contract_amount: "",
    start_date: "",
    stipulated_date: "",
    actual_date_of_completion: "",
    key_personnel: [],
    equipment: [],
    social_data: [],
    environmental_data: [],
    work_methodology_data: [],
  };

  const [mode, setMode] = useState<'list' | 'create' | 'view' | 'edit'>('list');
  const [selectedContractId, setSelectedContractId] = useState<string | number | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState<FormData>(initialForm);
  const storedProfile = sessionStorage.getItem("userdetail");
  const user = storedProfile ? JSON.parse(storedProfile) : null;
  const [showHistory, setShowHistory] = useState(false);
  const { data: contracts = [] } = useContracts();
  const createContractMutation = useCreateContract();
  const updateContractMutation = useUpdateContract(); // ✅ Added update hook
  const { data: contractDetails, isLoading: isContractLoading, refetch } = useContractById(selectedContractId);

    const filteredContracts = useMemo(() => {
    if (!contracts || contracts.length === 0) return [];
    if (user?.division_id) {
      const userDivisionContracts = contracts.filter((contract: any) => {
        const contractDivisionId = contract.division_id || contract.work_division_id || contract.division;
        return contractDivisionId === user.division_id;
      });

      console.log(`✅ Filtered ${userDivisionContracts.length} contracts out of ${contracts.length} for user's division`);
      return userDivisionContracts;
    }
    else if (user?.circle_id) {
      const userDivisionContracts = contracts.filter((contract: any) => {
        const contractDivisionId = contract.circle_id || contract.work_division_id || contract.division;
        return contractDivisionId === user.circle_id;
      });

      console.log(`✅ Filtered ${userDivisionContracts.length} contracts out of ${contracts.length} for user's division`);
      return userDivisionContracts;

    }
    else if (user?.zone_id) {
      const userDivisionContracts = contracts.filter((contract: any) => {
        const contractDivisionId = contract.zone_id || contract.work_division_id || contract.division;
        //console.log(`Contract ${contract.id}: division_id = ${contractDivisionId}, user division_id = ${user.division_id}`);
        return contractDivisionId === user.zone_id;
      });

      console.log(`✅ Filtered ${userDivisionContracts.length} contracts out of ${contracts.length} for user's division`);
      return userDivisionContracts;

    }

    console.log("ℹ️ No user division_id found, showing all contracts");
    return contracts;
  }, [contracts, user?.division_id, user?.circle_id, user?.zone_id]);
  useEffect(() => {
    if (contractDetails && selectedContractId) {
      console.log("📋 Loaded contract details:", contractDetails);

      setSelectedContract(contractDetails);

      // Format dates to YYYY-MM-DD for input fields
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        try {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        } catch (e) {
          return dateString;
        }
      };

      // Fill form with contract data for viewing/editing
      const formattedData: FormData = {
        tenderRefNo: contractDetails.tenderrefno || "",
        work_id: contractDetails.work_id?.toString() || "",
        agreement_no: contractDetails.agreement_no || "",
        agency_name: contractDetails.contractor_name || "",
        authorized: contractDetails.nameofauthrizeperson || "",
        address: contractDetails.agency_address || "",
        phone: contractDetails.mobileno || "",
        alternate_phone: contractDetails.alternate_mobile || "",
        email: contractDetails.email || "",
        alternate_email: contractDetails.alternate_email || "",
        contract_amount: contractDetails.contract_awarded_amount?.toString() || "",
        start_date: formatDateForInput(contractDetails.work_commencement_date) ||
          formatDateForInput(contractDetails.start_date_formatted) || "",
        stipulated_date: formatDateForInput(contractDetails.work_stipulated_date) ||
          formatDateForInput(contractDetails.completion_date_formatted) || "",
        actual_date_of_completion: formatDateForInput(contractDetails.actual_date_of_completion) || "",
        key_personnel: contractDetails.key_personnel?.map((person: any) => ({
          id: person.id?.toString() || `${person.personnel_type}_${Date.now()}`,
          role: person.personnel_type,
          persons: [{
            name: person.name || "",
            contact: person.mobile_no || ""
          }]
        })) || [],
        equipment: contractDetails.equipment?.map((equip: any) => ({
          type: equip.equipment_type,
          quantity_bid: equip.Quantity_per_bid_document?.toString() || "",
          quantity_site: equip.Quantity_per_site?.toString() || ""
        })) || [],
        social_data: contractDetails.social_data?.map((social: any) => ({
          id: social.id?.toString(),
          sn: social.sn?.toString() || "",
          particular: social.particular || "",
          other_particular: social.other_particular || "",
          obtained: social.obtained || "no",
          issue_date: formatDateForInput(social.issue_date) || "",
          valid_up_to: formatDateForInput(social.valid_up_to) || "",
          document: social.document || "",
          remarks: social.remarks || ""
        })) || [],
        environmental_data: contractDetails.environmental_data?.map((env: any) => ({
          id: env.id?.toString(),
          sno: env.sno?.toString() || "",
          clearance_authorization: env.clearance_authorization || "",
          other_clearance: env.other_clearance || "",
          obtained: env.obtained || "no",
          issue_date: formatDateForInput(env.issue_date) || "",
          valid_up_to: formatDateForInput(env.valid_up_to) || "",
          document: env.document || "",
          remarks: env.remarks || ""
        })) || [],
        work_methodology_data: contractDetails.work_methodology_data?.map((method: any) => ({
          id: method.id?.toString(),
          sn: method.sn?.toString() || "",
          document_name: method.document_name || "",
          other_document: method.other_document || "",
          contractor_submission_date: formatDateForInput(method.contractor_submission_date) || "",
          approval_date: formatDateForInput(method.approval_date) || "",
          review_status: method.review_status || "",
          resubmission_date: formatDateForInput(method.resubmission_date) || "",
          document: method.document || "",
          remark: method.remark || ""
        })) || [],
        inserted_by: contractDetails.inserted_by,
        division_id: contractDetails.division_id,
        updated_by: contractDetails.updated_by,
      };

      console.log("📝 Formatted form data:", formattedData);
      setFormData(formattedData);
    }
  }, [contractDetails, selectedContractId]);

  // ✅ HANDLE VIEW CONTRACT
  const handleViewContract = (contract: Contract) => {
    setSelectedContractId(contract.id);
    setMode('view');
  };

  // ✅ HANDLE ADD NEW CONTRACT
  const handleAddNewContract = () => {
    setSelectedContractId(null);
    setSelectedContract(null);
    setFormData(initialForm);
    setMode('create');
  };

  // ✅ HANDLE EDIT CONTRACT
  const handleEditContract = () => {
    // Refresh contract data before editing
    if (selectedContractId) {
      refetch().then(() => {
        setMode('edit');
      });
    } else {
      setMode('edit');
    }
  };

  // ✅ HANDLE VIEW HISTORY
  const handleViewHistory = () => {
    setShowHistory(true);
  };

  // ✅ HANDLE CLOSE HISTORY
  const handleCloseHistory = () => {
    setShowHistory(false);
  };

  // ✅ HANDLE BACK TO LIST
  const handleBackToList = () => {
    setMode('list');
    setSelectedContractId(null);
    setSelectedContract(null);
    setFormData(initialForm);
    setShowHistory(false);
  };

  // ✅ HANDLE FORM SUBMIT - UPDATED
  const handleFormSubmit = (submittedFormData: FormData) => {
    // Prepare form data, ensuring existing document paths are preserved
    const preparedFormData = {
      ...submittedFormData,
      social_data: submittedFormData.social_data.map(item => ({
        ...item,
        // If document is a path (not base64), keep it as is
        document: item.document?.startsWith('/uploads/') ? item.document : item.document
      })),
      environmental_data: submittedFormData.environmental_data.map(item => ({
        ...item,
        document: item.document?.startsWith('/uploads/') ? item.document : item.document
      })),
      work_methodology_data: submittedFormData.work_methodology_data.map(item => ({
        ...item,
        document: item.document?.startsWith('/uploads/') ? item.document : item.document
      })),
      ...(mode === 'create' && {
        inserted_by: user?.email || "Unknown",
        division_id: user?.division_id
      }),
      ...(mode === 'edit' && selectedContractId && {
        updated_by: user?.email || "Unknown",
      }),
    };

    console.log("📤 Submitting form:", {
      mode,
      documentStats: {
        social: preparedFormData.social_data.map(s => ({
          particular: s.particular,
          isBase64: s.document?.startsWith('data:'),
          isPath: s.document?.startsWith('/uploads/')
        })),
        environmental: preparedFormData.environmental_data.map(e => ({
          clearance: e.clearance_authorization,
          isBase64: e.document?.startsWith('data:'),
          isPath: e.document?.startsWith('/uploads/')
        }))
      }
    });
    // ✅ Prepare data with logged user details

    const currentTimestamp = new Date().toISOString();

    const formDataWithUser = {
      ...submittedFormData,
      // ✅ Add audit fields for CREATE
      ...(mode === 'create' && {
        inserted_by: user?.email || "Unknown",
        division_id: user?.division_id
      }),
      // ✅ Add audit fields for UPDATE
      ...(mode === 'edit' && selectedContractId && {
        updated_by: user?.email || "Unknown",
        updatedAt: currentTimestamp,
      }),
    };

    console.log("📤 Submitting form with user details:", {
      mode,
      user,
      formDataWithUser
    });

    if (mode === 'edit' && selectedContractId) {
      // ✅ UPDATE EXISTING CONTRACT
      updateContractMutation.mutate(
        {
          id: selectedContractId,
          data: formDataWithUser
        },
        {
          onSuccess: (data) => {
            console.log("✅ Contract updated successfully:", data);
            alert(`✅ Contract updated successfully!`);
            setMode('view');
            refetch();
          },
          onError: (err: any) => {
            console.error("❌ Contract update error:", err);
            alert(`❌ Error: ${err.message || "Failed to update contract"}`);
          }
        }
      );
    } else {
      // ✅ CREATE NEW CONTRACT
      createContractMutation.mutate(formDataWithUser, {
        onSuccess: (data) => {
          alert(`✅ Contract saved successfully! ID: ${data.id}`);
          handleBackToList();
        },
        onError: (err: any) => {
          console.error("Contract save error:", err);
          alert(`❌ Failed to save contract: ${err.message}`);
        },
      });
    }
  };

  // ✅ HANDLE CANCEL FORM
  const handleCancelForm = () => {
    if (mode === 'edit') {
      setMode('view');
    } else {
      handleBackToList();
    }
  };

  // ✅ Loading states
  const isLoading = (mode === 'view' || mode === 'edit') && isContractLoading && selectedContractId;

  // Show loading when contract details are being fetched
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contract details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="max-w-7xl mx-auto">
        {mode === 'list' ? (
          <ContractsList
            user={user}
            contracts={filteredContracts}
            onViewContract={handleViewContract}
            onAddNew={handleAddNewContract}
          />
        ) : (
          <ContractorFormComponent
            initialForm={formData}
            onCancel={handleCancelForm}
            onSubmit={handleFormSubmit}
            pageMode={mode}
            viewContractData={selectedContract}
            onEdit={handleEditContract}
            onBackToList={handleBackToList}
            onViewHistory={handleViewHistory}
            user={user}
          />
        )}
      </div>

      {/* ✅ Contract History Modal */}
      <ContractHistory
        contractId={selectedContractId}
        isOpen={showHistory}
        onClose={handleCloseHistory}
      />
    </div>
  );
}