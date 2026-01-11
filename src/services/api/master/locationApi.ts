// import axiosInstance from "@/apiInterceptor/axiosInterceptor";
// // ✅ Departments
// export const fetchDepartments = async () =>
//   (await axiosInstance.get("/master/departments")).data;

// // ✅ Districts
// export const fetchDistricts = async () =>
//   (await axiosInstance.get("/master/districts")).data;
// // ✅ Blocks
// export const fetchBlocks = async () =>
//   (await axiosInstance.get("/master/blocks")).data;

// export const fetchBlocksByDistrict = async (districtId: number) =>
//   (await axiosInstance.get(`/master/blocks/district/${districtId}`)).data;

// // ✅ Zones
// export const fetchZones = async () =>
//   (await axiosInstance.get("/master/zones")).data;

// // ✅ Circles
// export const fetchCircles = async () =>
//   (await axiosInstance.get("/master/circles")).data;

// export const fetchCirclesByZone = async (zoneId: number) =>
//   (await axiosInstance.get(`/master/circles/${zoneId}`)).data;

// // ✅ Divisions
// export const fetchDivisions = async () =>
//   (await axiosInstance.get("/master/divisions")).data;

// export const fetchDivisionsByCircle = async (circleId: number) =>
//   (await axiosInstance.get(`/master/divisions/${circleId}`)).data;

// export const getGramPanchayatsByBlockId = async (blockId:number) =>
//   (await axiosInstance.get(`/master/grampanchayats/block/${blockId}`)).data;