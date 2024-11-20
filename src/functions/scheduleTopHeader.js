import React from "react";
import { useContext } from "react";
import { ScheduleContext } from "../context/scheduleContext";
import { format, getDay, getHours } from "date-fns";

const ScheduleTopHeader = ({ rowIndex, colIndex, endColIndex, startColIndex, numberOfColumns }) => {
  const { zoomLevel, getCurrentDateByIndex, COLUMN_WIDTH_REM } = useContext(ScheduleContext);

  let dateByGroup = [];

  const startIndex = 0;

  if (rowIndex === 0) {
    let currentGroup = {
      start: startIndex,
      label:
        zoomLevel === "hours"
          ? format(getCurrentDateByIndex(startIndex), "EEEE do yyyy")
          : zoomLevel === "days"
          ? format(getCurrentDateByIndex(startIndex), "MMMM yyyy")
          : format(getCurrentDateByIndex(startIndex), "MMMM yyyy"),
    };

    for (let i = startIndex; i <= numberOfColumns; i++) {
      const currentLabel =
        zoomLevel === "hours" ? format(getCurrentDateByIndex(i), "EEEE do yyyy") : zoomLevel === "days" ? format(getCurrentDateByIndex(i), "MMMM yyyy") : format(getCurrentDateByIndex(i), "MMMM yyyy");

      if (currentLabel !== currentGroup.label) {
        // Only add group if it falls within visible range

        let endIndex = i;

        dateByGroup.push({
          ...currentGroup,
          end: endIndex,
          width: (endIndex - currentGroup.start) * COLUMN_WIDTH_REM,
        });

        currentGroup = {
          start: i,
          label: currentLabel,
        };
      } else if (i === numberOfColumns) {
        dateByGroup.push({
          ...currentGroup,
          end: numberOfColumns,
          width: (numberOfColumns - currentGroup.start) * COLUMN_WIDTH_REM,
        });
      }

      // Start new group
    }

    // Add final group if it falls within visible range
    // dateByGroup = dateByGroup.filter((group) => group.start <= endColIndex || group.end >= startColIndex);
  }

  if (rowIndex === 0) {
    return (
      <div className="flex w-full h-full">
        {dateByGroup.map((group, index) => (
          <div key={index} className="flex items-center justify-center border-b border-r border-b-taskinatorMedGrey border-r-taskinatorMedGrey" style={{ width: `${group.width}rem` }}>
            {group.width > COLUMN_WIDTH_REM * 4 && group.label}
          </div>
        ))}
      </div>
    );
  }
};

export default ScheduleTopHeader;
