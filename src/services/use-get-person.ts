import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Person } from "./people";
import { getPeopleList } from "./people";

export const useGetPerson = (id: string) => {
	const queryClient = useQueryClient();
	const peopleSync = queryClient.getQueryData<Array<Person>>(["people"]);

	const {
		data: peopleAsync,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["people"],
		queryFn: async () => {
			return await getPeopleList();
		},
		enabled: !peopleSync,
	});

	const people = peopleSync || peopleAsync;

	const person = people?.find((p) => p.id === id);
	return { person, isLoading, isError, error };
};
