# Authoring Widgets

Widgets are the only thing developers write in PagePilot. One widget = one
section component + one Zod schema + one registry line. Everything else
(placing it, editing its content, publishing) happens in the Studio.

## Anatomy of a widget

```
src/widgets/stats-row/
├── index.tsx      # React Server Component. Receives validated props.
├── schema.ts      # Zod schema + editor annotations + meta.
└── preview.png    # Optional 640x400 thumbnail for the palette.
```

## 1. The schema (`schema.ts`)

One schema drives both validation (save + render) and the auto-generated
inspector form in the builder. Annotate every field with `field()`:

```ts
import { z } from "zod";
import { field, widgetMeta, mediaRef, linkRef, buttonItem, sectionBackground } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "stats-row",            // unique registry key, kebab-case
  name: "Stats Row",           // palette display name
  category: "Marketing",       // "Basic" | "Layout" | "Content" | "Marketing"
  description: "Big numbers with labels in a row",
  // primitive: true,          // primitives power the custom-widget composer
  // adminOnly: true,          // only ADMIN+ can place it (html-embed)
});

export const schema = z.object({
  items: field(
    z.array(z.object({
      value: field(z.string().min(1), { control: "text", label: "Value" }),
      label: field(z.string().min(1), { control: "text", label: "Label" }),
      icon:  field(z.string().optional(), { control: "icon", label: "Icon" }),
    })).default([]),
    { control: "list", label: "Stats", itemLabel: "label" },
  ),
  columns: field(z.number().int().min(2).max(4).default(4), {
    control: "segmented",
    label: "Columns",
    options: [
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "4", value: 4 },
    ],
    responsive: true,          // editors can override per breakpoint
  }),
  background: sectionBackground,
});

export type Props = z.infer<typeof schema>;
```

### Rules that keep the builder pleasant

- Give **every field a default or make it optional**. The builder inserts a
  widget by parsing `{}` through the schema; required fields without defaults
  produce an invalid (red) section until filled in.
- Give every `list` control an `itemLabel` so repeater rows are named.
- Reuse the shared shapes from `@/widgets/lib`:
  - `mediaRef` for the `media` control (stores a full asset snapshot).
  - `linkRef` for the `link` control (`{ href, newTab }`).
  - `buttonItem` for CTA buttons (label + link + variant).
  - `sectionBackground` for the standard background select.

### The complete control kit

| `control` | Value type | Renders |
| --- | --- | --- |
| `text` | string | one-line input |
| `textarea` | string | multi-line input |
| `richtext` | HTML string | inline TipTap editor (sanitized at save and render) |
| `number` | number | number input (respects zod min/max) |
| `segmented` | enum/number | button group; supply `options` for numbers |
| `select` | enum | dropdown; options derived from the zod enum |
| `switch` | boolean | toggle |
| `color` | token name or hex | token-aware color picker |
| `media` | `mediaRef` object | media library picker; set `accept: "image" \| "video" \| "any"` |
| `icon` | `"ph:rocket"` ref | icon picker across installed sets |
| `link` | `linkRef` object | page picker + URL/anchor input |
| `list` | array | sortable repeater (add/remove/duplicate/reorder) |
| `group` | object | collapsible sub-form |
| `slider` | number | slider (set `min`/`max`/`step`) |
| `date` | ISO string | date input |

## 2. The component (`index.tsx`)

A React Server Component. It receives props that already passed schema
validation, so render without defensive checks:

```tsx
import Section from "@/components/site/section";
import SiteIcon from "@/components/site/site-icon";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const StatsRow = ({ items, columns, background }: Props) => (
  <Section background={background} className="py-14 md:py-20">
    <div className={cn("grid gap-8", columns === 4 ? "grid-cols-2 lg:grid-cols-4" : `sm:grid-cols-${columns}`)}>
      {items.map((item, i) => (
        <div key={i} className="text-center">
          {item.icon ? <SiteIcon icon={item.icon} size={28} /> : null}
          <p className="pp-heading text-4xl">{item.value}</p>
          <p className="pp-muted mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  </Section>
);

export default StatsRow;
```

### Component rules

- **Server component by default.** Add a small `"use client"` leaf file only
  for genuine interactivity (see `testimonial-slider/slider.tsx`,
  `video/lite-embed.tsx`) and keep `index.tsx` server-safe.
