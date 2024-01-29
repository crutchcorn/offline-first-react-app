import type {PersonDetailsInfo, PersonListInfo} from "../types/api";
import type {QueryClient} from "@tanstack/react-query";

interface KeyWithMeta<TMeta, TContext> {
  key: readonly unknown[];
  meta?: TMeta;
  context?: TContext;
}

type KeyWithMetaFn<TMeta, TContext> = (...props: never[]) => KeyWithMeta<TMeta, TContext>

type KeyRecord = Record<string, KeyWithMetaFn<unknown, unknown>>;

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
    meta: undefined as never as PersonDetailsInfo,
    context: undefined as never as { status: "conflict" | "success", serverPersonData: PersonDetailsInfo }
  }),
  detail: (id: string | number) => ({
    key: [...customerKeys.details().key, id] as const,
    meta: undefined as never as PersonDetailsInfo
  }),
};

expectKeyRecord(customerKeys);

/**
 * Using `ReturnType<T>[K] doesn't work because it doesn't handle the case where K is not a key of ReturnType<T>.
 * When that happens, it will return `any` instead of `never`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RecordReturnType<T extends (...args: any[]) => any, P extends keyof ReturnType<T>> = P extends keyof ReturnType<T> ? ReturnType<T>[P] : never;

export type GetKeyMeta<T extends KeyWithMetaFn<unknown, unknown>> =
  RecordReturnType<T, "meta">;

export type GetKeyContext<T extends KeyWithMetaFn<unknown, unknown>> =
  RecordReturnType<T, "context">;

export type CustomerContexts = {
  [K in keyof typeof customerKeys]: GetKeyContext<typeof customerKeys[K]>;
}[keyof typeof customerKeys];

export const setQueryData = <T extends KeyWithMeta<unknown, unknown>>(
  queryClient: QueryClient,
  keyWithMeta: T,
  data: T['meta']
) => {
  queryClient.setQueryData(keyWithMeta.key, data);
}

export const getQueryData = <T extends KeyWithMeta<unknown, unknown>>(
  queryClient: QueryClient,
  keyWithMeta: T
): T['meta'] => {
  return queryClient.getQueryData(keyWithMeta.key)
}
