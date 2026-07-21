// Client-side widget registry for the in-document builder canvas.
//
// The server registry (registry.ts) can pull server-only modules (e.g.
// blog-latest reads the DB), which cannot be imported into a client bundle.
// This mirror imports only the presentational widget components — everything a
// browser can render on its own. Data-backed widgets (blog-latest, and the
// global/custom composites resolved server-side) are handled by the canvas
// renderer as labelled placeholders, so editing never waits on the server.
import type { z } from "zod";
import type { WidgetMeta } from "@/types";

import Heading from "@/widgets/heading";
import { schema as headingSchema, meta as headingMeta } from "@/widgets/heading/schema";
import RichText from "@/widgets/rich-text";
import { schema as richTextSchema, meta as richTextMeta } from "@/widgets/rich-text/schema";
import ImageWidget from "@/widgets/image";
import { schema as imageSchema, meta as imageMeta } from "@/widgets/image/schema";
import Video from "@/widgets/video";
import { schema as videoSchema, meta as videoMeta } from "@/widgets/video/schema";
import ButtonRow from "@/widgets/button-row";
import { schema as buttonRowSchema, meta as buttonRowMeta } from "@/widgets/button-row/schema";
import Spacer from "@/widgets/spacer";
import { schema as spacerSchema, meta as spacerMeta } from "@/widgets/spacer/schema";
import Divider from "@/widgets/divider";
import { schema as dividerSchema, meta as dividerMeta } from "@/widgets/divider/schema";
import Columns from "@/widgets/columns";
import { schema as columnsSchema, meta as columnsMeta } from "@/widgets/columns/schema";
import Container from "@/widgets/container";
import { schema as containerSchema, meta as containerMeta } from "@/widgets/container/schema";
import HtmlEmbed from "@/widgets/html-embed";
import { schema as htmlEmbedSchema, meta as htmlEmbedMeta } from "@/widgets/html-embed/schema";
import Hero from "@/widgets/hero";
import { schema as heroSchema, meta as heroMeta } from "@/widgets/hero/schema";
import { schema as featureGridSchema, meta as featureGridMeta } from "@/widgets/feature-grid/schema";
import Faq from "@/widgets/faq";
import { schema as faqSchema, meta as faqMeta } from "@/widgets/faq/schema";
import Cta from "@/widgets/cta";
import { schema as ctaSchema, meta as ctaMeta } from "@/widgets/cta/schema";
import LogoMarquee from "@/widgets/logo-marquee";
import { schema as logoMarqueeSchema, meta as logoMarqueeMeta } from "@/widgets/logo-marquee/schema";
import TestimonialSlider from "@/widgets/testimonial-slider";
import { schema as testimonialSliderSchema, meta as testimonialSliderMeta } from "@/widgets/testimonial-slider/schema";
import PricingTable from "@/widgets/pricing-table";
import { schema as pricingTableSchema, meta as pricingTableMeta } from "@/widgets/pricing-table/schema";
import { schema as statsRowSchema, meta as statsRowMeta } from "@/widgets/stats-row/schema";
import { schema as stepsSchema, meta as stepsMeta } from "@/widgets/steps/schema";
import Comparison from "@/widgets/comparison";
import { schema as comparisonSchema, meta as comparisonMeta } from "@/widgets/comparison/schema";
import TeamGrid from "@/widgets/team-grid";
import { schema as teamGridSchema, meta as teamGridMeta } from "@/widgets/team-grid/schema";
import ContactForm from "@/widgets/contact-form";
import { schema as contactFormSchema, meta as contactFormMeta } from "@/widgets/contact-form/schema";
import Newsletter from "@/widgets/newsletter";
import { schema as newsletterSchema, meta as newsletterMeta } from "@/widgets/newsletter/schema";
import { schema as blogLatestSchema, meta as blogLatestMeta } from "@/widgets/blog-latest/schema";

export type ClientWidgetDef = {
  component: React.ComponentType<Record<string, unknown>>;
  schema: z.ZodType;
  meta: WidgetMeta;
  // True when the real widget needs server data, so the canvas shows a
  // placeholder (real content appears on the published page).
  serverOnly?: boolean;
};

const def = (component: unknown, schema: z.ZodType, meta: WidgetMeta): ClientWidgetDef => ({
  component: component as ClientWidgetDef["component"],
  schema,
  meta,
});

export const clientWidgetRegistry: Record<string, ClientWidgetDef> = {
  heading: def(Heading, headingSchema, headingMeta),
  "rich-text": def(RichText, richTextSchema, richTextMeta),
  image: def(ImageWidget, imageSchema, imageMeta),
  video: def(Video, videoSchema, videoMeta),
  "button-row": def(ButtonRow, buttonRowSchema, buttonRowMeta),
  spacer: def(Spacer, spacerSchema, spacerMeta),
  divider: def(Divider, dividerSchema, dividerMeta),
  columns: def(Columns, columnsSchema, columnsMeta),
  container: def(Container, containerSchema, containerMeta),
  "html-embed": def(HtmlEmbed, htmlEmbedSchema, htmlEmbedMeta),
  hero: def(Hero, heroSchema, heroMeta),
  // Inlines DB-stored icon SVGs server-side → placeholder in the canvas.
  "feature-grid": { component: () => null, schema: featureGridSchema, meta: featureGridMeta, serverOnly: true },
  faq: def(Faq, faqSchema, faqMeta),
  cta: def(Cta, ctaSchema, ctaMeta),
  "logo-marquee": def(LogoMarquee, logoMarqueeSchema, logoMarqueeMeta),
  "testimonial-slider": def(TestimonialSlider, testimonialSliderSchema, testimonialSliderMeta),
  "pricing-table": def(PricingTable, pricingTableSchema, pricingTableMeta),
  "stats-row": { component: () => null, schema: statsRowSchema, meta: statsRowMeta, serverOnly: true },
  steps: { component: () => null, schema: stepsSchema, meta: stepsMeta, serverOnly: true },
  comparison: def(Comparison, comparisonSchema, comparisonMeta),
  "team-grid": def(TeamGrid, teamGridSchema, teamGridMeta),
  "contact-form": def(ContactForm, contactFormSchema, contactFormMeta),
  newsletter: def(Newsletter, newsletterSchema, newsletterMeta),
  // Reads latest posts on the server; the canvas renders a placeholder for it.
  "blog-latest": { component: () => null, schema: blogLatestSchema, meta: blogLatestMeta, serverOnly: true },
};

export const getClientWidget = (type: string): ClientWidgetDef | undefined => clientWidgetRegistry[type];
