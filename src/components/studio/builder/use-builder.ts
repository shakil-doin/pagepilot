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
// Short enough that the canvas (which only reflects saved state) feels live,
// long enough to coalesce a burst of keystrokes into one write. Discrete edits
// (picking media, toggling a switch) bypass this and flush immediately.
const AUTOSAVE_DEBOUNCE_MS = 400;

// Owns the section tree, undo/redo history, autosave and publish flow for one
// page.
//
// Editing is local and instant. The canvas is an iframe of the real draft-mode
// render, so it reflects a change once that change reaches the database — the
// draft is the shared source both the editor and the render read. This works on
// serverless (Vercel): there is no server-memory shortcut that would desync
// across lambda invocations. Autosave is debounced; Save draft forces it now.
export const useBuilder = (pageId: string) => {
  const [sections, setSectionsRaw] = useState<SectionNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [blockers, setBlockers] = useState<PublishBlocker[]>([]);
  const [canvasKey, setCanvasKey] = useState(0);

  const history = useRef<{ past: SectionNode[][]; future: SectionNode[][] }>({ past: [], future: [] });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Serializes saves: one PATCH in flight at a time, each saving the LATEST
  // tree. Without this, overlapping requests on a slow DB can land out of order
  // and resurrect stale sections — the desync that leaves a clicked widget
  // missing from the inspector.
  const saveChain = useRef<Promise<void>>(Promise.resolve());
  const lastSaved = useRef<SectionNode[] | null>(null);
  const saveOk = useRef(true);
  const loaded = useRef(false);
  // Mirror of the current tree so history/autosave side effects run once,
  // outside the setState updater (StrictMode double-invokes updaters).
  const sectionsRef = useRef<SectionNode[]>([]);
  // Whether the DB is behind the current edits — read at unmount for the flush.
  const dirtyRef = useRef(false);
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
  }, [pageQuery.data, commit]);

  useEffect(() => {
    dirtyRef.current = saveState === "dirty" || saveState === "offline";
  }, [saveState]);

  const saveMutation = useMutation({
    mutationFn: (next: SectionNode[]) =>
      api.patch<{ savedAt: string; blockers: PublishBlocker[] }>(`/api/studio/pages/${pageId}/draft`, {
        sections: next,
      }),
  });

  // Chain each save after the previous one so exactly one request is in flight,
  // and each saves whatever is current at its turn — the DB always converges to
  // the latest local tree, in order.
  const flushSave = useCallback(
    (): Promise<void> => {
      saveChain.current = saveChain.current.then(async () => {
        const snapshot = sectionsRef.current;
        if (snapshot === lastSaved.current) return; // nothing changed since last save
        setSaveState("saving");
        try {
          const result = await saveMutation.mutateAsync(snapshot);
          lastSaved.current = snapshot;
          saveOk.current = true;
          setBlockers(result.blockers);
          setCanvasKey((key) => key + 1); // reload the canvas from the freshly-saved draft
          if (sectionsRef.current === snapshot) setSaveState("saved");
        } catch (err) {
          saveOk.current = false;
          setSaveState(err instanceof ApiClientError ? "dirty" : "offline");
          toast.error(err instanceof ApiClientError ? err.message : "Autosave failed. Check your connection.");
        }
      });
      return saveChain.current;
    },
    // saveMutation identity is stable per react-query
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageId],
  );

  const scheduleSave = useCallback(() => {
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void flushSave(), AUTOSAVE_DEBOUNCE_MS);
  }, [flushSave]);

  // Force an immediate save (Save draft button / ⌘S), cancelling the debounce.
  const saveDraft = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    void flushSave();
  }, [flushSave]);

  // Side effects (history push, autosave) run once here, not inside a setState
  // updater, so StrictMode's double-invoke cannot corrupt history.
  const setSections = useCallback(
    (updater: (current: SectionNode[]) => SectionNode[]) => {
      const current = sectionsRef.current;
      const next = updater(current);
      if (next === current) return;
      history.current.past = [...history.current.past.slice(-HISTORY_LIMIT + 1), current];
      history.current.future = [];
      commit(next);
      scheduleSave();
    },
    [commit, scheduleSave],
  );

  const undo = useCallback(() => {
    const previous = history.current.past.pop();
    if (!previous) return;
    history.current.future.push(sectionsRef.current);
    commit(previous);
    scheduleSave();
  }, [commit, scheduleSave]);

  const redo = useCallback(() => {
    const next = history.current.future.pop();
    if (!next) return;
    history.current.past.push(sectionsRef.current);
    commit(next);
    scheduleSave();
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

  // Publish reads the saved draft, so flush the current edits to the DB first
  // (through the same serialized chain) and only publish if that succeeded.
  const publish = useCallback(
    async (note?: string) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      await flushSave();
      if (!saveOk.current) return; // save didn't converge; don't publish stale content
      publishMutation.mutate(note);
    },
    // publishMutation identity is stable per react-query
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flushSave],
  );

  // On unmount (navigating away): cancel the pending save and, if edits are
  // still unsaved, flush them. keepalive lets the request finish as the builder
  // tears down, so leaving never silently loses work.
  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (dirtyRef.current) {
        fetch(`/api/studio/pages/${pageId}/draft`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sections: sectionsRef.current }),
          keepalive: true,
        }).catch(() => undefined);
      }
    },
    [pageId],
  );

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
    saveDraft,
    publish,
    publishing: publishMutation.isPending,
    canvasKey,
  };
};
