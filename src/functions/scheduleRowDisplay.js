import React, { useContext } from "react";
import { ScheduleContext } from "../context/scheduleContext";
import { format, isWeekend, getHours } from "date-fns";

const ScheduleRowDisplay = ({ rowIndex, colIndex, endColIndex, startColIndex }) => {
  const { zoomLevel, getCurrentDateByIndex, COLUMN_WIDTH_REM, HEADER_HEIGHT_REM } = useContext(ScheduleContext);

  const currentTimeOfRow = getCurrentDateByIndex(colIndex);

  if (rowIndex === 0) {
  } else if (rowIndex === 1) {
    let dateDisplay;

    switch (zoomLevel) {
      case "hours":
        dateDisplay = {
          topValue: null,
          bottomValue: format(currentTimeOfRow, "hh a"),
        };
        break;
      default:
        dateDisplay = {
          topValue: format(currentTimeOfRow, "EEE"),
          bottomValue: format(currentTimeOfRow, "d"),
        };
    }

    const hours = getHours(currentTimeOfRow);
    const isNightTime = hours >= 18 || hours < 6;

    return (
      <div
        key={`${rowIndex}-${colIndex}`}
        className={`p-2 items-center flex flex-col text-center justify-center border-b border-b-taskinatorMedGrey border-r border-r-taskinatorMedGrey text-xs ${
          zoomLevel === "hours" && isNightTime ? "bg-taskinatorOffWhite" : ""
        } ${zoomLevel === "days" && isWeekend(currentTimeOfRow) ? "bg-taskinatorOffWhite" : ""}`}
        style={{ width: `${COLUMN_WIDTH_REM}rem`, height: `${HEADER_HEIGHT_REM}rem` }}
      >
        <div>{dateDisplay?.topValue}</div>
        <div>{dateDisplay?.bottomValue}</div>
      </div>
    );
  } else {
    const hours = getHours(currentTimeOfRow);
    const isNightTime = hours >= 18 || hours < 6;

    return (
      <div
        className={`flex items-center justify-center w-full h-full border-b border-r border-b-taskinatorMedGrey border-r-taskinatorMedGrey ${
          zoomLevel === "hours" && isNightTime ? "bg-taskinatorOffWhite" : ""
        } ${zoomLevel === "days" && isWeekend(currentTimeOfRow) ? "bg-taskinatorOffWhite" : ""}`}
        style={{ width: `${COLUMN_WIDTH_REM}rem`, height: `${HEADER_HEIGHT_REM}rem` }}
      ></div>
    );
  }
};

export default ScheduleRowDisplay;
