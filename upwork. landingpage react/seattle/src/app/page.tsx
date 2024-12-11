"use client";
import dynamic from "next/dynamic";
import Filter from "./ui/Filter";
import Results from "./ui/Results";
import Navtab from "./ui/Navtab";
import { useState } from "react";

const MapComponent = dynamic(() => import("./ui/components/MapComponent"), {
  ssr: false,
});

export default function Home() {
  const [toggleMap, setToggleMap] = useState<number>(1);
  // const [toggleCalender, setToggleCalender] = useState<number>(0);
  return (
    <div>
      <Navtab />
      <div className={`main ${toggleMap == 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {toggleMap == 1 ? <div className="map ss"><MapComponent /></div> : ""}
        
        <div className="max-w-[1100px] mx-auto">
          <div className="filter-results-container">
            <div className="filter">
              <Filter />
            </div>
            <div className="results">
              <Results toggleMap={toggleMap} setToggleMap={setToggleMap} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}