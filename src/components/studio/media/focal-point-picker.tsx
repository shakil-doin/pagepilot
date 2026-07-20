"use client";

type Props = {
  url: string;
  alt: string;
  focalX: number | null;
  focalY: number | null;
  onChange: (focalX: number, focalY: number) => void;
};

// Click anywhere on the image to set the crop focal point (0-1 on both axes).
const FocalPointPicker = ({ url, alt, focalX, focalY, onChange }: Props) => {
  const x = focalX ?? 0.5;
  const y = focalY ?? 0.5;

  return (
    <div
      className="relative cursor-crosshair overflow-hidden rounded-lg border border-hairline"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const nextX = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        const nextY = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
        // Round to 3 decimals so the stored values stay tidy.
        onChange(Math.round(nextX * 1000) / 1000, Math.round(nextY * 1000) / 1000);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={alt} className="block w-full select-none" draggable={false} />
      <span
        aria-hidden
        className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
        style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
      >
        <span className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
      </span>
    </div>
  );
};

export default FocalPointPicker;
