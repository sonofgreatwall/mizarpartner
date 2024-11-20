import logo from "./logo.svg";
import "./App.css";
import { useScheduleManager } from "./hooks/useScheduleManager";
import React, { useContext } from "react";
import ScheduleLayout from "./functions/scheduleLayout";
import {ScheduleContext}  from "./context/scheduleContext"

function App() {
  const dataFromScheduleManager = useScheduleManager(true);

  return (
    <div className="flex flex-col  overflow-auto h-full items-center  justify-start my-2">
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
      {/* <div className="mt-4">
      <AddWorkflowToJobButton />
    </div> */}
    </div>
  );
}

export default App;
