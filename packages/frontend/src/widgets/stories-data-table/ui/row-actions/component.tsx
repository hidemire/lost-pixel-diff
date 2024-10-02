import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Story, StoryKind, usePromoteStory } from "~/entities/story";

interface RowActionsProps {
  row: Row<Story>;
}

const RowActions: FC<RowActionsProps> = ({ row }) => {
  const navigate = useNavigate();
  const promote = usePromoteStory();

  const story = row.original;
  const canPromote = story.kind !== StoryKind.Baseline;

  const diff = () => {
    console.log("redirect");
    navigate(`/diff/${story.id}`);
  };

  const handlePromote = () => {
    promote.mutate([story.id]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={diff}>Diff</DropdownMenuItem>
        <DropdownMenuItem disabled={!canPromote} onClick={handlePromote}>
          Promote
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RowActions;
