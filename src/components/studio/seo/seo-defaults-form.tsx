"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImageSquare, X } from "@phosphor-icons/react";
import { api, ApiClientError } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MediaPickerDialog from "@/components/studio/media/media-picker-dialog";

// Mirrors SeoDefaults in settings.service.ts (server-only module).
type SeoDefaultsValue = {
  titleTemplate: string;
  defaultDescription?: string;
  defaultOgImageUrl?: string;
  twitterHandle?: string;
  canonicalBaseUrl?: string;
  robotsTxt?: string;
  organizationJsonLd?: Record<string, unknown> | null;
  verification?: { google?: string; bing?: string };
};

// Inner form mounts only after the setting has loaded so useState initializers
// can seed the fields without effects.
const SeoDefaultsFields = ({ initial }: { initial: SeoDefaultsValue | null }) => {
  const queryClient = useQueryClient();
  const [titleTemplate, setTitleTemplate] = useState(initial?.titleTemplate ?? "%s | PagePilot Site");
  const [defaultDescription, setDefaultDescription] = useState(initial?.defaultDescription ?? "");
  const [defaultOgImageUrl, setDefaultOgImageUrl] = useState(initial?.defaultOgImageUrl ?? "");
  const [twitterHandle, setTwitterHandle] = useState(initial?.twitterHandle ?? "");
  const [canonicalBaseUrl, setCanonicalBaseUrl] = useState(initial?.canonicalBaseUrl ?? "");
  const [verificationGoogle, setVerificationGoogle] = useState(initial?.verification?.google ?? "");
  const [verificationBing, setVerificationBing] = useState(initial?.verification?.bing ?? "");
  const [organizationJsonLd, setOrganizationJsonLd] = useState(() =>
    initial?.organizationJsonLd ? JSON.stringify(initial.organizationJsonLd, null, 2) : "",
  );
  const [robotsTxt, setRobotsTxt] = useState(initial?.robotsTxt ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (value: SeoDefaultsValue) => api.put("/api/studio/settings/seo.defaults", value),
    onSuccess: () => {
      toast.success("SEO defaults saved");
      queryClient.invalidateQueries({ queryKey: ["settings", "seo.defaults"] });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Could not save SEO defaults"),
  });

  const handleSave = () => {
    let orgJsonLd: Record<string, unknown> | null = null;
    if (organizationJsonLd.trim()) {
      try {
        orgJsonLd = JSON.parse(organizationJsonLd) as Record<string, unknown>;
      } catch {
        toast.error("Organization JSON-LD must be valid JSON");
        return;
      }
    }
    saveMutation.mutate({
      titleTemplate: titleTemplate.trim() || "%s",
      defaultDescription: defaultDescription.trim() || undefined,
      defaultOgImageUrl: defaultOgImageUrl || undefined,
      twitterHandle: twitterHandle.trim() || undefined,
      canonicalBaseUrl: canonicalBaseUrl.trim() || undefined,
      robotsTxt,
      organizationJsonLd: orgJsonLd,
      verification: { google: verificationGoogle.trim() || undefined, bing: verificationBing.trim() || undefined },
    });
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="text-sm">Site-wide defaults</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="seo-title-template">Title template</Label>
          <Input
            id="seo-title-template"
            value={titleTemplate}
            onChange={(e) => setTitleTemplate(e.target.value)}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted">%s is replaced with the page or post title.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo-default-description">Default description</Label>
          <Textarea
            id="seo-default-description"
            value={defaultDescription}
            onChange={(e) => setDefaultDescription(e.target.value)}
            rows={3}
            placeholder="Used when a page has no meta description of its own."
          />
        </div>

        <div className="space-y-2">
          <Label>Default OG image</Label>
          {defaultOgImageUrl ? (
            <div className="relative max-w-xs overflow-hidden rounded-lg border border-hairline">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={defaultOgImageUrl} alt="" className="aspect-[1.91/1] w-full object-cover" />
              <button
                type="button"
                onClick={() => setDefaultOgImageUrl("")}
                aria-label="Remove default OG image"
                className="studio-focus absolute right-1.5 top-1.5 rounded-md bg-surface/90 p-1 text-muted hover:text-danger"
              >
                <X size={13} />
              </button>
            </div>
          ) : null}
          <Button type="button" variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
            <ImageSquare size={14} className="mr-1.5" />
            {defaultOgImageUrl ? "Change image" : "Pick image"}
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="seo-twitter">Twitter handle</Label>
            <Input id="seo-twitter" value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} placeholder="@pagepilot" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-canonical-base">Canonical base URL</Label>
            <Input
              id="seo-canonical-base"
              value={canonicalBaseUrl}
              onChange={(e) => setCanonicalBaseUrl(e.target.value)}
              placeholder="https://example.com"
              className="font-mono text-xs"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="seo-verify-google">Google verification</Label>
            <Input
              id="seo-verify-google"
              value={verificationGoogle}
              onChange={(e) => setVerificationGoogle(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-verify-bing">Bing verification</Label>
            <Input
              id="seo-verify-bing"
              value={verificationBing}
              onChange={(e) => setVerificationBing(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo-org-jsonld">Organization JSON-LD</Label>
          <Textarea
            id="seo-org-jsonld"
            value={organizationJsonLd}
            onChange={(e) => setOrganizationJsonLd(e.target.value)}
            rows={6}
            placeholder={'{ "@context": "https://schema.org", "@type": "Organization", "name": "…" }'}
            className="font-mono text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo-robots-txt">robots.txt</Label>
          <Textarea
            id="seo-robots-txt"
            value={robotsTxt}
            onChange={(e) => setRobotsTxt(e.target.value)}
            rows={6}
            placeholder={"User-agent: *\nAllow: /"}
            className="font-mono text-xs"
          />
        </div>

        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <Spinner className="mr-1.5" /> : null}
          {saveMutation.isPending ? "Saving…" : "Save defaults"}
        </Button>
      </CardContent>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        accept="image"
        onPick={(media) => setDefaultOgImageUrl(media.url)}
      />
    </Card>
  );
};

const SeoDefaultsForm = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["settings", "seo.defaults"],
    queryFn: () => api.get<SeoDefaultsValue | null>("/api/studio/settings/seo.defaults"),
  });

  if (isLoading) return <p className="py-16 text-center text-sm text-muted">Loading SEO defaults…</p>;
  return <SeoDefaultsFields initial={data ?? null} />;
};

export default SeoDefaultsForm;
