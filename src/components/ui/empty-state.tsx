import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 sm:p-12 text-center bg-muted/20">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
        {icon || <FolderOpen className="h-6 w-6" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      {(actionLabel && (onAction || actionHref)) && (
        <div className="mt-6">
          {actionHref ? (
            <Button asChild size="sm">
              <a href={actionHref}>{actionLabel}</a>
            </Button>
          ) : (
            <Button onClick={onAction} size="sm">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
