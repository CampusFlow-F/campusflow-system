
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, MapPin, Bell } from "lucide-react";

const FacultyDirectory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const faculty = [
    {
      id: 1,
      name: "Dr. Sarah Smith",
      department: "Computer Science",
      office: "NAS Building, Room 301",
      availability: "Available",
      officeHours: "Mon-Wed 2:00-4:00 PM",
      email: "s.smith@university.edu",
      phone: "+1 (555) 123-4567"
    },
    {
      id: 2,
      name: "Prof. Michael Johnson",
      department: "ICT",
      office: "NAS Building, Room 205",
      availability: "In Meeting",
      officeHours: "Tue-Thu 10:00-12:00 PM",
      email: "m.johnson@university.edu",
      phone: "+1 (555) 234-5678"
    },
    {
      id: 3,
      name: "Dr. Emily Brown",
      department: "Physics",
      office: "NAS Building, Room 450",
      availability: "Available",
      officeHours: "Mon-Fri 1:00-3:00 PM",
      email: "e.brown@university.edu",
      phone: "+1 (555) 345-6789"
    },
    {
      id: 4,
      name: "Prof. David Wilson",
      department: "Engineering",
      office: "NAS Building, Room 102",
      availability: "Out of Office",
      officeHours: "Wed-Fri 9:00-11:00 AM",
      email: "d.wilson@university.edu",
      phone: "+1 (555) 456-7890"
    }
  ];

  const departments = ["all", "Computer Science", "Mathematics", "Physics", "Engineering"];

  const filteredFaculty = faculty.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || member.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Available": return "default";
      case "In Meeting": return "secondary";
      case "Out of Office": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search faculty by name or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {departments.map((dept) => (
            <Button
              key={dept}
              variant={selectedDepartment === dept ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDepartment(dept)}
            >
              {dept === "all" ? "All Departments" : dept}
            </Button>
          ))}
        </div>
      </div>

      {/* Faculty Cards */}
      <div className="grid gap-4">
        {filteredFaculty.map((member) => (
          <Card key={member.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{member.department}</p>
                  </div>
                </div>
                <Badge variant={getAvailabilityColor(member.availability)}>
                  {member.availability}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.office}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.officeHours}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">📧 {member.email}</p>
                  <p className="text-sm">📞 {member.phone}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline">
                  <MapPin className="mr-2 h-3 w-3" />
                  Find Office
                </Button>
                <Button size="sm" variant="outline">
                  <Clock className="mr-2 h-3 w-3" />
                  Schedule Meeting
                </Button>
                <Button size="sm" variant="outline">
                  <Bell className="mr-2 h-3 w-3" />
                  Notify When Available
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFaculty.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Faculty Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or department filter.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FacultyDirectory;
