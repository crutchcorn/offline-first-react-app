import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Person } from "./people";

export const useUpdatePerson = (id: string) => {
	const queryClient = useQueryClient();
	const updatePerson = useMutation({
		mutationKey: ["people", id],
		onMutate: async (person: Person) => {
			await queryClient.cancelQueries({ queryKey: ["people", id] });
			const previousData =
				queryClient.getQueryData<Array<Person>>(["people"]) || [];

			const personIndex = previousData.findIndex((p) => p.id === id);

			previousData[personIndex] = person;

			queryClient.setQueryData(["people"], previousData);

			return { previousData };
		},
		onError: (_, __, context) => {
			queryClient.setQueryData(["people"], context?.previousData || []);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["people"] });
		},
	});

	return { updatePerson };
};
