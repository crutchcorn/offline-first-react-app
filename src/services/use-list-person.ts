import { useQuery, useQueryClient } from "@tanstack/react-query";
import { customerKeys } from "../constants/query-keys";
import type { PersonDetailsInfo, PersonListInfo } from "../types/api";

export const useListPerson = () => {
	const queryClient = useQueryClient();

	return useQuery({
		queryKey: customerKeys.lists(),
		queryFn: () => {
			return queryClient.getQueryData<PersonListInfo>(customerKeys.lists()) || [];
		},
	});
};
