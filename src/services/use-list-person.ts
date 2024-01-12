import { useQuery, useQueryClient } from "@tanstack/react-query";
import { customerKeys } from "../constants/query-keys";
import { getPeopleIdList } from "./people";
import type { PersonDetailsInfo } from "../types/api";

export const useListPerson = () => {
	const queryClient = useQueryClient();

	return useQuery({
		queryKey: customerKeys.lists(),
		queryFn: async ({ signal }) => {
			const serverCustomerList = await getPeopleIdList({ signal });
			// TODO: Delete old customers that are on local cache but not part of remote server call
			// TODO: Chunk to give UI breathing room
			return await Promise.all(
				serverCustomerList.map(async (customer) => {
					const cachedCustomer = queryClient.getQueryData<PersonDetailsInfo>(
						customerKeys.detail(customer.id),
					);
					// TODO: Remove this line
					return cachedCustomer!;
					// TODO: Fix everything below
					// if (cachedCustomer && (new Date(cachedCustomer.lastUpdated) >= new Date(customer.lastUpdated))) {
					//   // Our cached results are more or equally up-to-date as the servers'
					//   return cachedCustomer
					// }
					// const serverData = await getPerson({id: customer.id, signal})
					// queryClient.setQueryData(customerKeys.detail(customer.id), serverData)
					// return serverData
				}),
			);
		},
	});
};
