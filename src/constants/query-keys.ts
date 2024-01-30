import type {PersonDetailsInfo, PersonListInfo} from "../types/api";
import type {QueryClient} from "@tanstack/react-query";

interface KeyWithMeta<TData, TContext> {
  // The unique key for a query and/or mutation
  key: readonly unknown[];
  // The return type of a query's `queryFn` function
  data?: TData;
  // A unique enum for each type of data type
  type: string;
  // The return type of a mutation's `onMutation` function (TanStack Query context)
  context?: TContext;
}

type KeyWithMetaFn<TData, TContext> = (...props: never[]) => KeyWithMeta<TData, TContext>

type KeyRecord = Record<string, KeyWithMetaFn<unknown, unknown>>;

// We can't use `satisfies` here because it doesn't play well with circular constant usage
function expectKeyRecord<T extends KeyRecord>(props: T): T {
  return props;
}

// DO NOT CLEAR THIS CACHE OTHERWISE IT WILL CAUSE AN INFINITE LOOP ON THE INITIAL DOWNLOAD SCREEN
export const initialDownloadKeys = {
  all: () => ({
    key: ["initialDownload"] as const,
    data: undefined as never as void,
    type: ""
  }),
  status: (status: string) => ({
    key: [...initialDownloadKeys.all().key, status] as const,
    data: undefined as never as boolean,
    type: ""
  }),
};

expectKeyRecord(initialDownloadKeys);

export const customerKeys = {
  all: () => ({
    key: ["customers"] as const,
    data: undefined as never as void,
    type: "person"
  }),
  lists: () => ({
    key: [...customerKeys.all().key, "list"] as const,
    data: undefined as never as PersonListInfo[],
    type: "person"
  }),
  details: () => ({
    key: [...customerKeys.all().key, "detail"] as const,
    data: undefined as never as PersonDetailsInfo,
    context: undefined as never as { status: "conflict" | "success", serverPersonData: PersonDetailsInfo },
    type: "person"
  }),
  detail: (id: string | number) => ({
    key: [...customerKeys.details().key, id] as const,
    data: undefined as never as PersonDetailsInfo,
    type: "person"
  }),
};

expectKeyRecord(customerKeys);

/**
 * Using `ReturnType<T>[K] doesn't work because it doesn't handle the case where K is not a key of ReturnType<T>.
 * When that happens, it will return `any` instead of `never`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RecordReturnType<T extends (...args: any[]) => any, P extends keyof ReturnType<T>> = P extends keyof ReturnType<T> ? ReturnType<T>[P] : never;

export type GetKeyData<T extends KeyWithMetaFn<unknown, unknown>> =
  RecordReturnType<T, "data">;

export type GetKeyContext<T extends KeyWithMetaFn<unknown, unknown>> =
  RecordReturnType<T, "context">;

export type CustomerContexts = {
  [K in keyof typeof customerKeys]: GetKeyContext<typeof customerKeys[K]>;
}[keyof typeof customerKeys];

export const setQueryData = <T extends KeyWithMeta<unknown, unknown>>(
  queryClient: QueryClient,
  keyWithMeta: T,
  data: T['data']
) => {
  queryClient.setQueryData(keyWithMeta.key, data);
}

export const getQueryData = <T extends KeyWithMeta<unknown, unknown>>(
  queryClient: QueryClient,
  keyWithMeta: T
): T['data'] => {
  return queryClient.getQueryData(keyWithMeta.key)
}
