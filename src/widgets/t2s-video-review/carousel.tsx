"use client";

import { useState } from "react";
import Carousel from "@/components/site/t2s/carousel";
import SiteImage from "@/components/site/site-image";
import type { Props } from "./schema";

type Video = Props["videos"][number];

// The iframe is only mounted after a click, so a row of testimonials costs one
// image each on first paint instead of N video players.
const VideoCard = ({ video, dark }: { video: Video; dark: boolean }) => {
  const [playing, setPlaying] = useState(false);

  return (
    <figure className="flex h-full flex-col">
      <div
        className="relative aspect-[9/14] w-full overflow-hidden rounded-[var(--pp-radius-lg)]"
        style={{ background: dark ? "rgb(255 255 255 / 0.08)" : "var(--pp-c-surface)" }}
      >
        {playing && video.embedUrl ? (
          <iframe
            src={`${video.embedUrl}${video.embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
            title={video.name}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <>
            {video.thumbnail?.url ? (
              <SiteImage media={video.thumbnail} fill sizes="(max-width: 768px) 85vw, 320px" className="object-cover" />
            ) : null}
            {video.embedUrl ? (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label={`Play ${video.name}`}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
                  style={{ background: "var(--pp-c-primary)" }}
                >
                  <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </button>
            ) : null}
          </>
        )}
      </div>
      <figcaption className="mt-4">
        {video.quote ? <p className="pp-muted text-sm leading-relaxed">{video.quote}</p> : null}
        <p className="pp-heading mt-2 text-sm font-semibold">{video.name}</p>
        {video.role ? <p className="pp-muted text-xs">{video.role}</p> : null}
      </figcaption>
    </figure>
  );
};

const VideoReviewCarousel = ({ videos, dark }: { videos: Video[]; dark: boolean }) => {
  if (videos.length === 0) return null;
  return (
    <Carousel dark={dark} itemClassName="basis-[82%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 w-[82%] sm:w-[46%] lg:w-[31%] xl:w-[23%]">
      {videos.map((video, i) => (
        <VideoCard key={i} video={video} dark={dark} />
      ))}
    </Carousel>
  );
};

export default VideoReviewCarousel;
