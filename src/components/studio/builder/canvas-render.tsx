"use client";

import { Fragment, createContext, useContext } from "react";
import { getClientWidget } from "@/widgets/registry.client";
import { cn } from "@/lib/utils";
import type { Breakpoint, SectionNode, SpacingSize } from "@/types";

// Resolved global widgets by id, so a "global" reference node can render its
// underlying widget live (instead of a placeholder) on the canvas.
export type GlobalWidgetLite = { id: string; name: string; type: string; props: Record<string, unknown> };
const GlobalWidgetsContext = createContext<Record<string, GlobalWidgetLite>>({});

// Renders the section tree straight from React state — no iframe, no server
// round-trip — so edits show on the canvas instantly. Mirrors the public
// section-renderer's markup (data-pp-section / data-pp-slot stamps, spacing,
// responsive classes) so selection and drag-drop work the same, but runs fully
// on the client. Data-backed widgets render as labelled placeholders.

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

const Placeholder = ({ label, hint }: { label: string; hint: string }) => (
  <div className="mx-4 my-2 rounded-lg border-2 border-dashed border-hairline bg-app p-6 text-center">
    <p className="text-sm font-semibold text-ink">{label}</p>
    <p className="mt-1 text-xs text-muted">{hint}</p>
  </div>
);

const Invalid = ({ type, message }: { type: string; message: string }) => (
  <div className="mx-4 my-2 rounded border-2 border-dashed border-red-500 bg-red-50 p-4 text-sm text-red-700">
    <strong>{type}</strong>: {message}
  </div>
);

const RenderNode = ({ node, index }: { node: SectionNode; index: number }) => {
  const globals = useContext(GlobalWidgetsContext);
  if (node.hidden) return null;
  if (!node || typeof node.type !== "string") {
    return <Invalid type={String(node?.type)} message="Malformed section node" />;
  }

  const hideOn = node.responsive?.hideOn ?? [];
  const spacingStyle: React.CSSProperties = {
    paddingTop: node.spacing?.top ? SPACING[node.spacing.top] : undefined,
    paddingBottom: node.spacing?.bottom ? SPACING[node.spacing.bottom] : undefined,
  };

  // Per-instance custom CSS, scoped to this node's id so it never touches other
  // uses of the same widget.
  const cssClass = node.customCss ? `pp-c-${node.id}` : undefined;
  const wrap = (body: React.ReactNode) => (
    <div
      className={cn(hideOn.map((bp) => HIDE_CLASS[bp]), cssClass)}
      style={spacingStyle}
      data-pp-section={node.id}
      data-pp-name={node.adminLabel || node.type}
    >
      {node.customCss ? <style>{`.${cssClass}{${node.customCss}}`}</style> : null}
      {body}
    </div>
  );

  // Resolve the effective widget: a "global" reference renders its underlying
  // widget from the shared definition, so edits to the global show everywhere.
  let type = node.type;
  let widgetProps: Record<string, unknown> = node.props ?? {};
  if (type === "global") {
    const g = node.globalId ? globals[node.globalId] : undefined;
    if (!g) {
      return wrap(<Placeholder label={node.adminLabel || "Global widget"} hint="Shared widget — edit it under Studio → Widgets." />);
    }
    type = g.type;
    widgetProps = g.props;
  }
  if (type.startsWith("custom:")) {
    return wrap(<Placeholder label={node.adminLabel || "Custom widget"} hint="Composite widget — its live content shows on the published page." />);
  }

  const widget = getClientWidget(type);
  if (!widget) return wrap(<Invalid type={type} message="Unknown widget type" />);
  if (widget.serverOnly) {
    return wrap(<Placeholder label={widget.meta.name} hint="Dynamic content — appears on the published page." />);
  }

  const parsed = widget.schema.safeParse(widgetProps);
  if (!parsed.success) {
    return wrap(<Invalid type={type} message={parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")} />);
  }

  const Component = widget.component;
  const validProps = parsed.data as Record<string, unknown>;

  // Container widgets get their children per column slot, each a marked drop
  // target so widgets can be dropped inside it.
  let extra: Record<string, unknown> = {};
  if (node.children && node.children.length > 0) {
    extra = {
      columnSlots: node.children.map((slot, slotIndex) => (
        <div key={slotIndex} data-pp-slot={`${node.id}:${slotIndex}`} className="pp-slot">
          {slot.map((child, i) => (
            <RenderNode key={child.id} node={child} index={i} />
          ))}
        </div>
      )),
    };
  }

  return wrap(<Component {...validProps} {...extra} data-index={index} />);
};

// The in-flow drop gap: real layout space that opens between sections while
// dragging, so content physically parts to receive the widget (Elementor feel).
// Carries no data-pp-section, so drop measurement ignores it.
const DropGap = () => (
  <div className="pp-drop-gap">
    <span>Drop here</span>
  </div>
);

const CanvasRender = ({
  sections,
  gapIndex = null,
  globalWidgets = {},
}: {
  sections: SectionNode[];
  gapIndex?: number | null;
  globalWidgets?: Record<string, GlobalWidgetLite>;
}) => (
  <GlobalWidgetsContext.Provider value={globalWidgets}>
    {sections.map((node, index) => (
      <Fragment key={node.id}>
        {gapIndex === index ? <DropGap /> : null}
        <RenderNode node={node} index={index} />
      </Fragment>
    ))}
    {gapIndex != null && gapIndex >= sections.length ? <DropGap /> : null}
  </GlobalWidgetsContext.Provider>
);

export default CanvasRender;
