import type {QueryClient} from "@tanstack/react-query";
import {customerKeys, type GetKeyContext, type GetKeyData} from "./query-keys.ts";
import type {PersonDetailsInfo} from "../types/api";
import {getPerson} from "../services/person.ts";
import {updatePerson} from "../services/people.ts";
import {clearPreviousMutations} from "../utils/clear-previous-mutations.ts";
import {stabilizeMutationKeys} from "../utils/key-handling.ts";

// Any mutation that might be paused needs to live here, as there is no way to "resume"
// a mutation or query that isn't a default
export function getDefaultMutations(queryClient: QueryClient) {
  // Temporary: @see https://github.com/TanStack/query/discussions/6790
  const mutationMap = new Map<string, unknown>();
  queryClient.setMutationDefaults(customerKeys.details().key, {
    mutationFn: async (person: PersonDetailsInfo): Promise<GetKeyData<typeof customerKeys.details>> => {
      await queryClient.cancelQueries({
        queryKey: customerKeys.detail(person.id).key,
      });
      const {status} = mutationMap.get(stabilizeMutationKeys(customerKeys.detail(person.id).key)) as GetKeyContext<typeof customerKeys.details> | undefined ?? {};

      if (status === "conflict") {
        throw new Error("Person has been updated on the server since you last fetched it");
      }

      return updatePerson({person});
    },
    // Fires before mutation fn, passed values will be preserved in third argument of onSuccess/onError (context)
    onMutate: async (person: PersonDetailsInfo) => {
      clearPreviousMutations({queryClient, mutationKey: customerKeys.detail(person.id).key})
      const serverPersonData = await getPerson({id: person.id});
      const status = serverPersonData.lastUpdated > person.lastUpdated ? "conflict" : "success";
      const data = {serverPersonData, status};
      mutationMap.set(stabilizeMutationKeys(customerKeys.detail(person.id).key), data);
      return data;
    },
  });
}
