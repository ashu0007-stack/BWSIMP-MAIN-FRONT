"use client";
import { useState, useEffect,useCallback } from "react";
import { useDistricts } from "@/hooks/location/useDistricts";
import { useBlocks } from "@/hooks/location/useBlocks";
import { useGramPanchayatsByBlock } from "@/hooks/location/useGramPanchayatsByBlock";
import { useWorkCategories, useSubCategoriesByCategory, useCreateDataEntry } from "@/hooks/useRdd";
import { AlertCircle, CheckCircle2 } from "lucide-react";
// Import the correct types from your types file
import { DataEntryFormData, FormProps, District, GramPanchayat } from "./types";

// Import components
import UserSchemaSection from "./DataEntryForm/sections/UserSchemaSection";
import LocationSection from "./DataEntryForm/sections/LocationSection";
import WorkDetailsSection from "./DataEntryForm/sections/WorkDetailsSection";
import MeasurementsSection from "./DataEntryForm/sections/MeasurementsSection";
import TimelineDocumentsSection from "./DataEntryForm/sections/TimelineDocumentsSection";
import ActionButtons from "./DataEntryForm/ActionButtons";
import ReviewModal from "./DataEntryForm/ReviewModal";
import ErrorDisplay from "./DataEntryForm/ErrorDisplay";
import SuccessMessage from "./DataEntryForm/SuccessMessage";
import LoadingState from "./DataEntryForm/LoadingState";

