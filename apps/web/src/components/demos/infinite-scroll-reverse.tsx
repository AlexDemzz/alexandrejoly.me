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
import { RotateCcwIcon } from "lucide-react";
import { useCallback, useState } from "react";

const PAGE_SIZE = 10;
const LAST_PAGE = 3;
const LATENCY_MS = 800;
const TOTAL = PAGE_SIZE * (LAST_PAGE + 1);

const olderPageOf = (page: number) =>
  Array.from(
    { length: PAGE_SIZE },
    (_, index) => TOTAL - (page + 1) * PAGE_SIZE + index + 1
  );

const PagedHistory = () => {
  const [pages, setPages] = useState([olderPageOf(0)]);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const hasNextPage = pages.length <= LAST_PAGE;

  const fetchNextPage = useCallback(() => {
    setIsFetchingNextPage(true);
    setTimeout(() => {
      setPages((loaded) => [olderPageOf(loaded.length), ...loaded]);
      setIsFetchingNextPage(false);
    }, LATENCY_MS);
  }, []);

  return (
    <InfiniteScroll
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onFetchNextPage={fetchNextPage}
      reverse
    >
      <InfiniteScrollViewport className="h-72 w-full max-w-xs overscroll-contain">
        <InfiniteScrollContent>
          {!hasNextPage && <p className="text-center">No older messages</p>}
          <InfiniteScrollSentinel />
          <ul className="flex flex-col">
            {pages.flat().map((id) => (
              <li className="px-3 py-2" key={id}>
                Message {id}
              </li>
            ))}
          </ul>
        </InfiniteScrollContent>
      </InfiniteScrollViewport>
    </InfiniteScroll>
  );
};

export const InfiniteScrollReverse = () => {
  const [run, setRun] = useState(0);

  return (
    <div className="contents [[data-slot=preview]:has(&)]:relative">
      <PagedHistory key={run} />
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
          <RotateCcwIcon aria-hidden />
        </TooltipTrigger>
        <TooltipContent>Reset</TooltipContent>
      </Tooltip>
    </div>
  );
};
