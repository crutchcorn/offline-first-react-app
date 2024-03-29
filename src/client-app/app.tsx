import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
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

persistQueryClientRestore({
	queryClient,
	persister,
	maxAge: 1000 * 60 * 60 * 24,
});

getDefaultMutations(queryClient);

export const App = () => {
	return (
		<Provider store={store}>
			<PersistGate persistor={persistor}>
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
					<DiffHandler />
				</PersistQueryClientProvider>
			</PersistGate>
		</Provider>
	);
};
