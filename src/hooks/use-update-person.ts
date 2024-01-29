import {useMutation, useQueryClient} from "@tanstack/react-query";
import {customerKeys, getQueryData, setQueryData} from "../constants/query-keys.ts";
import type {PersonDetailsInfo} from "../types/api";
import {convertPersonDetailsToPersonList} from "../utils/list.ts";
import {clearPreviousMutations} from "../utils/clear-previous-mutations.ts";

export const useUpdatePerson = (id: string) => {
  const queryClient = useQueryClient();
  const updatePerson = useMutation({
    mutationKey: customerKeys.detail(id).key,
    // eslint-disable-next-line @typescript-eslint/require-await
    onMutate: async (person: PersonDetailsInfo) => {
			clearPreviousMutations({queryClient, mutationKey: customerKeys.detail(id).key})

      const listData = getQueryData(queryClient, customerKeys.lists()) ||
        [];

      const personListIndex = listData.findIndex((p) => p.id === id);

      listData[personListIndex] = convertPersonDetailsToPersonList(person);

      setQueryData(queryClient, customerKeys.lists(), listData);
      setQueryData(queryClient, customerKeys.detail(id), person);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({queryKey: customerKeys.lists().key});
    },
  });

  return {updatePerson};
};
