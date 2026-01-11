import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/apiInterceptor/axiosInterceptor';

interface HistoryRecord {
  id: number;
  contract_id: string;
  action_type: 'CREATE' | 'UPDATE';
  changed_by?: string;
  changed_by_email: string;
  changed_by_role?: string;
  change_timestamp: string;
  old_data: any;
  new_data: any;
  changed_fields: string[];
  revision_number: number;
  formatted_date?: string;
  display_date?: string;
  description?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const useContractHistory = (contractId: string | number | null) => {
  return useQuery<HistoryRecord[]>({
    queryKey: ['contract-history', contractId],
    queryFn: async () => {
      if (!contractId) return [];

      try {
        console.log('📡 Fetching contract history for ID:', contractId);
        
        const response = await axiosInstance.get(`${API_URL}/contractHistory/${contractId}/history`);
        
        console.log('📊 API Response:', response.data);
        
        let historyData: any[] = [];
        
        // Handle different response structures
        if (Array.isArray(response.data)) {
          historyData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          historyData = response.data.data;
        } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
          historyData = response.data.data;
        } else if (response.data && response.data.history) {
          historyData = response.data.history;
        } else {
          console.warn('⚠️ Unexpected response structure:', response.data);
          return [];
        }
        
        if (!historyData || historyData.length === 0) {
          console.log('📭 No history data found');
          return [];
        }

        console.log('📋 Raw History Data (count):', historyData.length);
        console.log('📋 Raw History Data:', historyData);

        // Format data
        const formattedData = historyData.map((record: any, index: number) => {
          console.log(`📝 Processing record ${index + 1}:`, record);
          
          // Parse date - your data has format: "2025-12-18 09:53:40"
          const timestamp = record.change_timestamp || record.created_at || '';
          let date = new Date();
          let formattedDate = 'No date';
          let displayDate = 'No date';
          
          if (timestamp) {
            // Fix timestamp format for MySQL datetime: "2025-12-18 09:53:40"
            const mysqlTimestamp = timestamp.replace(' ', 'T') + 'Z';
            date = new Date(mysqlTimestamp);
            
            if (!isNaN(date.getTime())) {
              formattedDate = date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
              
              displayDate = date.toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              });
            }
          }
          
          // Extract user info
          let userName = 'Unknown User';
          if (record.changed_by) {
            userName = record.changed_by;
          } else if (record.changed_by_email) {
            // Extract name from email
            userName = record.changed_by_email.split('@')[0]
              .replace(/[._]/g, ' ')
              .replace(/\b\w/g, (l: string) => l.toUpperCase());
          }
          
          // ✅ FIX: Handle changed_fields which is a JSON object, not array
          let changedFieldsArray: string[] = [];
          if (record.changed_fields) {
            try {
              // Check if changed_fields is already an object or needs parsing
              let changedFieldsObj = record.changed_fields;
              if (typeof changedFieldsObj === 'string') {
                changedFieldsObj = JSON.parse(changedFieldsObj);
              }
              
              // Extract field names from the object
              if (changedFieldsObj && typeof changedFieldsObj === 'object') {
                changedFieldsArray = Object.keys(changedFieldsObj);
              }
            } catch (e) {
              console.warn('Failed to parse changed_fields:', record.changed_fields, e);
            }
          }
          
          // Check if we have formatted_date and display_date from API (from your data)
          if (record.formatted_date) {
            formattedDate = record.formatted_date;
          }
          if (record.display_date) {
            displayDate = record.display_date;
          }
          
          const formattedRecord = {
            id: record.id || index + 1,
            contract_id: record.contract_id || String(contractId),
            action_type: (record.action_type || 'UPDATE') as 'CREATE' | 'UPDATE',
            changed_by: userName,
            changed_by_email: record.changed_by_email || '',
            changed_by_role: record.changed_by_role || '',
            change_timestamp: timestamp || new Date().toISOString(),
            old_data: record.old_data || {},
            new_data: record.new_data || {},
            changed_fields: changedFieldsArray,
            revision_number: record.revision_number || parseInt(record.id) || index + 1,
            formatted_date: formattedDate,
            display_date: displayDate || record.display_date || '',
            description: getActionDescription(record, userName, changedFieldsArray)
          };
          
          console.log(`✨ Formatted record ${index + 1}:`, formattedRecord);
          return formattedRecord;
        });

        console.log('🎉 Final formatted data (count):', formattedData.length);
        console.log('🎉 Final formatted data:', formattedData);
        return formattedData;
      } catch (error: any) {
        console.error('❌ Error fetching contract history:', error);
        throw new Error(error.response?.data?.error || error.message || 'Failed to fetch history');
      }
    },
    enabled: !!contractId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// Helper function
const getActionDescription = (record: any, userName: string, changedFields: string[]): string => {
  const actionType = record.action_type || 'UPDATE';
  const baseDescription = actionType === 'CREATE' ? 'Contract created' : 'Contract updated';
  
  if (changedFields && changedFields.length > 0) {
    const readableFields = changedFields.map(field => 
      field.replace(/_/g, ' ')
           .replace(/\b\w/g, (l: string) => l.toUpperCase())
    );
    
    const fields = readableFields.slice(0, 3).join(', ');
    const more = readableFields.length > 3 ? ` and ${readableFields.length - 3} more` : '';
    
    return `${baseDescription} by ${userName} - Changed: ${fields}${more}`;
  }
  
  return `${baseDescription} by ${userName}`;
};