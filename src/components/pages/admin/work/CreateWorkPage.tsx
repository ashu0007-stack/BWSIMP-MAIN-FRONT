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
  IndianRupee,
  Calendar,
  ArrowLeft,
  X,
  Calculator,
} from "lucide-react";

import {
  useCreateWork,
  useAddBeneficiaries,
  useAddVillages,
  useAddComponentsAndMilestones,
  useWorks,
} from "@/hooks/wrdHooks/useWorks";

import { useZones } from "@/hooks/location/useZone";
import { useComponents, useSubcomponentsByComponent, useSubworkcomponentsByworkComponentId } from "@/hooks/wrdHooks/useComponents";
import { useCirclesByZoneId } from "@/hooks/location/useCircle";
import { useDivisionByCircleId } from "@/hooks/location/useDivision";

import {
  WorkFormData,
  ValidationErrors,
  UserData,
  Village,
  WorkComponent,
  Beneficiaries,
  Zone,
  Circle,
  Division,
  Component,
  SubComponent,
  SubworkComponent,
  Work
} from "@/components/shared/work";

interface CreateWorkPageProps {
  user: UserData | null;
  onBackToList: () => void;
}

const CreateWorkPage: React.FC<CreateWorkPageProps> = ({ user, onBackToList }) => {
  // Work Form Data
  const [formData, setFormData] = useState<WorkFormData>({
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

  // Validation Errors State
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Beneficiaries data
  const [beneficiaries, setBeneficiaries] = useState<Beneficiaries>({
    total_population: "",
    beneficiaries_youth_15_28: "",
    beneficiaries_female: "",
    beneficiaries_male: ""
  });

  const [beneficiariesErrors, setBeneficiariesErrors] = useState<ValidationErrors>({});

  // Villages data
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

  const [villagesErrors, setVillagesErrors] = useState<ValidationErrors[]>([]);

  // Components data
  const [extraComponents, setExtraComponents] = useState<WorkComponent[]>([
    {
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
    },
  ]);

  const [componentsErrors, setComponentsErrors] = useState<ValidationErrors[]>([]);

  // State variables
  const [message, setMessage] = useState("");
  const [showMilestoneFields, setShowMilestoneFields] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [selectedCircleId, setSelectedCircleId] = useState<string>("");

  // React Query Hooks
  const { data: zones, isLoading: zonesLoading } = useZones();
  const { data: circles, isLoading: circlesLoading } = useCirclesByZoneId(selectedZoneId);
  const { data: divisions, isLoading: divisionsLoading } = useDivisionByCircleId(selectedCircleId);

  const { data: components = [], isLoading: componentsLoading } = useComponents();
  const { data: filteredSubcomponents = [], isLoading: filteredSubcomponentsLoading } = useSubcomponentsByComponent(
    formData.component_id ? parseInt(formData.component_id) : undefined
  );

  const { data: filteredSubworkcomponents = [], isLoading: filteredSubworkcomponentsLoading } = useSubworkcomponentsByworkComponentId(
    formData.subcomponent_id ? parseInt(formData.subcomponent_id) : undefined
  );

  const { data: worksList = [], refetch: refetchWorks } = useWorks();

  // Mutation hooks
  const createWorkMutation = useCreateWork();
  const addBeneficiariesMutation = useAddBeneficiaries();
  const addVillagesMutation = useAddVillages();
  const addComponentsMutation = useAddComponentsAndMilestones();

  // Set user data on component mount
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        zone_id: user.zone_id?.toString() || "",
        circle_id: user.circle_id?.toString() || "",
        division_id: user.division_id?.toString() || ""
      }));
      
      if (user.zone_id) setSelectedZoneId(user.zone_id.toString());
      if (user.circle_id) setSelectedCircleId(user.circle_id.toString());
    }
  }, [user]);

  // Validation Functions
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

  // Main Validation Function for Form
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

  // Function to validate milestone sum
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

  // Add auto-calculate function for milestones
 const autoCalculateMilestones = (i: number, component: WorkComponent) => {
  const updated = [...extraComponents];
  const totalQty = parseFloat(component.totalQty) || 0;
  const milestones = parseInt(component.Numberofmilestone);

  if (totalQty > 0 && milestones > 0) {
    if (milestones === 1) {
      // For 1 milestone, put entire quantity in milestone 1
      updated[i].milestone1_qty = totalQty.toFixed(2);
      updated[i].milestone2_qty = "";
      updated[i].milestone3_qty = "";
    }
    else if (milestones === 2) {
      // For 2 milestones, split 50-50
      const half = totalQty / 2;
      updated[i].milestone1_qty = half.toFixed(2);
      updated[i].milestone2_qty = half.toFixed(2);
      updated[i].milestone3_qty = "";
    }
    else if (milestones === 3) {
      // For 3 milestones, split 33-33-34
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

  // Check for duplicate work name
  const checkForDuplicateWorkName = (workName: string) => {
    if (!worksList || worksList.length === 0) return false;

    const existingWork = worksList.find(
      (work: Work) =>
        work.work_name.toLowerCase().trim() === workName.toLowerCase().trim()
    );

    return !!existingWork;
  };

  // Get user data for API
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

  // Handle form changes
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
      setSelectedZoneId(value);
      setFormData(prev => ({
        ...prev,
        zone_id: value,
        circle_id: "",
        division_id: ""
      }));
    } else if (name === "circle_id") {
      setSelectedCircleId(value);
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

      if (months ===  12 || months === 16) {
        numMilestones = 1;
      } else if (months === 24 || months === 32) {
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

     if (months === 12 || months === 16 || months === 24 || months === 32 || months === 36) {
        setShowMilestoneFields(true);
      } else {
        setShowMilestoneFields(false);
      }
    }
  };

  // Handle beneficiaries changes
  const handleBeneficiariesChange = (field: keyof Beneficiaries, value: string) => {
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

  // Handle village changes
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

  // Handle component changes
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

  // Add component field
  const addComponentField = () => {
    const months = parseInt(formData.work_period_months) || 0;
    let numMilestones = 0;

    if (months === 12 || months === 16) {
      numMilestones = 1;
    } else if (months === 24 || months === 32) {
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

  // Remove component field
  const removeComponentField = (i: number) => {
    const updated = [...extraComponents];
    updated.splice(i, 1);
    setExtraComponents(updated);

    const updatedErrors = [...componentsErrors];
    updatedErrors.splice(i, 1);
    setComponentsErrors(updatedErrors);
  };

  // Add village field
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

  // Remove village field
  const removeVillageField = (i: number) => {
    const updated = [...villages];
    updated.splice(i, 1);
    setVillages(updated);

    const updatedErrors = [...villagesErrors];
    updatedErrors.splice(i, 1);
    setVillagesErrors(updatedErrors);
  };

  // Reset form
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

  // Save all data
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
        onBackToList();
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

  // Render CREATE form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Message Banner */}
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

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={onBackToList}
                 className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  ⬅ Back
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Create New Work Package</h1>
                <p className="text-gray-600 mt-1">
                  {user ? `Define all work package information in one go (Created by: ${user.username})` : 'Please log in to create work packages'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
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
                      <p className="text-gray-600">Select the geographical location for this work</p>
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
                        ))}
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
                          ))}
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
  <option value="16">16 months (1 milestone)</option>
  <option value="24">24 months (2 milestones)</option>
  <option value="32">32 months (2 milestones)</option>
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
                      <p className="text-gray-600">Define components and their milestones</p>
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
                                  comp.Numberofmilestone === "1" ? 
          formData.work_period_months === "12" ? "1 (12 months)" : 
          formData.work_period_months === "16" ? "1 (16 months)" : "1 milestone" :
        comp.Numberofmilestone === "2" ? 
          formData.work_period_months === "24" ? "2 (24 months)" : 
          formData.work_period_months === "32" ? "2 (32 months)" : "2 milestones" :
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
          • Period: <span className="font-bold">{formData.work_period_months} months</span>
          <br />
          • Milestones: <span className="font-bold">{comp.Numberofmilestone}</span>
          <br />
          • <span className="font-bold text-red-600">Rule:</span> M1 + M2 + M3 = Total Quantity
          <br />
          • <span className="text-green-600">Tip:</span> Use Auto calculate for equal distribution
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
                                     • 16 months = 1 milestone
                                    <br />
                                    • 24 months = 2 milestones
                                    <br />
                                    • 32 months = 2 milestones
                                    <br />
                                    • 36 months = 3 milestones
                                    <br />
                                   
                                   
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkPage;