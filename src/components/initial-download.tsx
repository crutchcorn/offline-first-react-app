import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPeopleDatabaseList } from "../services/people";
import { customerKeys } from "../constants/query-keys";
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

let i = 0;

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

	const queryClient = useQueryClient();

	const { data, error, refetch } = useQuery({
		queryKey: customerKeys.all,
		queryFn: async ({ signal }) => {
			// Set the stored value so that we can warn if the user closes the app before the download is finished.
			setStoredInitialLoadedMeta("IN_PROGRESS");
			// Clear the query cache so that we can know that the app doesn't have any stale data
			queryClient.clear();
			// Get the full database to store in the cache
			const database = await getPeopleDatabaseList({ signal });
			const CHUNK_SIZE = 100;
			const totalChunks = Math.ceil(database.length / CHUNK_SIZE);
			// // TODO: Add back via a component wrapping `useQuery` and `memo` to avoid re-renders (and refetching using query)
			// setChunkMeta({
			// 	current: 0,
			// 	total: totalChunks,
			// });

			const pickedData: StoredCustomerList = [];
			// For each customer detail, take and chunk (so it doesn't block the main thread on 15,000 requests)
			// Then, store the details in the query cache so we can load it offline
			await chunkForEach({
				arr: database,
				eachChunkFn() {
					console.log("CHUNK", ++i, "done")
					// // TODO: Add back
					// setChunkMeta((prev) => ({
					// 	...prev,
					// 	current: prev.current + 1,
					// }));
				},
				eachItemfn(customer) {
					queryClient.setQueryData(customerKeys.detail(customer.id), customer);
					const pickedCustomer = convertPersonDetailsToPersonList(customer);
					pickedData.push(pickedCustomer as never);
				},
				delayTime: i => i * 100,
				signal,
				chunkSize: CHUNK_SIZE,
			});
			queryClient.setQueryData(customerKeys.lists(), pickedData);
			return true
		},
		retry: 0,
		enabled: initialLoadedMeta === "UNFINISHED",
	});

	useEffect(() => {
		if (!data) return;
		setStoredInitialLoadedMeta("FINISHED");
		setReactiveInitialLoadedMeta("FINISHED");
	}, [data]);

	useEffect(() => {
		if (!error) return;
		setStoredInitialLoadedMeta("ERRORED");
		setReactiveInitialLoadedMeta("ERRORED");
	}, [error]);

	const Component = useCallback(() => {
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

		const retry = () => {
			setStoredInitialLoadedMeta("UNFINISHED");
			setReactiveInitialLoadedMeta("UNFINISHED");
			void refetch();
		};

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
	}, [initialLoadedMeta]);

	return {
		Component,
	};
};
