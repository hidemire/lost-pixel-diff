import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { fetcher } from "~/shared/api/fetcher";

import { Story, StoryKind } from "./types";
import { useGeneratorOutput } from "./store";

const refetchInterval = 2000;

const getStorySrc = (kind: StoryKind, id: string) => {
  return `${fetcher.getUri()}/stories/${id}/${kind}`;
};

export const useStories = () => {
  const {
    data: currentStories,
    isPending: currentStoriesIsPending,
    isError: currentStoriesIsError,
  } = useQuery({
    queryKey: ["stories", "current"],
    queryFn: async () => {
      const stories = await fetcher.get<string[]>("/api/stories/current");
      return stories.data.map((story) => ({
        id: story,
        kind: StoryKind.Current,
        src: getStorySrc(StoryKind.Current, story),
      })) as Story[];
    },
    refetchInterval,
  });

  const {
    data: baselineStories,
    isPending: baselineStoriesIsPending,
    isError: baselineStoriesIsError,
  } = useQuery({
    queryKey: ["stories", "baseline"],
    queryFn: async () => {
      const stories = await fetcher.get<string[]>("/api/stories/baseline");
      return stories.data.map((story) => ({
        id: story,
        kind: StoryKind.Baseline,
        src: getStorySrc(StoryKind.Baseline, story),
      })) as Story[];
    },
    refetchInterval,
  });

  const {
    data: diffStories,
    isPending: diffStoriesIsPending,
    isError: diffStoriesIsError,
  } = useQuery({
    queryKey: ["stories", "diff"],
    queryFn: async () => {
      const stories = await fetcher.get<string[]>("/api/stories/diff");
      return stories.data.map((story) => ({
        id: story,
        kind: StoryKind.Diff,
        src: getStorySrc(StoryKind.Diff, story),
      })) as Story[];
    },
    refetchInterval,
  });

  return {
    current: currentStories,
    baseline: baselineStories,
    diff: diffStories,
    isPending:
      currentStoriesIsPending ||
      baselineStoriesIsPending ||
      diffStoriesIsPending,
    isError:
      currentStoriesIsError || baselineStoriesIsError || diffStoriesIsError,
  };
};

const getStoryImage = async (kind: StoryKind, id: string) => {
  const { data } = await fetcher.get(`/stories/${id}/${kind}`, {
    responseType: "blob",
  });
  return data;
};

export const useStoryFile = (kind: StoryKind, id: string) => {
  const result = useQuery<Blob>({
    queryKey: ["story-file", kind, id],
    queryFn: async () => getStoryImage(kind, id),
    retry: false,
  });

  return result;
};

export const useStoriesGenerate = () => {
  const append = useGeneratorOutput((state) => state.append);
  const clear = useGeneratorOutput((state) => state.clear);

  return useMutation({
    mutationKey: ["generate-stories"],
    mutationFn: async () => {
      clear();
      const outputStream = await fetch(`${fetcher.getUri()}/api/generate`, {
        method: "post",
      });

      if (outputStream.body) {
        const reader = outputStream.body.getReader();
        const decoder = new TextDecoder("utf-8");

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          append(decoder.decode(value));
        }
      }
    },
  });
};

export const usePromoteStory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["promote-story"],
    mutationFn: async (ids: string[]) => {
      try {
        await Promise.all(
          ids.map((id) => fetcher.post("/api/promote", { story_id: id }))
        );
        queryClient.invalidateQueries({ queryKey: ["stories"] });
        toast.success("Story promoted successfully");
      } catch (e) {
        toast.error("Failed to promote story");
        throw e;
      }
    },
  });
};
