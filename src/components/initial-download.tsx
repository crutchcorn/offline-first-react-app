import {
	type Dispatch,
	forwardRef,
	memo,
	type SetStateAction,
	useCallback,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import {
	useQuery,
	useQueryClient,
	type UseQueryResult,
} from "@tanstack/react-query";
import { getPeopleDatabaseList } from "../services/people";
import {customerKeys, type GetKeyData, initialDownloadKeys, setQueryData} from "../constants/query-keys";
import { convertPersonDetailsToPersonList } from "../utils/list";
import { chunkForEach } from "../utils/chunk-for-each";
import type { PersonListInfo } from "../types/api";
import { storeLastUpdated } from "../hooks/use-list-person.ts";

type InitialLoadedMetaStatus =
	| "UNFINISHED"
	| "IN_PROGRESS"
	| "FINISHED"
	| "ERRORED";

const INITIAL_LOADED_META_KEY = "initial_loaded_meta";

const setStoredInitialLoadedMeta = (val: InitialLoadedMetaStatus) => {
	localStorage.setItem(INITIAL_LOADED_META_KEY, val);
};

type Refetch = UseQueryResult<boolean, unknown>["refetch"];

interface DownloadInitialDataProps {
	initialLoadedMeta: InitialLoadedMetaStatus;
	setReactiveInitialLoadedMeta: (val: InitialLoadedMetaStatus) => void;
	setChunkMeta: Dispatch<SetStateAction<{ current: number; total: number }>>;
}

const DownloadInitialDataBase = forwardRef<Refetch, DownloadInitialDataProps>(
	({ initialLoadedMeta, setChunkMeta, setReactiveInitialLoadedMeta }, ref) => {
		const queryClient = useQueryClient();

		const { isSuccess, isError, refetch } = useQuery({
			queryKey: initialDownloadKeys.status(initialLoadedMeta).key,
			queryFn: async ({ signal }): Promise<GetKeyData<typeof initialDownloadKeys.status>> => {
				// Set the stored value so that we can warn if the user closes the app before the download is finished.
				setStoredInitialLoadedMeta("IN_PROGRESS");
				// Clear the query cache so that we can know that the app doesn't have any stale data
				queryClient.removeQueries({ queryKey: customerKeys.all().key });
				// Get the full database to store in the cache
				const database = await getPeopleDatabaseList({ signal });
				const CHUNK_SIZE = 100;
				const totalChunks = Math.ceil(database.length / CHUNK_SIZE);
				setChunkMeta({
					current: 0,
					total: totalChunks,
				});

				const pickedData: PersonListInfo[] = [];
				// For each customer detail, take and chunk (so it doesn't block the main thread on 15,000 requests)
				// Then, store the details in the query cache so we can load it offline
				await chunkForEach({
					arr: database,
					eachChunkFn() {
						setChunkMeta((prev) => ({
							...prev,
							current: prev.current + 1,
						}));
					},
					eachItemfn(customer) {
						setQueryData(queryClient, customerKeys.detail(customer.id),
							customer,
						);
						const pickedCustomer = convertPersonDetailsToPersonList(customer);
						pickedData.push(pickedCustomer as never);
					},
					delayTime: () => 100,
					signal,
					chunkSize: CHUNK_SIZE,
				});
				if (signal.aborted) return false;
				setQueryData(queryClient, customerKeys.lists(), pickedData);
				return true;
			},
			retry: 0,
			enabled: initialLoadedMeta === "UNFINISHED",
		});

		// Do not try to merge this with the useImperativeHandle below, it will cause an infinite loop
		// We don't need the refetch to be reactive anyway
		useLayoutEffect(() => {
			if (isSuccess) {
				setReactiveInitialLoadedMeta("FINISHED");
				storeLastUpdated();
				setStoredInitialLoadedMeta("FINISHED");
			} else if (isError) {
				setReactiveInitialLoadedMeta("ERRORED");
				setStoredInitialLoadedMeta("ERRORED");
			}
		}, [isSuccess, isError]);

		useImperativeHandle(ref, () => refetch, [refetch]);

		return null;
	},
);

// Use `memo` to avoid re-renders (and therefore refetching)
const DownloadInitialData = memo(DownloadInitialDataBase);

DownloadInitialData.displayName = "DownloadInitialData";

export const useInitialDownload = () => {
	const [initialLoadedMeta, setReactiveInitialLoadedMeta] = useState(
		(): InitialLoadedMetaStatus => {
			const rawMeta = localStorage.getItem(INITIAL_LOADED_META_KEY);
			if (!rawMeta) return "UNFINISHED";
			return rawMeta as InitialLoadedMetaStatus;
		},
	);

	// Which chunk of the download are we on?
	const [chunkMeta, setChunkMeta] = useState({
		current: 0,
		total: 0,
	});

	const refetchRef = useRef<Refetch>(null);

	const DownloadComponent = useCallback(() => {
		// The passed properties **MUST** be referentially stable, except for initialLoadedMeta
		// otherwise, it will attempt to re-query every time one of these properties changes
		return (
			<DownloadInitialData
				setChunkMeta={setChunkMeta}
				initialLoadedMeta={initialLoadedMeta}
				setReactiveInitialLoadedMeta={setReactiveInitialLoadedMeta}
				ref={refetchRef}
			/>
		);
	}, [initialLoadedMeta]);

	const DisplayComponent = useCallback(() => {
		if (initialLoadedMeta === "UNFINISHED") {
			return (
				<div>
					<p>Downloading data...</p>
					<p>
						{chunkMeta.current} of {chunkMeta.total} chunks downloaded
					</p>
				</div>
			);
		}

		const retry = useCallback(() => {
			setStoredInitialLoadedMeta("UNFINISHED");
			setReactiveInitialLoadedMeta("UNFINISHED");
			void refetchRef.current?.();
		}, []);

		if (initialLoadedMeta === "IN_PROGRESS") {
			return (
				<div>
					<p>
						You closed the app prior to the download finishing. Please keep the
						app open and try again
					</p>
					<button onClick={retry}>Retry</button>
				</div>
			);
		}

		if (initialLoadedMeta === "ERRORED") {
			return (
				<div>
					<p>
						There was an error downloading your data, do you want to try again?
					</p>
					<button onClick={retry}>Retry</button>
				</div>
			);
		}

		return null;
	}, [initialLoadedMeta, chunkMeta]);

	return {
		// This should only be displayed when there is a return value
		DisplayComponent,
		// This should always be displayed, no matter what
		DownloadComponent,
	};
};
