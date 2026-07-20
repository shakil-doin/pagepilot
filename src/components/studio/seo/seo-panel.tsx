"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ImageSquare, X } from "@phosphor-icons/react";
import type { MediaRow } from "@/services/media";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MediaPickerDialog from "@/components/studio/media/media-picker-dialog";
import SeoPreviewCards from "@/components/studio/seo/seo-preview-cards";

// Seo row as returned by the pages/posts endpoints (ogImage joined for preview).
export type SeoPanelValue = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  robots?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageId?: string | null;
  ogImage?: { url: string } | null;
  ogType?: string | null;
  twitterCard?: string | null;
  structuredData?: unknown;
  excludeFromSitemap?: boolean;
  sitemapPriority?: number | null;
  sitemapChangeFreq?: string | null;
};

// Payload shape sent to the SEO upsert endpoints.
export type SeoFormValue = {
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  robots: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageId: string | null;
  ogType: string | null;
  twitterCard: string | null;
  structuredData: unknown;
  excludeFromSitemap: boolean;
  sitemapPriority: number | null;
  sitemapChangeFreq: string | null;
};

type Props = {
  value: SeoPanelValue | null;
  onSave: (seo: SeoFormValue) => void | Promise<unknown>;
  titleFallback: string;
  urlPath: string;
};

const ROBOTS_PRESETS = ["index,follow", "noindex,follow", "noindex,nofollow"];
const CHANGE_FREQS = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];

const CharCount = ({ length, limit }: { length: number; limit: number }) => (
  <span className={cn("text-xs tabular-nums", length > limit ? "text-warning" : "text-muted")}>
    {length}/{limit}
  </span>
);

