"use client";

import clsx from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  List,
  useDynamicRowHeight,
  useListRef,
  type RowComponentProps,
} from "react-window";
import type { FavoriteLaunch } from "@/lib/api/schemas";
import { LaunchCard } from "./launch-card";

const DEFAULT_ROW_HEIGHT = 196;
const ROW_PADDING_INLINE_END = 16;
const DEFAULT_LIST_HEIGHT = 720;
const LOAD_MORE_THRESHOLD = 240;

type VirtualizedLaunchListRowProps = {
  launches: FavoriteLaunch[];
  actionRenderer?: (launch: FavoriteLaunch) => React.ReactNode;
  footer?: React.ReactNode;
};

function VirtualizedLaunchRow({
  index,
  style,
  launches,
  actionRenderer,
  footer,
}: RowComponentProps<VirtualizedLaunchListRowProps>) {
  if (index === launches.length && footer) {
    return (
      <div
        style={{
          ...style,
          width: "100%",
          boxSizing: "border-box",
          paddingInlineEnd: ROW_PADDING_INLINE_END,
          borderBottom: index === launches.length - 1 ? "none" : "1px solid var(--border)",
        }}
      >
        {footer}
      </div>
    );
  }

  const launch = launches[index];

  return (
    <div
      style={{
        ...style,
        width: "100%",
        boxSizing: "border-box",
        paddingInlineEnd: ROW_PADDING_INLINE_END,
        borderBottom:
          index === launches.length - 1 ? "none" : "1px solid var(--border)",
      }}
    >
      <LaunchCard launch={launch} actionSlot={actionRenderer?.(launch)} />
    </div>
  );
}

export function VirtualizedLaunchList({
  launches,
  actionRenderer,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  footer,
}: {
  launches: FavoriteLaunch[];
  actionRenderer?: (launch: FavoriteLaunch) => React.ReactNode;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  footer?: React.ReactNode;
}) {
  const listRef = useListRef(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);
  const rowHeight = useDynamicRowHeight({
    defaultRowHeight: DEFAULT_ROW_HEIGHT,
    key: launches.map((launch) => launch.id).join(":"),
  });
  const rowCount = useMemo(
    () => launches.length + (footer ? 1 : 0),
    [footer, launches.length],
  );
  const updateFadeState = useCallback(() => {
    const element = listRef.current?.element;

    if (!element) {
      return;
    }

    const { clientHeight, scrollHeight, scrollTop } = element;
    const maxScrollTop = Math.max(scrollHeight - clientHeight, 0);

    setShowTopFade(scrollTop > 0);
    setShowBottomFade(maxScrollTop > 0 && scrollTop < maxScrollTop - 1);
  }, [listRef]);
  const handleScroll = useCallback<React.UIEventHandler<HTMLDivElement>>(
    (event) => {
      const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;
      const distanceToBottom = scrollHeight - (scrollTop + clientHeight);

      setShowTopFade(scrollTop > 0);
      setShowBottomFade(distanceToBottom > 1);

      if (!hasNextPage || isFetchingNextPage) {
        return;
      }

      if (scrollTop > 0 && distanceToBottom <= LOAD_MORE_THRESHOLD) {
        onLoadMore();
      }
    },
    [hasNextPage, isFetchingNextPage, onLoadMore],
  );

  useEffect(() => {
    updateFadeState();

    const element = listRef.current?.element;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      updateFadeState();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [launches.length, listRef, updateFadeState]);

  return (
    <List
      listRef={listRef}
      rowComponent={VirtualizedLaunchRow}
      rowCount={rowCount}
      rowHeight={rowHeight}
      rowProps={{ launches, actionRenderer, footer }}
      overscanCount={3}
      defaultHeight={DEFAULT_LIST_HEIGHT}
      className={clsx(
        "launch-list-shell scroll-fade-shell scroll-shell min-h-0 flex-1 rounded-[1.25rem]",
        showTopFade && "fade-top-active",
        showBottomFade && "fade-bottom-active",
      )}
      style={{ height: "100%" }}
      onScroll={handleScroll}
    />
  );
}
