import type { RegistryItemName } from "@/lib/registry";

/**
 * The usage snippet of each docs page. Plain strings, apart from the JSX in
 * `registry-docs.tsx`, so the build can highlight them in Node.
 */
export const REGISTRY_USAGE: Record<RegistryItemName, string> = {
  hint: `import { Hint, HintContent, HintTrigger } from "@/components/ui/hint";

<Hint>
  <HintTrigger>
    Label
    <CircleHelpIcon />
  </HintTrigger>
  <HintContent>A short explanation of the label.</HintContent>
</Hint>`,
  "infinite-scroll": `import {
  InfiniteScroll,
  InfiniteScrollSentinel,
} from "@/components/ui/infinite-scroll";

<InfiniteScroll
  hasNextPage={hasNextPage}
  isFetchingNextPage={isFetchingNextPage}
  onFetchNextPage={() => fetchNextPage()}
>
  {items.map((item) => (
    <Row key={item.id} {...item} />
  ))}
  <InfiniteScrollSentinel />
</InfiniteScroll>`,
  "item-inset-separator": `import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { ItemInsetSeparator } from "@/components/ui/item-inset-separator";

<div className="flex flex-col">
  {projects.map((project, index) => (
    <Item key={project.id}>
      <ItemMedia variant="icon">
        <FolderIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{project.name}</ItemTitle>
        <ItemDescription>{project.description}</ItemDescription>
      </ItemContent>
      {index < projects.length - 1 && <ItemInsetSeparator />}
    </Item>
  ))}
</div>`,
  marquee: `import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@/components/ui/marquee";

<Marquee>
  <MarqueeFade side="left" />
  <MarqueeContent>
    <MarqueeItem>Item 1</MarqueeItem>
    <MarqueeItem>Item 2</MarqueeItem>
  </MarqueeContent>
  <MarqueeFade side="right" />
</Marquee>`,
  "notification-badge": `import {
  NotificationBadge,
  NotificationBadgeContent,
  NotificationBadgeIndicator,
} from "@/components/ui/notification-badge";

<NotificationBadge count={3}>
  <NotificationBadgeContent>
    <Button aria-label="Notifications" size="icon" variant="outline">
      <BellIcon />
    </Button>
  </NotificationBadgeContent>
  <NotificationBadgeIndicator />
</NotificationBadge>`,
  onboarding: `import {
  Onboarding,
  OnboardingContent,
  OnboardingDescription,
  OnboardingFooter,
  OnboardingHeader,
  OnboardingIndicator,
  OnboardingNav,
  OnboardingNextButton,
  OnboardingPrevButton,
  OnboardingStep,
  OnboardingTitle,
} from "@/components/ui/onboarding";

<Onboarding onComplete={() => setOpen(false)} totalSteps={2}>
  <OnboardingContent>
    <OnboardingStep value={1}>
      <OnboardingHeader>
        <OnboardingTitle>Step 1</OnboardingTitle>
        <OnboardingDescription>A short description of step 1.</OnboardingDescription>
      </OnboardingHeader>
    </OnboardingStep>
    <OnboardingStep value={2}>
      <OnboardingHeader>
        <OnboardingTitle>Step 2</OnboardingTitle>
        <OnboardingDescription>A short description of step 2.</OnboardingDescription>
      </OnboardingHeader>
    </OnboardingStep>
  </OnboardingContent>
  <OnboardingFooter>
    <OnboardingIndicator />
    <OnboardingNav>
      <OnboardingPrevButton />
      <OnboardingNextButton />
    </OnboardingNav>
  </OnboardingFooter>
</Onboarding>`,
};
