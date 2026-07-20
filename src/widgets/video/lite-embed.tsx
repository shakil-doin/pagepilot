"use client";

import { useState } from "react";

type Props = {
  embedSrc: string;
  thumbnailUrl?: string;
  title?: string;
};

// Click-to-load facade: the heavy third-party iframe only loads on demand,
// so embeds never hurt LCP.
const LiteEmbed = ({ embedSrc, thumbnailUrl, title }: Props) => {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <iframe
        src={`${embedSrc}${embedSrc.includes("?") ? "&" : "?"}autoplay=1`}
        title={title ?? "Video"}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className="group absolute inset-0 h-full w-full cursor-pointer"
      aria-label={`Play video${title ? `: ${title}` : ""}`}
      style={{
        backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#000",
      }}
    >
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 transition-transform group-hover:scale-110">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );
};

export default LiteEmbed;