const SeoPanel = ({ value, onSave, titleFallback, urlPath }: Props) => {
  const [metaTitle, setMetaTitle] = useState(value?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(value?.metaDescription ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(value?.canonicalUrl ?? "");
  const [robotsPreset, setRobotsPreset] = useState(() => {
    if (!value?.robots) return "default";
    return ROBOTS_PRESETS.includes(value.robots) ? value.robots : "custom";
  });
  const [robotsCustom, setRobotsCustom] = useState(value?.robots ?? "");
  const [ogTitle, setOgTitle] = useState(value?.ogTitle ?? "");
  const [ogDescription, setOgDescription] = useState(value?.ogDescription ?? "");
  const [ogImageId, setOgImageId] = useState<string | null>(value?.ogImageId ?? null);
  const [ogImageUrl, setOgImageUrl] = useState<string | null>(value?.ogImage?.url ?? null);
  const [ogType, setOgType] = useState(value?.ogType ?? "website");
  const [twitterCard, setTwitterCard] = useState(value?.twitterCard ?? "summary_large_image");
  const [structuredData, setStructuredData] = useState(() =>
    value?.structuredData ? JSON.stringify(value.structuredData, null, 2) : "",
  );
  const [excludeFromSitemap, setExcludeFromSitemap] = useState(value?.excludeFromSitemap ?? false);
  const [sitemapPriority, setSitemapPriority] = useState(value?.sitemapPriority != null ? String(value.sitemapPriority) : "");
  const [sitemapChangeFreq, setSitemapChangeFreq] = useState(value?.sitemapChangeFreq ?? "unset");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePick = (media: MediaRow) => {
    setOgImageId(media.id);
    setOgImageUrl(media.url);
  };

  const handleSave = async () => {
    let parsedStructuredData: unknown = null;
    if (structuredData.trim()) {
      try {
        parsedStructuredData = JSON.parse(structuredData);
      } catch {
        toast.error("Structured data must be valid JSON");
        return;
      }
    }
    const priority = sitemapPriority.trim() === "" ? null : Number(sitemapPriority);
    if (priority !== null && (Number.isNaN(priority) || priority < 0 || priority > 1)) {
      toast.error("Sitemap priority must be a number between 0 and 1");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        metaTitle: metaTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
        canonicalUrl: canonicalUrl.trim() || null,
        robots: robotsPreset === "default" ? null : robotsPreset === "custom" ? robotsCustom.trim() || null : robotsPreset,
        ogTitle: ogTitle.trim() || null,
        ogDescription: ogDescription.trim() || null,
        ogImageId,
        ogType: ogType || null,
        twitterCard: twitterCard || null,
        structuredData: parsedStructuredData,
        excludeFromSitemap,
        sitemapPriority: priority,
        sitemapChangeFreq: sitemapChangeFreq === "unset" ? null : sitemapChangeFreq,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <SeoPreviewCards
        title={metaTitle || titleFallback}
        description={metaDescription}
        url={canonicalUrl || urlPath}
        ogTitle={ogTitle || metaTitle || titleFallback}
        ogDescription={ogDescription || metaDescription}
        ogImageUrl={ogImageUrl}
      />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="seo-meta-title">Meta title</Label>
          <CharCount length={metaTitle.length} limit={60} />
        </div>
        <Input id="seo-meta-title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder={titleFallback} />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="seo-meta-description">Meta description</Label>
          <CharCount length={metaDescription.length} limit={160} />
        </div>
        <Textarea
          id="seo-meta-description"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          rows={3}
          placeholder="A short summary shown in search results."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="seo-canonical">Canonical URL</Label>
        <Input
          id="seo-canonical"
          value={canonicalUrl}
          onChange={(e) => setCanonicalUrl(e.target.value)}
          placeholder={`https://example.com${urlPath}`}
          className="font-mono text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Robots</Label>
        <Select value={robotsPreset} onValueChange={setRobotsPreset}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default (index,follow)</SelectItem>
            {ROBOTS_PRESETS.map((preset) => (
              <SelectItem key={preset} value={preset}>
                {preset}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom…</SelectItem>
          </SelectContent>
        </Select>
        {robotsPreset === "custom" ? (
          <Input
            value={robotsCustom}
            onChange={(e) => setRobotsCustom(e.target.value)}
            placeholder="noindex,follow,noarchive"
            className="font-mono text-xs"
          />
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="seo-og-title">OG title</Label>
        <Input id="seo-og-title" value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} placeholder={metaTitle || titleFallback} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="seo-og-description">OG description</Label>
        <Textarea id="seo-og-description" value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} rows={2} />
      </div>

      <div className="space-y-1.5">
        <Label>OG image</Label>
        {ogImageUrl ? (
          <div className="relative overflow-hidden rounded-lg border border-hairline">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ogImageUrl} alt="" className="aspect-[1.91/1] w-full object-cover" />
            <button
              type="button"
              onClick={() => {
                setOgImageId(null);
                setOgImageUrl(null);
              }}
              aria-label="Remove OG image"
              className="studio-focus absolute right-1.5 top-1.5 rounded-md bg-surface/90 p-1 text-muted hover:text-danger"
            >
              <X size={13} />
            </button>
          </div>
        ) : null}
        <Button type="button" variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
          <ImageSquare size={14} className="mr-1.5" />
          {ogImageUrl ? "Change image" : "Pick image"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>OG type</Label>
          <Select value={ogType} onValueChange={setOgType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">website</SelectItem>
              <SelectItem value="article">article</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Twitter card</Label>
          <Select value={twitterCard} onValueChange={setTwitterCard}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">summary</SelectItem>
              <SelectItem value="summary_large_image">summary_large_image</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="seo-structured-data">Structured data (JSON-LD)</Label>
        <Textarea
          id="seo-structured-data"
          value={structuredData}
          onChange={(e) => setStructuredData(e.target.value)}
          rows={5}
          placeholder={'{ "@context": "https://schema.org", "@type": "Article" }'}
          className="font-mono text-xs"
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-hairline p-3">
        <Label htmlFor="seo-exclude-sitemap" className="text-sm">
          Exclude from sitemap
        </Label>
        <Switch id="seo-exclude-sitemap" checked={excludeFromSitemap} onCheckedChange={setExcludeFromSitemap} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="seo-priority">Sitemap priority</Label>
          <Input
            id="seo-priority"
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={sitemapPriority}
            onChange={(e) => setSitemapPriority(e.target.value)}
            placeholder="0.5"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Change frequency</Label>
          <Select value={sitemapChangeFreq} onValueChange={setSitemapChangeFreq}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unset">Not set</SelectItem>
              {CHANGE_FREQS.map((freq) => (
                <SelectItem key={freq} value={freq}>
                  {freq}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button className="w-full" onClick={handleSave} disabled={saving}>
        {saving ? <Spinner className="mr-1.5" /> : null}
        {saving ? "Saving…" : "Save SEO"}
      </Button>

      <MediaPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} accept="image" onPick={handlePick} />
    </div>
  );
};

export default SeoPanel;
