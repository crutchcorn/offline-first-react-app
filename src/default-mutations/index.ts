import type { QueryClient } from "@tanstack/react-query";
import { type Person, updatePerson } from "../services/people";
import { getPerson } from "../services/person";
import { addItemToDiff } from "../store/diff-slice";
import { store } from "../store/store";

export function getDefaultMutations(queryClient: QueryClient) {
	queryClient.setMutationDefaults(["people"], {
		mutationFn: async (person: Person) => {
			await queryClient.cancelQueries({ queryKey: ["people", person.id] });
			const serverPersonData = await getPerson(person.id);
			if (serverPersonData.lastUpdated > person.lastUpdated) {
				// Show diff UI, persist this information in case it's needed next time
				store.dispatch({ type: addItemToDiff.type, payload: person });
				return Promise.resolve();
			}
			return updatePerson(person);
		},
	});
}
