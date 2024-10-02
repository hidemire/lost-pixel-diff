import { type FC } from "react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { Story } from "~/entities/story";

export interface StoryHoverCardProps {
  story: Story;
  children: React.ReactNode;
}

const StoryHoverCard: FC<StoryHoverCardProps> = ({ story, children }) => {
  return (
    <HoverCard>
      <HoverCardTrigger>{children}</HoverCardTrigger>
      <HoverCardContent className="w-96">
        <img className="object-contain h-48 w-96" src={story.src} />
      </HoverCardContent>
    </HoverCard>
  );
};

export default StoryHoverCard;
