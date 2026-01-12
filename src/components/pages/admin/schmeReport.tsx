import React, { useState, useEffect, useMemo } from 'react';
import MilestonePage from '@/components/pages/wrd/milestone/dailyprogress';
import LengthProgressPage from '@/components/pages/wrd/Length/length';
import { formatDate } from '@/components/lib/dateFormatter';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import ViewIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import WorkIcon from "@mui/icons-material/Assignment";
import MilestoneIcon from "@mui/icons-material/Timeline";
import TenderIcon from "@mui/icons-material/Description";
import ContractIcon from "@mui/icons-material/Gavel";
import SocialIcon from "@mui/icons-material/Groups";
import ReportIcon from "@mui/icons-material/Assessment";

// Import React Query hooks
import { useRepWorks, useREPMilestones, useREPTender, useREPContract, useREPLength } from '@/hooks/wrdHooks/reports/useReport';
import { useFileUrl } from "@/hooks/wrdHooks/useTenders";
import { Trees } from 'lucide-react';

// Types definitions
interface Work {
  id: number;
  work_name: string;
  package_number: string;
  work_cost: number;
  target_km: number;
  zone_name: string;
  contractor_name: string;
  award_status: string;
  Zone_name?: string; // Optional for backward compatibility
  circle_name?: string; // Optional for backward compatibility
  division_name?: string; // Optional for backward compatibility
  Area_Under_improved_Irrigation?: number;
  total_population?: number;
  milestones?: Milestone[];
  equipment?: Equipment[];
  keyPersonnel?: KeyPersonnel[];
  tender?: TenderData | null;
  contract?: ContractData | null;
  lengthData?: LengthData;
  socialData?: SocialData[];
  environmentalData?: EnvironmentalData[];
}

interface TenderDocument {
  label: string;
  file: string;
}

interface TenderData {
  tenderRefNo: string;
  agreement_no: string;
  tenderAuthority: string;
  emdfee: string;
  bid_security: string;
  tenderValidity: string;
  tender_status: string;
  nitfile?: string;
  newspaperdetails?: string;
  salesfile?: string;
  preBidUpload?: string;
  corrigendumUpload?: string;
  bidsUpload?: string;
  techBidopeningUpload?: string;
  techbidevaluationUpload?: string;
  financialEvaluation?: string;
  loaUpload?: string;
  contractUpload?: string;
}

interface ContractData {
  contractor_name: string;
  agreement_no: string;
  contract_awarded_amount: number;
  work_commencement_date: string;
  work_stipulated_date: string;
  nameofauthrizeperson: string;
  mobileno: string;
  email: string;
  agency_address: string;
  equipment?: Equipment[];
  key_personnel?: KeyPersonnel[];
  social_data?: SocialData[];
  environmental_data?: EnvironmentalData[];
  work_methodology_data?: any[];
  Area_Under_improved_Irrigation?: number | string;
}

interface KeyPersonnel {
  personnel_type: string;
  name: string;
  mobile_no: string;
  is_primary: boolean;
}

interface Equipment {
  equipment_type: string;
  Quantity_per_bid_document: number;
  Quantity_per_site: number;
}

interface Milestone {
  milestone_number: string;
  milestone_name: string;
  component_name: string;
  work_start_date: string;
  work_stipulated_date: string;
  work_actualcompletion_date?: string;
  status: string;
  achievement_percentage: number;
}

interface LengthData {
  lining_done_km: number;
  earthwork_done_km: number;
}

interface EnvironmentalData {
  clearance_authorization: string;
  obtained: string;
  issue_date?: string;
  valid_up_to?: string;
  document?: string;
}

interface SocialData {
  particular: string;
  obtained: string;
  issue_date?: string;
  valid_up_to?: string;
  document?: string;
}

interface WorkDetails extends Work {
  tender: TenderData | null;
  contract: ContractData | null;
  milestones: Milestone[];
  lengthData: LengthData;
  equipment: Equipment[];
  keyPersonnel: KeyPersonnel[];
  beneficiaries: any[];
  villages: any[];
  components: any[];
  socialData: SocialData[];
  environmentalData: EnvironmentalData[];
  workMethodologyData: any[];
}

