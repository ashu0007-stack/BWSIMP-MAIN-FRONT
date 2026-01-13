export interface Zone {
  zone_id: number;
  zone_name: string;
}

export interface Circle {
  circle_id: number;
  circle_name: string;
  zone_id: number;
}

export interface Division {
  division_id: number;
  division_name: string;
  circle_id: number;
}

export interface Component {
  id: number;
  component_name: string;
}

export interface SubComponent {
  id: number;
  work_component_name: string;
  component_id: number;
}

export interface SubworkComponent {
  id: number;
  work_package_name: string;
  work_component_id: number;
  length_of_work?: string;
  package_number?: string;
  status?: string;
}

export interface UserData {
  username: string;
  email: string;
  dept_id: number;
  role: string;
  department?: string;
  designation?: string;
  levelname?: string;
  levelid?: number;
  zone_id?: number;
  circle_id?: number;
  division_id?: number;
}

export interface Work {
  award_status: string;
  id: number;
  work_name: string;
  work_package_name: string;
  package_number?: string;
  work_cost?: string;
  division_name?: string;
  work_status?: string;
  created_at?: string;
  zone_name?: string;
  circle_name?: string;
  zone_id?: number;
  circle_id?: number;
  division_id?: number;
  target_km?: string;
  work_period_months?: string;
  component_id?: number;
  subcomponent_id?: number;
  workcomponentId?: number;
  subworkcoponent_id?: number;
  Area_Under_improved_Irrigation?: string;
  created_by?: string;
  created_email?: string;
  beneficiaries?: Beneficiaries;
  villages?: Village[];
  components?: WorkComponent[];
}

export interface Village {
  id?: number;
  village_name: string;
  block_name: string;
  gram_panchayat: string;
  district_name: string;
  census_population: string;
  male_population: string;
  female_population: string;
}

export interface WorkComponent {
  num_of_milestones: string;
  total_qty: string | number | readonly string[] | undefined;
  unitname: string | number | readonly string[] | undefined;
  nameofcomponent: string | number | readonly string[] | undefined;
  id?: number;
  componentname: string;
  totalQty: string;
  unit: string;
  Numberofmilestone: string;
  milestone1_qty: string;
  milestone2_qty: string;
  milestone3_qty: string;
  milestonedetails: string;
}

export interface Beneficiaries {
  id?: number;
  total_population: string;
  beneficiaries_youth_15_28: string;
  beneficiaries_female: string;
  beneficiaries_male: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface WorkFormData {
  zone_id: string;
  circle_id: string;
  division_id: string;
  component_id: string;
  subcomponent_id: string;
  workcomponentId: string;
  work_name: string;
  work_package_name: string;
  target_km: string;
  work_period_months: string;
  work_cost: string;
  package_number: string;
  package_details: string;
  district: string;
  dpr_cost: string;
  rfp_cost: string;
  Area_Under_improved_Irrigation: string;
  command_area_after: string;
  award_status: string;
}