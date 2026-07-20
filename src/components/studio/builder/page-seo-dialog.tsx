"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SeoPanel, { type SeoFormValue, type SeoPanelValue } from "@/components/studio/seo/seo-panel";

type Props = {
  pageId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: SeoPanelValue | null;
  pageTitle?: string;
  pagePath?: string;
};

const PageSeoDialog = ({ pageId, open, onOpenChange, initial, pageTitle = "", pagePath = "" }: Props) => {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (seo: SeoFormValue) => api.put(`/api/studio/pages/${pageId}/seo`, seo),
    onSuccess: () => {
      toast.success("SEO saved");
      queryClient.invalidateQueries({ queryKey: ["page", pageId] });
      onOpenChange(false);
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Could not save SEO"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Page SEO</DialogTitle>
        </DialogHeader>
        <SeoPanel
          value={initial}
          onSave={(seo) => saveMutation.mutateAsync(seo)}
          titleFallback={pageTitle}
          urlPath={pagePath}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PageSeoDialog;
