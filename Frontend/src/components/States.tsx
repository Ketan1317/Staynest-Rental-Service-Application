export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-ash">
      <div className="size-8 border-2 border-brass/30 border-t-brass rounded-full animate-spin" />
      {label && <p className="text-xs uppercase tracking-[0.2em]">{label}</p>}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <div className="font-serif text-3xl text-paper mb-3">{title}</div>
      {description && <p className="text-ash max-w-md font-light">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="my-10 mx-auto max-w-xl border border-destructive/30 bg-destructive/10 text-destructive-foreground p-5 rounded-sm">
      <p className="text-sm">{message}</p>
    </div>
  );
}
