import axiosInstance from "@/apiInterceptor/axiosInterceptor";

export const getProgrames = async () =>{
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

    const { data } = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/programActivities/programe`);
  return data;

};


export const addProgrames = async (payload: any) =>{
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

  const { data } = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/programActivities/addPrograme`, payload);
  return data;

};

export const updatePrograme = async (payload: any) =>{
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

    const { data } = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/programActivities/updatePrograme`, payload);
  return data;

};


export const getActivities = async () =>{
    // const token =JSON.parse(`${sessionStorage.getitem("OAuthCredentials")}`);

    // const response = await axiosInstance({
    //     method:"GET",
    //     url:`${process.env.NEXT_PUBLIC_API_URL}/programActivities/activities`,
    //     headers:{
    //         "Content-Type" :"application/json",
    //         Authorization:`Bearer ${token.authToken}`
    //     },
            // data: payload,
    // });
    // return response.data?.data 

    const { data } = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/programActivities/activities`);
  return data;

};

export const getProgramComponet = async () =>{
    // const token =JSON.parse(`${sessionStorage.getitem("OAuthCredentials")}`);

    // const response = await axiosInstance({
    //     method:"GET",
    //     url:`${process.env.NEXT_PUBLIC_API_URL}/programActivities/activities`,
    //     headers:{
    //         "Content-Type" :"application/json",
    //         Authorization:`Bearer ${token.authToken}`
    //     },
            // data: payload,
    // });
    // return response.data?.data 

    const { data } = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/programActivities/components`);
  return data;

};

export const getProgrameTopics = async (componentId: any) =>{
    // const token =JSON.parse(`${sessionStorage.getitem("OAuthCredentials")}`);

    // const response = await axiosInstance({
    //     method:"GET",
    //     url:`${process.env.NEXT_PUBLIC_API_URL}/programActivities/activities`,
    //     headers:{
    //         "Content-Type" :"application/json",
    //         Authorization:`Bearer ${token.authToken}`
    //     },
            // data: payload,
    // });
    // return response.data?.data 

    const { data } = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/programActivities/programeTopics/${componentId}`);
  return data;

};


//delet program id

export const deletePrograme = async (payload: any) => {
    
    const response = await axiosInstance({
        method:"post",
        url:`${process.env.NEXT_PUBLIC_API_URL}/programActivities/deletedPrograme`,
    
            data: payload,
    });
    return response.data?.data 

}