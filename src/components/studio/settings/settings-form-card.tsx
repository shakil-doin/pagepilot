"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  title: string;
  description?: string;
  isLoading: boolean;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  children: React.ReactNode;
};

// Shared chrome for every settings tab: card, loading state, and Save footer.
const SettingsFormCard = ({ title, description, isLoading, dirty, saving, onSave, children }: Props) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-sm">{title}</CardTitle>
      {description ? <p className="text-sm text-muted">{description}</p> : null}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-9 rounded-lg" />
          <Skeleton className="h-9 rounded-lg" />
          <Skeleton className="h-9 rounded-lg" />
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          {children}
          <div className="flex justify-end border-t border-hairline pt-4">
            <Button type="submit" disabled={!dirty || saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      )}
    </CardContent>
  </Card>
);

export default SettingsFormCard;
