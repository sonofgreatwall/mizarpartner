import React, { useState } from "react";
import { MdPlayArrow } from "react-icons/md";
import IconSpinner from "../utils/iconSpinner";

const Button = ({ label, onClick, optionsOnClick, displayUp, disabled, customClasses, type, isLoading, error, loadingPercentage, onMouseLeave, onMouseEnter, grow, icon, iconHover }) => {
  const disableButton = disabled || isLoading;
  const [viewOptions, setViewOptions] = useState();

  return (
    <div className={`flex flex-col items-center justify-center h-full ${grow ? "w-full" : ""}`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className="flex w-full">
        {optionsOnClick && (
          <button
            className={`whitespace-nowrap border-r border-r-taskinatorLightGrey font-semibold flex items-center justify-center rounded-l-md hover:scale-105 ${customClasses} ${
              disabled ? "cursor-not-allowed" : ""
            }`}
            onClick={() => setViewOptions(viewOptions ? null : true)}
            disabled={disableButton}
          >
            <div className="px-1 "> {!isLoading && <MdPlayArrow />}</div>
          </button>
        )}
        <button
          className={`whitespace-nowrap flex items-center justify-center font-semibold px-2 ${optionsOnClick ? "rounded-r-md" : "rounded-md"} hover:scale-105 ${customClasses} ${
            disabled ? "cursor-not-allowed" : ""
          }`}
          onClick={onClick}
          type={type}
          disabled={disableButton}
        >
          {!isLoading && (
            <div className="flex items-center ">
              <div className={`${icon ? "pr-2" : "hidden"}`}>{icon}</div>
              {label}
            </div>
          )}
          {isLoading && (
            <div className="text-taskinatorWhite flex justify-center items-center">
              <IconSpinner color="text-taskinatorWhite" />
              {loadingPercentage && <div className="pl-2 text-xs">{loadingPercentage}</div>}
            </div>
          )}
        </button>
      </div>
      {viewOptions && (
        <div
          className=" bg-taskinatorWhite shadow border-taskinatorMedGrey rounded z-20 sticky top-2 border w-full"
          onClick={() => {
            setViewOptions();
          }}
        >
          Options{" "}
        </div>
      )}
      {error && <div className="justify-center items-center w-full text-xs text-taskinatorRed text-center">{error}</div>}
    </div>
  );
};
export default Button;
