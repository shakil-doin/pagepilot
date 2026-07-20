import Section from "@/components/site/section";
import { cn } from "@/lib/utils";
import LiteEmbed from "./lite-embed";
import type { Props } from "./schema";

const parseEmbed = (url: string): { src: string; thumb?: string } | null => {
  const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  if (youtube) {
    return {
      src: `https://www.youtube-nocookie.com/embed/${youtube[1]}`,
      thumb: `https://i.ytimg.com/vi/${youtube[1]}/hqdefault.jpg`,
    };
  }
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { src: `https://player.vimeo.com/video/${vimeo[1]}` };
  return null;
};

const Video = ({ source, media, poster, embedUrl, width }: Props) => {
  const widthClass = cn("mx-auto", width === "wide" && "max-w-4xl", width === "narrow" && "max-w-2xl");

  if (source === "upload" && media?.url) {
    return (
      <Section>
        <div className={widthClass}>
          <video
            src={media.url}
            poster={poster?.url}
            controls
            playsInline
            preload="none"
            className="w-full rounded-[var(--pp-radius-lg)]"
          />
        </div>
      </Section>
    );
  }

  const embed = embedUrl ? parseEmbed(embedUrl) : null;
  if (!embed) return null;

  return (
    <Section>
      <div className={widthClass}>
        <div className="relative aspect-video overflow-hidden rounded-[var(--pp-radius-lg)]">
          <LiteEmbed embedSrc={embed.src} thumbnailUrl={poster?.url ?? embed.thumb} />
        </div>
      </div>
    </Section>
  );
};

export default Video;
