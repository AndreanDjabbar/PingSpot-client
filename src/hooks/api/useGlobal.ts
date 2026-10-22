import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { reverseCurrentLocationService } from "@/services/global.service";
import { IReverseLocation } from "@/types/model/global";
import { IReverseLocationRequest } from "@/types/api/global";

export const useReverseCurrentLocation = (options?: {
    onSuccess?: (data: IReverseLocation) => void;
}) => {
    return useMutation<IReverseLocation, AxiosError, IReverseLocationRequest>({
        mutationFn: (data: IReverseLocationRequest) => reverseCurrentLocationService(data),
        ...options,
    });
};
