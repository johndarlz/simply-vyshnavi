import { StoreShell } from "./StoreShell";

export type PolicySection = {
  heading: string;
  paragraphs: string[];
};

export function PolicyPage({
  title,
  intro,
  sections,
  lastUpdated,
}: {
  title: string;
  intro?: string;
  sections: PolicySection[];
  lastUpdated?: string;
}) {
  return (
    <StoreShell>
      <article className="mx-auto max-w-3xl px-4 py-12 md:py-20">
        <h1 className="font-display text-4xl">{title}</h1>
        {lastUpdated ? (
          <p className="mt-2 text-xs tracking-luxe text-muted-foreground">Last updated: {lastUpdated}</p>
        ) : null}
        {intro ? <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{intro}</p> : null}
        <div className="mt-8 space-y-8">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="font-display text-xl">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {section.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </StoreShell>
  );
}
