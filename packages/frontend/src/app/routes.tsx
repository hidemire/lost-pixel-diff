import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import { MainPage } from "~/pages/main";
import { DiffPage } from "~/pages/diff";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route index element={<MainPage />} />
      <Route path="/diff/:storyId" element={<DiffPage />} />
    </>
  )
);
