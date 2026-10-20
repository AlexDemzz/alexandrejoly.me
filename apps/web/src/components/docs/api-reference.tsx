import { Code } from "@portfolio/ui/components/code";
import { Heading } from "@portfolio/ui/components/heading";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@portfolio/ui/components/item";
import { Text } from "@portfolio/ui/components/text";

import { InlineCode } from "@/components/docs/inline-code";
import type { ApiPart, ApiProp } from "@/components/docs/registry-docs";

const PropRow = ({ prop }: { prop: ApiProp }) => (
  <li>
    <Item>
      <ItemContent>
        <ItemTitle>
          <Code>{prop.name}</Code>
        </ItemTitle>
        <ItemDescription>
          <Code variant="muted">{prop.type}</Code>
        </ItemDescription>
        <ItemDescription>
          <InlineCode>{prop.description}</InlineCode>
          {prop.default === undefined ? null : (
            <>
              {" "}
              Defaults to <Code>{prop.default}</Code>.
            </>
          )}
        </ItemDescription>
      </ItemContent>
      <ItemSeparator />
    </Item>
  </li>
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
          <ItemGroup>
            {part.props.map((prop) => (
              <PropRow key={prop.name} prop={prop} />
            ))}
          </ItemGroup>
        )}
      </section>
    ))}
  </div>
);
