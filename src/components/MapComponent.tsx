import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, Volume2 } from "lucide-react";
import GoogleMap from "./GoogleMap";

const MapComponent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);

  // Empty buildings array since all have been removed
  const buildings: any[] = [];

  const filteredBuildings = buildings.filter((building) =>
    building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    building.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mobile-Optimized Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search buildings, rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-base" // Prevents zoom on iOS
          />
        </div>
      </div>

      {/* Desktop: Left = Voice Navigation, Right = Map */}
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Left Column: Voice Navigation only */}
        <div className="lg:col-span-1">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Volume2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Voice Navigation</h3>
                    <p className="text-xs text-muted-foreground">Turn-by-turn guidance</p>
                  </div>
                </div>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Start
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* If you want any extra voice controls/menus below the card on mobile, add them here */}
        </div>

        {/* Right Column: Interactive Map - Now taking 2 columns */}
        <div className="lg:col-span-2">
          <GoogleMap />
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
