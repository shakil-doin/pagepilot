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
import FeatureGrid from "@/widgets/feature-grid";
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
import StatsRow from "@/widgets/stats-row";
import { schema as statsRowSchema, meta as statsRowMeta } from "@/widgets/stats-row/schema";
import Steps from "@/widgets/steps";
import { schema as stepsSchema, meta as stepsMeta } from "@/widgets/steps/schema";
import Comparison from "@/widgets/comparison";
import { schema as comparisonSchema, meta as comparisonMeta } from "@/widgets/comparison/schema";
import TeamGrid from "@/widgets/team-grid";
import { schema as teamGridSchema, meta as teamGridMeta } from "@/widgets/team-grid/schema";
import ContactForm from "@/widgets/contact-form";
import { schema as contactFormSchema, meta as contactFormMeta } from "@/widgets/contact-form/schema";
import Newsletter from "@/widgets/newsletter";
import { schema as newsletterSchema, meta as newsletterMeta } from "@/widgets/newsletter/schema";
import BlogLatest from "@/widgets/blog-latest";
import { schema as blogLatestSchema, meta as blogLatestMeta } from "@/widgets/blog-latest/schema";







import T2sHero from "@/widgets/t2s-hero";
import { schema as t2sHeroSchema, meta as t2sHeroMeta } from "@/widgets/t2s-hero/schema";
import T2sAbout from "@/widgets/t2s-about";
import { schema as t2sAboutSchema, meta as t2sAboutMeta } from "@/widgets/t2s-about/schema";
import T2sComparison from "@/widgets/t2s-comparison";
import { schema as t2sComparisonSchema, meta as t2sComparisonMeta } from "@/widgets/t2s-comparison/schema";
import T2sHowWork from "@/widgets/t2s-how-work";
import { schema as t2sHowWorkSchema, meta as t2sHowWorkMeta } from "@/widgets/t2s-how-work/schema";
import T2sProductTour from "@/widgets/t2s-product-tour";
import { schema as t2sProductTourSchema, meta as t2sProductTourMeta } from "@/widgets/t2s-product-tour/schema";
import T2sMobileFeature from "@/widgets/t2s-mobile-feature";
import { schema as t2sMobileFeatureSchema, meta as t2sMobileFeatureMeta } from "@/widgets/t2s-mobile-feature/schema";
import T2sVideoReview from "@/widgets/t2s-video-review";
import { schema as t2sVideoReviewSchema, meta as t2sVideoReviewMeta } from "@/widgets/t2s-video-review/schema";
import T2sReview from "@/widgets/t2s-review";
import { schema as t2sReviewSchema, meta as t2sReviewMeta } from "@/widgets/t2s-review/schema";
import T2sSupport from "@/widgets/t2s-support";
import { schema as t2sSupportSchema, meta as t2sSupportMeta } from "@/widgets/t2s-support/schema";
import T2sCta from "@/widgets/t2s-cta";
import { schema as t2sCtaSchema, meta as t2sCtaMeta } from "@/widgets/t2s-cta/schema";
import T2sFaq from "@/widgets/t2s-faq";
import { schema as t2sFaqSchema, meta as t2sFaqMeta } from "@/widgets/t2s-faq/schema";
import T2sAboutHero from "@/widgets/t2s-about-hero";
import { schema as t2sAboutHeroSchema, meta as t2sAboutHeroMeta } from "@/widgets/t2s-about-hero/schema";
import T2sAboutStory from "@/widgets/t2s-about-story";
import { schema as t2sAboutStorySchema, meta as t2sAboutStoryMeta } from "@/widgets/t2s-about-story/schema";
import T2sAboutMission from "@/widgets/t2s-about-mission";
import { schema as t2sAboutMissionSchema, meta as t2sAboutMissionMeta } from "@/widgets/t2s-about-mission/schema";
import T2sAboutVision from "@/widgets/t2s-about-vision";
import { schema as t2sAboutVisionSchema, meta as t2sAboutVisionMeta } from "@/widgets/t2s-about-vision/schema";
import T2sAboutEmpower from "@/widgets/t2s-about-empower";
import { schema as t2sAboutEmpowerSchema, meta as t2sAboutEmpowerMeta } from "@/widgets/t2s-about-empower/schema";
import T2sAboutValues from "@/widgets/t2s-about-values";
import { schema as t2sAboutValuesSchema, meta as t2sAboutValuesMeta } from "@/widgets/t2s-about-values/schema";
import T2sAboutCta from "@/widgets/t2s-about-cta";
import { schema as t2sAboutCtaSchema, meta as t2sAboutCtaMeta } from "@/widgets/t2s-about-cta/schema";
import T2sAuthorsHero from "@/widgets/t2s-authors-hero";
import { schema as t2sAuthorsHeroSchema, meta as t2sAuthorsHeroMeta } from "@/widgets/t2s-authors-hero/schema";
import T2sAuthorsTeam from "@/widgets/t2s-authors-team";
import { schema as t2sAuthorsTeamSchema, meta as t2sAuthorsTeamMeta } from "@/widgets/t2s-authors-team/schema";
import T2sAuthorsEditorial from "@/widgets/t2s-authors-editorial";
import { schema as t2sAuthorsEditorialSchema, meta as t2sAuthorsEditorialMeta } from "@/widgets/t2s-authors-editorial/schema";
import T2sAuthorsLegal from "@/widgets/t2s-authors-legal";
import { schema as t2sAuthorsLegalSchema, meta as t2sAuthorsLegalMeta } from "@/widgets/t2s-authors-legal/schema";
import T2sSectionTitle from "@/widgets/t2s-section-title";
import { schema as t2sSectionTitleSchema, meta as t2sSectionTitleMeta } from "@/widgets/t2s-section-title/schema";
import T2sChecklist from "@/widgets/t2s-checklist";
import { schema as t2sChecklistSchema, meta as t2sChecklistMeta } from "@/widgets/t2s-checklist/schema";
import T2sFeatureGrid from "@/widgets/t2s-feature-grid";
import { schema as t2sFeatureGridSchema, meta as t2sFeatureGridMeta } from "@/widgets/t2s-feature-grid/schema";
import T2sFeatureChips from "@/widgets/t2s-feature-chips";
import { schema as t2sFeatureChipsSchema, meta as t2sFeatureChipsMeta } from "@/widgets/t2s-feature-chips/schema";
import T2sPartnersStrip from "@/widgets/t2s-partners-strip";
import { schema as t2sPartnersStripSchema, meta as t2sPartnersStripMeta } from "@/widgets/t2s-partners-strip/schema";
import T2sLogoMarquee from "@/widgets/t2s-logo-marquee";
import { schema as t2sLogoMarqueeSchema, meta as t2sLogoMarqueeMeta } from "@/widgets/t2s-logo-marquee/schema";
import T2sPlanList from "@/widgets/t2s-plan-list";
import { schema as t2sPlanListSchema, meta as t2sPlanListMeta } from "@/widgets/t2s-plan-list/schema";
import T2sComparePlans from "@/widgets/t2s-compare-plans";
import { schema as t2sComparePlansSchema, meta as t2sComparePlansMeta } from "@/widgets/t2s-compare-plans/schema";
import T2sLanderHero from "@/widgets/t2s-lander-hero";
import { schema as t2sLanderHeroSchema, meta as t2sLanderHeroMeta } from "@/widgets/t2s-lander-hero/schema";
import T2sLanderFeaturedIn from "@/widgets/t2s-lander-featured-in";
import { schema as t2sLanderFeaturedInSchema, meta as t2sLanderFeaturedInMeta } from "@/widgets/t2s-lander-featured-in/schema";
import T2sLanderProblems from "@/widgets/t2s-lander-problems";
import { schema as t2sLanderProblemsSchema, meta as t2sLanderProblemsMeta } from "@/widgets/t2s-lander-problems/schema";
import T2sLanderSolutions from "@/widgets/t2s-lander-solutions";
import { schema as t2sLanderSolutionsSchema, meta as t2sLanderSolutionsMeta } from "@/widgets/t2s-lander-solutions/schema";
import T2sLanderOurSolution from "@/widgets/t2s-lander-our-solution";
import { schema as t2sLanderOurSolutionSchema, meta as t2sLanderOurSolutionMeta } from "@/widgets/t2s-lander-our-solution/schema";
import T2sLanderSolutionCompare from "@/widgets/t2s-lander-solution-compare";
import { schema as t2sLanderSolutionCompareSchema, meta as t2sLanderSolutionCompareMeta } from "@/widgets/t2s-lander-solution-compare/schema";
import T2sLanderFeatures from "@/widgets/t2s-lander-features";
import { schema as t2sLanderFeaturesSchema, meta as t2sLanderFeaturesMeta } from "@/widgets/t2s-lander-features/schema";
import T2sLanderPricing from "@/widgets/t2s-lander-pricing";
import { schema as t2sLanderPricingSchema, meta as t2sLanderPricingMeta } from "@/widgets/t2s-lander-pricing/schema";
import T2sLanderFaq from "@/widgets/t2s-lander-faq";
import { schema as t2sLanderFaqSchema, meta as t2sLanderFaqMeta } from "@/widgets/t2s-lander-faq/schema";
import T2sLanderCta from "@/widgets/t2s-lander-cta";
import { schema as t2sLanderCtaSchema, meta as t2sLanderCtaMeta } from "@/widgets/t2s-lander-cta/schema";
import T2sCompareHero from "@/widgets/t2s-compare-hero";
import { schema as t2sCompareHeroSchema, meta as t2sCompareHeroMeta } from "@/widgets/t2s-compare-hero/schema";
import T2sCompareHowTested from "@/widgets/t2s-compare-how-tested";
import { schema as t2sCompareHowTestedSchema, meta as t2sCompareHowTestedMeta } from "@/widgets/t2s-compare-how-tested/schema";
import T2sCompareRankings from "@/widgets/t2s-compare-rankings";
import { schema as t2sCompareRankingsSchema, meta as t2sCompareRankingsMeta } from "@/widgets/t2s-compare-rankings/schema";
import T2sCompareRankingsGrid from "@/widgets/t2s-compare-rankings-grid";
import { schema as t2sCompareRankingsGridSchema, meta as t2sCompareRankingsGridMeta } from "@/widgets/t2s-compare-rankings-grid/schema";
import T2sCompareMatrix from "@/widgets/t2s-compare-matrix";
import { schema as t2sCompareMatrixSchema, meta as t2sCompareMatrixMeta } from "@/widgets/t2s-compare-matrix/schema";
import T2sCompareDeepDive from "@/widgets/t2s-compare-deep-dive";
import { schema as t2sCompareDeepDiveSchema, meta as t2sCompareDeepDiveMeta } from "@/widgets/t2s-compare-deep-dive/schema";
import T2sCompareFeatureTable from "@/widgets/t2s-compare-feature-table";
import { schema as t2sCompareFeatureTableSchema, meta as t2sCompareFeatureTableMeta } from "@/widgets/t2s-compare-feature-table/schema";
import T2sCompareHighlights from "@/widgets/t2s-compare-highlights";
import { schema as t2sCompareHighlightsSchema, meta as t2sCompareHighlightsMeta } from "@/widgets/t2s-compare-highlights/schema";
import T2sCompareWhyChoose from "@/widgets/t2s-compare-why-choose";
import { schema as t2sCompareWhyChooseSchema, meta as t2sCompareWhyChooseMeta } from "@/widgets/t2s-compare-why-choose/schema";
import T2sCompareFit from "@/widgets/t2s-compare-fit";
import { schema as t2sCompareFitSchema, meta as t2sCompareFitMeta } from "@/widgets/t2s-compare-fit/schema";
import T2sLearnHero from "@/widgets/t2s-learn-hero";
import { schema as t2sLearnHeroSchema, meta as t2sLearnHeroMeta } from "@/widgets/t2s-learn-hero/schema";
import T2sLearnHubHero from "@/widgets/t2s-learn-hub-hero";
import { schema as t2sLearnHubHeroSchema, meta as t2sLearnHubHeroMeta } from "@/widgets/t2s-learn-hub-hero/schema";
import T2sLearnGuides from "@/widgets/t2s-learn-guides";
import { schema as t2sLearnGuidesSchema, meta as t2sLearnGuidesMeta } from "@/widgets/t2s-learn-guides/schema";
import T2sLearnTwoWays from "@/widgets/t2s-learn-two-ways";
import { schema as t2sLearnTwoWaysSchema, meta as t2sLearnTwoWaysMeta } from "@/widgets/t2s-learn-two-ways/schema";
import T2sLearnDifference from "@/widgets/t2s-learn-difference";
import { schema as t2sLearnDifferenceSchema, meta as t2sLearnDifferenceMeta } from "@/widgets/t2s-learn-difference/schema";
import T2sLearnChoose from "@/widgets/t2s-learn-choose";
import { schema as t2sLearnChooseSchema, meta as t2sLearnChooseMeta } from "@/widgets/t2s-learn-choose/schema";
import T2sLearnFits from "@/widgets/t2s-learn-fits";
import { schema as t2sLearnFitsSchema, meta as t2sLearnFitsMeta } from "@/widgets/t2s-learn-fits/schema";
import T2sMarketsInstruments from "@/widgets/t2s-markets-instruments";
import { schema as t2sMarketsInstrumentsSchema, meta as t2sMarketsInstrumentsMeta } from "@/widgets/t2s-markets-instruments/schema";
import T2sMarketsGrid from "@/widgets/t2s-markets-grid";
import { schema as t2sMarketsGridSchema, meta as t2sMarketsGridMeta } from "@/widgets/t2s-markets-grid/schema";
import T2sMarketsProblems from "@/widgets/t2s-markets-problems";
import { schema as t2sMarketsProblemsSchema, meta as t2sMarketsProblemsMeta } from "@/widgets/t2s-markets-problems/schema";
import T2sMarketsRiskControls from "@/widgets/t2s-markets-risk-controls";
import { schema as t2sMarketsRiskControlsSchema, meta as t2sMarketsRiskControlsMeta } from "@/widgets/t2s-markets-risk-controls/schema";
import T2sMarketsMistakes from "@/widgets/t2s-markets-mistakes";
import { schema as t2sMarketsMistakesSchema, meta as t2sMarketsMistakesMeta } from "@/widgets/t2s-markets-mistakes/schema";
import T2sFeaturesHero from "@/widgets/t2s-features-hero";
import { schema as t2sFeaturesHeroSchema, meta as t2sFeaturesHeroMeta } from "@/widgets/t2s-features-hero/schema";
import T2sFeaturesSignature from "@/widgets/t2s-features-signature";
import { schema as t2sFeaturesSignatureSchema, meta as t2sFeaturesSignatureMeta } from "@/widgets/t2s-features-signature/schema";
import T2sProductShowcase from "@/widgets/t2s-product-showcase";
import { schema as t2sProductShowcaseSchema, meta as t2sProductShowcaseMeta } from "@/widgets/t2s-product-showcase/schema";
import T2sToolsCalculators from "@/widgets/t2s-tools-calculators";
import { schema as t2sToolsCalculatorsSchema, meta as t2sToolsCalculatorsMeta } from "@/widgets/t2s-tools-calculators/schema";
import T2sToolsSteps from "@/widgets/t2s-tools-steps";
import { schema as t2sToolsStepsSchema, meta as t2sToolsStepsMeta } from "@/widgets/t2s-tools-steps/schema";

