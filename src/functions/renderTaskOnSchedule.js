import React, { useContext } from "react";
import { ScheduleContext } from "../context/scheduleContext";

const RenderTaskOnSchedule = ({ rowIndex, item }) => {
  const {
    HEADER_HEIGHT_REM,
    COLUMN_WIDTH_REM,
    zoomLevel,
    renderDependencyLine,
    getDurationInDays,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleDependencyStart,
    handleNodeHover,
    handleNodeLeave,
    taskRefs,
  } = useContext(ScheduleContext);
  const itemToRender = item?.[rowIndex];

  if (itemToRender?.type === "workflow") {
    return (
      <div
        className="absolute bg-taskinatorDarkGrey  px-2 rounded z-40 flex items-center text-taskinatorWhite text-xxs"
        style={{ width: `${itemToRender.width - 0.25}rem`, top: "0.125rem", left: `${itemToRender.offset + 0.125}rem`, height: `${HEADER_HEIGHT_REM - 0.25}rem` }}
      >
        <div className="overflow-hidden text-nowrap">{itemToRender.name}</div>
      </div>
    );
  } else if (itemToRender?.type === "task") {
    let duration = getDurationInDays(itemToRender.duration);

    if (zoomLevel === "hours") {
      duration = duration * 24;
    }

    return (
      <div
        ref={(el) => (taskRefs.current[itemToRender.taskId] = el)}
        className={`absolute bg-taskinatorBlue  px-2 rounded z-40 flex items-center text-taskinatorWhite text-xxs group ${
          duration * COLUMN_WIDTH_REM < 2 ? "opacity-50 cursor-default" : "cursor-move"
        }`}
        style={{ width: `${itemToRender.width - 0.25}rem`, top: "0.125rem", left: `${itemToRender.offset + 0.125}rem`, height: `${HEADER_HEIGHT_REM - 0.25}rem` }}
        onMouseDown={(e) => {
          console.log(e, itemToRender.taskId, "move");
          handleMouseDown(e, itemToRender.taskId, "move");
        }}
      >
        {duration * COLUMN_WIDTH_REM >= 2 && (
          <>
            {/* Left dependency circle */}
            <div
              className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white bg-taskinatorBlue 
              cursor-pointer hover:bg-taskinatorDarkBlue z-40 opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => handleDependencyStart(e, itemToRender.taskId, "left")}
              onMouseEnter={() => handleNodeHover(itemToRender.taskId, "left")}
              onMouseLeave={handleNodeLeave}
            />

            <div
              className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, itemToRender.taskId, "left");
              }}
            >
              <div className="w-1 h-1 rounded-full bg-white mb-0.5" />
              <div className="w-1 h-1 rounded-full bg-white mb-0.5" />
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
            <div
              className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, itemToRender.taskId, "right");
              }}
            >
              <div className="w-1 h-1 rounded-full bg-white mb-0.5" />
              <div className="w-1 h-1 rounded-full bg-white mb-0.5" />
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
            {/* Right dependency circle */}

            <div
              className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white bg-taskinatorBlue
                                      cursor-pointer hover:bg-taskinatorDarkBlue z-40 opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => handleDependencyStart(e, itemToRender.taskId, "right")}
              onMouseEnter={() => handleNodeHover(itemToRender.taskId, "right")}
              onMouseLeave={handleNodeLeave}
            />
          </>
        )}
        <div className="overflow-hidden text-nowrap items-center flex"> {itemToRender.title}</div>
      </div>
    );
  } else {
    return null;
  }
};

export default RenderTaskOnSchedule;
