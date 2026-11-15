import type { ReactNode } from "react";

/** A titled group of rows, rendered as a bordered card. */
export function SettingsGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-1 text-base font-normal text-foreground">{title}</h2>
      {description && (
        <p className="mb-3 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="divide-y divide-border/40 rounded-xl border border-border/40">
        {children}
      </div>
    </section>
  );
}

/** One label + control row inside a SettingsGroup. */
export function SettingsRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm text-foreground">{label}</div>
        {description && (
          <div className="mt-0.5 text-xs text-muted-foreground">
            {description}
          </div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
