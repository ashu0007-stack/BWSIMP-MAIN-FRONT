import React, { useState, useEffect } from "react";
import {
  MapPin,
  Package,
  Ruler,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Home,
  Eye,
  IndianRupee,
  Calendar,
  ArrowLeft,
  Edit,
  EyeOff,
  X,
  Calculator,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

// Import all hooks
import {
  useCreateWork,
  useAddBeneficiaries,
  useAddVillages,
  useWorks,
  useAddComponentsAndMilestones,
  useWorkById,
  useUpdateWork,
  useUpdateBeneficiaries,
  useUpdateVillages,
  useUpdateComponents
} from "@/hooks/wrdHooks/useWorks";

import { useZones } from "@/hooks/location/useZone";
import { useComponents, useSubcomponentsByComponent, useSubworkcomponentsByworkComponentId } from "@/hooks/wrdHooks/useComponents";
import { useCirclesByZoneId } from "@/hooks/location/useCircle";
import { useDivisionByCircleId } from "@/hooks/location/useDivision";

// Interfaces
interface Zone {
  zone_id: number;
  zone_name: string;
}
interface Circle {
  circle_id: number;
  circle_name: string;
  zone_id: number;
}
interface Division {
  division_id: number;
  division_name: string;
  circle_id: number;
}
interface Component {
  id: number;
  component_name: string;
}
interface SubComponent {
  id: number;
  work_component_name: string;
  component_id: number;
}
interface SubworkComponent {
  id: number;
  work_package_name: string;
  work_component_id: number;
  length_of_work?: string;
  package_number?: string;
  status?: string;
}

interface UserData {
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

interface Work {
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

interface Village {
  id?: number;
  village_name: string;
  block_name: string;
  gram_panchayat: string;
  district_name: string;
  census_population: string;
  male_population: string;
  female_population: string;
}

interface WorkComponent {
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

interface Beneficiaries {
  id?: number;
  total_population: string;
  beneficiaries_youth_15_28: string;
  beneficiaries_female: string;
  beneficiaries_male: string;
}

// ✅ Validation Interface
interface ValidationErrors {
  [key: string]: string;
}

const CreateWorkPackages = () => {
  // User state
  const [user, setUser] = useState<UserData | null>(null);
  
  // Page modes
  const [activeMode, setActiveMode] = useState<"list" | "create" | "view" | "edit">("list");

  // Selected work for view/edit
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Work Form Data for CREATE mode
  const [formData, setFormData] = useState({
    zone_id: "",
    circle_id: "",
    division_id: "",
    component_id: "",
    subcomponent_id: "",
    workcomponentId: "",
    work_name: "",
    work_package_name: "",
    target_km: "",
    work_period_months: "",
    work_cost: "",
    package_number: "",
    package_details: "",
    district: "",
    dpr_cost: "",
    rfp_cost: "",
    Area_Under_improved_Irrigation: "",
    command_area_after: "",
    award_status: ""
  });

  // ✅ Validation Errors State
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Beneficiaries data for CREATE mode
  const [beneficiaries, setBeneficiaries] = useState({
    total_population: "",
    beneficiaries_youth_15_28: "",
    beneficiaries_female: "",
    beneficiaries_male: ""
  });

  // ✅ Beneficiaries Validation Errors
  const [beneficiariesErrors, setBeneficiariesErrors] = useState<ValidationErrors>({});

  // Villages data for CREATE mode
  const [villages, setVillages] = useState<Village[]>([
    {
      village_name: "",
      block_name: "",
      gram_panchayat: "",
      district_name: "",
      census_population: "",
      male_population: "",
      female_population: ""
    }
  ]);

  // ✅ Villages Validation Errors
  const [villagesErrors, setVillagesErrors] = useState<ValidationErrors[]>([]);

  // Components for CREATE mode
  const [extraComponents, setExtraComponents] = useState<WorkComponent[]>([
    {
      componentname: "",
      totalQty: "",
      unit: "",
      Numberofmilestone: "3",
      milestone1_qty: "",
      milestone2_qty: "",
      milestone3_qty: "",
      milestonedetails: "",
      num_of_milestones: "",
      total_qty: undefined,
      unitname: undefined,
      nameofcomponent: undefined
    },
  ]);

  // ✅ Components Validation Errors
  const [componentsErrors, setComponentsErrors] = useState<ValidationErrors[]>([]);

  // State variables for CREATE mode
  const [message, setMessage] = useState("");
  const [showMilestoneFields, setShowMilestoneFields] = useState(false);

  // States for VIEW/EDIT mode
  const [viewActiveTab, setViewActiveTab] = useState("overview");
  const [viewMessage, setViewMessage] = useState("");

  // Data for VIEW/EDIT mode
  const [workDetails, setWorkDetails] = useState<Work | null>(null);
  const [viewBeneficiaries, setViewBeneficiaries] = useState<Beneficiaries | null>(null);
  const [viewVillages, setViewVillages] = useState<Village[]>([]);
  const [viewComponents, setViewComponents] = useState<WorkComponent[]>([]);
  
  // Edit form states
  const [editFormData, setEditFormData] = useState({
    work_name: "",
    package_number: "",
    work_cost: "",
    target_km: "",
    work_period_months: "",
    zone_id: "",
    circle_id: "",
    division_id: "",
    component_id: "",
    subcomponent_id: "",
    workcomponentId: "",
    Area_Under_improved_Irrigation: "",
    award_status: ""
  });

  // ✅ Validation Functions
  const validateText = (value: string, fieldName: string): string => {
    if (!value.trim()) return `${fieldName} is required`;
    if (!/^[A-Za-z\s]+$/.test(value)) return `${fieldName} should contain only alphabets`;
    if (value.length < 2) return `${fieldName} should be at least 2 characters`;
    if (value.length > 100) return `${fieldName} should not exceed 100 characters`;
    return "";
  };

  const validateDecimalWithLimit = (value: string, fieldName: string, max?: number): string => {
    if (!value.trim()) return `${fieldName} is required`;
    if (!/^\d+(\.\d{1,2})?$/.test(value)) return `${fieldName} should be a valid number (max 2 decimals)`;

    const digitCount = value.replace('.', '').length;
    if (digitCount > 10) return `${fieldName} should not exceed 10 digits`;

    const numValue = parseFloat(value);
    if (numValue <= 0) return `${fieldName} must be greater than 0`;
    if (max !== undefined && numValue > max) return `${fieldName} should not exceed ${max}`;

    if (numValue > 99999999.99) return `${fieldName} should not exceed 99,999,999.99`;

    return "";
  };

  const validateWorkCost = (value: string): string => {
    if (!value.trim()) return "Work cost is required";
    if (!/^\d+$/.test(value)) return "Work cost should contain only numbers";
    if (parseInt(value) < 1) return "Work cost should be at least ₹1";
    if (parseInt(value) > 9999) return "Work cost should not exceed ₹9999";
    return "";
  };

  const validatePopulation = (value: string, fieldName: string): string => {
    if (!value.trim()) return `${fieldName} is required`;
    if (!/^\d+$/.test(value)) return `${fieldName} should contain only numbers`;

    const numValue = parseInt(value);
    if (numValue < 0) return `${fieldName} cannot be negative`;

    if (numValue > 9999999) return `${fieldName} should not exceed 99,99,999 (7 digits)`;

    return "";
  };

  const validateUnit = (value: string): string => {
    if (!value.trim()) return "Unit is required";
    if (!/^[A-Za-z]+$/.test(value)) return "Unit should contain only alphabets (e.g., m, km, kg)";
    if (value.length > 10) return "Unit should not exceed 10 characters";
    return "";
  };

  // ✅ Main Validation Function for Form
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    // Validate main form fields
    if (!formData.zone_id) {
      errors.zone_id = "Zone is required";
      isValid = false;
    }
    if (!formData.circle_id) {
      errors.circle_id = "Circle is required";
      isValid = false;
    }
    if (!formData.division_id) {
      errors.division_id = "Division is required";
      isValid = false;
    }
    if (!formData.component_id) {
      errors.component_id = "Component is required";
      isValid = false;
    }
    if (!formData.workcomponentId) {
      errors.workcomponentId = "Work name is required";
      isValid = false;
    }

    const workCostError = validateWorkCost(formData.work_cost);
    if (workCostError) {
      errors.work_cost = workCostError;
      isValid = false;
    }

    if (!formData.work_period_months) {
      errors.work_period_months = "Period of completion is required";
      isValid = false;
    }

    if (!formData.package_number) {
      errors.package_number = "Package number is required";
      isValid = false;
    }
    if (!formData.Area_Under_improved_Irrigation.trim()) {
      errors.Area_Under_improved_Irrigation = "Area Under improved Irrigation Services is required";
      isValid = false;
    } else if (!/^\d*\.?\d*$/.test(formData.Area_Under_improved_Irrigation)) {
      errors.Area_Under_improved_Irrigation = "Please enter a valid number";
      isValid = false;
    } else {
      const areaValue = parseFloat(formData.Area_Under_improved_Irrigation);
      if (areaValue < 0) {
        errors.Area_Under_improved_Irrigation = "Area cannot be negative";
        isValid = false;
      }
      if (areaValue > 9999999) {
        errors.Area_Under_improved_Irrigation = "Area should not exceed 99,99,999 ha";
        isValid = false;
      }
    }

    // Validate beneficiaries
    const benErrors: ValidationErrors = {};
    const totalPopError = validatePopulation(beneficiaries.total_population, "Total population");
    if (totalPopError) {
      benErrors.total_population = totalPopError;
      isValid = false;
    }
    setBeneficiariesErrors(benErrors);

    // Validate villages
    const villageErrorsList: ValidationErrors[] = [];
    villages.forEach((village) => {
      const villageErrors: ValidationErrors = {};

      const villageNameError = validateText(village.village_name, "Village name");
      if (villageNameError) {
        villageErrors.village_name = villageNameError;
        isValid = false;
      }

      const blockNameError = validateText(village.block_name, "Block name");
      if (blockNameError) {
        villageErrors.block_name = blockNameError;
        isValid = false;
      }

      const districtNameError = validateText(village.district_name, "District name");
      if (districtNameError) {
        villageErrors.district_name = districtNameError;
        isValid = false;
      }

      const populationError = validatePopulation(village.census_population, "Population");
      if (populationError) {
        villageErrors.census_population = populationError;
        isValid = false;
      }

      villageErrorsList.push(villageErrors);
    });
    setVillagesErrors(villageErrorsList);

    // Validate components
    const compErrorsList: ValidationErrors[] = [];
    extraComponents.forEach((component) => {
      const compErrors: ValidationErrors = {};
      if (!component.componentname.trim()) {
        compErrors.componentname = "Component description is required";
        isValid = false;
      } else if (!/^[A-Za-z\s]+$/.test(component.componentname)) {
        compErrors.componentname = "Component description should contain only alphabets";
        isValid = false;
      } else if (component.componentname.length < 2) {
        compErrors.componentname = "Component description should be at least 2 characters";
        isValid = false;
      } else if (component.componentname.length > 25) {
        compErrors.componentname = "Component description should not exceed 10 characters";
        isValid = false;
      }

      if (!component.totalQty.trim()) {
        compErrors.totalQty = "Total quantity is required";
        isValid = false;
      } else {
        if (!/^\d+(\.\d{1,2})?$/.test(component.totalQty)) {
          compErrors.totalQty = "Please enter a valid number (max 2 decimal places)";
          isValid = false;
        } else {
          const digitCount = component.totalQty.replace('.', '').length;
          if (digitCount > 10) {
            compErrors.totalQty = "Total quantity should not exceed 10 digits";
            isValid = false;
          }

          const numValue = parseFloat(component.totalQty);
          if (numValue <= 0) {
            compErrors.totalQty = "Quantity must be greater than 0";
            isValid = false;
          }
          if (numValue > 99999999.99) {
            compErrors.totalQty = "Maximum value is 99,999,999.99";
            isValid = false;
          }
        }
      }

      const componentNameError = validateText(component.componentname, "Component description");
      if (componentNameError) {
        compErrors.componentname = componentNameError;
        isValid = false;
      }

      const unitError = validateUnit(component.unit);
      if (unitError) {
        compErrors.unit = unitError;
        isValid = false;
      }

      const totalQtyError = validateDecimalWithLimit(component.totalQty, "Total quantity");
      if (totalQtyError) {
        compErrors.totalQty = totalQtyError;
        isValid = false;
      }

      if (showMilestoneFields) {
        const milestones = parseInt(component.Numberofmilestone);
        const totalQty = parseFloat(component.totalQty) || 0;
        let milestoneSum = 0;
        const tolerance = 0.01;

        if (milestones >= 1) {
          const m1 = parseFloat(component.milestone1_qty) || 0;
          milestoneSum += m1;
        }

        if (milestones >= 2) {
          const m2 = parseFloat(component.milestone2_qty) || 0;
          milestoneSum += m2;
        }

        if (milestones >= 3) {
          const m3 = parseFloat(component.milestone3_qty) || 0;
          milestoneSum += m3;
        }

        if (totalQty > 0 && milestoneSum > 0) {
          const allowedTolerance = Math.max(totalQty * 0.01, 0.01);

          if (Math.abs(milestoneSum - totalQty) > allowedTolerance) {
            compErrors.milestone_sum = `Sum of milestone quantities (${milestoneSum.toFixed(2)}) must equal total quantity (${totalQty.toFixed(2)}) within ${(allowedTolerance * 100).toFixed(0)}% tolerance`;
            isValid = false;
          }
        }

        if (milestones >= 1) {
          const m1 = parseFloat(component.milestone1_qty) || 0;
          if (m1 > totalQty + tolerance) {
            isValid = false;
          }
        }

        if (milestones >= 2) {
          const m2 = parseFloat(component.milestone2_qty) || 0;
          if (m2 > totalQty + tolerance) {
            isValid = false;
          }
        }

        if (milestones >= 3) {
          const m3 = parseFloat(component.milestone3_qty) || 0;
          if (m3 > totalQty + tolerance) {
            isValid = false;
          }
        }
      }

      compErrorsList.push(compErrors);
    });
    setComponentsErrors(compErrorsList);

    setValidationErrors(errors);

    return isValid;
  };

  // ✅ Use React Query Hooks
  const { data: zones, isLoading: zonesLoading } = useZones();
  const [selectedZoneId, setSelectedZoneId] = useState<any>();
  const { data: circles, isLoading: circlesLoading } = useCirclesByZoneId(selectedZoneId);
  const [selectedCircleId, setSelectedCircleId] = useState<any>();
  const { data: divisions, isLoading: divisionsLoading } = useDivisionByCircleId(
    selectedCircleId
  );

  const { data: components = [], isLoading: componentsLoading } = useComponents();
  const { data: filteredSubcomponents = [], isLoading: filteredSubcomponentsLoading } = useSubcomponentsByComponent(
    formData.component_id ? parseInt(formData.component_id) : undefined
  );

  const { data: filteredSubworkcomponents = [], isLoading: filteredSubworkcomponentsLoading } = useSubworkcomponentsByworkComponentId(
    formData.subcomponent_id ? parseInt(formData.subcomponent_id) : undefined
  );

  // ✅ Work List Hook
  const { data: worksList = [], isLoading: worksLoading, refetch: refetchWorks } = useWorks();

  // ✅ Work Details Hook
  const { data: fetchedWorkDetails, refetch: refetchWorkDetails } = useWorkById(selectedWorkId);

  // Mutation hooks
  const createWorkMutation = useCreateWork();
  const addBeneficiariesMutation = useAddBeneficiaries();
  const addVillagesMutation = useAddVillages();
  const addComponentsMutation = useAddComponentsAndMilestones();
  const updateWorkMutation = useUpdateWork();
  const updateBeneficiariesMutation = useUpdateBeneficiaries();
  const updateVillagesMutation = useUpdateVillages();
  const updateComponentsMutation = useUpdateComponents();

  // ✅ Get user data from sessionStorage
  useEffect(() => {
    const getUserData = () => {
      try {
        if (typeof window !== "undefined") {
          const userDetails = sessionStorage.getItem("userdetail");

          if (userDetails) {
            try {
              const parsedData = JSON.parse(userDetails);

              const userData: UserData = {
                username: parsedData.full_name || "Unknown User",
                email: parsedData.email || "unknown@example.com",
                dept_id: parsedData.dept_id || 1,
                role: parsedData.role || "user",
                department: parsedData.department,
                designation: parsedData.designation,
                levelname: parsedData.level,
                levelid: parsedData.id,
                zone_id: parsedData.zone_id,
                circle_id: parsedData.circle_id,
                division_id: parsedData.division_id
              };

              setUser(userData);

              if (userData.zone_id) {
                setFormData(prev => ({ ...prev, zone_id: userData.zone_id!.toString() }));
              }
              if (userData.circle_id) {
                setFormData(prev => ({ ...prev, circle_id: userData.circle_id!.toString() }));
              }
              if (userData.division_id) {
                setFormData(prev => ({ ...prev, division_id: userData.division_id!.toString() }));
              }
            } catch (parseError) {
              console.error("❌ Error parsing user data:", parseError);
              setDefaultUser();
            }
          } else {
            setDefaultUser();
          }
        }
      } catch (error) {
        console.error("❌ Error loading user data:", error);
        setDefaultUser();
      }
    };

    const setDefaultUser = () => {
      const defaultUser: UserData = {
        username: "System User",
        email: "system@example.com",
        dept_id: 1,
        role: "user"
      };
      setUser(defaultUser);
    };

    getUserData();
  }, []);

  // ✅ Calculate total pages when worksList changes
  useEffect(() => {
    if (worksList && Array.isArray(worksList)) {
      const totalItems = worksList.length;
      const pages = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(pages > 0 ? pages : 1);
      
      // If current page is greater than total pages, reset to last page
      if (currentPage > pages && pages > 0) {
        setCurrentPage(pages);
      }
    }
  }, [worksList, itemsPerPage, currentPage]);

  // ✅ Get paginated data
  const getPaginatedWorks = () => {
    if (!worksList || !Array.isArray(worksList)) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return worksList.slice(startIndex, endIndex);
  };

  // ✅ Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // ✅ Load work details when selectedWorkId changes
  useEffect(() => {
    if (selectedWorkId && fetchedWorkDetails) {
      setWorkDetails(fetchedWorkDetails);
      console.log("Fetched work details:", fetchedWorkDetails);

      setEditFormData({
        work_name: fetchedWorkDetails.work_name || "",
        package_number: fetchedWorkDetails.package_number || "",
        work_cost: fetchedWorkDetails.work_cost || "",
        target_km: fetchedWorkDetails.target_km || "",
        work_period_months: fetchedWorkDetails.work_period_months || "",
        zone_id: fetchedWorkDetails.zone_id?.toString() || "",
        circle_id: fetchedWorkDetails.circle_id?.toString() || "",
        division_id: fetchedWorkDetails.division_id?.toString() || "",
        component_id: fetchedWorkDetails.component_id?.toString() || "",
        subcomponent_id: fetchedWorkDetails.subcomponent_id?.toString() || "",
        workcomponentId: fetchedWorkDetails.subworkcoponent_id?.toString() || "",
        Area_Under_improved_Irrigation: fetchedWorkDetails.Area_Under_improved_Irrigation || "",
        award_status: fetchedWorkDetails.award_status || ""
      });

      if (fetchedWorkDetails.beneficiaries) {
        setViewBeneficiaries({
          total_population: fetchedWorkDetails.beneficiaries.total_population || "",
          beneficiaries_male: fetchedWorkDetails.beneficiaries.beneficiaries_male || "",
          beneficiaries_female: fetchedWorkDetails.beneficiaries.beneficiaries_female || "",
          beneficiaries_youth_15_28: fetchedWorkDetails.beneficiaries.beneficiaries_youth_15_28 || ""
        });
      }

      if (fetchedWorkDetails.villages) {
        setViewVillages(fetchedWorkDetails.villages);
      }

      if (fetchedWorkDetails.components) {
        const formattedComponents = fetchedWorkDetails.components.map((comp: any) => ({
          nameofcomponent: comp.nameofcomponent || comp.componentname || "",
          unitname: comp.unitname || comp.unit || "",
          total_qty: comp.total_qty || comp.totalQty || "",
          num_of_milestones: comp.num_of_milestones || comp.Numberofmilestone || "0",
          milestone1_qty: comp.milestone1_qty || "",
          milestone2_qty: comp.milestone2_qty || "",
          milestone3_qty: comp.milestone3_qty || "",
          componentname: comp.componentname || comp.nameofcomponent || "",
          unit: comp.unit || comp.unitname || "",
          totalQty: comp.totalQty || comp.total_qty || "",
          Numberofmilestone: comp.Numberofmilestone || comp.num_of_milestones || "0",
          milestonedetails: comp.milestonedetails || ""
        }));
        setViewComponents(formattedComponents);
      }
    }
  }, [selectedWorkId, fetchedWorkDetails]);

  // ✅ Get user data for API
  const getUserDataForAPI = () => {
    if (user) {
      const apiData = {
        email: user.email,
        dept_id: user.dept_id,
        username: user.username
      };
      return apiData;
    }

    return {
      email: "unknown@example.com",
      dept_id: 1,
      username: "Unknown User"
    };
  };

  // ✅ HANDLE NAVIGATION FUNCTIONS
  const handleShowWorkList = () => {
    setActiveMode("list");
    setSelectedWorkId(null);
    setWorkDetails(null);
    setCurrentPage(1); // Reset to first page when going back to list
    refetchWorks();
  };

  const handleShowCreateForm = () => {
    setActiveMode("create");
    setSelectedWorkId(null);
    setWorkDetails(null);
    handleCancel();
  };

  const handleViewWork = (work: Work) => {
    setSelectedWorkId(work.id);
    setActiveMode("view");
  };

  const handleEditWork = () => {
    setActiveMode("edit");
  };

  const handleCancelEdit = () => {
    setActiveMode("view");
  };

  const handleBackToListFromView = () => {
    setActiveMode("list");
    setSelectedWorkId(null);
    setWorkDetails(null);
  };

  // ✅ CREATE MODE HANDLERS
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setValidationErrors(prev => ({ ...prev, [name]: "" }));

    if (name === "workcomponentId") {
      const selectedOption = e.target as HTMLSelectElement;
      const selectedText = selectedOption.options[selectedOption.selectedIndex].text;

      setFormData(prev => ({
        ...prev,
        workcomponentId: value,
        work_name: selectedText,
        work_package_name: selectedText,
      }));

      if (value && filteredSubworkcomponents.length > 0) {
        const selectedWorkPackage = filteredSubworkcomponents.find(
          (wp: SubworkComponent) => wp.id.toString() === value
        );

        if (selectedWorkPackage) {
          setFormData(prev => ({
            ...prev,
            workcomponentId: value,
            target_km: selectedWorkPackage.length_of_work || prev.target_km,
            package_number: selectedWorkPackage.package_number || prev.package_number,
            work_name: selectedWorkPackage.work_package_name,
            work_package_name: selectedWorkPackage.work_package_name,
          }));
        }
      }
    }
    else if (name === "zone_id") {
      setFormData(prev => ({
        ...prev,
        zone_id: value,
        circle_id: "",
        division_id: ""
      }));
    } else if (name === "circle_id") {
      setFormData(prev => ({
        ...prev,
        circle_id: value,
        division_id: ""
      }));
    } else if (name === "component_id") {
      setFormData(prev => ({
        ...prev,
        component_id: value,
        subcomponent_id: "",
        workcomponentId: "",
        work_name: "",
        work_package_name: "",
      }));
    } else if (name === "subcomponent_id") {
      setFormData(prev => ({
        ...prev,
        subcomponent_id: value,
        workcomponentId: "",
        target_km: "",
        package_number: "",
        work_name: "",
        work_package_name: "",
      }));
    } else if (name === "work_cost") {
      const decimalRegex = /^\d*\.?\d*$/;
      if (value === "" || decimalRegex.test(value)) {
        if (value.length > 7) {
          setValidationErrors(prev => ({
            ...prev,
            work_cost: "Work cost should not exceed 7 characters"
          }));
          return;
        }

        setFormData(prev => ({ ...prev, work_cost: value }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          work_cost: "Please enter a valid number (e.g., 123.45)"
        }));
      }
    }
    else if (name === "Area_Under_improved_Irrigation") {
      const decimalRegex = /^\d*\.?\d*$/;
      if (value === "" || decimalRegex.test(value)) {
        if (value.length > 7) {
          setValidationErrors(prev => ({
            ...prev,
            Area_Under_improved_Irrigation: "Value should not exceed 7 characters"
          }));
          return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          Area_Under_improved_Irrigation: "Please enter a valid number (e.g., 123.45)"
        }));
      }
    }

    else {
      if (["work_name", "work_package_name", "package_number", "district"].includes(name)) {
        if (value && !/^[A-Za-z0-9\s\-_]+$/.test(value)) {
          setValidationErrors(prev => ({
            ...prev,
            [name]: "Only alphabets, numbers, spaces, hyphens and underscores are allowed"
          }));
          return;
        }
      }

      if (["target_km", "work_period_months", "Area_Under_improved_Irrigation", "command_area_after"].includes(name)) {
        if (value && !/^\d*\.?\d*$/.test(value)) {
          setValidationErrors(prev => ({
            ...prev,
            [name]: "Please enter a valid number"
          }));
          return;
        }
      }

      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (name === "work_period_months") {
      const months = parseInt(value) || 0;
      let numMilestones = 0;

      if (months === 12) {
        numMilestones = 1;
      } else if (months === 24) {
        numMilestones = 2;
      } else if (months === 36) {
        numMilestones = 3;
      }

      setExtraComponents(prevComponents =>
        prevComponents.map(comp => ({
          ...comp,
          Numberofmilestone: numMilestones.toString()
        }))
      );

      if (months === 12 || months === 24 || months === 36) {
        setShowMilestoneFields(true);
      } else {
        setShowMilestoneFields(false);
      }
    }
  };

  // ✅ Function to validate milestone sum
  const validateMilestoneSum = (index: number, component: WorkComponent) => {
    const updatedErrors = [...componentsErrors];
    const milestones = parseInt(component.Numberofmilestone);
    const totalQty = parseFloat(component.totalQty) || 0;

    if (totalQty > 0 && showMilestoneFields) {
      let milestoneSum = 0;
      const milestoneValues: number[] = [];

      if (milestones >= 1) {
        const m1 = parseFloat(component.milestone1_qty) || 0;
        milestoneSum += m1;
        milestoneValues.push(m1);
      }

      if (milestones >= 2) {
        const m2 = parseFloat(component.milestone2_qty) || 0;
        milestoneSum += m2;
        milestoneValues.push(m2);
      }

      if (milestones >= 3) {
        const m3 = parseFloat(component.milestone3_qty) || 0;
        milestoneSum += m3;
        milestoneValues.push(m3);
      }

      const tolerance = 0.0001;

      if (milestoneSum > 0) {
        if (Math.abs(milestoneSum - totalQty) > tolerance) {
          const roundedSum = Math.round(milestoneSum * 100) / 100;
          const roundedTotal = Math.round(totalQty * 100) / 100;

          updatedErrors[index] = {
            ...updatedErrors[index],
            milestone_sum: `Sum of milestone quantities (${roundedSum}) must equal total quantity (${roundedTotal})`
          };
        } else {
          const { milestone_sum, ...rest } = updatedErrors[index];
          updatedErrors[index] = rest;
        }
      }

    }

    setComponentsErrors(updatedErrors);
  };

  // ✅ Add auto-calculate function for milestones
  const autoCalculateMilestones = (i: number, component: WorkComponent) => {
    const updated = [...extraComponents];
    const totalQty = parseFloat(component.totalQty) || 0;
    const milestones = parseInt(component.Numberofmilestone);

    if (totalQty > 0 && milestones > 0) {
      const equalQty = (totalQty / milestones);

      if (milestones >= 1) {
        updated[i].milestone1_qty = totalQty.toFixed(2);
      }

      if (milestones >= 2) {
        const half = totalQty / 2;
        updated[i].milestone1_qty = half.toFixed(2);
        updated[i].milestone2_qty = half.toFixed(2);
      }

      if (milestones >= 3) {
        const third = totalQty / 3;
        const m1 = third;
        const m2 = third;
        const m3 = totalQty - m1 - m2;

        updated[i].milestone1_qty = m1.toFixed(2);
        updated[i].milestone2_qty = m2.toFixed(2);
        updated[i].milestone3_qty = m3.toFixed(2);
      }

      setExtraComponents(updated);
      validateMilestoneSum(i, updated[i]);
    }
  };

  const handleBeneficiariesChange = (field: keyof typeof beneficiaries, value: string) => {
    setBeneficiariesErrors(prev => ({ ...prev, [field]: "" }));

    if (field === "total_population") {
      if (value.length > 8) {
        setBeneficiariesErrors(prev => ({
          ...prev,
          [field]: "Value should not exceed 8 characters"
        }));
        return;
      }

      if (value && !/^\d*$/.test(value)) {
        setBeneficiariesErrors(prev => ({
          ...prev,
          [field]: "Please enter numbers only"
        }));
        return;
      }

      const newBeneficiaries = { ...beneficiaries, [field]: value };

      if (field === "total_population") {
        const total = parseInt(value) || 0;

        if (total > 0) {
          const femaleCount = Math.round(total * 0.49);
          const maleCount = total - femaleCount;
          const youthCount = Math.round(total * 0.29);

          newBeneficiaries.beneficiaries_female = femaleCount.toString();
          newBeneficiaries.beneficiaries_male = maleCount.toString();
          newBeneficiaries.beneficiaries_youth_15_28 = youthCount.toString();
        } else {
          newBeneficiaries.beneficiaries_female = "";
          newBeneficiaries.beneficiaries_male = "";
          newBeneficiaries.beneficiaries_youth_15_28 = "";
        }
      }

      setBeneficiaries(newBeneficiaries);
    } else {
      if (value.length > 8) {
        setBeneficiariesErrors(prev => ({
          ...prev,
          [field]: "Value should not exceed 8 characters"
        }));
        return;
      }

      if (value && !/^\d*$/.test(value)) {
        setBeneficiariesErrors(prev => ({
          ...prev,
          [field]: "Please enter numbers only"
        }));
        return;
      }

      setBeneficiaries(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleVillageChange = (i: number, field: keyof Village, value: string) => {
    const updatedErrors = [...villagesErrors];
    updatedErrors[i] = { ...updatedErrors[i], [field]: "" };
    setVillagesErrors(updatedErrors);

    if (["village_name", "block_name", "district_name", "gram_panchayat"].includes(field)) {
      if (value && !/^[A-Za-z\s]+$/.test(value)) {
        updatedErrors[i] = { ...updatedErrors[i], [field]: "Only alphabets and spaces allowed" };
        setVillagesErrors(updatedErrors);
        return;
      }
    }

    if (["census_population", "male_population", "female_population"].includes(field)) {
      if (value.length > 7) {
        updatedErrors[i] = {
          ...updatedErrors[i],
          [field]: "Population should not exceed 7 digits (99,99,999)"
        };
        setVillagesErrors(updatedErrors);
        return;
      }

      if (value && !/^\d*$/.test(value)) {
        updatedErrors[i] = { ...updatedErrors[i], [field]: "Only numbers allowed" };
        setVillagesErrors(updatedErrors);
        return;
      }

      if (value) {
        const numValue = parseInt(value, 10);
        if (numValue > 9999999) {
          updatedErrors[i] = {
            ...updatedErrors[i],
            [field]: "Population should not exceed 99,99,999"
          };
          setVillagesErrors(updatedErrors);
          return;
        }
      }
    }

    const updated = [...villages];
    updated[i] = { ...updated[i], [field]: value };

    if (field === "census_population") {
      const total = parseInt(value) || 0;
      if (total > 0) {
        const femaleCount = Math.round(total * 0.49);
        const maleCount = total - femaleCount;

        updated[i].female_population = femaleCount.toString();
        updated[i].male_population = maleCount.toString();
      } else {
        updated[i].female_population = "";
        updated[i].male_population = "";
      }
    }

    setVillages(updated);
  };
  const handleCancel = () => {
    setFormData({
      zone_id: user?.zone_id?.toString() || "",
      circle_id: user?.circle_id?.toString() || "",
      division_id: user?.division_id?.toString() || "",
      component_id: "",
      subcomponent_id: "",
      workcomponentId: "",
      work_name: "",
      work_package_name: "",
      target_km: "",
      work_period_months: "",
      work_cost: "",
      package_number: "",
      package_details: "",
      district: "",
      dpr_cost: "",
      rfp_cost: "",
      Area_Under_improved_Irrigation: "",
      command_area_after: "",
      award_status: ""
    });

    setBeneficiaries({
      total_population: "",
      beneficiaries_youth_15_28: "",
      beneficiaries_female: "",
      beneficiaries_male: ""
    });

    setVillages([{
      village_name: "",
      block_name: "",
      gram_panchayat: "",
      district_name: "",
      census_population: "",
      male_population: "",
      female_population: ""
    }]);

    setExtraComponents([{
      componentname: "",
      totalQty: "",
      unit: "",
      Numberofmilestone: "0",
      milestone1_qty: "",
      milestone2_qty: "",
      milestone3_qty: "",
      milestonedetails: "",
      num_of_milestones: "",
      total_qty: undefined,
      unitname: undefined,
      nameofcomponent: undefined
    }]);

    setMessage("");
    setShowMilestoneFields(false);

    setValidationErrors({});
    setBeneficiariesErrors({});
    setVillagesErrors([]);
    setComponentsErrors([]);
  };
  const checkForDuplicateWorkName = (workName: any) => {
    if (!worksList || worksList.length === 0) return false;

    const existingWork = worksList.find(
      (work: Work) =>
        work.work_name.toLowerCase().trim() === workName.toLowerCase().trim()
    );

    return !!existingWork;
  };
  // ✅ UPDATED: Save all data with validation
  const handleSubmitAll = async () => {
    if (!user) {
      setMessage("⚠️ Please wait, user data is loading...");
      return;
    }
    if (checkForDuplicateWorkName(formData.work_name)) {
      setMessage("❌ This work name already exists in the list. Please use a different name.");
      return;
    }
    
    if (!validateForm()) {
      setMessage("⚠️ Please fix all validation errors before submitting.");
      return;
    }

    try {
      setMessage("🔄 Creating work package with all data...");

      const workRequestData = {
        ...formData,
        user_data: getUserDataForAPI()
      };

      const workResult = await createWorkMutation.mutateAsync(workRequestData);
      const workId = workResult?.id || workResult?.workId || workResult?.data?.id || workResult?.data?.workId;

      if (!workId) {
        console.error("❌ Work ID not found in response:", workResult);
        setMessage("❌ Work created but could not get Work ID.");
        return;
      }

      if (beneficiaries.total_population) {
        const beneficiariesRequestData = {
          ...beneficiaries,
          beneficiaries_above_28: "",
          beneficiaries_other_gender: "",
          user_data: getUserDataForAPI()
        };
        await addBeneficiariesMutation.mutateAsync({
          workId,
          data: beneficiariesRequestData
        });
      }

      if (villages.length > 0 && villages[0].village_name) {
        const villagesRequestData = {
          villages: villages,
          user_data: getUserDataForAPI()
        };
        await addVillagesMutation.mutateAsync({
          workId,
          data: villagesRequestData
        });
      }

      if (extraComponents.length > 0 && extraComponents[0].componentname) {
        const componentsRequestData = {
          components: extraComponents.map(comp => ({
            ...comp,
            milestonedetails: `M1:${comp.milestone1_qty},M2:${comp.milestone2_qty},M3:${comp.milestone3_qty}`
          })),
          user_data: getUserDataForAPI()
        };
        await addComponentsMutation.mutateAsync({
          workId,
          data: componentsRequestData
        });
      }

      setMessage(`✅ Complete work package created successfully by ${user.username}! Work ID: ${workId}.`);

      refetchWorks();

      setTimeout(() => {
        handleCancel();
        handleShowWorkList();
      }, 2000);

    } catch (err: any) {
      console.error("❌ Error saving complete work package:", err);
      const errorMessage = err.message || err.response?.data?.error || err.response?.data?.message;

      if (errorMessage.includes('Duplicate entry') ||
        errorMessage.includes('work_name_UNIQUE') ||
        errorMessage.includes('already exists')) {
        setMessage("❌ This work name already exists in the database. Please use a different work name.");
      }
      else if (errorMessage.includes('Foreign key constraint')) {
        setMessage("❌ Invalid selection. Please check all dropdown values.");
      }
      else if (errorMessage.includes('SQLSTATE')) {
        setMessage("❌ Database error occurred. Please check your input data.");
      }
      else {
        setMessage(`❌ Error: ${errorMessage}`);
      }
    }
  };


  const handleComponentChange = (
    i: number,
    field: keyof WorkComponent,
    value: string
  ) => {
    const updatedErrors = [...componentsErrors];
    updatedErrors[i] = { ...updatedErrors[i], [field]: "" };
    setComponentsErrors(updatedErrors);

    if (field === "componentname") {
      if (value.length > 25) {
        updatedErrors[i] = {
          ...updatedErrors[i],
          [field]: "Name should not exceed 25 characters"
        };
        setComponentsErrors(updatedErrors);
        return;
      }

      if (value && !/^[A-Za-z\s/]*$/.test(value)) {
        updatedErrors[i] = {
          ...updatedErrors[i],
          [field]: "Only alphabets and spaces allowed"
        };
        setComponentsErrors(updatedErrors);
        return;
      }
    }

    if (field === "totalQty") {
      if (value && !/^\d*\.?\d*$/.test(value)) {
        updatedErrors[i] = {
          ...updatedErrors[i],
          [field]: "Please enter a valid number"
        };
        setComponentsErrors(updatedErrors);
        return;
      }

      if (value) {
        const digitCount = value.replace('.', '').length;
        if (digitCount > 10) {
          updatedErrors[i] = {
            ...updatedErrors[i],
            [field]: "Maximum 10 digits allowed (including decimal places)"
          };
          setComponentsErrors(updatedErrors);
          return;
        }

        const decimalParts = value.split('.');
        if (decimalParts.length > 1 && decimalParts[1].length > 2) {
          updatedErrors[i] = {
            ...updatedErrors[i],
            [field]: "Maximum 2 decimal places allowed"
          };
          setComponentsErrors(updatedErrors);
          return;
        }

        const numValue = parseFloat(value);
        if (numValue <= 0) {
          updatedErrors[i] = {
            ...updatedErrors[i],
            [field]: "Quantity must be greater than 0"
          };
          setComponentsErrors(updatedErrors);
          return;
        }

        if (numValue > 99999999.99) {
          updatedErrors[i] = {
            ...updatedErrors[i],
            [field]: "Maximum value is 99,999,999.99"
          };
          setComponentsErrors(updatedErrors);
          return;
        }
      }
    }

    if (["milestone1_qty", "milestone2_qty", "milestone3_qty"].includes(field)) {
      if (value && !/^\d*\.?\d*$/.test(value)) {
        updatedErrors[i] = { ...updatedErrors[i], [field]: "Please enter a valid number" };
        setComponentsErrors(updatedErrors);
        return;
      }

      if (value) {
        const digitCount = value.replace('.', '').length;
        if (digitCount > 10) {
          updatedErrors[i] = {
            ...updatedErrors[i],
            [field]: "Maximum 10 digits allowed"
          };
          setComponentsErrors(updatedErrors);
          return;
        }

        const decimalParts = value.split('.');
        if (decimalParts.length > 1 && decimalParts[1].length > 2) {
          updatedErrors[i] = {
            ...updatedErrors[i],
            [field]: "Maximum 2 decimal places allowed"
          };
          setComponentsErrors(updatedErrors);
          return;
        }
      }
    }

    if (field === "unit") {
      if (value && !/^[A-Za-z]+$/.test(value)) {
        updatedErrors[i] = {
          ...updatedErrors[i],
          [field]: "Only alphabets are allowed (e.g., m, km, kg, ton)"
        };
        setComponentsErrors(updatedErrors);
        return;
      }
      if (value.length > 10) {
        updatedErrors[i] = {
          ...updatedErrors[i],
          [field]: "Unit should not exceed 10 characters"
        };
        setComponentsErrors(updatedErrors);
        return;
      }
    }

    const updated = [...extraComponents];
    updated[i] = { ...updated[i], [field]: value };
    setExtraComponents(updated);

    validateMilestoneSum(i, updated[i]);
  };
  const addComponentField = () => {
    const months = parseInt(formData.work_period_months) || 0;
    let numMilestones = 0;

    if (months === 12) {
      numMilestones = 1;
    } else if (months === 24) {
      numMilestones = 2;
    } else if (months === 36) {
      numMilestones = 3;
    }

    setExtraComponents([...extraComponents, {
      componentname: "",
      totalQty: "",
      unit: "",
      Numberofmilestone: numMilestones.toString(),
      milestone1_qty: "",
      milestone2_qty: "",
      milestone3_qty: "",
      milestonedetails: "",
      num_of_milestones: "",
      total_qty: undefined,
      unitname: undefined,
      nameofcomponent: undefined
    }]);

    setComponentsErrors([...componentsErrors, {}]);
  };

  const removeComponentField = (i: number) => {
    const updated = [...extraComponents];
    updated.splice(i, 1);
    setExtraComponents(updated);

    const updatedErrors = [...componentsErrors];
    updatedErrors.splice(i, 1);
    setComponentsErrors(updatedErrors);
  };

  const addVillageField = () => {
    setVillages([...villages, {
      village_name: "",
      block_name: "",
      gram_panchayat: "",
      district_name: "",
      census_population: "",
      male_population: "",
      female_population: ""
    }]);

    setVillagesErrors([...villagesErrors, {}]);
  };

  const removeVillageField = (i: number) => {
    const updated = [...villages];
    updated.splice(i, 1);
    setVillages(updated);

    const updatedErrors = [...villagesErrors];
    updatedErrors.splice(i, 1);
    setVillagesErrors(updatedErrors);
  };

  // ✅ EDIT MODE HANDLERS
  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditBeneficiariesChange = (field: string, value: string) => {
    if (field === "total_population") {
      setViewMessage("");

      if (value.length > 7) {
        setViewMessage("❌ Total population should not exceed 7 digits (99,99,999)");
        return;
      }

      if (value && !/^\d*$/.test(value)) {
        setViewMessage("❌ Total population should contain only numbers");
        return;
      }

      if (value) {
        const numValue = parseInt(value, 10);
        if (numValue > 9999999) {
          setViewMessage("❌ Total population should not exceed 99,99,999");
          return;
        }
      }

      const total = parseInt(value) || 0;

      const femaleCount = Math.round(total * 0.49);
      const maleCount = total - femaleCount;
      const youthCount = Math.round(total * 0.29);

      if (viewBeneficiaries) {
        setViewBeneficiaries({
          ...viewBeneficiaries,
          total_population: value,
          beneficiaries_female: femaleCount.toString(),
          beneficiaries_male: maleCount.toString(),
          beneficiaries_youth_15_28: youthCount.toString()
        });
      } else {
        setViewBeneficiaries({
          total_population: value,
          beneficiaries_female: femaleCount.toString(),
          beneficiaries_male: maleCount.toString(),
          beneficiaries_youth_15_28: youthCount.toString()
        });
      }
    } else if (field === "beneficiaries_male" || field === "beneficiaries_female" || field === "beneficiaries_youth_15_28") {
      if (value) {
        if (value.length > 7) {
          setViewMessage(`❌ ${field.replace('_', ' ').toUpperCase()} should not exceed 7 digits (99,99,999)`);
          return;
        }

        if (!/^\d*$/.test(value)) {
          setViewMessage(`❌ ${field.replace('_', ' ').toUpperCase()} should contain only numbers`);
          return;
        }

        const numValue = parseInt(value, 10);
        if (numValue > 9999999) {
          setViewMessage(`❌ ${field.replace('_', ' ').toUpperCase()} should not exceed 99,99,999`);
          return;
        }
      }

      if (viewBeneficiaries) {
        setViewBeneficiaries({ ...viewBeneficiaries, [field]: value });
      }
    } else {
      if (viewBeneficiaries) {
        setViewBeneficiaries({ ...viewBeneficiaries, [field]: value });
      }
    }

    if (!value || /^\d*$/.test(value) && value.length <= 7) {
      const numValue = parseInt(value || '0');
      if (numValue <= 9999999) {
        setViewMessage("");
      }
    }
  };



  const handleEditVillageChange = (i: number, field: string, value: string) => {
    const updated = [...viewVillages];

    if (field === "census_population") {
      if (value.length > 7) {
        setViewMessage("❌ Population should not exceed 7 digits (99,99,999)");
        return;
      }

      if (value && !/^\d*$/.test(value)) {
        setViewMessage("❌ Population should contain only numbers");
        return;
      }

      if (value) {
        const numValue = parseInt(value, 10);
        if (numValue > 9999999) {
          setViewMessage("❌ Population should not exceed 99,99,999");
          return;
        }
      }

      const total = parseInt(value) || 0;

      const femaleCount = Math.round(total * 0.49);
      const maleCount = total - femaleCount;

      updated[i] = {
        ...updated[i],
        [field]: value,
        female_population: femaleCount.toString(),
        male_population: maleCount.toString()
      };
    } else if (["village_name", "block_name", "district_name", "gram_panchayat"].includes(field)) {
      if (value && !/^[A-Za-z\s]+$/.test(value)) {
        setViewMessage("❌ Only alphabets and spaces allowed for text fields");
        return;
      }
      updated[i] = { ...updated[i], [field]: value };
    } else {
      updated[i] = { ...updated[i], [field]: value };
    }

    setViewVillages(updated);
    setViewMessage("");
  };

  const handleEditComponentChange = (i: number, field: string, value: string) => {
    const updated = [...viewComponents];
    if (field === "total_qty" || field === "totalQty") {
      if (value && !/^\d*\.?\d*$/.test(value)) {
        setViewMessage("❌ Please enter a valid number for quantity");
        return;
      }

      if (value) {
        const digitCount = value.replace('.', '').length;
        if (digitCount > 10) {
          setViewMessage("❌ Quantity should not exceed 10 digits");
          return;
        }

        const decimalParts = value.split('.');
        if (decimalParts.length > 1 && decimalParts[1].length > 2) {
          setViewMessage("❌ Maximum 2 decimal places allowed");
          return;
        }
      }

      updated[i] = { ...updated[i], [field]: value };

      if (field === "total_qty") {
        updated[i].totalQty = value;
      } else if (field === "totalQty") {
        updated[i].total_qty = value;
      }
    }
    if (field === "nameofcomponent" || field === "componentname") {
      if (value && !/^[A-Za-z\s]+$/.test(value)) {
        setViewMessage("❌ Only alphabets and spaces allowed for component name");
        return;
      }
      updated[i] = { ...updated[i], [field]: value };

      if (field === "nameofcomponent") {
        updated[i].componentname = value;
      } else if (field === "componentname") {
        updated[i].nameofcomponent = value;
      }
    }
    else if (field === "unitname" || field === "unit") {
      if (value && !/^[A-Za-z]+$/.test(value)) {
        setViewMessage("❌ Only alphabets allowed for unit (e.g., m, km, kg)");
        return;
      }
      updated[i] = { ...updated[i], [field]: value };

      if (field === "unitname") {
        updated[i].unit = value;
      } else if (field === "unit") {
        updated[i].unitname = value;
      }
    }
    else if (field === "total_qty" || field === "totalQty") {
      if (value && !/^\d*\.?\d*$/.test(value)) {
        setViewMessage("❌ Please enter a valid number for quantity");
        return;
      }
      updated[i] = { ...updated[i], [field]: value };

      if (field === "total_qty") {
        updated[i].totalQty = value;
      } else if (field === "totalQty") {
        updated[i].total_qty = value;
      }
    }
    else if (field === "milestone1_qty" || field === "milestone2_qty" || field === "milestone3_qty") {
      if (value && !/^\d*\.?\d*$/.test(value)) {
        setViewMessage("❌ Please enter a valid number for milestone quantity");
        return;
      }
      updated[i] = { ...updated[i], [field]: value };
    }
    else {
      updated[i] = { ...updated[i], [field]: value };
    }

    setViewComponents(updated);
  };
  // ✅ UPDATE WORK
  const handleUpdateWork = async () => {
    if (!selectedWorkId) return;

    try {
      setViewMessage("🔄 Updating work details...");
      await updateWorkMutation.mutateAsync({ workId: selectedWorkId, data: editFormData });
      setViewMessage("✅ Work updated successfully!");
      refetchWorkDetails();
    } catch (err: any) {
      setViewMessage(`❌ Error: ${err.response?.data?.error || "Failed to update work"}`);
    }
  };

  // ✅ UPDATE BENEFICIARIES
  const handleUpdateBeneficiaries = async () => {
    if (!selectedWorkId || !viewBeneficiaries) return;

    try {
      setViewMessage("🔄 Updating beneficiaries...");
      await updateBeneficiariesMutation.mutateAsync({
        workId: selectedWorkId,
        data: viewBeneficiaries
      });
      setViewMessage("✅ Beneficiaries updated successfully!");
      refetchWorkDetails();
    } catch (err: any) {
      setViewMessage(`❌ Error: ${err.response?.data?.error || "Failed to update beneficiaries"}`);
    }
  };

  // ✅ UPDATE VILLAGES
  const handleUpdateVillages = async () => {
    if (!selectedWorkId) return;

    try {
      setViewMessage("🔄 Updating villages...");
      await updateVillagesMutation.mutateAsync({
        workId: selectedWorkId,
        data: { villages: viewVillages }
      });
      setViewMessage("✅ Villages updated successfully!");
      refetchWorkDetails();
    } catch (err: any) {
      setViewMessage(`❌ Error: ${err.response?.data?.error || "Failed to update villages"}`);
    }
  };

  // ✅ UPDATE COMPONENTS
  const handleUpdateComponents = async () => {
    if (!selectedWorkId) return;

    try {
      setViewMessage("🔄 Updating components...");
      await updateComponentsMutation.mutateAsync({
        workId: selectedWorkId,
        data: { components: viewComponents }
      });
      setViewMessage("✅ Components updated successfully!");
      refetchWorkDetails();
    } catch (err: any) {
      setViewMessage(`❌ Error: ${err.response?.data?.error || "Failed to update components"}`);
    }
  };

  // ✅ FORMAT FUNCTIONS
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: string) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  // ✅ Pagination Component
  const renderPagination = () => {
    const paginatedWorks = getPaginatedWorks();
    const totalItems = worksList?.length || 0;
    
    if (totalItems === 0) return null;
    
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    // Generate page numbers to show
    const pageNumbers = [];
    const maxPageButtons = 5;
    
    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
      let endPage = startPage + maxPageButtons - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPageButtons + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white border-t border-gray-200 rounded-b-xl">
        <div className="mb-4 sm:mb-0">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{" "}
            <span className="font-medium">{endItem}</span> of{" "}
            <span className="font-medium">{totalItems}</span> work packages
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center mr-4">
            <label className="text-sm text-gray-700 mr-2">Rows per page:</label>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-1">
            {pageNumbers.map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            
            {totalPages > maxPageButtons && currentPage < totalPages - Math.floor(maxPageButtons / 2) && (
              <>
                <span className="px-2 text-gray-500">...</span>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium ${
                    currentPage === totalPages
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // ✅ RENDER WORK LIST
  const renderWorkList = () => {
    const paginatedWorks = getPaginatedWorks();
    
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6">
          {worksLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading work packages...</p>
            </div>
          ) : worksList.length > 0 ? (
            <>
              <div className="overflow-x-auto rounded-xl border mb-4">
                <table className="w-full">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="p-3 text-left font-semibold text-sm">Package Name</th>
                      <th className="p-3 text-left font-semibold text-sm">Name of Work</th>
                      <th className="p-3 text-left font-semibold text-sm">Division</th>
                      <th className="p-4 text-left font-semibold" style={{ whiteSpace: 'nowrap' }}>Estimated Cost (₹ Cr.)</th>
                      <th className="p-3 text-left font-semibold text-sm">Status of Work</th>
                      <th className="p-3 text-left font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedWorks.map((work: Work) => (
                      <tr key={work.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {work.package_number || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 line-clamp-3 max-w-[200px]" title={work.work_name}>
                          {work.work_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {work.division_name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {work.work_cost || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${work.award_status === "Awarded"
                            ? "bg-green-100 text-green-800"
                            : work.award_status === "In Progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : work.award_status === "Completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                            {work.award_status || "Not Awarded"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewWork(work)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-2"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {renderPagination()}
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No work packages found</h3>
              <p className="text-gray-600 mb-6">Create your first work package to get started</p>
              <button
                onClick={handleShowCreateForm}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
              >
                <Plus className="w-5 h-5 mr-2 inline" />
                Create New Work Package
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ✅ RENDER CREATE FORM
  const renderCreateForm = () => {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Create New Work Package</h2>
              <p className="text-orange-100 mt-1">
                {user ? `Define all work package information in one go (Created by: ${user.username})` : 'Please log in to create work packages'}
              </p>
            </div>
            <button
              onClick={handleShowWorkList}
              className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Work List
            </button>
          </div>
        </div>

        {/* Work Form */}
        <div className="p-8">
          <div className="space-y-8">
            {/* Location Section */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Project Implementation Unit</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Zone *</label>
                  <select
                    name="zone_id"
                    value={formData.zone_id}
                    onChange={(e) => { handleChange(e); setSelectedZoneId(e.target.value) }}
                    className={`w-full px-4 py-3 border rounded-xl ${validationErrors.zone_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    disabled={zonesLoading}
                  >
                    <option value="">
                      {zonesLoading ? "Loading zones..." : "Select Zone"}
                    </option>

                    {zones?.data?.map((z: Zone) => (
                      <option key={z.zone_id} value={z.zone_id}>
                        {z.zone_name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.zone_id && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {validationErrors.zone_id}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Circle *</label>
                  <select
                    name="circle_id"
                    value={formData.circle_id}
                    onChange={(e) => { handleChange(e); setSelectedCircleId(e.target.value) }}
                    disabled={!formData.zone_id || circlesLoading}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white disabled:bg-gray-100 ${validationErrors.circle_id ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">
                      {!formData.zone_id ? "Select zone first" : circlesLoading ? "Loading circles..." : "Select Circle"}
                    </option>
                    {circles?.data.map((c: Circle) => (

                      <option key={c.circle_id} value={c.circle_id}>
                        {c.circle_name}
                      </option>
                    ))
                    }
                  </select>
                  {validationErrors.circle_id && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {validationErrors.circle_id}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Division *</label>
                  <select
                    name="division_id"
                    value={formData.division_id}
                    onChange={handleChange}
                    disabled={!formData.circle_id || divisionsLoading}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white disabled:bg-gray-100 ${validationErrors.division_id ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">
                      {!formData.circle_id ? "Select circle first" : divisionsLoading ? "Loading divisions..." : "Select Division"}
                    </option>
                    {divisions?.data
                      .map((d: Division) => (
                        <option key={d.division_id} value={d.division_id}>
                          {d.division_name}
                        </option>
                      ))
                    }
                  </select>
                  {validationErrors.division_id && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {validationErrors.division_id}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Work Details Section */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Work Information</h3>
                  <p className="text-gray-600">Define work specifications and components</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Component *</label>
                  <select
                    name="component_id"
                    value={formData.component_id}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white ${validationErrors.component_id ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={componentsLoading}
                  >
                    <option value="">{componentsLoading ? "Loading components..." : "Select Component"}</option>
                    {components.map((c: Component) => (
                      <option key={c.id} value={c.id}>
                        {c.component_name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.component_id && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {validationErrors.component_id}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Sub Component</label>
                  <select
                    name="subcomponent_id"
                    value={formData.subcomponent_id}
                    onChange={handleChange}
                    disabled={!formData.component_id || filteredSubcomponentsLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white disabled:bg-gray-100"
                  >
                    <option value="">
                      {!formData.component_id ? "Select component first" : filteredSubcomponentsLoading ? "Loading subcomponents..." : "Select SubComponent"}
                    </option>
                    {filteredSubcomponents.map((s: SubComponent) => (
                      <option key={s.id} value={s.id}>
                        {s.work_component_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Name of Work *</label>
                  <select
                    name="workcomponentId"
                    value={formData.workcomponentId}
                    onChange={handleChange}
                    disabled={!formData.subcomponent_id || filteredSubworkcomponentsLoading}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white disabled:bg-gray-100 ${validationErrors.workcomponentId ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">
                      {!formData.subcomponent_id
                        ? "Select sub component first"
                        : filteredSubworkcomponentsLoading
                          ? "Loading work packages..."
                          : "Select Work Package"
                      }
                    </option>
                    {filteredSubworkcomponents.map((s: SubworkComponent) => (
                      <option key={s.id} value={s.id}>
                        {s.work_package_name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.workcomponentId && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {validationErrors.workcomponentId}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className=" text-sm font-medium text-gray-700 flex items-center">
                    <Ruler className="w-4 h-4 mr-2 text-gray-500" />
                    Length of Work (KM) *
                  </label>
                  <input
                    type="text"
                    name="target_km"
                    value={formData.target_km}
                    readOnly
                    onChange={handleChange}
                    placeholder="Enter distance in kilometers"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white ${validationErrors.target_km ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {validationErrors.target_km && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {validationErrors.target_km}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className=" text-sm font-medium text-gray-700 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    Period of Completion (months) *
                  </label>

                  <select
                    name="work_period_months"
                    value={formData.work_period_months}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white ${validationErrors.work_period_months ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Period</option>
                    <option value="12">12 months (1 milestone)</option>
                    <option value="24">24 months (2 milestones)</option>
                    <option value="36">36 months (3 milestones)</option>
                  </select>
                  {validationErrors.work_period_months && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {validationErrors.work_period_months}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className=" text-sm font-medium text-gray-700 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-gray-500" />
                    Package Number *
                  </label>
                  <input
                    type="text"
                    name="package_number"
                    value={formData.package_number}
                    readOnly
                    onChange={handleChange}
                    placeholder="e.g., WSMC-P-1"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white ${validationErrors.package_number ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {validationErrors.package_number && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {validationErrors.package_number}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className=" text-sm font-medium text-gray-700 flex items-center">
                    <IndianRupee className="w-4 h-4 mr-2 text-gray-500" />
                    Estimated Cost (in Cr.) *
                  </label>
                  <input
                    type="number"
                    name="work_cost"
                    value={formData.work_cost}
                    onChange={handleChange}
                    placeholder="Please enter a valid amount (e.g., 123.45)"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white ${validationErrors.work_cost ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {validationErrors.work_cost && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {validationErrors.work_cost}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Area Under improved Irrigation Services (ha) Targeted *
                  </label>
                  <input
                    type="number"
                    name="Area_Under_improved_Irrigation"
                    value={formData.Area_Under_improved_Irrigation}
                    onChange={handleChange}
                    placeholder="Area Under improved Irrigation Services (ha) Targeted"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white ${validationErrors.Area_Under_improved_Irrigation ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {validationErrors.Area_Under_improved_Irrigation && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {validationErrors.Area_Under_improved_Irrigation}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    People benefitting from improved irrigation infrastructure *
                  </label>
                  <input
                    type="number"
                    value={beneficiaries.total_population}
                    onChange={(e) => handleBeneficiariesChange("total_population", e.target.value)}
                    placeholder="Enter total population"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white ${beneficiariesErrors.total_population ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {beneficiariesErrors.total_population && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {beneficiariesErrors.total_population}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-500" />
                      Male Beneficiaries
                    </span>
                  </label>
                  <input
                    type="number"
                    value={beneficiaries.beneficiaries_male}
                    onChange={(e) => handleBeneficiariesChange("beneficiaries_male", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-blue-50"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-500" />
                      Female Beneficiaries
                    </span>
                  </label>
                  <input
                    type="number"
                    value={beneficiaries.beneficiaries_female}
                    onChange={(e) => handleBeneficiariesChange("beneficiaries_female", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-pink-50"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-500" />
                      Youth (15-28 years)
                    </span>
                  </label>
                  <input
                    type="number"
                    value={beneficiaries.beneficiaries_youth_15_28}
                    onChange={(e) => handleBeneficiariesChange("beneficiaries_youth_15_28", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-green-50"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Villages Section */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                  <Home className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Villages Covered</h3>
                  <p className="text-gray-600">Add villages covered by this Package</p>
                </div>
              </div>

              <div className="space-y-6">
                {villages.map((village, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Village : {i + 1}
                      </h4>
                      {villages.length > 1 && (
                        <button
                          onClick={() => removeVillageField(i)}
                          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">District Name *</label>
                        <input
                          type="text"
                          placeholder="District name"
                          value={village.district_name}
                          onChange={(e) => handleVillageChange(i, "district_name", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${villagesErrors[i]?.district_name ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {villagesErrors[i]?.district_name && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {villagesErrors[i]?.district_name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Block Name *</label>
                        <input
                          type="text"
                          placeholder="Block name"
                          value={village.block_name}
                          onChange={(e) => handleVillageChange(i, "block_name", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${villagesErrors[i]?.block_name ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {villagesErrors[i]?.block_name && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {villagesErrors[i]?.block_name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Gram Panchayat *</label>
                        <input
                          type="text"
                          placeholder="Gram panchayat"
                          value={village.gram_panchayat}
                          onChange={(e) => handleVillageChange(i, "gram_panchayat", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${villagesErrors[i]?.gram_panchayat ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {villagesErrors[i]?.gram_panchayat && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {villagesErrors[i]?.gram_panchayat}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Village Name *</label>
                        <input
                          type="text"
                          placeholder="Village name"
                          value={village.village_name}
                          onChange={(e) => handleVillageChange(i, "village_name", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${villagesErrors[i]?.village_name ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {villagesErrors[i]?.village_name && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {villagesErrors[i]?.village_name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Total Population</label>
                        <input
                          type="number"
                          placeholder="Total population"
                          value={village.census_population}
                          onChange={(e) => handleVillageChange(i, "census_population", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${villagesErrors[i]?.census_population ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {villagesErrors[i]?.census_population && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {villagesErrors[i]?.census_population}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Male Population</label>
                        <input
                          type="number"
                          value={village.male_population}
                          onChange={(e) => handleVillageChange(i, "male_population", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-blue-50"
                          readOnly
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Female Population</label>
                        <input
                          type="number"
                          value={village.female_population}
                          onChange={(e) => handleVillageChange(i, "female_population", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-pink-50"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addVillageField}
                  className="flex items-center justify-center px-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-orange-500 hover:text-orange-600 transition-all duration-200 font-medium"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Another Village
                </button>
              </div>
            </div>

            {/* Extra Components Section */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Milestones</h3>
                </div>
              </div>

              <div className="space-y-6">
                {extraComponents.map((comp, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-6 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Item : {i + 1}
                      </h4>
                      <div className="flex items-center gap-2">
                        {showMilestoneFields && comp.Numberofmilestone !== "0" && (
                          <div className={`text-sm font-medium px-3 py-1 rounded-full ${comp.Numberofmilestone === "1" ? "bg-blue-100 text-blue-800" :
                            comp.Numberofmilestone === "2" ? "bg-green-100 text-green-800" :
                              comp.Numberofmilestone === "3" ? "bg-purple-100 text-purple-800" :
                                "bg-gray-100 text-gray-800"
                            }`}>
                            {comp.Numberofmilestone} Milestone(s)
                          </div>
                        )}
                        {extraComponents.length > 1 && (
                          <button
                            onClick={() => removeComponentField(i)}
                            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Name *</label>
                        <input
                          type="text"
                          placeholder="Description"
                          value={comp.componentname}
                          maxLength={25}
                          onChange={(e) => handleComponentChange(i, "componentname", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${componentsErrors[i]?.componentname ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {componentsErrors[i]?.componentname && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {componentsErrors[i]?.componentname}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Unit *</label>
                        <input
                          type="text"
                          placeholder="e.g., cum, mt, ton"
                          value={comp.unit}
                          onChange={(e) => handleComponentChange(i, "unit", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${componentsErrors[i]?.unit ? 'border-red-500' : 'border-gray-300'}`}
                          onKeyPress={(e) => {
                            if (!/^[A-Za-z]+$/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                        {componentsErrors[i]?.unit && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {componentsErrors[i]?.unit}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700">
                            Total Quantity *
                          </label>
                          {showMilestoneFields && parseInt(comp.Numberofmilestone) > 0 && comp.totalQty && (
                            <button
                              type="button"
                              onClick={() => autoCalculateMilestones(i, comp)}
                              className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              <Calculator className="w-3 h-3 mr-1" />
                              Auto-calculate
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="Enter total quantity"
                            value={comp.totalQty}
                            onChange={(e) => handleComponentChange(i, "totalQty", e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all}`}
                            step="0.01"
                            min="0.01"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">No of Milestones</label>
                        <input
                          type="text"
                          readOnly
                          value={
                            !showMilestoneFields ? "Select period first" :
                              comp.Numberofmilestone === "1" ? "1 (12 months)" :
                                comp.Numberofmilestone === "2" ? "2 (24 months)" :
                                  comp.Numberofmilestone === "3" ? "3 (36 months)" :
                                    "0"
                          }
                          className={`w-full px-3 py-2 border rounded-lg ${showMilestoneFields
                            ? "border-gray-300 bg-gray-50 text-gray-700"
                            : "border-gray-200 bg-gray-100 text-gray-500"
                            } cursor-not-allowed`}
                        />
                      </div>

                      {showMilestoneFields && parseInt(comp.Numberofmilestone) >= 1 && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Milestone 1 Quantity *
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              placeholder="M1 Quantity"
                              value={comp.milestone1_qty}
                              onChange={(e) => handleComponentChange(i, "milestone1_qty", e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500}`}
                              step="0.01"
                              min="0.01"
                              max={comp.totalQty || undefined}
                            />
                          </div>
                          {componentsErrors[i]?.milestone1_qty && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {componentsErrors[i]?.milestone1_qty}
                            </p>
                          )}
                        </div>
                      )}

                      {showMilestoneFields && parseInt(comp.Numberofmilestone) >= 2 && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Milestone 2 Quantity *
                          </label>
                          <input
                            type="number"
                            placeholder="M2 Quantity"
                            value={comp.milestone2_qty}
                            onChange={(e) => handleComponentChange(i, "milestone2_qty", e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${componentsErrors[i]?.milestone2_qty ? 'border-red-500' : 'border-gray-300'}`}
                            step="0.01"
                            min="0.01"
                            max={comp.totalQty || undefined}
                          />
                          {componentsErrors[i]?.milestone2_qty && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {componentsErrors[i]?.milestone2_qty}
                            </p>
                          )}
                        </div>
                      )}

                      {showMilestoneFields && parseInt(comp.Numberofmilestone) >= 3 && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Milestone 3 Quantity *
                          </label>
                          <input
                            type="number"
                            placeholder="M3 Quantity"
                            value={comp.milestone3_qty}
                            onChange={(e) => handleComponentChange(i, "milestone3_qty", e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${componentsErrors[i]?.milestone3_qty ? 'border-red-500' : 'border-gray-300'}`}
                            step="0.01"
                            min="0.01"
                            max={comp.totalQty || undefined}
                          />
                          {componentsErrors[i]?.milestone3_qty && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {componentsErrors[i]?.milestone3_qty}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {componentsErrors[i]?.milestone_sum && (
                      <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                        <div className="flex items-center">
                          <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                          <div>
                            <p className="font-medium">Milestone Quantity Error</p>
                            <p className="text-sm mt-1">{componentsErrors[i]?.milestone_sum}</p>
                            <p className="text-sm mt-1">
                              • Sum of all milestone quantities must equal total quantity
                              <br />
                              • Individual milestone quantity cannot exceed total quantity
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {showMilestoneFields && parseInt(comp.Numberofmilestone) > 0 && comp.totalQty && (
                      <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
                        <div className="flex items-center">
                          <AlertCircle className="w-5 h-5 mr-2" />
                          <div>
                            <p className="font-medium">Milestone Calculation Guide</p>
                            <p className="text-sm mt-1">
                              • Total Quantity: <span className="font-bold">{comp.totalQty}</span>
                              <br />
                              • Milestones: <span className="font-bold">{comp.Numberofmilestone}</span>
                              <br />
                              • <span className="font-bold text-red-600">Rule:</span> M1 + M2 + M3 = Total Quantity
                              <br />
                              • <span className="text-green-600">Tip:</span> Use  Auto calculate for equal distribution
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!showMilestoneFields && (
                      <div className="mt-4">
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                          <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            <div>
                              <p className="font-medium">Milestone fields are hidden</p>
                              <p className="text-sm mt-1">
                                Please select Period of Completion above to show milestone fields.
                                <br />
                                • 12 months = 1 milestone
                                <br />
                                • 24 months = 2 milestones
                                <br />
                                • 36 months = 3 milestones
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  onClick={addComponentField}
                  className="flex items-center justify-center px-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-green-500 hover:text-green-600 transition-all duration-200 font-medium">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Another Component
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="flex items-center justify-center px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Form
              </button>
              <button
                onClick={handleSubmitAll}
                disabled={createWorkMutation.isPending || !user}
                className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {createWorkMutation.isPending ? "Saving..." : user ? "Save Complete Work Package" : "Please Log In"}
              </button>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mt-6 p-4 rounded-xl border ${message.includes("✅") || message.includes("successfully")
            ? "bg-green-50 border-green-200 text-green-800"
            : message.includes("⚠️")
              ? "bg-yellow-50 border-yellow-200 text-yellow-800"
              : "bg-red-50 border-red-200 text-red-800"
            }`}>
            <div className="flex items-center">
              {message.includes("✅") || message.includes("successfully") ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : message.includes("⚠️") ? (
                <AlertCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
              )}
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ✅ RENDER VIEW/EDIT WORK DETAILS
  const renderWorkDetails = () => {
    if (!workDetails) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleBackToListFromView}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Works List
            </button>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{workDetails.work_name}</h1>
                <p className="text-gray-600 mt-2">
                  Package: {workDetails.package_number} • Created: {workDetails.created_at ? formatDate(workDetails.created_at) : "N/A"}
                </p>
              </div>

              <div className="flex gap-3">
                {activeMode === "view" ? (
                  <button
                    onClick={handleEditWork}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Work
                  </button>
                ) : (
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-500">Status</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${workDetails.award_status === "Awarded" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {workDetails.award_status || "Not Awarded"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Estimated Cost</div>
                <div className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(workDetails.work_cost || "0")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Period of Completion (months)</div>
                <div className="text-xl font-bold text-gray-900 mt-1">
                  {workDetails.work_period_months || "0"} months
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              {["overview", "beneficiaries", "villages", "components"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setViewActiveTab(tab)}
                  className={`px-6 py-3 font-medium capitalize whitespace-nowrap ${viewActiveTab === tab
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Overview Tab */}
            {viewActiveTab === "overview" && (
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Work Overview</h2>
                  {activeMode === "edit" && (
                    <button
                      onClick={handleUpdateWork}
                      disabled={updateWorkMutation.isPending}
                      className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateWorkMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name of Work *
                        </label>
                        {activeMode === "edit" ? (
                          <input
                            type="text"
                            name="work_name"
                            value={editFormData.work_name}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        ) : (
                          <div className="text-lg font-medium">{workDetails.work_name}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Package Number *
                        </label>
                        {activeMode === "edit" ? (
                          <input
                            type="text"
                            name="package_number"
                            value={editFormData.package_number}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        ) : (
                          <div className="text-lg font-medium">{workDetails.package_number}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estimated Cost (₹) *
                        </label>
                        {activeMode === "edit" ? (
                          <input
                            type="number"
                            name="work_cost"
                            value={editFormData.work_cost}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        ) : (
                          <div className="text-lg font-medium">{formatCurrency(workDetails.work_cost || "0")}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Length of Work (KM) *
                        </label>
                        {activeMode === "edit" ? (
                          <input
                            type="text"
                            name="target_km"
                            value={editFormData.target_km}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        ) : (
                          <div className="text-lg font-medium">{workDetails.target_km} km</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Period of Completion (months) *
                        </label>
                        {activeMode === "edit" ? (
                          <input
                            type="number"
                            name="work_period_months"
                            value={editFormData.work_period_months}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        ) : (
                          <div className="text-lg font-medium">{workDetails.work_period_months} months</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Area Under improved Irrigation Services (ha) Targeted
                        </label>
                        {activeMode === "edit" ? (
                          <input
                            type="number"
                            name="Area_Under_improved_Irrigation"
                            value={editFormData.Area_Under_improved_Irrigation}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        ) : (
                          <div className="text-lg font-medium">{workDetails.Area_Under_improved_Irrigation || "0"} ha</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Beneficiaries Tab */}
            {viewActiveTab === "beneficiaries" && (
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Beneficiaries</h2>
                  {activeMode === "edit" && (
                    <button
                      onClick={handleUpdateBeneficiaries}
                      disabled={updateBeneficiariesMutation.isPending}
                      className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateBeneficiariesMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                  )}
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Population *
                      </label>
                      {activeMode === "edit" ? (
                        <input
                          type="number"
                          value={viewBeneficiaries?.total_population || ""}
                          onChange={(e) => handleEditBeneficiariesChange("total_population", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter total population"
                        />
                      ) : (
                        <div className="text-3xl font-bold text-gray-900">
                          {viewBeneficiaries?.total_population || "0"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Male Beneficiaries
                      </label>
                      {activeMode === "edit" ? (
                        <input
                          type="number"
                          value={viewBeneficiaries?.beneficiaries_male || ""}
                          onChange={(e) => handleEditBeneficiariesChange("beneficiaries_male", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                          readOnly
                        />
                      ) : (
                        <div className="text-3xl font-bold text-gray-900">
                          {viewBeneficiaries?.beneficiaries_male || "0"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Female Beneficiaries
                      </label>
                      {activeMode === "edit" ? (
                        <input
                          type="number"
                          value={viewBeneficiaries?.beneficiaries_female || ""}
                          onChange={(e) => handleEditBeneficiariesChange("beneficiaries_female", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-pink-50"
                          readOnly
                        />
                      ) : (
                        <div className="text-3xl font-bold text-gray-900">
                          {viewBeneficiaries?.beneficiaries_female || "0"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Youth (15-28 years)
                      </label>
                      {activeMode === "edit" ? (
                        <input
                          type="number"
                          value={viewBeneficiaries?.beneficiaries_youth_15_28 || ""}
                          onChange={(e) => handleEditBeneficiariesChange("beneficiaries_youth_15_28", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-green-50"
                          readOnly
                        />
                      ) : (
                        <div className="text-3xl font-bold text-gray-900">
                          {viewBeneficiaries?.beneficiaries_youth_15_28 || "0"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Villages Tab */}
            {viewActiveTab === "villages" && (
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Area Covered</h2>
                  {activeMode === "edit" && (
                    <button
                      onClick={handleUpdateVillages}
                      disabled={updateVillagesMutation.isPending}
                      className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateVillagesMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {viewVillages.length > 0 ? (
                    viewVillages.map((village, i) => (
                      <div key={village.id || i} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Village {i + 1}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              District Name
                            </label>
                            {activeMode === "edit" ? (
                              <input
                                type="text"
                                value={village.district_name}
                                onChange={(e) => handleEditVillageChange(i, "district_name", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter district name"
                              />
                            ) : (
                              <div className="font-medium">{village.district_name}</div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Block Name
                            </label>
                            {activeMode === "edit" ? (
                              <input
                                type="text"
                                value={village.block_name}
                                onChange={(e) => handleEditVillageChange(i, "block_name", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter block name"
                              />
                            ) : (
                              <div className="font-medium">{village.block_name}</div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Gram Panchayat
                            </label>
                            {activeMode === "edit" ? (
                              <input
                                type="text"
                                value={village.gram_panchayat}
                                onChange={(e) => handleEditVillageChange(i, "gram_panchayat", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter gram panchayat"
                              />
                            ) : (
                              <div className="font-medium">{village.gram_panchayat}</div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Village Name
                            </label>
                            {activeMode === "edit" ? (
                              <input
                                type="text"
                                value={village.village_name}
                                onChange={(e) => handleEditVillageChange(i, "village_name", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter village name"
                              />
                            ) : (
                              <div className="font-medium">{village.village_name}</div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Total Population *
                            </label>
                            {activeMode === "edit" ? (
                              <input
                                type="number"
                                value={village.census_population}
                                onChange={(e) => handleEditVillageChange(i, "census_population", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter total population"
                              />
                            ) : (
                              <div className="font-medium">{village.census_population}</div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Male Population
                            </label>
                            {activeMode === "edit" ? (
                              <input
                                type="number"
                                value={village.male_population}
                                onChange={(e) => handleEditVillageChange(i, "male_population", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                                readOnly
                              />
                            ) : (
                              <div className="font-medium">{village.male_population}</div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Female Population
                            </label>
                            {activeMode === "edit" ? (
                              <input
                                type="number"
                                value={village.female_population}
                                onChange={(e) => handleEditVillageChange(i, "female_population", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-pink-50"
                                readOnly
                              />
                            ) : (
                              <div className="font-medium">{village.female_population}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No villages added</h3>
                      <p className="text-gray-600">Add villages to this work package</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Components Tab */}
            {viewActiveTab === "components" && (
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Components & Milestones</h2>
                  {activeMode === "edit" && (
                    <button
                      onClick={handleUpdateComponents}
                      disabled={updateComponentsMutation.isPending}
                      className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateComponentsMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {viewComponents.length > 0 ? (
                    viewComponents.map((component, i) => (
                      <div key={component.id || i} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Component {i + 1}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description
                            </label>
                            {activeMode === "edit" ? (
                              <input
                                type="text"
                                value={component.nameofcomponent}
                                onChange={(e) => handleEditComponentChange(i, "componentname", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            ) : (
                              <div className="font-medium">{component.nameofcomponent}</div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Unit
                            </label>
                            {activeMode === "edit" ? (
                              <input
                                type="text"
                                value={component.unitname}
                                onChange={(e) => handleEditComponentChange(i, "unit", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            ) : (
                              <div className="font-medium">{component.unitname}</div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Total Quantity
                            </label>
                            {activeMode === "edit" ? (
                              <input
                                type="number"
                                value={component.total_qty}
                                onChange={(e) => handleEditComponentChange(i, "totalQty", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            ) : (
                              <div className="font-medium">{component.total_qty}</div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Milestones
                            </label>
                            <div className="font-medium">{component.num_of_milestones || "0"}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No components added</h3>
                      <p className="text-gray-600">Add components to this work package</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Message Display */}
          {viewMessage && (
            <div className={`mt-6 p-4 rounded-xl border ${viewMessage.includes("✅") || viewMessage.includes("successfully")
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
              }`}>
              <div className="flex items-center">
                {viewMessage.includes("✅") || viewMessage.includes("successfully") ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2" />
                )}
                <span className="font-medium">{viewMessage}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ✅ MAIN RENDER LOGIC
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ✅ FIXED ERROR BANNER AT THE VERY TOP */}
      {message && (
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className={`p-4 rounded-lg border flex items-center justify-between ${message.includes("✅") || message.includes("successfully")
              ? "bg-green-50 border-green-200 text-green-800"
              : message.includes("⚠️")
                ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                : "bg-red-50 border-red-200 text-red-800"
              }`}>
              <div className="flex items-center">
                {message.includes("✅") || message.includes("successfully") ? (
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                ) : message.includes("⚠️") ? (
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                )}
                <span className="font-medium">{message}</span>
              </div>
              <button
                onClick={() => setMessage("")}
                className="ml-4 flex-shrink-0 hover:opacity-75"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">

          {/* ✅ Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">Work Package Management</h3>
                <p className="text-gray-600 mt-1">
                  {activeMode === "list" ? "Manage existing work packages" :
                    activeMode === "create" ? "Create new work package" :
                      activeMode === "view" ? "View work package details" :
                        "Edit work package details"}
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3">

                {activeMode === "list" && (
                  <button
                    onClick={handleShowCreateForm}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Work
                  </button>
                )}
              </div>
            </div>


          </div>

          {/* ✅ Render Content Based on Active Mode */}
          {activeMode === "list" && renderWorkList()}
          {activeMode === "create" && renderCreateForm()}
          {(activeMode === "view" || activeMode === "edit") && renderWorkDetails()}

        </div>
      </div>
    </div>
  );
};

export default CreateWorkPackages;