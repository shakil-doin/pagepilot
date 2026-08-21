"use client";

import { useState } from "react";
import { WarningCircle, Globe } from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import FieldControl from "@/components/studio/builder/inspector/field-control";
import { SegmentedControl } from "@/components/studio/builder/inspector/controls/primitive-controls";
import { annotationOf, labelFor, type SchemaNode } from "@/components/studio/builder/inspector/schema-utils";
import type { Breakpoint, PublishBlocker, SectionNode, SpacingSize, WidgetManifestEntry } from "@/types";

type Props = {
  section: SectionNode | null;
  entry: WidgetManifestEntry | undefined;
  blockers: PublishBlocker[];
  onChange: (patch: Partial<SectionNode> | ((node: SectionNode) => SectionNode)) => void;
  // Convert this widget into a reusable global one (edit once, updates everywhere).
  onMakeGlobal?: (name: string) => void;
};

const SPACING_OPTIONS = [
  { label: "None", value: "none" },
  { label: "S", value: "sm" },
  { label: "M", value: "md" },
  { label: "L", value: "lg" },
];

const BREAKPOINTS: { key: Breakpoint; label: string }[] = [
  { key: "mobile", label: "Mobile" },
  { key: "tablet", label: "Tablet" },
  { key: "desktop", label: "Desktop" },
];

