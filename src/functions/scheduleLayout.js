import React, { useContext, useState, useEffect, useRef } from "react";

import TaskDetailsSection from "./taskDetailsSection";

import { differenceInHours, differenceInDays, differenceInWeeks, differenceInMonths, addDays, addHours } from "date-fns";
import { useVirtualiser } from "../hooks/useVirtualiser";
import ScheduleRowDisplay from "./scheduleRowDisplay";
import RenderTaskOnSchedule from "./renderTaskOnSchedule";
import { ScheduleContext } from "../context/scheduleContext";
import DependencyCanvas from "./dependencyCanvas";
import ScheduleTopHeader from "./scheduleTopHeader";

const numberOfHeaders = 2;

const ScheduleLayout = () => {
  const {
    earliestStartDate,
    latestFinishDate,
    ROW_HEIGHT_REM,
    COLUMN_WIDTH_REM,
    getCurrentDateByIndex,
    getDurationInDays,
    getIndexFromDate,
    dataToDisplayOnChart,
    zoomLevel,
    taskRefs,
    renderDependencyLine,
    renderMenu,
    handleDependencyClick,
    setCurrentVisibleIndex,
  } = useContext(ScheduleContext);

  const [visibleData, setVisibleData] = useState({});
  const [buffer, setBuffer] = useState(5);

  const { renderVisibleItems, setNofColumns, setNofRows, startColIndex, endColIndex, startRowIndex, endRowIndex, containerRef, scrollPosition, numberRows, numberColumns, scaleChanged } =
    useVirtualiser({
      columnWidthInRem: COLUMN_WIDTH_REM,
      rowHeightInRem: ROW_HEIGHT_REM,
      initialNumberOfColumns: 100,
      initialNumberOfRows: 10,
      buffer: buffer,
      initialScale: zoomLevel === "days" ? 1 : zoomLevel === "hours" ? 24 : 1,
    });

  useEffect(() => {
    scaleChanged(zoomLevel === "days" ? 1 : zoomLevel === "hours" ? 24 : 1);
  }, [zoomLevel]);

  useEffect(() => {
    // Calculate and set the current visible index based on scroll position and buffer
    const calculateVisibleIndex = () => {
      // If at start of schedule with no scroll, set to 0

      if (startColIndex === 0 && scrollPosition.scrollLeft === 0) {
        setCurrentVisibleIndex(0);
        return;
      }

      // Calculate visible index by taking into account:
      // - Starting column index
      // - Horizontal scroll position normalized by column width
      // - Buffer offset to show correct section
      const scrollOffsetInColumns = Math.floor(scrollPosition.scrollLeft / (COLUMN_WIDTH_REM * 16)); // Convert rem to px
      const visibleIndex = Math.max(0, scrollOffsetInColumns) + 1;

      setCurrentVisibleIndex(visibleIndex);
    };

    calculateVisibleIndex();
  }, [startColIndex, scrollPosition]);

  useEffect(() => {
    let columnCount;
    if (earliestStartDate && latestFinishDate) {
      switch (zoomLevel) {
        case "hours":
          setBuffer(100);
          columnCount = differenceInHours(latestFinishDate, earliestStartDate);
          break;
        case "days":
          setBuffer(10);
          columnCount = differenceInDays(latestFinishDate, earliestStartDate);
          break;
        case "weeks":
          columnCount = differenceInWeeks(latestFinishDate, earliestStartDate);
          break;
        case "months":
          columnCount = differenceInMonths(latestFinishDate, earliestStartDate);
          break;
        default:
          columnCount = 0;
      }

      const numberOfColumns = Math.max(columnCount, 0);

      setNofColumns(numberOfColumns + buffer);
    }
  }, [earliestStartDate, latestFinishDate, zoomLevel]);

  useEffect(() => {
    const numberOfRows =
      Object.values(dataToDisplayOnChart).filter((item) => item.type === "task").length + Object.values(dataToDisplayOnChart).filter((item) => item.type === "workflow").length * 2 + numberOfHeaders;
    setNofRows(numberOfRows);
  }, [dataToDisplayOnChart]);

  useEffect(() => {
    let visibleData = {};

    // Get visible date range
    const visibleStartDate = getCurrentDateByIndex(startColIndex);
    const visibleEndDate = getCurrentDateByIndex(endColIndex);

    const tasks = Object.values(dataToDisplayOnChart).filter((item) => item.type === "task");
    const workflows = Object.values(dataToDisplayOnChart).filter((item) => item.type === "workflow");

    let displayRowStartingIndex = numberOfHeaders;

    workflows
      .sort((a, b) => a.rowIndex - b.rowIndex)
      .forEach((workflow) => {
        const isWorkflowVisible = calculateVisibleItemLayout({
          item: workflow,
          displayRowStartingIndex,
          visibleStartDate,
          getIndexFromDate,
          visibleEndDate,
          zoomLevel,
          COLUMN_WIDTH_REM,
          startColIndex,
          endColIndex,
          startRowIndex,
          endRowIndex,
          getDurationInDays,
        });

        if (isWorkflowVisible) {
          visibleData = { ...visibleData, ...isWorkflowVisible };
        }

        displayRowStartingIndex++;

        let tasksVisibleCount = 0;
        const tasksInWorkflow = tasks.filter((task) => task.workflowId === workflow.workflowId);
        tasksInWorkflow
          .sort((a, b) => a.rowIndex - b.rowIndex)
          .forEach((task) => {
            const isTaskVisible = calculateVisibleItemLayout({
              item: task,
              displayRowStartingIndex,
              getIndexFromDate,
              visibleStartDate,
              visibleEndDate,
              zoomLevel,
              COLUMN_WIDTH_REM,
              startColIndex,
              endColIndex,
              startRowIndex,
              endRowIndex,
              getDurationInDays,
            });

            if (isTaskVisible) {
              visibleData = { ...visibleData, ...isTaskVisible };
              tasksVisibleCount++;
            }

            displayRowStartingIndex++;
          });

        if (tasksVisibleCount === tasksInWorkflow.length - 1) {
          visibleData[displayRowStartingIndex] = { type: "blank" };
        }

        displayRowStartingIndex++;
      });

    setVisibleData(visibleData);
  }, [startColIndex, endColIndex, startRowIndex, endRowIndex, dataToDisplayOnChart, zoomLevel]);

  return (
    <div className="flex w-full h-full flex-col">
      <div className="flex w-full h-full">
        {/* <DragToExpand direction="horizontal" backgroundColor="bg-taskinatorLightGrey" minWidth={200} initialWidth={400} customCSS="overflow-auto flex" limitToContent={true}>
          <TaskDetailsSection />
        </DragToExpand> */}
        <div className="flex flex-col w-full h-full overflow-auto ">
          {renderVisibleItems({
            colChildren: <ScheduleRowDisplay />,
            rowChildren: visibleData ? [<ScheduleTopHeader />, <RenderTaskOnSchedule item={visibleData} />] : null,
            layOvers: visibleData ? (
              <>
                <DependencyCanvas
                  tasks={Object.values(visibleData).filter((item) => item.type === "task")}
                  taskRefs={taskRefs}
                  containerRef={containerRef}
                  scrollPosition={scrollPosition}
                  onDependencyClick={handleDependencyClick}
                />
                {renderDependencyLine()}
                {renderMenu()}
              </>
            ) : null,
            detailsSection: <TaskDetailsSection />,
          })}
        </div>
      </div>
    </div>
  );
};

