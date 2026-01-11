export const toIndianDate = (dateStr?: string) => {
  if (!dateStr) return "-";

  // Handle both DATE and ISO strings safely
  const [y, m, d] = dateStr.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
};