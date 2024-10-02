import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import { MainPage } from "~/pages/main";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route index element={<MainPage />} />
    </>
  )
);