interface TabConfig {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

const SuperAdminReportPage: React.FC = () => {
  const [filteredWorks, setFilteredWorks] = useState<Work[]>([]);
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showMilestoneDetails, setShowMilestoneDetails] = useState<boolean>(false);
  const [selectedWorkForMilestones, setSelectedWorkForMilestones] = useState<Work | null>(null);
  const [showLengthDetails, setShowLengthDetails] = useState<boolean>(false);
  const [selectedWorkForLength, setSelectedWorkForLength] = useState<Work | null>(null);
  const getFileUrl = useFileUrl();

  // Use React Query hooks
  const { data: works = [], isLoading, error } = useRepWorks();
  
  // Find selected work from works list
  const selectedWork = useMemo(() => {
    return works.find((w: Work) => w.id === selectedWorkId) || null;
  }, [works, selectedWorkId]);
  
  // Fetch tender data for selected work
  const { 
    data: tenderData,
    isLoading: tenderLoading,
    isError: tenderError
  } = useREPTender(selectedWorkId?.toString() || '');
  
  // Fetch contract data for selected work
  const { 
    data: contractData,
    isLoading: contractLoading,
    isError: contractError
  } = useREPContract(selectedWorkId?.toString() || '');
  
  const { 
    data: lengthData = { lining_done_km: 0, earthwork_done_km: 0 },
    isLoading: lengthLoading,
    isError: lengthError
  } = useREPLength(selectedWorkId?.toString() || '');
  
  // Fetch milestones for selected work
  const workId = selectedWork?.id;
  
  const {
    data: milestonesData = [],
    isLoading: milestonesLoading,
    isError: milestonesError
  } = useREPMilestones(workId?.toString() || '');

  // Extract equipment and personnel from contract data
  const equipmentData = useMemo(() => {
    if (!contractData) return [];
    // Extract equipment from contract
    return contractData.equipment || [];
  }, [contractData]);

  const keyPersonnelData = useMemo(() => {
    if (!contractData) return [];
    // Extract key personnel from contract
    return contractData.key_personnel || [];
  }, [contractData]);

  // Combine all data for selected work
  const selectedWorkDetails = useMemo<WorkDetails | null>(() => {
    if (!selectedWork) return null;

    return {
      ...selectedWork,
      tender: tenderData || null,
      contract: contractData || null,
      milestones: milestonesData || [],
      lengthData: lengthData || { lining_done_km: 0, earthwork_done_km: 0 },
      equipment: equipmentData || [],
      keyPersonnel: keyPersonnelData || [],
      beneficiaries: [],
      villages: [],
      components: [],
      socialData: contractData?.social_data || [],
      environmentalData: contractData?.environmental_data || [],
      workMethodologyData: contractData?.work_methodology_data || []
    };
  }, [selectedWork, tenderData, contractData, milestonesData, lengthData, equipmentData, keyPersonnelData]);

