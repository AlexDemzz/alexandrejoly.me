import type { RegistryItemName } from "@/lib/registry";

export interface Usage {
  imports: string;
  markup: string;
}

/**
 * The usage snippet of each docs page, imports apart from markup as in the
 * shadcn docs. Plain strings, apart from the JSX in `registry-docs.tsx`, so
 * the build can highlight them in Node.
 */
export const REGISTRY_USAGE: Record<RegistryItemName, Usage> = {
  hint: {
    imports: `import { Hint, HintContent, HintTrigger } from "@/components/ui/hint";`,
    markup: `<Hint>
  <HintTrigger>
    Label
    <CircleHelpIcon />
  </HintTrigger>
  <HintContent>A short explanation of the label.</HintContent>
</Hint>`,
  },
  "infinite-scroll": {
    imports: `import {
  InfiniteScroll,
  InfiniteScrollContent,
  InfiniteScrollSentinel,
  InfiniteScrollViewport,
} from "@/components/ui/infinite-scroll";`,
    markup: `<InfiniteScroll
  hasNextPage={hasNextPage}
  isFetchingNextPage={isFetchingNextPage}
  onFetchNextPage={() => fetchNextPage()}
>
  <InfiniteScrollViewport className="h-96">
    <InfiniteScrollContent>
      {items.map((item) => (
        <div key={item.id}>{item.title}</div>
      ))}
      <InfiniteScrollSentinel />
    </InfiniteScrollContent>
  </InfiniteScrollViewport>
</InfiniteScroll>`,
  },
  "item-inset-separator": {
    imports: `import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { ItemInsetSeparator } from "@/components/ui/item-inset-separator";`,
    markup: `<div className="flex flex-col">
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
  },
  marquee: {
    imports: `import {
  Marquee,
  MarqueeContent,
  MarqueeItem,
  MarqueePause,
  MarqueeViewport,
} from "@/components/ui/marquee";`,
    markup: `<Marquee>
  <MarqueePause />
  <MarqueeViewport>
    <MarqueeContent>
      <MarqueeItem>Item 1</MarqueeItem>
      <MarqueeItem>Item 2</MarqueeItem>
    </MarqueeContent>
  </MarqueeViewport>
</Marquee>`,
  },
  "notification-badge": {
    imports: `import {
  NotificationBadge,
  NotificationBadgeContent,
  NotificationBadgeIndicator,
} from "@/components/ui/notification-badge";`,
    markup: `<NotificationBadge value={3}>
  <NotificationBadgeContent>
    <Button aria-label="Notifications, 3 unread" size="icon" variant="outline">
      <BellIcon />
    </Button>
  </NotificationBadgeContent>
  <NotificationBadgeIndicator />
</NotificationBadge>`,
  },
  onboarding: {
    imports: `import {
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
} from "@/components/ui/onboarding";`,
    markup: `<Onboarding onComplete={() => setOpen(false)} totalSteps={2}>
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
  },
};