export default function DataEntryForm() {
  // Use DataEntryFormData for form state - district is now number
  const [formData, setFormData] = useState<DataEntryFormData>({
    district: 0,
    districts: "",
    block: "",
    panchayat: "",
    financialYear: "",
    workCode: "",
    workName: "",
    workCategory: "",
    workType: "",
    agency: "",
    commandArea: "",
    propLength: "",
    propWidth: "",
    propHeight: "",
    sanctionAmtWages: "",
    sanctionAmtMaterial: "",
    workStartDate: "",
    workCompletionDate: "",
    remarks: "",
    asUpload: null,
    schemaType: "",
    userId: "",
  });

  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [backendErrors, setBackendErrors] = useState<Record<string, string>>({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [success, setSuccess] = useState("");
  const [districtResolved, setDistrictResolved] = useState(false);

  // React Query Hooks with proper typing
  const { data: districts = [], isLoading: districtsLoading } = useDistricts();

  // ✅ Now using number directly (formData.district is number)
  const { data: blocks = [], isLoading: blocksLoading } = useBlocks(
    formData.district ? formData.district : undefined
  );

  // In your main component:
  const { data: panchayats = [], isLoading: panchayatsLoading } = useGramPanchayatsByBlock(
    formData.block ? parseInt(formData.block) : undefined
  ) as { data: GramPanchayat[]; isLoading: boolean };

  const createMutation = useCreateDataEntry();
  const { data: workCategories = [], isLoading: categoriesLoading } = useWorkCategories();
  const { data: subCategories = [], isLoading: subCategoriesLoading } = useSubCategoriesByCategory(
    formData.workCategory ? parseInt(formData.workCategory) : undefined
  );

  // Combined loading state
  const loading = districtsLoading || blocksLoading || panchayatsLoading || categoriesLoading || subCategoriesLoading;
  const submitting = createMutation.isPending;
  const error = createMutation.error ? (createMutation.error as any).message || "An error occurred" : "";

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // ========== ENHANCED DISTRICT RESOLUTION LOGIC ==========
  // 1. Load User Session with enhanced debugging
  useEffect(() => {
    const userDetail = sessionStorage.getItem('userdetail');
    if (userDetail) {
      try {
        const user = JSON.parse(userDetail);
        console.log("👤 Parsed user details:", {
          id: user.id,
          district_id: user.district_id,
          district_name: user.district_name,
          username: user.full_name,
          fullUserObject: user
        });

        setFormData(prev => ({
          ...prev,
          userId: user.id?.toString() || "",
          districts: user.district_name || "",
          district: user.district_id ? Number(user.district_id) : prev.district
        }));
        // If we have district_id, mark as resolved immediately
        if (user.district_id) {
          setDistrictResolved(true);
          console.log("✅ District pre-resolved from session district_id:", user.district_id);
        }
      } catch (error) {
        console.error("❌ Error parsing user details:", error);
      }
    } else {
      console.warn("⚠️ No userdetail found in sessionStorage");
    }
  }, []);

  // 2. Enhanced District Resolution with multiple matching strategies
  useEffect(() => {
    if (formData.districts && districts.length > 0 && !districtResolved) {
      console.log("🎯 ENHANCED DISTRICT RESOLUTION STARTED:", {
        userDistrict: formData.districts,
        availableDistrictsCount: districts.length,
        districts: districts.map((d: District) => ({ id: d.district_id, name: d.district_name }))
      });

      // STRATEGY 1: Direct ID match (since we have district_id in user data)
      const userDetail = sessionStorage.getItem('userdetail');
      let userDistrictId: number | null = null;

      if (userDetail) {
        try {
          const user = JSON.parse(userDetail);
          userDistrictId = Number(user.district_id); // Convert to number
          console.log("🆔 Found user district_id from session:", userDistrictId);
        } catch (error) {
          console.error("Error parsing user detail:", error);
        }
      }

      // Try to find by district_id first (most reliable)
      let foundDistrict: District | undefined = undefined;

      if (userDistrictId) {
        foundDistrict = districts.find((d: District) => d.district_id === userDistrictId);
        if (foundDistrict) {
          console.log("✅ FOUND DISTRICT BY ID MATCH:", {
            method: "district_id match",
            userDistrictId,
            foundDistrict
          });
        }
      }

      // STRATEGY 2: If ID match failed, try name matching
      if (!foundDistrict) {
        // Try exact match (case-insensitive, trimmed)
        foundDistrict = districts.find((d: District) => {
          const apiName = (d.district_name || "").toLowerCase().trim();
          const userName = formData.districts.toLowerCase().trim();
          return apiName === userName;
        });

        if (foundDistrict) {
          console.log("✅ FOUND DISTRICT BY NAME MATCH (exact):", {
            method: "exact name match",
            foundDistrict
          });
        }
      }

      // STRATEGY 3: Try uppercase match
      if (!foundDistrict) {
        foundDistrict = districts.find((d: District) => {
          const apiName = (d.district_name || "").toUpperCase().trim();
          const userName = formData.districts.toUpperCase().trim();
          return apiName === userName;
        });

        if (foundDistrict) {
          console.log("✅ FOUND DISTRICT BY NAME MATCH (uppercase):", {
            method: "uppercase name match",
            foundDistrict
          });
        }
      }

      if (foundDistrict) {
        console.log("🎯 DISTRICT RESOLVED FINALLY:", {
          userDistrictName: formData.districts,
          foundDistrictName: foundDistrict.district_name,
          foundDistrictId: foundDistrict.district_id,
          matchType: userDistrictId === foundDistrict.district_id ? "ID Match" : "Name Match"
        });

        setFormData(prev => ({
          ...prev,
          district: foundDistrict!.district_id // Store as number
        }));
        setDistrictResolved(true);
      } else {
        console.error("❌ ALL DISTRICT MATCHING STRATEGIES FAILED:", {
          userDistrict: formData.districts,
          userDistrictId,
          availableDistricts: districts.map((d: District) => ({
            id: d.district_id,
            name: d.district_name,
            matches: d.district_name?.toLowerCase() === formData.districts?.toLowerCase()
          }))
        });

        setDistrictResolved(false);
        setFormData(prev => ({ ...prev, district: 0 }));
      }
    }
  }, [formData.districts, districts, districtResolved]);

  // ========== CASCADING RESET LOGIC ==========

  // Reset workType when workCategory changes
  useEffect(() => {
    if (formData.workCategory) {
      setFormData(prev => ({ ...prev, workType: "" }));
    }
  }, [formData.workCategory]);

  // Reset block and panchayat when district changes
  useEffect(() => {
    if (formData.district) {
      console.log("🔄 District changed, resetting block and panchayat");
      setFormData(prev => ({ ...prev, block: "", panchayat: "" }));
    }
  }, [formData.district]);

  // Reset panchayat when block changes
  useEffect(() => {
    if (formData.block) {
      console.log("🔄 Block changed, resetting panchayat");
      setFormData(prev => ({ ...prev, panchayat: "" }));
    }
  }, [formData.block]);

  // ========== CALCULATIONS & VALIDATIONS ==========

  // Calculate total amount
  useEffect(() => {
    const wages = parseFloat(formData.sanctionAmtWages) || 0;
    const material = parseFloat(formData.sanctionAmtMaterial) || 0;
    setTotalAmount(wages + material);
  }, [formData.sanctionAmtWages, formData.sanctionAmtMaterial]);

  // Clear backend errors when form changes
  useEffect(() => {
    if (Object.keys(backendErrors).length > 0) {
      setBackendErrors({});
    }
  }, [formData, backendErrors]);

  // ========== HELPER FUNCTIONS ==========

  const getWorkCategoryName = () => {
    const category = workCategories.find(c => c.id === parseInt(formData.workCategory));
    return category ? category.category_name : formData.workCategory;
  };

  // const getWorkTypeName = () => {
  //   const subCategory = subCategories.find(s => s.id === parseInt(formData.workType));
  //   return subCategory ? subCategory.sub_category_name : formData.workType;
  // };

  // const getDistrictName = () => {
  //   return formData.districts || '-';
  // };

  // const getBlockName = () => {
  //   const block = blocks.find((b: { block_id: number; block_name: string }) =>
  //     b.block_id === parseInt(formData.block)
  //   );
  //   return block ? block.block_name : formData.block;
  // };

  const getUserName = () => {
    const userDetail = sessionStorage.getItem('userdetail');
    if (userDetail) {
      try {
        const user = JSON.parse(userDetail);
        return user.full_name || user.full_name || `User ${user.id}`;
      } catch (error) {
        return `User ${formData.userId}`;
      }
    }
    return `User ${formData.userId}`;
  };

  // ========== EVENT HANDLERS ==========

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`📝 Field changed: ${name} = ${value} (type: ${typeof value})`);

    // Handle district specially since it's a number
    if (name === 'district') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? Number(value) : 0
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (backendErrors[name]) {
      setBackendErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors, backendErrors]);

  const handleNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Remove any non-digit characters except decimal point
    const sanitizedValue = value.replace(/[^\d.]/g, '');

    // Ensure only one decimal point
    const parts = sanitizedValue.split('.');
    let finalValue = parts.length > 2
      ? parts[0] + '.' + parts.slice(1).join('')
      : sanitizedValue;

    // Limit to 2 decimal places
    if (finalValue.includes('.')) {
      const decimalParts = finalValue.split('.');
      if (decimalParts[1].length > 2) {
        finalValue = decimalParts[0] + '.' + decimalParts[1].slice(0, 2);
      }
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (backendErrors[name]) {
      setBackendErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors, backendErrors]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      // Validate file type - ONLY PDF allowed
      const allowedTypes = ['application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, asUpload: "Only PDF files are allowed for upload" }));
        e.target.value = '';
        return;
      }

      // Validate file extension
      const fileExtension = file.name.toLowerCase().split('.').pop();
      if (fileExtension !== 'pdf') {
        setErrors(prev => ({ ...prev, asUpload: "Only .pdf files are allowed" }));
        e.target.value = '';
        return;
      }

      // Validate file size (5MB max)
      const maxFileSize = 5 * 1024 * 1024;
      if (file.size > maxFileSize) {
        setErrors(prev => ({ ...prev, asUpload: "File size must be less than 5MB" }));
        e.target.value = '';
        return;
      }

      console.log("✅ Valid PDF file selected:", {
        name: file.name,
        type: file.type,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB"
      });
    }

    setFormData(prev => ({ ...prev, asUpload: file }));
    if (errors.asUpload) {
      setErrors(prev => ({ ...prev, asUpload: "" }));
    }
    if (backendErrors.asUpload) {
      setBackendErrors(prev => ({ ...prev, asUpload: "" }));
    }
  }, [errors, backendErrors]);

  // ========== FORM VALIDATION ==========

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // District validation with better error messages
    if (!formData.district || formData.district === 0) {
      if (!formData.districts) {
        newErrors.district = "Your account is not assigned to any district. Please contact administrator.";
      } else {
        newErrors.district = `Could not resolve district "${formData.districts}". Please select manually or contact administrator.`;
      }
    }
    if (!formData.districts) {
      newErrors.district = "District name is not assigned to your user account";
    }

    // Required fields validation
    if (!formData.block) newErrors.block = "Block is required";
    if (!formData.panchayat) newErrors.panchayat = "Gram Panchayat is required";
    if (!formData.financialYear) newErrors.financialYear = "Financial Year is required";
    if (!formData.workCode) newErrors.workCode = "Work Code is required";
    if (!formData.workName) newErrors.workName = "Work Name is required";
    if (!formData.workCategory) newErrors.workCategory = "Work Category is required";
    if (!formData.workType) newErrors.workType = "Work Type is required";
    if (!formData.agency) newErrors.agency = "Agency Name is required";
    if (!formData.asUpload) newErrors.asUpload = "AS document is required";
    if (!formData.schemaType) newErrors.schemaType = "Schema Type is required";
    if (!formData.userId) newErrors.userId = "User ID is required";

    // Validate uploaded file type and size
    if (formData.asUpload) {
      const allowedTypes = ['application/pdf'];
      if (!allowedTypes.includes(formData.asUpload.type)) {
        newErrors.asUpload = "Only PDF files are allowed for upload";
      }

      const fileExtension = formData.asUpload.name.toLowerCase().split('.').pop();
      if (fileExtension !== 'pdf') {
        newErrors.asUpload = "Only .pdf files are allowed";
      }

      const maxFileSize = 5 * 1024 * 1024;
      if (formData.asUpload.size > maxFileSize) {
        newErrors.asUpload = "File size must be less than 5MB";
      }
    }

    // Work code validation
    const workCodePattern = /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?/~`]+$/;
    if (formData.workCode && !workCodePattern.test(formData.workCode)) {
      newErrors.workCode = "Work Code must be alphanumeric and can include special characters";
    }
    if (formData.workCode && (formData.workCode.length < 3 || formData.workCode.length > 50)) {
      newErrors.workCode = "Work Code must be between 3 and 50 characters";
    }

    // Financial Year pattern check
    const fyPattern = /^\d{4}-\d{2}$/;
    if (formData.financialYear && !fyPattern.test(formData.financialYear)) {
      newErrors.financialYear = "Financial Year must follow YYYY-YY format (e.g. 2024-25)";
    }

    // Number validations
    const commandAreaPattern = /^\d*(\.\d{1,2})?$/;
    if (formData.commandArea && !commandAreaPattern.test(formData.commandArea)) {
      newErrors.commandArea = "Command Area must be a number with up to 2 decimal places";
    }

    const dimensionPattern = /^\d{1,3}(\.\d{1,2})?$/;
    if (formData.propLength && !dimensionPattern.test(formData.propLength)) {
      newErrors.propLength = "Length must be a number with up to 3 digits and 2 decimal places";
    }
    if (formData.propWidth && !dimensionPattern.test(formData.propWidth)) {
      newErrors.propWidth = "Width must be a number with up to 3 digits and 2 decimal places";
    }
    if (formData.propHeight && !dimensionPattern.test(formData.propHeight)) {
      newErrors.propHeight = "Height must be a number with up to 3 digits and 2 decimal places";
    }

    const amountPattern = /^\d*(\.\d{1,2})?$/;
    if (formData.sanctionAmtWages && !amountPattern.test(formData.sanctionAmtWages)) {
      newErrors.sanctionAmtWages = "Sanction amount for wages must be a number with up to 2 decimal places";
    }
    if (formData.sanctionAmtMaterial && !amountPattern.test(formData.sanctionAmtMaterial)) {
      newErrors.sanctionAmtMaterial = "Sanction amount for material must be a number with up to 2 decimal places";
    }

    // Date validations
    if (formData.workStartDate) {
      const startDate = new Date(formData.workStartDate);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      if (startDate < todayDate) {
        newErrors.workStartDate = "Work start date cannot be in the past";
      }
    }

    if (formData.workCompletionDate) {
      const completionDate = new Date(formData.workCompletionDate);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      if (completionDate < todayDate) {
        newErrors.workCompletionDate = "Completion date cannot be in the past";
      }

      if (formData.workStartDate && formData.workCompletionDate) {
        const startDate = new Date(formData.workStartDate);
        if (completionDate < startDate) {
          newErrors.workCompletionDate = "Completion date cannot be before start date";
        }
      }
    }
    // Number validations for positive values
    const parseAndValidatePositive = (value: string, fieldName: string) => {
      const num = parseFloat(value);
      if (value && (isNaN(num) || num <= 0)) {
        newErrors[fieldName] = `${fieldName} must be a number greater than 0`;
      }
    };
    if (formData.commandArea) parseAndValidatePositive(formData.commandArea, "commandArea");
    if (formData.propLength) parseAndValidatePositive(formData.propLength, "propLength");
    if (formData.propWidth) parseAndValidatePositive(formData.propWidth, "propWidth");
    if (formData.propHeight) parseAndValidatePositive(formData.propHeight, "propHeight");
    if (formData.sanctionAmtWages) parseAndValidatePositive(formData.sanctionAmtWages, "sanctionAmtWages");
    if (formData.sanctionAmtMaterial) parseAndValidatePositive(formData.sanctionAmtMaterial, "sanctionAmtMaterial");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========== FORM ACTIONS ==========
  const handleReview = () => {
    if (validateForm()) {
      setShowReviewModal(true);
    }
  };
  const handleSubmitFromModal = async () => {
    try {
      if (!formData.asUpload) {
        setErrors(prev => ({ ...prev, asUpload: "Please upload AS document" }));
        return;
      }
      // Use the built-in FormData class
      const submitData = new FormData();
      // Append all form data EXCEPT districts (we only need district ID)
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'districts') return; // Don't send district name, only ID

        if (key === 'asUpload' && value) {
          submitData.append(key, value);
        } else if (value !== null && value !== undefined) {
          submitData.append(key, value.toString());
        }
      });
      await createMutation.mutateAsync(submitData);
      setSuccess("✅ Data saved successfully!");
      setShowReviewModal(false);
      resetForm();

    } catch (err: any) {
      if (err.errors && typeof err.errors === 'object') {
        setBackendErrors(err.errors);
      }
    }
  };

  const resetForm = () => {
    const userDetail = sessionStorage.getItem('userdetail');
    let userId = "";
    let userDistrict = "";

    if (userDetail) {
      try {
        const user = JSON.parse(userDetail);
        userId = user.id?.toString() || "";
        userDistrict = user.district_name || "";
      } catch (error) {
        console.error("Error parsing user details:", error);
      }
    }

    setFormData({
      district: 0, // Reset to 0 instead of ""
      districts: userDistrict,
      block: "",
      panchayat: "",
      financialYear: "",
      workCode: "",
      workName: "",
      workCategory: "",
      workType: "",
      agency: "",
      commandArea: "",
      propLength: "",
      propWidth: "",
      propHeight: "",
      sanctionAmtWages: "",
      sanctionAmtMaterial: "",
      workStartDate: "",
      workCompletionDate: "",
      remarks: "",
      asUpload: null,
      schemaType: "",
      userId: userId,
    });
    setErrors({});
    setBackendErrors({});
    setDistrictResolved(false);
    console.log("🔄 Form has been reset");
  };

  // Helper function to get combined error for a field
  const getFieldError = (fieldName: string) => {
    return backendErrors[fieldName] || errors[fieldName];
  };

  const formProps: FormProps = {
    formData,
    setFormData,
    errors,
    setErrors,
    backendErrors,
    setBackendErrors,
    districts,
    blocks,
    panchayats,
    workCategories,
    subCategories,
    loading,
    districtResolved,
    setDistrictResolved,
    totalAmount,
    today,
    getFieldError,
    subCategoriesLoading,
    handleChange,
    handleNumberChange,
    handleFileChange
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* District Error Alert */}
        {errors.district && (
          <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800">District Assignment Required</h3>
                <p className="text-amber-700 text-sm mt-1">{errors.district}</p>
              </div>
            </div>
          </div>
        )}

        <ErrorDisplay error={error} />
        <SuccessMessage success={success} />
        <LoadingState loading={loading} />

        <form onSubmit={(e) => e.preventDefault()}>
          <UserSchemaSection {...formProps} />
          <LocationSection {...formProps} />
          <WorkDetailsSection {...formProps} />
          <MeasurementsSection {...formProps} />
          <TimelineDocumentsSection {...formProps} />y
          <ActionButtons
            onReview={handleReview}
            submitting={submitting}
            districtResolved={districtResolved}
          />
        </form>

        {/* Add the ReviewModal */}
        <ReviewModal
          show={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleSubmitFromModal}
          formData={formData}
          formProps={formProps}
          submitting={submitting}
          getUserName={getUserName}
        />
      </div>
    </div>
  );
}