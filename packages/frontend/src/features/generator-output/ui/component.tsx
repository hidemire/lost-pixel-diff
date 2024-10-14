import { useEffect, useRef, useState, type FC } from "react";

import { useGeneratorOutput } from "~/entities/story";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export interface GeneratorOutputProps {
  children?: React.ReactNode;
}

const GeneratorOutput: FC<GeneratorOutputProps> = ({ children }) => {
  const output = useGeneratorOutput((state) => state.output);
  const outputRef = useRef<HTMLPreElement>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (outputRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = outputRef.current;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
        const autoScroll = event.deltaY > 0 && isAtBottom;
        setAutoScroll(autoScroll);
      }
    };

    const currentScrollArea = outputRef.current;

    if (currentScrollArea) {
      currentScrollArea.addEventListener("wheel", handleWheel);
    }

    return () => {
      if (currentScrollArea) {
        currentScrollArea.removeEventListener("wheel", handleWheel);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outputRef.current]);

  const scrollToBottom = (force = false) => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
      if (force) {
        setAutoScroll(true);
      }
    }
  };

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [output, autoScroll]);

  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="min-w-[80vw]">
        <DialogHeader>
          <DialogTitle>Generator Output</DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4 ">
          <pre
            ref={outputRef}
            className="text-sm text-muted-foreground whitespace-pre-wrap h-[80vh] overflow-y-auto"
          >
            {output}
          </pre>
          <Button
            className={cn(
              "absolute bottom-4 right-4 transition-opacity",
              autoScroll && "opacity-0"
            )}
            onClick={() => scrollToBottom(true)}
          >
            Scroll to bottom
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GeneratorOutput;
