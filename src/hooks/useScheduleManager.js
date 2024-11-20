import React, { useReducer, useCallback, useEffect, useState, useRef, useMemo } from "react";
import { addDays, addHours, max, min, differenceInDays, differenceInHours, differenceInWeeks, differenceInMonths } from "date-fns";
import { v4 as uuidv4 } from "uuid";
// Action Types
const ACTIONS = {
  SET_DEFAULTS: "SET_DEFAULTS",
  UPDATE_TASK: "UPDATE_TASK",
  UPDATE_WORKFLOW: "UPDATE_WORKFLOW",
  UPDATE_DEPENDENCIES: "UPDATE_DEPENDENCIES",
  SET_DATE_RANGE: "SET_DATE_RANGE",
  SET_CURRENT_TIME: "SET_CURRENT_TIME",
  ADD_TASK: "ADD_TASK",
  ADD_WORKFLOWS: "ADD_WORKFLOWS",
  REMOVE_DEPENDENCY: "REMOVE_DEPENDENCY",
  SET_ZOOM_LEVEL: "SET_ZOOM_LEVEL",
  SET_CURRENT_VISIBLE_INDEX: "SET_CURRENT_VISIBLE_INDEX",
};

// Initial state

// Helper functions
const getDurationInDays = (durationString) => {
  if (!durationString) return null;

  const match = durationString?.match(/^(\d+)([mhdw])$/);
  if (!match) return null;

  const [, number, unit] = match;
  const num = parseInt(number, 10);

  switch (unit) {
    case "m":
      return num / (24 * 60); // minutes to days
    case "h":
      return num / 24; // hours to days
    case "d":
      return num; // already in days
    case "w":
      return num * 7; // weeks to days
    default:
      return null;
  }
};

