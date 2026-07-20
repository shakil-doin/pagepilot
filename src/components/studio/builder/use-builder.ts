"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/services/api";
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
};

const HISTORY_LIMIT = 50;

// Owns the section tree, autosave (debounced 800 ms), undo/redo history and
// publish flow for one page.
export const useBuilder = (pageId: string) => {
  const [sections, setSectionsRaw] = useState<SectionNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [blockers, setBlockers] = useState<PublishBlocker[]>([]);
  const [canvasKey, setCanvasKey] = useState(0);

  const history = useRef<{ past: SectionNode[][]; future: SectionNode[][] }>({ past: [], future: [] });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaded = useRef(false);
  // Mirror of the current tree so history/autosave side effects run once,
  // outside the setState updater (StrictMode double-invokes updaters).
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
      commit(pageQuery.data.draft?.sections ?? []);
    }
  }, [pageQuery.data]);

  // Cancel a pending autosave when the builder unmounts (page navigation), so
  // a queued save can never fire against the wrong page.
  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    [],
  );

  const saveMutation = useMutation({
    mutationFn: (next: SectionNode[]) =>
      api.patch<{ savedAt: string; blockers: PublishBlocker[] }>(`/api/studio/pages/${pageId}/draft`, {
        sections: next,
      }),
    onSuccess: (result) => {
      setSaveState("saved");
      setBlockers(result.blockers);
      setCanvasKey((key) => key + 1);
    },
    onError: (err) => {
      setSaveState(err instanceof ApiClientError ? "dirty" : "offline");
      toast.error(err instanceof ApiClientError ? err.message : "Autosave failed. Check your connection.");
    },
  });

  const scheduleSave = useCallback(
    (next: SectionNode[]) => {
      setSaveState("saving");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => saveMutation.mutate(next), 800);
    },
    // saveMutation identity is stable per react-query
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageId],
  );

  // Side effects (history push/pop, autosave) run once here, not inside a
  // setState updater, so StrictMode's double-invoke cannot corrupt history.
  const setSections = useCallback(
    (updater: (current: SectionNode[]) => SectionNode[]) => {
      const current = sectionsRef.current;
      const next = updater(current);
      if (next === current) return;
      history.current.past = [...history.current.past.slice(-HISTORY_LIMIT + 1), current];
      history.current.future = [];
      commit(next);
      scheduleSave(next);
    },
    [commit, scheduleSave],
  );

  const undo = useCallback(() => {
    const previous = history.current.past.pop();
    if (!previous) return;
    history.current.future.push(sectionsRef.current);
    commit(previous);
    scheduleSave(previous);
  }, [commit, scheduleSave]);

  const redo = useCallback(() => {
    const next = history.current.future.pop();
    if (!next) return;
    history.current.past.push(sectionsRef.current);
    commit(next);
    scheduleSave(next);
  }, [commit, scheduleSave]);

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

  return {
    page: pageQuery.data,
    pageLoading: pageQuery.isLoading,
    manifest: manifestQuery.data,
    sections,
    setSections,
    selectedId,
    setSelectedId,
    saveState,
    blockers,
    undo,
    redo,
    canUndo: history.current.past.length > 0,
    canRedo: history.current.future.length > 0,
    publish: publishMutation.mutate,
    publishing: publishMutation.isPending,
    canvasKey,
  };
};
