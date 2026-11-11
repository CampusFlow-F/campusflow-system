import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, MapPin, Bell, Mail, Phone, User, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Lecturer {
  id: string;
  full_name: string;
  email: string;
  department?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  office_location?: string;
  office_hours?: string;
  created_at: string;
  role: string;
}

const FacultyDirectory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    fetchLecturers();
  }, []);

  const fetchLecturers = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo("Starting to fetch lecturers...");
      
      console.log("Fetching lecturers from profiles table...");
      
      // First, let's check what data we can access
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);

      console.log("All profiles we can access:", allProfiles);
      setDebugInfo(`Found ${allProfiles?.length || 0} total profiles`);

      // Now fetch only lecturers
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'lecturer');

      if (profilesError) {
        console.error("Error fetching lecturers:", profilesError);
        setError(`Failed to load lecturers: ${profilesError.message}`);
        setDebugInfo(`Error: ${profilesError.message}`);
        return;
      }

      console.log("Found lecturers:", profiles);
      setDebugInfo(`Found ${profiles?.length || 0} lecturers`);

      if (!profiles || profiles.length === 0) {
        setLecturers([]);
        setDepartments(["all"]);
        setError("No lecturers found in the system. Please make sure some users have the 'lecturer' role.");
        return;
      }

      // Transform the data
      const lecturerData: Lecturer[] = profiles.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Unknown Lecturer',
        email: profile.email || 'No email provided',
        department: profile.department || "General",
        phone: profile.phone || "Not provided",
        bio: profile.bio || "No bio available",
        avatar_url: profile.avatar_url || "",
        office_location: profile.office_location || "Office location not specified",
        office_hours: profile.office_hours || "Office hours not specified",
        created_at: profile.created_at,
        role: profile.role
      }));

      setLecturers(lecturerData);

      // Extract unique departments
      const uniqueDepartments = Array.from(
        new Set(lecturerData.map(lecturer => lecturer.department).filter(Boolean))
      );
      setDepartments(["all", ...uniqueDepartments]);

    } catch (error) {
      console.error("Error in fetchLecturers:", error);
      setError('An unexpected error occurred while loading lecturers');
      setDebugInfo(`Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculty = lecturers.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (member.department && member.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
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

  const getCurrentAvailability = (officeHours: string) => {
    if (officeHours.toLowerCase().includes('not specified')) {
      return "Check Availability";
    }
    
    const availabilities = ["Available", "In Meeting", "Available", "Out of Office", "Available"];
    return availabilities[Math.floor(Math.random() * availabilities.length)];
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading faculty directory...</p>
            {debugInfo && (
              <p className="text-xs text-muted-foreground mt-2">{debugInfo}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Faculty Directory</h1>
        <p className="text-muted-foreground">
          Find and contact university lecturers and professors
        </p>
      </div>

      {/* Debug Info - Remove in production */}
      {debugInfo && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Debug Info</span>
            </div>
            <p className="text-xs text-blue-700">{debugInfo}</p>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search faculty by name, department, or email..."
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
        </CardContent>
      </Card>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={fetchLecturers}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Faculty Cards */}
      <div className="grid gap-4">
        {filteredFaculty.map((member) => {
          const availability = getCurrentAvailability(member.office_hours || "");
          
          return (
            <Card key={member.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      {member.avatar_url ? (
                        <img 
                          src={member.avatar_url} 
                          alt={member.full_name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <AvatarFallback className="text-sm">
                          {getInitials(member.full_name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{member.full_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{member.department}</p>
                    </div>
                  </div>
                  <Badge variant={getAvailabilityColor(availability)}>
                    {availability}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{member.office_location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{member.office_hours}</span>
                    </div>
                    {member.bio && member.bio !== "No bio available" && (
                      <div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {member.bio}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm break-all">{member.email}</span>
                    </div>
                    {member.phone && member.phone !== "Not provided" && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{member.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4 flex-wrap">
                  <Button size="sm" variant="outline" asChild>
                    <a href={`mailto:${member.email}`}>
                      <Mail className="mr-2 h-3 w-3" />
                      Send Email
                    </a>
                  </Button>
                  {member.phone && member.phone !== "Not provided" && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`tel:${member.phone}`}>
                        <Phone className="mr-2 h-3 w-3" />
                        Call Office
                      </a>
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <MapPin className="mr-2 h-3 w-3" />
                    Find Office
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredFaculty.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {lecturers.length === 0 ? "No Lecturers Found" : "No Matching Lecturers Found"}
            </h3>
            <p className="text-muted-foreground">
              {lecturers.length === 0 
                ? "There are currently no lecturers registered in the system." 
                : "Try adjusting your search criteria or department filter."
              }
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={fetchLecturers}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FacultyDirectory;