export type WidgetDef = {
  // Props flow through schema validation before reaching the component
  component: React.ComponentType<Record<string, unknown>>;
  schema: z.ZodType;
  meta: WidgetMeta;
};

const def = (component: unknown, schema: z.ZodType, meta: WidgetMeta): WidgetDef => ({
  component: component as WidgetDef["component"],
  schema,
  meta,
});

// The single source of truth: one line per widget, mirroring sectionRegistry.
export const widgetRegistry: Record<string, WidgetDef> = {
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
  "feature-grid": def(FeatureGrid, featureGridSchema, featureGridMeta),
  faq: def(Faq, faqSchema, faqMeta),
  cta: def(Cta, ctaSchema, ctaMeta),
  "logo-marquee": def(LogoMarquee, logoMarqueeSchema, logoMarqueeMeta),
  "testimonial-slider": def(TestimonialSlider, testimonialSliderSchema, testimonialSliderMeta),
  "pricing-table": def(PricingTable, pricingTableSchema, pricingTableMeta),
  "stats-row": def(StatsRow, statsRowSchema, statsRowMeta),
  steps: def(Steps, stepsSchema, stepsMeta),
  comparison: def(Comparison, comparisonSchema, comparisonMeta),
  "team-grid": def(TeamGrid, teamGridSchema, teamGridMeta),
  "contact-form": def(ContactForm, contactFormSchema, contactFormMeta),
  newsletter: def(Newsletter, newsletterSchema, newsletterMeta),
  "blog-latest": def(BlogLatest, blogLatestSchema, blogLatestMeta),

  // ── trade2sync section widgets ──────────────────────────────────────────────
  "t2s-hero": def(T2sHero, t2sHeroSchema, t2sHeroMeta),
  "t2s-about": def(T2sAbout, t2sAboutSchema, t2sAboutMeta),
  "t2s-comparison": def(T2sComparison, t2sComparisonSchema, t2sComparisonMeta),
  "t2s-how-work": def(T2sHowWork, t2sHowWorkSchema, t2sHowWorkMeta),
  "t2s-product-tour": def(T2sProductTour, t2sProductTourSchema, t2sProductTourMeta),
  "t2s-mobile-feature": def(T2sMobileFeature, t2sMobileFeatureSchema, t2sMobileFeatureMeta),
  "t2s-video-review": def(T2sVideoReview, t2sVideoReviewSchema, t2sVideoReviewMeta),
  "t2s-review": def(T2sReview, t2sReviewSchema, t2sReviewMeta),
  "t2s-support": def(T2sSupport, t2sSupportSchema, t2sSupportMeta),
  "t2s-cta": def(T2sCta, t2sCtaSchema, t2sCtaMeta),
  "t2s-faq": def(T2sFaq, t2sFaqSchema, t2sFaqMeta),
  "t2s-about-hero": def(T2sAboutHero, t2sAboutHeroSchema, t2sAboutHeroMeta),
  "t2s-about-story": def(T2sAboutStory, t2sAboutStorySchema, t2sAboutStoryMeta),
  "t2s-about-mission": def(T2sAboutMission, t2sAboutMissionSchema, t2sAboutMissionMeta),
  "t2s-about-vision": def(T2sAboutVision, t2sAboutVisionSchema, t2sAboutVisionMeta),
  "t2s-about-empower": def(T2sAboutEmpower, t2sAboutEmpowerSchema, t2sAboutEmpowerMeta),
  "t2s-about-values": def(T2sAboutValues, t2sAboutValuesSchema, t2sAboutValuesMeta),
  "t2s-about-cta": def(T2sAboutCta, t2sAboutCtaSchema, t2sAboutCtaMeta),
  "t2s-authors-hero": def(T2sAuthorsHero, t2sAuthorsHeroSchema, t2sAuthorsHeroMeta),
  "t2s-authors-team": def(T2sAuthorsTeam, t2sAuthorsTeamSchema, t2sAuthorsTeamMeta),
  "t2s-authors-editorial": def(T2sAuthorsEditorial, t2sAuthorsEditorialSchema, t2sAuthorsEditorialMeta),
  "t2s-authors-legal": def(T2sAuthorsLegal, t2sAuthorsLegalSchema, t2sAuthorsLegalMeta),
  "t2s-section-title": def(T2sSectionTitle, t2sSectionTitleSchema, t2sSectionTitleMeta),
  "t2s-checklist": def(T2sChecklist, t2sChecklistSchema, t2sChecklistMeta),
  "t2s-feature-grid": def(T2sFeatureGrid, t2sFeatureGridSchema, t2sFeatureGridMeta),
  "t2s-feature-chips": def(T2sFeatureChips, t2sFeatureChipsSchema, t2sFeatureChipsMeta),
  "t2s-partners-strip": def(T2sPartnersStrip, t2sPartnersStripSchema, t2sPartnersStripMeta),
  "t2s-logo-marquee": def(T2sLogoMarquee, t2sLogoMarqueeSchema, t2sLogoMarqueeMeta),
  "t2s-plan-list": def(T2sPlanList, t2sPlanListSchema, t2sPlanListMeta),
  "t2s-compare-plans": def(T2sComparePlans, t2sComparePlansSchema, t2sComparePlansMeta),
  "t2s-lander-hero": def(T2sLanderHero, t2sLanderHeroSchema, t2sLanderHeroMeta),
  "t2s-lander-featured-in": def(T2sLanderFeaturedIn, t2sLanderFeaturedInSchema, t2sLanderFeaturedInMeta),
  "t2s-lander-problems": def(T2sLanderProblems, t2sLanderProblemsSchema, t2sLanderProblemsMeta),
  "t2s-lander-solutions": def(T2sLanderSolutions, t2sLanderSolutionsSchema, t2sLanderSolutionsMeta),
  "t2s-lander-our-solution": def(T2sLanderOurSolution, t2sLanderOurSolutionSchema, t2sLanderOurSolutionMeta),
  "t2s-lander-solution-compare": def(T2sLanderSolutionCompare, t2sLanderSolutionCompareSchema, t2sLanderSolutionCompareMeta),
  "t2s-lander-features": def(T2sLanderFeatures, t2sLanderFeaturesSchema, t2sLanderFeaturesMeta),
  "t2s-lander-pricing": def(T2sLanderPricing, t2sLanderPricingSchema, t2sLanderPricingMeta),
  "t2s-lander-faq": def(T2sLanderFaq, t2sLanderFaqSchema, t2sLanderFaqMeta),
  "t2s-lander-cta": def(T2sLanderCta, t2sLanderCtaSchema, t2sLanderCtaMeta),
  "t2s-compare-hero": def(T2sCompareHero, t2sCompareHeroSchema, t2sCompareHeroMeta),
  "t2s-compare-how-tested": def(T2sCompareHowTested, t2sCompareHowTestedSchema, t2sCompareHowTestedMeta),
  "t2s-compare-rankings": def(T2sCompareRankings, t2sCompareRankingsSchema, t2sCompareRankingsMeta),
  "t2s-compare-rankings-grid": def(T2sCompareRankingsGrid, t2sCompareRankingsGridSchema, t2sCompareRankingsGridMeta),
  "t2s-compare-matrix": def(T2sCompareMatrix, t2sCompareMatrixSchema, t2sCompareMatrixMeta),
  "t2s-compare-deep-dive": def(T2sCompareDeepDive, t2sCompareDeepDiveSchema, t2sCompareDeepDiveMeta),
  "t2s-compare-feature-table": def(T2sCompareFeatureTable, t2sCompareFeatureTableSchema, t2sCompareFeatureTableMeta),
  "t2s-compare-highlights": def(T2sCompareHighlights, t2sCompareHighlightsSchema, t2sCompareHighlightsMeta),
  "t2s-compare-why-choose": def(T2sCompareWhyChoose, t2sCompareWhyChooseSchema, t2sCompareWhyChooseMeta),
  "t2s-compare-fit": def(T2sCompareFit, t2sCompareFitSchema, t2sCompareFitMeta),
  "t2s-learn-hero": def(T2sLearnHero, t2sLearnHeroSchema, t2sLearnHeroMeta),
  "t2s-learn-hub-hero": def(T2sLearnHubHero, t2sLearnHubHeroSchema, t2sLearnHubHeroMeta),
  "t2s-learn-guides": def(T2sLearnGuides, t2sLearnGuidesSchema, t2sLearnGuidesMeta),
  "t2s-learn-two-ways": def(T2sLearnTwoWays, t2sLearnTwoWaysSchema, t2sLearnTwoWaysMeta),
  "t2s-learn-difference": def(T2sLearnDifference, t2sLearnDifferenceSchema, t2sLearnDifferenceMeta),
  "t2s-learn-choose": def(T2sLearnChoose, t2sLearnChooseSchema, t2sLearnChooseMeta),
  "t2s-learn-fits": def(T2sLearnFits, t2sLearnFitsSchema, t2sLearnFitsMeta),
  "t2s-markets-instruments": def(T2sMarketsInstruments, t2sMarketsInstrumentsSchema, t2sMarketsInstrumentsMeta),
  "t2s-markets-grid": def(T2sMarketsGrid, t2sMarketsGridSchema, t2sMarketsGridMeta),
  "t2s-markets-problems": def(T2sMarketsProblems, t2sMarketsProblemsSchema, t2sMarketsProblemsMeta),
  "t2s-markets-risk-controls": def(T2sMarketsRiskControls, t2sMarketsRiskControlsSchema, t2sMarketsRiskControlsMeta),
  "t2s-markets-mistakes": def(T2sMarketsMistakes, t2sMarketsMistakesSchema, t2sMarketsMistakesMeta),
  "t2s-features-hero": def(T2sFeaturesHero, t2sFeaturesHeroSchema, t2sFeaturesHeroMeta),
  "t2s-features-signature": def(T2sFeaturesSignature, t2sFeaturesSignatureSchema, t2sFeaturesSignatureMeta),
  "t2s-product-showcase": def(T2sProductShowcase, t2sProductShowcaseSchema, t2sProductShowcaseMeta),
  "t2s-tools-calculators": def(T2sToolsCalculators, t2sToolsCalculatorsSchema, t2sToolsCalculatorsMeta),
  "t2s-tools-steps": def(T2sToolsSteps, t2sToolsStepsSchema, t2sToolsStepsMeta),
};

export const getWidget = (type: string): WidgetDef | undefined => widgetRegistry[type];
