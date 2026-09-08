import { StoreShell } from "./StoreShell";

export function PolicyPage({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  return (
    <StoreShell>
      <div className="mx-auto max-w-2xl px-4 py-12 md:py-20">
        <h1 className="font-display text-4xl">{title}</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </StoreShell>
  );
}
