import type { ReactNode } from "react";
import { AppFooter, AppHeader } from "@/components/AppHeader";

export function PageShell({
  title,
  description,
  children,
  fullViewport = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  fullViewport?: boolean;
}) {
  return (
    <div
      className={
        fullViewport
          ? "flex h-[var(--chat-viewport-height,100dvh)] min-h-0 flex-col overflow-hidden bg-background"
          : "flex min-h-screen flex-col bg-background"
      }
    >
      <AppHeader />
      <main
        className={
          fullViewport
            ? "mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-4 py-3"
            : "mx-auto w-full max-w-6xl flex-1 px-4 py-8"
        }
      >
        <div className={fullViewport ? "mb-3 shrink-0" : "mb-6"}>
          <h1 className={fullViewport ? "text-xl font-bold sm:text-2xl" : "text-2xl font-bold tracking-tight sm:text-3xl"}>
            {title}
          </h1>
          {description && (
            <p className={fullViewport ? "mt-1 line-clamp-1 text-sm text-muted-foreground" : "mt-2 max-w-2xl text-muted-foreground"}>
              {description}
            </p>
          )}
        </div>
        {children}
      </main>
      {!fullViewport && <AppFooter />}
    </div>
  );
}
