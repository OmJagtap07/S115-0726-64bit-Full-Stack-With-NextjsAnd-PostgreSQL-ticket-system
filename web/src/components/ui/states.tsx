import React from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';

export function LoadingState({ message = "Loading data..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm font-medium">{message}</p>
    </div>
  );
}

export function EmptyState({
  title = "No data found",
  description = "There is currently no data to display.",
  actionLabel,
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-xl bg-background/50 min-h-[300px]">
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <Inbox className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong!",
  description = "Unable to load data. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="border-destructive/50 bg-destructive/5 max-w-md mx-auto my-8">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="bg-destructive/10 p-3 rounded-full">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        {onRetry && (
          <Button variant="destructive" onClick={onRetry} className="mt-4">
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
