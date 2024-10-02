import { useEffect, useMemo, useState, type FC } from "react";

export interface ImageFadeProps {
  leftImage: Blob;
  rightImage: Blob;
}

const ImageFade: FC<ImageFadeProps> = ({ leftImage, rightImage }) => {
  const [sliderValue, setSliderValue] = useState<number>(50);
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
      const beforeImageRatio = await getAspectRatio(leftImageSrc);
      const afterImageRatio = await getAspectRatio(rightImageSrc);
      setAspectRatio(Math.min(beforeImageRatio, afterImageRatio));
    };
    loadAspectRatios();
  }, [leftImageSrc, rightImageSrc]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(Number(e.target.value));
  };

  return (
    <div
      className="relative w-[90%] mx-auto"
      style={{
        height: `calc(80vw / ${aspectRatio})`,
      }}
    >
      <div className="absolute inset-0">
        <img
          src={leftImageSrc}
          alt="Left Image"
          className="w-full h-full object-contain"
          style={{ opacity: 1 - sliderValue / 100 }}
        />
      </div>

      <div className="absolute inset-0">
        <img
          src={rightImageSrc}
          alt="Right Image"
          className="w-full h-full object-contain"
          style={{ opacity: sliderValue / 100 }}
        />
      </div>

      <div className="relative z-10 mt-4 flex justify-center">
        <input
          type="range"
          min={0}
          max={100}
          value={sliderValue}
          onChange={handleSliderChange}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ImageFade;
