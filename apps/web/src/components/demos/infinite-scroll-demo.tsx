import {
  InfiniteScroll,
  InfiniteScrollSentinel,
} from "@registry/infinite-scroll";
import { useCallback, useState } from "react";

const PAGE_SIZE = 10;
const LAST_PAGE = 4;
const LATENCY_MS = 800;

const pageOf = (page: number) =>
  Array.from({ length: PAGE_SIZE }, (_, index) => page * PAGE_SIZE + index + 1);

export const InfiniteScrollDemo = () => {
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
      className="h-72 w-full max-w-xs overflow-y-auto overscroll-contain"
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onFetchNextPage={fetchNextPage}
    >
      <ul className="divide-y">
        {pages.flat().map((id) => (
          <li className="px-3 py-2 tabular-nums" key={id}>
            Workout #{id}
          </li>
        ))}
      </ul>
      <InfiniteScrollSentinel />
    </InfiniteScroll>
  );
};
