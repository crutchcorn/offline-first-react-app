import { useQuery, useQueryClient } from "@tanstack/react-query";
import { customerKeys } from "../constants/query-keys";
import type { PersonListInfo } from "../types/api";

const LAST_UPDATED_KEY = "last-updated";

export const useListPerson = () => {
	const queryClient = useQueryClient();

	return useQuery({
		queryKey: customerKeys.lists(),
		queryFn: () => {
			const prevCachedData =
				queryClient.getQueryData<PersonListInfo[]>(customerKeys.lists()) ||
				([] as PersonListInfo[]);

			const lastUpdatedStr = localStorage.getItem(LAST_UPDATED_KEY);
			const lastUpdated = lastUpdatedStr ? new Date(lastUpdatedStr) : null;
			/**
			 * TODO:
			 *  - Fetch data from API without a "last updated" date to get all data
			 *  - On subsequent fetches, pass "last updated" date to API to get only new data
			 *  - On success, merge new data with existing data, store it back in the cache
			 *  - On success, update localStorage with new "last updated" date
			 *  - On error, return existing data, and don't update localStorage
			 */
			return prevCachedData;
		},
	});
};
