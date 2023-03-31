import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { PeopleList } from "./list";
import { PersonDetail } from "./detail";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import {
	PersistQueryClientProvider,
	persistQueryClientRestore,
} from "@tanstack/react-query-persist-client";

const persister = createSyncStoragePersister({
	storage: window.localStorage,
});

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			cacheTime: 1000 * 60 * 60 * 24, // 24 hours
			staleTime: 2000,
			retry: 0,
		},
	},
});

persistQueryClientRestore({
	queryClient,
	persister,
	maxAge: 1000 * 60 * 60 * 24,
});

export const App = () => {
	return (
		<PersistQueryClientProvider
			client={queryClient}
			persistOptions={{ persister }}
			onSuccess={() => {
				// resume mutations after initial restore from localStorage was successful
				queryClient.resumePausedMutations().then(() => {
					queryClient.invalidateQueries();
				});
			}}
		>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<PeopleList />} />
					<Route path="/detail/:id" element={<PersonDetail />} />
				</Routes>
			</BrowserRouter>
		</PersistQueryClientProvider>
	);
};
