import type { QueryClient } from "@tanstack/react-query";
import { Person, updatePerson } from "../services/people";

export function getDefaultMutations(queryClient: QueryClient) {
	queryClient.setMutationDefaults(["people"], {
		mutationFn: async (person: Person) => {
			await queryClient.cancelQueries({ queryKey: ["people", person.id] });
			return updatePerson(person);
		},
	});
}
