import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

type InitialLoadedMetaStatus = "UNFINISHED" | "FINISHED" | "ERRORED";

const setStoredInitialLoadedMeta = (val: InitialLoadedMetaStatus) => {
	localStorage.setItem("initial_loaded_meta", val);
}

export const useInitialDownload = () => {
	const [initialLoadedMeta, setReactiveInitialLoadedMeta] = useState((): InitialLoadedMetaStatus => {
		const rawMeta = localStorage.getItem("initial_loaded_meta");
		if (!rawMeta) return "UNFINISHED";
		return rawMeta as InitialLoadedMetaStatus;
	})

	const {data, error, refetch} = useQuery({
		queryKey: ['FULL_DATABASE'],
		queryFn: ({signal}) => {
			console.log("QUERYING DATA")
			return new Promise((resolve) => setTimeout(() => {
				if (signal.aborted) return;
				return resolve([
					"SOME DATA"
				])
			}, 1000))
		},
		retry: 0,
		enabled: initialLoadedMeta === "UNFINISHED"
	})

	useEffect(() => {
		if (!data) return;
		setStoredInitialLoadedMeta("FINISHED")
	}, [data])

	useEffect(() => {
		if (!error) return;
		setStoredInitialLoadedMeta("ERRORED")
	}, [error])

	const Component = useCallback(() => {
		if (initialLoadedMeta === "UNFINISHED") {
			return <p>Downloading data...</p>
		}

		if (initialLoadedMeta === "ERRORED") {
			const retry = () => {
				setStoredInitialLoadedMeta("UNFINISHED")
				setReactiveInitialLoadedMeta("UNFINISHED")
				void refetch();
			}
			return <div>
				<p>There was an error downloading your data, do you want to try again?</p>
				<button onClick={retry}>Retry</button>
			</div>
		}

		return null;
	}, []);

	return {
		Component
	};
}
