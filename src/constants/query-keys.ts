import type {PersonDetailsInfo, PersonListInfo} from "../types/api";
import type {QueryClient} from "@tanstack/react-query";

interface KeyWithMeta<T> {
  key: readonly unknown[];
  meta?: T;
}

type KeyWithMetaFn<T> = (...props: never[]) => KeyWithMeta<T>

type KeyRecord = Record<string, KeyWithMetaFn<unknown>>;

// We can't use `satisfies` here because it doesn't play well with circular constant usage
function expectKeyRecord<T extends KeyRecord>(props: T): T {
  return props;
}

// DO NOT CLEAR THIS CACHE OTHERWISE IT WILL CAUSE AN INFINITE LOOP ON THE INITIAL DOWNLOAD SCREEN
export const initialDownloadKeys = {
  all: () => ({
    key: ["initialDownload"] as const,
    meta: undefined as never as void,
  }),
  status: (status: string) => ({
    key: [...initialDownloadKeys.all().key, status] as const,
    meta: undefined as never as boolean,
  }),
};

expectKeyRecord(initialDownloadKeys);

export const customerKeys = {
  all: () => ({
    key: ["customers"] as const,
    meta: undefined as never as void
  }),
  lists: () => ({
    key: [...customerKeys.all().key, "list"] as const,
    meta: undefined as never as PersonListInfo[]
  }),
  details: () => ({
    key: [...customerKeys.all().key, "detail"] as const,
    meta: undefined as never as PersonDetailsInfo
  }),
  detail: (id: string | number) => ({
    key: [...customerKeys.details().key, id] as const,
    meta: undefined as never as PersonDetailsInfo
  }),
};

expectKeyRecord(customerKeys);

export type GetKeyReturn<T extends KeyWithMetaFn<unknown>> =
  ReturnType<T>['meta'];

export const setQueryData = <T extends KeyWithMeta<unknown>>(
  queryClient: QueryClient,
  keyWithMeta: T,
  data: T['meta']
) => {
  queryClient.setQueryData(keyWithMeta.key, data);
}

export const getQueryData = <T extends KeyWithMeta<unknown>>(
  queryClient: QueryClient,
  keyWithMeta: T
): T['meta'] => {
  return queryClient.getQueryData(keyWithMeta.key)
}
