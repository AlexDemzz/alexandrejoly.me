import { Link } from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";
import { useId, useState } from "react";
import type { ReactNode } from "react";

import { COMPONENT_ICONS } from "@/components/component-icons";
import { FormulaIcon } from "@/components/formula-icon";
import { Formula1Icon } from "@/components/formula1-icon";
import {
  ItemLight,
  ItemLightActions,
  ItemLightContent,
  ItemLightDescription,
  ItemLightMedia,
  ItemLightTitle,
} from "@/components/item-light";
import { LabIcon } from "@/components/lab-icon";
import { SkillIcon } from "@/components/skill-icon";
import {
  ASCII_PAGE,
  FORMULA_PAGE,
  FORMULA1_PAGE,
  SKILLS,
  skillHref,
} from "@/content";
import { REGISTRY_ITEMS } from "@/lib/registry";
import { isSkillPageName } from "@/skill-pages";

export const RowList = ({ children }: { children: ReactNode }) => (
  <ul className="flex flex-col">{children}</ul>
);

/** Shows the first `limit` rows with a "See more" button for the rest. */
export const ExpandableRowList = ({
  children,
  limit,
}: {
  children: ReactNode[];
  limit: number;
}) => {
  const id = useId();
  const [expanded, setExpanded] = useState(false);

  if (children.length <= limit) {
    return <RowList>{children}</RowList>;
  }

  // The hidden rows are left out, not `hidden`: the row rules key off `:last-child`.
  return (
    <div className="flex flex-col items-start gap-3.5">
      <ul className="flex w-full flex-col" id={id}>
        {expanded ? children : children.slice(0, limit)}
      </ul>
      <button
        aria-controls={id}
        aria-expanded={expanded}
        data-slot="row-list-more"
        onClick={() => setExpanded(!expanded)}
        type="button"
      >
        {expanded ? "See less" : "See more"}
      </button>
    </div>
  );
};

interface ExternalRowProps {
  aside?: ReactNode;
  description: string;
  href: string;
  media?: ReactNode;
  title: string;
}

export const ExternalRow = ({
  aside,
  description,
  href,
  media,
  title,
}: ExternalRowProps) => (
  <li>
    <ItemLight
      // oxlint-disable-next-line jsx-a11y/control-has-associated-label -- ItemLight renders its children into the anchor
      render={<a href={href} rel="noreferrer" target="_blank" />}
    >
      {media}
      <ItemLightContent>
        <ItemLightTitle>{title}</ItemLightTitle>
        <ItemLightDescription>{description}</ItemLightDescription>
      </ItemLightContent>
      {aside === undefined ? null : (
        <ItemLightActions>{aside}</ItemLightActions>
      )}
    </ItemLight>
  </li>
);

interface PageRowProps {
  description: string;
  media?: ReactNode;
  title: string;
  to: LinkProps["to"];
}

/** A row that opens one of the site's own pages. */
export const PageRow = ({ description, media, title, to }: PageRowProps) => (
  <li>
    <ItemLight render={(props) => <Link {...props} to={to} />}>
      {media}
      <ItemLightContent>
        <ItemLightTitle>{title}</ItemLightTitle>
        <ItemLightDescription>{description}</ItemLightDescription>
      </ItemLightContent>
    </ItemLight>
  </li>
);

interface ComponentRowProps {
  description: string;
  media?: ReactNode;
  name: string;
  title: string;
}

export const ComponentRow = ({
  description,
  media,
  name,
  title,
}: ComponentRowProps) => (
  <li>
    <ItemLight
      render={(props) => (
        <Link {...props} params={{ name }} to="/components/$name" />
      )}
    >
      {media}
      <ItemLightContent>
        <ItemLightTitle>{title}</ItemLightTitle>
        <ItemLightDescription>{description}</ItemLightDescription>
      </ItemLightContent>
    </ItemLight>
  </li>
);

export const SkillPageRow = ({
  description,
  media,
  name,
}: {
  description: string;
  media?: ReactNode;
  name: string;
}) => (
  <li>
    <ItemLight
      render={(props) => (
        <Link {...props} params={{ name }} to="/skills/$name" />
      )}
    >
      {media}
      <ItemLightContent>
        <ItemLightTitle>{name}</ItemLightTitle>
        <ItemLightDescription>{description}</ItemLightDescription>
      </ItemLightContent>
    </ItemLight>
  </li>
);

/** One row per registry item, linking to its docs page. */
export const ComponentRows = () => (
  <RowList>
    {REGISTRY_ITEMS.map((component) => {
      const Icon = COMPONENT_ICONS[component.name];
      return (
        <ComponentRow
          description={component.description}
          key={component.name}
          media={
            <ItemLightMedia>
              <Icon />
            </ItemLightMedia>
          }
          name={component.name}
          title={component.title}
        />
      );
    })}
  </RowList>
);

/** One row per agent skill: its page here when it has one, else skills.sh. */
export const SkillRows = () => (
  <RowList>
    {SKILLS.map((skill) => {
      const media = (
        <ItemLightMedia>
          <SkillIcon />
        </ItemLightMedia>
      );
      return isSkillPageName(skill.name) ? (
        <SkillPageRow
          description={skill.description}
          key={skill.name}
          media={media}
          name={skill.name}
        />
      ) : (
        <ExternalRow
          description={skill.description}
          href={skillHref(skill.name)}
          key={skill.name}
          media={media}
          title={skill.name}
        />
      );
    })}
  </RowList>
);

/** One row per lab experiment. */
export const LabRows = () => (
  <RowList>
    <PageRow
      description={ASCII_PAGE.rowDescription}
      media={
        <ItemLightMedia>
          <LabIcon />
        </ItemLightMedia>
      }
      title={ASCII_PAGE.title}
      to="/lab/ascii"
    />
    <PageRow
      description={FORMULA_PAGE.rowDescription}
      media={
        <ItemLightMedia>
          <FormulaIcon />
        </ItemLightMedia>
      }
      title={FORMULA_PAGE.title}
      to="/lab/formula-2030"
    />
    <PageRow
      description={FORMULA1_PAGE.rowDescription}
      media={
        <ItemLightMedia>
          <Formula1Icon />
        </ItemLightMedia>
      }
      title={FORMULA1_PAGE.title}
      to="/lab/formula-1"
    />
  </RowList>
);
