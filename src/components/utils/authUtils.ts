export const getUserFromSession = () => {
  try {
    const data = sessionStorage.getItem("userdetail");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};
