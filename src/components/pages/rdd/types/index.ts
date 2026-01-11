// Core Data Entry Types
export interface DataEntryFormData {
  // Location
  district: number;          // district_id as number
  districts: string;         // district_name as string (for display)
  block: string;             // block_id as string
  panchayat: string;         // panchayat_id as string

  // Work Details
  financialYear: string;
  workCode: string;
  workName: string;
  workCategory: string;      // work_category_id as string
  workType: string;          // work_type_id as string
  agency: string;

  // Measurements
  commandArea: string;
  propLength: string;
  propWidth: string;
  propHeight: string;
  sanctionAmtWages: string;
  sanctionAmtMaterial: string;

  // Timeline
  workStartDate: string;
  workCompletionDate: string;

  // Documents & Metadata
  remarks: string;
  asUpload: File | null;
  schemaType: string;
  userId: string;
}
export interface DataEntry {
  id: number;
  
  // Location
  district_id?: number;
  district_name?: string;
  district?: string;
  
  block_id?: number;
  block_name?: string;
  block?: string;
  
  panchayat_id?: number;
  panchayat_name?: string;
  panchayat?: string;
  
  // Work Details
  financial_year?: string;
  work_code?: string;
  work_name?: string;
  
  work_category_id?: number;
  work_category_name?: string;
  
  work_type_id?: number;
  work_type_name?: string;
  
  agency?: string;
  command_area?: number | null;
  
  // Status
  status: 'Approved' | 'Ongoing' | 'complete' | 'Suspended' | string;
  
  // Financials
  sanction_amt_wages?: number | string | null;
  sanction_amt_material?: number | string | null;
  
  // Proposed Dimensions
  prop_length?: number | string | null;
  prop_width?: number | string | null;
  prop_height?: number | string | null;
  
  // Dates
  work_start_date?: string | null;
  work_completion_date?: string | null;
  dated_at?: string | null;
  created_at?: string | null;
  
  // File
  as_upload?: string | null;
  remarks?: string | null;
  schema_type?: string;
  user_id?: number;
}

// Work Log Types
export interface WorkLog {
  id: number;
  data_entry_id: number;
  work_log_date: string;
  initial_upload?: string | null;
  final_upload?: string | null;
  remarks?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WorkLogStats {
  total: number;
  withImages: number;
  withoutImages: number;
  recentEntries: number;
}

// Data Table Props
export interface DataTableConfig {
  showStatusBadge?: boolean;
  showActions?: boolean;
  showDimensions?: boolean;
  showFinancials?: boolean;
  enableSorting?: boolean;
  enableSelection?: boolean;
}

// Location Types
export interface District {
  id: string;
  name: any;
  district_id: number;
  district_name: string;
}

export interface Block {
  districtId?: number;
  district_id?: number;
  block_id: number;
  block_name: string;
}

// export interface Panchayat {
//   gp_id: number;
//   gp_name: string;
//   block_id?: number;
// }

export interface GramPanchayat {
  gp_name: any;
  gp_id: number;
  panchayat_name: string; 
  block_id: number;
}

// Work Types
export interface WorkCategory {
  id: number;
  category_name: string;
}

export interface WorkSubCategory {
  id: number;
  sub_category_name: string;
  work_category_id?: number;
   requires_mgnrega?: boolean;
  condition_note?: string | null;
}

// Filter Types
export interface Filters {
  district: string;
  search: string;
  workCode: string;
  financialYear: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Form Props
export interface FormProps {
  formData: DataEntryFormData;
  setFormData: React.Dispatch<React.SetStateAction<DataEntryFormData>>;
  
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  backendErrors: Record<string, string>;
  setBackendErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  
  districts: District[];
  blocks: Block[];
  panchayats: GramPanchayat[];

  workCategories: WorkCategory[];
  subCategories: WorkSubCategory[];

  loading: boolean;
  districtResolved: boolean;
  setDistrictResolved?: React.Dispatch<React.SetStateAction<boolean>>;

  totalAmount: number;
  today: string;

  getFieldError: (fieldName: string) => string;
  subCategoriesLoading?: boolean;

  handleChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleNumberChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
  pagination?: PaginationInfo;
}

// Location Hierarchy
export interface LocationHierarchy {
  district: District;
  blocks: Block[];
  gramPanchayats: GramPanchayat[];
}

// Form Submission Payload
export interface DataEntryPayload {
  // Location
  district: number;
  block: number;
  panchayat: number;

  // Work Details
  financial_year: string;
  work_code: string;
  work_name: string;
  work_category: number;
  work_type: number;
  agency: string;

  // Measurements
  command_area: number;
  prop_length: number;
  prop_width: number;
  prop_height: number;
  sanction_amt_wages: number;
  sanction_amt_material: number;

  // Timeline
  work_start_date: string;
  work_completion_date: string;

  // Metadata
  remarks: string;
  schema_type: string;
  user_id: number;

  // File will be appended separately as FormData
}

// User Session Data
export interface UserSession {
  id: number;
  username: string;
  email: string;
  district_name: string;
  district_id?: number;
  role: string;
}

// Validation Error Type
export interface ValidationErrors {
  [key: string]: string[];
}

// Dropdown Option Type
export interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// Form Section Props
export interface FormSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

// Review Modal Data
export interface ReviewData {
  user: {
    name: string;
    id: string;
  };
  location: {
    district: string;
    block: string;
    panchayat: string;
  };
  work: {
    category: string;
    type: string;
    code: string;
    name: string;
  };
  financials: {
    year: string;
    wages: string;
    material: string;
    total: string;
  };
  dates: {
    start: string;
    completion: string;
  };
}

// API Data Types for Location
export interface ApiDistrict {
  district_id: number;
  district_name: string;
}

export interface ApiBlock {
  block_id: number | string; // Ma
  block_name: string;
  district_id: number;
}

export interface ApiGramPanchayat {
  gp_id: number;
  gp_name: string;
  block_id: number | string; // Ma
}

// React Query Hook Return Types
export interface UseQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

// Form Field Configuration
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'file' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: DropdownOption[];
  validation?: {
    pattern?: RegExp;
    min?: number;
    max?: number;
    message?: string;
  };
}

// Filter State
export interface FilterState {
  district: string;
  block: string;
  panchayat: string;
  workCategory: string;
  status: string;
  search: string;
  financialYear: string;
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

// Dashboard Stats
export interface DashboardStats {
  totalWorks: number;
  totalAmount: number;
  approvedWorks: number;
  ongoingWorks: number;
  completedWorks: number;
  suspendedWorks: number;
}