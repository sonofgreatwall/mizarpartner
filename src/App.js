import "./App.css";
import { useScheduleManager } from "./hooks/useScheduleManager";
import React from "react";
import ScheduleLayout from "./functions/scheduleLayout";
import { ScheduleContext } from "./context/scheduleContext";

function App() {
  const dataFromScheduleManager = useScheduleManager(true);
  const { zoomLevel, changeZoomLevel } = dataFromScheduleManager;

  return (
    <div className="flex   flex-col h-auto w-full  bg-taskinatorLightGrey   ">
      <div className={"h-12  min-h-12 px-4  text-taskinatorWhite  bg-taskinatorDarkGrey font-semibold uppercase flex items-center"}>
        <div className="flex items-center  text-md">Job Schedule</div>

        <div className="flex flex-col justify-end grow mb-1   rounded ">
          <div className="flex grow justify-end  gap-1">
            <button
              className={`px-3 py-1 text-sm rounded ${zoomLevel === "hours" ? "bg-taskinatorBlue text-white" : "border-taskinatorMedGrey border text-taskinatorMedGrey"}`}
              onClick={() => changeZoomLevel("hours")}
            >
              Hours
            </button>
            <button
              className={`px-3 py-1 text-sm rounded ${zoomLevel === "days" ? "bg-taskinatorBlue text-white" : "border-taskinatorMedGrey border text-taskinatorMedGrey"}`}
              onClick={() => changeZoomLevel("days")}
            >
              Days
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col grow overflow-auto  items-center  justify-start my-2">
        <div className="flex w-full h-full border-b border-taskinatorMedGrey ">
          <div className="w-full h-auto">
            <ScheduleContext.Provider
              value={{
                ...dataFromScheduleManager,
              }}
            >
              <ScheduleLayout />
            </ScheduleContext.Provider>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
