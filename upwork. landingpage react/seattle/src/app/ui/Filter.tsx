"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const RealEstateFilter = () => {
  const [priceRange, setPriceRange] = useState([900, 2500]);

  return (
    <Card className="w-full p-4 space-y-6">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          variant="default" 
          className="w-full relative"
        >
          For Rent <span className="ml-2 badge badge-danger">335</span>
        </Button>
        <Button 
          variant="outline" 
          className="w-full"
        >
          For Sale
        </Button>
        <Button 
          variant="outline" 
          className="w-full relative"
        >
          Landlord Reviews <span className="ml-2 badge badge-danger">1</span>
        </Button>
      </div>

      <div>
        <label className="text-sm font-medium">Price:</label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={500}
          max={5000}
          step={100}
          className="mt-2"
        />
        <div className="text-sm text-gray-600 mt-1">
          ${priceRange[0]} - ${priceRange[1].toLocaleString()}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Property Type:</label>
          <ToggleGroup
            type="multiple"
            defaultValue={["all"]}
            className="flex flex-wrap gap-2 mt-2"
          >
            {["All", "House", "Apartment", "Condo"].map((type) => (
              <ToggleGroupItem key={type} value={type.toLowerCase()}>
                {type}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div>
          <label className="text-sm font-medium">Bedrooms:</label>
          <ToggleGroup
            type="multiple"
            defaultValue={["all"]}
            className="flex flex-wrap gap-2 mt-2"
          >
            {["All", 1, 2, 3, 4, "Studio"].map((bed) => (
              <ToggleGroupItem key={bed} value={String(bed).toLowerCase()}>
                {bed}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">City:</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Seattle" />
            </SelectTrigger>
            <SelectContent>
              {["Seattle", "Bellevue", "Tacoma"].map((city) => (
                <SelectItem key={city} value={city.toLowerCase()}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Neighborhood:</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Everywhere" />
            </SelectTrigger>
            <SelectContent>
              {["Everywhere", "Downtown", "Capitol Hill"].map((neighborhood) => (
                <SelectItem key={neighborhood} value={neighborhood.toLowerCase()}>
                  {neighborhood}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input type="date" placeholder="Move-in Date" />
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Term" />
          </SelectTrigger>
          <SelectContent>
            {["Short-Term", "Long-Term"].map((term) => (
              <SelectItem key={term} value={term.toLowerCase()}>{term}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input placeholder="Max Deposit" />
        <Input placeholder="Min. ft²" />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {["Cats", "Dogs", "Balcony", "Parking", "MFTE"].map((feature) => (
          <div key={feature} className="flex items-center space-x-2">
            <Checkbox id={feature.toLowerCase()} />
            <label 
              htmlFor={feature.toLowerCase()} 
              className="text-sm"
            >
              {feature}
            </label>
          </div>
        ))}
      </div>

      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          {["Lowest Price", "Highest Price", "Newest"].map((sort) => (
            <SelectItem key={sort} value={sort.toLowerCase()}>{sort}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Card>
  );
};

export default RealEstateFilter;