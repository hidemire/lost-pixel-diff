import { FC } from "react";
import { Navigate, NavLink, useParams } from "react-router-dom";

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
    </div>
  );
};

export default DiffPage;
