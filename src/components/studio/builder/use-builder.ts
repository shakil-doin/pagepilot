"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/services/api";
import { normalizeTree } from "@/components/studio/builder/builder-utils";
import type { PublishBlocker, SectionNode, WidgetManifestEntry } from "@/types";

export type SaveState = "saved" | "saving" | "dirty" | "offline";

export type StudioPage = {
  id: string;
  path: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  hideHeader: boolean;
  hideFooter: boolean;
  locked: boolean;
  publishedRevision: { id: string; version: number } | null;
  draft: { id: string; version: number; sections: SectionNode[] } | null;
  seo: Record<string, unknown> | null;
};

export type ManifestData = {
  manifest: WidgetManifestEntry[];
  customWidgets: { id: string; name: string; description: string | null; thumbnail: string | null }[];
  globalWidgets: { id: string; name: string; type: string }[];
  // Theme tokens + font class for the in-document canvas (see manifest route).
  themeCss?: string;
  fontClass?: string;
};

const HISTORY_LIMIT = 50;

// Owns the section tree, undo/redo history and the save/publish flow for one
// page.
//
// Editing is fully local and instant: the canvas renders straight from this
// state (no iframe, no server round-trip), so every change shows immediately.
// The database is touched only when the user saves a draft or publishes — the
// builder tracks unsaved changes so leaving can prompt first.
export const useBuilder = (pageId: string) => {
  const [sections, setSectionsRaw] = useState<SectionNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [blockers, setBlockers] = useState<PublishBlocker[]>([]);

  const history = useRef<{ past: SectionNode[][]; future: SectionNode[][] }>({ past: [], future: [] });
  const loaded = useRef(false);
  // Mirror of the current tree so save reads the latest value synchronously.
  const sectionsRef = useRef<SectionNode[]>([]);

  const commit = useCallback((next: SectionNode[]) => {
    sectionsRef.current = next;
    setSectionsRaw(next);
  }, []);

  const pageQuery = useQuery({
    queryKey: ["page", pageId],
    queryFn: () => api.get<StudioPage>(`/api/studio/pages/${pageId}`),
  });

  const manifestQuery = useQuery({
    queryKey: ["widget-manifest"],
    queryFn: () => api.get<ManifestData>("/api/studio/widgets/manifest"),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (pageQuery.data && !loaded.current) {
      loaded.current = true;
      commit(normalizeTree(pageQuery.data.draft?.sections ?? []));
      setSaveState("saved");
    }
  }, [pageQuery.data, commit]);

  // Every local edit marks the page dirty; the canvas re-renders from state
  // immediately regardless.
  const setSections = useCallback(
    (updater: (current: SectionNode[]) => SectionNode[]) => {
      const current = sectionsRef.current;
      const next = updater(current);
      if (next === current) return;
      history.current.past = [...history.current.past.slice(-HISTORY_LIMIT + 1), current];
      history.current.future = [];
      commit(next);
      setSaveState("dirty");
    },
    [commit],
  );

  const undo = useCallback(() => {
    const previous = history.current.past.pop();
    if (!previous) return;
    history.current.future.push(sectionsRef.current);
    commit(previous);
    setSaveState("dirty");
  }, [commit]);

  const redo = useCallback(() => {
    const next = history.current.future.pop();
    if (!next) return;
    history.current.past.push(sectionsRef.current);
    commit(next);
    setSaveState("dirty");
  }, [commit]);

  const saveMutation = useMutation({
    mutationFn: (next: SectionNode[]) =>
      api.patch<{ savedAt: string; blockers: PublishBlocker[] }>(`/api/studio/pages/${pageId}/draft`, {
        sections: next,
      }),
  });

  // Persist the current tree to the draft revision. Returns whether it stuck so
  // publish / leave-guard can decide what to do next.
  const saveDraft = useCallback(async (): Promise<boolean> => {
    const snapshot = sectionsRef.current;
    setSaveState("saving");
    try {
      const result = await saveMutation.mutateAsync(snapshot);
      setBlockers(result.blockers);
      // If the user kept editing during the request, stay dirty.
      setSaveState(sectionsRef.current === snapshot ? "saved" : "dirty");
      return true;
    } catch (err) {
      setSaveState(err instanceof ApiClientError ? "dirty" : "offline");
      toast.error(err instanceof ApiClientError ? err.message : "Save failed. Check your connection.");
      return false;
    }
    // saveMutation identity is stable per react-query
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  const publishMutation = useMutation({
    mutationFn: (note?: string) => api.post(`/api/studio/pages/${pageId}/publish`, { note }),
    onSuccess: () => {
      toast.success("Published. The page is live.");
      pageQuery.refetch();
    },
    onError: (err) => {
      if (err instanceof ApiClientError && err.code === "BLOCKED") {
        try {
          const parsed = JSON.parse(err.message) as PublishBlocker[];
          setBlockers(parsed);
          toast.error(`Publish blocked: fix ${parsed.length} issue${parsed.length === 1 ? "" : "s"} first.`);
          return;
        } catch {
          // fall through to the generic toast
        }
      }
      toast.error(err instanceof ApiClientError ? err.message : "Publish failed");
    },
  });

  // Publish always saves the latest edits first, then publishes that revision.
  const publish = useCallback(
    async (note?: string) => {
      const ok = await saveDraft();
      if (!ok) return;
      publishMutation.mutate(note);
    },
    // publishMutation identity is stable per react-query
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [saveDraft],
  );

  const dirty = saveState === "dirty" || saveState === "offline";

  return {
    page: pageQuery.data,
    pageLoading: pageQuery.isLoading,
    manifest: manifestQuery.data,
    themeCss: manifestQuery.data?.themeCss,
    fontClass: manifestQuery.data?.fontClass,
    sections,
    setSections,
    selectedId,
    setSelectedId,
    saveState,
    dirty,
    blockers,
    undo,
    redo,
    canUndo: history.current.past.length > 0,
    canRedo: history.current.future.length > 0,
    saveDraft,
    publish,
    publishing: publishMutation.isPending,
  };
};
