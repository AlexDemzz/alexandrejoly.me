import { TextLink, textVariants } from "@portfolio/ui/components/text";

import { ScoreGauge } from "@/components/score-gauge";
import { AUDITS } from "@/content";

export const AuditScores = () => (
  <ul
    aria-label="Audit scores"
    className={textVariants({
      className: "mt-3 flex flex-wrap items-center gap-x-4 gap-y-1",
      variant: "faint",
    })}
  >
    {AUDITS.map(({ href, name, scores }) => {
      const values = scores.map(({ value }) => value);
      const uniform = values.every((value) => value === values[0]);
      const detail = scores
        .map(({ label, value }) => `${label} ${value}`)
        .join(", ");
      return (
        <li className="flex items-center gap-1.5" key={name}>
          <ScoreGauge values={values} />
          <span aria-hidden>
            {uniform && values.length > 1
              ? `${values[0]} ×${values.length}`
              : values.join(" · ")}
          </span>
          <TextLink external href={href} title={detail}>
            {name}
            <span className="sr-only">: {detail}</span>
          </TextLink>
        </li>
      );
    })}
  </ul>
);