const BuilderInspector = ({ section, entry, blockers, onChange, onMakeGlobal }: Props) => {
  const [globalName, setGlobalName] = useState("");
  const [globalFormOpen, setGlobalFormOpen] = useState(false);

  if (!section) {
    return (
      <aside className="w-72 shrink-0 border-l border-hairline bg-surface p-4">
        <p className="pt-8 text-center text-xs text-muted">Select a section on the canvas or in the layers panel to edit it.</p>
      </aside>
    );
  }

  const jsonSchema = (entry?.jsonSchema ?? {}) as SchemaNode;
  const properties = jsonSchema.properties ?? {};
  const responsiveProps = Object.entries(properties).filter(([, schema]) => annotationOf(schema).responsive);

  const setProp = (key: string, value: unknown) =>
    onChange((node) => ({ ...node, props: { ...node.props, [key]: value } }));

  const setOverride = (breakpoint: Breakpoint, key: string, value: unknown) =>
    onChange((node) => {
      const overrides = { ...(node.responsive?.overrides ?? {}) };
      const bucket = { ...(overrides[breakpoint] ?? {}) };
      if (value === undefined) delete bucket[key];
      else bucket[key] = value;
      overrides[breakpoint] = bucket;
      return { ...node, responsive: { ...node.responsive, overrides } };
    });

  const isGlobal = section.type === "global";
  const isCustom = section.type.startsWith("custom:");

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-hairline bg-surface">
      <div className="border-b border-hairline px-3 py-2.5">
        <p className="text-sm font-semibold text-ink">{entry?.meta.name ?? (isGlobal ? "Global widget" : isCustom ? "Custom widget" : section.type)}</p>
        {entry?.meta.description ? <p className="mt-0.5 text-[11px] text-muted">{entry.meta.description}</p> : null}
      </div>

      {blockers.length > 0 ? (
        <div className="mx-3 mt-2 rounded-lg border border-warning/40 bg-warning/10 p-2 text-[11px] text-body">
          {blockers.map((blocker, i) => (
            <p key={i} className="flex items-start gap-1">
              <WarningCircle size={12} className="mt-0.5 shrink-0 text-warning" />
              {blocker.message}
            </p>
          ))}
        </div>
      ) : null}

      <Tabs defaultValue="content" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-3 mt-2 grid grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
          {isGlobal ? (
            <p className="text-xs text-muted">
              This section references a global widget. Edit it under Studio → Widgets to update every page that uses it.
            </p>
          ) : isCustom ? (
            <p className="text-xs text-muted">
              This is a custom widget instance. Its exposed fields appear here once defined in the composer.
            </p>
          ) : (
            Object.entries(properties).map(([key, schema]) => (
              <FieldControl
                key={key}
                label={labelFor(key, schema)}
                schema={schema}
                value={section.props[key]}
                onChange={(value) => setProp(key, value)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="style" className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
          <div className="space-y-1">
            <span className="block text-[11px] font-medium text-muted">Space above</span>
            <SegmentedControl
              value={section.spacing?.top ?? "none"}
              onChange={(value) =>
                onChange((node) => ({ ...node, spacing: { ...node.spacing, top: value as SpacingSize } }))
              }
              options={SPACING_OPTIONS}
            />
          </div>
          <div className="space-y-1">
            <span className="block text-[11px] font-medium text-muted">Space below</span>
            <SegmentedControl
              value={section.spacing?.bottom ?? "none"}
              onChange={(value) =>
                onChange((node) => ({ ...node, spacing: { ...node.spacing, bottom: value as SpacingSize } }))
              }
              options={SPACING_OPTIONS}
            />
          </div>

          <div className="space-y-2">
            <span className="block text-[11px] font-medium text-muted">Hide on</span>
            {BREAKPOINTS.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-xs text-body">
                <Checkbox
                  checked={(section.responsive?.hideOn ?? []).includes(key)}
                  onCheckedChange={(checked) =>
                    onChange((node) => {
                      const hideOn = new Set(node.responsive?.hideOn ?? []);
                      if (checked) hideOn.add(key);
                      else hideOn.delete(key);
                      return { ...node, responsive: { ...node.responsive, hideOn: [...hideOn] } };
                    })
                  }
                />
                {label}
              </label>
            ))}
          </div>

          {responsiveProps.length > 0 ? (
            <div className="space-y-3 border-t border-hairline pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Per-breakpoint overrides</p>
              {responsiveProps.map(([key, schema]) => (
                <div key={key} className="space-y-2 rounded-lg border border-hairline bg-app p-2">
                  <p className="text-[11px] font-medium text-ink">{labelFor(key, schema)}</p>
                  {(["mobile", "tablet"] as Breakpoint[]).map((breakpoint) => (
                    <div key={breakpoint} className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wide text-muted">{breakpoint}</span>
                      <FieldControl
                        label=""
                        schema={schema}
                        value={section.responsive?.overrides?.[breakpoint]?.[key]}
                        onChange={(value) => setOverride(breakpoint, key, value)}
                      />
                    </div>
                  ))}
                  <p className="text-[10px] text-muted">Desktop uses the Content tab value.</p>
                </div>
              ))}
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="advanced" className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
          <div className="space-y-1">
            <span className="block text-[11px] font-medium text-muted">Admin label</span>
            <Input
              value={section.adminLabel ?? ""}
              placeholder="Summer promo hero"
              onChange={(e) => onChange({ adminLabel: e.target.value || undefined })}
              className="h-8 text-xs"
            />
            <p className="text-[10px] text-muted">Shown in the layers panel only, never on the site.</p>
          </div>
          <label className="flex items-center justify-between text-xs text-body">
            Hidden (all devices)
            <Switch checked={Boolean(section.hidden)} onCheckedChange={(hidden) => onChange({ hidden })} />
          </label>

          <div className="space-y-1">
            <span className="block text-[11px] font-medium text-muted">Custom CSS</span>
            <Textarea
              value={section.customCss ?? ""}
              onChange={(e) => onChange({ customCss: e.target.value || undefined })}
              placeholder={"padding: 40px;\nbackground: #f5f5f5;\n& .pp-heading { color: #4f46e5; }"}
              rows={5}
              className="font-mono text-[11px] leading-relaxed"
              spellCheck={false}
            />
            <p className="text-[10px] text-muted">
              Applies to <strong>this widget only</strong>. Use <code>&amp;</code> to target elements inside it.
            </p>
          </div>

          {!isGlobal && !isCustom && onMakeGlobal ? (
            <div className="space-y-1.5 border-t border-hairline pt-3">
              {globalFormOpen ? (
                <div className="space-y-2">
                  <Input
                    value={globalName}
                    onChange={(e) => setGlobalName(e.target.value)}
                    placeholder="Global widget name"
                    className="h-8 text-xs"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="secondary" className="flex-1" onClick={() => setGlobalFormOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="flex-1"
                      disabled={!globalName.trim()}
                      onClick={() => {
                        onMakeGlobal(globalName.trim());
                        setGlobalFormOpen(false);
                        setGlobalName("");
                      }}
                    >
                      Create
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setGlobalName(entry?.meta.name ?? "");
                    setGlobalFormOpen(true);
                  }}
                >
                  <Globe size={14} className="mr-1.5" />
                  Make reusable (global)
                </Button>
              )}
              <p className="text-[10px] text-muted">
                Turns this into a shared widget. Editing it under Studio → Widgets updates every page that uses it.
              </p>
            </div>
          ) : null}

          <div className="space-y-1">
            <span className="block text-[11px] font-medium text-muted">Section id</span>
            <p className="font-mono text-[10px] text-muted">{section.id}</p>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
};

export default BuilderInspector;
