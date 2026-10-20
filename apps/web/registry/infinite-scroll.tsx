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

interface InfiniteScrollContextValue {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
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

interface InfiniteScrollProps extends React.ComponentProps<"div"> {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
}

/**
 * Library-agnostic: pass plain callbacks, not query objects.
 *
 * @example
 * ```tsx
 * const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(options);
 *
 * <InfiniteScroll
 *   hasNextPage={hasNextPage}
 *   isFetchingNextPage={isFetchingNextPage}
 *   onFetchNextPage={() => fetchNextPage()}
 * >
 *   {data.pages.flatMap((page) => page.items).map((item) => (
 *     <Row key={item.id} {...item} />
 *   ))}
 *   <InfiniteScrollSentinel />
 * </InfiniteScroll>
 * ```
 */
function InfiniteScroll({
  onFetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  className,
  children,
  ...props
}: InfiniteScrollProps) {
  const context = useMemo(
    () => ({ hasNextPage, isFetchingNextPage, onFetchNextPage }),
    [hasNextPage, isFetchingNextPage, onFetchNextPage]
  );

  return (
    <InfiniteScrollContext value={context}>
      <div className={className} data-slot="infinite-scroll" {...props}>
        {children}
      </div>
    </InfiniteScrollContext>
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
          <div className="flex items-center justify-center p-4">
            <Spinner />
          </div>
        ),
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

export { InfiniteScroll, InfiniteScrollSentinel };
