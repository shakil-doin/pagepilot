export type Breakpoint = "mobile" | "tablet" | "desktop";

export type SpacingSize = "none" | "sm" | "md" | "lg";

// One placed widget instance inside a page revision or custom-widget tree.
export type SectionNode = {
  id: string;
  // Registry key, or "global" (reference) — custom widgets use "custom:<id>"
  type: string;
  props: Record<string, unknown>;
  // For type === "global"
  globalId?: string;
  adminLabel?: string;
  hidden?: boolean;
  spacing?: { top?: SpacingSize; bottom?: SpacingSize };
  responsive?: {
    hideOn?: Breakpoint[];
    overrides?: Partial<Record<Breakpoint, Record<string, unknown>>>;
  };
  // Container widgets (columns) nest children: one array per column slot
  children?: SectionNode[][];
};

export type MenuItem = {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  children?: MenuItem[];
};

export type ThemeTokens = {
  colors: Record<string, { value: string; label: string }>;
  gradients?: Record<string, { from: string; to: string; angle: number }>;
  typography: {
    headingFont: string;
    bodyFont: string;
    scale: Record<string, string>;
    headingWeight: number;
  };
  radii: Record<string, string>;
  spacing: Record<string, string>;
  container: { maxWidth: string; gutter: string };
  buttons: Record<
    string,
    { bg: string; text: string; border?: string; radius?: string; shadow?: boolean }
  >;
};

// Editor annotation attached to a Zod field via the field() helper.
export type FieldControl =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "segmented"
  | "select"
  | "switch"
  | "color"
  | "media"
  | "icon"
  | "link"
  | "list"
  | "group"
  | "slider"
  | "date";

export type FieldAnnotation = {
  control: FieldControl;
  label?: string;
  description?: string;
  placeholder?: string;
  // media control
  accept?: "image" | "video" | "any";
  // list control: which item prop names the row in the repeater
  itemLabel?: string;
  // select/segmented options when not derivable from the enum
  options?: { label: string; value: string | number }[];
  // slider
  min?: number;
  max?: number;
  step?: number;
  // opt this prop into per-breakpoint overrides
  responsive?: boolean;
};

export type WidgetMeta = {
  key: string;
  name: string;
  category: "Basic" | "Content" | "Marketing" | "Layout";
  description: string;
  // Primitives power the custom-widget composer
  primitive?: boolean;
  // Only ADMIN+ may place (html-embed)
  adminOnly?: boolean;
};

// Manifest entry sent to the Studio: JSON Schema + control annotations, no components.
export type WidgetManifestEntry = {
  meta: WidgetMeta;
  schemaHash: string;
  jsonSchema: unknown;
  // Flattened path → annotation map, e.g. "items.*.icon" → { control: "icon" }
  controls: Record<string, FieldAnnotation>;
  defaults: Record<string, unknown>;
};

export type ApiError = { error: { code: string; message: string } };
export type ApiData<T> = { data: T };
export type ApiResult<T> = ApiData<T> | ApiError;

export type PublishBlocker = { sectionId: string; message: string };

export type SeoInput = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  robots?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageId?: string | null;
  ogType?: string | null;
  twitterCard?: string | null;
  structuredData?: unknown;
  excludeFromSitemap?: boolean;
  sitemapPriority?: number | null;
  sitemapChangeFreq?: string | null;
};
