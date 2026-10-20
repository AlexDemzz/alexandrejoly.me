import { Code } from "@portfolio/ui/components/code";
import { Heading } from "@portfolio/ui/components/heading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@portfolio/ui/components/table";
import { Text } from "@portfolio/ui/components/text";

import { InlineCode } from "@/components/docs/inline-code";
import type { ApiPart, ApiProp } from "@/components/docs/registry-docs";

const PropRow = ({ prop }: { prop: ApiProp }) => (
  <TableRow>
    <TableCell>
      <div className="flex flex-col gap-1">
        <Code>{prop.name}</Code>
        <Text>
          <InlineCode>{prop.description}</InlineCode>
        </Text>
      </div>
    </TableCell>
    <TableCell>
      <Code variant="muted">{prop.type}</Code>
    </TableCell>
    <TableCell>
      {prop.default === undefined ? (
        <Code variant="muted">-</Code>
      ) : (
        <Code>{prop.default}</Code>
      )}
    </TableCell>
  </TableRow>
);

export const ApiReference = ({ parts }: { parts: ApiPart[] }) => (
  <div className="flex flex-col gap-10">
    {parts.map((part) => (
      <section className="flex flex-col gap-2" key={part.name}>
        <Heading
          render={({ children, ...props }) => <h3 {...props}>{children}</h3>}
        >
          <Code>{part.name}</Code>
        </Heading>
        <Text>
          <InlineCode>{part.description}</InlineCode>
        </Text>
        {part.props.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Default</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {part.props.map((prop) => (
                <PropRow key={prop.name} prop={prop} />
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    ))}
  </div>
);
