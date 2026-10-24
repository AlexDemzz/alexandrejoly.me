import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { Button } from "@portfolio/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@portfolio/ui/components/tooltip";
import {
  InfiniteScroll,
  InfiniteScrollContent,
  InfiniteScrollSentinel,
  InfiniteScrollViewport,
} from "@registry/infinite-scroll";
import { useCallback, useState } from "react";

const PAGE_SIZE = 10;
const LAST_PAGE = 3;
const LATENCY_MS = 800;

const pageOf = (page: number) =>
  Array.from({ length: PAGE_SIZE }, (_, index) => page * PAGE_SIZE + index + 1);

const PagedList = () => {
  const [pages, setPages] = useState([pageOf(0)]);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const hasNextPage = pages.length <= LAST_PAGE;

  const fetchNextPage = useCallback(() => {
    setIsFetchingNextPage(true);
    setTimeout(() => {
      setPages((loaded) => [...loaded, pageOf(loaded.length)]);
      setIsFetchingNextPage(false);
    }, LATENCY_MS);
  }, []);

  return (
    <InfiniteScroll
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onFetchNextPage={fetchNextPage}
    >
      <InfiniteScrollViewport
        aria-label="Items"
        className="scroll-fade-y h-72 w-full max-w-xs overscroll-contain"
        role="region"
        tabIndex={0}
      >
        <InfiniteScrollContent>
          <ul className="flex flex-col">
            {pages.flat().map((id) => (
              <li className="px-3 py-2" key={id}>
                Item {id}
              </li>
            ))}
          </ul>
          <InfiniteScrollSentinel />
          {!hasNextPage && <p className="text-center">No more items</p>}
        </InfiniteScrollContent>
      </InfiniteScrollViewport>
    </InfiniteScroll>
  );
};

export const InfiniteScrollDemo = () => {
  const [run, setRun] = useState(0);

  return (
    <div className="contents [[data-slot=preview]:has(&)]:relative">
      <PagedList key={run} />
      <Tooltip>
        <TooltipTrigger
          delay={0}
          render={
            <Button
              aria-label="Reset"
              className="absolute top-3 right-3"
              onClick={() => setRun((value) => value + 1)}
              size="icon"
              variant="ghost"
            />
          }
        >
          <ArrowCounterClockwiseIcon aria-hidden />
        </TooltipTrigger>
        <TooltipContent>Reset</TooltipContent>
      </Tooltip>
    </div>
  );
};
