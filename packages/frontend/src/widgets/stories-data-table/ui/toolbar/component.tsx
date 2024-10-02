import { Table } from "@tanstack/react-table";
import { Cross2Icon, RocketIcon } from "@radix-ui/react-icons";

import { Button } from "~/components/ui/button";
import { DataTableFacetedFilter } from "~/components/ui/data-table-faceted-filter";
import { Input } from "~/components/ui/input";
import {
  Story,
  StoryKind,
  usePromoteStory,
  useStoriesGenerate,
} from "~/entities/story";
import { cn } from "~/lib/utils";

const kindLabel = [
  {
    value: StoryKind.Diff,
    label: "Diff",
  },
  {
    value: StoryKind.Current,
    label: "Current",
  },
  {
    value: StoryKind.Baseline,
    label: "Baseline",
  },
];

interface ToolbarProps {
  table: Table<Story>;
  className?: string;
}

const Toolbar = ({ className, table }: ToolbarProps) => {
  const generateMutation = useStoriesGenerate();
  const promote = usePromoteStory();

  const isFiltered = table.getState().columnFilters.length > 0;
  const isSelected = Object.keys(table.getState().rowSelection).length > 0;

  const handleStoriesGenerate = () => {
    generateMutation.mutate();
  };

  const handlePromoteSelected = () => {
    const { rows } = table.getSelectedRowModel();

    const storiesToPromote = rows
      .filter((row) => row.original.kind !== StoryKind.Baseline)
      .map((row) => row.original.id);

    promote.mutate(storiesToPromote);

    table.resetRowSelection();
  };

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter stories..."
          value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("id")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("kind") && (
          <DataTableFacetedFilter
            column={table.getColumn("kind")}
            title="Kind"
            options={kindLabel}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <Button
        disabled={!isSelected || promote.isPending}
        onClick={handlePromoteSelected}
        className="h-8 mr-3"
      >
        Promote selected
      </Button>
      <Button
        variant="outline"
        onClick={handleStoriesGenerate}
        disabled={generateMutation.isPending}
      >
        <RocketIcon className="h-4 w-4 mr-2" />
        Generate
      </Button>
    </div>
  );
};

export default Toolbar;
