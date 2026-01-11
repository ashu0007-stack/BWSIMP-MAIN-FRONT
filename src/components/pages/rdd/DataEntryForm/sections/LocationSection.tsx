import { MapPin } from "lucide-react";
import { FormProps } from "../../types";
import DistrictDisplay from "../DistrictDisplay";

export default function LocationSection({ 
  formData, 
  setFormData, 
  districts, 
  blocks, 
  panchayats, 
  loading, 
  districtResolved, 
  getFieldError 
}: FormProps) {

  // Get filtered blocks for the selected district
  const filteredBlocks = formData.district && formData.district !== 0 && blocks && blocks.length > 0
    ? blocks.filter(block => {
        // Check both possible property names
        const blockDistrictId = (block as any).districtId || (block as any).district_id;
        
        console.log("🔍 Block filtering check:", {
          blockId: block.block_id,
          blockName: block.block_name,
          blockDistrictId,
          selectedDistrict: formData.district,
          matches: blockDistrictId === formData.district
        });
        
        return blockDistrictId === formData.district;
      })
    : [];

  console.log("📊 Filtered blocks result:", {
    selectedDistrict: formData.district,
    allBlocksCount: blocks?.length || 0,
    filteredBlocksCount: filteredBlocks.length,
    filteredBlocks: filteredBlocks
  });

    const filteredPanchayats = formData.block && formData.block !== "" && panchayats && panchayats.length > 0
  ? panchayats.filter(panchayat => {
      console.log("🔍 Panchayat Filter Check:", {
        panchayatName: panchayat.panchayat_name, // Use panchayat_name
        blockId: panchayat.block_id,
        selectedBlock: formData.block,
        match: panchayat.block_id === Number(formData.block)
      });
      return panchayat.block_id === Number(formData.block);
    })
  : [];

console.log("✅ Filtered Panchayats:", {
  count: filteredPanchayats.length,
  items: filteredPanchayats.map(p => ({
    id: p.gp_id,
    name: p.panchayat_name,
    block: p.block_id
  }))
});


  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    console.log(`📍 ${name} changed to:`, value);
    
    setFormData(prev => {
      const newState = { ...prev };
      
      if (name === "district") {
        newState.district = value ? parseInt(value) : 0;
        newState.block = "";
        newState.panchayat = "";
        console.log("🗺️ District changed to ID:", newState.district);
      } else if (name === "block") {
        newState.block = value;
        newState.panchayat = "";
        console.log("📍 Block changed to:", value);
      } else if (name === "panchayat") {
        newState.panchayat = value;
      }
      
      return newState;
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-slate-800">Location Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* District Display */}
        <DistrictDisplay 
          districts={districts}
          loading={loading}
          districtResolved={districtResolved}
          formData={formData}
        />
        
        {/* Block Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Block Name <span className="text-red-500">*</span>
          </label>
          <select
            name="block"
            value={formData.block}
            onChange={handleDropdownChange}
            disabled={!formData.district || formData.district === 0 || loading}
            className={`w-full border ${
              getFieldError('block') ? 'border-red-500' : 'border-slate-300'
            } rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white disabled:bg-slate-100 disabled:cursor-not-allowed`}
            required
          >
            <option value="">Select Block</option>
            {filteredBlocks.map((block) => (
              <option key={`block-${block.block_id}`} value={block.block_id}>
                {block.block_name}
              </option>
            ))}
          </select>
          {getFieldError('block') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('block')}</p>
          )}
        </div>

        {/* Gram Panchayat Selection */}
           <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Gram Panchayat <span className="text-red-500">*</span></label>
            <select
              name="panchayat"
              value={formData.panchayat}
              onChange={handleDropdownChange}
              disabled={!formData.block || formData.block === "" || loading}
              className={`w-full border ${
                getFieldError('panchayat') ? 'border-red-500' : 'border-slate-300'
              } rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white disabled:bg-slate-100 disabled:cursor-not-allowed`}
              required
            >
              <option value="">Select Gram Panchayat</option>
              {panchayats?.map((panchayat, index) => {
                const blockId = 
                  panchayat.block_id || 
                  (panchayat as any).blockId || 
                  'N/A';
                
                return (
                  <option 
                    key={`debug-${index}`} 
                    value={panchayat.gp_id}
                    style={{ 
                      color: blockId === formData.block ? 'green' : 'black',
                      fontWeight: blockId === formData.block ? 'bold' : 'normal'
                    }}
                  >
                    {panchayat.panchayat_name}
                  </option>
                );
              })}
            </select>
      </div>
      </div>
    </div>
  );
}