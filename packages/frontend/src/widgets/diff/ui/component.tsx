import { type FC } from "react";

import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { StoryKind, usePromoteStory, useStoryFile } from "~/entities/story";
import { ImageFade } from "~/features/image-fade";
import { ImageSlider } from "~/features/image-slider";

export interface DiffWidgetProps {
  storyId: string;
}

const DiffWidget: FC<DiffWidgetProps> = ({ storyId }) => {
  const { data: baselineImage } = useStoryFile(StoryKind.Baseline, storyId);
  const { data: diffImage } = useStoryFile(StoryKind.Diff, storyId);
  const { data: currentImage } = useStoryFile(StoryKind.Current, storyId);

  const promote = usePromoteStory();

  const handlePromote = () => {
    if (currentImage) {
      promote.mutate([storyId]);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold mb-3">{storyId}</h2>
        {currentImage && (
          <Button className="mr-2" onClick={handlePromote}>
            Promote
          </Button>
        )}
      </div>

      <Tabs defaultValue="difference">
        <TabsList className="mb-3">
          <TabsTrigger value="difference">Difference</TabsTrigger>
          <TabsTrigger value="side-by-side">Side by side</TabsTrigger>
          <TabsTrigger value="fade">Fade</TabsTrigger>
          <TabsTrigger value="slider">Slider</TabsTrigger>
        </TabsList>
        <TabsContent value="difference">
          {!diffImage && (
            <p className="text-sm text-gray-500">No diff image found.</p>
          )}
          {diffImage && (
            <div className="flex justify-center">
              <img
                src={URL.createObjectURL(diffImage)}
                className="object-contain border-dashed border-2"
                alt="Diff"
              />
            </div>
          )}
        </TabsContent>
        <TabsContent value="side-by-side">
          <div className="flex space-x-2">
            <p className="flex items-center">
              <span className="h-2 w-2 bg-green-500 inline-block mr-1"></span>
              Baseline
            </p>
            <p className="flex items-center">
              <span className="h-2 w-2 bg-yellow-400 inline-block mr-1"></span>
              Current
            </p>
          </div>
          <div className="flex space-x-1">
            <div className="w-1/2">
              {baselineImage && (
                <img
                  src={URL.createObjectURL(baselineImage)}
                  className="object-contain border-dashed border-2 border-green-500"
                  alt="Baseline"
                />
              )}
            </div>
            <div className="w-1/2">
              {currentImage && (
                <img
                  src={URL.createObjectURL(currentImage)}
                  className="object-contain border-dashed border-2 border-yellow-400"
                  alt="Current"
                />
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="fade">
          {!baselineImage && (
            <p className="text-sm text-gray-500">No baseline image found.</p>
          )}
          {!currentImage && (
            <p className="text-sm text-gray-500">No current image found.</p>
          )}
          {baselineImage && currentImage && (
            <ImageFade leftImage={baselineImage} rightImage={currentImage} />
          )}
        </TabsContent>
        <TabsContent value="slider">
          {!baselineImage && (
            <p className="text-sm text-gray-500">No baseline image found.</p>
          )}
          {!currentImage && (
            <p className="text-sm text-gray-500">No current image found.</p>
          )}
          {baselineImage && currentImage && (
            <ImageSlider leftImage={baselineImage} rightImage={currentImage} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DiffWidget;
