import { addProgrames, deletePrograme, getActivities, getProgramComponet, getProgrames, getProgrameTopics, updatePrograme, } from "@/services/api/programAPI/programe"
import { useMutation, useQuery, useQueryClient, UseMutationResult } from "@tanstack/react-query"


export const usePrograme = () => {

    const { data, isLoading, isError, error } = useQuery(
        {
            queryKey: ["getPrograme"],
            queryFn: getProgrames,
            retry: false,
            // refetchOnMount: false,
            refetchOnWindowFocus: false
        });


    return { data, isLoading, isError, error };
};

export const useAddPrograme = () => {
    const QueryClint = useQueryClient();


    const { mutate, isPending, isError, error } = useMutation({
        mutationKey: ["addProgram"],
        mutationFn: addProgrames,
        onSuccess: () => {
            QueryClint.invalidateQueries({ queryKey: ["programe"] })
        }
    })

    return { mutate, isPending, isError, error };
};


export const useDeletePrograme = () => {
    const queryClient = useQueryClient();

    const { mutate, isPending, isError, error } = useMutation({
        mutationKey: ["deleteProgram"],
        mutationFn: deletePrograme,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deleteProgram"] })
        }
    })

    return { mutate, error, isPending, isError }
};


export const useUpdatePrograme = () => {
    const queryClient = useQueryClient();

    const { mutate, isPending, isError, error } = useMutation({
        mutationKey: ["updateProgram"],
        mutationFn: updatePrograme,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["updateProgram"] })
        }
    })

    return { mutate, error, isPending, isError }
};



export const useActivities = () => {

    const { data, isLoading, isError, error } = useQuery(
        {
            queryKey: ["activities"],
            queryFn: getActivities,
            retry: false,
            refetchOnMount: false,
            refetchOnWindowFocus: false
        });


    return { data, isLoading, isError, error };
};

export const useProgramComponet = () => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["componetes"], // unique for each activity
        queryFn: getProgramComponet,
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    return { data, isLoading, isError, error };
};



export const useProgrameTopics = (componentId: any) => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["topics", componentId], // unique for each activity
        queryFn: () => getProgrameTopics(componentId),
        enabled: !!componentId, // only run when activityId is provided
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    return { data, isLoading, isError, error };
};