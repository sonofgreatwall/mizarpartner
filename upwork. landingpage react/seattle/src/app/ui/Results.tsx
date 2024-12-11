"use client";

import { useState } from "react";
import RentalCard from "./RentalCard";
import { Button } from "@/components/ui/button";

interface ResultsProps {
  toggleMap: number;  // Use the correct type based on your usage
  setToggleMap: (value: number) => void;  // Adjust this based on how you want to change the value
}

const rentals = [
  {
    thumbnail: "/house/02f2150e-11ac-4211-8cd0-54a095d81858.jpg",
    address: "1428 Boylston Ave, Seattle, WA 98122",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Best Deal",
  },
  {
    thumbnail: "/house/3ae8cd93-0b52-4a13-b919-37d5442e5141.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },
  {
    thumbnail: "/house/6b561204-78f1-485a-b14a-9fc0c067d5aa.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },
  {
    thumbnail: "/house/18d13bc1-aab4-433a-be80-b675cd1e8046.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },
  {
    thumbnail: "/house/84fcf2fd-34a8-495b-ab5f-fcbbf79b635d.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },
  {
    thumbnail: "/house/607f2296-4565-443f-9ed8-fdc4ee2ab726.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },
  {
    thumbnail: "/house/4958602a-29f9-4b43-8f88-59e82b2eec13.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },
  {
    thumbnail: "/house/5281344f-a2eb-43a0-9a35-a6a9fc7dd9c0.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },
  {
    thumbnail: "/house/b45e04d7-b715-4c38-951e-facba0433bc5.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },
  {
    thumbnail: "/house/b9132be2-e1e8-4690-94f4-a022a38c3312.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },
  {
    thumbnail: "/house/bc99487c-abb9-4f06-8bf0-2ca127097c98.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },
  {
    thumbnail: "/house/e634ef34-16eb-4609-8cb3-d053427f14a0.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },

  {
    thumbnail: "/house/02f2150e-11ac-4211-8cd0-54a095d81858.jpg",
    address: "1428 Boylston Ave, Seattle, WA 98122",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Best Deal",
  },
  {
    thumbnail: "/house/3ae8cd93-0b52-4a13-b919-37d5442e5141.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },
  {
    thumbnail: "/house/6b561204-78f1-485a-b14a-9fc0c067d5aa.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },
  {
    thumbnail: "/house/18d13bc1-aab4-433a-be80-b675cd1e8046.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },
  {
    thumbnail: "/house/84fcf2fd-34a8-495b-ab5f-fcbbf79b635d.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },
  {
    thumbnail: "/house/607f2296-4565-443f-9ed8-fdc4ee2ab726.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },
  {
    thumbnail: "/house/4958602a-29f9-4b43-8f88-59e82b2eec13.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },
  {
    thumbnail: "/house/5281344f-a2eb-43a0-9a35-a6a9fc7dd9c0.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },
  {
    thumbnail: "/house/b45e04d7-b715-4c38-951e-facba0433bc5.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },
  {
    thumbnail: "/house/b9132be2-e1e8-4690-94f4-a022a38c3312.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },
  {
    thumbnail: "/house/bc99487c-abb9-4f06-8bf0-2ca127097c98.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },
  {
    thumbnail: "/house/e634ef34-16eb-4609-8cb3-d053427f14a0.jpg",
    address: "315 Maynard Ave S, Seattle, WA 98104",
    rent: 995,
    description: "Deposit $746, $50 App. Fee",
    ratings: { google: "Google Rating: 5", trusty: "Trusty Rating: 4.6" },
    status: "$500 above avg",
    deal: "Limited Offer",
  },

];

const Results: React.FC<ResultsProps> = ({ toggleMap, setToggleMap }) => {
  const [cardNum, setCardNum] = useState<number>(2)
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          {/* <Button onClick={() => { toggleMap == 1 ? setToggleMap(0) : setToggleMap(1) }}>Local Map</Button> */}
          <Button onClick={() => {
            if (toggleMap === 1) {
              setToggleMap(0);
            } else {
              setToggleMap(1);
            }
          }}>Local Map</Button>
          <Button variant="outline">Calender</Button>
          <Button variant="outline">Add Listing</Button>
          <Button variant="outline">Create Alert For Rent Listing</Button>
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-2">67 Results</h1>
      <div className="grid gap-6">
        {rentals.slice(0, cardNum).map((rental, index) => (
          <RentalCard key={index} {...rental} />
        ))}
        <Button variant="outline" onClick={() => setCardNum(cardNum + 3)}>Read More</Button>
      </div>
    </div>
  );
};

export default Results;
