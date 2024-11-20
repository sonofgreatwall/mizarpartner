import React, { useState, useEffect } from "react";

const DurationInput = ({ defaultValue, onDurationChange, customClasses = "", placeholder = "e.g. 24h" }) => {
  const [inputValue, setInputValue] = useState(defaultValue || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setInputValue(defaultValue || "");
  }, [defaultValue]);

  const parseDuration = (value) => {
    // Remove extra spaces and convert to lowercase
    const input = value.toLowerCase().trim();

    // Regular expression for hours format
    const pattern = /^(\d+)\s*(hours|hour|hrs|hr|h)$/;

    // Try to match the pattern
    const match = input.match(pattern);
    if (match) {
      const number = parseInt(match[1], 10);
      if (number <= 0) return null; // Validate positive numbers only
      return { value: `${number}h`, display: `${number}h` };
    }

    // If just a number is entered, assume it's hours
    const numberOnly = input.match(/^(\d+)$/);
    if (numberOnly) {
      const number = parseInt(numberOnly[1], 10);
      if (number <= 0) return null;
      return { value: `${number}h`, display: `${number}h` };
    }

    return null;
  };

  const handleInput = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (!value) {
      onDurationChange(null);
      setSuggestions([]);
      setIsValid(true);
      return;
    }

    // Generate suggestions for numbers without units
    const numberMatch = value.match(/^(\d+)$/);
    if (numberMatch) {
      const number = numberMatch[1];
      setSuggestions([
        { value: `${number}h`, display: `${number} hours` }
      ]);
    } else {
      // Check if we're typing an hour unit
      const unitMatch = value.match(/^(\d+)\s*h/i);
      if (unitMatch) {
        const number = unitMatch[1];
        setSuggestions([
          { value: `${number}h`, display: `${number} hours` }
        ]);
      } else {
        setSuggestions([]);
      }
    }

    // Try to parse the duration
    const duration = parseDuration(value);
    if (duration) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder={placeholder}
        className={`w-full bg-taskinatorLightGrey focus:outline-taskinatorBlue ${
          !isValid ? "border-taskinatorRed" : ""
        } ${customClasses}`}
      />
      
      {suggestions.length > 0 && isFocused && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 shadow-lg">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setInputValue(suggestion.value);
                onDurationChange(suggestion.value);
                setIsValid(true);
                setSuggestions([]);
              }}
            >
              {suggestion.display}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DurationInput;
