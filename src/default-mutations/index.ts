import type { QueryClient } from "@tanstack/react-query";
import { customerKeys } from "../constants/query-keys";
import type { PersonDetailsInfo } from "../types/api";
import { getPerson } from "../services/person";
import { updatePerson } from "../services/people";
import { store } from "../store/store";
import { addItemToDiff } from "../store/diff-slice";

// Any mutation that might be paused needs to live here, as there is no way to "resume"
// a mutation or query that isn't a default
export function getDefaultMutations(queryClient: QueryClient) {
	queryClient.setMutationDefaults(customerKeys.details(), {
		mutationFn: async (person: PersonDetailsInfo) => {
			await queryClient.cancelQueries({
				queryKey: customerKeys.detail(person.id),
			});
			const serverPersonData = await getPerson({ id: person.id });
			if (serverPersonData.lastUpdated > person.lastUpdated) {
				// Show diff UI, persist this information in case it's needed next time
				store.dispatch({ type: addItemToDiff.type, payload: person });
				return Promise.resolve();
			}
			return updatePerson({ person });
		},
	});
}
