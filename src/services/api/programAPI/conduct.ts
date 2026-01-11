import axiosInstance from "@/apiInterceptor/axiosInterceptor";

export const getConduct = async () =>{
    // const token =JSON.parse(`${sessionStorage.getitem("OAuthCredentials")}`);

    // const response = await axiosInstance({
    //     method:"GET",
    //     url:`${process.env.NEXT_PUBLIC_API_URL}/master/programe`,
    //     headers:{
    //         "Content-Type" :"application/json",
    //         Authorization:`Bearer ${token.authToken}`
    //     },
    // });
    // return response.data?.data 

    const { data } = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/programActivities/programConduct`);
  return data;

};


export const addConduct = async (payload: any) =>{
    // const token =JSON.parse(`${sessionStorage.getitem("OAuthCredentials")}`);

    // const response = await axiosInstance({
    //     method:"GET",
    //     url:`${process.env.NEXT_PUBLIC_API_URL}/programActivities/programe`,
    //     headers:{
    //         "Content-Type" :"application/json",
    //         Authorization:`Bearer ${token.authToken}`
    //     },
            // data: payload,
    // });
    // return response.data?.data 

    const { data } = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/programActivities/addProgramConduct`, payload);
  return data;

};