  // Tab configurations
  const tabs: TabConfig[] = [
  { id: 'summary', label: 'Summary', icon: <ReportIcon /> },
  { id: 'tender', label: 'Tender', icon: <TenderIcon /> },
  { id: 'contract', label: 'Contract', icon: <ContractIcon /> },
  { id: 'environmental', label: 'Environmental', icon: <Trees className="w-5 h-5" /> },
  { id: 'social', label: 'Social', icon: <SocialIcon /> },
  { id: 'milestones', label: 'Milestones', icon: <MilestoneIcon /> },
  { id: 'length', label: 'Length'},
];

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredWorks(works);
    } else {
      const filtered = works.filter((work: Work) =>
        (work.work_name?.toLowerCase().includes(term) || false) ||
        (work.package_number?.toLowerCase().includes(term) || false) ||
        (work.Zone_name?.toLowerCase().includes(term) || false) ||
        (work.circle_name?.toLowerCase().includes(term) || false) ||
        (work.division_name?.toLowerCase().includes(term) || false) ||
        (work.contractor_name?.toLowerCase().includes(term) || false) ||
        (work.award_status?.toLowerCase().includes(term) || false)
      );
      setFilteredWorks(filtered);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (works.length === 0) {
      alert('No data available to export');
      return;
    }

    try {
      // Create an array to hold all worksheets
      const workbook = XLSX.utils.book_new();

      // 1. Main Works Summary Sheet
      const worksSheetData = works.map((work: Work, index: number) => ({
        'S.No.': index + 1,
        'Work ID': work.id,
        'Work Name': work.work_name,
        'Package Number': work.package_number,
        'Zone': work.zone_name,
        'Circle': work.circle_name || '',
        'Division': work.division_name || '',
        'Contractor': work.contractor_name,
        'Award Status': work.award_status,
        'Estimated Cost (₹)': work.work_cost,
        'Target Length (KM)': work.target_km,
        'Area Under Improved Irrigation': work.Area_Under_improved_Irrigation || 0,
        'Total Population': work.total_population || 0,
      }));

      const worksSheet = XLSX.utils.json_to_sheet(worksSheetData);
      XLSX.utils.book_append_sheet(workbook, worksSheet, 'Works Summary');

      // 2. Milestones Sheet
      const allMilestones: any[] = [];
      works.forEach((work: Work) => {
        work.milestones?.forEach((milestone: Milestone) => {
          allMilestones.push({
            'Work Name': work.work_name,
            'Package Number': work.package_number,
            'Milestone Number': milestone.milestone_number,
            'Milestone Name': milestone.milestone_name,
            'Component': milestone.component_name,
            'Start Date': formatDate(milestone.work_start_date),
            'Stipulated Date': formatDate(milestone.work_stipulated_date),
            'Completion Date': formatDate(milestone.work_actualcompletion_date || ''),
            'Status': milestone.status,
            'Achievement %': milestone.achievement_percentage,
          });
        });
      });

      if (allMilestones.length > 0) {
        const milestonesSheet = XLSX.utils.json_to_sheet(allMilestones);
        XLSX.utils.book_append_sheet(workbook, milestonesSheet, 'Milestones');
      }

      // 3. Equipment Sheet
      const allEquipment: any[] = [];
      works.forEach((work: Work) => {
        work.equipment?.forEach((item: Equipment) => {
          const diff = item.Quantity_per_bid_document - item.Quantity_per_site;
          allEquipment.push({
            'Work Name': work.work_name,
            'Package Number': work.package_number,
            'Equipment Type': item.equipment_type,
            'As per Bid': item.Quantity_per_bid_document,
            'Available at Site': item.Quantity_per_site,
            'Difference': diff,
            'Status': diff > 0 ? 'Shortage' : diff < 0 ? 'Excess' : 'Adequate',
          });
        });
      });

      if (allEquipment.length > 0) {
        const equipmentSheet = XLSX.utils.json_to_sheet(allEquipment);
        XLSX.utils.book_append_sheet(workbook, equipmentSheet, 'Equipment');
      }

      // 4. Key Personnel Sheet
      const allPersonnel: any[] = [];
      works.forEach((work: Work) => {
        work.keyPersonnel?.forEach((person: KeyPersonnel) => {
          allPersonnel.push({
            'Work Name': work.work_name,
            'Package Number': work.package_number,
            'Personnel Type': person.personnel_type,
            'Name': person.name,
            'Mobile': person.mobile_no,
            'Primary Contact': person.is_primary ? 'Yes' : 'No',
          });
        });
      });

      if (allPersonnel.length > 0) {
        const personnelSheet = XLSX.utils.json_to_sheet(allPersonnel);
        XLSX.utils.book_append_sheet(workbook, personnelSheet, 'Key Personnel');
      }

      // 5. Contract Details Sheet
      const contractDataForSheet = works
        .filter((work: { contract: any; }) => work.contract)
        .map((work: Work) => ({
          'Work Name': work.work_name,
          'Package Number': work.package_number,
          'Contractor': work.contract?.contractor_name || '',
          'Agreement No': work.contract?.agreement_no || '',
          'Contract Amount': work.contract?.contract_awarded_amount || 0,
          'Work Commencement Date': formatDate(work.contract?.work_commencement_date || ''),
          'Work Stipulated Date': formatDate(work.contract?.work_stipulated_date || ''),
          'Authorized Person': work.contract?.nameofauthrizeperson || '',
          'Mobile': work.contract?.mobileno || '',
          'Email': work.contract?.email || '',
          'Address': work.contract?.agency_address || '',
        }));

      if (contractDataForSheet.length > 0) {
        const contractSheet = XLSX.utils.json_to_sheet(contractDataForSheet);
        XLSX.utils.book_append_sheet(workbook, contractSheet, 'Contract Details');
      }

      // 6. Tender Details Sheet
      const tenderDataForSheet = works
        .filter((work: { tender: any; }) => work.tender)
        .map((work: Work) => ({
          'Work Name': work.work_name,
          'Package Number': work.package_number,
          'Tender Ref No': work.tender?.tenderRefNo || '',
          'Agreement No': work.tender?.agreement_no || '',
          'Tender Authority': work.tender?.tenderAuthority || '',
          'EMD Fee': work.tender?.emdfee || '',
          'Bid Security': work.tender?.bid_security || '',
          'Tender Validity': work.tender?.tenderValidity || '',
          'Tender Status': work.tender?.tender_status || '',
        }));

      if (tenderDataForSheet.length > 0) {
        const tenderSheet = XLSX.utils.json_to_sheet(tenderDataForSheet);
        XLSX.utils.book_append_sheet(workbook, tenderSheet, 'Tender Details');
      }

      // 7. Progress Summary Sheet
      const progressData = works.map((work: Work) => {
        const targetLength = Number(work.target_km || 0);
        const achievedLining = Number(work.lengthData?.lining_done_km || 0);
        const achievementPercent = targetLength > 0 ? 
          ((achievedLining / targetLength) * 100).toFixed(2) : 0;

        return {
          'Work Name': work.work_name,
          'Package Number': work.package_number,
          'Target Length (KM)': targetLength,
          'Lining Done (KM)': achievedLining,
          'Earthwork Done (KM)': work.lengthData?.earthwork_done_km || 0,
          'Achievement %': achievementPercent,
          'Remaining Length': (targetLength - achievedLining).toFixed(2),
          'Total Milestones': work.milestones?.length || 0,
          'Completed Milestones': work.milestones?.filter((m: Milestone) => 
            m.status === 'Completed').length || 0,
          'Area Under Improved Irrigation': work.Area_Under_improved_Irrigation || 0,
          'Beneficiary Population': work.total_population || 0,
        };
      });

      const progressSheet = XLSX.utils.json_to_sheet(progressData);
      XLSX.utils.book_append_sheet(workbook, progressSheet, 'Progress Summary');

      // 8. Social & Environmental Clearances Sheet
      const clearanceData: any[] = [];
      
      // Social Data
      works.forEach((work: Work) => {
        work.socialData?.forEach((item: SocialData) => {
          clearanceData.push({
            'Type': 'Social',
            'Work Name': work.work_name,
            'Package Number': work.package_number,
            'Particular': item.particular,
            'Obtained': item.obtained === 'yes' ? 'Yes' : 'No',
            'Issue Date': formatDate(item.issue_date || ''),
            'Valid Up To': formatDate(item.valid_up_to || ''),
            'Document': item.document ? 'Available' : 'Not Available',
          });
        });
      });

      // Environmental Data
      works.forEach((work: Work) => {
        work.environmentalData?.forEach((item: EnvironmentalData) => {
          clearanceData.push({
            'Type': 'Environmental',
            'Work Name': work.work_name,
            'Package Number': work.package_number,
            'Clearance/Authorization': item.clearance_authorization,
            'Obtained': item.obtained === 'yes' ? 'Yes' : 'No',
            'Issue Date': formatDate(item.issue_date || ''),
            'Valid Up To': formatDate(item.valid_up_to || ''),
            'Document': item.document ? 'Available' : 'Not Available',
          });
        });
      });

      if (clearanceData.length > 0) {
        const clearanceSheet = XLSX.utils.json_to_sheet(clearanceData);
        XLSX.utils.book_append_sheet(workbook, clearanceSheet, 'Clearances');
      }

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      });
      
      const data = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Save file
      const fileName = `SuperAdmin_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(data, fileName);
      
      console.log('Excel file exported successfully!');
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting data to Excel');
    }
  };

  // Update filtered works when works data changes
  useEffect(() => {
    if (works.length > 0) {
      setFilteredWorks(works);
    }
  }, [works]);

  // Check if any data is still loading for selected work
  const isSelectedWorkLoading = tenderLoading || contractLoading || milestonesLoading;

  // Fetch detailed data for a specific work
  const fetchWorkDetails = (workId: number) => {
    setSelectedWorkId(workId);
    setDialogOpen(true);
  };

  // Tab content renderer
  const renderTabContent = () => {
    if (!selectedWorkDetails) return null;

    const work = selectedWorkDetails;
    
    // Handle undefined tender safely
    const tenderDocuments: TenderDocument[] = work?.tender
      ? [
          { label: "NIT Document", file: work.tender.nitfile || '' },
          { label: "Newspaper Publication", file: work.tender.newspaperdetails || '' },
          { label: "Sale Notice", file: work.tender.salesfile || '' },
          { label: "Pre-Bid Minutes", file: work.tender.preBidUpload || '' },
          { label: "Corrigendum", file: work.tender.corrigendumUpload || '' },
          { label: "Bid Receipt", file: work.tender.bidsUpload || '' },
          { label: "Technical Bid Opening", file: work.tender.techBidopeningUpload || '' },
          { label: "Technical Evaluation", file: work.tender.techbidevaluationUpload || '' },
          { label: "Financial Evaluation", file: work.tender.financialEvaluation || '' },
          { label: "LOA", file: work.tender.loaUpload || '' },
          { label: "Contract Agreement", file: work.tender.contractUpload || '' },
        ].filter(doc => doc.file && doc.file.trim() !== '')
      : [];

    switch (activeTab) {
      case 0: // Summary
        return (
          <Grid container spacing={3}>
            {/* Work Details Card */}
            <Grid>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <WorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Work Details
                  </Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Work Name:</strong></TableCell>
                        <TableCell>{work.work_name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Package Number:</strong></TableCell>
                        <TableCell>{work.package_number}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Estimated Cost (Cr.):</strong></TableCell>
                        <TableCell>₹{work.work_cost?.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Length of Work (KM):</strong></TableCell>
                        <TableCell>{work.target_km} KM</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Zone:</strong></TableCell>
                        <TableCell>{work.zone_name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Circle:</strong></TableCell>
                        <TableCell>{work.circle_name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Division:</strong></TableCell>
                        <TableCell>{work.division_name}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>

            {/* Contract Status Card */}
            <Grid>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <ContractIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Contract Status
                  </Typography>
                  {work.contract ? (
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Contractor:</strong></TableCell>
                          <TableCell>{work.contract.contractor_name || work.contractor_name}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Agreement Number:</strong></TableCell>
                          <TableCell>{work.contract.agreement_no}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Contract Amount:</strong></TableCell>
                          <TableCell>₹{work.contract.contract_awarded_amount?.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Start Date of Work:</strong></TableCell>
                          <TableCell>  {formatDate(work.contract.work_commencement_date)} </TableCell>
                          
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Award Status:</strong></TableCell>
                          <TableCell>
                            <Chip 
                              label={work.award_status}
                              color={work.award_status === 'Awarded' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography color="textSecondary">No Contract Found</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Progress Summary Card */}
            <Grid>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <MilestoneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Progress Summary
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                        <Typography variant="h4">
                          {work.milestones?.length || 0}
                        </Typography>
                        <Typography variant="body2">Total Milestones</Typography>
                      </Paper>
                    </Grid>
                    <Grid>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                        <Typography variant="h4">
                          {work.Area_Under_improved_Irrigation || 0}
                        </Typography>
                        <Typography variant="body2">Area Under Improved Irrigation</Typography>
                      </Paper>
                    </Grid>
                    <Grid>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
                         <Typography variant="h4">
                          {work.total_population || 0}
                        </Typography>
                        <Typography variant="body2">People benefitting from improved irrigation infrastructure</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 5: // Milestones
        return (
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom>
                  Milestone Report
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setSelectedWorkForMilestones(selectedWork);
                    setShowMilestoneDetails(true);
                  }}
                  startIcon={<ViewIcon />}
                >
                  Detailed View
                </Button>
              </Box>
              
              {work.milestones?.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Milestone Number</strong></TableCell>
                        <TableCell><strong>Name</strong></TableCell>
                        {/* <TableCell><strong>Component</strong></TableCell> */}
                        <TableCell><strong>Start Date</strong></TableCell>
                        <TableCell><strong>Stipulated Date</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Achievement %</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {work.milestones.map((milestone: Milestone, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{milestone.milestone_number}</TableCell>
                          <TableCell>{milestone.milestone_name}</TableCell>
                          {/* <TableCell>{milestone.component_name}</TableCell> */}
                          <TableCell>  {milestone.work_start_date} </TableCell>
                          <TableCell>{milestone.work_stipulated_date}</TableCell>
                          <TableCell>
                            <Chip 
                              label={milestone.status}
                              color={
                                milestone.status === 'Completed' ? 'success' :
                                milestone.status === 'In Progress' ? 'warning' : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{milestone.achievement_percentage || 0}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary">No Milestone Data Available</Typography>
              )}
            </CardContent>
          </Card>
        );
    
      case 6: // Length
        const targetLength = Number(work.target_km || 0);
        const achievedLining = Number(work.lengthData?.lining_done_km || 0);
        const achievedEarthwork = Number(work.lengthData?.earthwork_done_km || 0);
        
        const remainingLength = (targetLength - achievedLining).toFixed(2);
        
        // Calculate percentage as number
        let achievementPercent = 0;
        if (targetLength > 0) {
          achievementPercent = Number(((achievedLining / targetLength) * 100).toFixed(2));
        }

        // Status logic
        const getStatusLabel = () => {
          if (achievementPercent >= 100) return "Completed";
          if (achievementPercent > 0) return "In Progress";
          return "Not Started";
        };

        const getStatusColor = () => {
          if (achievementPercent >= 100) return "success";
          if (achievementPercent > 0) return "warning";
          return "default";
        };

        return (
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Length Progress Report
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setSelectedWorkForLength(selectedWork);
                    setShowLengthDetails(true);
                  }}
                  startIcon={<ViewIcon />}
                >
                  Detailed View
                </Button>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Length of Work (KM)</strong></TableCell>
                      <TableCell>{targetLength} KM</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell><strong>Achieved Earthwork Length (KM)</strong></TableCell>
                      <TableCell>{achievedEarthwork.toFixed(2)} KM</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell><strong>Achieved Lining Length (KM)</strong></TableCell>
                      <TableCell>{achievedLining.toFixed(2)} KM</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell><strong>Remaining Length (KM)</strong></TableCell>
                      <TableCell>{remainingLength} KM</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell><strong>Achievement (%)</strong></TableCell>
                      <TableCell>
                        <Chip
                          label={`${achievementPercent}%`}
                          color={getStatusColor() as "success" | "warning" | "default"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel()}
                          color={getStatusColor() as "success" | "warning" | "default"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        );
      
      case 1: // Tender
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tender Details
              </Typography>
              {work.tender ? (
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Tender Ref Number:</strong></TableCell>
                        <TableCell>{work.tender.tenderRefNo}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Agreement Number:</strong></TableCell>
                        <TableCell>{work.tender.agreement_no}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Tender Authority:</strong></TableCell>
                        <TableCell>{work.tender.tenderAuthority}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Estimated cost (Cr.):</strong></TableCell>
                        <TableCell>₹{work.tender.emdfee}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Bid Security:</strong></TableCell>
                        <TableCell>{work.tender.bid_security}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Validity:</strong></TableCell>
                        <TableCell>{work.tender.tenderValidity} days</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Status:</strong></TableCell>
                        <TableCell>{work.tender.tender_status}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Documents:</strong></TableCell>
                        <TableCell>
                          {tenderDocuments.length === 0 ? (
                            <Typography variant="body2" color="textSecondary">
                              No documents uploaded
                            </Typography>
                          ) : (
                            <Table size="small">
                              <TableBody>
                                {tenderDocuments.map((doc: TenderDocument, index: number) => (
                                  <TableRow key={index}>
                                    <TableCell>{doc.label}</TableCell>
                                    <TableCell>
                                      <a
                                        href={getFileUrl(doc.file)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: "#1976d2" }}
                                      >
                                        View
                                      </a>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary">No Tender Data Available</Typography>
              )}
            </CardContent>
          </Card>
        );

      case 2: // Contract
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contract Report
              </Typography>
              {work.contract ? (
                <Grid container spacing={3}>
                  <Grid>
                    <Typography variant="subtitle1" gutterBottom>
                      Basic Details
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Agency / Company Name:</strong></TableCell>
                          <TableCell>{work.contract.contractor_name}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Agreement Number:</strong></TableCell>
                          <TableCell>{work.contract.agreement_no}</TableCell>
                        </TableRow>
                        <TableRow>     
                          <TableCell><strong>Contract Amount:</strong></TableCell>
                          <TableCell>₹{work.contract.contract_awarded_amount?.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Start Date of Work:</strong></TableCell>
                          <TableCell>
                            {formatDate(work.contract.work_commencement_date)} 
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Work Stipulated Date:</strong></TableCell>
                          <TableCell>
                             {formatDate(work.contract.work_stipulated_date)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Grid>
                  <Grid>
                    <Typography variant="subtitle1" gutterBottom>
                      Contact Info
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Authorized Person:</strong></TableCell>
                          <TableCell>{work.contract.nameofauthrizeperson}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Mobile:</strong></TableCell>
                          <TableCell>{work.contract.mobileno}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Email:</strong></TableCell>
                          <TableCell>{work.contract.email}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Address:</strong></TableCell>
                          <TableCell>{work.contract.agency_address}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <Box mt={4}>
                      <Typography variant="h6" gutterBottom>
                        Key Personnel
                      </Typography>

                      {work.keyPersonnel?.length > 0 ? (
                        <TableContainer component={Paper}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Personnel Type</strong></TableCell>
                                <TableCell><strong>Name</strong></TableCell>
                                <TableCell><strong>Mobile</strong></TableCell>
                                <TableCell><strong>Primary</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {work.keyPersonnel.map((person: KeyPersonnel, index: number) => (
                                <TableRow key={index}>
                                  <TableCell>{person.personnel_type}</TableCell>
                                  <TableCell>{person.name}</TableCell>
                                  <TableCell>{person.mobile_no}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={person.is_primary ? "Yes" : "No"}
                                      color={person.is_primary ? "success" : "default"}
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography color="textSecondary">
                          No Key Personnel Data Available
                        </Typography>
                      )}
                    </Box>
                    {/* Machinery / Equipment Section */}
                  <Box mt={4}>
  <Typography variant="h6" gutterBottom>
    Machinery / Equipment
  </Typography>

  {work.equipment?.length > 0 ? (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell><strong>Equipment Type</strong></TableCell>
            <TableCell><strong>As per Bid</strong></TableCell>
            <TableCell><strong>Available at Site</strong></TableCell>
            <TableCell><strong>Difference</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {work.equipment.map((item: Equipment, index: number) => {
            const difference = item.Quantity_per_bid_document - item.Quantity_per_site;
            
            return (
              <TableRow key={index}>
                <TableCell>{item.equipment_type}</TableCell>
                <TableCell>{item.Quantity_per_bid_document}</TableCell>
                <TableCell>{item.Quantity_per_site}</TableCell>
                <TableCell
                  sx={{
                    backgroundColor: 
                      difference > 0 
                        ? '#ffebee' // Light red for shortage (bid > site)
                        : difference < 0 
                        ? '#e8f5e9' // Light green for excess (site > bid)
                        : '#f5f5f5', // Light gray for equal
                    color: 
                      difference > 0 
                        ? '#c62828' // Dark red text
                        : difference < 0 
                        ? '#2e7d32' // Dark green text
                        : 'inherit',
                    fontWeight: difference !== 0 ? 'bold' : 'normal',
                    borderLeft: difference !== 0 ? '3px solid' : 'none',
                    borderLeftColor: 
                      difference > 0 
                        ? '#d32f2f' 
                        : '#388e3c'
                  }}
                >
                  {difference}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <Typography color="textSecondary">
      No Equipment Data Available
    </Typography>
  )}
</Box>
                  </Grid>
                </Grid>
              ) : (
                <Typography color="textSecondary">No Contract Data Available</Typography>
              )}
            </CardContent>
          </Card>
        );

      case 3: // Environmental
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Environmental Clearance Report
              </Typography>
              {work.environmentalData?.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Clearance/Authorization</strong></TableCell>
                        <TableCell><strong>Obtained</strong></TableCell>
                        <TableCell><strong>Issue Date</strong></TableCell>
                        <TableCell><strong>Valid Up To</strong></TableCell>
                        <TableCell><strong>Action</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {work.environmentalData.map((item: EnvironmentalData, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{item.clearance_authorization}</TableCell>
                          <TableCell>
                            <Chip 
                              label={item.obtained === 'yes' ? 'Yes' : 'No'}
                              color={item.obtained === 'yes' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatDate(item.issue_date) || '-'}</TableCell>
                          <TableCell>{formatDate(item.valid_up_to) || '-'}</TableCell>
                          <TableCell>
                            {item.document ? (
                              <a
                                href={getFileUrl(item.document)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#1976d2", fontWeight: 500 }}
                              >
                                View
                              </a>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary">No Environmental Data Available</Typography>
              )}
            </CardContent>
          </Card>
        );

      case 4: // Social
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Social Clearance Report
              </Typography>
              {work.socialData?.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Particular</strong></TableCell>
                        <TableCell><strong>Obtained</strong></TableCell>
                        <TableCell><strong>Issue Date</strong></TableCell>
                        <TableCell><strong>Valid Up To</strong></TableCell>
                        <TableCell><strong>Action</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {work.socialData.map((item: SocialData, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{item.particular}</TableCell>
                          <TableCell>
                            <Chip 
                              label={item.obtained === 'yes' ? 'Yes' : 'No'}
                              color={item.obtained === 'yes' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatDate(item.issue_date) || '-'}</TableCell>
                          <TableCell>{formatDate(item.valid_up_to) || '-'}</TableCell>
                          <TableCell>
                            {item.document ? (
                              <a
                                href={getFileUrl(item.document)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#1976d2", fontWeight: 500 }}
                              >
                                View
                              </a>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary">No Social Data Available</Typography>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            <ReportIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            Super Admin Composite Report
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={exportToExcel}
            disabled={works.length === 0}
          >
            Export to Excel
          </Button>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search by work name, package number, division, contractor..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading works: {(error as Error).message}
          </Alert>
        )}

        {/* Works Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white' }}><strong>S.No.</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Work Name</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Package Number</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Zone</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Circle</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Division</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Contractor</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Award Status</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Estimated Cost (Cr.)</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWorks.length > 0 ? (
                filteredWorks.map((work: Work, index: number) => (
                  <TableRow key={work.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {work.work_name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {work.package_number}
                      </Typography>
                    </TableCell>
                    <TableCell>{work.package_number}</TableCell>
                    <TableCell>{work.zone_name}</TableCell>
                    <TableCell>{work.circle_name}</TableCell>
                    <TableCell>{work.division_name}</TableCell>
                    <TableCell>{work.contractor_name || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={work.award_status}
                        color={work.award_status === 'Awarded' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>₹{work.work_cost?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => fetchWorkDetails(work.id)}
                        disabled={isSelectedWorkLoading}
                      >
                        View Report
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {searchTerm ? 'No results found' : 'No works available'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Work Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => {
          setDialogOpen(false);
          setSelectedWorkId(null);
        }}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedWork?.work_name} - {selectedWork?.package_number}
            </Typography>
            <IconButton onClick={() => {
              setDialogOpen(false);
              setSelectedWorkId(null);
            }} size="small">
              ✕
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e: React.SyntheticEvent, newValue: number) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {tabs.map((tab: TabConfig, index: number) => (
                <Tab 
                  key={tab.id}
                  label={tab.label}
                 icon={tab.icon as React.ReactElement}
                  iconPosition="start"
                  sx={{ minHeight: 60 }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Show loading state when data is being fetched */}
          {isSelectedWorkLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : selectedWorkDetails ? (
            renderTabContent()
          ) : (
            <Typography color="textSecondary" align="center" py={4}>
              No work details available
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => {
            setDialogOpen(false);
            setSelectedWorkId(null);
          }}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => {
              // Export selected work details
              console.log('Exporting selected work:', selectedWorkDetails);
              exportToExcel();
            }}
          >
            Download Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Milestone Details Dialog */}
      <Dialog 
        open={showMilestoneDetails} 
        onClose={() => {
          setShowMilestoneDetails(false);
          setSelectedWorkForMilestones(null);
        }}
        maxWidth="xl"
        fullWidth
        fullScreen
      >
        <DialogContent dividers sx={{ p: 0 }}>
          {selectedWorkForMilestones && (
            <MilestonePage 
              workId={selectedWorkForMilestones.id}
              packageNumber={selectedWorkForMilestones.package_number}
              workName={selectedWorkForMilestones.work_name}
              contractorName={selectedWorkForMilestones.contractor_name}
              onClose={() => {
                setShowMilestoneDetails(false);
                setSelectedWorkForMilestones(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
       
      {/* Length Details Dialog */}
      <Dialog 
        open={showLengthDetails} 
        onClose={() => {
          setShowLengthDetails(false);
          setSelectedWorkForLength(null);
        }}
        maxWidth="xl"
        fullWidth
        fullScreen
      >
        <DialogContent dividers sx={{ p: 0 }}>
          {selectedWorkForLength && (
            <LengthProgressPage 
              workId={selectedWorkForLength.id}
              packageNumber={selectedWorkForLength.package_number}
              workName={selectedWorkForLength.work_name}
              contractorName={selectedWorkForLength.contractor_name}
              onClose={() => {
                setShowLengthDetails(false);
                setSelectedWorkForLength(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default SuperAdminReportPage;