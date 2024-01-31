import type { PersonDetailsInfo, PersonListInfo } from "../types/api";
import type { QueryClient } from "@tanstack/react-query";
import { stringify } from "superjson";
import { stabilizeMutationKeys } from "../utils/key-handling";

interface KeyWithMeta<TData, TContext> {
	// The unique key for a query and/or mutation
	key: readonly unknown[];
	// The return type of a query's `queryFn` function
	data?: TData;
	transformDataToKey?: (data: TData) => undefined | readonly unknown[];
	// A unique enum for each type of data type
	type: "person" | "";
	// The return type of a mutation's `onMutation` function (TanStack Query context)
	context?: TContext;
}

type KeyWithMetaFn<TData, TContext> = (
	...props: never[]
) => KeyWithMeta<TData, TContext>;

type KeyRecord = Record<string, KeyWithMetaFn<unknown, unknown>>;

// We can't use `satisfies` here because it doesn't play well with circular constant usage
function expectKeyRecord<T extends KeyRecord>(props: T): T {
	return props;
}

interface GetInsufficientTranformDataToKeyErrorStrProps {
	dataType: string;
	data: unknown;
	keyRecordName: string;
	keyFnName: string;
}

function getInsufficientTranformDataToKeyErrorStr({
	dataType,
	data,
	keyRecordName,
	keyFnName,
}: GetInsufficientTranformDataToKeyErrorStrProps) {
	return `We don't have enough information to transform ${stringify(data)} (${dataType}) as an id string for ${keyRecordName}.${keyFnName}().transformDataToKey`;
}

// DO NOT CLEAR THIS CACHE OTHERWISE IT WILL CAUSE AN INFINITE LOOP ON THE INITIAL DOWNLOAD SCREEN
export const initialDownloadKeys = {
	all: () => ({
		key: ["initialDownload"] as const,
		data: undefined as never as void,
		transformDataToKey: () => {
			return initialDownloadKeys.all().key;
		},
		type: "" as const,
	}),
	status: (status: string) => ({
		key: [...initialDownloadKeys.all().key, status] as const,
		data: undefined as never as boolean,
		transformDataToKey: (_data: unknown) => {
			const err = getInsufficientTranformDataToKeyErrorStr({
				dataType: "boolean",
				keyFnName: "status",
				keyRecordName: "initialDownloadKeys",
				data: _data,
			});
			console.warn(err);
			return undefined;
		},
		type: "" as const,
	}),
};

expectKeyRecord(initialDownloadKeys);

export const customerKeys = {
	all: () => ({
		key: ["customers"] as const,
		data: undefined as never as void,
		transformDataToKey: () => {
			return customerKeys.all().key;
		},
		type: "person" as const,
	}),
	lists: () => ({
		key: [...customerKeys.all().key, "list"] as const,
		data: undefined as never as PersonListInfo[],
		transformDataToKey: () => {
			return customerKeys.lists().key;
		},
		type: "person" as const,
	}),
	details: () => ({
		key: [...customerKeys.all().key, "detail"] as const,
		data: undefined as never as PersonDetailsInfo,
		transformDataToKey: (_data: unknown) => {
			const data = _data as GetKeyData<typeof customerKeys.details>;
			return customerKeys.detail(data.id).key;
		},
		context: undefined as never as {
			status: "conflict" | "success";
			serverPersonData: PersonDetailsInfo;
		},
		type: "person" as const,
	}),
	detail: (id: string | number) => ({
		key: [...customerKeys.details().key, id] as const,
		data: undefined as never as PersonDetailsInfo,
		transformDataToKey: (_data: unknown) => {
			const data = _data as GetKeyData<typeof customerKeys.detail>;
			return customerKeys.detail(data.id).key;
		},
		type: "person" as const,
	}),
};

expectKeyRecord(customerKeys);

/**
 * Using `ReturnType<T>[K] doesn't work because it doesn't handle the case where K is not a key of ReturnType<T>.
 * When that happens, it will return `any` instead of `never`.
 */
type RecordReturnType<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	T extends (...args: any[]) => any,
	P extends keyof ReturnType<T>,
> = P extends keyof ReturnType<T> ? ReturnType<T>[P] : never;

export type GetKeyData<T extends KeyWithMetaFn<unknown, unknown>> =
	RecordReturnType<T, "data">;

export type GetKeyContext<T extends KeyWithMetaFn<unknown, unknown>> =
	RecordReturnType<T, "context">;

type GetKeyRecordContext<T extends KeyRecord> = Omit<
	{
		[K in keyof T]: GetKeyContext<T[K]>;
	}[keyof T],
	never
>;

export type KeyRecordContexts =
	| GetKeyRecordContext<typeof initialDownloadKeys>
	| GetKeyRecordContext<typeof customerKeys>;

export function getKeyRecordFromKey(
	inputKeyMeta: readonly unknown[],
	inputData: unknown,
) {
	const stableInputKey = stabilizeMutationKeys(inputKeyMeta);

	const keyMaps = [initialDownloadKeys, customerKeys];

	for (const keyMap of keyMaps) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for (const [__key, _dataFn] of Object.entries(keyMap)) {
			const dataFn = _dataFn as KeyWithMetaFn<unknown, unknown>;
			/**
			 * We're utilizing the lazy execution of object properties to run the `dataFn` without actually passing it valid props
			 * This will need to be refactored if the KeyWithMetaFn ever throws an error on invalid data input.
			 */
			const keyWithMeta = dataFn();
			const unstablePotentialMatchedKey =
				keyWithMeta.transformDataToKey?.(inputData);
			if (!unstablePotentialMatchedKey) {
				continue;
			}
			const stablePotentialMatchedKey = stabilizeMutationKeys(
				unstablePotentialMatchedKey,
			);
			if (stablePotentialMatchedKey === stableInputKey) return keyWithMeta;
		}
	}
	return undefined;
}

export const setQueryData = <T extends KeyWithMeta<unknown, unknown>>(
	queryClient: QueryClient,
	keyWithMeta: T,
	data: T["data"],
) => {
	queryClient.setQueryData(keyWithMeta.key, data);
};

export const getQueryData = <T extends KeyWithMeta<unknown, unknown>>(
	queryClient: QueryClient,
	keyWithMeta: T,
): T["data"] => {
	return queryClient.getQueryData(keyWithMeta.key);
};
