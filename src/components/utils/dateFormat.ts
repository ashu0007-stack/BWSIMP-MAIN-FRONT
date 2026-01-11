export const formatDateConsistently = (date: Date | string): string => {
  const d = new Date(date);
  // Use ISO-like format that's consistent across server and client
  return d.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(',', '');
};

// Or simpler version:
export const safeDateFormat = (date: Date | string): string => {
  return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
};