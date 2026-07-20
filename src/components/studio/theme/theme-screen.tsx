"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Lightning, Plus, Trash } from "@phosphor-icons/react";
import { api, ApiClientError } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import ConfirmDialog from "@/components/studio/shared/confirm-dialog";
import ThemeSwitcher from "@/components/studio/theme/theme-switcher";
import ThemeNameDialog from "@/components/studio/theme/theme-name-dialog";
import SaveBar from "@/components/studio/theme/save-bar";
import ColorsTab from "@/components/studio/theme/colors-tab";
import TypographyTab from "@/components/studio/theme/typography-tab";
import LayoutTab from "@/components/studio/theme/layout-tab";
import ButtonsTab from "@/components/studio/theme/buttons-tab";
import PreviewPane from "@/components/studio/theme/preview-pane";
import { cloneTokens, tokensEqual, type ThemeListResponse, type ThemeRow } from "@/components/studio/theme/theme-lib";
import type { ThemeTokens } from "@/types";

const ThemeScreen = () => {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ThemeTokens | null>(null);
  // Which theme the current draft belongs to, so switching themes resets it.
  const [draftFor, setDraftFor] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["theme"],
    queryFn: () => api.get<ThemeListResponse>("/api/studio/theme"),
  });

  const themes = data?.themes ?? [];
  const selected = themes.find((theme) => theme.id === selectedId) ?? null;

  // Default the selection to the active theme (or the first one) once loaded.
  useEffect(() => {
    if (!data || selectedId) return;
    const initial = data.themes.find((theme) => theme.active) ?? data.themes[0];
    if (initial) setSelectedId(initial.id);
  }, [data, selectedId]);

  useEffect(() => {
    if (selected && draftFor !== selected.id) {
      setDraft(cloneTokens(selected.tokens));
      setDraftFor(selected.id);
    }
  }, [selected, draftFor]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["theme"] });
  const fail = (err: unknown, fallback: string) =>
    toast.error(err instanceof ApiClientError ? err.message : fallback);

  const saveMutation = useMutation({
    mutationFn: () => api.patch<ThemeRow>(`/api/studio/theme/${selectedId}`, { tokens: draft }),
    onSuccess: () => {
      toast.success(selected?.active ? "Theme saved, the live site is updated" : "Theme saved");
      invalidate();
    },
    onError: (err) => fail(err, "Save failed"),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; tokens: ThemeTokens }) => api.post<ThemeRow>("/api/studio/theme", payload),
    onSuccess: (theme) => {
      toast.success(`Theme "${theme.name}" created`);
      invalidate();
      setSelectedId(theme.id);
      setNewOpen(false);
    },
    onError: (err) => fail(err, "Could not create the theme"),
  });

  const duplicateMutation = useMutation({
    mutationFn: () =>
      api.post<ThemeRow>("/api/studio/theme", { name: `${selected?.name} copy`, tokens: selected?.tokens }),
    onSuccess: (theme) => {
      toast.success(`Duplicated as "${theme.name}"`);
      invalidate();
      setSelectedId(theme.id);
    },
    onError: (err) => fail(err, "Duplicate failed"),
  });

  const activateMutation = useMutation({
    mutationFn: () => api.post(`/api/studio/theme/${selectedId}/activate`),
    onSuccess: () => {
      toast.success(`"${selected?.name}" is now live`);
      invalidate();
    },
    onError: (err) => fail(err, "Activate failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.del(`/api/studio/theme/${selectedId}`),
    onSuccess: () => {
      toast.success(`Theme "${selected?.name}" deleted`);
      invalidate();
      const fallback = themes.find((theme) => theme.id !== selectedId);
      setSelectedId(fallback?.id ?? null);
    },
    onError: (err) => fail(err, "Delete failed"),
  });

  const dirty = selected !== null && draft !== null && draftFor === selected.id && !tokensEqual(draft, selected.tokens);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="text-muted" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-2 border-b border-hairline bg-surface px-4 py-3">
          <ThemeSwitcher themes={themes} selectedId={selectedId} onSelect={setSelectedId} />
          <div className="ml-auto flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled={!selected || duplicateMutation.isPending} onClick={() => duplicateMutation.mutate()}>
              <Copy size={14} className="mr-1.5" />
              Duplicate
            </Button>
            {selected && !selected.active ? (
              <Button variant="secondary" size="sm" onClick={() => setActivateOpen(true)}>
                <Lightning size={14} className="mr-1.5" />
                Activate
              </Button>
            ) : null}
            <Button variant="destructive" size="sm" disabled={!selected} onClick={() => setDeleteOpen(true)}>
              <Trash size={14} className="mr-1.5" />
              Delete
            </Button>
            <Button size="sm" onClick={() => setNewOpen(true)}>
              <Plus size={14} className="mr-1.5" />
              New theme
            </Button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {selected && draft && draftFor === selected.id ? (
            <Tabs defaultValue="colors">
              <TabsList>
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="typography">Typography</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="buttons">Buttons</TabsTrigger>
              </TabsList>
              <TabsContent value="colors" className="mt-4">
                <ColorsTab tokens={draft} onChange={setDraft} />
              </TabsContent>
              <TabsContent value="typography" className="mt-4">
                <TypographyTab tokens={draft} onChange={setDraft} />
              </TabsContent>
              <TabsContent value="layout" className="mt-4">
                <LayoutTab tokens={draft} onChange={setDraft} />
              </TabsContent>
              <TabsContent value="buttons" className="mt-4">
                <ButtonsTab tokens={draft} onChange={setDraft} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="mx-auto mt-16 max-w-sm rounded-xl border border-dashed border-hairline py-12 text-center">
              <p className="text-sm font-medium text-ink">No theme selected</p>
              <p className="mt-1 text-sm text-muted">Create a theme from the defaults to start styling the site.</p>
              <Button className="mt-4" size="sm" onClick={() => setNewOpen(true)}>
                <Plus size={14} className="mr-1.5" />
                New theme
              </Button>
            </div>
          )}
        </div>

        <SaveBar
          visible={dirty}
          isActiveTheme={selected?.active ?? false}
          saving={saveMutation.isPending}
          onDiscard={() => selected && setDraft(cloneTokens(selected.tokens))}
          onSave={() => saveMutation.mutate()}
        />
      </div>

      <PreviewPane />

      <ThemeNameDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        title="New theme"
        description="Starts from the default token set. Nothing goes live until you activate it."
        submitLabel="Create theme"
        pending={createMutation.isPending}
        onSubmit={(name) => data && createMutation.mutate({ name, tokens: data.defaultTokens })}
      />
      <ConfirmDialog
        open={activateOpen}
        onOpenChange={setActivateOpen}
        title={`Activate "${selected?.name}"?`}
        description="The whole site repaints with this theme instantly for every visitor."
        confirmLabel="Activate theme"
        onConfirm={() => {
          activateMutation.mutate();
          setActivateOpen(false);
        }}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete theme "${selected?.name}"?`}
        description={
          selected?.active
            ? "This theme is active. Activate another theme first, the API refuses to delete the live theme."
            : "The theme and its tokens are removed permanently. This cannot be undone."
        }
        confirmLabel="Delete theme"
        onConfirm={() => {
          deleteMutation.mutate();
          setDeleteOpen(false);
        }}
      />
    </div>
  );
};

export default ThemeScreen;
