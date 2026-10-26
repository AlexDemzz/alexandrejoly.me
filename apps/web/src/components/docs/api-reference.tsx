import { Code } from "@portfolio/ui/components/code";
import { Heading } from "@portfolio/ui/components/heading";
import { Panel, PanelHeader } from "@portfolio/ui/components/panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowHeader,
} from "@portfolio/ui/components/table";
import { Text, TextLink } from "@portfolio/ui/components/text";
import { Fragment } from "react";

import { HeadingAnchor } from "@/components/docs/heading-anchor";
import { InlineCode } from "@/components/docs/inline-code";
import type {
  ApiExtends,
  ApiPart,
  ApiProp,
} from "@/components/docs/registry-docs";
import { withOffsets } from "@/lib/text-offsets";

const GENERIC_OPEN = "<";

/** Lets a long generic such as `Dispatch<SetStateAction<number>>` wrap after each `<`. */
const BreakableType = ({ type }: { type: string }) =>
  withOffsets(
    type.split(GENERIC_OPEN),
    (part) => part.length,
    GENERIC_OPEN.length
  ).map(({ offset, part }) => (
    <Fragment key={offset}>
      {part}
      {offset + part.length < type.length && (
        <>
          {GENERIC_OPEN}
          <wbr />
        </>
      )}
    </Fragment>
  ));

const NoDefault = () => (
  <Code variant="muted">
    <span aria-hidden>—</span>
    <span className="sr-only">None</span>
  </Code>
);

/** Names what the part spreads its props onto, as shadcn's docs link Base UI. */
const ExtendsLine = ({ extends: target }: { extends: ApiExtends }) => (
  <Text>
    Takes every prop of{" "}
    {target.href ? (
      <TextLink external href={target.href}>
        {target.name}
      </TextLink>
    ) : (
      <Code>{target.name}</Code>
    )}
    .
  </Text>
);

const PropRow = ({
  prop,
  showDefault,
}: {
  prop: ApiProp;
  showDefault: boolean;
}) => (
  <TableRow>
    <TableRowHeader>
      <div className="flex flex-col gap-1">
        <Code>{prop.name}</Code>
        <Text>
          <InlineCode>{prop.description}</InlineCode>
        </Text>
        {showDefault && prop.default !== undefined && (
          <Text className="sm:hidden">
            Default: <Code wrap="token">{prop.default}</Code>
          </Text>
        )}
      </div>
    </TableRowHeader>
    <TableCell>
      <Code variant="muted" wrap="token">
        <BreakableType type={prop.type} />
      </Code>
    </TableCell>
    {showDefault && (
      <TableCell className="max-sm:hidden">
        {prop.default === undefined ? (
          <NoDefault />
        ) : (
          <Code wrap="token">{prop.default}</Code>
        )}
      </TableCell>
    )}
  </TableRow>
);

const ApiPartReference = ({
  headingId,
  part,
}: {
  headingId: string;
  part: ApiPart;
}) => {
  const showDefault = part.props.some((prop) => prop.default !== undefined);
  return (
    <Panel>
      <PanelHeader>
        <Heading
          className="scroll-mt-6"
          id={headingId}
          render={({ children, ...props }) => <h3 {...props}>{children}</h3>}
        >
          <HeadingAnchor id={headingId}>{part.name}</HeadingAnchor>
        </Heading>
        <Text>
          <InlineCode>{part.description}</InlineCode>
        </Text>
        {part.extends && <ExtendsLine extends={part.extends} />}
      </PanelHeader>
      {part.props.length > 0 && (
        <Table aria-labelledby={headingId}>
          <TableHeader>
            <TableRow>
              <TableHead>{part.nameLabel ?? "Prop"}</TableHead>
              {/* Without a Default column, Type takes its width too, so every
                  table's Type column starts on the same edge. */}
              <TableHead className={showDefault ? "w-1/3" : "w-1/3 sm:w-7/12"}>
                Type
              </TableHead>
              {showDefault && (
                <TableHead className="w-1/4 max-sm:hidden">Default</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {part.props.map((prop) => (
              <PropRow key={prop.name} prop={prop} showDefault={showDefault} />
            ))}
          </TableBody>
        </Table>
      )}
    </Panel>
  );
};

export const ApiReference = ({
  ids,
  parts,
}: {
  /** One heading id per part, in the same order. */
  ids: string[];
  parts: ApiPart[];
}) => (
  <div className="flex flex-col gap-6">
    {parts.map((part, index) => (
      <ApiPartReference headingId={ids[index]} key={part.name} part={part} />
    ))}
  </div>
);
