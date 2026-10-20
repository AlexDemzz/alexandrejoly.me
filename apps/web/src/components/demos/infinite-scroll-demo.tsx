import {
  InfiniteScroll,
  InfiniteScrollSentinel,
} from "@registry/infinite-scroll";
import { useCallback, useState } from "react";

const PAGE_SIZE = 10;
const LAST_PAGE = 3;
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
      className="scroll-fade-y h-72 w-full max-w-xs overflow-y-auto overscroll-contain"
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onFetchNextPage={fetchNextPage}
    >
      <ul className="flex flex-col">
        {pages.flat().map((id) => (
          <li className="px-3 py-2" key={id}>
            Item {id}
          </li>
        ))}
        <InfiniteScrollSentinel
          render={(props) => (
            <li {...props}>
              {hasNextPage ? (
                props.children
              ) : (
                <p className="p-3 text-center">No more items</p>
              )}
            </li>
          )}
        />
      </ul>
    </InfiniteScroll>
  );
};