const getCurrentDateByIndexHandler = (index, state) => {
  if (index < 0) return null;

  const startDate = state?.earliestStartDate;
  if (!startDate) return null;

  switch (state.zoomLevel) {
    case "hours": {
      // Each index represents 1 hour
      const date = new Date(startDate);
      date.setHours(date.getHours() + index);
      date.setMinutes(0, 0, 0);
      return date;
    }
    case "days": {
      // Each index represents 1 day
      const date = new Date(startDate);
      date.setDate(date.getDate() + index);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    case "weeks": {
      // Each index represents 1 week
      const date = new Date(startDate);
      date.setDate(date.getDate() + index * 7);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    case "months": {
      // Each index represents 1 month
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + index);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    default:
      return null;
  }
};

// this function updates the earliest allowed start date for each task based on its dependencies
const updateEarliestStartDates = (dataToDisplayOnChart, newSchedule) => {
  let updatedData = { ...dataToDisplayOnChart };

  const tasks = Object.values(updatedData).filter((item) => item.type === "task");
  const workflows = Object.values(updatedData).filter((item) => item.type === "workflow");

  let earliestStartDate = newSchedule ? new Date() : tasks.sort((a, b) => a.startDate - b.startDate)[0].startDate;

  let taskWithLatestFinishDate = tasks.sort((a, b) => addDays(b.startDate, getDurationInDays(b.duration)) - addDays(a.startDate, getDurationInDays(a.duration)))[0];
  let latestFinishDate = addDays(taskWithLatestFinishDate.startDate, getDurationInDays(taskWithLatestFinishDate.duration) - 1);
  // First get all tasks

  tasks.forEach((task) => {
    // Find all tasks that have dependencies pointing to this task
    const dependencyTasks = tasks.filter((sourceTask) => sourceTask.dependencies.some((dep) => dep.toId === task.taskId));

    // If no dependencies, set earliest allowed start date to first date in range
    if (dependencyTasks.length === 0) {
      task.earliestAllowedStartDate = earliestStartDate;
      return;
    }

    // Find the latest end date among all dependency tasks
    task.earliestAllowedStartDate = dependencyTasks.reduce((latestDate, depTask) => {
      const depDurationInDays = getDurationInDays(depTask.duration);
      const depEndDate = addDays(depTask.startDate, depDurationInDays - 1);
      return latestDate ? max([latestDate, depEndDate]) : depEndDate;
    }, null);

    // If earliest start is null, set to first date in range
    if (!task.earliestAllowedStartDate) {
      task.earliestAllowedStartDate = earliestStartDate;
    }

    // If task starts before earliest allowed date, update its start date
    if (task.earliestAllowedStartDate && task.startDate <= task.earliestAllowedStartDate) {
      task.startDate = addDays(task.earliestAllowedStartDate, 1);
      // Recalculate task validity
    }

    const durationInDays = getDurationInDays(task.duration);
    task.isValid = Boolean(durationInDays && task.startDate);

    updatedData[task.taskId] = task;
  });

  if (workflows.length > 0) {
    workflows.forEach((workflow) => {
      const workflowTasks = tasks.filter((task) => task.workflowId === workflow.workflowId);

      if (workflowTasks.length === 0) {
        // workflow.startDate = null;
        // workflow.finishDate = null;
        // workflow.duration = 0;
        return;
      }

      // Find earliest start date and latest finish date among workflow tasks
      const startDates = workflowTasks.map((task) => task.startDate).filter((date) => date instanceof Date);

      const finishDates = workflowTasks
        .map((task) => {
          if (task.startDate instanceof Date) {
            const duration = getDurationInDays(task.duration);
            return duration ? addDays(task.startDate, duration - 1) : null;
          }
          return null;
        })
        .filter((date) => date instanceof Date);

      if (startDates.length > 0 && finishDates.length > 0) {
        workflow.startDate = min(startDates);
        workflow.finishDate = max(finishDates);
        workflow.duration = differenceInDays(workflow.finishDate, workflow.startDate);
      } else {
        workflow.startDate = null;
        workflow.finishDate = null;
        workflow.duration = 0;
      }

      updatedData[workflow.workflowId] = workflow;
    });
  }

  return {
    dataToDisplayOnChart: updatedData,
    earliestStartDate,
    latestFinishDate,
  };
};

const scheduleReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_DEFAULTS:
      const { dataToDisplayOnChart, earliestStartDate, latestFinishDate } = updateEarliestStartDates(action.payload.dataToDisplayOnChart, state.newSchedule);

      return {
        ...state,
        dataToDisplayOnChart,
        earliestStartDate,
        latestFinishDate,
      };

    case ACTIONS.NEW_TASK: {
      const taskId = uuidv4();

      const tasks = Object.values(state.dataToDisplayOnChart)
        .filter((item) => item.type === "task" && item.workflowId === action.payload)
        .sort((a, b) => b?.rowIndex - a?.rowIndex)[0];

      const newIndex = tasks ? tasks?.rowIndex + 1 : 0;
      const dateAtFirstVisibleIndex = getCurrentDateByIndexHandler(state.currentVisibleIndex, state);
      const startDateOfWorkflow = state.dataToDisplayOnChart[action.payload]?.startDate;


      const dateToUse = dateAtFirstVisibleIndex.getTime() > startDateOfWorkflow.getTime() ? dateAtFirstVisibleIndex : startDateOfWorkflow;
      
      console.log(state.currentVisibleIndex, "dateToUse", dateToUse, 
        "index", dateAtFirstVisibleIndex,  
        "workflow ",startDateOfWorkflow, );


      const tasksWithNewTask = {
        ...state.dataToDisplayOnChart,
        [taskId]: {
          taskId: taskId,
          title: "",
          startDate: dateToUse, 
          duration: state.zoomLevel === "hours" ? "1h" : "1d",
          team: "",
          isValid: false,
          earliestAllowedStartDate: null,
          rowIndex: newIndex,
          dependencies: [],
          workflowId: action.payload,
          type: "task",
        },
      };

      const { dataToDisplayOnChart, earliestStartDate, latestFinishDate } = updateEarliestStartDates(tasksWithNewTask, state.newSchedule);

      return {
        ...state,
        dataToDisplayOnChart,
        earliestStartDate,
        latestFinishDate,
      };
    }

    case ACTIONS.ADD_WORKFLOWS: {
      const { workflow } = action.payload;
      const workflowId = workflow?.workflowId || uuidv4();

      const workflows = Object.values(state.dataToDisplayOnChart)
        .filter((item) => item.type === "workflow")
        .sort((a, b) => b.rowIndex - a.rowIndex);

      const newIndex = workflows.length ? workflows[0].rowIndex + 1 : 0;

      const startDate = getCurrentDateByIndexHandler(state.currentVisibleIndex, state);

      const tasksWithNewWorkflow = {
        ...state.dataToDisplayOnChart,
        [workflowId]: {
          ...workflow,
          workflowId,
          rowIndex: newIndex,
          startDate,
          finishDate: state.zoomLevel === "hours" ? addHours(startDate, 0) : addDays(startDate, 0),
          type: "workflow",
        },
      };

      const { dataToDisplayOnChart, earliestStartDate, latestFinishDate } = updateEarliestStartDates(tasksWithNewWorkflow, state.newSchedule);

      return {
        ...state,
        dataToDisplayOnChart,
        earliestStartDate,
        latestFinishDate,
      };
    }

    case ACTIONS.UPDATE_TASK: {
      const { taskId, updates } = action.payload;

      const updatedTasks = { ...state.dataToDisplayOnChart };
      if (updatedTasks[taskId]) {
        updatedTasks[taskId] = {
          ...updatedTasks[taskId],
          ...updates,
        };
        // Validate task
        const durationInDays = getDurationInDays(updatedTasks[taskId].duration);
        updatedTasks[taskId].isValid = Boolean(durationInDays && updatedTasks[taskId].startDate);
      }

      // Update earliest start dates after task update
      const { dataToDisplayOnChart, earliestStartDate, latestFinishDate } = updateEarliestStartDates(updatedTasks, state.newSchedule);

      return {
        ...state,
        dataToDisplayOnChart,
        earliestStartDate,
        latestFinishDate,
      };
    }

    case ACTIONS.UPDATE_DEPENDENCIES: {
      const { newDependency } = action.payload;
      const updatedTasks = { ...state.dataToDisplayOnChart };
      const fromTask = Object.values(updatedTasks).find((task) => task.taskId === newDependency.from.taskId);

      if (fromTask) {
        // Check if dependency already exists
        const dependencyExists = fromTask.dependencies.some((dep) => dep.fromId === newDependency.from.taskId && dep.toId === newDependency.to.taskId);

        if (!dependencyExists) {
          const taskId = fromTask.taskId;

          updatedTasks[taskId] = {
            ...updatedTasks[taskId],
            dependencies: [
              ...updatedTasks[taskId].dependencies,
              {
                fromId: newDependency.from.taskId,
                toId: newDependency.to.taskId,
                fromPosition: newDependency.from.position,
                toPosition: newDependency.to.position,
                direction: newDependency.direction,
              },
            ],
          };
        }
      }

      // Update earliest start dates after adding dependency
      const { dataToDisplayOnChart, earliestStartDate, latestFinishDate } = updateEarliestStartDates(updatedTasks, state.newSchedule);

      return {
        ...state,
        dataToDisplayOnChart,
        earliestStartDate,
        latestFinishDate,
      };
    }

    case ACTIONS.UPDATE_WORKFLOW: {
      const { workflowId, updates } = action.payload;
      const updatedWorkflows = { ...state.dataToDisplayOnChart };
      if (updatedWorkflows[workflowId]) {
        updatedWorkflows[workflowId] = {
          ...updatedWorkflows[workflowId],
          ...updates,
        };
      }

      return {
        ...state,
        dataToDisplayOnChart: updatedWorkflows,
      };
    }

    case ACTIONS.SET_ZOOM_LEVEL: {
      // const dates = calculateColumnDisplay(action.payload, state.tasks);

      return {
        ...state,

        zoomLevel: action.payload,
      };
    }

    case ACTIONS.SET_CURRENT_VISIBLE_INDEX: {
      return {
        ...state,
        currentVisibleIndex: action.payload,
      };
    }

    case ACTIONS.SET_DATE_RANGE:
      return {
        ...state,
        dateRange: action.payload,
      };

    case ACTIONS.SET_CURRENT_TIME:
      return {
        ...state,
        currentTime: action.payload,
      };

    default:
      return state;
  }
};

