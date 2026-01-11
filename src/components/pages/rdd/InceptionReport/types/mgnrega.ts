// types/mgnrega.ts
export interface MGNREGAInspectionFormData {
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

export interface PhysicalStatus {
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

export interface PhysicalStatusPartB {
  photographsTaken: boolean | null;
  geoTaggedPhotosUploaded: boolean | null;
  measurementBookUpdated: boolean | null;
}

export interface QualityAssessment {
  qualityOfEarthwork: 'Good' | 'Satisfactory' | 'Poor' | '';
  qualityOfLiningMaterials: boolean | null;
  properCompaction: boolean | null;
  properSlope: boolean | null;
  waterFlowTested: boolean | null;
}

export interface NonConformanceReport {
  dateOfInspection: string;
  detailOfObservation: string;
  remedialMeasures: string;
  actionDate: string;
  detailOfActionTaken: string;
  observationOfOfficials: string;
  status: 'Pending' | 'Closed' | '';
}