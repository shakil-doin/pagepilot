"use client";

// Live widget thumbnails for the palette and the widget library.
//
// A preview is the real widget rendered from the client registry with the
// manifest's insertion defaults, laid out at a fixed virtual width and scaled
// down with a transform. Nothing is screenshotted or hand-drawn, so a preview
// can never drift from what dropping the widget actually produces.
//
// Because it mounts the real widget, a preview can contain interactive elements
// of its own (slider arrows, tabs, a billing toggle). Never nest one inside a
// <button> or an <a>: that is invalid HTML and React reports it as a hydration
// error. Put the preview in a plain element, and place any control beside it.
import "@/app/(site)/site.css";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { getClientWidget } from "@/widgets/registry.client";
import { cn } from "@/lib/utils";

// The width the widget believes it has. Matches a desktop canvas, so container
// max-widths and breakpoints resolve the way they do on the real page.
const VIRTUAL_WIDTH = 1280;

type Props = {
  type: string;
  props: Record<string, unknown>;
  fontClass?: string;
  /** CSS aspect-ratio for the crop box, e.g. "16 / 10". */
  aspect?: string;
  className?: string;
};

// One broken widget must not blank the whole palette.
class PreviewBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const Fallback = ({ label, hint }: { label: string; hint?: string }) => (
  <div className="flex h-full flex-col items-center justify-center gap-1 px-3 text-center">
    <span className="text-[11px] font-medium text-ink">{label}</span>
    {hint ? <span className="text-[10px] leading-tight text-muted">{hint}</span> : null}
  </div>
);

/**
 * Injects the site theme tokens once per screen. The manifest scopes them to
 * `.pp-canvas`, so studio chrome keeps its own palette.
 */
export const WidgetPreviewTheme = ({ themeCss }: { themeCss?: string }) =>
  themeCss ? <style>{themeCss}</style> : null;

const WidgetPreview = ({ type, props, fontClass, aspect = "16 / 10", className }: Props) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  // Widgets mount only once their card scrolls into view — the library renders
  // ninety-odd of these at once. Without IntersectionObserver, render eagerly.
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const resize = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width > 0) setScale(width / VIRTUAL_WIDTH);
    });
    resize.observe(box);

    if (typeof IntersectionObserver === "undefined") return () => resize.disconnect();

    const seen = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          seen.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    seen.observe(box);

    return () => {
      resize.disconnect();
      seen.disconnect();
    };
  }, []);

  const widget = getClientWidget(type);
  const parsed = widget && !widget.serverOnly ? widget.schema.safeParse(props) : undefined;

  const body = () => {
    if (!widget) return <Fallback label={type} hint="Unknown widget" />;
    if (widget.serverOnly) return <Fallback label={widget.meta.name} hint="Live data — shown on the published page" />;
    if (!parsed?.success) return <Fallback label={widget.meta.name} hint="No preview" />;

    const Component_ = widget.component;
    return (
      <div
        className={cn("pp-site pp-canvas absolute left-0 top-0 origin-top-left select-none", fontClass)}
        style={{ width: VIRTUAL_WIDTH, transform: `scale(${scale})` }}
      >
        <PreviewBoundary fallback={null}>
          <Component_ {...(parsed.data as Record<string, unknown>)} />
        </PreviewBoundary>
      </div>
    );
  };

  return (
    <div
      ref={boxRef}
      aria-hidden
      className={cn("pointer-events-none relative overflow-hidden rounded-md border border-hairline bg-app", className)}
      style={{ aspectRatio: aspect }}
    >
      {visible && scale > 0 ? body() : null}
    </div>
  );
};

export default WidgetPreview;
