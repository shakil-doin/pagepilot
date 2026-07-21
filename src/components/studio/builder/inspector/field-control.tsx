"use client";

import { annotationOf, optionsOf, resolveNode, labelFor, type SchemaNode } from "@/components/studio/builder/inspector/schema-utils";
import {
  TextControl,
  TextareaControl,
  NumberControl,
  SwitchControl,
  SegmentedControl,
  SelectControl,
  SliderControl,
  DateControl,
} from "@/components/studio/builder/inspector/controls/primitive-controls";
import ColorControl from "@/components/studio/builder/inspector/controls/color-control";
import LinkControl from "@/components/studio/builder/inspector/controls/link-control";
import MediaControl from "@/components/studio/builder/inspector/controls/media-control";
import IconControl from "@/components/studio/builder/inspector/controls/icon-control";
import RichtextControl from "@/components/studio/builder/inspector/controls/richtext-control";
import ListControl from "@/components/studio/builder/inspector/controls/list-control";

type Props = {
  label: string;
  schema: SchemaNode;
  value: unknown;
  onChange: (value: unknown) => void;
  // Flush the save immediately after a discrete change (a pick / toggle / choice)
  // so the canvas — which only mirrors saved state — updates without waiting out
  // the typing debounce. Text-like controls keep debouncing.
  onCommit?: () => void;
};

// One prop, one control: the dispatcher the whole inspector is built from.
const FieldControl = ({ label, schema, value, onChange, onCommit }: Props) => {
  const annotation = annotationOf(schema);
  const resolved = resolveNode(schema);
  const effective = value === undefined ? resolved.default : value;

  // Discrete controls change value in one gesture, so save + refresh the canvas
  // right away rather than after the debounce.
  const commit = (next: unknown) => {
    onChange(next);
    onCommit?.();
  };

  const control = (() => {
    switch (annotation.control) {
      case "textarea":
        return <TextareaControl value={effective} onChange={onChange} placeholder={annotation.placeholder} />;
      case "richtext":
        return <RichtextControl value={effective} onChange={onChange} />;
      case "number":
        return (
          <NumberControl
            value={effective}
            onChange={onChange}
            min={annotation.min ?? resolved.minimum}
            max={annotation.max ?? resolved.maximum}
            step={annotation.step}
          />
        );
      case "segmented":
        return <SegmentedControl value={effective} onChange={commit} options={optionsOf(schema)} />;
      case "select":
        return <SelectControl value={effective} onChange={commit} options={optionsOf(schema)} />;
      case "switch":
        return <SwitchControl value={effective} onChange={commit} />;
      case "slider":
        return (
          <SliderControl
            value={effective}
            onChange={onChange}
            min={annotation.min ?? resolved.minimum}
            max={annotation.max ?? resolved.maximum}
            step={annotation.step}
          />
        );
      case "date":
        return <DateControl value={effective} onChange={commit} />;
      case "color":
        return <ColorControl value={effective} onChange={onChange} />;
      case "media":
        return <MediaControl value={effective} onChange={onChange} onCommit={onCommit} accept={annotation.accept ?? "image"} />;
      case "icon":
        return <IconControl value={effective} onChange={commit} />;
      case "link":
        return <LinkControl value={effective} onChange={onChange} />;
      case "list":
        return (
          <ListControl
            value={effective}
            onChange={onChange}
            itemSchema={resolved.items ? resolveNode(resolved.items) : undefined}
            itemLabelKey={annotation.itemLabel}
          />
        );
      case "group": {
        const properties = resolved.properties ?? {};
        const groupValue = (effective ?? {}) as Record<string, unknown>;
        return (
          <div className="space-y-2.5 rounded-lg border border-hairline bg-app p-2">
            {Object.entries(properties).map(([key, childSchema]) => (
              <FieldControl
                key={key}
                label={labelFor(key, childSchema)}
                schema={childSchema}
                value={groupValue[key]}
                onChange={(childValue) => onChange({ ...groupValue, [key]: childValue })}
                onCommit={onCommit}
              />
            ))}
          </div>
        );
      }
      default:
        return <TextControl value={effective} onChange={onChange} placeholder={annotation.placeholder} />;
    }
  })();

  const inline = annotation.control === "switch";

  return (
    <div className={inline ? "flex items-center justify-between gap-2" : "space-y-1"}>
      <span className="block text-[11px] font-medium text-muted">{label}</span>
      {control}
      {annotation.description ? <p className="text-[10px] leading-snug text-muted">{annotation.description}</p> : null}
    </div>
  );
};

export default FieldControl;
