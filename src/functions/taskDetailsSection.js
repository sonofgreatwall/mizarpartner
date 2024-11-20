import React, { useContext, useState, useEffect, useRef } from "react";
import { format, addDays } from "date-fns";
import { ScheduleContext } from "../context/scheduleContext";
import DragToExpand from "../utils/dragToExpand";
import Button from "../input/button";

import DurationInput from "../input/durationInput";
import { MdAddCircle } from "react-icons/md";

const TaskDetailsSection = () => {
  const { dataToDisplayOnChart, createNewTask, updateTask, updateWorkflow, ROW_HEIGHT_REM, HEADER_HEIGHT_REM, getDurationInDays, addWorkflow } = useContext(ScheduleContext);

  const workflows = Object.values(dataToDisplayOnChart).filter((item) => item.type === "workflow");
  const tasks = Object.values(dataToDisplayOnChart).filter((item) => item.type === "task");

  return (
    <div className="flex h-full shrink-0 w-full border border-taskinatorRed  relative">
      <div className="flex h-full ">
        <DragToExpand direction="horizontal" minWidth={100} initialWidth={15 * 16} backgroundColor="bg-taskinatorLightGrey ">
          <div className="flex flex-col border-r border-taskinatorMedGrey grow ">
            <div className="border-b border-taskinatorMedGrey font-medium text-taskinatorDarkGrey text-base" style={{ height: `${HEADER_HEIGHT_REM}rem` }}></div>

            <div className="border-b border-taskinatorMedGrey font-medium text-taskinatorDarkGrey text-base" style={{ height: `${HEADER_HEIGHT_REM}rem` }}>
              <div className="p-2 bg-gray-50 flex items-center">Task </div>
            </div>

            <div className="flex-1">
              {Object.values(workflows).map((workflow) => (
                <div key={workflow.workflowId} className="relative">
                  <div className="bg-gray-200 font-semibold" style={{ height: `${ROW_HEIGHT_REM}rem` }}>
                    <div className="p-2 text-sm flex items-center">
                      <div className="mr-2">☰</div>
                      <input
                        type="text"
                        value={workflow.name}
                        onChange={(e) => {
                          updateWorkflow(workflow.workflowId, { name: e.target.value });
                        }}
                        className="w-full bg-gray-200 focus:outline-taskinatorBlue px-1"
                      />
                    </div>
                  </div>

                  {Object.values(tasks)
                    .filter((task) => task.workflowId === workflow.workflowId)
                    .map((task, taskIndex) => (
                      <div key={taskIndex} className="border-b border-taskinatorMedGrey" style={{ height: `${ROW_HEIGHT_REM}rem` }}>
                        <div className="p-2 text-sm">
                          <input
                            type="text"
                            value={task.title}
                            onChange={(e) => {
                              updateTask(task.taskId, { title: e.target.value });
                            }}
                            className="w-full bg-taskinatorLightGrey focus:outline-taskinatorBlue px-1"
                          />
                        </div>
                      </div>
                    ))}

                  <div className="border-b border-taskinatorMedGrey" style={{ height: `${ROW_HEIGHT_REM}rem` }}>
                    <Button
                      label="Add Task"
                      icon={<MdAddCircle />}
                      onClick={() => createNewTask(workflow.workflowId)}
                      customClasses="px-2 text-taskinatorBlue hover:text-taskinatorDarkBlue h-8 font-medium text-sm flex items-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DragToExpand>

        <DragToExpand direction="horizontal" minWidth={100} initialWidth={12 * 16} backgroundColor="bg-taskinatorLightGrey">
          <div className="flex flex-col border-r border-taskinatorMedGrey ">
            <div className="border-b border-taskinatorMedGrey font-medium text-taskinatorDarkGrey text-base" style={{ height: `${HEADER_HEIGHT_REM}rem` }}></div>

            <div className="border-b border-taskinatorMedGrey font-medium text-taskinatorDarkGrey text-base" style={{ height: `${HEADER_HEIGHT_REM}rem` }}>
              <div className="p-2 bg-gray-50 flex items-center">Team</div>
            </div>

            <div className="flex-1">
              {Object.values(workflows).map((workflow) => {
                const workflowTasks = Object.values(tasks).filter((task) => task.workflowId === workflow.workflowId);
                return (
                  <div key={workflow.workflowId} className="relative">
                    <div className="bg-gray-200" style={{ height: `${ROW_HEIGHT_REM}rem` }}>
                      <div className="p-2 text-sm"></div>
                    </div>

                    {workflowTasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="border-b border-taskinatorMedGrey" style={{ height: `${ROW_HEIGHT_REM}rem` }}>
                        <div className="p-2 text-sm">{task.team}</div>
                      </div>
                    ))}

                    <div className="border-b border-taskinatorMedGrey" style={{ height: `${ROW_HEIGHT_REM}rem` }}></div>
                  </div>
                );
              })}
            </div>
          </div>
        </DragToExpand>

        <div className="flex flex-col flex-1 h-fit">
          <div className="flex border-b border-taskinatorMedGrey font-medium text-taskinatorDarkGrey text-base" style={{ height: `${HEADER_HEIGHT_REM}rem` }}>
            <div className="border-r border-taskinatorMedGrey p-2  flex items-center" style={{ width: "8rem" }}></div>
            <div className="border-r border-taskinatorMedGrey p-2  flex items-center" style={{ width: "10rem" }}></div>
            <div className="border-r border-taskinatorMedGrey p-2  flex items-center" style={{ width: "10rem" }}></div>
            <div className="border-r border-taskinatorMedGrey p-2  flex items-center" style={{ width: "10rem" }}></div>
          </div>

          <div className="flex border-b border-taskinatorMedGrey font-medium text-taskinatorDarkGrey text-base" style={{ height: `${HEADER_HEIGHT_REM}rem` }}>
            <div className="border-r border-taskinatorMedGrey p-2 bg-gray-50 flex items-center" style={{ width: "8rem" }}>
              Duration
            </div>
            <div className="border-r border-taskinatorMedGrey p-2 bg-gray-50 flex items-center" style={{ width: "10rem" }}>
              Due Date
            </div>
            <div className="border-r border-taskinatorMedGrey p-2 bg-gray-50 flex items-center" style={{ width: "10rem" }}>
              Start Date
            </div>
            <div className="border-r border-taskinatorMedGrey p-2 bg-gray-50 flex items-center" style={{ width: "10rem" }}>
              Finish Date
            </div>
          </div>

          <div className="flex-1">
            {Object.values(workflows).map((workflow) => {
              const workflowTasks = Object.values(tasks).filter((task) => task.workflowId === workflow.workflowId);

              return (
                <div key={workflow.workflowId} className="relative">
                  <div className="flex bg-gray-200" style={{ height: `${ROW_HEIGHT_REM}rem` }}>
                    <div className="border-r border-taskinatorMedGrey p-2 text-sm" style={{ width: "8rem" }}>
                      {workflow?.duration || "-"}
                    </div>
                    <div className="border-r border-taskinatorMedGrey p-2 text-sm" style={{ width: "10rem" }}></div>
                    <div className="border-r border-taskinatorMedGrey p-2 text-sm" style={{ width: "10rem" }}>
                      {workflow?.startDate instanceof Date && !isNaN(workflow.startDate.getTime()) ? format(workflow.startDate, "dd/MM/yyyy") : "-"}
                    </div>
                    <div className="border-r border-taskinatorMedGrey p-2 text-sm" style={{ width: "10rem" }}>
                      {workflow?.startDate instanceof Date && !isNaN(workflow.startDate.getTime()) && workflow?.duration ? format(addDays(workflow.startDate, workflow.duration), "dd/MM/yyyy") : "-"}
                    </div>
                  </div>

                  {workflowTasks.map((task, taskIndex) => (
                    <div key={taskIndex} className="flex border-b border-taskinatorMedGrey" style={{ height: `${ROW_HEIGHT_REM}rem` }}>
                      <div className="border-r border-taskinatorMedGrey p-2 text-sm w-f" style={{ width: "8rem" }}>
                        <DurationInput
                          defaultValue={task.duration}
                          onDurationChange={(value) => {
                            console.log(value, "value");
                            updateTask(task.taskId, { duration: value });
                          }}
                          customClasses="w-full h-full bg-taskinatorLightGrey focus:outline-taskinatorBlue px-1"
                        />
                      </div>
                      <div className="border-r border-taskinatorMedGrey p-2 text-sm" style={{ width: "10rem" }}>
                        <input
                          type="date"
                          value={task.startDate instanceof Date && !isNaN(task.startDate.getTime()) ? format(task.startDate, "yyyy-MM-dd") : ""}
                          min={task.earliestAllowedStartDate instanceof Date && !isNaN(task.earliestAllowedStartDate.getTime()) ? format(task.earliestAllowedStartDate, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            const value = e.target.value ? new Date(e.target.value) : null;
                            if (value && !isNaN(value.getTime())) {
                              updateTask(task.taskId, { startDate: value });
                            } else {
                              updateTask(task.taskId, { startDate: null });
                            }
                          }}
                          className="w-full bg-taskinatorLightGrey focus:outline-taskinatorBlue px-1"
                        />
                      </div>
                      <div className="border-r border-taskinatorMedGrey p-2 text-sm" style={{ width: "10rem" }}>
                        <input
                          type="date"
                          value={task.startDate instanceof Date && !isNaN(task.startDate.getTime()) ? format(task.startDate, "yyyy-MM-dd") : ""}
                          min={task.earliestAllowedStartDate instanceof Date && !isNaN(task.earliestAllowedStartDate.getTime()) ? format(task.earliestAllowedStartDate, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            const value = e.target.value ? new Date(e.target.value) : null;
                            if (value && !isNaN(value.getTime())) {
                              updateTask(task.taskId, { startDate: value });
                            } else {
                              updateTask(task.taskId, { startDate: null });
                            }
                          }}
                          className="w-full bg-taskinatorLightGrey focus:outline-taskinatorBlue px-1"
                        />
                      </div>
                      <div className="border-r border-taskinatorMedGrey p-2 text-sm" style={{ width: "10rem" }}>
                        {task.startDate instanceof Date && !isNaN(task.startDate.getTime()) && task.duration
                          ? format(addDays(task.startDate, Math.ceil(getDurationInDays(task.duration) - 1)), "dd/MM/yyyy")
                          : "-"}
                      </div>
                    </div>
                  ))}

                  <div className="flex border-b border-taskinatorMedGrey" style={{ height: `${ROW_HEIGHT_REM}rem` }}>
                    <div className="border-r border-taskinatorMedGrey" style={{ width: "8rem" }}></div>
                    <div className="border-r border-taskinatorMedGrey" style={{ width: "10rem" }}></div>
                    <div className="border-r border-taskinatorMedGrey" style={{ width: "10rem" }}></div>
                    <div className="border-r border-taskinatorMedGrey" style={{ width: "10rem" }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-2 z-40">
        <Button
          label="Add Workflow"
          icon={<MdAddCircle />}
          onClick={() => addWorkflow()}
          customClasses="px-2 text-taskinatorWhite bg-taskinatorDarkGrey h-8 font-medium rounded hover:underline text-sm"
        />
      </div>
    </div>
  );
};

export default TaskDetailsSection;
