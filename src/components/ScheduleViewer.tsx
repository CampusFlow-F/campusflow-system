import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Plus, User, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Schedule = Tables<"schedules">;
type Timetable = Tables<"timetable">;

const ScheduleViewer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState("monday");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [timetable, setTimetable] = useState<Timetable[]>([]);
  const [userClass, setUserClass] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"personal" | "lecturer" | "all">("all");
  const [newSchedule, setNewSchedule] = useState({
    course: "",
    time: "",
    location: "",
    instructor: "",
    type: "Lecture",
    day_of_week: "monday"
  });

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" }
  ];

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get user's profile to determine class/department
      const { data: profileData } = await supabase
        .from('profiles')
        .select('department, role')
        .eq('id', user.id)
        .single();

      if (profileData?.department) {
        setUserClass(profileData.department);
      }

      // Fetch both personal schedules and lecturer timetable
      await Promise.all([
        fetchSchedules(),
        fetchTimetable(profileData?.department)
      ]);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load schedule data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchedules = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', user.id)
        .order('time');

      if (error) {
        console.error('Error fetching schedules:', error);
        return;
      }

      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchTimetable = async (userClass?: string) => {
    try {
      let query = supabase
        .from('timetable')
        .select('*')
        .order('start_time');

      // If user has a class/department, filter by it
      if (userClass) {
        query = query.eq('class', userClass);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching timetable:', error);
        return;
      }

      setTimetable(data || []);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    }
  };

  const handleAddSchedule = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('schedules')
        .insert({
          ...newSchedule,
          user_id: user.id
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add schedule",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Schedule added successfully!",
      });

      setIsAddDialogOpen(false);
      setNewSchedule({
        course: "",
        time: "",
        location: "",
        instructor: "",
        type: "Lecture",
        day_of_week: "monday"
      });
      fetchSchedules();
    } catch (error) {
      console.error('Error adding schedule:', error);
    }
  };

  // Filter schedules and timetable by selected day
  const currentPersonalSchedules = schedules.filter(schedule => 
    schedule.day_of_week.toLowerCase() === selectedDay
  );

  const currentTimetable = timetable.filter(classItem => 
    classItem.day_of_week.toLowerCase() === selectedDay
  );

  // Combine data based on view mode
  const getDisplayData = () => {
    switch (viewMode) {
      case "personal":
        return currentPersonalSchedules.map(item => ({
          ...item,
          type: 'personal' as const,
          displayTime: item.time,
          displaySubject: item.course,
          displayLocation: item.location,
          displayInstructor: item.instructor
        }));
      case "lecturer":
        return currentTimetable.map(item => ({
          ...item,
          type: 'lecturer' as const,
          displayTime: `${item.start_time} - ${item.end_time}`,
          displaySubject: item.subject,
          displayLocation: item.room,
          displayInstructor: "Lecturer"
        }));
      case "all":
      default:
        const personal = currentPersonalSchedules.map(item => ({
          ...item,
          type: 'personal' as const,
          displayTime: item.time,
          displaySubject: item.course,
          displayLocation: item.location,
          displayInstructor: item.instructor
        }));
        const lecturer = currentTimetable.map(item => ({
          ...item,
          type: 'lecturer' as const,
          displayTime: `${item.start_time} - ${item.end_time}`,
          displaySubject: item.subject,
          displayLocation: item.room,
          displayInstructor: "Lecturer"
        }));
        return [...personal, ...lecturer].sort((a, b) => {
          // Sort by time (simplified - you might want to parse times properly)
          return a.displayTime.localeCompare(b.displayTime);
        });
    }
  };

  const displayData = getDisplayData();

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Lecture": return "default";
      case "Tutorial": return "secondary";
      case "Lab": return "destructive";
      case "Seminar": return "outline";
      default: return "default";
    }
  };

  const getScheduleTypeBadge = (type: 'personal' | 'lecturer') => {
    return type === 'personal' 
      ? { label: 'Personal', variant: 'default' as const, icon: User }
      : { label: 'Class', variant: 'secondary' as const, icon: Users };
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading schedules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Mode Selector */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={viewMode === "all" ? "default" : "outline"}
            onClick={() => setViewMode("all")}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            All Schedules
          </Button>
          <Button
            variant={viewMode === "personal" ? "default" : "outline"}
            onClick={() => setViewMode("personal")}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Personal Only
          </Button>
          <Button
            variant={viewMode === "lecturer" ? "default" : "outline"}
            onClick={() => setViewMode("lecturer")}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Class Schedule
          </Button>
        </div>

        {/* Day Selector and Add Button */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {days.map((day) => (
              <Button
                key={day.key}
                variant={selectedDay === day.key ? "default" : "outline"}
                onClick={() => setSelectedDay(day.key)}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                {day.label}
              </Button>
            ))}
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Personal Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Personal Schedule</DialogTitle>
                <DialogDescription>
                  Add a personal event or reminder to your schedule
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="course">Event Name</Label>
                  <Input
                    id="course"
                    value={newSchedule.course}
                    onChange={(e) => setNewSchedule({...newSchedule, course: e.target.value})}
                    placeholder="e.g., Study Group, Meeting, etc."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      value={newSchedule.time}
                      onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                      placeholder="e.g., 09:00 - 10:30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="day">Day</Label>
                    <Select value={newSchedule.day_of_week} onValueChange={(value) => setNewSchedule({...newSchedule, day_of_week: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((day) => (
                          <SelectItem key={day.key} value={day.key}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newSchedule.location}
                    onChange={(e) => setNewSchedule({...newSchedule, location: e.target.value})}
                    placeholder="e.g., Library, Room 205, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="instructor">With</Label>
                  <Input
                    id="instructor"
                    value={newSchedule.instructor}
                    onChange={(e) => setNewSchedule({...newSchedule, instructor: e.target.value})}
                    placeholder="e.g., Study Group, Dr. Smith, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={newSchedule.type} onValueChange={(value) => setNewSchedule({...newSchedule, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lecture">Study</SelectItem>
                      <SelectItem value="Tutorial">Meeting</SelectItem>
                      <SelectItem value="Lab">Lab Session</SelectItem>
                      <SelectItem value="Seminar">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSchedule}>
                    Add Schedule
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Schedule Cards */}
      <div className="space-y-4">
        {displayData.length > 0 ? (
          displayData.map((item) => {
            const scheduleType = getScheduleTypeBadge(item.type);
            const TypeIcon = scheduleType.icon;

            return (
              <Card key={item.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{item.displaySubject}</CardTitle>
                      <Badge variant={scheduleType.variant}>
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {scheduleType.label}
                      </Badge>
                    </div>
                    {'type' in item && item.type !== 'lecturer' && (
                      <Badge variant={getTypeColor(item.type)}>
                        {item.type}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.displayTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{item.displayLocation}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {item.displayInstructor}
                      </span>
                      <Button size="sm" variant="outline">
                        <MapPin className="mr-2 h-3 w-3" />
                        Navigate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Schedules Found</h3>
              <p className="text-muted-foreground">
                {viewMode === "all" 
                  ? `You have no schedules for ${days.find(d => d.key === selectedDay)?.label}.`
                  : `No ${viewMode} schedules found for ${days.find(d => d.key === selectedDay)?.label}.`
                }
              </p>
              {viewMode === "personal" && (
                <Button 
                  className="mt-4" 
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Personal Schedule
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline">Export Schedule</Button>
        <Button variant="outline">Add to Calendar</Button>
        <Button variant="outline">Find Study Rooms</Button>
        <Button variant="outline">Set Reminders</Button>
      </div>
    </div>
  );
};

export default ScheduleViewer;