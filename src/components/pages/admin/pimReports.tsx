import React, { useState, useEffect, useMemo } from 'react';
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
import SearchIcon from '@mui/icons-material/Search';
import ViewIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';
import TimelineIcon from '@mui/icons-material/Timeline';
import DocumentIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import LocationIcon from '@mui/icons-material/LocationOn';

import { useREPims } from '@/hooks/wrdHooks/reports/useReport';

// Types based on your API response
interface WUAProject {
  wua_id: string;
  project_id: string;
  project_name: string;
  vlc_name: string;
  wua_name: string;
  ce_zone: string;
  se_circle: string;
  subdivision: string;
  section: string;
  tenure_completion_year: string;
  formation_year: string;
  slc_name: string;
  status: string;
  registration_no: string; // नया field
}

interface PIMProject {
  id: number;
  project_code: string;
  project_name: string;
  description: string;
  status: 'active' | 'inactive';
  start_date: string;
  end_date: string;
  vlc_name: string;
  ce_zone: string;
  registration_no: string; // नया field
  wua_details: WUAProject;
}

const PIMSuperAdminPage: React.FC = () => {
  const [filteredProjects, setFilteredProjects] = useState<PIMProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0);

  // Your actual API hook
  const { data: wuaData = [], isLoading, error } = useREPims();

  // API डेटा को कन्सोल में देखें
  useEffect(() => {
  }, [wuaData]);

  // Convert WUA data to PIM projects format
  const convertToPIMProjects = (wuaProjects: WUAProject[]): PIMProject[] => {
    if (!Array.isArray(wuaProjects)) {
      console.error('wuaProjects is not an array:', wuaProjects);
      return [];
    }
    
    return wuaProjects.map((wua) => {
      try {
        // Parse dates
        const formationDate = wua.formation_year ? new Date(wua.formation_year) : new Date();
        const tenureDate = wua.tenure_completion_year ? new Date(wua.tenure_completion_year) : new Date();
        
        // Generate description
        const description = `Water Users Association: ${wua.wua_name} managed by ${wua.vlc_name}`;

        return {
          id: parseInt(wua.wua_id) || 0,
          project_code: wua.project_id || `WUA-${wua.wua_id}`,
          project_name: wua.project_name || 'Unknown Project',
          description: description,
          status: (wua.status || 'active') as 'active' | 'inactive',
          start_date: formationDate.toISOString().split('T')[0],
          end_date: tenureDate.toISOString().split('T')[0],
          vlc_name: wua.vlc_name || 'Unknown VLC',
          ce_zone: wua.ce_zone || 'Unknown Zone',
          registration_no: wua.registration_no || 'N/A', // Registration Number जोड़ें
          wua_details: wua
        };
      } catch (err) {
        console.error('Error converting WUA project:', wua, err);
        // Return a default project in case of error
        return {
          id: 0,
          project_code: 'WUA-0000',
          project_name: 'Error Project',
          description: 'Error converting project data',
          status: 'inactive',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
          vlc_name: 'Error',
          ce_zone: 'Error',
          registration_no: 'N/A',
          wua_details: wua
        };
      }
    });
  };

  // Create PIM projects from WUA data
  const pimProjects = useMemo(() => {
    return convertToPIMProjects(wuaData);
  }, [wuaData]);

  const selectedProject = useMemo(() => {
    return pimProjects.find(p => p.id === selectedProjectId) || null;
  }, [pimProjects, selectedProjectId]);

  // Tabs for the detail dialog
  const detailTabs = [
    { id: 'overview', label: 'Overview', icon: <InfoIcon /> },
    { id: 'stakeholders', label: 'Stakeholders', icon: <PeopleIcon /> },
    { id: 'documents', label: 'Documents', icon: <DocumentIcon /> },
    { id: 'locations', label: 'Locations', icon: <LocationIcon /> },
    { id: 'timeline', label: 'Timeline', icon: <TimelineIcon /> },
  ];

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term === '') {
      setFilteredProjects(pimProjects);
    } else {
      const filtered = pimProjects.filter((project) =>
        project.project_code?.toLowerCase().includes(term) ||
        project.project_name?.toLowerCase().includes(term) ||
        project.registration_no?.toLowerCase().includes(term) || // Registration Number को सर्च में शामिल करें
        project.ce_zone?.toLowerCase().includes(term) ||
        project.status?.toLowerCase().includes(term) ||
        project.wua_details?.wua_name?.toLowerCase().includes(term) ||
        project.wua_details?.se_circle?.toLowerCase().includes(term) ||
        project.wua_details?.subdivision?.toLowerCase().includes(term)
      );
      setFilteredProjects(filtered);
    }
  };

  // Open project details
  const fetchProjectDetails = (projectId: number) => {
    setSelectedProjectId(projectId);
    setDialogOpen(true);
  };

  // Export function
  const exportToExcel = () => {
    // Implement export logic
    alert('Export functionality would be implemented here');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  useEffect(() => {
    if (pimProjects.length > 0) {
      setFilteredProjects(pimProjects);
    }
  }, [pimProjects]);

  // Render content for the active tab in the dialog
  const renderTabContent = () => {
    if (!selectedProject) return null;

    switch (activeTab) {
      case 0: // Overview
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Project Overview</Typography>
              <Grid container spacing={2}>
                <Grid>
                  <Typography variant="body2"><strong>Project ID:</strong> {selectedProject.project_code}</Typography>
                  <Typography variant="body2"><strong>WUA ID:</strong> {selectedProject.wua_details.wua_id}</Typography>
                  <Typography variant="body2"><strong>WUA Name:</strong> {selectedProject.wua_details.wua_name}</Typography>
                  <Typography variant="body2"><strong>Registration No:</strong> {selectedProject.registration_no}</Typography>
                  <Typography variant="body2"><strong>SLC Name:</strong> {selectedProject.wua_details.slc_name}</Typography>
                </Grid>
                <Grid>
                  <Typography variant="body2"><strong>Status:</strong>
                    <Chip 
                      label={selectedProject.status} 
                      size="small" 
                      color={selectedProject.status === 'active' ? 'success' : 'default'}
                      sx={{ ml: 1 }} 
                    />
                  </Typography>
                  <Typography variant="body2"><strong>Formation Date:</strong> {formatDate(selectedProject.start_date)}</Typography>
                  <Typography variant="body2"><strong>Tenure Completion:</strong> {formatDate(selectedProject.end_date)}</Typography>
                  <Typography variant="body2"><strong>CE Zone:</strong> {selectedProject.ce_zone}</Typography>
                  <Typography variant="body2"><strong>SE Circle:</strong> {selectedProject.wua_details.se_circle}</Typography>
                </Grid>
                <Grid >
                  <Typography variant="body2"><strong>Description:</strong></Typography>
                  <Typography variant="body2" color="textSecondary">{selectedProject.description}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      case 1: // Stakeholders
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Key Stakeholders</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Role</strong></TableCell>
                      <TableCell><strong>Details</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{selectedProject.wua_details.vlc_name}</TableCell>
                      <TableCell>Village Level Coordinator</TableCell>
                      <TableCell>Primary Contact</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{selectedProject.wua_details.slc_name}</TableCell>
                      <TableCell>Section Level Committee</TableCell>
                      <TableCell>Committee Head</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{selectedProject.wua_details.ce_zone}</TableCell>
                      <TableCell>Chief Engineer Zone</TableCell>
                      <TableCell>Administrative Authority</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{selectedProject.wua_details.se_circle}</TableCell>
                      <TableCell>Superintending Engineer Circle</TableCell>
                      <TableCell>Circle In-charge</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        );
      case 2: // Documents
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Project Documents</Typography>
              <Typography color="textSecondary">
                WUA Registration Certificate, Meeting Minutes, Financial Reports, etc.
                <br />
                <em>Note: Document upload feature will be available soon.</em>
              </Typography>
            </CardContent>
          </Card>
        );
      case 3: // Locations
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Project Locations</Typography>
              <Grid container spacing={2}>
                <Grid >
                  <Typography variant="body2"><strong>Project:</strong> {selectedProject.wua_details.project_name}</Typography>
                  <Typography variant="body2"><strong>Zone:</strong> {selectedProject.wua_details.ce_zone}</Typography>
                  <Typography variant="body2"><strong>Circle:</strong> {selectedProject.wua_details.se_circle}</Typography>
                  <Typography variant="body2"><strong>Subdivision:</strong> {selectedProject.wua_details.subdivision}</Typography>
                  <Typography variant="body2"><strong>Section:</strong> {selectedProject.wua_details.section || 'Not specified'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      case 4: // Timeline
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Project Timeline</Typography>
              <Grid container spacing={2}>
                <Grid >
                  <Typography variant="body2"><strong>Formation Date:</strong> {formatDate(selectedProject.start_date)}</Typography>
                  <Typography variant="body2"><strong>Tenure Completion Date:</strong> {formatDate(selectedProject.end_date)}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    <strong>Current Status:</strong> This WUA is currently <strong>{selectedProject.status}</strong>.
                    {selectedProject.status === 'active' && 
                      ` The tenure will complete on ${formatDate(selectedProject.end_date)}.`}
                  </Typography>
                </Grid>
              </Grid>
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
        <Typography sx={{ ml: 2 }}>Loading WUA Projects...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header and Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            <InfoIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            Partipatory Irrigation Management (PIM) - WUA Projects
          </Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={exportToExcel}
              disabled={pimProjects.length === 0}
            >
              Export
            </Button>
          </Box>
        </Box>

        <TextField
          fullWidth
          placeholder="Search by Project ID, WUA Name, Registration No., Zone, Circle..."
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading projects: {error.message || 'Unknown error'}
          </Alert>
        )}

        {!isLoading && pimProjects.length === 0 && !error && (
          <Alert severity="info" sx={{ mb: 2 }}>
            No WUA projects found. Please check if the API is returning data.
          </Alert>
        )}

        {/* Main Projects Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white' }}><strong>Project ID</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Project Name</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>WUA Name</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Registration No.</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>CE Zone</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Status</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <TableRow key={project.id} hover>
                    <TableCell>{project.project_code}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {project.project_name}
                      </Typography>
                    </TableCell>
                    <TableCell>{project.wua_details.wua_name}</TableCell>
                    <TableCell>{project.registration_no}</TableCell>
                    <TableCell>{project.ce_zone}</TableCell>
                    <TableCell>
                      <Chip
                        label={project.status}
                        color={project.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => fetchProjectDetails(project.id)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {searchTerm ? 'No projects found matching your search' : 'No WUA projects available'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Summary */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body2">
            Showing {filteredProjects.length} of {pimProjects.length} WUA projects
            {searchTerm && ` matching "${searchTerm}"`}
          </Typography>
        </Box>
      </Paper>

      {/* Project Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedProjectId(null);
        }}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedProject?.project_code} - {selectedProject?.wua_details.wua_name}
            </Typography>
            <IconButton onClick={() => setDialogOpen(false)} size="small">✕</IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {detailTabs.map((tab, index) => (
                <Tab key={tab.id} label={tab.label} icon={tab.icon} iconPosition="start" sx={{ minHeight: 60 }} />
              ))}
            </Tabs>
          </Box>

          {/* Tab Content */}
          {renderTabContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PIMSuperAdminPage;