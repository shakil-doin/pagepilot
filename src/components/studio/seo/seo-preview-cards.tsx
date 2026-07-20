"use client";

type Props = {
  title: string;
  description: string;
  url: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string | null;
};

// Live previews driven by the SeoPanel form state: a Google SERP snippet and
// an Open Graph share card.
const SeoPreviewCards = ({ title, description, url, ogTitle, ogDescription, ogImageUrl }: Props) => (
  <div className="space-y-3">
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">Search preview</p>
      <p className="truncate text-xs text-success">{url || "/"}</p>
      <p className="mt-0.5 truncate text-base text-info">{title || "Untitled"}</p>
      <p className="mt-0.5 line-clamp-2 text-sm text-muted">
        {description || "No meta description yet. Search engines will pick their own snippet."}
      </p>
    </div>

    <div className="rounded-xl border border-hairline bg-surface p-4">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">Share preview</p>
      <div className="overflow-hidden rounded-lg border border-hairline">
        {ogImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ogImageUrl} alt="" className="aspect-[1.91/1] w-full object-cover" />
        ) : (
          <div className="flex aspect-[1.91/1] w-full items-center justify-center bg-app text-xs text-muted">
            No image
          </div>
        )}
        <div className="border-t border-hairline bg-app p-3">
          <p className="truncate text-sm font-medium text-ink">{ogTitle || title || "Untitled"}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted">{ogDescription || description}</p>
        </div>
      </div>
    </div>
  </div>
);

export default SeoPreviewCards;
