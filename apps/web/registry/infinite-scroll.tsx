"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import {
  createContext,
  use,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface InfiniteScrollContextValue {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
  reverse: boolean;
}

const InfiniteScrollContext = createContext<InfiniteScrollContextValue | null>(
  null
);

function useInfiniteScroll() {
  const context = use(InfiniteScrollContext);
  if (!context) {
    throw new Error(
      "InfiniteScroll compound components must be used within <InfiniteScroll>"
    );
  }
  return context;
}

interface InfiniteScrollProps {
  children?: React.ReactNode;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
  reverse?: boolean;
}

function InfiniteScroll({
  onFetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  reverse = false,
  children,
}: InfiniteScrollProps) {
  const context = useMemo(
    () => ({ hasNextPage, isFetchingNextPage, onFetchNextPage, reverse }),
    [hasNextPage, isFetchingNextPage, onFetchNextPage, reverse]
  );

  return (
    <InfiniteScrollContext value={context}>{children}</InfiniteScrollContext>
  );
}

function InfiniteScrollViewport({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { reverse } = useInfiniteScroll();

  return (
    <div
      className={cn(
        "overflow-y-auto",
        reverse && "flex flex-col-reverse",
        className
      )}
      data-slot="infinite-scroll-viewport"
      {...props}
    />
  );
}

function InfiniteScrollContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { isFetchingNextPage, reverse } = useInfiniteScroll();

  return (
    <div
      aria-busy={isFetchingNextPage}
      className={cn("flex flex-col gap-4", reverse && "shrink-0", className)}
      data-slot="infinite-scroll-content"
      {...props}
    />
  );
}

function InfiniteScrollSentinel({
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const { onFetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteScroll();

  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);
  const fetchNextPage = useEffectEvent(onFetchNextPage);

  useEffect(() => {
    if (!(sentinel && hasNextPage) || isFetchingNextPage) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, hasNextPage, isFetchingNextPage]);

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        children: isFetchingNextPage && (
          <div className="flex items-center justify-center overflow-clip">
            <Spinner />
          </div>
        ),
        className: "[overflow-anchor:none]",
        ref: setSentinel,
      },
      props
    ),
    render,
    state: {
      hasNextPage,
      isFetchingNextPage,
      slot: "infinite-scroll-sentinel",
    },
  });
}

export {
  InfiniteScroll,
  InfiniteScrollContent,
  InfiniteScrollSentinel,
  InfiniteScrollViewport,
};
