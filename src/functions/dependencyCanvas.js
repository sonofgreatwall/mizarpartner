import React, { useEffect, useRef, useState } from "react";

const DependencyCanvas = ({ tasks, taskRefs, containerRef, selectedDependency, onDependencyClick, zoomLevel, scrollPosition }) => {
  const canvasRef = useRef(null);
  const [hoveredDependency, setHoveredDependency] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const container = containerRef.current;

    if (!container || !scrollPosition) return;

    // Set canvas size to match the full container size including scroll area
    const dpr = window.devicePixelRatio || 1;
    const containerStyle = window.getComputedStyle(container.firstChild);
    const totalWidth = parseFloat(containerStyle.width);
    const totalHeight = parseFloat(containerStyle.height);

    canvas.width = totalWidth * dpr;
    canvas.height = totalHeight * dpr;
    canvas.style.width = `${totalWidth}px`;
    canvas.style.height = `${totalHeight}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw dependencies
    tasks.forEach((task) => {
      if (!task.dependencies) return;

      task.dependencies.forEach((dep) => {
        const fromEl = taskRefs.current[dep.fromId];
        const toEl = taskRefs.current[dep.toId];

        if (fromEl && toEl) {
          // Get absolute positions of elements
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          // Calculate absolute positions within the canvas
          const fromX = (dep.fromPosition === "left" ? fromRect.left : fromRect.right) - containerRect.left + container.scrollLeft - 4.5;
          const fromY = fromRect.top + fromRect.height / 2 - containerRect.top + container.scrollTop;
          const toX = (dep.toPosition === "left" ? toRect.left : toRect.right) - containerRect.left + container.scrollLeft - 4.5;
          const toY = toRect.top + toRect.height / 2 - containerRect.top + container.scrollTop;

          // Draw dependency line
          const midX = (fromX + toX) / 2;
          const isSelected = selectedDependency?.fromId === dep.fromId && selectedDependency?.toId === dep.toId;
          const isHovered = hoveredDependency?.fromId === dep.fromId && hoveredDependency?.toId === dep.toId;

          ctx.beginPath();
          ctx.strokeStyle = dep.direction === "backward" ? "#FF0000" : dep.direction === "both" ? "#00BA34" : "#33ABEF";
          ctx.lineWidth = isHovered ? 2.5 : 2;

          ctx.moveTo(fromX, fromY);
          ctx.lineTo(midX, fromY);
          ctx.lineTo(midX, toY);
          ctx.lineTo(toX, toY);
          ctx.stroke();

          // Draw arrows if enough space
          const horizontalDistance = Math.abs(toX - fromX);
          if (horizontalDistance >= 20) {
            if (dep.direction !== "backward") {
              drawArrow(ctx, midX, toY, toX, toY);
            }
            if (dep.direction === "backward" || dep.direction === "both") {
              drawArrow(ctx, midX, fromY, fromX, fromY);
            }
          }
        }
      });
    });
  }, [tasks, selectedDependency, hoveredDependency, scrollPosition, containerRef.current?.firstChild?.style.width, containerRef.current?.firstChild?.style.height]);

  // Helper function to draw arrows
  const drawArrow = (ctx, fromX, fromY, toX, toY) => {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const handleCanvasMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let foundHoveredDep = null;

    tasks.forEach((task) => {
      if (!task.dependencies) return;

      task.dependencies.forEach((dep) => {
        const fromEl = taskRefs.current[dep.fromId];
        const toEl = taskRefs.current[dep.toId];

        if (fromEl && toEl) {
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();

          const fromX = (dep.fromPosition === "left" ? fromRect.left : fromRect.right) - containerRect.left + container.scrollLeft - 4.5;
          const fromY = fromRect.top + fromRect.height / 2 - containerRect.top + container.scrollTop;
          const toX = (dep.toPosition === "left" ? toRect.left : toRect.right) - containerRect.left + container.scrollLeft - 4.5;
          const toY = toRect.top + toRect.height / 2 - containerRect.top + container.scrollTop;
          const midX = (fromX + toX) / 2;

          if (isPointNearLine(x, y, fromX, fromY, midX, fromY) || isPointNearLine(x, y, midX, fromY, midX, toY) || isPointNearLine(x, y, midX, toY, toX, toY)) {
            foundHoveredDep = dep;
          }
        }
      });
    });

    setHoveredDependency(foundHoveredDep);
    // Update cursor style based on hover state
    canvasRef.current.style.cursor = foundHoveredDep ? "pointer" : "default";
  };

  // Handle clicks on dependency lines
  const handleCanvasClick = (e) => {
    if (hoveredDependency) {
      onDependencyClick(e, hoveredDependency);
    }
  };

  // Helper function to check if a point is near a line
  const isPointNearLine = (px, py, x1, y1, x2, y2) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;

    if (len_sq !== 0) param = dot / len_sq;

    let xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy) < 5; // 5px threshold for click detection
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      onMouseMove={handleCanvasMouseMove}
      onMouseLeave={() => {
        setHoveredDependency(null);
        if (canvasRef.current) {
          canvasRef.current.style.cursor = "default";
        }
      }}
      className="absolute inset-0 z-20"
      style={{
        touchAction: "none",
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "auto",
      }}
    />
  );
};

export default DependencyCanvas;
