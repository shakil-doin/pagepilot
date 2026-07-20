"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/services/api";

// Each settings tab loads and saves one settings key as a free-form object.
export const useSettingForm = <T extends object>(key: string, defaults: T) => {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<T>(defaults);
  const [dirty, setDirty] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["setting", key],
    queryFn: () => api.get<T | null>(`/api/studio/settings/${key}`),
  });

  useEffect(() => {
    if (data) {
      setValues((current) => ({ ...current, ...data }));
      setDirty(false);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => api.put(`/api/studio/settings/${key}`, values),
    onSuccess: () => {
      setDirty(false);
      toast.success("Settings saved");
      queryClient.invalidateQueries({ queryKey: ["setting", key] });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Save failed"),
  });

  const setFields = (patch: Partial<T>) => {
    setValues((current) => ({ ...current, ...patch }));
    setDirty(true);
  };

  return {
    values,
    setFields,
    dirty,
    isLoading,
    saving: saveMutation.isPending,
    save: () => saveMutation.mutate(),
  };
};