export const useScheduleManager = (newSchedule) => {
  const initialState = {
    currentTime: new Date(),
    zoomLevel: "days",
    columnMap: new Map(),
    dataToDisplayOnChart: {},
    newSchedule: newSchedule ?? false,
    currentVisibleIndex: 0,
  };

  const [state, dispatch] = useReducer(scheduleReducer, initialState);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragTaskId, setDragTaskId] = useState(null);
  const [initialDuration, setInitialDuration] = useState(0);
  const [dragSide, setDragSide] = useState(null); // 'left', 'right' or 'move'
  const [initialStartDate, setInitialStartDate] = useState(null);
  const [isDrawingDependency, setIsDrawingDependency] = useState(false);
  const [dependencyLine, setDependencyLine] = useState({ start: null, current: null });
  const [sourceTask, setSourceTask] = useState(null); // {taskId, position}
  const [hoveredNode, setHoveredNode] = useState(null); // {taskId, position}
  const [lastDaysChange, setLastDaysChange] = useState(0); // Track last days change
  const [selectedDependency, setSelectedDependency] = useState(null); // Track selected dependency line
  const [dependencyMenuPosition, setDependencyMenuPosition] = useState(null); // Position for dependency menu

  const taskRefs = useRef({});
  const menuRef = useRef(null);

  const ROW_HEIGHT_REM = 2;
  let COLUMN_WIDTH_REM = 3;
  const INFO_COLUMN_WIDTH = "12rem";
  const HEADER_HEIGHT_REM = 2;

  COLUMN_WIDTH_REM = useMemo(() => {
    switch (state.zoomLevel) {
      case "days":
        return COLUMN_WIDTH_REM;
      case "weeks":
        return COLUMN_WIDTH_REM * 4;
      case "months":
        return COLUMN_WIDTH_REM * 12;
      default:
        return 1.5;
    }
  }, [state.zoomLevel]);

  /// this updates the current time
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({
        type: ACTIONS.SET_CURRENT_TIME,
        payload: new Date(),
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []); // Re-run when tasks or zoom level changes

  useEffect(() => {
    ////this will all be incoming data from server
    const workflow1Id = uuidv4();
    const workflow2Id = uuidv4();
    const task1Id = uuidv4();
    const task2Id = uuidv4();
    const task3Id = uuidv4();
    const task4Id = uuidv4();
    const task5Id = uuidv4();
    const task6Id = uuidv4();

    const tasks = [
      {
        taskId: task1Id,
        title: "Project Planning",
        startDate: new Date(addDays(new Date().setHours(0, 0, 0, 0), 5)), // Start at beginning of day
        duration: "7h",
        status: "in-progress",
        team: "Design Team",
        dependencies: [],
        workflowId: workflow1Id,
        rowIndex: 0,
        isValid: true,
        earliestAllowedStartDate: null,
        type: "task",
      },
      {
        taskId: task2Id,
        title: "Design Phase",
        startDate: new Date(addDays(new Date().setHours(0, 0, 0, 0), 7)), // Start at beginning of day
        duration: "10d",
        status: "not-started",
        team: "Design Team",
        dependencies: [],
        workflowId: workflow1Id,
        rowIndex: 1,
        isValid: true,
        earliestAllowedStartDate: null,
        type: "task",
      },
      {
        taskId: task3Id,
        title: "Development Sprint 1",
        startDate: new Date(addDays(new Date().setHours(0, 0, 0, 0), 20)), // Start at beginning of day
        duration: "14d",
        status: "not-started",
        team: "Dev Team",
        dependencies: [],
        workflowId: workflow1Id,
        rowIndex: 2,
        isValid: true,
        earliestAllowedStartDate: null,
        type: "task",
      },
      {
        taskId: task3Id,
        title: "Development Sprint 1",
        startDate: new Date(addDays(new Date().setHours(0, 0, 0, 0), 20)), // Start at beginning of day
        duration: "14d",
        status: "not-started",
        team: "Dev Team",
        dependencies: [],
        workflowId: workflow1Id,
        rowIndex: 3,
        isValid: true,
        earliestAllowedStartDate: null,
        type: "task",
      },
      {
        taskId: task4Id,
        title: "Testing & QA",
        startDate: new Date(addDays(new Date().setHours(0, 0, 0, 0), 35)), // Start at beginning of day
        duration: "7d",
        status: "not-started",
        team: "QA Team",
        dependencies: [],
        workflowId: workflow1Id,
        rowIndex: 4,
        isValid: true,
        earliestAllowedStartDate: null,
        type: "task",
      },
      {
        taskId: task5Id,
        title: "Development Sprint 2",
        startDate: new Date(addDays(new Date().setHours(0, 0, 0, 0), 20)), // Start at beginning of day
        duration: "14d",
        status: "not-started",
        team: "Dev Team",
        dependencies: [],
        workflowId: workflow2Id,
        rowIndex: 0,
        isValid: true,
        earliestAllowedStartDate: null,
        type: "task",
      },
      {
        taskId: task6Id,
        title: "Development Sprint 3",
        startDate: new Date(addDays(new Date().setHours(0, 0, 0, 0), 20)), // Start at beginning of day
        duration: "14d",
        status: "not-started",
        team: "Dev Team",
        dependencies: [],
        workflowId: workflow2Id,
        rowIndex: 1,
        isValid: true,
        earliestAllowedStartDate: null,
        type: "task",
      },
    ];

    const workflows = [
      {
        workflowId: workflow1Id,
        name: "Main Project Workflow",
        rowIndex: 0,
        type: "workflow",
      },
      {
        workflowId: workflow2Id,
        name: " 2 Main Project Workflow",
        rowIndex: 1,
        type: "workflow",
      },
    ];
    ////this will all be incoming data from server

    let dataToDisplayOnChart = {};

    workflows.map((workflow) => {
      dataToDisplayOnChart[workflow.workflowId] = workflow;

      tasks
        .filter((task) => task.workflowId === workflow.workflowId)
        .sort((a, b) => a.rowIndex - b.rowIndex)
        .map((task) => {
          dataToDisplayOnChart[task.taskId] = task;
        });
    });

    dispatch({
      type: ACTIONS.SET_DEFAULTS,
      payload: {
        dataToDisplayOnChart,
      },
    });
  }, []);

  const updateTask = useCallback((taskId, updates) => {
    dispatch({
      type: ACTIONS.UPDATE_TASK,
      payload: { taskId, updates },
    });
  }, []);

  const updateDependencies = useCallback((newDependency) => {
    dispatch({
      type: ACTIONS.UPDATE_DEPENDENCIES,
      payload: { newDependency },
    });
  }, []);

  const updateWorkflow = useCallback((workflowId, updates) => {
    dispatch({
      type: ACTIONS.UPDATE_WORKFLOW,
      payload: { workflowId, updates },
    });
  }, []);

  const addTask = useCallback((task) => {
    dispatch({
      type: ACTIONS.ADD_TASK,
      payload: { task },
    });
  }, []);

  const createNewTask = useCallback((workflowId) => {
    dispatch({
      type: ACTIONS.NEW_TASK,
      payload: workflowId,
    });
  }, []);

  const addWorkflow = useCallback((workflow) => {
    dispatch({
      type: ACTIONS.ADD_WORKFLOWS,
      payload: { workflow },
    });
  }, []);

  const changeZoomLevel = useCallback((level) => {
    dispatch({
      type: ACTIONS.SET_ZOOM_LEVEL,
      payload: level,
    });
  }, []);

  const setCurrentVisibleIndex = useCallback((index) => {
    dispatch({
      type: ACTIONS.SET_CURRENT_VISIBLE_INDEX,
      payload: index,
    });
  }, []);

  const getCurrentDateByIndex = useCallback(
    (index) => {
      if (state.zoomLevel && state.earliestStartDate) {
        return getCurrentDateByIndexHandler(index, state);
      }
    },
    [state.zoomLevel, state.earliestStartDate]
  );

  const getIndexFromDate = (date) => {
    if (!date) return 0;

    switch (state.zoomLevel) {
      case "hours":
        return differenceInHours(date, state.earliestStartDate) + 1;
      case "days":
        return differenceInDays(date, state.earliestStartDate) + 1;
      case "weeks":
        return differenceInWeeks(date, state.earliestStartDate) + 1;
      case "months":
        return differenceInMonths(date, state.earliestStartDate) + 1;
      default:
        return 0;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setSelectedDependency(null);
        setDependencyMenuPosition(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMouseDown = (e, taskId, side) => {
    const task = state.dataToDisplayOnChart[taskId];

    const taskWidth = state.zoomLevel === "hours" ? getDurationInDays(task.duration) * 24 * COLUMN_WIDTH_REM : getDurationInDays(task.duration) * COLUMN_WIDTH_REM;

    // Prevent dragging if task is too small (less than 2rem)
    if (taskWidth < 2) {
      return;
    }

    e.preventDefault();
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragTaskId(taskId);
    setInitialDuration(task.duration);
    setDragSide(side);
    setInitialStartDate(task.startDate);
    setLastDaysChange(0);
  };

  const handleDependencyStart = (e, taskId, position) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    setIsDrawingDependency(true);

    setSourceTask({ taskId, position });
    setDependencyLine({
      start: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      },
      current: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      },
    });
  };

  const handleDependencyMove = (e) => {
    if (isDrawingDependency) {
      setDependencyLine((prev) => ({
        ...prev,
        current: {
          x: e.clientX,
          y: e.clientY,
        },
      }));
    }
  };

  const handleNodeHover = (taskId, position) => {
    setHoveredNode({ taskId, position });
  };

  const handleNodeLeave = () => {
    setHoveredNode(null);
  };

  const handleDependencyDrop = () => {
    if (isDrawingDependency && sourceTask && hoveredNode) {
      if (sourceTask.position === "right" && hoveredNode.position === "left" && sourceTask.taskId !== hoveredNode.taskId) {
        const sourceTaskObj = state.dataToDisplayOnChart[sourceTask.taskId];
        const targetTaskObj = state.dataToDisplayOnChart[hoveredNode.taskId];

        // Check if target task starts before source task
        if (targetTaskObj.startDate < sourceTaskObj.startDate) {
          handleDependencyEnd();
          return;
        }

        const connectionExists = sourceTaskObj.dependencies.some((dep) => dep.fromId === sourceTask.taskId && dep.toId === hoveredNode.taskId);

        if (!connectionExists) {
          const newDependency = {
            from: { taskId: sourceTask.taskId, position: sourceTask.position },
            to: { taskId: hoveredNode.taskId, position: hoveredNode.position },
            direction: "forward",
          };

          updateDependencies(newDependency);
        }
      }
    }
    handleDependencyEnd();
  };

  const handleDependencyEnd = () => {
    setIsDrawingDependency(false);
    setDependencyLine({ start: null, current: null });
    setSourceTask(null);
    setHoveredNode(null);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !dragTaskId) return;

    const deltaX = e.clientX - dragStartX;
    const task = state.dataToDisplayOnChart[dragTaskId];

    // Calculate change based on zoom level
    let currentDaysChange;
    let currentHoursChange;
    let durationUnit;

    switch (state.zoomLevel) {
      case "weeks":
        currentDaysChange = Math.round(deltaX / (COLUMN_WIDTH_REM * 16)) * 7;
        durationUnit = "w";
        break;
      case "months":
        currentDaysChange = Math.round(deltaX / (COLUMN_WIDTH_REM * 16)) * 30;
        durationUnit = "M";
        break;
      case "hours":
        currentHoursChange = Math.round(deltaX / (COLUMN_WIDTH_REM * 16));
        currentDaysChange = Math.floor(currentHoursChange / 24);
        durationUnit = "h";
        break;
      default: // days
        currentDaysChange = Math.round(deltaX / (COLUMN_WIDTH_REM * 16));
        durationUnit = "d";
    }

    const initialDurationInDays = getDurationInDays(initialDuration);

    // Handle task movement and resizing
    if (dragSide === "move") {
      let newStartDate;
      if (state.zoomLevel === "hours") {
        // Add hours and set minutes/seconds to 0 for start of hour
        newStartDate = addHours(initialStartDate, currentHoursChange);
        newStartDate.setMinutes(0, 0, 0);
      } else {
        // Add days and set hours/minutes/seconds to 0 for start of day
        newStartDate = addDays(initialStartDate, currentDaysChange);
        newStartDate.setHours(0, 0, 0, 0);
      }

      if (newStartDate < task.earliestAllowedStartDate) {
        newStartDate = task.earliestAllowedStartDate;
      }

      updateTask(task.taskId, { startDate: newStartDate });
    } else if (dragSide === "left" || dragSide === "right") {
      // Handle resizing logic
      handleTaskResize(task, dragSide, currentDaysChange, currentHoursChange, initialDurationInDays, durationUnit);
    }

    setLastDaysChange(currentDaysChange);
  };

  // Helper function for task resizing
  const handleTaskResize = (task, side, currentDaysChange, currentHoursChange, initialDurationInDays, durationUnit) => {
    if (side === "left") {
      let newStartDate = state.zoomLevel === "hours" ? addHours(initialStartDate, currentHoursChange) : addDays(initialStartDate, currentDaysChange);

      if (newStartDate < task.earliestAllowedStartDate) {
        newStartDate = task.earliestAllowedStartDate;
      }

      let newDurationInDays = state.zoomLevel === "hours" ? initialDurationInDays - currentHoursChange / 24 : Math.max(1, initialDurationInDays - currentDaysChange);

      const newDuration = formatDuration(newDurationInDays, durationUnit);

      console.log(newDuration, "new duraiton");
      updateTask(task.taskId, {
        startDate: newStartDate,
        duration: newDuration,
      });
    } else {
      let newDurationInDays = state.zoomLevel === "hours" ? initialDurationInDays + currentHoursChange / 24 : Math.max(1, initialDurationInDays + currentDaysChange);

      const newDuration = formatDuration(newDurationInDays, durationUnit);
      updateTask(task.taskId, { duration: newDuration });
    }
  };

  // Helper function to format duration
  const formatDuration = (durationInDays, unit) => {
    switch (unit) {
      case "h":
        return `${Math.max(1, Math.round(durationInDays * 24))}h`;
      case "w":
        return `${Math.max(1, Math.round(durationInDays / 7))}w`;
      default:
        return `${Math.max(1, Math.round(durationInDays))}d`;
    }
  };

  // Simplify handleMouseUp
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragTaskId(null);
    setDragSide(null);
    setLastDaysChange(0);
    handleDependencyEnd();
  };

  useEffect(() => {
    if (isDragging || isDrawingDependency) {
      document.addEventListener("mousemove", isDrawingDependency ? handleDependencyMove : handleMouseMove);
      document.addEventListener("mouseup", isDrawingDependency ? handleDependencyDrop : handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", isDrawingDependency ? handleDependencyMove : handleMouseMove);
      document.removeEventListener("mouseup", isDrawingDependency ? handleDependencyDrop : handleMouseUp);
    };
  }, [isDragging, isDrawingDependency, dragStartX, initialDuration, dragSide, hoveredNode]);

  const handleDependencyClick = (e, dependency) => {
    // Get the click position relative to the line
    const rect = e.target.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    // If click is within 5px of either end of the line, don't show menu
    if (clickX < 5 || clickX > rect.width - 5) {
      return;
    }

    e.stopPropagation();
    if (selectedDependency?.fromId === dependency.fromId && selectedDependency?.toId === dependency.toId) {
      setSelectedDependency(null);
      setDependencyMenuPosition(null);
    } else {
      setSelectedDependency(dependency);
      setDependencyMenuPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDependencyDirectionChange = (direction) => {
    const sourceTask = state.dataToDisplayOnChart[selectedDependency.fromId];
    const dependencies = sourceTask.dependencies.map((dep) => {
      if (dep.fromId === selectedDependency.fromId && dep.toId === selectedDependency.toId) {
        return {
          ...dep,
          direction,
        };
      }
      return dep;
    });

    updateTask(sourceTask.taskId, { dependencies });
    setSelectedDependency(null);
    setDependencyMenuPosition(null);
  };

  const handleDependencyRemove = () => {
    // Find the source task and remove the dependency
    const sourceTask = state.dataToDisplayOnChart[selectedDependency.fromId];
    const dependencies = sourceTask.dependencies.filter((dep) => !(dep.fromId === selectedDependency.fromId && dep.toId === selectedDependency.toId));

    updateTask(sourceTask.taskId, { dependencies });
    setSelectedDependency(null);
    setDependencyMenuPosition(null);
  };

  const renderMenu = () => {
    if (selectedDependency && dependencyMenuPosition) {
      return (
        <div
          ref={menuRef}
          className="fixed bg-white shadow-lg rounded-md border border-gray-200 z-50"
          style={{
            left: dependencyMenuPosition.x,
            top: dependencyMenuPosition.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="px-1 text-wrap text-sm text-center text-taskinatorDarkGrey font-medium bg-taskinatorOffWhite">Direction Control</div>
          <div className="py-1 text-sm">
            <button
              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${!selectedDependency.direction || selectedDependency.direction === "forward" ? "bg-blue-100" : ""}`}
              onClick={() => handleDependencyDirectionChange("forward")}
            >
              Forward
            </button>
            <button
              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedDependency.direction === "backward" ? "bg-blue-100" : ""}`}
              onClick={() => handleDependencyDirectionChange("backward")}
            >
              Backward
            </button>
            <button
              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedDependency.direction === "both" ? "bg-blue-100" : ""}`}
              onClick={() => handleDependencyDirectionChange("both")}
            >
              Both
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600" onClick={handleDependencyRemove}>
              Remove
            </button>
          </div>
        </div>
      );
    }
  };

  const renderDependencyLine = () => {
    if (isDrawingDependency && dependencyLine.start && dependencyLine.current) {
      return (
        <svg className="fixed inset-0 pointer-events-none z-50" style={{ left: 0, top: 0, width: "100%", height: "100%" }}>
          <path
            d={`M ${dependencyLine.start.x} ${dependencyLine.start.y} 
                H ${(dependencyLine.start.x + dependencyLine.current.x) / 2}
                V ${dependencyLine.current.y}
                H ${dependencyLine.current.x}`}
            fill="none"
            stroke="#33ABEF"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </svg>
      );
    }
  };

  return {
    dataToDisplayOnChart: state.dataToDisplayOnChart,
    currentTime: state.currentTime,
    earliestStartDate: state.earliestStartDate,
    latestFinishDate: state.latestFinishDate,

    createNewTask,
    addTask,
    addWorkflow,
    updateTask,
    updateDependencies,
    updateWorkflow,

    getDurationInDays,
    getCurrentDateByIndex,
    getIndexFromDate,
    setCurrentVisibleIndex,
    zoomLevel: state.zoomLevel,

    changeZoomLevel,

    ROW_HEIGHT_REM,
    COLUMN_WIDTH_REM,
    INFO_COLUMN_WIDTH,
    HEADER_HEIGHT_REM,
    ACTIONS,

    taskRefs,
    menuRef,

    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleNodeHover,
    handleNodeLeave,
    handleDependencyClick,
    handleDependencyStart,
    handleDependencyDirectionChange,
    handleDependencyRemove,
    renderMenu,
    renderDependencyLine,
  };
};
