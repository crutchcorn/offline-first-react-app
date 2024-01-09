import {useQuery, useQueryClient} from "@tanstack/react-query";
import { customerKeys } from "../constants/query-keys";
import {getPeopleIdList} from "./people";
import type {PersonDetailsInfo} from "../types/api";
import {getPerson} from "./person";
import { chunkForEach } from "../utils/chunk-for-each";

export const useListPerson = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: customerKeys.lists(),
    queryFn: async ({signal}) => {
      const serverCustomerList = await getPeopleIdList({signal});
      const list = [] as PersonDetailsInfo[];
      // TODO: Delete old customers that are on local cache but not part of remote server call
      // TODO: Use batched forEach
      for (const customer of serverCustomerList) {
        const cachedCustomer = queryClient.getQueryData<PersonDetailsInfo>(customerKeys.detail(customer.id))
        if (cachedCustomer && cachedCustomer.lastUpdated >= customer.lastUpdated) {
          // Our cached results are more or equally up-to-date as the servers'
          list.push(cachedCustomer)
          continue;
        }
        const serverData = await getPerson({id: customer.id, signal})
        queryClient.setQueryData(customerKeys.detail(customer.id), serverData)
        list.push(serverData)
      }
      return list;
    }
  })
};