export default ScheduleLayout;

const calculateVisibleItemLayout = ({
  item,
  visibleStartDate,
  visibleEndDate,
  displayRowStartingIndex,
  COLUMN_WIDTH_REM,
  startColIndex,
  endColIndex,
  startRowIndex,
  endRowIndex,
  getIndexFromDate,
  getDurationInDays,
  zoomLevel,
}) => {
  // Check if item is within visible rows first
  if (displayRowStartingIndex < startRowIndex || displayRowStartingIndex > endRowIndex) {
    return null;
  }

  const itemsStartIndex = getIndexFromDate(item.startDate);

  let itemsEndIndex;
  if (item.type === "task") {
    if (zoomLevel === "days") {
      itemsEndIndex = getIndexFromDate(addDays(item.startDate, getDurationInDays(item.duration)));
    } else if (zoomLevel === "hours") {
      itemsEndIndex = getIndexFromDate(addHours(item.startDate, getDurationInDays(item.duration) * 24));
    }
  } else if (item.type === "workflow") {
    itemsEndIndex = getIndexFromDate(item.finishDate) + 1;
  }

  let offset = itemsStartIndex * COLUMN_WIDTH_REM;
  let width =
    itemsEndIndex === itemsStartIndex
      ? zoomLevel === "hours"
        ? getDurationInDays(item.duration) * 24 * COLUMN_WIDTH_REM
        : getDurationInDays(item.duration) * COLUMN_WIDTH_REM
      : (itemsEndIndex - itemsStartIndex) * COLUMN_WIDTH_REM;
  let leftHidden = false;
  let rightHidden = false;

  // Adjust if item starts before visible area
  if (item.startDate < visibleStartDate) {
    leftHidden = true;
  }

  // Adjust if item ends after visible area
  if ((item.finishDate || item.endDate) > visibleEndDate) {
    rightHidden = true;
  }

  if (
    (itemsStartIndex >= startColIndex && itemsStartIndex <= endColIndex) ||
    (itemsEndIndex >= startColIndex && itemsEndIndex <= endColIndex) ||
    (itemsStartIndex <= startColIndex && itemsEndIndex >= endColIndex)
  ) {
    const key = `${displayRowStartingIndex}`;
    return {
      [key]: {
        ...item,
        offset,
        width,
        leftHidden,
        rightHidden,
      },
    };
  }
  return null;
};
