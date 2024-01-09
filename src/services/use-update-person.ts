import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customerKeys } from "../constants/query-keys";
import type { PersonDetailsInfo, PersonListInfo } from "../types/api";
import { convertPersonDetailsToPersonList } from "../utils/list";

export const useUpdatePerson = (id: string) => {
	const queryClient = useQueryClient();
	const updatePerson = useMutation({
		mutationKey: customerKeys.detail(id),
		onMutate: async (person: PersonDetailsInfo) => {
			await queryClient.cancelQueries({ queryKey: customerKeys.detail(id) });

			const listData =
				queryClient.getQueryData<Array<PersonListInfo>>(customerKeys.lists()) ||
				[];

			const personListIndex = listData.findIndex((p) => p.id === id);

			listData[personListIndex] = convertPersonDetailsToPersonList(person);

			queryClient.setQueryData(customerKeys.lists(), listData);
			queryClient.setQueryData(customerKeys.detail(id), person);

			return { listData };
		},
		onError: (_, __, context) => {
			queryClient.setQueryData(customerKeys.lists(), context?.listData || []);
		},
		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
		},
	});

	return { updatePerson };
};
