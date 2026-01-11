import axiosInstance from "@/apiInterceptor/axiosInterceptor";

export const grtReportsDocument = async () =>{
    const { data } = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/programActivities/postAssessment`);
  return data;

};

export const grtReportsDocumentById = async (selectTrainingAssessmentId:any) =>{
    const { data } = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/programActivities/postAssessment/${selectTrainingAssessmentId}`);
  return data;

};

export const addReportsDocument = async (payload: FormData) => { 
  const { data } = await axiosInstance.post(
    `${process.env.NEXT_PUBLIC_API_URL}/programActivities/addPostAssessment`,
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};