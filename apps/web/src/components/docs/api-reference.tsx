import { InlineCode } from "@/components/docs/inline-code";
import type { ApiPart } from "@/components/docs/registry-docs";

export const ApiReference = ({ parts }: { parts: ApiPart[] }) => (
  <div className="flex flex-col gap-10">
    {parts.map((part) => (
      <section className="flex flex-col gap-2" key={part.name}>
        <h3 className="font-book font-mono">{part.name}</h3>
        <p className="text-muted-foreground text-pretty">
          <InlineCode>{part.description}</InlineCode>
        </p>
        {part.props.length > 0 && (
          <dl className="flex flex-col">
            {part.props.map((prop) => (
              <div
                className="flex flex-col gap-1 border-b py-3 last:border-b-0"
                key={prop.name}
              >
                <dt className="flex flex-wrap items-baseline gap-x-3">
                  <code className="font-mono text-sm wrap-anywhere">
                    {prop.name}
                  </code>
                  <code className="text-muted-foreground font-mono text-sm wrap-anywhere">
                    {prop.type}
                  </code>
                </dt>
                <dd className="text-muted-foreground text-pretty">
                  <InlineCode>{prop.description}</InlineCode>
                  {prop.default === undefined ? null : (
                    <>
                      {" "}
                      Defaults to{" "}
                      <code className="text-foreground font-mono text-sm wrap-anywhere">
                        {prop.default}
                      </code>
                      .
                    </>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    ))}
  </div>
);
