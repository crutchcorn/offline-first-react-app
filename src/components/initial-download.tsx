import {
	type Dispatch,
	memo,
	type SetStateAction,
	useCallback,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import {
	useQuery,
	useQueryClient,
	type UseQueryResult,
} from "@tanstack/react-query";
import { getPeopleDatabaseList } from "../services/people";
import { customerKeys, initialDownloadKeys } from "../constants/query-keys";
import type { StoredCustomerList } from "../types/list";
import { convertPersonDetailsToPersonList } from "../utils/list";
import { chunkForEach } from "../utils/chunk-for-each";

type InitialLoadedMetaStatus =
	| "UNFINISHED"
	| "IN_PROGRESS"
	| "FINISHED"
	| "ERRORED";

const INITIAL_LOADED_META_KEY = "initial_loaded_meta";

const setStoredInitialLoadedMeta = (val: InitialLoadedMetaStatus) => {
	localStorage.setItem(INITIAL_LOADED_META_KEY, val);
};

type QueryMeta = {
	isSuccess: boolean;
	isError: boolean;
	refetch: UseQueryResult<boolean, unknown>["refetch"];
};

interface DownloadInitialDataProps {
	initialLoadedMeta: InitialLoadedMetaStatus;
	setChunkMeta: Dispatch<SetStateAction<{ current: number; total: number }>>;
	setQueryMeta: (val: QueryMeta) => void;
}

const DownloadInitialDataBase = ({
	initialLoadedMeta,
	setChunkMeta,
	setQueryMeta,
}: DownloadInitialDataProps) => {
	const queryClient = useQueryClient();

	const { isSuccess, isError, refetch } = useQuery({
		queryKey: initialDownloadKeys.status(initialLoadedMeta),
		queryFn: async ({ signal }) => {
			// Set the stored value so that we can warn if the user closes the app before the download is finished.
			setStoredInitialLoadedMeta("IN_PROGRESS");
			// Clear the query cache so that we can know that the app doesn't have any stale data
			queryClient.removeQueries({ queryKey: customerKeys.all });
			// Get the full database to store in the cache
			const database = await getPeopleDatabaseList({ signal });
			const CHUNK_SIZE = 100;
			const totalChunks = Math.ceil(database.length / CHUNK_SIZE);
			setChunkMeta({
				current: 0,
				total: totalChunks,
			});

			const pickedData: StoredCustomerList = [];
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
					queryClient.setQueryData(customerKeys.detail(customer.id), customer);
					const pickedCustomer = convertPersonDetailsToPersonList(customer);
					pickedData.push(pickedCustomer as never);
				},
				delayTime: () => 100,
				signal,
				chunkSize: CHUNK_SIZE,
			});
			if (signal.aborted) return false;
			queryClient.setQueryData(customerKeys.lists(), pickedData);
			return true;
		},
		retry: 0,
		enabled: initialLoadedMeta === "UNFINISHED",
	});

	useLayoutEffect(() => {
		setQueryMeta({ isSuccess, isError, refetch });
	}, [isSuccess, isError, refetch]);

	return null;
};

// Use `memo` to avoid re-renders (and therefore refetching)
const DownloadInitialData = memo(DownloadInitialDataBase);

DownloadInitialData.displayName = "DownloadInitialData";

export const useInitialDownload = () => {
	const [_initialLoadedMeta, setReactiveInitialLoadedMeta] = useState(
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

	const [downloadQueryMeta, setDownloadQueryMeta] = useState<QueryMeta | null>(
		null,
	);

	const initialLoadedMeta = useMemo(() => {
		if (downloadQueryMeta?.isSuccess) {
			setStoredInitialLoadedMeta("FINISHED");
			return "FINISHED";
		}
		if (downloadQueryMeta?.isError) {
			setStoredInitialLoadedMeta("ERRORED");
			return "ERRORED";
		}
		return _initialLoadedMeta;
	}, [_initialLoadedMeta, downloadQueryMeta]);

	const DownloadComponent = useCallback(() => {
		// The passed properties **MUST** be referentially stable, except for initialLoadedMeta
		// otherwise, it will attempt to re-query every time one of these properties changes
		return (
			<DownloadInitialData
				setQueryMeta={setDownloadQueryMeta}
				setChunkMeta={setChunkMeta}
				initialLoadedMeta={initialLoadedMeta}
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
			void downloadQueryMeta?.refetch();
		}, [downloadQueryMeta]);

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
