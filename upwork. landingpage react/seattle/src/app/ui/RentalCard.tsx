import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

interface RentalCardProps {
  thumbnail: string;
  address: string;
  rent: number;
  description: string;
  ratings: {
    google: string;
    trusty: string;
  };
  status: string;
  deal: string;
}

const RentalCard: React.FC<RentalCardProps> = ({
  thumbnail,
  address,
  rent,
  description,
  ratings,
  status,
  deal,
}) => {
  return (
    <Card className="flex gap-4 p-4">
      {/* Image */}
      <div className="w-1/4">
        <Image  src={thumbnail} width={300} height={300} alt={address} className="rounded-md w-full" />
      </div>

      {/* Info */}
      <div className="flex flex-col w-3/4">
        <CardHeader>
          <CardTitle className="text-lg font-bold">{address}</CardTitle>
          <span className="text-emerald-500 text-xl">${rent}</span>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">{description}</p>
          <div className="flex justify-center items-center gap-2 mt-2">
            <Badge variant="outline">{ratings.google}</Badge>
            <Badge variant="outline">{ratings.trusty}</Badge>
          </div>
          <div className="mt-2 text-red-500 text-sm">{status}</div>
          <div className="text-gray-500 text-sm">Deal: {deal}</div>
        </CardContent>
        <div className="flex gap-4 mt-4 justify-center">
          <Button variant="outline">Book a Tour</Button>
          <Button>More Info</Button>
        </div>
      </div>
    </Card>
  );
};

export default RentalCard;
