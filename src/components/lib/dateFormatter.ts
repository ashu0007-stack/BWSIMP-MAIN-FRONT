/**
 * Date formatting utility functions
 */

// Format date to DD-MM-YYYY
export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

// Format date to DD/MM/YYYY
export const formatDateSlash = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

// Format date to "DD Month YYYY" (e.g., "15 January 2024")
export const formatDateLong = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

// Format date with time
export const formatDateTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting date time:', error);
    return '-';
  }
};

// Calculate days remaining between two dates
export const calculateDaysRemaining = (
  endDate: string | Date | null | undefined,
  startDate: string | Date = new Date()
): number | null => {
  if (!endDate) return null;
  
  try {
    const end = new Date(endDate);
    const start = new Date(startDate);
    
    if (isNaN(end.getTime()) || isNaN(start.getTime())) {
      return null;
    }
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  } catch (error) {
    console.error('Error calculating days remaining:', error);
    return null;
  }
};

// Check if date is in future
export const isDateInFuture = (dateString: string | Date | null | undefined): boolean => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const today = new Date();
    
    if (isNaN(date.getTime())) {
      return false;
    }
    
    return date > today;
  } catch (error) {
    console.error('Error checking date:', error);
    return false;
  }
};

// Parse date from string (handles multiple formats)
export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  // Try parsing as ISO string
  const date = new Date(dateString);
  
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Try parsing as DD-MM-YYYY
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    
    const parsedDate = new Date(year, month, day);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }
  
  // Try parsing as YYYY-MM-DD
  const parts2 = dateString.split('-');
  if (parts2.length === 3 && parts2[0].length === 4) {
    const year = parseInt(parts2[0], 10);
    const month = parseInt(parts2[1], 10) - 1;
    const day = parseInt(parts2[2], 10);
    
    const parsedDate = new Date(year, month, day);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }
  
  return null;
};