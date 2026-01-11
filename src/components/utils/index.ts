export interface WUAData {
  slNo: number;
  nameOfSystem: string;
  ceZone: string;
  circle: string;
  division: string;
  subDivision: string;
  canalDetails: string;
  nameOfWUA: string;
  discharge: number;
  offTaking: string;
  position: string;
  length: number;
  villagesCovered: string[];
  gramPanchayats: string[];
  ayacutArea: number;
  dateOfConstitution: string;
  presentStatus: 'Functional' | 'Non-functional' | 'New' | 'Active';
  dateOfExpiry: string;
  block: string;
  district: string;
  remarks: string;
}

export interface VLCData {
  id: string;
  wuaName: string;
  villageName: string;
  members: VLCMember[];
  executiveBody: ExecutiveMember[];
  formationDate: string;
  status: 'Active' | 'Inactive';
}

export interface VLCMember {
  name: string;
  gender: 'Male' | 'Female';
  category: 'Gen' | 'ST' | 'SC' | 'OBC';
  khataNo: string;
  plotNos: string[];
  rakaba: number;
  position: 'Head Reach' | 'Middle Reach' | 'Tail Reach';
  landSize: 'Marginal<1 Ha' | 'Small1-2 Ha' | 'Semi Medium 2-4 Ha' | 'Medium 4-10 Ha' | 'Large>10 Ha';
  landless: boolean;
  seasonalMigratingLabour: boolean;
  rationCard: boolean;
  contactNo: string;
}

export interface ExecutiveMember {
  name: string;
  designation: 'Chairman' | 'Vice President' | 'Secretary' | 'Treasurer' | 'Member';
  electionDate: string;
  gender: 'Male' | 'Female';
  category: 'Gen' | 'ST' | 'SC' | 'OBC';
  landSize: 'Marginal<1 Ha' | 'Small1-2 Ha' | 'Semi Medium 2-4 Ha' | 'Medium 4-10 Ha' | 'Large>10 Ha';
  landless: boolean;
  rationCard: boolean;
  contactNo: string;
}

export interface SLCData {
  id: string;
  name: string;
  section: string;
  subDivision: string;
  circle: string;
  zone: string;
  vlcsInvolved: string[];
  generalBody: SLCGBMember[];
  executiveBody: ExecutiveMember[];
  formationDate: string;
  lastReElection: string;
  nextReElection: string;
}

export interface SLCGBMember {
  name: string;
  vlcRepresenting: string;
  gender: 'Male' | 'Female';
  category: 'Gen' | 'ST' | 'SC' | 'OBC';
  contactNo: string;
}