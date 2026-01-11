/* mport { addProgrames, getActivities, getProgramComponet, getProgrames, getProgrameTopics, } from "@/pages/api/programAPI/programe" */
import { addConduct, getConduct } from "@/services/api/programAPI/conduct";
import { getProgrames } from "@/services/api/programAPI/programe";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"


export const useConduct = () =>{

    const {data, isLoading, isError, error} = useQuery(
        {
            queryKey: ["getProgrameConduct"],
            queryFn: getConduct,
            retry: false,
            // refetchOnMount: false,
            refetchOnWindowFocus: false
        });


    return {data, isLoading, isError, error};
};




export const useAddConduct = () =>{
    const QueryClint = useQueryClient();


    const {mutate, isPending, isError, error} = useMutation({
        mutationKey: ["addProgramConduct"],
        mutationFn: addConduct,
        onSuccess: () => {
            QueryClint.invalidateQueries({queryKey: ["addProgramConduct"]})
        }
    })

    return {mutate,isPending,isError,error};
};