- **Theme tokens only, never raw hex.** Use CSS variables
  (`var(--pp-c-primary)`, `var(--pp-radius-lg)`, `var(--pp-text-h2)`) and the
  helper classes `pp-heading`, `pp-muted`, `pp-on-dark`, `pp-bg-surface`.
- Use the shared building blocks: `Section`, `Container`, `SiteImage`
  (LQIP + focal point), `SiteButton` (theme button variants), `SiteIcon`
  (server-inlined SVG), `RichHtml`.
- Build **mobile-first**. The responsive envelope is for tuning, not for
  rescuing desktop-only layouts.
- Images: pass `priority` only when the widget is likely above the fold
  (hero). `SiteImage` handles `sizes`, blur placeholder and focal cropping.

## 3. Register it

One line in `src/widgets/registry.ts`:

```ts
import StatsRow from "@/widgets/stats-row";
import { schema as statsRowSchema, meta as statsRowMeta } from "@/widgets/stats-row/schema";

export const widgetRegistry: Record<string, WidgetDef> = {
  // …
  "stats-row": def(StatsRow, statsRowSchema, statsRowMeta),
};
```

Restart `pnpm dev`. The widget appears in the builder palette immediately:
`src/widgets/manifest.ts` serializes every schema to JSON Schema (with your
annotations embedded) and serves it at `GET /api/studio/widgets/manifest`.
The Studio builds the inspector form from that manifest; it never imports
your component, which is what keeps builder code out of the public bundle.

## How rendering works (what you get for free)

Pages are stored as an ordered JSON tree of widget instances:

```jsonc
{
  "id": "sec_x1",
  "type": "stats-row",
  "props": { "columns": 4, "items": [ … ] },
  "adminLabel": "Numbers block",
  "spacing": { "top": "lg", "bottom": "lg" },
  "responsive": {
    "hideOn": ["mobile"],
    "overrides": { "tablet": { "columns": 2 } }
  }
}
```

`src/components/site/section-renderer.tsx` maps `type → component` through
the registry and applies the envelope generically:

- `spacing` becomes vertical padding from the theme spacing scale. The page
  owns rhythm between sections; your widget owns its internal layout.
- `hideOn` renders breakpoint-scoped `display:none` wrappers.
- `overrides` re-renders the widget per breakpoint with merged props, but only
  for sections that actually use overrides. Only props annotated
  `responsive: true` are offered in the Style tab.
- Props are validated again at render. Invalid props or an unknown type render
  **nothing** in production and a red placeholder in preview. A widget can
  never crash the site.

## Schema changes and migration flags

The manifest carries a `schemaHash` per widget. If you change a schema
incompatibly (rename a field, tighten a type), already-published pages keep
rendering their last valid revision; the sections fail validation in the
Studio and show as issues in the builder toolbar until an editor updates
them. Prefer additive changes with defaults; when you must break, write a
one-off script that walks `PageRevision.sections` and migrates props.

## Container widgets

`columns` is the reference container: the section node carries
`children: SectionNode[][]` (one array per column) and the renderer passes
each column pre-rendered as `columnSlots: React.ReactNode[]`. If you build
another container, accept `columnSlots` the same way.

## Global and custom widgets (no code involved)

- **Global widget**: an editor saves one placed widget as global; pages then
  reference it by id (`{ type: "global", globalId }`). Editing it revalidates
  every page that uses it.
- **Custom widget**: composed in the Studio from primitives and stored as a
  tree in the database (`type: "custom:<id>"`). Primitives are the widgets
  with `primitive: true` in their meta.

## Testing checklist for a new widget

1. `pnpm typecheck` passes.
2. Insert the widget on a draft page: it renders with defaults, no red box.
3. Fill every field once, including nested list items; save; reload; values
   persist and the preview matches.
4. Publish; the widget renders identically on the live static page.
5. Set an empty required field; the section renders nothing in production and
   red in preview; publish is blocked with a readable message.
6. Check mobile width in the device toggle; verify a `responsive: true`
   override works.
7. If you added a client leaf: confirm the public page still works with
   JavaScript disabled (progressive enhancement where possible).
