import { Fragment } from "react";
import { getWidget } from "@/widgets/registry";
import { getGlobalWidgetCached, getCustomWidgetCached } from "@/modules/widgets/widget.service";
import { cn } from "@/lib/utils";
import type { Breakpoint, SectionNode, SpacingSize } from "@/types";

type RenderOptions = {
  // Preview (draft mode / builder iframe) shows red placeholders for bad data
  // and stamps data-pp-section ids for canvas selection.
  preview?: boolean;
};

const SPACING: Record<SpacingSize, string> = {
  none: "0",
  sm: "var(--pp-space-sectionSm)",
  md: "var(--pp-space-sectionMd)",
  lg: "var(--pp-space-sectionLg)",
};

const HIDE_CLASS: Record<Breakpoint, string> = {
  mobile: "pp-hide-mobile",
  tablet: "pp-hide-tablet",
  desktop: "pp-hide-desktop",
};

const ONLY_CLASS: Record<Breakpoint, string> = {
  mobile: "pp-only-mobile",
  tablet: "pp-only-tablet",
  desktop: "pp-only-desktop",
};

const BREAKPOINTS: Breakpoint[] = ["mobile", "tablet", "desktop"];

const InvalidWidget = ({ type, message }: { type: string; message: string }) => (
  <div className="mx-4 my-2 rounded border-2 border-dashed border-red-500 bg-red-50 p-4 text-sm text-red-700">
    <strong>{type}</strong>: {message}
  </div>
);

// Custom widget instances override exposed child props via "childId.prop.path" targets.
const applyExposedProps = (
  tree: SectionNode[],
  exposed: { key: string; target: string }[],
  values: Record<string, unknown>,
): SectionNode[] => {
  // exposedProps is authored as free JSON in the custom-widget composer; a
  // non-array (e.g. an object) must not throw at render.
  if (!Array.isArray(exposed)) return tree;
  const overrides = exposed
    .filter((entry) => entry && values[entry.key] !== undefined)
    .map((entry) => {
      const [childId, ...propPath] = entry.target.split(".");
      return { childId, propPath, value: values[entry.key] };
    });
  if (overrides.length === 0) return tree;

  const patch = (nodes: SectionNode[]): SectionNode[] =>
    nodes.map((node) => {
      const mine = overrides.filter((o) => o.childId === node.id);
      let props = node.props;
      for (const override of mine) {
        props = structuredClone(props);
        let cursor: Record<string, unknown> = props;
        for (let i = 0; i < override.propPath.length - 1; i++) {
          cursor = (cursor[override.propPath[i]] ?? {}) as Record<string, unknown>;
        }
        cursor[override.propPath[override.propPath.length - 1]] = override.value;
      }
      return {
        ...node,
        props,
        children: node.children?.map((slot) => patch(slot)),
      };
    });
  return patch(tree);
};

const renderResolved = async (
  node: SectionNode,
  type: string,
  props: Record<string, unknown>,
  options: RenderOptions,
  index: number,
): Promise<React.ReactNode> => {
  const widget = getWidget(type);
  if (!widget) {
    return options.preview ? <InvalidWidget type={type} message="Unknown widget type" /> : null;
  }

  const parsed = widget.schema.safeParse(props);
  if (!parsed.success) {
    return options.preview ? (
      <InvalidWidget type={type} message={parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")} />
    ) : null;
  }

  const Component = widget.component;
  const validProps = parsed.data as Record<string, unknown>;

  // Container widgets receive their rendered children per column slot. In
  // preview each slot is a marked drop target (data-pp-slot="sectionId:index")
  // so the builder can drop widgets inside it; on the live site it stays a
  // plain fragment with no extra markup.
  let extra: Record<string, unknown> = {};
  if (node.children && node.children.length > 0) {
    const columnSlots = await Promise.all(
      node.children.map(async (slot, slotIndex) => {
        const key = slot.map((child) => child.id).join("-") || `slot-${slotIndex}`;
        const content = await renderSections(slot, options);
        return options.preview ? (
          <div key={key} data-pp-slot={`${node.id}:${slotIndex}`} className="pp-slot">
            {content}
          </div>
        ) : (
          <Fragment key={key}>{content}</Fragment>
        );
      }),
    );
    extra = { columnSlots };
  }

  // First section gets image priority treatment by convention (hero above the fold)
  return <Component {...validProps} {...extra} data-index={index} />;
};

export const renderSection = async (
  node: SectionNode,
  options: RenderOptions = {},
  index = 0,
): Promise<React.ReactNode> => {
  if (node.hidden) return null;

  // A malformed node (bad custom-widget tree saved via the raw JSON editor)
  // must never crash the render.
  if (!node || typeof node.type !== "string") {
    return options.preview ? <InvalidWidget type={String(node?.type)} message="Malformed section node" /> : null;
  }

  let type = node.type;
  let props = node.props ?? {};

  if (type === "global" && node.globalId) {
    const globalWidget = await getGlobalWidgetCached(node.globalId);
    if (!globalWidget) return options.preview ? <InvalidWidget type="global" message="Missing global widget" /> : null;
    type = globalWidget.type;
    props = globalWidget.props;
  }

  if (type.startsWith("custom:")) {
    const customWidget = await getCustomWidgetCached(type.slice("custom:".length));
    if (!customWidget) return options.preview ? <InvalidWidget type={type} message="Missing custom widget" /> : null;
    const tree = applyExposedProps(customWidget.tree, customWidget.exposedProps, props);
    return (
      <div
        className={cn((node.responsive?.hideOn ?? []).map((bp) => HIDE_CLASS[bp]))}
        data-pp-section={options.preview ? node.id : undefined}
      >
        {await renderSections(tree, options)}
      </div>
    );
  }

  const hideOn = node.responsive?.hideOn ?? [];
  const overrides = node.responsive?.overrides ?? {};
  const hasOverrides = Object.keys(overrides).some((bp) => Object.keys(overrides[bp as Breakpoint] ?? {}).length > 0);

  const spacingStyle: React.CSSProperties = {
    paddingTop: node.spacing?.top ? SPACING[node.spacing.top] : undefined,
    paddingBottom: node.spacing?.bottom ? SPACING[node.spacing.bottom] : undefined,
  };

  let body: React.ReactNode;
  if (!hasOverrides) {
    body = await renderResolved(node, type, props, options, index);
  } else {
    // Per-breakpoint prop overrides: render a variant per breakpoint, each
    // visible only at its width. Only sections that use overrides pay for this.
    body = await Promise.all(
      BREAKPOINTS.filter((bp) => !hideOn.includes(bp)).map(async (bp) => (
        <div key={bp} className={ONLY_CLASS[bp]}>
          {await renderResolved(node, type, { ...props, ...(overrides[bp] ?? {}) }, options, index)}
        </div>
      )),
    );
  }

  return (
    <div
      className={cn(hideOn.map((bp) => HIDE_CLASS[bp]))}
      style={spacingStyle}
      data-pp-section={options.preview ? node.id : undefined}
    >
      {body}
    </div>
  );
};

export const renderSections = async (
  sections: SectionNode[],
  options: RenderOptions = {},
): Promise<React.ReactNode> => (
  <>
    {await Promise.all(
      sections.map(async (node, index) => (
        <Fragment key={node.id}>{await renderSection(node, options, index)}</Fragment>
      )),
    )}
  </>
);
