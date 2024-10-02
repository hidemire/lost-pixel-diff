import { type FC } from "react";

import { StoriesDataTableWidget } from "~/widgets/stories-data-table";

const MainPage: FC = () => {
  return (
    <div className="flex min-h-screen flex-col container mx-auto p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">LostPixel Diff</h2>
      <StoriesDataTableWidget />
    </div>
  );
};

export default MainPage;
