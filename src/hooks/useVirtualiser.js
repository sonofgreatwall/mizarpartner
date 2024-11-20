import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import DragToExpand from "../utils/dragToExpand";
export const useVirtualiser = ({ columnWidthInRem, rowHeightInRem, buffer = 10, initialNumberOfColumns = 0, initialNumberOfRows = 0, onScroll, initialScale, colDetailsSection = null }) => {
  const [oldScale, setOldScale] = useState(initialScale);

  const containerRef = useRef(null);
  const container2Ref = useRef(null);
  const mainRef = useRef(null);

  const lastScrollLeft = useRef(0);

  const lastScrollTop = useRef(0);

  const [numberOfColumns, setNumberOfColumns] = useState(initialNumberOfColumns);
  const [numberOfRows, setNumberOfRows] = useState(initialNumberOfRows);
  const [scrollPosition, setScrollPosition] = useState({ scrollLeft: 0, scrollTop: 0 });

  const [startRowIndex, setStartRowIndex] = useState(0);
  const [endRowIndex, setEndRowIndex] = useState(0);
  const [startColIndex, setStartColIndex] = useState(0);
  const [endColIndex, setEndColIndex] = useState(0);

  // Convert rem to pixels
  const remToPx = (rem) => {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  };

  // Memoize scroll-dependent calculations
  const visibleIndices = useMemo(() => {
    if (!containerRef.current && !mainRef.current) return null;

    const itemWidthPx = remToPx(columnWidthInRem);
    const itemHeightPx = remToPx(rowHeightInRem);

    const newStartColIndex = Math.max(Math.floor(scrollPosition.scrollLeft / itemWidthPx) - buffer, 0);
    const newEndColIndex = Math.min(newStartColIndex + Math.ceil(containerRef.current.clientWidth / itemWidthPx) + 2 * buffer, numberOfColumns);

    const newStartRowIndex = Math.max(Math.floor(scrollPosition.scrollTop / itemHeightPx) - buffer, 0);
    const newEndRowIndex = Math.min(newStartRowIndex + Math.ceil(mainRef.current.clientHeight / itemHeightPx) + 2 * buffer, numberOfRows);

    return {
      startColIndex: newStartColIndex,
      endColIndex: newEndColIndex,
      startRowIndex: newStartRowIndex,
      endRowIndex: newEndRowIndex,
    };
  }, [scrollPosition, columnWidthInRem, rowHeightInRem, buffer, numberOfColumns, numberOfRows, containerRef.current?.clientWidth, containerRef.current?.clientHeight, mainRef.current?.clientHeight]);

  useEffect(() => {
    if (visibleIndices) {
      setStartColIndex(visibleIndices.startColIndex);
      setEndColIndex(visibleIndices.endColIndex);
      setStartRowIndex(visibleIndices.startRowIndex);
      setEndRowIndex(visibleIndices.endRowIndex);
    }
  }, [visibleIndices]);

  useEffect(() => {
    const updateIndices = (refToUse) => {
      if (containerRef.current && container2Ref.current) {
        let scrollLeft = 0;
        let scrollTop = 0;

        if (refToUse === "container1") {
          scrollLeft = containerRef.current.scrollLeft;
          scrollTop = containerRef.current.scrollTop;
          container2Ref.current.scrollTop = scrollTop;
        } else {
          scrollTop = container2Ref.current.scrollTop;
          containerRef.current.scrollTop = scrollTop;
        }

        // Only update scroll position if it has changed significantly
        if (Math.abs(lastScrollLeft.current - scrollLeft) > 0 || Math.abs(lastScrollTop.current - scrollTop) > 0) {
          setScrollPosition({ scrollLeft, scrollTop });

          // Call onScroll callback with current scroll position
          if (onScroll) {
            onScroll({ scrollLeft, scrollTop });
          }

          lastScrollLeft.current = scrollLeft;
          lastScrollTop.current = scrollTop;
        }
      }
    };

    updateIndices();
    const container = containerRef.current;
    const container2 = container2Ref.current;
    container.addEventListener("scroll", () => updateIndices("container1"));
    container2.addEventListener("scroll", () => updateIndices("container2"));
    window.addEventListener("resize", updateIndices);

    return () => {
      container.removeEventListener("scroll", updateIndices);
      container2.removeEventListener("scroll", updateIndices);
      window.removeEventListener("resize", updateIndices);
    };
  }, [onScroll]);

  const setNofColumns = (number) => {
    setNumberOfColumns(number);
  };

  const setNofRows = (number) => {
    setNumberOfRows(number);
  };

  const scaleChanged = (newScale) => {
    if (containerRef.current) {
      const currentScrollLeft = containerRef.current.scrollLeft;
      const ratio = newScale / oldScale;
      // Account for buffer columns by adjusting scroll position
      const bufferWidthPx = buffer * remToPx(columnWidthInRem);
      const adjustedScrollLeft = currentScrollLeft * 11;

      containerRef.current.scrollLeft = adjustedScrollLeft;
      setOldScale(newScale);
    }
  };

  const renderVisibleItems = ({ rowChildren = null, colChildren = null, layOvers = null, detailsSection = null }) => {
    return (
      <div ref={mainRef} className="flex overflow-auto px-1 " style={{ width: "100%", height: "100%" }}>
        <DragToExpand direction="horizontal" minWidth={100} initialWidth={15 * 16} backgroundColor="bg-taskinatorLightGrey ">
          <div
            ref={container2Ref}
            className={`overflow-auto w-full ${detailsSection ? "" : "hidden"}`}
            style={{ height: "100%",  overflowX: "auto", overflowY: "hidden" }}
          >
            <div
              className="relative"
              style={{
                height: `${numberOfRows * rowHeightInRem}rem`,
              }}
            >
              {detailsSection}
            </div>{" "}
          </div>
        </DragToExpand>
        <div ref={containerRef} className="z-10 bg-taskinatorLightGrey overflow-auto" style={{ width: "100%", height: "100%" }}>
          <div
            className="relative"
            style={{
              width: `${numberOfColumns * columnWidthInRem}rem`,
              height: `${numberOfRows * rowHeightInRem}rem`,
            }}
          >
            <>
              {layOvers && layOvers}
              {Array.from({ length: endRowIndex - startRowIndex }).map((_, rowIndexOffset) => {
                const rowIndex = startRowIndex + rowIndexOffset;

                return (
                  <div
                    key={`row-${rowIndex}`}
                    style={{
                      position: "absolute",
                      top: `${rowIndex * rowHeightInRem}rem`,
                      width: "100%",
                      height: `${rowHeightInRem}rem`,
                    }}
                  >
                    {/* Render row content first */}

                    {Array.isArray(rowChildren)
                      ? rowChildren.map((child) =>
                          React.isValidElement(child)
                            ? React.cloneElement(child, {
                                rowIndex,
                                endColIndex,
                                startColIndex,
                                numberOfColumns,
                              })
                            : null
                        )
                      : React.isValidElement(rowChildren)
                      ? React.cloneElement(rowChildren, {
                          rowIndex,
                        })
                      : null}
                    {/* Then render columns if needed */}

                    {colChildren &&
                      Array.from({ length: endColIndex - startColIndex }).map((_, colIndexOffset) => {
                        const colIndex = startColIndex + colIndexOffset;

                        return (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            style={{
                              position: "absolute",
                              left: `${colIndex * columnWidthInRem}rem`,
                              width: `${columnWidthInRem}rem`,
                              height: `${rowHeightInRem}rem`,
                            }}
                          >
                            {React.isValidElement(colChildren) &&
                              React.cloneElement(colChildren, {
                                rowIndex,
                                colIndex,
                                endColIndex,
                                startColIndex,
                              })}
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </>
          </div>
        </div>
      </div>
    );
  };

  return {
    startRowIndex,
    endRowIndex,
    startColIndex,
    endColIndex,
    setNofColumns,
    setNofRows,
    renderVisibleItems,
    containerRef,
    scrollPosition,
    numberOfRows,
    scaleChanged,
  };
};
