import { useEffect, useMemo, useRef, useState, type FC } from "react";

export interface ImageSliderProps {
  leftImage: Blob;
  rightImage: Blob;
}

const ImageSlider: FC<ImageSliderProps> = ({ leftImage, rightImage }) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(1);

  const leftImageSrc = useMemo(
    () => URL.createObjectURL(leftImage),
    [leftImage]
  );
  const rightImageSrc = useMemo(
    () => URL.createObjectURL(rightImage),
    [rightImage]
  );

  const getAspectRatio = (imageSrc: string): Promise<number> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        resolve(img.width / img.height);
      };
    });
  };

  useEffect(() => {
    const loadAspectRatios = async () => {
      const leftImageRatio = await getAspectRatio(leftImageSrc);
      const rightImageRatio = await getAspectRatio(rightImageSrc);
      setAspectRatio(Math.min(leftImageRatio, rightImageRatio));
    };
    loadAspectRatios();
  }, [leftImageSrc, rightImageSrc]);

  const handleSliderMove = (clientX: number) => {
    if (containerRef.current) {
      const { left, width } = containerRef.current.getBoundingClientRect();
      const newPosition = ((clientX - left) / width) * 100;
      setSliderPosition(Math.min(Math.max(newPosition, 0), 100));
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handleSliderMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    handleSliderMove(e.touches[0].clientX);
  };

  return (
    <div
      className="relative w-[80%] overflow-hidden mx-auto"
      style={{
        height: `calc(80vw / ${aspectRatio})`,
      }}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      <div className="absolute inset-0">
        <img
          src={leftImageSrc}
          alt="Before"
          className="w-full h-full object-contain"
        />
      </div>

      <div
        className="absolute inset-0"
        style={{
          clipPath: `inset(0 0 0 ${sliderPosition}%)`, // Crop image by adjusting left inset
        }}
      >
        <img
          src={rightImageSrc}
          alt="After"
          className="w-full h-full object-contain"
        />
      </div>

      <div
        className="absolute inset-y-0 w-1 bg-gray-200 shadow-lg cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
      />
    </div>
  );
};
export default ImageSlider;
