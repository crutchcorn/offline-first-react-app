import {BrowserRouter, Route, Routes} from "react-router-dom";
import {QueryClient} from "@tanstack/react-query";
import {PeopleList} from "./list";
import {PersonDetail} from "./detail";
import {createSyncStoragePersister} from "@tanstack/query-sync-storage-persister";
import {
  PersistQueryClientProvider,
  persistQueryClientRestore,
} from "@tanstack/react-query-persist-client";
import {useInitialDownload} from "../components/initial-download.tsx";
import {RouteProtection} from "../components/route-protection.tsx";
import {Layout} from "../components/layout.tsx";
import {Sync} from "./sync.tsx";
import {sanitizeMutationCache} from "../utils/sanitize-mutation-cache.ts";
import {getDefaultMutations} from "../constants/default-mutations.ts";

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
    mutations: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    }
  },
});

void persistQueryClientRestore({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24,
});

getDefaultMutations(queryClient);

const AppBase = () => {
  const {DisplayComponent, DownloadComponent} = useInitialDownload();

  return (
    <>
      <DownloadComponent/>
      <RouteProtection conditionalComponent={DisplayComponent}>
        <Routes>
          <Route path="/" element={<Layout/>}>
            <Route path="/" index element={<PeopleList/>}/>
            <Route path="/detail/:id" element={<PersonDetail/>}/>
            <Route path="/sync" element={<Sync/>}/>
          </Route>
        </Routes>
      </RouteProtection>
    </>
  );
};

export const App = () => {
  return (
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister,
						dehydrateOptions: {
              // This is what allows us to see successful mutations in the sync page
              // Just keep in mind that once a mutation's gcTime has passed, it will be removed from localStorage
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              shouldDehydrateMutation: _mutation => {
                return true;
              }
            }
          }}
          onSuccess={() => {
            sanitizeMutationCache({queryClient});
            // resume mutations after initial restore from localStorage was successful
            void queryClient.resumePausedMutations().then(() => {
              return queryClient.invalidateQueries();
            });
          }}
        >
          <BrowserRouter>
            <AppBase/>
          </BrowserRouter>
        </PersistQueryClientProvider>
  );
};
