import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PeopleList } from "./list";
import { PersonDetail } from "./detail";

const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PeopleList />} />
          <Route path="/detail/:id" element={<PersonDetail />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
