import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	customerKeys,
	type GetKeyData,
	setQueryData,
} from "../constants/query-keys";
import type { PersonListInfo } from "../types/api";
import { getPeopleDatabaseList } from "../services/people";
import { convertPersonDetailsToPersonList } from "../utils/list";

const LAST_UPDATED_KEY = "last-updated";

export const storeLastUpdated = () => {
	localStorage.setItem(LAST_UPDATED_KEY, new Date().toISOString());
};

/**
 *  - Fetch data from API without a "last updated" date to get all data
 *  - On subsequent fetches, pass "last updated" date to API to get only new data
 *  - On success, merge new data with existing data, store it back in the cache
 *  - On success, update localStorage with new "last updated" date
 *  - On error, throw error and don't update localStorage
 */
export const useListPerson = () => {
	const queryClient = useQueryClient();

	return useQuery({
		queryKey: customerKeys.lists().key,
		queryFn: async ({
			signal,
		}): Promise<GetKeyData<typeof customerKeys.lists>> => {
			const prevCachedData =
				queryClient.getQueryData<PersonListInfo[]>(customerKeys.lists().key) ||
				([] as PersonListInfo[]);

			const lastUpdatedStr = localStorage.getItem(LAST_UPDATED_KEY);
			const lastUpdated = lastUpdatedStr ? new Date(lastUpdatedStr) : null;

			const newList = await getPeopleDatabaseList({ lastUpdated, signal });

			for (const person of newList) {
				setQueryData(queryClient, customerKeys.detail(person.id), person);
				const personListItem = convertPersonDetailsToPersonList(person);
				const matchedPersonIdx = prevCachedData.findIndex(
					(p) => p.id === personListItem.id,
				);
				if (matchedPersonIdx === -1) {
					prevCachedData.push(personListItem);
				} else {
					prevCachedData[matchedPersonIdx] = personListItem;
				}
			}

			storeLastUpdated();

			return prevCachedData;
		},
	});
};
