import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { PeopleList } from "./list";
import { PersonDetail } from "./detail";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import {
	PersistQueryClientProvider,
	persistQueryClientRestore,
} from "@tanstack/react-query-persist-client";
import { getDefaultMutations } from "../default-mutations";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "../store/store";
import { Provider } from "react-redux";
import { DiffHandler } from "./diff-handler";
import { useMemo } from "react";

const persister = createSyncStoragePersister({
	storage: window.localStorage,
});

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: 1000 * 60 * 60 * 24, // 24 hours
			staleTime: 2000,
			retry: 0,
		},
	},
});

void persistQueryClientRestore({
	queryClient,
	persister,
	maxAge: 1000 * 60 * 60 * 24,
});

getDefaultMutations(queryClient);

type InitialLoadedMetaStatus = "UNFINISHED" | "FINISHED" | "ERRORED";

const setStoredInitialLoadedMeta = (val: InitialLoadedMetaStatus) => {
	localStorage.setItem("initial_loaded_meta", val);
}

const AppBase = () => {
	const [initialLoadedMeta, setReactiveInitialLoadedMeta] = useState((): InitialLoadedMetaStatus => {
		const rawMeta = localStorage.getItem("initial_loaded_meta");
		if (!rawMeta) return "UNFINISHED";
		return rawMeta as InitialLoadedMetaStatus;
	})

	const {data, error, refetch} = useQuery({
		queryKey: ['FULL_DATABASE'],
		queryFn: ({signal}) => {
			console.log("QUERYING DATA")
			setTimeout(() => {
				if (signal.aborted) return;
				return [
					"SOME DATA"
				]
			}, 1000)
		},
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

	return (
		<>
			<Routes>
				<Route path="/" element={<PeopleList />} />
				<Route path="/detail/:id" element={<PersonDetail />} />
			</Routes>
			<DiffHandler />
		</>
	);
};

export const App = () => {
	return (
		<Provider store={store}>
			<PersistGate persistor={persistor}>
				<PersistQueryClientProvider
					client={queryClient}
					persistOptions={{ persister }}
					onSuccess={() => {
						// resume mutations after initial restore from localStorage was successful
						void queryClient.resumePausedMutations().then(() => {
							return queryClient.invalidateQueries();
						});
					}}
				>
					<BrowserRouter>
						<AppBase />
					</BrowserRouter>
				</PersistQueryClientProvider>
			</PersistGate>
		</Provider>
	);
};
