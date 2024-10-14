import { FC } from "react";
import { Navigate, NavLink, useParams } from "react-router-dom";

import { DiffWidget } from "~/widgets/diff";

const DiffPage: FC = () => {
  const { storyId } = useParams<{ storyId: string }>();

  if (!storyId) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex min-h-screen flex-col container mx-auto p-8 pt-6">
      <NavLink to="/">
        <h2 className="text-3xl font-bold tracking-tight">LostPixel Diff</h2>
      </NavLink>
      <DiffWidget storyId={storyId} />
    </div>
  );
};

export default DiffPage;
