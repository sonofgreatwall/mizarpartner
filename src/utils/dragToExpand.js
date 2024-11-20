import React, { useState, useEffect, useRef } from "react";

const DragToExpand = ({
  children,
  minHeight = 100,
  minWidth = 200,
  initialHeight = 200,
  initialWidth = 400,
  customCSS = "",
  direction = "vertical", // "vertical", "horizontal", or "both"
  limitToContent = false,
  backgroundColor = "bg-taskinatorWhite",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startX, setStartX] = useState(0);
  const [startHeight, setStartHeight] = useState(initialHeight);
  const [startWidth, setStartWidth] = useState(initialWidth);
  const [currentHeight, setCurrentHeight] = useState(initialHeight);
  const [currentWidth, setCurrentWidth] = useState(initialWidth);
  const contentRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault(); // Prevent text selection
    setIsDragging(true);
    setStartY(e.clientY);
    setStartX(e.clientX);
    setStartHeight(currentHeight);
    setStartWidth(currentWidth);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent text selection while dragging

    if (direction === "vertical" || direction === "both") {
      const deltaY = e.clientY - startY;
      let newHeight = Math.max(minHeight, startHeight + deltaY);

      if (limitToContent && contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        newHeight = Math.min(newHeight, contentHeight);
      }

      setCurrentHeight(newHeight);
    }

    if (direction === "horizontal" || direction === "both") {
      const deltaX = e.clientX - startX;
      let newWidth = Math.max(minWidth, startWidth + deltaX);

      if (limitToContent && contentRef.current) {
        const contentWidth = contentRef.current.scrollWidth;
        newWidth = Math.min(newWidth, contentWidth);
      }

      setCurrentWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      // Disable text selection while dragging
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      // Re-enable text selection
      document.body.style.userSelect = "";
    };
  }, [isDragging, startY, startX, startHeight, startWidth]);

  return (
    <div
      className="relative w-full h-fit "
      style={{
        height: direction !== "horizontal" ? `${currentHeight}px` : "auto",
        width: direction !== "vertical" ? `${currentWidth}px` : "auto",
      }}
    >
      <div ref={contentRef} className={`${customCSS}  h-full w-full`} style={{ marginBottom: "0.5rem" }}>
        {children}
      </div>

      {direction === "vertical" && (
        <div
          className={`absolute -bottom-0.5 left-0 right-0 h-1  ${backgroundColor ? backgroundColor : "bg-taskinatorMedGrey"} cursor-ns-resize group flex items-center`}
          onMouseDown={handleMouseDown}
        >
          <div className="h-[2px] group-hover:h-[4px] bg-taskinatorMedGrey group-hover:bg-taskinatorBlue flex-1 mx-0.6 transition-all" />
          <div className="flex gap-1 px-0.5">
            <div className="w-1 h-1 rounded-full bg-taskinatorMedGrey group-hover:bg-taskinatorBlue" />
            <div className="w-1 h-1 rounded-full bg-taskinatorMedGrey group-hover:bg-taskinatorBlue" />
            <div className="w-1 h-1 rounded-full bg-taskinatorMedGrey group-hover:bg-taskinatorBlue" />
          </div>
          <div className="h-[2px] group-hover:h-[4px] bg-taskinatorMedGrey group-hover:bg-taskinatorBlue flex-1 mx-0.6 transition-all" />
        </div>
      )}

      {direction === "horizontal" && (
        <div
          className={`absolute top-0 bottom-0 -right-0.5 z-20 w-1 ${backgroundColor ? backgroundColor : "bg-taskinatorMedGrey"} cursor-ew-resize group flex flex-col justify-center items-center`}
          onMouseDown={handleMouseDown}
        >
          <div className="w-[2px] group-hover:w-[4px] bg-taskinatorMedGrey group-hover:bg-taskinatorBlue flex-1 my-0.6 transition-all" />
          <div className="flex flex-col gap-1 py-0.5">
            <div className="w-1 h-1 rounded-full bg-taskinatorMedGrey group-hover:bg-taskinatorBlue" />
            <div className="w-1 h-1 rounded-full bg-taskinatorMedGrey group-hover:bg-taskinatorBlue" />
            <div className="w-1 h-1 rounded-full bg-taskinatorMedGrey group-hover:bg-taskinatorBlue" />
          </div>
          <div className="w-[2px] group-hover:w-[4px] bg-taskinatorMedGrey group-hover:bg-taskinatorBlue flex-1 my-0.6 transition-all" />
        </div>
      )}
      {direction === "both" && (
        <>
          <div
            className={`absolute -bottom-0.5 left-0 right-0 h-1 ${backgroundColor ? backgroundColor : "bg-taskinatorMedGrey"} cursor-ns-resize group flex items-center`}
            onMouseDown={handleMouseDown}
          >
            <div className="h-[2px] group-hover:h-[4px] bg-taskinatorMedGrey group-hover:bg-taskinatorBlue flex-1 mx-0.6 transition-all" />
            <div className="flex gap-1 px-0.5">
              <div className="w-1 h-1 rounded-full bg-taskinatorMedGrey group-hover:bg-taskinatorBlue" />
              <div className="w-1 h-1 rounded-full bg-taskinatorMedGrey group-hover:bg-taskinatorBlue" />
              <div className="w-1 h-1 rounded-full bg-taskinatorMedGrey group-hover:bg-taskinatorBlue" />
            </div>
            <div className="h-[2px] group-hover:h-[4px] bg-taskinatorMedGrey group-hover:bg-taskinatorBlue flex-1 mx-0.6 transition-all" />
          </div>
          <div
            className={`absolute top-0 bottom-0 -right-0.5 z-20 w-1 ${backgroundColor ? backgroundColor : "bg-taskinatorMedGrey"} cursor-ew-resize group flex flex-col justify-center items-center`}
            onMouseDown={handleMouseDown}
          >
            <div className="w-[2px] group-hover:w-[4px] bg-taskinatorMedGrey group-hover:bg-taskinatorBlue flex-1 my-0.6 transition-all" />
            <div className="flex flex-col gap-1 py-0.5">
              <div className="w-1 h-1 rounded-full bg-taskinatorMedGrey group-hover:bg-taskinatorBlue" />
              <div className="w-1 h-1 rounded-full bg-taskinatorMedGrey group-hover:bg-taskinatorBlue" />
              <div className="w-1 h-1 rounded-full bg-taskinatorMedGrey group-hover:bg-taskinatorBlue" />
            </div>
            <div className="w-[2px] group-hover:w-[4px] bg-taskinatorMedGrey group-hover:bg-taskinatorBlue flex-1 my-0.6 transition-all" />
          </div>
        </>
      )}
    </div>
  );
};

export default DragToExpand;
